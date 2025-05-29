import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCSRFToken } from "../utils/cookies";

interface AddHouseFormProps {
  onClose: () => void;
}
type City = { id?: number; name: string };
type District = { id: number; name: string };
type Ward = { id: number; name: string };

const AddHouseForm: React.FC<AddHouseFormProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [numFloors, setNumFloors] = useState(1);
  const [roomsPerFloor, setRoomsPerFloor] = useState(1);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/address/cities`)
      .then((res) => setCities(res.data))
      .catch((err) => console.error('Error fetching cities:', err));
  }, []);

  useEffect(() => {
    if (selectedCityId) {
      console.log('selectedCityId', selectedCityId);
      axios.get(`${process.env.REACT_APP_API_URL}/api/address/city/${selectedCityId}`)
        .then((res) => {
          console.log('districts:', res.data.districts);
          setDistricts(res.data.districts)
        })
        .catch((err) => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
    }
    setSelectedDistrictId(null);
    setSelectedWardId(null);
  }, [selectedCityId]);

  useEffect(() => {
    if (selectedDistrictId) {
      console.log('selectedDistrictId', selectedDistrictId);
      axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${selectedDistrictId}`)
        .then((res) => {
          console.log('wards:', res.data.wards);
          setWards(res.data.wards)
        })
        .catch((err) => console.error('Error fetching wards:', err));
    } else {
      setWards([]);
    }
    setSelectedWardId(null);
  }, [selectedDistrictId]);
  
  const csrftoken = getCSRFToken();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/houses/`, {
        name: name,
        address_detail: addressDetail,
        num_floors: numFloors,
        rooms_per_floor: roomsPerFloor,
        city: selectedCityId,
        district: selectedDistrictId,
        ward: selectedWardId,
      }, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrftoken || '',
        },
        withCredentials: true,
      });
      alert("Tạo nhà trọ thành công!");
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi form:", error);
      alert("Đã xảy ra lỗi.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label>Tên nhà:</label>
        <input value={name} onChange={e => setName(e.target.value)} className="border p-1 w-full" />
      </div>
      <div>
        <label>Thành phố / Tỉnh:</label>
        <select value={selectedCityId ?? ''} onChange={e => setSelectedCityId(parseInt(e.target.value))} className="border p-1 w-full">
          <option value="">Chọn thành phố</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Quận / Huyện:</label>
        <select value={selectedDistrictId ?? ''} onChange={e => setSelectedDistrictId(parseInt(e.target.value))} className="border p-1 w-full">
          <option value="">Chọn quận/huyện</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Phường / Xã:</label>
        <select value={selectedWardId ?? ''} onChange={e => setSelectedWardId(parseInt(e.target.value))} className="border p-1 w-full">
          <option value="">Chọn phường/xã</option>
          {wards.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Địa chỉ chi tiết:</label>
        <input value={addressDetail} onChange={e => setAddressDetail(e.target.value)} className="border p-1 w-full" />
      </div>
      <div>
        <label>Số tầng:</label>
        <input type="number" value={numFloors} onChange={e => setNumFloors(parseInt(e.target.value))} className="border p-1 w-full" />
      </div>
      <div>
        <label>Số phòng mỗi tầng:</label>
        <input type="number" value={roomsPerFloor} onChange={e => setRoomsPerFloor(parseInt(e.target.value))} className="border p-1 w-full" />
      </div>
      <div className="italic text-gray-30 text-[10px]">***Lưu ý: để dễ dàng quản lý phòng trọ, bạn nên điền số tầng và số phòng mỗi tầng cần cho thuê, nếu cho thuê nhà nguyên căn thì nên để số tầng và số phòng là 1 còn số tầng và số phòng mỗi tầng thực tế nên miêu tả trong phần miêu tả của phòng.</div>
      <div className="flex gap-2">
        <button type="submit" className="bg-[#00b14f] text-white px-4 py-2 rounded">Gửi</button>
        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Hủy</button>
      </div>
    </form>
  );
};

export default AddHouseForm;