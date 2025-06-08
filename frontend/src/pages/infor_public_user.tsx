import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { City, District, User, Ward } from "../components/interface_type";

const PublicUserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/profile/users/${username}`, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
        console.log("User data:", res.data);
      })
      .catch((err) => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/address/cities`)
      .then((res) => setCities(res.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.infor?.city) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/address/city/${user.infor.city}`)
        .then((res) => setDistricts(res.data.districts))
        .catch(() => {});
    }
  }, [user?.infor?.city]);

  useEffect(() => {
    if (user?.infor?.district) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/address/district/${user.infor.district}`)
        .then((res) => setWards(res.data.wards))
        .catch(() => {});
    }
  }, [user?.infor?.district]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Không tìm thấy người dùng.</div>;

  const { infor } = user;
  const cityName = cities.find((city) => city.id === infor.city)?.name || "";
  const districtName = districts.find((d) => d.id === infor.district)?.name || "";
  const wardName = wards.find((w) => w.id === infor.ward)?.path_with_type || "";

  return (
    <div className="mx-auto px-[6rem] min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem]">
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-[#006400]">Thông tin người dùng</h1>
      </div>
      <div className="space-y-2 mt-[1rem]">
        <div className="flex items-center justify-center mb-[1rem]">
          <img
            src={
              typeof infor.image === "string"
                ? infor.image
                : infor.image instanceof File
                ? URL.createObjectURL(infor.image)
                : "default.jpg"
            }
            alt={user.username}
            className="w-32 h-32 rounded-full object-cover"
          />
        </div>
        <p>
          <strong className="text-[#006400] font-bold">Tên đăng nhập: </strong> {user.username}
        </p>
        <p>
          <strong className="text-[#006400] font-bold">Email: </strong> {user.email}
        </p>
        {infor.full_name && (
          <p>
            <strong className="text-[#006400] font-bold">Tên đầy đủ: </strong> {infor.full_name}
          </p>
        )}
        {infor.bio && (
          <p>
            <strong className="text-[#006400] font-bold">Tiểu sử: </strong> {infor.bio}
          </p>
        )}
        {infor.phone_number && (
          <p>
            <strong className="text-[#006400] font-bold">Số điện thoại: </strong> {infor.phone_number}
          </p>
        )}
        {infor.address_detail && (
          <p>
            <strong className="text-[#006400] font-bold">Địa chỉ: </strong>
            {infor.address_detail}, {wardName}, {districtName}, {cityName}
          </p>
        )}
        <p>
          <strong className="text-[#006400] font-bold">Loại tài khoản: </strong>
          {infor.role === "tenant" ? <>Người thuê</> : <>Chủ phòng</>}
        </p>
      </div>
    </div>
  );
};

export default PublicUserProfile;