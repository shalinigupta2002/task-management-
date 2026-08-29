import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert, Box, Button, Checkbox, CircularProgress, Divider,
  FormControl, FormControlLabel, IconButton, InputAdornment,
  Link, MenuItem, Select, TextField, Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { authService } from "../../services";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/session";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: "#F8FAFC",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#2563EB" },
    "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "2px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#2563EB" },
};

function LoginForm() {
  const navigate = useNavigate();
  const { login: setAuthSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginData, setLoginData] = useState({ role: "EMPLOYEE", email: "", password: "", remember: false });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = loginData.email.trim().toLowerCase();
    if (!email) { setError("Email address is required."); return; }
    if (!emailRegex.test(email)) { setError("Please enter a valid email address."); return; }
    if (!loginData.password) { setError("Password is required."); return; }

    try {
      setLoading(true);
      const user = await authService.login(email, loginData.password, loginData.role);
      const roleName = user.roleName || user.role?.name || user.role;

      if (loginData.role && roleName && loginData.role !== roleName) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userRole");
        setError(`This account is ${roleName}. Please select the matching Login Role.`);
        return;
      }

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", roleName);
      setAuthSession({ token: user.accessToken, user: { ...user, role: roleName } });

      const targetRole = roleName;
      if (targetRole === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard");
      } else if (targetRole === "SUB_ADMIN") {
        navigate("/sub-admin/dashboard");
      } else if (targetRole === "EMPLOYEE") {
        navigate("/employee/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err, "Invalid credentials. Please check your email and password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin} noValidate width="100%">
      <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1.25, mb: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#102542", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <AssignmentTurnedInIcon sx={{ color: "#FFF", fontSize: 22 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem" }}>Task Portal</Typography>
      </Box>

      <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.35rem", mb: 0.25, textAlign: "left" }}>
        Welcome Back
      </Typography>
      <Typography sx={{ color: "#64748B", mb: 2, fontSize: "0.85rem", textAlign: "left" }}>
        Sign in to access your Task Management account
      </Typography>

      <Typography sx={{ fontWeight: 600, color: "#334155", fontSize: "0.8rem", mb: 0.75, textAlign: "left" }}>
        Login Role
      </Typography>
      <FormControl fullWidth sx={{ mb: 1.5 }}>
        <Select name="role" value={loginData.role} onChange={handleChange} size="small"
          sx={{ borderRadius: 2, bgcolor: "#F8FAFC", "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#2563EB" }, "&.Mui-focused fieldset": { borderColor: "#2563EB" } }}>
          <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
          <MenuItem value="MAIN_ADMIN">Main Admin</MenuItem>
          <MenuItem value="SUB_ADMIN">Sub Admin</MenuItem>
          <MenuItem value="EMPLOYEE">Employee</MenuItem>
        </Select>
      </FormControl>

      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, py: 0.25 }}>{error}</Alert>}

      <TextField
        fullWidth
        label="Email Address"
        name="email"
        type="email"
        autoComplete="email"
        size="small"
        value={loginData.email}
        onChange={handleChange}
        sx={{ ...inputSx, mb: 1.25 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} /></InputAdornment> }}
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        size="small"
        value={loginData.password}
        onChange={handleChange}
        sx={{ ...inputSx, mb: 1 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><LockOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} /></InputAdornment>,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" size="small">
                {showPassword ? <VisibilityOffOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <FormControlLabel
          control={<Checkbox name="remember" checked={loginData.remember} onChange={handleChange} size="small" sx={{ color: "#94A3B8", "&.Mui-checked": { color: "#2563EB" }, py: 0.25 }} />}
          label={<Typography sx={{ fontSize: "0.8rem", color: "#64748B" }}>Remember Me</Typography>}
        />
        <Link component="button" type="button" underline="hover" onClick={() => navigate("/forgot-password")}
          sx={{ color: "#2563EB", fontWeight: 600, fontSize: "0.8rem" }}>
          Forgot Password?
        </Link>
      </Box>

      <Button
        fullWidth
        type="submit"
        variant="contained"
        disableElevation
        disabled={loading}
        startIcon={!loading && <LoginIcon sx={{ fontSize: 18 }} />}
        sx={{ height: 42, borderRadius: 2, textTransform: "none", fontSize: "0.9rem", fontWeight: 700, bgcolor: "#2563EB", "&:hover": { bgcolor: "#1D4ED8" } }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : "Sign In"}
      </Button>

      <Divider sx={{ my: 2, borderColor: "#F1F5F9" }} />

      <Typography align="center" sx={{ color: "#64748B", fontSize: "0.82rem" }}>
        Don't have an account?{" "}
        <Link component="button" type="button" underline="hover" onClick={() => navigate("/register")}
          sx={{ color: "#2563EB", fontWeight: 700, fontSize: "0.82rem" }}>
          Register
        </Link>
      </Typography>
    </Box>
  );
}

export default LoginForm;
