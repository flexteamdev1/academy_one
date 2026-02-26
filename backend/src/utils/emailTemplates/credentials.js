const { normalizeTemplateType } = require('./shared');
const { buildParentTemplate } = require('./credentialsParent');
const { buildTeacherTemplate } = require('./credentialsTeacher');
const { buildStudentTemplate } = require('./credentialsStudent');

const buildCredentialsEmailContent = (payload) => {
  const selected = normalizeTemplateType(payload.templateType, payload.roleLabel);

  if (selected === 'parent') return buildParentTemplate(payload);
  if (selected === 'teacher') return buildTeacherTemplate(payload);
  return buildStudentTemplate(payload);
};

module.exports = {
  buildCredentialsEmailContent,
};
