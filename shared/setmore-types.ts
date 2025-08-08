// Setmore API types and interfaces

export interface SetmoreConfig {
  refreshToken: string;
  accessToken?: string;
  baseUrl: string;
}

export interface SetmoreTokenResponse {
  response: boolean;
  data: {
    token: {
      access_token: string;
      token_type: string;
      expires_in: number;
      user_id: string;
    };
  };
}

export interface SetmoreService {
  key: string;
  service_name: string;
  staff_keys: string[];
  duration: number;
  buffer_duration?: number;
  cost: number;
  currency: string;
  image_url?: string;
  description?: string;
}

export interface SetmoreStaff {
  key: string;
  first_name: string;
  last_name: string;
  email_id: string;
  country_code: string;
  work_phone: string;
  image_url: string;
  comment: string;
}

export interface SetmoreCustomer {
  key: string;
  first_name: string;
  last_name: string;
  email_id: string;
  country_code: string;
  cell_phone: string;
  work_phone?: string;
  home_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  comment?: string;
}

export interface SetmoreTimeSlot {
  slot_time: string;
  slot_date_time: string;
  is_available: boolean;
}

export interface SetmoreAppointment {
  key?: string;
  start_time: string;
  end_time: string;
  staff_key: string;
  service_key: string;
  customer_key: string;
  label?: string;
  comment?: string;
  cost?: number;
  currency?: string;
}

export interface SetmoreSlotsRequest {
  staff_key: string;
  service_key: string;
  selected_date: string; // DD/MM/YYYY format
  off_hours?: boolean;
  double_booking?: boolean;
  slot_limit?: number;
  timezone?: string;
}

export interface SetmoreAppointmentRequest {
  staff_key: string;
  service_key: string;
  customer_key: string;
  start_time: string; // ISO datetime string
  end_time: string;   // ISO datetime string
  label?: string;
  comment?: string;
}

export interface SetmoreApiResponse<T> {
  response: boolean;
  msg?: string;
  data: T;
}

// Mock data types for development
export interface MockSetmoreData {
  services: SetmoreService[];
  staff: SetmoreStaff[];
  customers: SetmoreCustomer[];
  appointments: SetmoreAppointment[];
}