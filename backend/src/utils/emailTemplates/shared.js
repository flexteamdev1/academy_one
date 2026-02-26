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
  if (role.includes('admin')) return 'admin';
  if (role.includes('parent')) return 'parent';
  if (role.includes('teacher') || role.includes('faculty')) return 'teacher';
  return 'student';
};

const buildCommonData = (payload, fallbackRole) => {
  const schoolName = process.env.SCHOOL_NAME || 'School Management System';
  const year = new Date().getFullYear();
  const portalUrl = payload.portalUrl || process.env.FRONTEND_URL || '#';
  const portalLoginUrl = (() => {
    if (!portalUrl || portalUrl === '#') return portalUrl;
    if (/\/login\/?$/i.test(portalUrl)) return portalUrl;
    return portalUrl.endsWith('/') ? `${portalUrl}login` : `${portalUrl}/login`;
  })();
  let logoUrl = payload.logoUrl || process.env.LOGO_URL || '';

  if (!logoUrl && portalUrl && portalUrl !== '#') {
    try {
      const portalOrigin = new URL(portalUrl).origin;
      logoUrl = `${portalOrigin}/logo.png`;
    } catch (error) {
      const trimmed = String(portalUrl).replace(/\/+$/, '');
      logoUrl = trimmed ? `${trimmed}/logo.png` : '';
    }
  }

  return {
    schoolName,
    year,
    recipient: payload.recipientName || payload.studentName || 'User',
    role: payload.roleLabel || fallbackRole,
    systemId: payload.systemId || payload.loginId || '-',
    loginId: payload.loginId || '-',
    password: payload.password || '-',
    portalUrl,
    portalLoginUrl,
    logoUrl,
    supportEmail: payload.supportEmail || process.env.SUPPORT_EMAIL || 'support@example.com',
    supportPhone: payload.supportPhone || process.env.SUPPORT_PHONE || '+1 (000) 000-0000',
    studentName: payload.studentName || '-',
  };
};

module.exports = {
  escapeHtml,
  normalizeTemplateType,
  buildCommonData,
};
