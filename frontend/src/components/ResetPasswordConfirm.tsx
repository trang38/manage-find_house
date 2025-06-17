import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { getCSRFToken } from "../utils/cookies";
import { toast } from "react-toastify";
  const csrfToken = getCSRFToken();
export default function ResetPasswordConfirm() {
  const { key } = useParams<{ key: string }>(); // lấy key từ URL
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

//     if (password1 !== password2) {
//       setError("Mật khẩu không khớp.");
//       return;
//     }
// if (!password1 || !password2 || !key) {
//   toast.error("Vui lòng nhập đầy đủ thông tin.");
//   return;
// }
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/_allauth/browser/v1/auth/password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFTOKEN": csrfToken || "",
          },
          credentials: "include",
          body: JSON.stringify({
        key,
        password,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(JSON.stringify(data));
      } else {
        setMessage("Đặt lại mật khẩu thành công. Hãy đăng nhập lại.");
      }
    } catch (err: any) {
      setError("Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" className="mt-[7rem]">
      <Typography variant="h5" align="center" gutterBottom>
        Đặt lại mật khẩu
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Mật khẩu mới"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {/* <TextField
          margin="normal"
          required
          fullWidth
          label="Nhập lại mật khẩu"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        /> */}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </Button>
      </Box>
    </Container>
  );
}