const normalizeSectionName = (value) => String(value || '').toUpperCase().trim();

const getTeacherId = (user) => (
  String(
    user?.teacherId?._id ||
    user?.teacherId ||
    user?.teacher?._id ||
    user?.teacher?.id ||
    user?._id ||
    user?.id ||
    user?.user?._id ||
    user?.user?.id ||
    ''
  )
);

const getSectionTeacherId = (section) => (
  String(
    section?.classTeacherId?._id ||
    section?.classTeacherId ||
    section?.teacherId?._id ||
    section?.teacherId ||
    ''
  )
);

const buildAssignedSectionsByClass = (classes, teacherId) => {
  if (!teacherId) return {};
  return (classes || []).reduce((acc, item) => {
    const classTeacherId = String(item?.classTeacherId?._id || item?.classTeacherId || '');
    const allSections = (item.sections || [])
      .map((section) => normalizeSectionName(section.name))
      .filter(Boolean);

    if (classTeacherId && classTeacherId === teacherId) {
      if (allSections.length) acc[item._id] = Array.from(new Set(allSections));
      return acc;
    }

    const assigned = (item.sections || [])
      .filter((section) => getSectionTeacherId(section) === teacherId)
      .map((section) => normalizeSectionName(section.name))
      .filter(Boolean);
    if (assigned.length) acc[item._id] = Array.from(new Set(assigned));
    return acc;
  }, {});
};

const buildAllSectionsByClass = (classes) => (
  (classes || []).reduce((acc, item) => {
    const allSections = (item.sections || [])
      .map((section) => normalizeSectionName(section.name))
      .filter(Boolean);
    if (allSections.length) {
      acc[item._id] = Array.from(new Set(allSections));
    }
    return acc;
  }, {})
);

const filterClassesForTeacher = (classes, teacherId) => {
  if (!teacherId) {
    return { classes: classes || [], assignedSectionsByClass: {} };
  }
  const assignedSectionsByClass = buildAssignedSectionsByClass(classes, teacherId);
  if (!Object.keys(assignedSectionsByClass).length && (classes || []).length) {
    return { classes: classes || [], assignedSectionsByClass: buildAllSectionsByClass(classes) };
  }
  const filtered = (classes || []).filter((item) => Boolean(assignedSectionsByClass[item._id]));
  return { classes: filtered, assignedSectionsByClass };
};

const normalizeStudentClassId = (student) => (
  String(student?.classId?._id || student?.classId || student?.class?._id || student?.class || '')
);

const filterStudentsForTeacher = (students, assignedClasses, assignedSectionsByClass) => {
  if (!assignedClasses?.length) return [];
  const allowedClassIds = assignedClasses.map((item) => item._id);
  return (students || []).filter((student) => {
    const classId = normalizeStudentClassId(student);
    if (!allowedClassIds.includes(classId)) return false;
    const allowedSections = assignedSectionsByClass[classId];
    if (!allowedSections?.length) return true;
    return allowedSections.includes(normalizeSectionName(student.sectionName));
  });
};

export {
  normalizeSectionName,
  getTeacherId,
  getSectionTeacherId,
  buildAssignedSectionsByClass,
  filterClassesForTeacher,
  filterStudentsForTeacher,
  normalizeStudentClassId,
};
