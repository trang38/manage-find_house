import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BOOK_STATUS_TYPE_CSS_MAP, BOOK_STATUS_TYPE_MAP, Booking, Infor, Post, User } from '../components/interface_type';
import { getCSRFToken } from '../utils/cookies';
import { useAuthSessionQuery } from '../django-allauth/sessions/hooks';

const DEFAULT_IMAGE = process.env.PUBLIC_URL + '/no-photo.jpg';
const csrftoken = getCSRFToken();


const BookingHistory: React.FC = () => {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const [user, setUser] = useState<User>();
  const isAuthenticated = authData?.isAuthenticated;
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [roomBookings, setRoomBookings] = useState<Booking[]>([]);
  const navigate = useNavigate();
    const [tab, setTab] = useState<'tenant' | 'landlord'>('tenant');

  const handleAction = async (bookingId: number, action: 'accept' | 'decline' | 'cancel') => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}/${action}/`,
        {},
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          },
        }
      );
      if (action === 'accept') {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/contracts/?booking=${bookingId}`,
          { withCredentials: true }
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          const contractId = res.data[0].id;
          navigate(`/contracts/${contractId}`);
          return;
        }
      }
      fetchBookings();
      fetchLandlordBookings();
    } catch (err) {
      console.error(`Lỗi khi ${action}:`, err);
    }
  };


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile/me/`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        });
        setUser(res.data);
      } catch (err) { }
    };
    fetchUser();
  }, [authData?.user?.username]);
  console.log('user:', user);

  const isLandlord = user?.infor?.role === 'landlord'
  console.log('islandlord:', isLandlord);

  const fetchLandlordBookings = async () => {
    if (!isLandlord || !authData?.user?.id) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/?owner_id=${authData?.user?.id}`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      });
      setRoomBookings(res.data);
    } catch (err) {
    }
  };
  const fetchBookings = async () => {
    if (!authData?.user?.id) return;
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/bookings/?tenant_id=${authData?.user?.id}`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      });
      setMyBookings(res.data);
    } catch (err) { }
  };
  useEffect(() => {
    fetchBookings();
    fetchLandlordBookings();
  }, [user, authData?.user?.id]);

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
    <div className="mx-auto min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem] w-[1000px]">
            {isLandlord && (
        <div className="flex gap-[2rem] mb-6 justify-center">
          <button
            className=' text-[#228B22] hover:underline'
            onClick={() => setTab('tenant')}
          >
            Lịch sử đặt phòng
          </button>
          <button
            className='text-[#228B22] hover:underline'
            onClick={() => setTab('landlord')}
          >
            Yêu cầu đặt phòng
          </button>
        </div>
      )}

      {isLandlord ? (
        <>
        {tab === 'tenant' && (
                <div className='mt-[3rem]'>
        <h2 className="text-xl text-white font-bold bg-[#00b14f] shadow-xl text-center uppercase h-[4rem] flex items-center justify-center rounded-full">Lịch sử đặt phòng</h2>
        <ul className="mt-[2rem]">
          {myBookings.map(b => {
            const firstMedia = b.post?.room?.media && b.post?.room?.media.length > 0 ? b.post?.room?.media[0].file : DEFAULT_IMAGE;
            return (
              <li key={b.id} className="py-[1rem] flex flex-row gap-[1rem]">
                <div>
                  <img
                    src={process.env.REACT_APP_API_URL + firstMedia}
                    alt={b.post.room.room_name}
                    className="w-[11rem] h-[11rem] object-cover rounded mb-2"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                  />
                </div>
                <div className="flex flex-col gap-[.4rem]">
                  <Link to={`/posts/${b.post.id}`} className='text-[#006400] hover:underline'>{b.post.title}</Link>
                  <div className="text-sm text-gray-500">Đặt lúc: {b.booking_at.split('T')[0]} {b.booking_at.split('T')[1].slice(0, 5)} | Cập nhật: {b.updated_at.split('T')[0]} {b.updated_at.split('T')[1].slice(0, 5)}</div>
                  <div className="">Trạng thái: <span className={`${BOOK_STATUS_TYPE_CSS_MAP[b.status]}`}>{BOOK_STATUS_TYPE_MAP[b.status]}</span></div>
                  <div className="flex flex-row gap-[1rem] items-center">Liên hệ chủ phòng:
                    {typeof b.post.room.house === 'object' && b.post.room.house !== null && 'owner' in b.post.room.house && b.post.room.house.owner ? (
                      <>
                        <Link
                          to={`/profile/users/${(b.post.room.house as { owner: User }).owner.username}`}
                          className='text-blue-300 hover:underline'
                        >
                          {(b.post.room.house as { owner: User }).owner.infor.full_name}
                        </Link>
                        <button
                          onClick={() => handleContactOwner((b.post.room.house as { owner: User }).owner)}
                          className="w-[1.5rem] h-[1.5rem]"
                        >
                          <img src={process.env.PUBLIC_URL + '/icons8-chat-bubble-50.png'} alt="Liên hệ chủ phòng" />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">Không có thông tin chủ phòng</span>
                    )}
                  </div>
                  {b.status === 'pending' && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleAction(b.id, 'cancel')}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
                        disabled={b.status !== 'pending'}
                      >
                        Hủy yêu cầu
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {myBookings.length === 0 && (
          <div className="text-gray-500 mt-4">Hiện tại bạn chưa có yêu cầu đặt phòng nào.</div>
        )}
      </div>
        )}
        {tab === 'landlord' && (
                  <div>
          <div className='text-xl text-white font-bold bg-[#00b14f] shadow-xl text-center uppercase h-[4rem] flex items-center justify-center rounded-full'>Yêu cầu đặt phòng</div>
          <div className="flex flex-col gap-[1rem] mt-[2rem]">
            {roomBookings.map(b => {
              const firstMedia = b.post?.room?.media && b.post?.room?.media.length > 0 ? b.post?.room?.media[0].file : DEFAULT_IMAGE;
              return (
                <li key={b.id} className="p-[1rem] flex flex-row gap-[1rem] border-[1px] shadow-lg">
                  <div>
                    <img
                      src={process.env.REACT_APP_API_URL + firstMedia}
                      alt={b.post.room.room_name}
                      className="w-[11rem] h-[11rem] object-cover rounded mb-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                    />
                  </div>
                  <div className="flex flex-col gap-[.4rem]">
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
                          onClick={() => handleAction(b.id, 'accept')}
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                          disabled={b.status !== 'pending'}
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => handleAction(b.id, 'decline')}
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

            {roomBookings.length === 0 && (
              <div className="text-gray-500 mt-4">Hiện tại không có yêu cầu đặt phòng nào.</div>
            )}
          </div>
        </div>
        )}
        </>
      ) : (
              <div className='mt-[3rem]'>
        <h2 className="text-xl text-white font-bold bg-[#00b14f] shadow-xl text-center uppercase h-[4rem] flex items-center justify-center rounded-full">Lịch sử đặt phòng</h2>
        <ul className="mt-[2rem]">
          {myBookings.map(b => {
            const firstMedia = b.post?.room?.media && b.post?.room?.media.length > 0 ? b.post?.room?.media[0].file : DEFAULT_IMAGE;
            return (
              <li key={b.id} className="py-[1rem] flex flex-row gap-[1rem]">
                <div>
                  <img
                    src={process.env.REACT_APP_API_URL + firstMedia}
                    alt={b.post.room.room_name}
                    className="w-[11rem] h-[11rem] object-cover rounded mb-2"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                  />
                </div>
                <div className="flex flex-col gap-[.4rem]">
                  <Link to={`/posts/${b.post.id}`} className='text-[#006400] hover:underline'>{b.post.title}</Link>
                  <div className="text-sm text-gray-500">Đặt lúc: {b.booking_at.split('T')[0]} {b.booking_at.split('T')[1].slice(0, 5)} | Cập nhật: {b.updated_at.split('T')[0]} {b.updated_at.split('T')[1].slice(0, 5)}</div>
                  <div className="">Trạng thái: <span className={`${BOOK_STATUS_TYPE_CSS_MAP[b.status]}`}>{BOOK_STATUS_TYPE_MAP[b.status]}</span></div>
                  <div className="flex flex-row gap-[1rem] items-center">Liên hệ chủ phòng:
                    {typeof b.post.room.house === 'object' && b.post.room.house !== null && 'owner' in b.post.room.house && b.post.room.house.owner ? (
                      <>
                        <Link
                          to={`/profile/users/${(b.post.room.house as { owner: User }).owner.username}`}
                          className='text-blue-300 hover:underline'
                        >
                          {(b.post.room.house as { owner: User }).owner.infor.full_name}
                        </Link>
                        <button
                          onClick={() => handleContactOwner((b.post.room.house as { owner: User }).owner)}
                          className="w-[1.5rem] h-[1.5rem]"
                        >
                          <img src={process.env.PUBLIC_URL + '/icons8-chat-bubble-50.png'} alt="Liên hệ chủ phòng" />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400">Không có thông tin chủ phòng</span>
                    )}
                  </div>
                  {b.status === 'pending' && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleAction(b.id, 'cancel')}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-700 disabled:opacity-50"
                        disabled={b.status !== 'pending'}
                      >
                        Hủy yêu cầu
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {myBookings.length === 0 && (
          <div className="text-gray-500 mt-4">Hiện tại bạn chưa có yêu cầu đặt phòng nào.</div>
        )}
      </div>
      )}

    </div>
  );
};

export default BookingHistory;
