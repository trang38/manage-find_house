import LogoutButton from "../components/LogoutButton";

// export default function Infor() {
//     return (
//         <div className="flex items-center mt-[30px] text-center flex-col">
//             <p className="w-fit self-center m-auto">Thông tin</p>
//             <div className="mt-[5rem]"><LogoutButton /></div>
//         </div>
//     )
// }
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from "../utils/cookies";

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
  bank_branch?: string;
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
const csrftoken = getCSRFToken();
const CurrentUserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Infor>>({});

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/users/me/`,{
        withCredentials: true
      })
      .then(res => {
        console.log("User data:", res.data);
        setUser(res.data);
        setFormData(res.data.infor); // preload form
      })
      .catch(err => {
        console.error('Error fetching user', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleToggle = (field:  'show_bio' | 'show_phone_number' | 'show_address') => {
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
    e.preventDefault();
    const data = new FormData();
    (Object.keys(formData) as (keyof Infor)[]).forEach((key) => {
        const value = formData[key];
        if (value !== null && value !== undefined) {
            if (value instanceof File || typeof value === 'string') {
                data.append(key, value);
              }
        }
      });
    axios.put(`${process.env.REACT_APP_API_URL}/api/users/me/`, data, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': csrftoken || '',
          },
    })
      .then(res => {
        setUser(prev => prev ? { ...prev, infor: res.data } : null);
        setEditing(false);
      })
      .catch(err => {
        console.error('Error updating user', err);
      });
  };

//   if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  const { infor } = user;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thông tin</h1>
      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <img src={infor.image instanceof File ? URL.createObjectURL(infor.image) : infor.image || 'default.jpg'} alt="{user.username}" className="w-32 h-32 rounded-full object-cover" />
                <div>
                    <label>Thay đổi:</label>
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
            <label>Tên đầy đủ</label>
            <input type="text" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="tenant">Người thuê</option>
              <option value="landlord">Chủ trọ</option>
            </select>
          </div>
          <div>
            <div className="flex flex-row gap-[10px]">
                <label>Tiểu sử</label>
                <button type="button" onClick={() => handleToggle('show_bio')} className="ml-2 text-sm">
                    {formData.show_bio ? '👁 Hiện' : '🚫 Ẩn'}
                </button>
            </div>
            <textarea name="bio" value={formData.bio || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <div className="flex flex-row gap-[10px]">
                <label>Số điện thoại</label>
                <button type="button" onClick={() => handleToggle('show_phone_number')} className="ml-2 text-sm">
                {formData.show_phone_number ? '👁 Hiện' : '🚫 Ẩn'}
                </button>
            </div>
            <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <div className="flex flex-row gap-[10px]">
                <label>Địa chỉ chi tiết</label>
                <button type="button" onClick={() => handleToggle('show_address')} className="ml-2 text-sm">
                    {formData.show_address ? '👁 Hiện' : '🚫 Ẩn'}
                </button>
            </div>
            <input type="text" name="address_detail" value={formData.address_detail || ''} onChange={handleChange} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label></label>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Lưu lại</button>
          <button type="button" onClick={() => setEditing(false)} className="ml-2 text-gray-600">Hủy</button>
        </form>
        
      ) : (
        <div className="space-y-2">
          <img src={infor.image instanceof File ? URL.createObjectURL(infor.image) : infor.image || 'default.jpg'} alt="{user.username}" className="w-32 h-32 rounded-full object-cover" />
          <p><strong>Tên đăng nhập:</strong> {user.username}</p>
          <p><strong>Emaill:</strong> {user.email}</p>
          <p><strong>Tên đầy đủ:</strong> {infor.full_name}</p>
          <strong>Tiểu sử:</strong>{infor.bio && <p>{infor.bio}</p>}
          <strong>Số điện thoại:</strong>{infor.phone_number && <p>{infor.phone_number}</p>}
          <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Chỉnh sửa</button>
        </div>
      )}
    </div>
  );
};

export default CurrentUserProfile;
