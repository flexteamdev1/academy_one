const { escapeHtml, buildCommonData } = require('./shared');

const buildStudentTemplate = (payload) => {
  const d = buildCommonData(payload, 'Student');
  const subject = `${d.schoolName} - Student Portal Access`;
  const text = [
    subject,
    '',
    `Welcome ${d.recipient},`,
    'We are excited to have you onboard for the new academic session.',
    '',
    'Account Details:',
    `Role: ${d.role}`,
    `System ID: ${d.systemId}`,
    `Login ID: ${d.loginId}`,
    `Temporary Password: ${d.password}`,
    '',
    `Login URL: ${d.portalUrl}`,
    '',
    "What's inside your portal?",
    '- Daily schedule and classroom assignments.',
    '- Attendance and academic progress tracking.',
    '- Study materials and previous papers.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f6f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;background:#f6f6f6;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:#8a9a5b;padding:26px 20px;text-align:center;">
              <div style="width:66px;height:66px;border-radius:50%;margin:0 auto 10px;border:2px solid rgba(255,255,255,0.35);background:rgba(10,45,20,0.35);"></div>
              <h1 style="margin:0;color:#eef4df;font-size:52px;line-height:1.05;">${escapeHtml(d.schoolName)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 34px;">
              <h2 style="margin:0 0 14px;font-size:48px;color:#111827;">Welcome, ${escapeHtml(d.recipient)}!</h2>
              <p style="margin:0 0 18px;color:#475569;font-size:16px;line-height:1.7;">
                We are thrilled to have you join us for the new academic session. Your digital gateway to learning is now ready.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-left:4px solid #8a9a5b;border-radius:10px;background:#f5f6f7;margin-bottom:24px;">
                <tr><td colspan="2" style="padding:16px 18px 8px;color:#7f8f4f;font-weight:700;letter-spacing:1px;font-size:12px;">ACCOUNT DETAILS</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #e4e7ea;color:#6b7280;">Role:</td><td style="padding:10px 18px;border-top:1px solid #e4e7ea;text-align:right;font-weight:700;">${escapeHtml(d.role)}</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #e4e7ea;color:#6b7280;">System ID:</td><td style="padding:10px 18px;border-top:1px solid #e4e7ea;text-align:right;font-weight:700;">${escapeHtml(d.systemId)}</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #e4e7ea;color:#6b7280;">Temporary Password:</td><td style="padding:10px 18px;border-top:1px solid #e4e7ea;text-align:right;font-weight:700;color:#111827;">${escapeHtml(d.password)}</td></tr>
              </table>
              <p style="text-align:center;margin:0 0 14px;">
                <a href="${escapeHtml(d.portalUrl)}" style="display:inline-block;background:#e2725b;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;">Login to Student Portal</a>
              </p>
              <p style="margin:0 0 22px;text-align:center;color:#9ca3af;font-style:italic;font-size:13px;">
                Note: For security reasons, you will be prompted to change your password upon first login.
              </p>
              <hr style="border:0;border-top:1px solid #eceff2;margin:0 0 18px;" />
              <h3 style="margin:0 0 10px;font-size:38px;color:#111827;">What's inside your portal?</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                <tr>
                  <td style="width:50%;vertical-align:top;padding:4px 8px 4px 0;color:#374151;line-height:1.6;">✓ Access your daily schedule and classroom assignments.</td>
                  <td style="width:50%;vertical-align:top;padding:4px 0 4px 8px;color:#374151;line-height:1.6;">✓ Track your attendance and academic performance.</td>
                </tr>
                <tr>
                  <td style="width:50%;vertical-align:top;padding:4px 8px 4px 0;color:#374151;line-height:1.6;">✓ Download study materials and previous exam papers.</td>
                  <td style="width:50%;vertical-align:top;padding:4px 0 4px 8px;color:#374151;line-height:1.6;">✓ Communicate directly with teachers and peers.</td>
                </tr>
              </table>
              <hr style="border:0;border-top:1px solid #eceff2;margin:0 0 14px;" />
              <p style="margin:0 0 10px;color:#475569;line-height:1.7;">
                If you encounter issues logging in, please reach out to IT Support or your homeroom teacher.
              </p>
              <p style="margin:0;font-weight:700;">Warm regards,</p>
              <p style="margin:4px 0 0;color:#7b8f4b;font-weight:700;">The Administration Team</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f1f1f1;padding:16px 24px;text-align:center;">
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;">© ${d.year} ${escapeHtml(d.schoolName)}. All rights reserved.</p>
              <p style="margin:0;color:#6b7280;font-size:12px;">Support: ${escapeHtml(d.supportEmail)} | ${escapeHtml(d.supportPhone)}</p>
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
  buildStudentTemplate,
};
