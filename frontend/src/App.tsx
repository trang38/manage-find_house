import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { useAuthSessionQuery } from "./django-allauth/sessions/hooks";
import CrudBody from "./components/CrudBody";
import LoginForm from "./components/LoginForm";
import PrivateRoute from "./components/PrivateRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import SignupForm from "./components/SignupForm";
import Header from "./components/header";
import HomePage from "./pages/home";
import CurrentUserProfile from "./pages/infor";
import Footer from "./components/footer";
import ManageHouse from "./pages/manage_house";
import RoomsInHouse from "./pages/rooms";
import PostDetail from "./pages/post_details";
import PublicUserProfile from "./pages/infor_public_user";
import ChatPage from "./pages/chat_page";
import BookingHistory from "./pages/booking_history";
import ContractList from "./pages/contract_list";
import ContractDetail from "./pages/contract_details";
import PaymentList from "./pages/payment_list";
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
