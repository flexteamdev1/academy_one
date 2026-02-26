const { buildCredentialsEmailContent } = require('./credentials');
const { buildPasswordResetEmailContent } = require('./passwordReset');
const { buildNoticeEmailContent } = require('./notice');
const { buildTempPasswordEmailContent } = require('./tempPassword');

module.exports = {
  buildCredentialsEmailContent,
  buildPasswordResetEmailContent,
  buildNoticeEmailContent,
  buildTempPasswordEmailContent,
};
