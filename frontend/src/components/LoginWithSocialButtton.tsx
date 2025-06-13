import { Button } from "@mui/material";
import { getCSRFToken } from "../utils/cookies";

interface LoginWithSocialButtonProps {
  name: string;
  id: string;
}

export default function LoginWithSocialButton({
  name,
  id,
}: LoginWithSocialButtonProps) {
  function handleClick() {
    const form = document.createElement("form");
    form.style.display = "none";
    form.method = "POST";
    form.action = `${process.env.REACT_APP_API_URL}/_allauth/browser/v1/auth/provider/redirect`;
    const data = {
      provider: id,
      callback_url: "http://localhost:3000", 
      csrfmiddlewaretoken: getCSRFToken() || "",
      process: "login",
      auth_params: JSON.stringify({
        prompt: "select_account", 
      })
    };

    Object.entries(data).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.name = k;
      input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  }
  return (
    <Button onClick={handleClick} variant="contained" fullWidth sx={{ mt: 3, mb: 2 }}>
      Đăng nhập / Đăng ký bằng  {name}
    </Button>
  );
}
