const { buildCredentialsEmailContent } = require('./credentials');
const { buildPasswordResetEmailContent } = require('./passwordReset');
const { buildNoticeEmailContent } = require('./notice');

module.exports = {
  buildCredentialsEmailContent,
  buildPasswordResetEmailContent,
  buildNoticeEmailContent,
};
