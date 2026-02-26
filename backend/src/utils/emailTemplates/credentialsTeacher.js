const { escapeHtml, buildCommonData } = require('./shared');

const buildTeacherTemplate = (payload) => {
  const d = buildCommonData(payload, 'Teacher');
  const subject = `${d.schoolName} - Faculty Portal Access`;
  const text = [
    subject,
    '',
    `Dear ${d.recipient},`,
    'Your faculty account has been created successfully.',
    '',
    'Account Details:',
    `Role: ${d.role}`,
    `System ID: ${d.systemId}`,
    `Login ID: ${d.loginId}`,
    `Temporary Password: ${d.password}`,
    '',
    `Login URL: ${d.portalUrl}`,
    '',
    'Important security notice:',
    '- Change your password immediately on first login.',
    '- Use a strong password and keep credentials private.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f6f1ea;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 0;background:#f6f1ea;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border:1px solid #efd8bd;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#efcaa5;padding:28px 20px;text-align:center;">
              <div style="width:120px;height:120px;margin:0 auto 14px;background:#f2f2f2;"></div>
              <h1 style="margin:0;color:#e9795e;font-size:46px;font-weight:700;">Welcome to the Faculty Portal</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 36px;">
              <h2 style="margin:0 0 14px;font-size:44px;color:#111827;">Dear ${escapeHtml(d.recipient)},</h2>
              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">
                We are pleased to welcome you to our school management system. Your profile has been created and your faculty dashboard is ready.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-left:4px solid #ed7b5f;background:#fbfbf8;border-radius:8px;margin-bottom:24px;">
                <tr><td colspan="2" style="padding:16px 18px 8px;color:#ed7b5f;font-weight:700;letter-spacing:0.8px;font-size:12px;">YOUR ACCOUNT DETAILS</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #f0e6d9;">Role:</td><td style="padding:10px 18px;border-top:1px solid #f0e6d9;text-align:right;color:#374151;font-weight:700;">${escapeHtml(d.role)}</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #f0e6d9;">System ID:</td><td style="padding:10px 18px;border-top:1px solid #f0e6d9;text-align:right;font-weight:700;color:#ed7b5f;">${escapeHtml(d.systemId)}</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #f0e6d9;">Temporary Password:</td><td style="padding:10px 18px;border-top:1px solid #f0e6d9;text-align:right;font-weight:700;color:#ed7b5f;">${escapeHtml(d.password)}</td></tr>
              </table>
              <p style="text-align:center;margin:0 0 24px;">
                <a href="${escapeHtml(d.portalUrl)}" style="display:inline-block;background:#e76f51;color:#fff;text-decoration:none;padding:13px 28px;border-radius:30px;font-weight:700;">Access Faculty Portal</a>
              </p>
              <div style="background:#f7f7f7;border-radius:10px;padding:14px 16px;">
                <h3 style="margin:0 0 10px;font-size:26px;font-style:italic;">Important Security Notice:</h3>
                <ul style="margin:0;padding-left:18px;line-height:1.65;color:#374151;">
                  <li>You will be required to <strong>change your password</strong> immediately upon first login.</li>
                  <li>Please ensure your new password contains a mix of letters, numbers, and symbols.</li>
                  <li>Do not share these credentials with anyone else.</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 20px;text-align:center;border-top:1px solid #f2dec8;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Support: ${escapeHtml(d.supportEmail)} | ${escapeHtml(d.supportPhone)}</p>
              <p style="margin:0;color:#6b7280;font-size:13px;">© ${d.year} ${escapeHtml(d.schoolName)}. All rights reserved.</p>
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
  buildTeacherTemplate,
};
