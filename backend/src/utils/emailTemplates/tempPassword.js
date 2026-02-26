const { escapeHtml, buildCommonData } = require('./shared');

const buildTempPasswordEmailContent = (payload) => {
  const d = buildCommonData(payload, 'Student');
  const subject = `${d.schoolName} - Temporary Password Issued`;
  const text = [
    subject,
    '',
    `Hello ${d.recipient},`,
    `A temporary password has been generated for ${d.studentName}.`,
    '',
    'Login Details:',
    `Login ID: ${d.loginId}`,
    `Temporary Password: ${d.password}`,
    '',
    `Login URL: ${d.portalLoginUrl}`,
    '',
    'Security Notice: This password is temporary and must be changed on first login.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f5f6fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;background:#f5f6fb;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e3e8f1;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;background:#eef2ff;text-align:center;">
              ${d.logoUrl ? `<img src="${escapeHtml(d.logoUrl)}" alt="${escapeHtml(d.schoolName)} logo" style="display:block;width:56px;height:56px;margin:0 auto 10px;object-fit:contain;border-radius:10px;border:1px solid #e0e7ff;" />` : ''}
              <h1 style="margin:0;font-size:24px;color:#4338ca;font-weight:700;">Temporary Password Issued</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#374151;">
                Hello ${escapeHtml(d.recipient)}, a temporary password has been generated for <strong>${escapeHtml(d.studentName)}</strong>.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;margin-bottom:20px;">
                <tr><td style="padding:12px 16px;color:#6b7280;">Login ID</td><td style="padding:12px 16px;text-align:right;font-weight:700;">${escapeHtml(d.loginId)}</td></tr>
                <tr><td style="padding:12px 16px;color:#6b7280;border-top:1px solid #e5e7eb;">Temporary Password</td><td style="padding:12px 16px;text-align:right;font-weight:700;color:#dc2626;">${escapeHtml(d.password)}</td></tr>
              </table>
              <p style="text-align:center;margin:0 0 18px;">
                <a href="${escapeHtml(d.portalLoginUrl)}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;">Login to Portal</a>
              </p>
              <p style="margin:0;padding:12px 14px;border:1px solid #fde68a;background:#fffbeb;color:#92400e;border-radius:10px;font-size:13px;">
                Security Notice: This password is temporary and must be changed on first login.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#111827;padding:16px 20px;text-align:center;color:#d1d5db;">
              <p style="margin:0;font-size:12px;">© ${d.year} ${escapeHtml(d.schoolName)}. All rights reserved.</p>
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
  buildTempPasswordEmailContent,
};
