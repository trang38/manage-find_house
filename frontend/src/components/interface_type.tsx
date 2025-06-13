import axios from "axios";
import { getCSRFToken } from "../utils/cookies";

export type City = { 
  id?: number; 
  name: string 
};
export type District = { 
  id: number; 
  name: string 
};
export type Ward = { 
  id: number; 
  name: string;
  path_with_type: string
};

export interface Infor {
  id: number;
  full_name: string;
  bio?: string;
  image: File | string;
  city?: number;
  district?: number;
  ward?: number | Ward;
  address_detail?: string;
  phone_number?: string;
  national_id?: string;
  national_id_date?: string;
  national_id_address?: string;
  id_front_image?: File | string;
  id_back_image?: File | string;
  bank_name?: string;
  bank_account?: string;
  bank_account_name?: string;
  show_bio: boolean;
  show_phone_number: boolean;
  show_address: boolean;
  role: string;
  user?:User;
}

export interface User {
  id: number;
  username: string;
  email: string;
  infor: Infor;
}

export interface House {
  id: number;
  name: string;
  city: number;
  district: number;
  ward: number | Ward;
  address_detail: string;
  num_floors: number;
  rooms_per_floor: number;
  created_at: string;
  updated_at: string;
  owner: User;
}

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export interface Room {
  id?: number;
  room_name: string;
  room_type: string;
  house: number | House;
  price?: number;
  deposit?: number;
  electric?: number;
  water?: string;
  service_price?: number;
  area?: number;
  amenities?: string;
  description?: string;
  status: string;
  is_posted?: boolean;
  updated_at?:string;
  post_id?: number;
  media?: MediaItem[];
}
export interface MediaItem {
  id: number;
  file: string;
  type: 'image' | 'video';
}


export interface Post {
  id: number;
  title: string;
  room: Room;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface PaginationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Post[];
}

export const ROOM_TYPE_MAP: Record<string, string> = {
  '1': 'Phòng trọ',
  '2': 'Homestay',
  '3': 'Nhà nguyên căn',
  '4': 'Studio',
  '5': 'Chung cư mini',
};

export const ROOM_TYPE_CSS_MAP: Record<string, string> = {
  '1': 'bg-rose-600',
  '2': 'bg-purple-600',
  '3': 'bg-yellow-600',
  '4': 'bg-green-600',
  '5': 'bg-blue-600'
}

export interface Message {
  id: number;
  sender: User;
  receiver: User;
  message: string;
  is_read: boolean;
  date: string;
  sender_profile?: Infor;   
  receiver_profile?: Infor;
}

const csrftoken = getCSRFToken();
export const fetchInbox = async (userId: number) => {
  const res = await axios.get<Message[]>(`${process.env.REACT_APP_API_URL}/api/my-messages/${userId}/`,
    {
      withCredentials: true,
      headers: {
        'X-CSRFToken': csrftoken || '',
      }
    }
  );
  return res.data;
};

export const searchUser = async (username: string): Promise<Infor[]> => {
  try {
    const res = await axios.get<Infor[]>(
      `${process.env.REACT_APP_API_URL}/api/search/users/?q=${username}`,
      {
        withCredentials: true,
        headers: {
          'X-CSRFToken': csrftoken || '',
        },
      }
    );

    return res.data; 
  } catch (err) {
    return [];
  }
};


export interface Booking {
  id: number;
  post: Post;
  status: string;
  booking_at: string;
  updated_at: string;
  tenant: User;
}

export const BOOK_STATUS_TYPE_MAP: Record<string, string> = {
  'pending': 'Đang chờ',
  'accepted': 'Chấp nhận',
  'declined': 'Từ chối',
  'cancelled': 'Đã hủy',
};

export const BOOK_STATUS_TYPE_CSS_MAP: Record<string, string> = {
  'pending': 'text-amber-600',
  'accepted': 'text-emerald-600',
  'declined': 'text-rose-600',
  'cancelled': 'text-slate-600',
}
export interface Contract {
  id: number,
  landlord: User, 
  tenant: User,
  room: Room,
  landlord_completed: boolean,
  tenant_completed: boolean,
  landlord_confirm: boolean,
  revision_requested_landlord: boolean,
  revision_requested_tenant: boolean,
  revision_reason: string | null,
  start_date: string | null,
  end_date: string | null,
  payment_day: number | null,
  terms_landlord: string | null,
  terms_tenant: string | null,
  created_at: string,
  updated_at: string,
  completed_at: string | null,
  ended_at: string | null,
  status: string,
  data: JSON | null,
  booking: number,
};

export const CONTRACT_STATUS_TYPE_MAP: Record<string, string> = {
  'creating': 'Đang hoàn thiện',
  'canceled': 'Đã hủy',
  'completed': 'Có hiệu lực',
  'end': 'Đã kết thúc',
};

export const CONTRACT_STATUS_TYPE_CSS_MAP: Record<string, string> = {
  'creating': 'text-amber-600',
  'canceled': 'text-slate-600',
  'completed': 'text-rose-600',
  'end': 'text-emerald-600',
}