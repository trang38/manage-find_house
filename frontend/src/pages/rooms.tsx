import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import RoomModal from '../components/house/RoomModal';
import { getCSRFToken } from '../utils/cookies';
import { House, Room, Ward } from '../components/interface_type';
import { geocodeAddress } from '../components/house/HouseList';
import GoongMap from '../components/post/GoongMap';


const statusColors: Record<string, string> = {
  available: 'bg-green-300',
  occupied: 'bg-yellow-300',
  checkout_soon: 'bg-red-300',
  maintenance: 'bg-gray-300',
};
const csrftoken = getCSRFToken();

const RoomsByHousePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log('id:', id);
  const [house, setHouse] = useState<House | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [wards, setWards] = useState<Ward[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/houses/${id}/`,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      }
    ).then((res) => setHouse(res.data));
    axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/?house=${id}`,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      }
    ).then((res) => setRooms(res.data));
  }, [id]);
  console.log('house', house);

  // useEffect(() => {
  //   if (house?.district) {
  //     axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${house.district}`)
  //       .then((res) => {
  //         console.log('wards:', res.data.wards);
  //         setWards(res.data.wards);
  //       });
  //   }
  // }, [house?.district]);
  // console.log('wards', wards);
  // const ward_path_name = wards.find(w => w.id === house?.ward)?.path_with_type || '';
  // console.log('path_name', ward_path_name);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!house) return;

      const fullAddress = `${typeof house.ward === 'object' ? house.address_detail + ', ' + house.ward.path_with_type : ''}`;

      try {
        const coords = await geocodeAddress(fullAddress);
        setCoordinates(coords);
      } catch (error) {
        console.warn(`Không lấy được tọa độ cho nhà trọ ${house.name}`);
      }
    };

    fetchCoordinates();
  }, [house]);

  const openModal = (room: Room | null) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedRoom(null);
    setShowModal(false);
    axios.get(`${process.env.REACT_APP_API_URL}/api/rooms/?house=${id}`,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      }
    ).then((res) => setRooms(res.data));
  };

  const renderGrid = () => {
    if (!house) return null;
    const grid = [];

    for (let floor = house.num_floors; floor >= 1; floor--) {
      const row = [];
      for (let index = 1; index <= house.rooms_per_floor; index++) {
        const roomName = `${floor}${index.toString().padStart(2, '0')}`;
        const room = rooms.find((r) => r.room_name === roomName);

        row.push(
          <td key={index} className="border p-2 text-center w-fit">
            {room ? (
              <button
                onClick={() => openModal(room)}
                className={clsx(
                  'w-full h-full p-6 rounded shadow',
                  statusColors[room.status] || 'bg-white'
                )}
              >
                {room.room_name}
              </button>
            ) : (
              <button
                onClick={() => openModal({ room_name: roomName, house: house } as Room)}
                className="w-full h-full p-6 rounded shadow border hover:bg-blue-100"
              >
                + Thêm phòng
              </button>
            )}
          </td>
        );
      }
      grid.push(<tr key={floor}>{row}</tr>);
    }
    return grid;
  };

  return (
    <div className="mx-auto max-w-[1000px] max-md:max-w-[100%] max-lg:px-[1rem] min-h-[calc(100vh-15.88rem)] mt-[7rem] mb-[3rem]">
      <h2 className="text-2xl font-semibold text-[#228B22]">{house?.name}</h2>
      <p className="mb-4 text-gray-300 text-[0.8rem]">Tạo lúc: {house?.created_at.split('T')[0]} {house?.created_at.split('T')[1].slice(0, 5)} |  Cập nhật: {house?.updated_at.split('T')[0]} {house?.updated_at.split('T')[1].slice(0, 5)}</p>

      <div className="overflow-auto">
        <table className="border-collapse border w-fit">
          <tbody>{renderGrid()}</tbody>
        </table>
      </div>

      {showModal && (
        <RoomModal
          room={selectedRoom}
          onClose={closeModal}
          house={house!}
        />
      )}

      <p className='mt-[2rem]'>
        <strong className="font-medium">Địa chỉ:  </strong>
        {typeof house?.ward === 'object' ? house?.address_detail + ', ' + house?.ward.path_with_type : '' }
      </p>
      {coordinates && coordinates.lat !== undefined && coordinates.lng !== undefined && (
        <div className="aspect-video w-[50%] max-md:w-[100%] mt-[0.8rem]">
          <GoongMap
            latitude={coordinates.lat}
            longitude={coordinates.lng}
            markerText={house?.name || ""}
          />
        </div>
      )}
      <button
        onClick={() => navigate('/manage-house')}
        className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 mt-[3rem]"
      >
        ← Quay lại danh sách nhà trọ
      </button>
    </div>
  );
};

export default RoomsByHousePage;
