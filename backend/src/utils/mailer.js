const nodemailer = require('nodemailer');
const {
  buildCredentialsEmailContent,
  buildPasswordResetEmailContent,
  buildNoticeEmailContent,
} = require('./emailTemplates');

const mailConfigFromEnv = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT || '587';
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;
  const secure = String(process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true';

  return { host, port, user, pass, from, secure };
};

const isMailConfigured = () => {
  const config = mailConfigFromEnv();
  return Boolean(nodemailer && config.host && config.port && config.user && config.pass && config.from);
};

const getMailConfigReason = () => {
  const config = mailConfigFromEnv();
  if (!nodemailer) return 'nodemailer_not_installed';
  if (!config.host) return 'smtp_host_missing';
  if (!config.port) return 'smtp_port_missing';
  if (!config.user) return 'smtp_user_missing';
  if (!config.pass) return 'smtp_pass_missing';
  if (!config.from) return 'smtp_from_missing';
  return null;
};

const getTransporter = () => {
  const config = mailConfigFromEnv();
  return nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

const getMailHealth = async () => {
  const config = mailConfigFromEnv();
  const configured = isMailConfigured();

  const sanitizedConfig = {
    host: config.host || null,
    port: config.port || null,
    secure: config.secure,
    user: config.user || null,
    from: config.from || null,
    hasPass: Boolean(config.pass),
    nodemailerLoaded: Boolean(nodemailer),
  };

  if (!configured) {
    return {
      configured: false,
      verify: {
        ok: false,
        reason: getMailConfigReason() || 'missing_or_invalid_mail_configuration',
      },
      config: sanitizedConfig,
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return {
      configured: true,
      verify: { ok: true },
      config: sanitizedConfig,
    };
  } catch (error) {
    return {
      configured: true,
      verify: {
        ok: false,
        reason: 'smtp_verify_failed',
        detail: error.message,
      },
      config: sanitizedConfig,
    };
  }
};

const sendTestEmail = async ({ to, requestedBy }) => {
  if (!to) {
    return { sent: false, reason: 'recipient_missing' };
  }

  const health = await getMailHealth();
  if (!health.verify.ok) {
    return {
      sent: false,
      reason: health.verify.reason || 'mail_not_ready',
      detail: health.verify.detail,
      config: health.config,
    };
  }

  const transporter = getTransporter();
  const config = mailConfigFromEnv();
  const subject = 'Academy One - SMTP Test Email';
  const text = [
    'This is a test email from Academy One.',
    `Requested by: ${requestedBy || 'unknown user'}`,
    `Sent at: ${new Date().toISOString()}`,
  ].join('\n');

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text,
    });

    return {
      sent: true,
      to,
      config: health.config,
    };
  } catch (error) {
    return {
      sent: false,
      reason: 'smtp_send_failed',
      detail: error.message,
      to,
      config: health.config,
    };
  }
};

const sendCredentialsEmail = async ({
  to,
  roleLabel,
  loginId,
  password,
  studentName,
  templateType,
  recipientName,
  systemId,
  portalUrl,
  supportEmail,
  supportPhone,
}) => {
  if (!to || !isMailConfigured()) {
    return {
      sent: false,
      reason: 'mail_not_configured_or_recipient_missing',
      configured: isMailConfigured(),
      recipient: to || null,
    };
  }

  const transporter = getTransporter();
  const config = mailConfigFromEnv();
  const mailContent = buildCredentialsEmailContent({
    templateType,
    roleLabel,
    loginId,
    password,
    recipientName,
    studentName,
    systemId,
    portalUrl,
    supportEmail,
    supportPhone,
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject: mailContent.subject,
      text: mailContent.text,
      html: mailContent.html,
    });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: 'smtp_send_failed',
      detail: error.message,
      recipient: to,
    };
  }
};

const sendNoticeEmail = async ({ to, recipientName, title, content, portalUrl }) => {
  if (!to || !isMailConfigured()) {
    return {
      sent: false,
      reason: 'mail_not_configured_or_recipient_missing',
      configured: isMailConfigured(),
    };
  }

  try {
    const config = mailConfigFromEnv();
    const mailContent = buildNoticeEmailContent({
      recipientName,
      title,
      content,
      portalUrl,
    });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: config.from,
      to,
      subject: mailContent.subject,
      text: mailContent.text,
      html: mailContent.html,
    });

    return { sent: true };
  } catch (_error) {
    return { sent: false, reason: 'smtp_send_failed' };
  }
};

const sendPasswordResetEmail = async ({ to, recipientName, resetUrl }) => {
  if (!to || !isMailConfigured()) {
    return {
      sent: false,
      reason: 'mail_not_configured_or_recipient_missing',
      configured: isMailConfigured(),
    };
  }

  const transporter = getTransporter();
  const config = mailConfigFromEnv();
  const mailContent = buildPasswordResetEmailContent({
    recipientName,
    resetUrl,
    portalUrl: process.env.FRONTEND_URL || '#',
  });

  try {
    await transporter.sendMail({
      from: config.from,
      to,
      subject: mailContent.subject,
      text: mailContent.text,
      html: mailContent.html,
    });
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: 'smtp_send_failed',
      detail: error.message,
      recipient: to,
    };
  }
};

module.exports = {
  isMailConfigured,
  getMailHealth,
  sendTestEmail,
  sendCredentialsEmail,
  sendPasswordResetEmail,
  sendNoticeEmail,
};
