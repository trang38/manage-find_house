import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { useAuthSessionQuery } from "./django-allauth/sessions/hooks";
import AppRoutes from "./AppRoutes";

function Initializer() {
  const { isLoading } = useAuthSessionQuery();
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
