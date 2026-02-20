import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AlternateEmailOutlined from '@mui/icons-material/AlternateEmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

const BrandIcon = ({ size = 48 }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" />
    <path d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('userInfo', JSON.stringify({ ...response, remember }));
      if (response?.mustChangePassword) {
        navigate('/profile');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: (theme) => theme.palette.background.default }}>
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '50%',
          px: 8,
          py: 6,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.info.light} 100%)`,
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          <Box
            sx={{
              position: 'absolute',
              top: 80,
              left: 80,
              width: 256,
              height: 256,
              borderRadius: '50%',
              filter: 'blur(64px)',
              bgcolor: (theme) => theme.palette.action.hover,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 80,
              right: 80,
              width: 384,
              height: 384,
              borderRadius: '50%',
              filter: 'blur(64px)',
              bgcolor: (theme) => theme.palette.secondary.light,
            }}
          />
        </Box>

        <Stack sx={{ position: 'relative', zIndex: 1, maxWidth: 460 }} spacing={3.5}>
          <Card
            sx={(theme) => ({
              p: 4,
              borderRadius: theme.shape.borderRadius,
              boxShadow: 'none',
              border: '1px solid',
              borderColor: theme.palette.action.hover,
              backgroundColor: theme.palette.action.hover,
              backdropFilter: 'blur(8px)',
              textAlign: 'center',
            })}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: (theme) => theme.shape.borderRadius,
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                display: 'grid',
                placeItems: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <BrandIcon size={46} />
            </Box>
            <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.1, mb: 1.6 }}>
              Academy One
            </Typography>
            <Typography color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.7 }}>
              Transforming school management through intelligent automation and intuitive design.
            </Typography>
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 1.2 }}>
            {[
              { icon: <GroupOutlined fontSize="small" />, label: 'Admins' },
              { icon: <SchoolOutlined fontSize="small" />, label: 'Teachers' },
              { icon: <PersonOutlineOutlined fontSize="small" />, label: 'Students' },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  borderRadius: (theme) => theme.shape.borderRadius,
                  p: 1.5,
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: (theme) => theme.palette.action.hover,
                  backgroundColor: (theme) => theme.palette.action.hover,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 0.8 }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ width: { xs: '100%', lg: '50%' }, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2.5, md: 6 } }}>
        <Stack sx={{ width: '100%', maxWidth: 520 }} spacing={3}>
          <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
            <Stack
              direction="row"
              spacing={1.3}
              alignItems="center"
              justifyContent="center"
              sx={{ display: { xs: 'flex', lg: 'none' }, mb: 3 }}
            >
              <Box
                sx={(theme) => ({
                  width: 38,
                  height: 38,
                  borderRadius: theme.shape.borderRadius,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'grid',
                  placeItems: 'center',
                })}
              >
                <BrandIcon size={22} />
              </Box>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 800 }}>Academy One</Typography>
            </Stack>

            <Typography sx={{ fontSize: { xs: '2rem', md: '2.2rem' }, fontWeight: 800, lineHeight: 1.1 }}>
              Welcome Back
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
              Please enter your credentials to access the portal.
            </Typography>
          </Box>

          <Card
            sx={(theme) => ({
              p: { xs: 3, md: 4 },
              borderRadius: theme.shape.borderRadius,
              border: '1px solid',
              borderColor: theme.palette.grey[100],
              boxShadow: '0 20px 46px rgba(31,42,55,0.08)',
            })}
          >
            {error ? <Alert severity="error" sx={{ mb: 2.4 }}>{error}</Alert> : null}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.6}>
                <Box>
                  <Typography sx={{ mb: 1, ml: 0.8, fontSize: '0.67rem', fontWeight: 800, color: (theme) => theme.palette.grey[500], textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    User Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    placeholder="name@school.edu"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AlternateEmailOutlined fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1, px: 0.8 }}>
                    <Typography sx={{ fontSize: '0.67rem', fontWeight: 800, color: (theme) => theme.palette.grey[500], textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      Password
                    </Typography>
                    <Link href="#" underline="hover" sx={{ fontSize: '0.67rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'primary.main' }}>
                      Forgot?
                    </Link>
                  </Stack>
                  <TextField
                    fullWidth
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small">
                            {showPassword ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      sx={{ color: 'primary.main' }}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      Stay logged in for 30 days
                    </Typography>
                  }
                />

                <Button
                  type="submit"
                  disabled={loading}
                  endIcon={<ArrowForwardRounded />}
                  sx={(theme) => ({
                    py: 1.6,
                    borderRadius: theme.shape.borderRadius,
                    color: 'primary.contrastText',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    backgroundColor: 'primary.main',
                    boxShadow: '0 12px 28px rgba(37,99,235,0.22)',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  })}
                >
                  {loading ? 'Signing in...' : 'Login to Portal'}
                </Button>
              </Stack>
            </form>
          </Card>

          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.66rem', color: (theme) => theme.palette.grey[500], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              © 2024 Academy One CRM •{' '}
              <Link href="#" underline="always" sx={{ color: 'inherit' }}>
                Privacy Policy
              </Link>
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginPage;
