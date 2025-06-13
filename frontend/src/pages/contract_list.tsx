import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Contract, CONTRACT_STATUS_TYPE_CSS_MAP, CONTRACT_STATUS_TYPE_MAP, User } from '../components/interface_type';
import { getCSRFToken } from '../utils/cookies';
import { useAuthSessionQuery } from '../django-allauth/sessions/hooks';

const DEFAULT_IMAGE = process.env.PUBLIC_URL + '/no-photo.jpg';
const csrftoken = getCSRFToken();


const ContractList: React.FC = () => {
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const [user, setUser] = useState<User>();
  const isAuthenticated = authData?.isAuthenticated;
  const [myContracts, setMyContracts] = useState<Contract[]>([]);
  const [roomContracts, setRoomContracts] = useState<Contract[]>([]);
  // const [isLandlord, setIsLandlord] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchLandlordContracts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contracts/?landlord=${authData?.user?.id}`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        });
        setRoomContracts(res.data);
      } catch (err) {
      }
    };
    fetchLandlordContracts();
  }, [authData?.user?.id]);

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/contracts/?tenant=${authData?.user?.id}`, {
          withCredentials: true,
          headers: {
            'X-CSRFToken': csrftoken || '',
          }
        });
        setMyContracts(res.data);
      } catch (err) { }
    };
    fetchContracts();
  }, [authData?.user?.id]);
  
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
  console.log('myContracts', myContracts);
  console.log('Contracts', roomContracts);

  return (
    <div className="mx-auto min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem] w-[1000px]">
      {roomContracts.length > 0 && (
        <div className="">
          <h2 className="text-xl text-white font-bold bg-[#00b14f] shadow-xl text-center uppercase h-[4rem] flex items-center justify-center rounded-full">Hợp đồng của phòng đang sở hữu</h2>
          <ul className="flex flex-col gap-[1rem] mt-[2rem]">
            {roomContracts.map(b => {
              const firstMedia =
                b.room && b.room.media && b.room.media.length > 0
                  ? b.room.media[0].file
                  : DEFAULT_IMAGE;
              return (
                <li key={b.id} className="p-[1rem] flex flex-row gap-[1rem] border-[1px] shadow-lg">
                  <div>
                    <img
                      src={process.env.REACT_APP_API_URL + firstMedia}
                      alt={b.room?.room_name || 'Phòng'}
                      className="w-[11rem] h-[11rem] object-cover rounded mb-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                    />
                  </div>
                  <div className='flex flex-col gap-[.4rem]'>
                    <Link to={`/contracts/${b.id}`} className='text-[#006400] hover:underline text-xl'>HD-{b.created_at.split('T')[0].split('-').join('')}-{b.id}</Link>
                    <div className="">
                      Thông tin phòng: phòng-{b.room?.room_name}, nhà-{typeof b.room?.house === 'object' && b.room?.house !== null ? (b.room?.house as { name?: string }).name : ''}
                    </div>
                    <div className="flex flex-row gap-[.5rem] items-center">Thông tin người thuê:
                      <Link to={`/profile/users/${b.tenant.username}`} className='text-blue-300 hover:underline'>{b.tenant.infor.full_name}</Link>
                      <button
                        onClick={() => handleContactOwner(b.tenant)}
                        className="w-[1.5rem] h-[1.5rem]"
                      >
                        <img src={process.env.PUBLIC_URL + '/icons8-chat-bubble-50.png'} alt="Liên hệ người thuê" />
                      </button>
                    </div>
                    <div className="text-gray-500 text-sm">Tạo lúc: {b.created_at.split('T')[0]} {b.created_at.split('T')[1].slice(0, 5)} | Cập nhật: {b.updated_at.split('T')[0]} {b.updated_at.split('T')[1].slice(0, 5)}</div>
                    <div className="">Trạng thái: {CONTRACT_STATUS_TYPE_MAP[b.status]}</div>
                  </div>

                </li>
              );
            })}
          </ul>
        </div>
      )}
      {myContracts.length > 0 && (
        <div className='mt-[2rem]'>
          <h2 className="text-xl text-white font-bold bg-[#00b14f] shadow-xl text-center uppercase h-[4rem] flex items-center justify-center rounded-full">Hợp đồng thuê phòng</h2>
          <ul className="flex flex-col gap-[1rem] mt-[2rem]">
            {myContracts.map(b => {
              const firstMedia =
                b.room && b.room.media && b.room.media.length > 0
                  ? b.room.media[0].file
                  : DEFAULT_IMAGE;
              return (
                <li key={b.id} className="p-[1rem] flex flex-row gap-[1rem] border-[1px] shadow-lg">
                  <div>
                    <img
                      src={process.env.REACT_APP_API_URL + firstMedia}
                      alt={b.room?.room_name || 'Phòng'}
                      className="w-[11rem] h-[11rem] object-cover rounded mb-2"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                    />
                  </div>
                  <div className='flex flex-col gap-[.4rem]'>
                    <Link to={`/contracts/${b.id}`} className='text-[#006400] hover:underline text-xl'>
                      HD-{b.created_at.split('T')[0].split('-').join('')}-{b.id}
                    </Link>
                    <div className="flex flex-row gap-[.5rem] items-center">Thông tin chủ phòng:
                      <Link to={`/profile/users/${b.landlord.username}`} className='text-blue-300 hover:underline'>{b.landlord.infor.full_name}</Link></div>
                    <button
                      onClick={() => handleContactOwner(b.landlord)}
                      className="w-[1.5rem] h-[1.5rem]"
                    >
                      <img src={process.env.PUBLIC_URL + '/icons8-chat-bubble-50.png'} alt="Liên hệ chủ phòng" />
                    </button>
                    <div className="text-gray-500 text-sm">Tạo lúc: {b.created_at.split('T')[0]} {b.created_at.split('T')[1].slice(0, 5)} | Cập nhật: {b.updated_at.split('T')[0]} {b.updated_at.split('T')[1].slice(0, 5)}</div>
                    <div className={`${CONTRACT_STATUS_TYPE_CSS_MAP[b.status]}`}>Trạng thái: {CONTRACT_STATUS_TYPE_MAP[b.status]}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {myContracts.length === 0 && roomContracts.length === 0 && (
        <div className="text-center text-gray-500 mt-4">
          Bạn chưa có hợp đồng nào.
        </div>
      )}
    </div>
  );
};

export default ContractList;
