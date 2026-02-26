import React from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import UserDashboard from '../pages/UserDashboard';
import TeacherDashboard from '../pages/TeacherDashboard';
import Students from '../pages/Students';
import Teachers from '../pages/Teachers';
import Admins from '../pages/Admins';
import Parents from '../pages/Parents';
import Classes from '../pages/Classes';
import AcademicYears from '../pages/AcademicYears';
import Enrollment from '../pages/Enrollment';
import Profile from '../pages/Profile';
import ChangePassword from '../pages/ChangePassword';
import ModernStudentProfile from '../pages/ModernStudentProfile';
import StudentAttendance from '../pages/StudentAttendance';
import MarkStudentAttendance from '../pages/MarkStudentAttendance';
import AttendanceDetails from '../pages/AttendanceDetails';
import ClassAttendanceHistory from '../pages/ClassAttendanceHistory';
import StudentAttendanceRecords from '../pages/StudentAttendanceRecords';
import AttendanceView from '../pages/AttendanceView';
import TeacherStudentManagement from '../pages/TeacherStudentManagement';
import Fees from '../pages/Fees';
import Notices from '../pages/Notices';
import NotFound from '../pages/NotFound';
import { getUserRole } from '../utils/auth';

const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
};

const ROLE_GROUPS = {
  PORTAL: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT],
  STAFF: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.TEACHER],
  ADMIN_ONLY: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  SUPER_ONLY: [ROLES.SUPER_ADMIN],
  STUDENT_PARENT: [ROLES.STUDENT, ROLES.PARENT],
};

const HomeLanding = () => {
  const role = getUserRole();
  if (role === ROLES.STUDENT || role === ROLES.PARENT) return <UserDashboard />;
  if (role === ROLES.TEACHER) return <Navigate to="/teacher-dashboard" replace />;
  return <Dashboard />;
};

const ProfileLanding = () => {
  const role = getUserRole();
  if (role === ROLES.STUDENT || role === ROLES.PARENT) {
    return <ModernStudentProfile />;
  }
  return <Profile />;
};

const AttendanceLanding = () => {
  const role = getUserRole();
  if (role === ROLES.TEACHER || role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN) {
    return <StudentAttendance />;
  }
  if (role === ROLES.STUDENT || role === ROLES.PARENT) {
    return <StudentAttendanceRecords />;
  }
  return <AttendanceView />;
};

const APP_ROUTES = [
  { index: true, element: <HomeLanding />, roles: ROLE_GROUPS.PORTAL },
  { path: 'teacher-dashboard', element: <TeacherDashboard />, roles: ROLE_GROUPS.STAFF },
  { path: 'students', element: <Students />, roles: ROLE_GROUPS.ADMIN_ONLY },
  { path: 'teacher/students', element: <TeacherStudentManagement />, roles: [ROLES.TEACHER] },
  { path: 'students/:id/profile', element: <ModernStudentProfile />, roles: ROLE_GROUPS.STAFF },
  { path: 'teachers', element: <Teachers />, roles: ROLE_GROUPS.ADMIN_ONLY },
  { path: 'parents', element: <Parents />, roles: ROLE_GROUPS.ADMIN_ONLY },
  { path: 'admins', element: <Admins />, roles: ROLE_GROUPS.SUPER_ONLY },
  { path: 'classes', element: <Classes />, roles: ROLE_GROUPS.ADMIN_ONLY },
  { path: 'academic-years', element: <AcademicYears />, roles: ROLE_GROUPS.ADMIN_ONLY },
  { path: 'enrollment', element: <Enrollment />, roles: ROLE_GROUPS.STAFF },
  { path: 'attendance', element: <AttendanceLanding />, roles: ROLE_GROUPS.PORTAL },
  { path: 'attendance/mark/:classId/:sectionName', element: <MarkStudentAttendance />, roles: ROLE_GROUPS.STAFF },
  { path: 'attendance/history/:classId/:sectionName', element: <ClassAttendanceHistory />, roles: ROLE_GROUPS.STAFF },
  { path: 'attendance/details/:classId/:sectionName/:date', element: <AttendanceDetails />, roles: ROLE_GROUPS.STAFF },
  { path: 'fees', element: <Fees />, roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT] },
  { path: 'notices', element: <Notices />, roles: ROLE_GROUPS.PORTAL },
  { path: 'profile', element: <ProfileLanding />, roles: ROLE_GROUPS.PORTAL },
  { path: 'change-password', element: <ChangePassword />, roles: ROLE_GROUPS.PORTAL },
  { path: 'my-students', element: <Navigate to="/profile" replace /> },
  { path: '*', element: <NotFound /> },
];

export { APP_ROUTES, ROLE_GROUPS, ROLES };
