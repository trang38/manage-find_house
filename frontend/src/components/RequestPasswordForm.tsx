import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { resetPassword } from "../django-allauth/resetPassword";

export default function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      setSuccessMessage("Email đặt lại mật khẩu đã được gửi!");
      setErrorMessage("");
    },
    onError: (error: any) => {
      setSuccessMessage("");
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(email);
  };

  return (
    <Container component="main" maxWidth="xs" className="mt-[7rem]">
      <Typography component="h1" variant="h5" textAlign="center" gutterBottom>
        Quên mật khẩu
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={mutation.isPending}
        >
          Gửi yêu cầu
        </Button>
      </Box>
    </Container>
  );
}