import { useEffect, useState } from "react";
import { MediaItem, Post, User, Ward } from "../components/interface_type";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getCSRFToken } from "../utils/cookies";
import { geocodeAddress } from "../components/HouseList";
import GoongMap from "../components/GoongMap";
import { formatPrice } from "./home";
import { useAuthSessionQuery } from "../django-allauth/sessions/hooks";
import EditPostModal from "../components/EditPostModal";

const csrftoken = getCSRFToken();
const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post>();
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(post?.room.media?.[0] || null);
  const [recommended, setRecommended] = useState<Post[]>([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [wards, setWards] = useState<Ward[]>([]);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { data: authData, isLoading: authLoading } = useAuthSessionQuery();
  const isAuthenticated = authData?.isAuthenticated;
  const [owner, setOwner] = useState<User>();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const navigate = useNavigate();

  const visibleThumbs = 8;

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/posts/${id}/`,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        }
      }
    ).then((res) => setPost(res.data));
  }, [id]);

  useEffect(() => {
    if (typeof post?.room.house === "object" && post.room.house !== null) {
      console.log('city', post.room.house.city);
      fetch(`${process.env.REACT_APP_API_URL}/api/posts/?city=${post.room.house.city}&district=${post.room.house.district}&ward=${post.room.house.ward}`)
        .then(res => res.json())
        .then(data => {
          setRecommended(data.results);
          console.log('Recommended posts:', data.results);
        })
        .catch(err => console.error("Failed to fetch recommended posts:", err));

      axios.get(`${process.env.REACT_APP_API_URL}/api/address/district/${post.room.house.district}`).then((res) => setWards(res.data.wards));
      console.log('Recommended posts:', recommended);
      axios.get(`${process.env.REACT_APP_API_URL}/api/profile/users/${post.room.house.owner}`, {
        withCredentials: true,
      }).then((res) => setOwner(res.data));
    }
  }, [post?.room.house]);

  console.log('wards:', wards);

  const ward_path_name =
    typeof post?.room.house === "object" && post?.room.house !== null && "ward" in post.room.house
      ? wards.find(w => w.id === (post.room.house as { ward: number }).ward)?.path_with_type || ''
      : '';

  console.log('path_name', ward_path_name);
  console.log('Owner:', owner);

  useEffect(() => {
    const house = post?.room.house;
    const fetchCoordinates = async () => {
      if (!house) return;

      const fullAddress = `${typeof house === "object" && house !== null && "address_detail" in house && house.address_detail ? house.address_detail + ', ' : ''}${typeof house === "object" && house !== null && "ward" in house && house.ward ? ward_path_name : ''}`;

      try {
        const coords = await geocodeAddress(fullAddress);
        setCoordinates(coords);
      } catch (error) {
        console.warn(`Không lấy được tọa độ cho nhà trọ`);
      }
    };
    fetchCoordinates();
  }, [post?.room.house, ward_path_name]);

  const isVideo = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'webm', 'ogg'].includes(ext || '');
  };
  const isOwner = isAuthenticated && typeof post?.room?.house === "object" && post?.room?.house !== null && authData?.user?.username === post.room.house.owner;

  const handleDeletePost = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/posts/${id}/`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
      });
      if (post) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/rooms/${post.room.id}/`,
          {
            ...post.room,
            house: typeof post.room.house === "object" && post.room.house !== null && "id" in post.room.house
              ? post.room.house.id
              : post.room.house,
            is_posted: false
          },
          {
            withCredentials: true,
            headers: {
              'X-CSRFToken': csrftoken || '',
            },
          }
        );
      }
      alert("Đã xóa bài đăng.");
      navigate("/manage-house");
    } catch (error) {
      console.error("Lỗi khi xóa bài đăng:", error);
      alert("Không thể xóa bài đăng.");
    }
  };
  return (
    <div className="mx-auto min-h-[calc(100vh-15.88rem)] pt-[7rem] mb-[3rem] w-fit flex flex-row max-xl:flex-col">
      <div className="w-[1000px] max-lg:max-w-[100%] max-lg:px-[1.5rem]">
        <h1 className="text-2xl font-semibold text-[#228B22]">{post?.title}</h1>
        {/* Media display */}
        <div className="border rounded p-2 space-y-2 mt-[2rem]">
          <div className="h-80 flex justify-center items-center bg-gray-100 rounded">
            {selectedMedia ? (
              isVideo(selectedMedia.file) ? (
                <video src={process.env.REACT_APP_API_URL + selectedMedia.file} controls className="max-h-full max-w-full" />
              ) : (
                <img src={process.env.REACT_APP_API_URL + selectedMedia.file} alt="" className="max-h-full max-w-full object-contain" />
              )
            ) : (
              <p>No media</p>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex items-center space-x-2 overflow-hidden relative">
            {scrollIndex > 0 && (
              <button
                onClick={() => setScrollIndex(Math.max(scrollIndex - 1, 0))}
                className="absolute left-0 z-10 bg-white shadow px-2 py-1 rounded"
              >
                ◀
              </button>
            )}
            <div className="flex overflow-x-auto gap-2 ml-6 mr-6">
              {post?.room.media?.slice(scrollIndex, scrollIndex + visibleThumbs).map((media) => (
                <div
                  key={media.id}
                  className={`cursor-pointer border ${selectedMedia?.id === media.id ? 'border-blue-500' : 'border-gray-300'} rounded`}
                  onClick={() => setSelectedMedia(media)}
                >
                  {isVideo(media.file) ? (
                    <video src={process.env.REACT_APP_API_URL + media.file} className="h-20 w-28 object-cover" />
                  ) : (
                    <img src={process.env.REACT_APP_API_URL + media.file} className="h-20 w-28 object-cover" />
                  )}
                </div>
              ))}
            </div>
            {post?.room.media && (scrollIndex + visibleThumbs < post.room.media.length) && (
              <button
                onClick={() => setScrollIndex(scrollIndex + 1)}
                className="absolute right-0 z-10 bg-white shadow px-2 py-1 rounded"
              >
                ▶
              </button>
            )}
          </div>
        </div>
        {/* Room Info */}
        <div className="space-y-2">
          <p className="text-[#cccccc] text-[0.8rem] mb-[0.5rem] mt-[2rem]">Đăng lúc: {post?.created_at.split('T')[0]} {post?.created_at.split('T')[1].slice(0, 5)}  |  Cập nhật: {post?.updated_at.split('T')[0]} {post?.updated_at.split('T')[1].slice(0, 5)}</p>
          <p className="flex flex-row items-center"><strong><img src={process.env.PUBLIC_URL + '/location.png'} alt="Địa chỉ: " className='w-[1rem] h-[1rem] mr-[0.5rem]' /></strong> {typeof post?.room.house === "object" && post.room.house !== null ? post.room.house.address_detail + ', ' + ward_path_name : ""}</p>
          <p className='flex flex-row items-center gap-[0.5rem] text-[1rem]'><img src={process.env.PUBLIC_URL + '/price-tag.png'} alt="Giá phòng: " className='w-[1rem] h-[1rem]' /> {formatPrice(String(post?.room.price))}</p>
          <p className='flex flex-row items-center gap-[0.5rem] text-[1rem]'><img src={process.env.PUBLIC_URL + '/area.png'} alt="Diện tích: " className='w-[1rem] h-[1rem]' /> {post?.room.area} m²</p>
          {post?.room.deposit && (
            <p><strong>Đặt cọc:</strong> {post?.room.deposit}</p>
          )}
          {post?.room.electric && (
            <p><strong>Tiền điện:</strong> {post?.room.electric}</p>
          )}
          {post?.room.water && (
            <p><strong>Tiền nước:</strong> {post?.room.water}</p>
          )}
          {post?.room.amenities && (
            <p><strong>Tiện nghi:</strong> {post?.room.amenities}</p>
          )}
          {post?.room.service_price && (
            <p><strong>Tiền dịch vụ:</strong> {post?.room.service_price}</p>
          )}
          {post?.room.description && (
            <p className="whitespace-pre-line">
              <strong>Mô tả: </strong> <br />
              {post?.room.description}
            </p>
          )}
        </div>
        {/* Owner Info */}
        <div className="w-full items-center mt-[2rem]">
          <strong>Thông tin người đăng</strong>
          <div className="flex flex-row items-center gap-[1.5rem] mt-[0.5rem]">
            <a href={isOwner ? '/profile/me' : `/profile/users/${owner?.username}`} className="flex flex-row gap-[1rem] items-center text-blue-600 hover:underline">
              <img
                src={
                  typeof owner?.infor.image === "string"
                    ? owner.infor.image
                    : owner?.infor.image instanceof File
                      ? URL.createObjectURL(owner.infor.image)
                      : undefined
                }
                alt="avatar"
                className="h-10 w-10 rounded-full object-cover"
              />
              {owner?.username}
            </a>
          </div>
        </div>
        {/* Map */}
        <div className="mt-[2rem]">
          <strong>Xem trên bản đồ</strong>
          {coordinates && coordinates.lat !== undefined && coordinates.lng !== undefined && (
            (() => {
              const house = typeof post?.room.house === "object" && post.room.house !== null ? post.room.house : undefined;
              return (
                <div className="max-lg:aspect-video h-[20rem] w-full max-md:w-[100%] mt-[0.8rem]">
                  <GoongMap
                    latitude={coordinates.lat}
                    longitude={coordinates.lng}
                    markerText={house?.name || ""}
                  />
                </div>
              );
            })()
          )}
        </div>
        {/* edit & delete post for owner */}
        {isOwner && (
          <div className="mt-[2rem] flex gap-4">
            <button
              className="px-4 py-2 bg-[#00b14f] text-white rounded hover:underline transition"
              onClick={() => setIsEditOpen(true)}
            >
              Chỉnh sửa
            </button>
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded hover:underline transition"
              onClick={handleDeletePost}
            >
              Xóa
            </button>
          </div>
        )}
        {isEditOpen && post && (
          <EditPostModal
            post={post}
            onClose={() => setIsEditOpen(false)}
            onUpdate={(updatedPost) => setPost(updatedPost)}
          />
        )}
      </div>
      {/* Recommended Posts */}
      <div className="ml-[2rem] max-w-[15rem] max-xl:ml-0 max-xl:max-w-full max-xl:mt-[3rem]">
        {recommended.length > 0 && (
          <div className="">
            <h2 className="text-lg font-semibold mb-2">Bài đăng gợi ý gần đó</h2>
            <ul className="space-y-2">
              {recommended.map((rec) => (
                <li key={rec.id}>
                  <a href={`/posts/${rec.id}`} className="text-[#228B22] hover:underline">
                    {rec.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;