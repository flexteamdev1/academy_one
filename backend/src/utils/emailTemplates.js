const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeTemplateType = (templateType, roleLabel) => {
  if (templateType) return String(templateType).trim().toLowerCase();

  const role = String(roleLabel || '').trim().toLowerCase();
  if (role.includes('parent')) return 'parent';
  if (role.includes('teacher') || role.includes('faculty')) return 'teacher';
  return 'student';
};

const buildCommonData = (payload, fallbackRole) => {
  const schoolName = process.env.SCHOOL_NAME || 'School Management System';
  const year = new Date().getFullYear();

  return {
    schoolName,
    year,
    recipient: payload.recipientName || payload.studentName || 'User',
    role: payload.roleLabel || fallbackRole,
    systemId: payload.systemId || payload.loginId || '-',
    loginId: payload.loginId || '-',
    password: payload.password || '-',
    portalUrl: payload.portalUrl || process.env.FRONTEND_URL || '#',
    supportEmail: payload.supportEmail || process.env.SUPPORT_EMAIL || 'support@example.com',
    supportPhone: payload.supportPhone || process.env.SUPPORT_PHONE || '+1 (000) 000-0000',
    studentName: payload.studentName || '-',
  };
};

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

const buildCredentialsEmailContent = (payload) => {
  const selected = normalizeTemplateType(payload.templateType, payload.roleLabel);

  if (selected === 'parent') return buildParentTemplate(payload);
  if (selected === 'teacher') return buildTeacherTemplate(payload);
  return buildStudentTemplate(payload);
};

module.exports = {
  buildCredentialsEmailContent,
};
