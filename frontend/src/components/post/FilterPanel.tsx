import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  onFilter: (filters: Record<string, string | number>) => void;
}

const FilterPanel: React.FC<Props> = ({ onFilter }) => {
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [filters, setFilters] = useState<Record<string, string | number>>({});

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/address/cities`).then((res) => setCities(res.data));
  }, []);

  useEffect(() => {
    if (filters.city) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/address/city/${filters.city}`).then((res) => setDistricts(res.data.districts || []));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [filters.city]);

  useEffect(() => {
    if (filters.district) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${filters.district}`).then((res) => setWards(res.data.wards || []));
    } else {
      setWards([]);
    }
  }, [filters.district]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onFilter(filters);
  };

  return (
    <div className="flex flex-col gap-[1rem] max-xl:flex-row max-xl:flex-wrap">
      <select name="city" onChange={handleChange} className="border p-2 rounded">
        <option value="">Chọn tỉnh/thành</option>
        {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select name="district" onChange={handleChange} className="border p-2 rounded">
        <option value="">Chọn quận/huyện</option>
        {districts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <select name="ward" onChange={handleChange} className="border p-2 rounded">
        <option value="">Chọn phường/xã</option>
        {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
      </select>

      <select name="room_type" onChange={handleChange} className="border p-2 rounded">
        <option value="">Loại phòng</option>
        <option value="1">Phòng trọ</option>
        <option value="2">Homestay</option>
        <option value="3">Nhà nguyên căn</option>
        <option value="4">Studio</option>
        <option value="5">Chung cư mini</option>
      </select>
      <input name="price" placeholder="Giá tối đa (VND)" onChange={handleChange} className="border p-2 rounded" />
      <input name="area" placeholder="Diện tích tối thiểu (m2)" onChange={handleChange} className="border p-2 rounded" />
      <button onClick={applyFilters} className="bg-green-600 text-white px-4 py-2 rounded col-span-full md:col-span-1">Lọc</button>
    </div>
  );
};

export default FilterPanel;