// Shared HTML wrapper for customer-facing transactional emails (newsletter
// welcome, custom-request confirmation/quote/status updates). Table-based
// layout for Outlook/Gmail compatibility; colors are hex approximations of
// the site's oklch brand tokens since email clients don't support oklch().
const YEAR = new Date().getFullYear();

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
          <td style="background-color:#1f1d2b; padding:32px 24px; text-align:center; border-radius:4px 4px 0 0;">
            <div style="font-family: Georgia, 'Times New Roman', serif; font-size:20px; letter-spacing:3px; text-transform:uppercase; color:#c8a45c;">
              Breakthrough Collection <span style="font-style:italic; color:#e4cfa0;">LLC</span>
            </div>
            <div style="margin-top:8px; font-size:10px; letter-spacing:3px; text-transform:uppercase; color:rgba(255,255,255,0.55);">
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
