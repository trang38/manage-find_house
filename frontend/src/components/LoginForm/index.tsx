import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { loginMutation } from "../../django-allauth/accounts/login";
import LoginWithSocialButton from "../LoginWithSocialButtton";


export default function LoginForm() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { mutate } = useMutation({
    mutationFn: loginMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authSession"] });
      setError("");
    },
    onError: (err: any) => {
    const errorData = JSON.parse(err.message);
    if (errorData && errorData.non_field_errors) {
      setError(errorData.non_field_errors.join(", "));
    } else {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  },
  });
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    mutate({ email, password });
  }
  return (
    <Container component="section" maxWidth="xs" className="mt-[7rem]">
      {error && <Alert severity="error">{error}</Alert>}
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Đăng nhập
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Địa chỉ email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Mật khẩu"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Lưu lại"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Đăng nhập
          </Button>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 7 }} component="div">
              {/* <Link href="#" variant="body2">
                Quên mật khẩu?
              </Link> */}
              <Link component={RouterLink} to="/auth/reset-password" variant="body2">
  Quên mật khẩu?
</Link>
            </Grid>
            <Grid size={{ xs: 6, md: 7 }} component="div">
              <Link component={RouterLink} to="/auth/signup" variant="body2">
                {"Chưa có tài khoản? Đăng ký"}
              </Link>
            </Grid>
          </Grid>
          <LoginWithSocialButton name="google" id="google" />
        </Box>
      </Box>
    </Container>
  );
}
