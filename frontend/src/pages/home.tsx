import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/post/SearchBar';
import FilterPanel from '../components/post/FilterPanel';
import { PaginationResponse, Post, ROOM_TYPE_CSS_MAP, ROOM_TYPE_MAP } from '../components/interface_type';

const DEFAULT_IMAGE = process.env.PUBLIC_URL + '/no-photo.jpg';

// Định nghĩa kiểu dữ liệu theo JSON bạn cung cấp

export const formatPrice = (priceStr: string) => {
    const priceNum = Number(priceStr);
    if (isNaN(priceNum)) return priceStr;
    return priceNum.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };
const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [wardIdToName, setWardIdToName] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string | number>>({});


  // const fetchWardNames = async (districtIds: number[]) => {
  //   const wardMap: Record<number, string> = {};

  //   for (const districtId of districtIds) {
  //     try {
  //       const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${districtId}`);
  //       const wards = res.data.wards || [];
  //       wards.forEach((ward: any) => {
  //         wardMap[ward.id] = ward.path_with_type;
  //       });
  //     } catch (error) {
  //       console.error(`Lỗi khi lấy phường của district ${districtId}:`, error);
  //     }
  //   }

  //   setWardIdToName(wardMap);
  // };

  const fetchPosts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') params.append(key, value.toString());
      });
      params.append('page', pageNum.toString());

      const res = await axios.get<PaginationResponse>(`${process.env.REACT_APP_API_URL}/api/posts/?${params.toString()}`);
      setPosts(res.data.results);
      console.log(`${process.env.REACT_APP_API_URL}/api/posts/?${params.toString()}`);
      // const uniqueDistrictIds = Array.from(
      //   new Set(
      //     res.data.results
      //       .map(post => post.room.house && typeof post.room.house === 'object' ? post.room.house.district : null)
      //   )
      // ).filter((id): id is number => id !== null && id !== undefined);
      // fetchWardNames(uniqueDistrictIds);

      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
      setPage(pageNum);
    } catch (error) {
      console.error('Lỗi khi lấy bài đăng:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPosts();
  }, [searchTerm, filters]);


  return (
    <div className="mx-auto min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem] w-fit">
      <div className='max-w-[1000px] max-lg:max-w-[100%] max-lg:px-[1.5rem]'>
        <SearchBar onSearch={setSearchTerm} />
      </div>
      <div className='hidden max-xl:block max-xl:mt-[3rem] max-xl:max-w-[1000px] max-lg:max-w-[100%] max-lg:px-[1.5rem]'>
        <FilterPanel onFilter={setFilters} />
      </div>
      <div className='mt-[3rem] flex flex-row max-lg:max-w-[100%] max-lg:px-[1.5rem]'>
        <div className='w-[1000px]'>
          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : posts.length === 0 ? (
            <p>Chưa có bài đăng nào.</p>
          ) : (
            <div className="flex flex-col gap-[1rem]">
              {posts.map((post) => {
                const { room } = post;
                console.log(room);
                const firstMedia = room.media && room.media.length > 0 ? room.media[0].file : DEFAULT_IMAGE;
                // const wardName = typeof room.house === 'object' && room.house !== null && 'ward' in room.house && room.house.ward != null
                //   ? wardIdToName[(room.house as { ward: number }).ward]
                //   : '';
                return (
                  <div key={post.id} className="border rounded shadow p-4 flex flex-row w-full gap-[0.8rem]">
                    <div className='flex-none'>
                      <a href={`/posts/${post.id}`}>
                        <img
                          src={process.env.REACT_APP_API_URL+firstMedia}
                          alt={room.room_name}
                          className="w-[11rem] h-[11rem] object-cover rounded mb-2"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                        />
                      </a>
                    </div>
                    <div>
                      <a href={`/posts/${post.id}`}>
                        <h2 className="text-lg font-semibold text-[#228B22] hover:underline">{post.title}</h2>
                      </a>
                      <p className="text-[#cccccc] text-[0.8rem] mb-[0.5rem]">Đăng lúc: {post.created_at.split('T')[0]} {post.created_at.split('T')[1].slice(0, 5)}  |  Cập nhật: {post.updated_at.split('T')[0]} {post.updated_at.split('T')[1].slice(0, 5)}</p>
                      <p className='flex flex-row items-center gap-[0.5rem] text-[1rem]'>
                        <img src={process.env.PUBLIC_URL + '/location.png'} alt="Địa chỉ: " className='w-[1rem] h-[1rem]' />
                        {typeof room.house === 'object' && room.house !== null && 'ward' in room.house && room.house.ward && typeof room.house.ward === 'object' && 'path_with_type' in room.house.ward
                          ? `${room.house.address_detail}, ${room.house.ward.path_with_type}`
                          : ''}
                      </p>
                      <p className='flex flex-row items-center gap-[0.5rem] text-[1rem]'><img src={process.env.PUBLIC_URL + '/price-tag.png'} alt="Giá phòng: " className='w-[1rem] h-[1rem]' /> {formatPrice(String(room.price))}</p>
                      <p className='flex flex-row items-center gap-[0.5rem] text-[1rem]'><img src={process.env.PUBLIC_URL + '/area.png'} alt="Diện tích: " className='w-[1rem] h-[1rem]' /> {room.area} m²</p>
                      <p className={`flex flex-row items-center gap-[0.5rem] text-[1rem] ${ROOM_TYPE_CSS_MAP[room.room_type]} text-white w-fit rounded-full px-[.5rem] py-[.1rem]`}>{ROOM_TYPE_MAP[room.room_type] || room.room_type}</p>
                      <p className='flex flex-row items-center gap-[0.5rem] text-[1rem]'><span>Tiện nghi:</span> {room.amenities}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Phân trang */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => prevPage && fetchPosts(page - 1)}
              disabled={!prevPage}
              className={`p-2 rounded ${prevPage ? 'bg-[#00b14f] text-white' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <img src={process.env.PUBLIC_URL + 'left.png'} alt="Trang trước" className='w-[1rem] h-[1rem]' />
            </button>
            <span>{page}</span>
            <button
              onClick={() => nextPage && fetchPosts(page + 1)}
              disabled={!nextPage}
              className={`p-2 rounded ${nextPage ? 'bg-[#00b14f] text-white' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              <img src={process.env.PUBLIC_URL + '/right.png'} alt="Trang sau" className='w-[1rem] h-[1rem]' />
            </button>
          </div>
        </div>
        <div className=' ml-[2rem] border-l-[#cccccc] max-xl:hidden'>
          <FilterPanel onFilter={setFilters} />
        </div>
      </div>

    </div>
  );
};

export default HomePage;
