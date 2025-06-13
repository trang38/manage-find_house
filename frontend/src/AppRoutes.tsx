import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import LoginForm from "./components/LoginForm";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import SignupForm from "./components/SignupForm";
import CrudBody from "./components/CrudBody";
import HomePage from "./pages/home";
import CurrentUserProfile from "./pages/infor";
import PublicUserProfile from "./pages/infor_public_user";
import ManageHouse from "./pages/manage_house";
import RoomsInHouse from "./pages/rooms";
import PostDetail from "./pages/post_details";
import ChatPage from "./pages/chat_page";
import BookingHistory from "./pages/booking_history";
import ContractList from "./pages/contract_list";
import ContractDetail from "./pages/contract_details";
import PaymentList from "./pages/payment_list";


export default function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <Header />
      <Routes>
          <Route index element={<Navigate to="/app" />} />
          <Route path="auth" element={<PublicOnlyRoute />}>
            <Route path="login" element={<LoginForm />} />
            <Route path="signup" element={<SignupForm />} />
          </Route>
          {/* <Route path="app" element={<PrivateRoute />}> */}
            <Route index element={<CrudBody />} />
            <Route path="app" element={<HomePage />} />
            <Route path="profile/me" element={<CurrentUserProfile />} />
            <Route path="profile/users/:username" element={<PublicUserProfile />} />
            <Route path="manage-house" element={<ManageHouse />} />
            <Route path="houses/:id/rooms" element={<RoomsInHouse />} />
            <Route path="posts/:id" element={<PostDetail />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="/contracts" element={<ContractList />} />
            <Route path='contracts/:id' element={<ContractDetail />} />
            <Route path='/payments' element={<PaymentList />} />
          {/* </Route> */}
      </Routes>
      {!location.pathname.startsWith("/chat") && <Footer />}
    </>
  );
}