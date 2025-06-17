import LogoutButton from "../components/LogoutButton";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from "../utils/cookies";
import { Bank, City, District, getBankName, Infor, User, Ward } from "../components/interface_type";


type ToggleField = 'show_bio' | 'show_phone_number' | 'show_address';
const csrftoken = getCSRFToken();

const CurrentUserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Infor>>({});

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);

  const [banks, setBanks] = useState<Bank[]>([]);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, {
      withCredentials: true
    })
      .then(res => {
        console.log("User data:", res.data);
        setUser(res.data);
        setFormData(res.data.infor); // preload form

        setSelectedCityId(res.data.infor.city ?? null);
        setSelectedDistrictId(res.data.infor.district ?? null);
        setSelectedWardId(res.data.infor.ward.id ?? null);

      })
      .catch(err => {
        console.error('Error fetching user', err);
      })
      .finally(() => setLoading(false));
    axios.get('https://api.vietqr.io/v2/banks').then(res => setBanks(res.data.data));
  }, []);

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
    if (user && selectedCityId !== user.infor.city) {
      setSelectedDistrictId(null);
      setSelectedWardId(null);
    }
  }, [selectedCityId]);

  console.log('selectedDistrictId', selectedDistrictId);
  useEffect(() => {
    if (editing) {
      // Khi đang chỉnh sửa, theo selectedDistrictId
      if (selectedDistrictId) {
        console.log('selectedDistrictId', selectedDistrictId);
        axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${selectedDistrictId}`)
          .then((res) => {
            console.log('wards:', res.data.wards);
            setWards(res.data.wards);
          })
          .catch((err) => console.error('Error fetching wards:', err));
      }
    } else {
      // Khi không chỉnh sửa, dùng user.infor.district
      if (user?.infor?.district) {
        axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${user.infor.district}`)
          .then((res) => {
            console.log('wards:', res.data.wards);
            setWards(res.data.wards);
          })
          .catch((err) => console.error('Error fetching wards:', err));
      }
    }

    if (user && selectedDistrictId !== user.infor.district) {
      setSelectedWardId(null);
    }
  }, [selectedDistrictId, editing, user?.infor?.district]);


  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const cityId = parseInt(e.target.value, 10);
    console.log('cityId', cityId);
    setSelectedCityId(cityId);
    setFormData((prev) => ({ ...prev, city: cityId }));

  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const districtId = parseInt(e.target.value, 10);
    setSelectedDistrictId(districtId);
    setFormData((prev) => ({ ...prev, district: districtId }));

  };

  const handleWardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const wardId = parseInt(e.target.value, 10);
    setSelectedWardId(wardId);
    setFormData((prev) => ({ ...prev, ward: wardId }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleToggle = (field: ToggleField) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    if (!selectedCityId || !selectedDistrictId || !selectedWardId) {
      alert("Vui lòng chọn đầy đủ Thành phố, Quận/Huyện, Phường/Xã!");
      return;
    }
    e.preventDefault();
    const data = new FormData();

    (Object.keys(formData) as (keyof Infor)[]).forEach((key) => {
      const value = formData[key];
      if (
        ['image', 'id_front_image', 'id_back_image'].includes(key) &&
        typeof value === 'string'
      ) {
        return;
      }
    if (key === 'ward') {
      let wardValue = value;
      if (typeof wardValue === 'string') wardValue = parseInt(wardValue, 10);
      if (
        typeof wardValue === 'object' &&
        wardValue !== null &&
        'id' in wardValue
      ) {
        wardValue = (wardValue as Ward).id;
      }
      if (wardValue !== null && wardValue !== undefined) {
          data.append(key, wardValue.toString());
      }
      return;
    }
      if (value !== null && value !== undefined) {
        if (value instanceof File) {
          data.append(key, value);
        } else if (typeof value === 'boolean') {
          data.append(key, value ? 'true' : 'false');
        } else {
          data.append(key, value.toString());
        }
      }
    });
    console.log('Submitting formData:', formData);
    axios.put(`${process.env.REACT_APP_API_URL}/api/profile/me/`, data, {
      withCredentials: true,
      headers: {
        // 'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrftoken || '',
      },
    })
      .then(res => {
        setUser(prev => prev ? { ...prev, infor: res.data } : null);
        setEditing(false);
        window.location.reload();
      })
      .catch(err => {
        console.error('Error updating user', err);
      });
  };


  //   if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  const { infor } = user;

  return (
    <div className="mx-auto px-[6rem] min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem]">
      <div className="flex items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-[#006400]">Thông tin</h1>
      </div>
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <img src={infor.image instanceof File ? URL.createObjectURL(infor.image) : infor.image || 'default.jpg'} alt="{user.username}" className="w-32 h-32 rounded-full object-cover" />
            <div>
              <label className="text-[#006400] font-bold">Thay đổi:</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="text-[#006400] font-bold">Tên đầy đủ:</label>
            <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-[#006400] font-bold">Loại tài khoản:</label>
            <select name="role" value={formData.role || ''} onChange={handleChange}>
              <option value="tenant">Người thuê</option>
              <option value="landlord">Chủ trọ</option>
            </select>
          </div>
          <div>
            <div className="flex flex-row gap-[10px]">
              <label className="text-[#006400] font-bold">Tiểu sử:</label>
              <button type="button" onClick={() => handleToggle('show_bio')} className="ml-2 text-sm">
                {formData.show_bio ? '👁 Hiện' : '🚫 Ẩn'}
              </button>
            </div>
            <textarea name="bio" value={formData.bio || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <div className="flex flex-row gap-[10px]">
              <label className="text-[#006400] font-bold">Số điện thoại:</label>
              <button type="button" onClick={() => handleToggle('show_phone_number')} className="ml-2 text-sm">
                {formData.show_phone_number ? '👁 Hiện' : '🚫 Ẩn'}
              </button>
            </div>
            <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <div className="flex flex-row gap-[10px]">
              <label className="text-[#006400] font-bold">Địa chỉ:</label>
              <button type="button" onClick={() => handleToggle('show_address')} className="ml-2 text-sm">
                {formData.show_address ? '👁 Hiện' : '🚫 Ẩn'}
              </button>
            </div>
            <div>
              <div>
                <label htmlFor="">Thành phố:</label>
                <select value={selectedCityId ?? ''} onChange={handleCityChange}>
                  <option value="">Chọn thành phố</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Quận / huyện:</label>
                <select value={selectedDistrictId || ''} onChange={handleDistrictChange}>
                  <option value="">Chọn quận/huyện</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Phường / Xã:</label>
                <select value={selectedWardId || ''} onChange={handleWardChange}>
                  <option value="">Chọn phường/xã</option>
                  {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
            </div>

            <label>Địa chỉ chi tiết:</label>
            <input type="text" name="address_detail" value={formData.address_detail || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>

          <div>
            <label className="text-[#006400] font-bold">Số Căn Cước Công Dân:</label>
            <input type="text" name="national_id" value={formData.national_id || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-[#006400] font-bold">Ngày cấp:</label>
            <input type="date" name="national_id_date" value={formData.national_id_date || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-[#006400] font-bold">Nơi cấp:</label>
            <input type="text" name="national_id_address" value={formData.national_id_address || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-[#006400] font-bold">Ảnh mặt trước căn cước công dân:</label>
            <img src={infor.id_front_image instanceof File ? URL.createObjectURL(infor.id_front_image) : infor.id_front_image || process.env.PUBLIC_URL + '/no-photo.jpg'} alt="mặt trước cccd" className="w-[20rem] aspect-video object-cover" />
            <div>
              <label className="text-[#006400] font-bold">Thay đổi:</label>
              <input
                type="file"
                name="id_front_image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="text-[#006400] font-bold">Ảnh mặt sau căn cước công dân:</label>
            <img src={infor.id_back_image instanceof File ? URL.createObjectURL(infor.id_back_image) : infor.id_back_image || process.env.PUBLIC_URL + '/no-photo.jpg'} alt="mặt sau cccd" className="w-[20rem] aspect-video object-cover" />
            <div>
              <label className="text-[#006400] font-bold">Thay đổi:</label>
              <input
                type="file"
                name="id_back_image"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border p-2 rounded"
              />
            </div>
          </div>
          <div>
            <label className="text-[#006400] font-bold">Số tài khoản ngân hàng:</label>
            <input type="text" name="bank_account" value={formData.bank_account || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-[#006400] font-bold">Tên tài khoản ngân hàng:</label>
            <input type="text" name="bank_account_name" value={formData.bank_account_name || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="text-[#006400] font-bold">Tên ngân hàng:</label>
            {/* <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} className="w-full border p-2 rounded" /> */}
            <select
              className=""
              name='bank_name'
              value={formData.bank_name || ''}
              onChange={handleChange}
            >
              <option value="">Chọn ngân hàng</option>
              {banks.map(bank => (
                <option key={bank.bin} value={bank.bin}>{bank.name} - {bank.short_name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
            <button type="submit" className="bg-[#00b14f] text-white px-4 py-2 rounded">Lưu lại</button>
            <button type="button" onClick={() => setEditing(false)} className="ml-[1rem] text-gray-600">Hủy</button>
          </div>
        </form>

      ) : (
        <div className="space-y-2 mt-[1rem]">
          <div className="flex items-center justify-center mb-[1rem]">
            <img src={infor.image instanceof File ? URL.createObjectURL(infor.image) : infor.image || 'default.jpg'} alt="{user.username}" className="w-32 h-32 rounded-full object-cover" />
          </div>
          <p><strong className="text-[#006400] font-bold">Tên đăng nhập:  </strong> {user.username}</p>
          <p><strong className="text-[#006400] font-bold">Emaill:  </strong> {user.email}</p>
          <p><strong className="text-[#006400] font-bold">Tên đầy đủ:  </strong> {infor.full_name}</p>
          <p><strong className="text-[#006400] font-bold">Tiểu sử:  </strong>{infor.bio && `${infor.bio}`}</p>
          <p><strong className="text-[#006400] font-bold">Số điện thoại:  </strong>{infor.phone_number && `${infor.phone_number}`}</p>
          <p><strong className="text-[#006400] font-bold">Địa chỉ:  </strong> {infor.ward && typeof infor.ward === 'object' && `${infor.address_detail}, ${infor.ward.path_with_type}`}</p>
          <p><strong className="text-[#006400] font-bold">Số Căn Cước Công Dân:  </strong>{infor.national_id && `${infor.national_id}`}</p>
          <p><strong className="text-[#006400] font-bold">Nơi cấp:  </strong>{infor.national_id_address && `${infor.national_id_address}`}</p>
          <p><strong className="text-[#006400] font-bold">Ngày cấp:  </strong>{infor.national_id_date && `${infor.national_id_date}`}</p>
          <p><strong className="text-[#006400] font-bold">Ảnh mặt trước:</strong>
            {infor.id_front_image ? (
              <img src={infor.id_front_image instanceof File ? URL.createObjectURL(infor.id_front_image) : infor.id_front_image} className="h-[12rem] w-[16rem] object-cover mt-[0.5rem]" />
            ) : (
              <img src={process.env.PUBLIC_URL + "/no-photo.jpg"} className="h-[12rem] w-[16rem] object-cover mt-[0.5rem]" />
            )}
          </p>
          <p><strong className="text-[#006400] font-bold">Ảnh mặt sau:</strong>
            {infor.id_back_image ? (
              <img src={infor.id_back_image instanceof File ? URL.createObjectURL(infor.id_back_image) : infor.id_back_image} className="h-[12rem] w-[16rem] object-cover mt-[0.5rem]" />
            ) : (
              <img src={process.env.PUBLIC_URL + "/no-photo.jpg"} className="h-[12rem] w-[16rem] object-cover mt-[0.5rem]" />
            )}
          </p>
          <p><strong className="text-[#006400] font-bold">Số tài khoản ngân hàng:  </strong>{infor.bank_account && `${infor.bank_account}`}</p>
          <p><strong className="text-[#006400] font-bold">Tên tài khoản ngân hàng:  </strong>{infor.bank_account_name && `${infor.bank_account_name}`}</p>
          <p><strong className="text-[#006400] font-bold">Tên ngân hàng:  </strong>{getBankName(infor.bank_name ?? '', banks)}</p>
          <p><strong className="text-[#006400] font-bold">Loại tài khoản:  </strong>
            {infor.role === 'tenant' ? (
              <>Người thuê</>
            ) : (
              <>Chủ phòng</>
            )}
          </p>
          <div className="flex items-center justify-center">
            <button onClick={() => setEditing(true)} className="bg-[#00b14f] text-white px-4 py-2 rounded items-center !mt-[2rem] shadow-md hover:shadow-xl">Chỉnh sửa</button>
          </div>
        </div>
      )}
      <div className="!mt-[2rem] flex items-center justify-center"><LogoutButton /></div>
    </div>
  );
};

export default CurrentUserProfile;
