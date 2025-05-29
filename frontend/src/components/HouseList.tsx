import { useEffect, useState } from "react";
import { getCSRFToken } from "../utils/cookies";
import axios from "axios";

interface House {
  id: number;
  name: string;
  city: number | null;
  district: number | null;
  ward: number | null;
  address_detail: string | null;
  num_floors: number;
  rooms_per_floor: number;
  created_at: string;
  updated_at: string;
  owner: string;
}
type City = { id: number; name: string };
type District = { id: number; name: string; parent_code_id: number };
type Ward = { id: number; name: string; parent_code_id: number };

const csrftoken = getCSRFToken();
const HousesList: React.FC = () => {

  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [citiesMap, setCitiesMap] = useState<Record<number, string>>({});
  const [districtsMap, setDistrictsMap] = useState<Record<number, string>>({});
  const [wardsMap, setWardsMap] = useState<Record<number, string>>({});

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
        setHouses(housesData);

        // 2. Lấy danh sách id city, district, ward duy nhất
        const cityIds = Array.from(new Set(housesData.map(h => h.city).filter(Boolean))) as number[];
        const districtIds = Array.from(new Set(housesData.map(h => h.district).filter(Boolean))) as number[];
        const wardIds = Array.from(new Set(housesData.map(h => h.ward).filter(Boolean))) as number[];

        // 3. Fetch cities
        const citiesRes = await axios.get<City[]>(`${process.env.REACT_APP_API_URL}/api/address/cities`);
        const citiesData = citiesRes.data.filter(c => cityIds.includes(c.id!));
        const citiesMapTemp: Record<number, string> = {};
        citiesData.forEach(c => { if (c.id) citiesMapTemp[c.id] = c.name; });
        setCitiesMap(citiesMapTemp);

        // 4. Fetch districts theo từng city_id, gom lại thành 1 mảng
        let districtsData: District[] = [];
        for (const cityId of cityIds) {
          const res = await axios.get<{ districts: District[] }>(`${process.env.REACT_APP_API_URL}/api/address/city/${cityId}`);
          districtsData = districtsData.concat(res.data.districts);
        }
        // Lọc districts theo districtIds, tạo map id=>name
        districtsData = districtsData.filter(d => districtIds.includes(d.id));
        const districtsMapTemp: Record<number, string> = {};
        districtsData.forEach(d => { districtsMapTemp[d.id] = d.name; });
        setDistrictsMap(districtsMapTemp);

        // 5. Fetch wards theo từng district_id
        let wardsData: Ward[] = [];
        for (const districtId of districtIds) {
          const res = await axios.get<{ wards: Ward[] }>(`${process.env.REACT_APP_API_URL}/api/address/district/${districtId}`);
          wardsData = wardsData.concat(res.data.wards);
        }
        wardsData = wardsData.filter(w => wardIds.includes(w.id));
        const wardsMapTemp: Record<number, string> = {};
        wardsData.forEach(w => { wardsMapTemp[w.id] = w.name; });
        setWardsMap(wardsMapTemp);

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading houses...</div>;

  return (
    <div>
      {houses.length === 0 && <p>No houses found.</p>}
      <ul className="flex flex-col gap-[2rem]">
        {houses.map(house => (
          <li key={house.id}>
            <p className="font-bold text-[#228B22] mb-[1rem]">{house.name}</p>
            <div>
              <p>
              <strong className="font-medium">Địa chỉ:  </strong>
              {house.address_detail ? house.address_detail + ', ' : ''}
              {house.ward ? wardsMap[house.ward] : ''}, {house.district ? districtsMap[house.district] : ''}, {house.city ? citiesMap[house.city] : ''}
              </p>
              <p>
              <strong className="font-medium">Số tầng:  </strong>{house.num_floors}
              </p>
              <p>
              <strong className="font-medium">Số phòng trên 1 tầng:  </strong>{house.rooms_per_floor}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HousesList;