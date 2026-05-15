export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      status: "Paymob API route is working",
      message: "Use POST to create a payment.",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secretKey = process.env.PAYMOB_SECRET_KEY;
    const publicKey = process.env.PAYMOB_PUBLIC_KEY;
    const integrationId = process.env.PAYMOB_INTEGRATION_ID;

    const siteUrl =
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.SITE_URL || "https://la-grazia-website.vercel.app";

    if (!secretKey || !publicKey || !integrationId) {
      return res.status(500).json({
        error: "Missing Paymob environment variables on Vercel.",
        found: {
          PAYMOB_SECRET_KEY: Boolean(secretKey),
          PAYMOB_PUBLIC_KEY: Boolean(publicKey),
          PAYMOB_INTEGRATION_ID: Boolean(integrationId),
        },
      });
    }

    const { items, customer, orderReference: sentOrderReference } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Your bag is empty." });
    }

    const cleanItems = items.map((item) => {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const price = Math.max(1, Number(item.price || 0));

      return {
        name: String(item.name || "La Grazia Item").slice(0, 50),
        amount: Math.round(price * 100),
        description: String(item.description || item.name || "La Grazia Item").slice(0, 100),
        quantity,
      };
    });

    const amount = cleanItems.reduce((total, item) => {
      return total + item.amount * item.quantity;
    }, 0);

    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Invalid payment amount." });
    }

    const orderReference = sentOrderReference || `LG-${Date.now()}`;

    const payload = {
      amount,
      currency: "EGP",
      payment_methods: [Number(integrationId)],
      special_reference: orderReference,
      notification_url: `${siteUrl}/api/paymob-webhook`,
      redirection_url: `${siteUrl}/#account`,
      items: cleanItems,
      billing_data: {
        first_name: customer?.firstName || "La",
        last_name: customer?.lastName || "Grazia",
        phone_number: customer?.phone || "+201101900086",
        email: customer?.email || "omaromohamed2003@gmail.com",
        country: "EG",
        city: customer?.city || "Cairo",
        street: customer?.street || "Cairo",
        building: customer?.building || "1",
        floor: customer?.floor || "1",
        apartment: customer?.apartment || "1",
      },
      extras: {
        merchant_order_id: orderReference,
        order_reference: orderReference,
      },
    };

    const paymobResponse = await fetch("https://accept.paymob.com/v1/intention/", {
      method: "POST",
      headers: {
        Authorization: `Token ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await paymobResponse.json();

    if (!paymobResponse.ok) {
      return res.status(paymobResponse.status).json({
        error: "Paymob rejected the payment request.",
        details: data,
      });
    }

    const clientSecret = data.client_secret;

    if (!clientSecret) {
      return res.status(500).json({
        error: "Paymob did not return a client secret.",
        details: data,
      });
    }

    const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${encodeURIComponent(
      publicKey
    )}&clientSecret=${encodeURIComponent(clientSecret)}`;

    return res.status(200).json({
      checkoutUrl,
      orderReference,
      paymobIntentionId: data.id || data.intention_id || null,
      paymobClientSecret: clientSecret,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Payment server error.",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}