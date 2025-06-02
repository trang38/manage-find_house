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
  city?: City;
  district?: District;
  ward?: Ward;
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

