const { escapeHtml, buildCommonData } = require('./shared');

const buildParentTemplate = (payload) => {
  const d = buildCommonData(payload, 'Parent');
  const subject = `${d.schoolName} - Parent Portal Access`;
  const text = [
    subject,
    '',
    `Welcome ${d.recipient},`,
    `We are pleased to invite you to the school portal for ${d.studentName}.`,
    '',
    'Account Details:',
    `Role: ${d.role}`,
    `System ID: ${d.systemId}`,
    `Login ID: ${d.loginId}`,
    `Temporary Password: ${d.password}`,
    '',
    `Login URL: ${d.portalUrl}`,
    '',
    'What you can do:',
    '- Monitor attendance and school updates.',
    '- Track fees and payment history.',
    '',
    'Security notice: Please change your password on first login.',
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f2efea;font-family:Arial,Helvetica,sans-serif;color:#27314f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;background:#f2efea;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border:1px solid #dbe1f2;border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:#d7dceb;padding:30px 24px;text-align:center;">
              <div style="width:48px;height:48px;margin:0 auto 10px;background:#f5efe1;border:1px solid #d7cfbf;"></div>
              <h1 style="margin:0;color:#3c466a;font-size:28px;font-weight:700;">Parent Portal Access</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:34px 36px;">
              <h2 style="margin:0 0 16px;font-size:40px;color:#3b4263;">Welcome, ${escapeHtml(d.recipient)}</h2>
              <p style="margin:0 0 20px;color:#485676;font-size:16px;line-height:1.6;">
                We are pleased to invite you to the school's official management portal. This platform keeps you connected with <strong>${escapeHtml(d.studentName)}</strong>.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #ced3e6;border-radius:12px;background:#fafbfd;margin-bottom:24px;">
                <tr><td colspan="2" style="padding:16px 18px 8px;color:#7f90c4;font-weight:700;letter-spacing:0.8px;font-size:12px;">YOUR ACCOUNT DETAILS</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #e7ebf6;color:#6a7390;">Role:</td><td style="padding:10px 18px;border-top:1px solid #e7ebf6;text-align:right;font-weight:700;">${escapeHtml(d.role)}</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #e7ebf6;color:#6a7390;">System ID:</td><td style="padding:10px 18px;border-top:1px solid #e7ebf6;text-align:right;font-weight:700;">${escapeHtml(d.systemId)}</td></tr>
                <tr><td style="padding:10px 18px;border-top:1px solid #e7ebf6;color:#6a7390;">Auto-generated Password:</td><td style="padding:10px 18px;border-top:1px solid #e7ebf6;text-align:right;font-weight:700;color:#e07a5f;">${escapeHtml(d.password)}</td></tr>
              </table>
              <p style="text-align:center;margin:0 0 24px;">
                <a href="${escapeHtml(d.portalUrl)}" style="display:inline-block;background:#e07a5f;color:#fff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;">Login to Parent Portal</a>
              </p>
              <h3 style="margin:0 0 10px;font-size:34px;color:#3b4263;">What you can do:</h3>
              <ul style="margin:0 0 20px;padding-left:20px;color:#3e4f73;line-height:1.7;">
                <li><strong>Monitor Attendance:</strong> View daily attendance and monthly summaries.</li>
                <li><strong>Manage Fees:</strong> Track invoices and payment history.</li>
              </ul>
              <p style="margin:0;padding:12px 14px;border:1px solid #f3dca3;background:#fff8e8;color:#9b5718;border-radius:10px;font-size:14px;">
                Security Notice: The password above is temporary and must be changed during first login.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#49506f;padding:18px 20px;text-align:center;color:#e6e8f1;">
              <p style="margin:0 0 6px;font-size:13px;">© ${d.year} ${escapeHtml(d.schoolName)}. All rights reserved.</p>
              <p style="margin:0;font-size:13px;">Support: ${escapeHtml(d.supportEmail)} | ${escapeHtml(d.supportPhone)}</p>
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
  buildParentTemplate,
};
