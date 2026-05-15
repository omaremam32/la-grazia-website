import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function valueToString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }
    return undefined;
  }, obj);
}

function calculatePaymobTransactionHmac(obj, secret) {
  const keys = [
    "amount_cents",
    "created_at",
    "currency",
    "error_occured",
    "has_parent_transaction",
    "id",
    "integration_id",
    "is_3d_secure",
    "is_auth",
    "is_capture",
    "is_refunded",
    "is_standalone_payment",
    "is_voided",
    "order.id",
    "owner",
    "pending",
    "source_data.pan",
    "source_data.sub_type",
    "source_data.type",
    "success",
  ];

  const message = keys.map((key) => valueToString(getNestedValue(obj, key))).join("");

  return crypto.createHmac("sha512", secret).update(message).digest("hex");
}

function getReceivedHmac(req) {
  return (
    req.query?.hmac ||
    req.body?.hmac ||
    req.body?.obj?.hmac ||
    ""
  );
}

function safeCompare(a, b) {
  if (!a || !b) return false;

  const first = Buffer.from(String(a), "hex");
  const second = Buffer.from(String(b), "hex");

  if (first.length !== second.length) return false;

  return crypto.timingSafeEqual(first, second);
}

function findOrderReference(payload) {
  const obj = payload?.obj || payload || {};

  return (
    obj?.order?.merchant_order_id ||
    obj?.order?.merchant_order_reference ||
    obj?.order?.special_reference ||
    obj?.merchant_order_id ||
    obj?.merchant_order_reference ||
    obj?.special_reference ||
    obj?.extras?.merchant_order_id ||
    obj?.extras?.order_reference ||
    payload?.merchant_order_id ||
    payload?.order_reference ||
    null
  );
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Paymob webhook route is working",
      message: "Use POST for Paymob callbacks.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hmacSecret || !supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({
        error: "Missing webhook environment variables.",
        found: {
          PAYMOB_HMAC_SECRET: Boolean(hmacSecret),
          SUPABASE_URL_OR_VITE_SUPABASE_URL: Boolean(supabaseUrl),
          SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceRoleKey),
        },
      });
    }

    const payload = req.body || {};
    const obj = payload.obj || payload;
    const receivedHmac = getReceivedHmac(req);

    if (receivedHmac) {
      const calculatedHmac = calculatePaymobTransactionHmac(obj, hmacSecret);

      if (!safeCompare(calculatedHmac, receivedHmac)) {
        return res.status(401).json({ error: "Invalid Paymob HMAC." });
      }
    }

    const orderReference = findOrderReference(payload);
    const success = obj?.success === true || obj?.success === "true";
    const pending = obj?.pending === true || obj?.pending === "true";
    const transactionId = obj?.id ? String(obj.id) : null;
    const paymobOrderId = obj?.order?.id ? String(obj.order.id) : null;

    const paymentStatus = success && !pending ? "paid" : "failed";
    const orderStatus = success && !pending ? "Paid" : "Payment Failed";

    if (!orderReference) {
      return res.status(200).json({
        received: true,
        updated: false,
        reason: "No order reference found in Paymob callback.",
        transactionId,
        paymobOrderId,
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        order_status: orderStatus,
        paymob_order_id: paymobOrderId || transactionId,
        updated_at: new Date().toISOString(),
      })
      .eq("order_reference", orderReference);

    if (error) {
      return res.status(500).json({
        error: "Supabase order update failed.",
        details: error.message,
      });
    }

    return res.status(200).json({
      received: true,
      updated: true,
      orderReference,
      paymentStatus,
      orderStatus,
      transactionId,
      paymobOrderId,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Webhook server error.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}