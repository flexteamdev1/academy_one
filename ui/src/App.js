import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import theme from './theme';

import LoginPage from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';
import MainLayout from './components/layout/MainLayout';
import { UIProvider } from './context/UIContext';
import { getStoredUserInfo, getUserInfo, getUserRole } from './utils/auth';
import { APP_ROUTES } from './routes/appRoutes';


const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const userInfo = getStoredUserInfo();
  if (!userInfo || !userInfo?.token) {
    return <Navigate to="/login" replace />;
  }

  const user = getUserInfo();
  const role = getUserRole();
  const mustForceChange = ['student', 'parent', 'teacher', 'admin'].includes(role);
  const allowedPasswordRoutes = ['/profile', '/change-password'];
  if (mustForceChange && user?.mustChangePassword && !allowedPasswordRoutes.includes(location.pathname)) {
    return <Navigate to="/change-password" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const renderProtectedRoute = (route) => {
  const key = route.index ? 'index' : route.path || route.element?.type?.name || 'route';
  const element = route.roles ? (
    <ProtectedRoute allowedRoles={route.roles}>{route.element}</ProtectedRoute>
  ) : (
    route.element
  );

  if (route.index) {
    return <Route key={key} index element={element} />;
  }
  return <Route key={key} path={route.path} element={element} />;
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
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              {APP_ROUTES.map(renderProtectedRoute)}
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
