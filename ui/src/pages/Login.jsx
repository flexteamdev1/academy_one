import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import SchoolIcon from "@mui/icons-material/School";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HttpsOutlinedIcon from "@mui/icons-material/HttpsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("userInfo", JSON.stringify(response.data));
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : "An error occurred during login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(
            theme.palette.background.default,
            0.9
          )}, ${alpha(theme.palette.secondary.main, 0.15)})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: (theme) => ({ xs: theme.spacing(2), md: theme.spacing(4) }),
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 1200,
          minHeight: 650,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Grid container minHeight="100%">
          {/* ================= LEFT PANEL ================= */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: (theme) => ({
                xs: theme.spacing(4),
                md: theme.spacing(6),
                lg: theme.spacing(8),
              }),
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "background.paper",
              borderRight: {
                md: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  bgcolor: "primary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 2,
                  color: "primary.contrastText",
                }}
              >
                <SchoolIcon />
              </Box>
              <Typography variant="h6" fontWeight="bold">
                EduFlow
              </Typography>
            </Box>

            <Typography variant="h3" fontWeight={700} sx={{ mb: 2, fontSize: { xs: "2rem", md: "2.6rem" } }}>
              Nurturing <br />
              tomorrow's <br />
              minds.
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 6, lineHeight: 1.6, maxWidth: 420 }}>
              A gentle, unified space for students and educators to manage their
              daily academic journey with ease.
            </Typography>

            <Stack spacing={2}>
              <Feature
                icon={<AutoAwesomeIcon />}
                text="Intuitive Experience"
                tone="primary"
              />
              <Feature
                icon={<FavoriteIcon />}
                text="Student-Centric Design"
                tone="secondary"
              />
            </Stack>
          </Grid>

          {/* ================= RIGHT PANEL ================= */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: (theme) => ({
                xs: theme.spacing(4),
                md: theme.spacing(6),
                lg: theme.spacing(8),
              }),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 420 }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Please sign in to your school account
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <InputField
                    label="Username or Email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<PersonOutlineIcon />}
                  />

                  <InputField
                    label="Security Key"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    icon={<HttpsOutlinedIcon />}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
                    disabled={loading}
                    sx={{
                      py: 1.4,
                      bgcolor: "primary.main",
                      "&:hover": { bgcolor: "primary.light" },
                    }}
                  >
                    {loading ? "Signing in..." : "Enter Portal"}
                  </Button>
                </Stack>
              </form>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  If you are a student or teacher, please check your email for system-generated credentials.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Having trouble? <Link href="#" fontWeight={600} underline="hover">Contact Administration</Link>
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
};

/* ======================
    SMALL COMPONENTS
====================== */

const Feature = ({ icon, text, tone = "primary" }) => {
  return (
    <Box display="flex" alignItems="center">
      <Box
        sx={{
          p: 1,
          borderRadius: "50%",
          bgcolor: (theme) => alpha(theme.palette[tone].main, 0.15),
          color: (theme) => theme.palette[tone].main,
          mr: 2,
        }}
      >
        {icon}
      </Box>

      <Typography
        fontWeight={600}
        color="text.secondary"
      >
        {text}
      </Typography>
    </Box>
  );
};

const InputField = ({
  label,
  icon,
  ...props
}) => {
  return (
    <Box>
      <Typography
        variant="subtitle2"
        mb={1}
        sx={{ textTransform: "uppercase" }}
      >
        {label}
      </Typography>

      <TextField
        fullWidth
        {...props}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default LoginPage;
