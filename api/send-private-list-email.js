const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.LA_GRAZIA_FROM_EMAIL || "La Grazia <onboarding@resend.dev>";
const ADMIN_EMAIL =
  process.env.LA_GRAZIA_ADMIN_EMAIL || "omaromohamed2003@gmail.com";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildCustomerEmail({ customerName, preferredStyle, language }) {
  const name = escapeHtml(customerName || "La Grazia Client");
  const style = escapeHtml(preferredStyle || "Italian elegance");
  const isArabic = language === "AR";

  const preheader = isArabic
    ? "أهلاً بكِ في القائمة الخاصة من لا غراتسيا."
    : "Welcome to the La Grazia private list.";

  const headline = isArabic
    ? "أهلاً بكِ في القائمة الخاصة"
    : "Welcome to the Private List";

  const intro = isArabic
    ? `مرحباً ${name}، تم تسجيلك في قائمة لا غراتسيا الخاصة. ستكونين من أوائل من يحصلون على أخبار الإصدارات الجديدة، التنسيقات المختارة، والقطع الموسمية المحدودة.`
    : `Dear ${name}, you are now part of the La Grazia private list. You will be among the first to receive early access to new city drops, styling edits, and limited seasonal pieces.`;

  const styleLine = isArabic
    ? `ستايلك المفضل: ${style}`
    : `Your selected mood: ${style}`;

  const cta = isArabic ? "زيارة لا غراتسيا" : "Visit La Grazia";

  const footer = isArabic
    ? "صُنعت لكِ بعناية — لا غراتسيا"
    : "Made for you, with care — La Grazia";

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>La Grazia Private List</title>
  </head>
  <body style="margin:0;background:#f7f1e8;font-family:Arial,Helvetica,sans-serif;color:#2c1f18;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f1e8;padding:34px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffaf2;border:1px solid #e4cfaa;border-radius:28px;overflow:hidden;box-shadow:0 24px 80px rgba(44,31,24,.12);">
            <tr>
              <td style="background:linear-gradient(135deg,#2c1f18,#4a3326);padding:42px 32px;text-align:center;">
                <div style="font-family:Georgia,'Times New Roman',serif;color:#fffaf2;font-size:36px;letter-spacing:10px;line-height:1;">LA GRAZIA</div>
                <div style="color:#d8bd87;font-size:11px;letter-spacing:5px;text-transform:uppercase;margin-top:12px;">Women-Only Fashion</div>
              </td>
            </tr>

            <tr>
              <td style="padding:42px 34px;text-align:center;">
                <div style="color:#b08a45;font-size:12px;letter-spacing:5px;text-transform:uppercase;margin-bottom:18px;">Private Access</div>

                <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.12;font-weight:400;margin:0 0 18px;color:#1f1712;">
                  ${headline}
                </h1>

                <p style="font-size:16px;line-height:1.8;color:#6b5648;margin:0 auto 24px;max-width:500px;">
                  ${intro}
                </p>

                <div style="background:#f6ead8;border:1px solid #e4cfaa;border-radius:18px;padding:18px 20px;margin:26px auto;max-width:430px;color:#2c1f18;font-size:14px;letter-spacing:.4px;">
                  ${styleLine}
                </div>

                <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:30px auto 8px;">
                  <tr>
                    <td style="background:#2c1f18;border-radius:999px;">
                      <a href="https://lagrazia-eg.online/" style="display:inline-block;padding:16px 30px;color:#fffaf2;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;">
                        ${cta}
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="font-size:13px;line-height:1.7;color:#8b6b38;margin-top:30px;">
                  ${footer}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px;text-align:center;background:#f6ead8;color:#8b6b38;font-size:11px;letter-spacing:2px;text-transform:uppercase;">
                Roma Drop · New Season Arrivals · Limited Seasonal Pieces
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildAdminEmail({ email, customerName, preferredStyle, language }) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#2c1f18;line-height:1.7;">
      <h2>New La Grazia Private List Signup</h2>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Name:</strong> ${escapeHtml(customerName || "Not provided")}</p>
      <p><strong>Preferred style:</strong> ${escapeHtml(
        preferredStyle || "Not selected"
      )}</p>
      <p><strong>Language:</strong> ${escapeHtml(language || "EN")}</p>
      <p>This customer has joined the La Grazia private list from the website.</p>
    </div>`;
}

async function sendEmail({ to, subject, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Resend email failed");
  }

  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!RESEND_API_KEY) {
    return res
      .status(500)
      .json({ error: "Missing RESEND_API_KEY environment variable" });
  }

  try {
    const { email, customerName, preferredStyle, language } = req.body || {};

    if (!email || !String(email).includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    await sendEmail({
      to: String(email).trim().toLowerCase(),
      subject: "Welcome to the La Grazia Private List",
      html: buildCustomerEmail({ customerName, preferredStyle, language }),
    });

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: "New La Grazia Private List Signup",
      html: buildAdminEmail({ email, customerName, preferredStyle, language }),
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Private list email failed:", error);
    return res.status(500).json({
      error: error.message || "Email failed",
    });
  }
}