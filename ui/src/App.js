import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import theme from './theme';

import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import MainLayout from './components/layout/MainLayout';
import { UIProvider } from './context/UIContext';

const ProtectedRoute = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={(theme) => ({
          body: {
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}22 100%)`,
          },
          '@keyframes spin': {
            to: { transform: 'rotate(360deg)' },
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
              <Route index element={<Dashboard />} />
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
