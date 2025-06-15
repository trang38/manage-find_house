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
  ratings?: Rating[];
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
  tenant_confirm: boolean,
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
  data: ContractData | null,
  booking: number,
};

export interface ContractData {
  landlord_fullname: string,
  landlord_email: string,
  landlord_ward: string,
  landlord_address_detail: string,
  landlord_phone_number: string,
  landlord_national_id: string,
  landlord_national_id_date: string,
  landlord_national_id_address: string,
  landlord_id_front_image: string,
  landlord_id_back_image: string,
  landlord_bank_name: string,
  landlord_bank_account: string,
  landlord_bank_account_name: string,

  tenant_fullname: string,
  tenant_email: string,
  tenant_ward: string,
  tenant_address_detail: string,
  tenant_phone_number: string,
  tenant_national_id: string,
  tenant_national_id_date: string,
  tenant_national_id_address: string,
  tenant_id_front_image: string,
  tenant_id_back_image: string,
  tenant_bank_name: string,
  tenant_bank_account: string,
  tenant_bank_account_name: string,

  room_ward: string,
  room_address_detail: string,
  room_type: string,
  room_price: string,
  room_deposit: string,
  room_electric: string,
  room_water: string,
  room_service_price: string,
  room_area: string,
  room_amenities: string,
  room_description: string,

  start_date: string,
  end_date: string,
  payment_day: string,
  terms_landlord: string,
  terms_tenant: string,
}
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

export interface Bill {
  id?: number,
  contract: Contract,
  electric_num?: number | null,
  water_fee?: number | null,
  extra_fees?: number | null,
  total_amount?: number | null,
  content?: string | null,
  confirm_paid?: boolean | null,
  confirm_receive?: boolean | null,
  created_at?: string | null,
  updated_at?: string | null,
}

export interface Bank {
  bin: string,
  name: string,
  short_name: string,
}

export const getBankName = (bin: string, banks: Bank[]) => {
  if (!bin) return '';
  const found = banks?.find(b => b.bin === bin);
  return found ? found.name + ' - ' + found.short_name : bin;
};

export interface VietQRRequest {
  accountNo: string;      
  accountName?: string;    
  acqId: number;            
  amount?: number;         
  addInfo?: string;        
  format?: string;          
  template?: string;       
}

export interface VietQRGenResponse {
  code: string; 
  desc: string; 
  data: {
    acpId: number;         
    accountName: string;   
    qrCode: string;        
    qrDataURL: string;     
}
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  receiver: number;
}

export interface RoomFeedback {
  id: number;
  contract: number;
  landlord: User;
  feedback: string;
  response_to_rating: number;
  created_at: string;
}
export interface Rating {
  id: number;
  tenant: User;
  contract: number;
  rating: number;
  feedback: string;
  created_at: string;
  feedback_obj?: RoomFeedback;
}
