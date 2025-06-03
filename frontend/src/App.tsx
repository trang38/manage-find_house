import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
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
      {/* <Routes>
        <Route path="/" element={<Initializer />}>
          <Route index element={<Navigate to="/app" />} />
          <Route path="auth" element={<PublicOnlyRoute />}>
            <Route index element={<Navigate to="/auth/login" />} />
            <Route path="login" element={<LoginForm />} />
            <Route path="signup" element={<SignupForm />} />
          </Route>
          <Route path="app" element={<PrivateRoute />}>
            <Route index element={<CrudBody />} />
          </Route>
        </Route>
      </Routes> */}
      <Header />
      <Routes>
          <Route index element={<Navigate to="/app" />} />
          <Route path="auth" element={<PublicOnlyRoute />}>
            {/* <Route index element={<Navigate to="/auth/login" />} /> */}
            <Route path="login" element={<LoginForm />} />
            <Route path="signup" element={<SignupForm />} />
          </Route>
          {/* <Route path="app" element={<PrivateRoute />}> */}
            <Route index element={<CrudBody />} />
            <Route path="app" element={<HomePage />} />
            <Route path="profile/me" element={<CurrentUserProfile />} />
            <Route path="manage-house" element={<ManageHouse />} />
            <Route path="houses/:id/rooms" element={<RoomsInHouse />} />
          {/* </Route> */}
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
