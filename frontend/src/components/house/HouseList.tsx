import { useEffect, useState } from "react";
import { getCSRFToken } from "../../utils/cookies";
import axios from "axios";
import GoongMap from "../post/GoongMap";
import HouseForm from "./HouseForm";
import { House } from "../interface_type";
import { Link } from "react-router-dom";

const csrftoken = getCSRFToken();
export const geocodeAddress = async (address: string) => {
  const res = await fetch(
    `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(address)}&api_key=${process.env.REACT_APP_GOONG_MAPS_API_KEY}`
  );
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng,
    };
  }
  throw new Error('Không tìm thấy vị trí');
};

const HousesList: React.FC<({ refresh?: boolean })> = ({ refresh }) => {
  const [houses, setHouses] = useState<House[]>([]);
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [citiesMap, setCitiesMap] = useState<Record<number, string>>({});
  const [districtsMap, setDistrictsMap] = useState<Record<number, string>>({});
  const [wardsMap, setWardsMap] = useState<Record<number, string>>({});
  const [coordinatesMap, setCoordinatesMap] = useState<Record<number, { lat: number, lng: number }>>({});

  const handleEdit = (house: House) => {
    setEditingHouse(house);
    setShowEditForm(true);
  };

  const handleCloseForm = () => {
    setEditingHouse(null);
    setShowEditForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhà trọ này?")) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/houses/${id}/`, {
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
        withCredentials: true,
      });
      alert("Đã xóa nhà trọ.");
      setReload(prev => !prev);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Không thể xóa nhà trọ.");
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch houses
        const housesRes = await axios.get<House[]>(`${process.env.REACT_APP_API_URL}/api/houses/`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': csrftoken || '',
          },
        });
        const housesData = housesRes.data;
        console.log("housesRes.data:", housesRes.data);
        setHouses(housesData);

        // 2. Lấy danh sách id city, district, ward duy nhất
        // const cityIds = Array.from(new Set(housesData.map(h => h.city).filter(Boolean))) as number[];
        // const districtIds = Array.from(new Set(housesData.map(h => h.district).filter(Boolean))) as number[];
        // const wardIds = Array.from(new Set(housesData.map(h => h.ward).filter(Boolean))) as number[];

        // // 3. Fetch cities
        // const citiesRes = await axios.get<City[]>(`${process.env.REACT_APP_API_URL}/api/address/cities`);
        // const citiesData = citiesRes.data.filter(c => cityIds.includes(c.id!));
        // const citiesMapTemp: Record<number, string> = {};
        // citiesData.forEach(c => { if (c.id) citiesMapTemp[c.id] = c.name; });
        // setCitiesMap(citiesMapTemp);

        // // 4. Fetch districts theo từng city_id, gom lại thành 1 mảng
        // let districtsData: District[] = [];
        // for (const cityId of cityIds) {
        //   const res = await axios.get<{ districts: District[] }>(`${process.env.REACT_APP_API_URL}/api/address/city/${cityId}`);
        //   districtsData = districtsData.concat(res.data.districts);
        // }
        // // Lọc districts theo districtIds, tạo map id=>name
        // districtsData = districtsData.filter(d => districtIds.includes(d.id));
        // const districtsMapTemp: Record<number, string> = {};
        // districtsData.forEach(d => { districtsMapTemp[d.id] = d.name; });
        // setDistrictsMap(districtsMapTemp);

        // // 5. Fetch wards theo từng district_id
        // let wardsData: Ward[] = [];
        // for (const districtId of districtIds) {
        //   const res = await axios.get<{ wards: Ward[] }>(`${process.env.REACT_APP_API_URL}/api/address/district/${districtId}`);
        //   wardsData = wardsData.concat(res.data.wards);
        // }
        // wardsData = wardsData.filter(w => wardIds.includes(w.id));
        // const wardsMapTemp: Record<number, string> = {};
        // // wardsData.forEach(w => { wardsMapTemp[w.id] = w.name; });
        // wardsData.forEach(w => { wardsMapTemp[w.id] = w.path_with_type; });
        // setWardsMap(wardsMapTemp);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [refresh, reload]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (houses.length === 0) return;

      const coordsMapTemp: Record<number, { lat: number, lng: number }> = {};

      await Promise.all(houses.map(async (house) => {
        const fullAddress = `${house.address_detail ? house.address_detail + ', ' : ''}${typeof house.ward === 'object' && house.ward.path_with_type ? house.ward.path_with_type : ''}`;
        try {
          const coords = await geocodeAddress(fullAddress);
          coordsMapTemp[house.id] = coords;
        } catch (error) {
          console.warn(`Không lấy được tọa độ cho nhà trọ ${house.name}`);
        }
      }));

      setCoordinatesMap(coordsMapTemp);
    };

    fetchCoordinates();
  }, [houses]);

  if (loading) return <div>Loading houses...</div>;

  return (
    <div>
      {houses.length === 0 && <p>Chưa có nhà trọ.</p>}
      {/* {showEditForm && editingHouse && (
        <HouseForm
          initialData={editingHouse}
          onClose={handleCloseForm}
          onSuccess={() => {
            // Refresh danh sách nhà trọ sau khi chỉnh sửa thành công
          }}
          mode="edit"
        />
      )} */}
      <ul className="flex flex-col gap-[2rem]">
        {houses.map(house => (
          <li key={house.id}>
            <div className="flex flex-row gap-[0.8rem] items-center">
              <Link to={`/houses/${house.id}/rooms`} className="font-bold text-[#228B22] hover:underline text-[1.2rem]">{house.name}</Link>
              <button onClick={() => handleEdit(house)} className="w-[1rem]">
                <img src={process.env.PUBLIC_URL + 'update.png'} alt="Chỉnh sửa" />
              </button>
              <button onClick={() => handleDelete(house.id)} className="w-[1rem]"><img src={process.env.PUBLIC_URL + 'delete.png'} alt="" /></button>
            </div>
            <p className="text-[#cccccc] text-[0.8rem]">Tạo lúc: {house.created_at}  |  Cập nhật: {house.updated_at}</p>
            {showEditForm && editingHouse && editingHouse.id === house.id ? (
              <HouseForm
                initialData={editingHouse}
                onClose={handleCloseForm}
                onSuccess={() => {
                  setReload(prev => !prev);
                  handleCloseForm();
                }}
                mode="edit"
              />
            ) : (
              <div className="mt-[1rem]">
                <p>
                  <strong className="font-medium">Tổng số phòng: </strong>
                  {house.num_floors * house.rooms_per_floor}
                </p>
                <p>
                  <strong className="font-medium">Địa chỉ:  </strong>
                  {house.address_detail ? house.address_detail + ', ' : ''}
                  {typeof house.ward === 'object' && house.ward.path_with_type ? house.ward.path_with_type : ''}
                </p>
                {coordinatesMap[house.id] && (
                  <div className="w-[100%] h-[25rem] mt-[0.8rem]">
                    <GoongMap
                      latitude={coordinatesMap[house.id].lat}
                      longitude={coordinatesMap[house.id].lng}
                      markerText={house.name}
                    />
                  </div>
                )}
              </div>
            )}

          </li>
        ))}
      </ul>
    </div>
  );
};

export default HousesList;