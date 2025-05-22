import { Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logoutMutation } from "../django-allauth/accounts/logout";

export default function LogoutButton() {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: logoutMutation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authSession"] });
      queryClient.clear();
      window.location.href = "/";
    },
  });
  return (
    <Button onClick={() => mutate()} variant="contained">
      Đăng xuất
    </Button>
  );
}
