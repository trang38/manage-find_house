import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from '../../utils/cookies';
import { BOOK_STATUS_TYPE_CSS_MAP, BOOK_STATUS_TYPE_MAP, Booking, Contract, CONTRACT_STATUS_TYPE_CSS_MAP, CONTRACT_STATUS_TYPE_MAP, House, MediaItem, Rating, Room, User } from '.././interface_type';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthSessionQuery } from '../../django-allauth/sessions/hooks';



interface Props {
  room: Room | null;
  // house: any;
  house: House;
  onClose: () => void;
}

const csrftoken = getCSRFToken();

const RoomModal: React.FC<Props> = ({ room, house, onClose }) => {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const isAuthenticated = authData?.isAuthenticated;
  const navigate = useNavigate();
  const isEdit = !!room?.id;
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
  const [roomBookings, setRoomBookings] = useState<Booking[]>([]);
  const [roomContracts, setRoomContracts] = useState<Contract[]>([]);
  const [roomRatings, setRoomRatings] = useState<Rating[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'service_price' ? Number(value) : value, }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMediaFiles(Array.from(e.target.files));
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
      alert(err);
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

  const fetchRoomRelated = async () => {
    if (room?.id) {
      try {
        //RoomMedia
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/room-media/?room=${room.id}`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        });
        setExistingMedia(res.data);
        // Bookings
        const bookingsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/?room=${room.id}&status=pending`, {
          withCredentials: true,
          headers: { 'X-CSRFToken': csrftoken || '' }
        });
        setRoomBookings(bookingsRes.data);

        // Contracts
        const contractsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/contracts/?room=${room.id}`, {
          withCredentials: true,
          headers: { 'X-CSRFToken': csrftoken || '' }
        });
        setRoomContracts(contractsRes.data);

        // Ratings (reviews)
        if (room.ratings) {
          setRoomRatings(room.ratings);
        } else {
          setRoomRatings([]);
        }
      } catch (err) {
        setRoomBookings([]);
        setRoomContracts([]);
        setRoomRatings([]);
        setExistingMedia([]);
      }
    }
  };
  useEffect(() => {
    fetchRoomRelated();
  }, [room?.id]);

  const handleBookingAction = async (bookingId: number, action: 'accept' | 'decline' | 'cancel') => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}/${action}/`,
        {},
        {
          withCredentials: true,
          headers: { 'X-CSRFToken': csrftoken || '' },
        }
      );
      // Refetch lại bookings sau khi thao tác
      const bookingsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/?room=${room?.id}&status=pending`, {
        withCredentials: true,
        headers: { 'X-CSRFToken': csrftoken || '' }
      });
      setRoomBookings(bookingsRes.data);
    } catch (err) {
      console.error(`Lỗi khi ${action}:`, err);
    }
  };

  const handleContactOwner = (owner: User) => {
    if (!isAuthenticated) {
      window.open('/auth/login');
    } else {
      navigate('/chat', {
        state: {
          id: owner?.id,
          image: (process.env.REACT_APP_API_URL ?? '') + owner?.infor.image,
          full_name: owner?.infor.full_name || null,
        },
      });
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 w-full max-w-[1000px] rounded relative  max-h-[calc(100vh-6.8rem)] overflow-auto mt-[2.8rem]">
        <button onClick={onClose} className="absolute top-2 right-2 text-xl">×</button>
        <h3 className="text-xl font-bold text-[#228B22]">{isEdit ? 'Cập nhật phòng' : 'Thêm phòng'}</h3>
        <p className=' mb-4 text-[0.8rem] text-gray-300'>Cập nhật: {room?.updated_at?.split('T')[0]} {room?.updated_at?.split('T')[1].slice(0, 5)}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className='text-[#006400]'>Tên phòng:</p>
            <input name="room_name" value={form.room_name} onChange={handleChange} placeholder="Tên phòng" className="border p-2 w-full" readOnly />
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
                <img src={process.env.PUBLIC_URL + '/icons8-delete-40.png'} alt="xóa" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="space-x-2">
            {isEdit && <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded">Xoá</button>}
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

        {isEdit && roomBookings.length > 0 && (
          <div className="mt-[2rem]">
            <h4 className="font-bold text-blue-700 mb-2">
              Yêu cầu đặt phòng của phòng này
            </h4>
            <ul className="flex flex-col gap-[1rem] mt-[1rem]">
              {roomBookings.map(b => {
                const firstMedia = b.post?.room?.media && b.post?.room?.media.length > 0 ? b.post?.room?.media[0].file : '/no-photo.jpg';
                return (
                  <li key={b.id} className="p-[1rem] flex flex-row gap-[1rem] border-[1px] shadow-lg bg-white rounded">
                    <div>
                      <img
                        src={process.env.REACT_APP_API_URL + firstMedia}
                        alt={b.post.room.room_name}
                        className="w-[7rem] h-[7rem] object-cover rounded mb-2"
                        onError={e => { (e.target as HTMLImageElement).src = '/no-photo.jpg'; }}
                      />
                    </div>
                    <div className="flex flex-col gap-[.4rem] flex-1">
                      <div className="font-semibold">Phòng: {b.post?.room?.room_name}  -  Nhà: {typeof b.post.room.house === 'object' && 'name' in b.post.room.house ? b.post.room.house.name : ''}</div>
                      <Link to={`/posts/${b.post.id}`} className='text-[#006400] hover:underline'>{b.post.title}</Link>
                      <div className="flex flex-row gap-[1rem] items-center">Liên hệ người thuê:
                        <Link to={`/profile/users/${b.tenant.username}`} className='text-blue-300 hover:underline'>{b.tenant.infor.full_name}</Link>
                        <button
                          onClick={() => handleContactOwner(b.tenant)}
                          className="w-[1.5rem] h-[1.5rem]"
                        >
                          <img src={process.env.PUBLIC_URL + '/icons8-chat-bubble-50.png'} alt="Liên hệ người thuê" />
                        </button>
                      </div>
                      <div className="text-gray-500 text-sm">Đặt lúc: {b.booking_at.split('T')[0]} {b.booking_at.split('T')[1].slice(0, 5)} | Cập nhật: {b.updated_at.split('T')[0]} {b.updated_at.split('T')[1].slice(0, 5)}</div>
                      <div className="">Trạng thái: <span className={`${BOOK_STATUS_TYPE_CSS_MAP[b.status]}`}>{BOOK_STATUS_TYPE_MAP[b.status]}</span></div>
                      {b.status === 'pending' && (
                        <div className="mt-2 flex flex-row gap-2">
                          <button
                            onClick={async () => await handleBookingAction(b.id, 'accept')}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                            disabled={b.status !== 'pending'}
                          >
                            Chấp nhận
                          </button>
                          <button
                            onClick={async () => await handleBookingAction(b.id, 'decline')}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                            disabled={b.status !== 'pending'}
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {roomBookings.length === 0 && <div className="text-gray-500 mt-2">Không có booking nào cho phòng này.</div>}
          </div>
        )}

        {isEdit && roomContracts.length > 0 && (
          <div className="mt-[2rem]">
            <h4 className="font-bold text-blue-700 mb-2">Danh sách hợp đồng của phòng này</h4>
            <ul className="flex flex-col gap-[1rem] mt-[1rem]">
              {roomContracts.map(c => (
                <li key={c.id} className="p-[1rem] flex flex-row justify-between items-center border-[1px] shadow-lg bg-white roundedr">
                  <div>
                    <span className="font-semibold">HD-{c.created_at.split('T')[0].split('-').join('')}-{c.id}</span>
                    <div className="text-gray-500 text-sm">Cập nhật: {c.updated_at.split('T')[0]} {c.updated_at.split('T')[1].slice(0, 5)}</div>
                    <div className={`${CONTRACT_STATUS_TYPE_CSS_MAP[c.status]}`}>Trạng thái: {CONTRACT_STATUS_TYPE_MAP[c.status]}</div>
                  </div>
                  <div className="flex flex-row gap-[.5rem] items-center">
                    <Link to={`/profile/users/${c.tenant.username}`} className='text-blue-300 hover:underline'>{c.tenant.infor.full_name}</Link>
                    <button
                      onClick={() => handleContactOwner(c.tenant)}
                      className="w-[1.5rem] h-[1.5rem]"
                    >
                      <img src={process.env.PUBLIC_URL + '/icons8-chat-bubble-50.png'} alt="Liên hệ người thuê" />
                    </button>
                  </div>
                  <Link to={`/contracts/${c.id}`} className="ml-2 text-blue-600 underline hover:text-blue-800">Xem hợp đồng</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isEdit && roomRatings.length > 0 && (
          <div className="mt-[2rem]">
            <h4 className="font-bold text-yellow-700 mb-2">Đánh giá phòng này</h4>
            <ul className="divide-y">
              {roomRatings.map(r => (
                <li key={r.id} className="py-3 px-2 bg-yellow-50 rounded mb-2 shadow flex flex-col">
                  <div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <a href={`/profile/users/${r.tenant.username}`} className="flex flex-row gap-[1rem] items-center text-blue-600 hover:underline">
                          <img src={typeof r.tenant?.infor?.image === 'string' ? r.tenant.infor.image : undefined} alt="" className='w-[2rem] h-[2rem] rounded-full' />
                          <span className="font-semibold text-yellow-700">{r.tenant?.infor?.full_name || r.tenant?.username}</span>
                        </a>
                        <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        <span className="ml-auto text-xs text-gray-400 italic">{r.created_at ? new Date(r.created_at).toLocaleString('vi-VN') : ''}</span>
                      </div>
                      <div className="text-gray-700 italic">{r.feedback}</div>
                    </div>
                    <div>
                      {r.feedback_obj && (
                        <div className="text-blue-700 italic mt-1 pl-4 border-l-4 border-blue-200">
                          <span className="font-semibold">Phản hồi:</span> {r.feedback_obj.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomModal;
