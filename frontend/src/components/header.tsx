import { Link, useLocation } from "react-router-dom";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";

import { useEffect, useState } from "react";
import axios from "axios";

type City = { id: number; name: string };
type District = { id: number; name: string };
type Ward = { id: number; name: string };

interface Infor {
  id: number;
  full_name: string;
  bio?: string;
  image: File | string;
  city?: City;
  district?: District;
  ward?: Ward;
  address_detail?: string;
  phone_number?: string;
  national_id?: string;
  national_id_date?: string;
  national_id_address?: string;
  id_front_image?: File | string;
  id_back_image?: File | string;
  bank_name?: string;
  bank_account?: string;
  bank_account_name?: string;
  show_bio: boolean;
  show_phone_number: boolean;
  show_address: boolean;
  role: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  infor: Infor;
}

export default function Header() {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log(authData);

  useEffect(() => {
    if (authData?.isAuthenticated) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/users/me/`, {
        withCredentials: true
      })
        .then(res => {
          console.log("User data:", res.data);
          setUser(res.data);
        })
        .catch(err => {
          console.error('Error fetching user', err);
        })
        .finally(() => setLoading(false));
    }
  }, [authData]);
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
              <Link to="/manage-house" className={(location.pathname === "/manage-house") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Quản lý phòng
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="flex flex-row gap-[1.5rem]">
              <Link to="" className={(location.pathname === "") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Lịch sử đặt phòng
              </Link>
              <Link to="" className={(location.pathname === "") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Hợp đồng
              </Link>
              <Link to="" className={(location.pathname === "") ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
                Hóa đơn
              </Link>
            </div>
          )}

        </div>
      </div>
      <div>
        {authLoading ? (
          <span>Loading...</span>
        ) : authData?.isAuthenticated ? (
          <div className="flex flex-row gap-[1.5rem] items-center">
            <Link to="" className={location.pathname === "" ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
              <img src={process.env.PUBLIC_URL + "/notification-bell.png"} className="w-[1.5rem] h-[1.5rem]" />
            </Link>
            <Link to="/profile/me" className={location.pathname === "/profile/me" ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
              <img src={process.env.PUBLIC_URL + "/messenger.png"} className="w-[1.5rem] h-[1.5rem]" />
            </Link>
            <Link to="/profile/me" className={location.pathname === "/profile/me" ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
              <img
                src={
                  user?.infor?.image instanceof File
                    ? URL.createObjectURL(user?.infor?.image)
                    : user?.infor?.image
                }
                alt={user?.username}
                className="w-[1.8rem] h-[1.8rem] rounded-full object-cover"
              />
            </Link>
          </div>
        ) : (
          <Link to="/auth/login" className={location.pathname === "/auth/login" ? 'text-[#00b14f] font-bold' : 'text-[#333] hover:underline'}>
            Login
          </Link>
        )}
      </div>
    </div>
  )
}
