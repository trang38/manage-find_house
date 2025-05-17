import { Navigate, Outlet } from "react-router";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";

export default function PrivateRoute() {
  const { data } = useAuthSessionQuery();

  if (data?.isAuthenticated) {
    return <Outlet />;
  }

  return <Navigate to="/auth/login" />;
}
