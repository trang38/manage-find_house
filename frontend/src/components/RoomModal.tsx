import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from '../utils/cookies';
import { House } from './interface_type';

interface Room {
  id?: number;
  room_name: string;
  room_type?: string;
  house: number | House;
  price?: number;
  deposit?: number;
  electric?: number;
  water?: string;
  service_price?: number;
  area?: number;
  amenities?: string;
  description?: string;
  status?: string;
  is_posted?: boolean;
  updated_at?:string;
  post_id?: number;
}
interface MediaItem {
  id: number;
  file: string;
  type: 'image' | 'video';
}

interface Props {
  room: Room | null;
  // house: any;
  house: House;
  onClose: () => void;
}

const csrftoken = getCSRFToken();

const RoomModal: React.FC<Props> = ({ room, house, onClose }) => {
  // const isEdit = !!room?.id;
  // const [form, setForm] = useState<Room>({ ...room });
  const isEdit = !!room?.id;

  // const [form, setForm] = useState<Room>(() => room ? { ...room } : {
  //   id: 0,
  //   room_name: '',
  //   status: 'available',
  //   room_type: '',
  //   house: house.id,
  // });
  const [form, setForm] = useState<Room>(() => room ? {
    ...room,
    house: typeof room.house === 'object' ? room.house.id : room.house
  } : {
    id: 0,
    room_name: '',
    status: 'available',
    room_type: '',
    house: house.id,
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'service_price' ? Number(value) : value, }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
      // const files = Array.from(e.target.files);
      // const filteredFiles = files.filter(file =>
      //   file.type.startsWith('image/') || file.type.startsWith('video/')
      // );
      // setMediaFiles(filteredFiles);
    }
  };
  const handleMediaDelete = async (id: number) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/room-media/${id}/`, {
      withCredentials: true,
      headers: { 'X-CSRFToken': csrftoken || '' }
    });
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
  };
  const handleSubmit = async () => {
    try {
      console.log(room);
      console.log(form.house);
      const res = isEdit
        ? await axios.put(`${process.env.REACT_APP_API_URL}/api/rooms/${room.id}/`, form,
          {
            withCredentials: true,
            headers: {
              'X-CSRFToken': csrftoken || '',
            }
          }
        )
        : await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms/`, form,
          {
            withCredentials: true,
            headers: {
              'X-CSRFToken': csrftoken || '',
            }
          }
        );

      const roomId = isEdit ? room.id : res.data.id;

      if (mediaFiles.length > 0) {
        const mediaForm = new FormData();
        mediaFiles.forEach((file) => mediaForm.append('file', file));
        mediaForm.append('room', String(roomId));

        for (const file of mediaFiles) {
          const singleForm = new FormData();
          singleForm.append('file', file);
          singleForm.append('room', String(roomId));
          await axios.post(`${process.env.REACT_APP_API_URL}/api/room-media/`, singleForm,
            {
              withCredentials: true,
              headers: {
                'X-CSRFToken': csrftoken || '',
              }
            }
          );
        }
      }

      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (room?.id && window.confirm('Xoá phòng này?')) {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/rooms/${room.id}/`,
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        }
      );
      onClose();
    }
  };

  // const handleCopy = async () => {
  //   const copyForm = { ...form };
  //   delete copyForm.id;
  //   copyForm.room_name += '_copy';
  //   await axios.post(`${process.env.REACT_APP_API_URL}/api/rooms/`, copyForm,
  //     {
  //       withCredentials: true,
  //       headers: {
  //         'X-CSRFToken': csrftoken || '',
  //       }
  //     }
  //   );
  //   onClose();
  // };

  const handlePost = async () => {
    if (room?.id && (room?.status === 'available' || room?.status === 'checkout_soon')) {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/posts/`,
        {
          room: room?.id,
          title: postTitle || `Cho thuê ${room?.room_type}`
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        }
      );
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/rooms/${room.id}/`, {
        is_posted: true,
      }, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      });
      setShowPostModal(false);
      onClose();
    }
  };
  // const handleDeleteMedia = async (mediaId: number) => {
  //   try {
  //     await axios.delete(`${process.env.REACT_APP_API_URL}/api/room-media/${mediaId}/`, {
  //       withCredentials: true,
  //       headers: {
  //         'X-CSRFToken': csrftoken || '',
  //       },
  //     });
  //     setExistingMedia(prev => prev.filter(media => media.id !== mediaId));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  useEffect(() => {
    const fetchMedia = async () => {
      if (room?.id) {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/room-media/?room=${room.id}`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        });
        setExistingMedia(res.data);
      }
    };
    fetchMedia();
  }, [room?.id]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 w-full max-w-2xl rounded relative  max-h-[calc(100vh-6.8rem)] overflow-auto mt-[2.8rem]">
        <button onClick={onClose} className="absolute top-2 right-2 text-xl">×</button>
        <h3 className="text-xl font-bold text-[#228B22]">{isEdit ? 'Cập nhật phòng' : 'Thêm phòng'}</h3>
        <p className=' mb-4 text-[0.8rem] text-gray-300'>Cập nhật: {room?.updated_at?.split('T')[0]} {room?.updated_at?.split('T')[1].slice(0,5)}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className='text-[#006400]'>Tên phòng:</p>
            <input name="room_name" value={form.room_name} onChange={handleChange} placeholder="Tên phòng" className="border p-2 w-full" />
          </div>
          <div>
            <p className='text-[#006400]'>Loại phòng:</p>
            <select
              name="room_type"
              value={form.room_type || ''}
              onChange={handleChange}
              className="border p-2 w-full"
            >
              <option value="">Chọn loại phòng</option>
              <option value="1">Phòng trọ</option>
              <option value="2">Homestay</option>
              <option value="3">Nhà nguyên căn</option>
              <option value="4">Studio</option>
              <option value="5">Chung cư mini</option>
            </select>
          </div>
          <div>
            <p className='text-[#006400]'>Giá phòng:</p>
            <input name="price" value={form.price || ''} onChange={handleChange} placeholder="Giá" type="number" className="border p-2 w-full" />
          </div>
          <div>
            <p className='text-[#006400]'>Đặt cọc:</p>
            <input name="deposit" value={form.deposit || ''} onChange={handleChange} placeholder="Tiền cọc" type="number" className="border p-2 w-full" />
          </div>
          <div>
            <p className='text-[#006400]'>Tiền điện (vnđ/số):</p>
            <input name="electric" value={form.electric || ''} onChange={handleChange} placeholder="Điện" type="number" className="border p-2 w-full" />
          </div>
          <div>
            <p className='text-[#006400]'>Tiền nước:</p>
            <input name="water" value={form.water || ''} onChange={handleChange} placeholder="Nước" className="border p-2 w-full" />
          </div>
          <div>
            <p className='text-[#006400]'>Tiền dịch vụ:</p>
            <input name="service_price" value={form.service_price || ''} onChange={handleChange} placeholder="Phí dịch vụ" type="number" className="border p-2 w-full" />
          </div>
          <div>
            <p className='text-[#006400]'>Diện tích:</p>
            <input name="area" value={form.area || ''} onChange={handleChange} placeholder="Diện tích" type="number" className="border p-2 w-full" />
          </div>
          <div>
            <p className='text-[#006400]'>Tiện nghi:</p>
            <input name="amenities" value={form.amenities || ''} onChange={handleChange} placeholder="Tiện ích" className="border p-2 w-full" />
          </div>
          <div></div>

            <p className='text-[#006400]'>Mô tả:</p>
            <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Mô tả" className="border p-2 col-span-2 h-[12rem]" />

          <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="col-span-2 border p-2 w-full" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {existingMedia.map((media) => (
            <div key={media.id} className="relative">
              {media.file.endsWith('.mp4') ? (
                <video src={media.file} controls className="w-full h-auto" />
              ) : (
                <img src={media.file} alt="media" className="w-full h-auto" />
              )}
              <button
                onClick={() => handleMediaDelete(media.id)}
                className="absolute top-1 right-1  w-[1rem] h-[1rem]"
              >
                <img src={process.env.PUBLIC_URL+'/icons8-delete-40.png'} alt="xóa" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="space-x-2">
            {isEdit && <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded">Xoá</button>}
            {/* {isEdit && <button onClick={handleCopy} className="bg-gray-400 text-white px-3 py-1 rounded">Copy</button>} */}
            {/* {isEdit && (room.status === 'available' || room.status === 'checkout_soon') && (
              <button onClick={handlePost} className="bg-blue-500 text-white px-3 py-1 rounded">Đăng phòng</button>
            )} */}
            {isEdit && room?.is_posted ? (
              <a
                href={`/posts/${room.post_id}`}
                className="bg-gray-400 text-white px-3 py-1 rounded"
                target="_blank"
              >
                Xem bài đăng
              </a>
            ) : (
              isEdit && (room?.status === 'available' || room?.status === 'checkout_soon') && (
                <button onClick={() => setShowPostModal(true)} className="bg-blue-500 text-white px-3 py-1 rounded">
                  Đăng phòng
                </button>
              )
            )}
          </div>
          <button onClick={handleSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
            {isEdit ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
        {showPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 w-full max-w-md rounded relative">
              <button onClick={() => setShowPostModal(false)} className="absolute top-2 right-2 text-xl">×</button>
              <h3 className="text-xl font-bold mb-4">Nhập tiêu đề bài đăng</h3>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Tiêu đề"
                className="border p-2 w-full mb-4"
              />
              <button
                onClick={handlePost}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={!postTitle.trim()}
              >
                Đăng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomModal;
