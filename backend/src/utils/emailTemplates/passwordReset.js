const { escapeHtml, buildCommonData } = require('./shared');

const buildPasswordResetEmailContent = (payload) => {
  const d = buildCommonData(payload, 'User');
  const resetUrl = payload.resetUrl || `${d.portalUrl}/reset-password`;
  const subject = `${d.schoolName} - Password Reset`;
  const text = [
    subject,
    '',
    `Hello ${d.recipient},`,
    '',
    'We received a request to reset your password.',
    `Reset link: ${resetUrl}`,
    '',
    'If you did not request a password reset, you can ignore this email.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;background:#f8fafc;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:26px 30px;background:#0f172a;color:#fff;">
              ${d.logoUrl ? `<img src="${escapeHtml(d.logoUrl)}" alt="${escapeHtml(d.schoolName)} logo" style="display:block;width:48px;height:48px;margin:0 0 10px;object-fit:contain;border-radius:8px;background:#ffffff;" />` : ''}
              <h1 style="margin:0;font-size:20px;font-weight:700;">${escapeHtml(d.schoolName)}</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#cbd5f5;">Password Reset</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 30px;">
              <p style="margin:0 0 14px;color:#334155;">Hello ${escapeHtml(d.recipient)},</p>
              <p style="margin:0 0 18px;color:#475569;line-height:1.7;">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>
              <p style="text-align:center;margin:0 0 20px;">
                <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:700;">Reset Password</a>
              </p>
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 20px;background:#f8fafc;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">© ${d.year} ${escapeHtml(d.schoolName)}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
};

module.exports = {
  buildPasswordResetEmailContent,
};
