import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCSRFToken } from "../../utils/cookies";
import { City, District, House, Ward } from ".././interface_type";


interface HouseFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: House;
  mode: 'create' | 'edit';

}

const HouseForm: React.FC<HouseFormProps> = ({ onClose, onSuccess, initialData, mode }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [addressDetail, setAddressDetail] = useState(initialData?.address_detail || "");
  const [numFloors, setNumFloors] = useState(initialData?.num_floors || 1);
  const [roomsPerFloor, setRoomsPerFloor] = useState(initialData?.rooms_per_floor || 1);

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<number | null>(initialData?.city || null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(initialData?.district || null);
  const [selectedWardId, setSelectedWardId] = useState<number | null>(
    typeof initialData?.ward === 'object' && initialData.ward !== null && 'id' in initialData.ward
      ? (initialData.ward as Ward).id
      : (typeof initialData?.ward === 'number' ? initialData.ward : null)
  );

  console.log('initialData', initialData);
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
          setDistricts(res.data.districts);
          if (mode === 'edit' && initialData?.district && !selectedDistrictId) {
            setSelectedDistrictId(initialData.district);
          }
        })
        .catch((err) => console.error('Error fetching districts:', err));
    } else {
      setDistricts([]);
      setSelectedDistrictId(null);
      setSelectedWardId(null);
    }

  }, [selectedCityId]);

  useEffect(() => {
    if (selectedDistrictId) {
      console.log('selectedDistrictId', selectedDistrictId);
      axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${selectedDistrictId}`)
        .then((res) => {
          console.log('wards:', res.data.wards);
          setWards(res.data.wards)
          if (mode === 'edit' && initialData?.ward && !selectedWardId) {
            if (typeof initialData.ward === 'object' && initialData.ward !== null && 'id' in initialData.ward) {
              setSelectedWardId((initialData.ward as Ward).id);
            } else if (typeof initialData.ward === 'number') {
              setSelectedWardId(initialData.ward);
            }
          }
        })
        .catch((err) => console.error('Error fetching wards:', err));
    } else {
      setWards([]);
      setSelectedWardId(null);
    }

  }, [selectedDistrictId]);

  const csrftoken = getCSRFToken();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedCityId || !selectedDistrictId || !selectedWardId) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    try {
      const payload = {
        name,
        address_detail: addressDetail,
        num_floors: numFloors,
        rooms_per_floor: roomsPerFloor,
        city: selectedCityId,
        district: selectedDistrictId,
        ward: selectedWardId,
      };
      if (mode === 'create') {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/houses/`, payload, {
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
          withCredentials: true,
        });
        alert("Tạo nhà trọ thành công!");
      } else {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/houses/${initialData?.id}/`, payload, {
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
          withCredentials: true,
        });
        alert("Cập nhật nhà trọ thành công!");
      }
      onClose();
      if (onSuccess) onSuccess();
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
        <button type="submit" className="bg-[#00b14f] text-white px-4 py-2 rounded">{mode === 'create' ? 'Gửi' : 'Cập nhật'}</button>
        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Hủy</button>
      </div>
    </form>
  );
};

export default HouseForm;