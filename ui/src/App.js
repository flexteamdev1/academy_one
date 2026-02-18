import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import theme from './theme';

import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import AcademicYears from './pages/AcademicYears';
import Profile from './pages/Profile';
import TeacherAttendance from './pages/TeacherAttendance';
import AttendanceView from './pages/AttendanceView';
import Fees from './pages/Fees';
import Notices from './pages/Notices';
import NotFound from './pages/NotFound';
import MainLayout from './components/layout/MainLayout';
import { UIProvider } from './context/UIContext';
import { getUserRole } from './utils/auth';


const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const HomeLanding = () => {
  const role = getUserRole();
  if (role === 'student' || role === 'parent') return <UserDashboard />;
  if (role === 'teacher') return <Navigate to="/teacher-dashboard" replace />;
  return <Dashboard />;
};

const AttendanceLanding = () => {
  const role = getUserRole();
  if (role === 'teacher' || role === 'admin' || role === 'super_admin') {
    return <TeacherAttendance />;
  }
  return <AttendanceView />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={(theme) => ({
          body: {
            backgroundColor: theme.palette.background.default,
          },
          '@keyframes spin': {
            to: { transform: 'rotate(360deg)' },
          },
          '@keyframes fadeUp': {
            from: { opacity: 0, transform: 'translateY(12px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },
        })}
      />
      <UIProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
              >
              <Route index element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student', 'parent']}><HomeLanding /></ProtectedRoute>} />
              <Route path="teacher-dashboard" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><TeacherDashboard /></ProtectedRoute>} />
              <Route path="students" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher']}><Students /></ProtectedRoute>} />
              <Route path="teachers" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><Teachers /></ProtectedRoute>} />
              <Route path="classes" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><Classes /></ProtectedRoute>} />
              <Route path="academic-years" element={<ProtectedRoute allowedRoles={['super_admin', 'admin']}><AcademicYears /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student', 'parent']}><AttendanceLanding /></ProtectedRoute>} />
              <Route path="fees" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'student', 'parent']}><Fees /></ProtectedRoute>} />
              <Route path="notices" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student', 'parent']}><Notices /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'teacher', 'student', 'parent']}><Profile /></ProtectedRoute>} />
              <Route path="my-students" element={<Navigate to="/profile" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
