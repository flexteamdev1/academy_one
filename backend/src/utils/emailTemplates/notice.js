const { escapeHtml, buildCommonData } = require('./shared');

const buildNoticeEmailContent = (payload) => {
  const d = buildCommonData(payload, 'User');
  const subject = `${d.schoolName} - ${payload.title || 'New Notice'}`;
  const text = [
    subject,
    '',
    `Hello ${d.recipient},`,
    '',
    payload.title || 'New Notice',
    '',
    payload.content || '',
    '',
    `View more: ${d.portalUrl}`,
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;background:#f3f4f6;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px;background:#0f172a;color:#fff;">
              <h1 style="margin:0;font-size:22px;font-weight:700;">${escapeHtml(d.schoolName)}</h1>
              <p style="margin:6px 0 0;font-size:14px;color:#cbd5f5;">New Notice</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 14px;color:#475569;">Hello ${escapeHtml(d.recipient)},</p>
              <h2 style="margin:0 0 12px;font-size:24px;color:#0f172a;">${escapeHtml(payload.title || 'Notice')}</h2>
              <p style="margin:0 0 18px;color:#334155;line-height:1.7;white-space:pre-line;">${escapeHtml(payload.content || '')}</p>
              <p style="margin:0;">
                <a href="${escapeHtml(d.portalUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:700;">View in Portal</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f8fafc;text-align:center;">
              <p style="margin:0;color:#6b7280;font-size:12px;">© ${d.year} ${escapeHtml(d.schoolName)}. All rights reserved.</p>
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
  buildNoticeEmailContent,
};
