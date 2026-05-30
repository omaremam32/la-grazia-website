import { createClient } from "@supabase/supabase-js";

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

type PrivateOfferAction = "status" | "claim" | "redeem" | "release";

type PrivateOfferBody = {
  action?: PrivateOfferAction;
  email?: string;
  code?: string;
  orderReference?: string;
};

const PRIVATE_OFFER_CODE = "GRAZIA10";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function parseBody(body: unknown): PrivateOfferBody {
  if (!body) return {};

  if (typeof body === "string") {
    try {
      return JSON.parse(body) as PrivateOfferBody;
    } catch {
      return {};
    }
  }

  if (typeof body === "object") {
    return body as PrivateOfferBody;
  }

  return {};
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const body = parseBody(req.body);
  const action = body.action;
  const email = normalizeEmail(body.email || "");
  const code = (body.code || PRIVATE_OFFER_CODE).trim().toUpperCase();
  const orderReference = (body.orderReference || "").trim();

  if (!action || !["status", "claim", "redeem", "release"].includes(action)) {
    return res.status(400).json({ ok: false, status: "error", error: "Invalid action" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, status: "error", error: "Invalid email address" });
  }

  if (code !== PRIVATE_OFFER_CODE) {
    return res.status(400).json({ ok: false, status: "error", error: "Invalid private offer code" });
  }

  try {
    const supabase = getSupabaseAdminClient();

    const { data: existingClaim, error: selectError } = await supabase
      .from("private_offer_claims")
      .select("id,email,code,status,claimed_at,used_at,used_order_reference")
      .eq("email", email)
      .eq("code", PRIVATE_OFFER_CODE)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    if (action === "status") {
      if (!existingClaim) {
        return res.status(200).json({ ok: true, status: "unclaimed", canUse: false });
      }

      if (existingClaim.used_at || existingClaim.status === "used") {
        return res.status(200).json({ ok: true, status: "used", canUse: false });
      }

      return res.status(200).json({ ok: true, status: "claimed", canUse: true });
    }

    if (action === "claim") {
      if (existingClaim?.used_at || existingClaim?.status === "used") {
        return res.status(200).json({ ok: true, status: "used", canUse: false });
      }

      if (existingClaim) {
        return res.status(200).json({ ok: true, status: "claimed", canUse: true });
      }

      const { error: insertError } = await supabase.from("private_offer_claims").insert({
        email,
        code: PRIVATE_OFFER_CODE,
        status: "claimed",
        claimed_at: new Date().toISOString(),
      });

      if (insertError) {
        if (insertError.code === "23505") {
          return res.status(200).json({ ok: true, status: "claimed", canUse: true });
        }

        throw insertError;
      }

      return res.status(200).json({ ok: true, status: "claimed", canUse: true });
    }

    if (action === "redeem") {
      if (!orderReference) {
        return res.status(400).json({ ok: false, status: "error", error: "Missing order reference" });
      }

      if (!existingClaim) {
        return res.status(200).json({ ok: true, status: "unclaimed", canUse: false });
      }

      if (existingClaim.used_at || existingClaim.status === "used") {
        return res.status(200).json({ ok: true, status: "used", canUse: false });
      }

      const { data: redeemedClaim, error: redeemError } = await supabase
        .from("private_offer_claims")
        .update({
          status: "used",
          used_at: new Date().toISOString(),
          used_order_reference: orderReference,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingClaim.id)
        .is("used_at", null)
        .select("id")
        .maybeSingle();

      if (redeemError) {
        throw redeemError;
      }

      if (!redeemedClaim) {
        return res.status(200).json({ ok: true, status: "used", canUse: false });
      }

      return res.status(200).json({ ok: true, status: "redeemed", canUse: true });
    }

    if (action === "release") {
      if (!orderReference) {
        return res.status(400).json({ ok: false, status: "error", error: "Missing order reference" });
      }

      if (!existingClaim) {
        return res.status(200).json({ ok: true, status: "unclaimed", canUse: false });
      }

      if (existingClaim.used_order_reference !== orderReference) {
        return res.status(200).json({
          ok: true,
          status: existingClaim.used_at ? "used" : "claimed",
          canUse: !existingClaim.used_at,
        });
      }

      const { error: releaseError } = await supabase
        .from("private_offer_claims")
        .update({
          status: "claimed",
          used_at: null,
          used_order_reference: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingClaim.id)
        .eq("used_order_reference", orderReference);

      if (releaseError) {
        throw releaseError;
      }

      return res.status(200).json({ ok: true, status: "claimed", canUse: true });
    }

    return res.status(400).json({ ok: false, status: "error", error: "Invalid request" });
  } catch (error) {
    console.error("Private offer API error:", error);

    return res.status(500).json({
  ok: false,
  status: "error",
  error: error instanceof Error ? error.message : "Private offer API error",
  debug: {
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    supabaseUrlStartsCorrectly: String(process.env.SUPABASE_URL || "").startsWith("https://"),
  },
});