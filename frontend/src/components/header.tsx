import { Link, useLocation } from "react-router-dom";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";
import NotificationModal from './NotificationModal';

import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "./interface_type";



export default function Header() {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notiOpen, setNotiOpen] = useState(false);

  console.log(authData);

  const fetchUser = async () => {
    if (!authData?.isAuthenticated) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [authData, location.pathname, location.key]);

  const isAuthenticated = authData?.isAuthenticated;
  const isLandlord = user?.infor?.role === "landlord";
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] h-[4rem] bg-[#fff] text-[#333] flex  flex-row items-center justify-between px-[1.5rem] shadow-md">
      <div className="flex flex-row items-center">
        <div className="h-[2.5rem] rounded-xl overflow-hidden"><Link to={"/"}><img src={process.env.PUBLIC_URL + "/logo2.png"} alt="" className="h-full" /></Link></div>
        <div className="flex flex-row gap-[1.5rem] ml-[15px]">
          <Link to={"/app"} className={(location.pathname === "/app") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>Trang chủ</Link>

          {isLandlord && (
            <div className="flex flex-row gap-[1.5rem]">
              <Link to="/manage-house" className={(location.pathname.startsWith("/manage-house") || location.pathname.startsWith("/houses")) ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Quản lý phòng
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="flex flex-row gap-[1.5rem]">
              <Link to="/bookings" className={(location.pathname === "/bookings") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Lịch sử đặt phòng
              </Link>
              <Link to="/contracts" className={(location.pathname === "/contracts") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Hợp đồng
              </Link>
              <Link to="/payments" className={(location.pathname === "/payments") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Hóa đơn
              </Link>
            </div>
          )}

        </div>
      </div>
      <div>
        {(authLoading || loading) ? (
          <span>Loading...</span>
        ) : authData?.isAuthenticated ? (
          <div className="flex flex-row gap-[1.5rem] items-center">
            <button onClick={() => setNotiOpen(true)} className="relative">
              <img src={process.env.PUBLIC_URL + "/notification-bell.png"} className="w-[1.5rem] h-[1.5rem]" />
            </button>
            <Link to="/chat" className={(location.pathname === "/chat") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
              <img src={process.env.PUBLIC_URL + "/messenger.png"} className="w-[1.5rem] h-[1.5rem]" />
            </Link>
            <Link to="/profile/me" className={(location.pathname === "/profile/me") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
              <img src={user?.infor?.image instanceof File ? URL.createObjectURL(user?.infor?.image) : user?.infor?.image} alt={user?.username} className="w-[1.8rem] h-[1.8rem] rounded-full object-cover" />
            </Link>
            <NotificationModal open={notiOpen} onClose={() => setNotiOpen(false)} />
          </div>
        ) : (
          <Link to="/auth/login" className={(location.pathname === "/auth/login") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>Login</Link>
        )}
      </div>
    </div>
  )
}
