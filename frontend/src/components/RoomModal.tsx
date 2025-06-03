import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from '../utils/cookies';

interface Room {
  id?: number;
  room_name: string;
  room_type?: string;
  house: number;
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
  post_id?: number;
}
interface MediaItem {
  id: number;
  file: string;
  type: 'image' | 'video';
}

interface Props {
  room: Room | null;
  house: any;
  onClose: () => void;
}

const csrftoken = getCSRFToken();

const RoomModal: React.FC<Props> = ({ room, house, onClose }) => {
  // const isEdit = !!room?.id;
  // const [form, setForm] = useState<Room>({ ...room });
  const isEdit = !!room?.id;

  const [form, setForm] = useState<Room>(() => room ? { ...room } : {
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
    setForm((prev) => ({ ...prev, [name]: value }));
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
        { room: room?.id, 
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
        <h3 className="text-xl font-bold mb-4 text-[#228B22]">{isEdit ? 'Cập nhật phòng' : 'Thêm phòng'}</h3>

        <div className="grid grid-cols-2 gap-4">
          <input name="room_name" value={form.room_name} onChange={handleChange} placeholder="Tên phòng" className="border p-2" />
          <select
            name="room_type"
            value={form.room_type || ''}
            onChange={handleChange}
            className="border p-2"
          >
            <option value="">Chọn loại phòng</option>
            <option value="1">Phòng trọ</option>
            <option value="2">Homestay</option>
            <option value="3">Nhà nguyên căn</option>
            <option value="4">Studio</option>
            <option value="5">Chung cư mini</option>
          </select>

          <input name="price" value={form.price || ''} onChange={handleChange} placeholder="Giá" type="number" className="border p-2" />
          <input name="deposit" value={form.deposit || ''} onChange={handleChange} placeholder="Tiền cọc" type="number" className="border p-2" />
          <input name="electric" value={form.electric || ''} onChange={handleChange} placeholder="Điện" type="number" className="border p-2" />
          <input name="water" value={form.water || ''} onChange={handleChange} placeholder="Nước" className="border p-2" />
          <input name="service_price" value={form.service_price || ''} onChange={handleChange} placeholder="Phí dịch vụ" type="number" className="border p-2" />
          <input name="area" value={form.area || ''} onChange={handleChange} placeholder="Diện tích" type="number" className="border p-2" />
          <input name="amenities" value={form.amenities || ''} onChange={handleChange} placeholder="Tiện ích" className="border p-2" />
          <textarea name="description" value={form.description || ''} onChange={handleChange} placeholder="Mô tả" className="border p-2 col-span-2" />

          <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="col-span-2 border p-2" />
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
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                ×
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
