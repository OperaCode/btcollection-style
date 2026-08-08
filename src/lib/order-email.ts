import { createServerFn } from "@tanstack/react-start";
import { brandedEmailHtml } from "@/lib/email-template";

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type OrderEmailItem = { name: string; price: number; qty: number };

type OrderEmailInput = {
  orderId: string;
  email: string;
  customerName?: string;
  items: OrderEmailItem[];
  subtotal: number;
  shipping: number;
  total: number;
  deliveryMethod?: string | null;
};

type OrderEmailResult = { sent: boolean; error?: string };

async function sendEmail(input: { to: string; subject: string; html: string; text: string }): Promise<OrderEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Breakthrough Collection LLC <onboarding@resend.dev>";

  if (!apiKey) return { sent: false, error: "Resend is not configured. Add RESEND_API_KEY." };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html, text: input.text }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false, error: body || `Resend returned ${response.status}.` };
  }
  return { sent: true };
}

function itemsHtml(items: OrderEmailItem[]) {
  return items
    .map(
      (it) => `
        <tr>
          <td style="padding:8px 0; font-size:14px; color:#3a3630;">${escapeHtml(it.qty.toString())}&times; ${escapeHtml(it.name)}</td>
          <td style="padding:8px 0; font-size:14px; color:#3a3630; text-align:right;">${formatUSD(it.price * it.qty)}</td>
        </tr>`,
    )
    .join("");
}

function itemsText(items: OrderEmailItem[]) {
  return items.map((it) => `${it.qty}x ${it.name} — ${formatUSD(it.price * it.qty)}`).join("\n");
}

export const sendOrderConfirmation = createServerFn({ method: "POST" })
  .validator((data: OrderEmailInput) => ({ ...data, email: data.email.trim().toLowerCase() }))
  .handler(async ({ data }): Promise<OrderEmailResult> => {
    const greeting = data.customerName ? `Hi ${data.customerName},` : "Hi there,";
    const reference = data.orderId.slice(0, 8);

    const html = brandedEmailHtml({
      eyebrow: "Order Confirmed",
      heading: "Thank you for your order!",
      bodyHtml: `
        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#3a3630;">${greeting}</p>
        <p style="margin:0 0 20px; font-size:15px; line-height:1.7; color:#3a3630;">
          Your payment was received and your order is confirmed. Here's a summary:
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ece4d3; border-bottom:1px solid #ece4d3; margin-bottom:16px;">
          ${itemsHtml(data.items)}
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
          <tr>
            <td style="padding:2px 0; font-size:13px; color:#6f675f;">Subtotal</td>
            <td style="padding:2px 0; font-size:13px; color:#3a3630; text-align:right;">${formatUSD(data.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:2px 0; font-size:13px; color:#6f675f;">Shipping${data.deliveryMethod ? ` (${escapeHtml(data.deliveryMethod)})` : ""}</td>
            <td style="padding:2px 0; font-size:13px; color:#3a3630; text-align:right;">${formatUSD(data.shipping)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0 0; font-size:15px; font-weight:bold; color:#1f1d2b;">Total</td>
            <td style="padding:8px 0 0; font-size:15px; font-weight:bold; color:#1f1d2b; text-align:right;">${formatUSD(data.total)}</td>
          </tr>
        </table>
        <p style="margin:0; font-size:12px; color:#8c8579;">Order reference: ${escapeHtml(reference)}</p>
      `,
    });

    const text = [
      greeting,
      "",
      "Your payment was received and your order is confirmed.",
      "",
      itemsText(data.items),
      "",
      `Subtotal: ${formatUSD(data.subtotal)}`,
      `Shipping: ${formatUSD(data.shipping)}`,
      `Total: ${formatUSD(data.total)}`,
      "",
      `Order reference: ${reference}`,
    ].join("\n");

    return sendEmail({ to: data.email, subject: `Order confirmed — ${reference}`, html, text });
  });

export const sendOrderNotification = createServerFn({ method: "POST" })
  .validator((data: OrderEmailInput) => data)
  .handler(async ({ data }): Promise<OrderEmailResult> => {
    const to = process.env.RESEND_NOTIFY_EMAIL ?? process.env.CONTACT_EMAIL ?? process.env.VITE_CONTACT_EMAIL;
    if (!to) return { sent: false, error: "No notify address configured." };

    const reference = data.orderId.slice(0, 8);
    const html = `
      <div style="font-family: Arial, sans-serif; color: #241f1a; line-height: 1.6; max-width: 640px;">
        <h1 style="font-family: Georgia, serif; font-size: 24px; margin-bottom: 12px;">New paid order — ${escapeHtml(reference)}</h1>
        <p><strong>Customer:</strong> ${escapeHtml(data.email)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
          ${itemsHtml(data.items)}
        </table>
        <p><strong>Subtotal:</strong> ${formatUSD(data.subtotal)}</p>
        <p><strong>Shipping:</strong> ${formatUSD(data.shipping)}${data.deliveryMethod ? ` (${escapeHtml(data.deliveryMethod)})` : ""}</p>
        <p><strong>Total:</strong> ${formatUSD(data.total)}</p>
        <p style="margin-top:24px; font-size:12px; color:#6f675f;">Order ID: ${escapeHtml(data.orderId)}</p>
      </div>
    `;
    const text = [
      `New paid order — ${reference}`,
      `Customer: ${data.email}`,
      "",
      itemsText(data.items),
      "",
      `Total: ${formatUSD(data.total)}`,
      `Order ID: ${data.orderId}`,
    ].join("\n");

    return sendEmail({ to, subject: `New paid order from ${data.email}`, html, text });
  });
