// Shared HTML wrapper for customer-facing transactional emails (newsletter
// welcome, custom-request confirmation/quote/status updates). Table-based
// layout for Outlook/Gmail compatibility; colors are hex approximations of
// the site's oklch brand tokens since email clients don't support oklch().
const YEAR = new Date().getFullYear();
// Absolute URL required — email clients (Outlook desktop especially) won't
// load a relative path or bundled/hashed Vite asset.
const LOGO_URL = "https://breakthroughcollection.com/logo.jpg";

export function brandedEmailHtml(options: {
  eyebrow: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
}) {
  const { eyebrow, heading, bodyHtml, cta } = options;

  return `
    <div style="background-color:#f7f2ea; padding:32px 16px; font-family: Arial, Helvetica, sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background-color:#ffffff; border:1px solid #ece4d3; border-radius:4px;">
        <tr>
          <td style="background-color:#f7f2ea; padding:28px 24px; text-align:center; border-bottom:1px solid #ece4d3; border-radius:4px 4px 0 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 12px;">
              <tr>
                <td style="width:56px; height:56px; border-radius:50%; background-color:#ffffff; border:1px solid rgba(200,164,92,0.6); text-align:center; vertical-align:middle;">
                  <img src="${LOGO_URL}" width="40" height="40" alt="Breakthrough Collection LLC" style="display:inline-block; width:40px; height:40px; margin-top:8px; border-radius:50%; object-fit:cover;" />
                </td>
              </tr>
            </table>
            <div style="font-family: Georgia, 'Times New Roman', serif; font-size:20px; letter-spacing:3px; text-transform:uppercase; color:#1f1d2b;">
              Breakthrough Collection <span style="font-style:italic; color:#c8a45c;">LLC</span>
            </div>
            <div style="margin-top:8px; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#8c8579;">
              Every Stitch Tells a Story
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 32px;">
            <p style="margin:0 0 8px; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#c8a45c; font-weight:bold;">
              ${eyebrow}
            </p>
            <h1 style="margin:0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size:26px; line-height:1.25; color:#1f1d2b;">
              ${heading}
            </h1>
            ${bodyHtml}
            ${
              cta
                ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:8px;">
                    <tr>
                      <td style="background-color:#c8a45c; border-radius:999px;">
                        <a href="${cta.url}" style="display:inline-block; padding:14px 32px; font-family: Arial, Helvetica, sans-serif; font-size:11px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#1f1d2b; text-decoration:none;">
                          ${cta.label}
                        </a>
                      </td>
                    </tr>
                  </table>`
                : ""
            }
          </td>
        </tr>
        <tr>
          <td style="background-color:#f7f2ea; padding:20px 24px; text-align:center; border-top:1px solid #ece4d3; border-radius:0 0 4px 4px;">
            <p style="margin:0; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#8c8579;">
              Crafted with love &middot; Made for the journey
            </p>
            <p style="margin:8px 0 0; font-size:11px; color:#a39c8e;">
              &copy; ${YEAR} Breakthrough Collection LLC. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
}
