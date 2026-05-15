import { Resend } from "resend";

function money(amount) {
  return `EGP ${Number(amount || 0).toLocaleString("en-EG")}`;
}

function buildItemsHtml(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p style="color:#6a5545;">No items found.</p>`;
  }

  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #eadcc8;">
            <strong>${item.product_name || item.name || "La Grazia Item"}</strong><br/>
            <span style="color:#6a5545;font-size:13px;">
              Size: ${item.size || "-"} · Color: ${item.color || "-"} · Qty: ${item.quantity || 1}
            </span>
          </td>
          <td style="padding:12px;border-bottom:1px solid #eadcc8;text-align:right;">
            ${money(item.total_price || item.price || 0)}
          </td>
        </tr>
      `
    )
    .join("");
}

function buildEmailHtml({ title, subtitle, order }) {
  const itemsHtml = buildItemsHtml(order.items || order.order_items || []);

  return `
    <div style="margin:0;padding:0;background:#f7f1e8;font-family:Arial,sans-serif;color:#241a14;">
      <div style="max-width:720px;margin:0 auto;padding:32px 18px;">
        <div style="background:#2c1f18;color:#fff9f0;border-radius:28px 28px 0 0;padding:34px;text-align:center;">
          <div style="font-family:Georgia,serif;font-size:34px;letter-spacing:0.18em;">LA GRAZIA</div>
          <div style="margin-top:8px;color:#d7b46f;letter-spacing:0.24em;font-size:11px;text-transform:uppercase;">
            Women-Only Fashion
          </div>
        </div>

        <div style="background:#fff9f0;border:1px solid #eadcc8;border-top:0;border-radius:0 0 28px 28px;padding:32px;">
          <p style="color:#b08a45;text-transform:uppercase;letter-spacing:0.18em;font-size:12px;margin:0 0 10px;">
            ${subtitle}
          </p>

          <h1 style="font-family:Georgia,serif;font-weight:500;font-size:34px;margin:0 0 20px;">
            ${title}
          </h1>

          <div style="background:#f7f1e8;border:1px solid #eadcc8;border-radius:20px;padding:18px;margin-bottom:22px;">
            <p style="margin:0 0 8px;"><strong>Order:</strong> ${order.order_reference || order.orderReference || "-"}</p>
            <p style="margin:0 0 8px;"><strong>Customer:</strong> ${order.customer_name || order.customerName || "-"}</p>
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${order.customer_email || order.customerEmail || "-"}</p>
            <p style="margin:0 0 8px;"><strong>Phone:</strong> ${order.customer_phone || order.customerPhone || "-"}</p>
            <p style="margin:0 0 8px;"><strong>Payment:</strong> ${order.payment_status || "pending"}</p>
            <p style="margin:0;"><strong>Status:</strong> ${order.order_status || "Pending Payment"}</p>
          </div>

          <h2 style="font-family:Georgia,serif;font-weight:500;font-size:24px;margin:0 0 12px;">Order Items</h2>

          <table style="width:100%;border-collapse:collapse;margin-bottom:22px;">
            ${itemsHtml}
          </table>

          <div style="background:#2c1f18;color:#fff9f0;border-radius:20px;padding:18px;text-align:right;">
            <span style="color:#d7b46f;text-transform:uppercase;letter-spacing:0.14em;font-size:11px;">Total</span><br/>
            <strong style="font-size:26px;font-family:Georgia,serif;">${money(order.total_amount || order.totalAmount || 0)}</strong>
          </div>

          ${
            order.delivery_address
              ? `
                <div style="margin-top:22px;background:#f7f1e8;border:1px solid #eadcc8;border-radius:20px;padding:18px;">
                  <h3 style="font-family:Georgia,serif;font-weight:500;margin:0 0 10px;">Delivery Address</h3>
                  <p style="margin:0;color:#6a5545;line-height:1.7;">${order.delivery_address}</p>
                </div>
              `
              : ""
          }

          <p style="margin:26px 0 0;color:#6a5545;line-height:1.7;">
            For support, contact La Grazia through WhatsApp.
          </p>
        </div>
      </div>
    </div>
  `;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Order email route is working",
      message: "Use POST to send order confirmation emails.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "La Grazia <onboarding@resend.dev>";
    const adminEmail = process.env.ADMIN_ORDER_EMAIL || "omaromohamed2003@gmail.com";

    if (!apiKey) {
      return res.status(500).json({
        error: "Missing RESEND_API_KEY on Vercel.",
      });
    }

    const resend = new Resend(apiKey);
    const { order } = req.body || {};

    if (!order) {
      return res.status(400).json({ error: "Missing order data." });
    }

    const customerEmail = order.customer_email || order.customerEmail;

    const emails = [];

    if (customerEmail) {
      emails.push(
        resend.emails.send({
          from: fromEmail,
          to: customerEmail,
          subject: `La Grazia Order Confirmation - ${order.order_reference || order.orderReference || ""}`,
          html: buildEmailHtml({
            title: "Your order has been received.",
            subtitle: "Order Confirmation",
            order,
          }),
        })
      );
    }

    emails.push(
      resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: `New La Grazia Order - ${order.order_reference || order.orderReference || ""}`,
        html: buildEmailHtml({
          title: "New customer order received.",
          subtitle: "Admin Notification",
          order,
        }),
      })
    );

    const results = await Promise.all(emails);

    return res.status(200).json({
      success: true,
      sent: results.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Email server error.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}