export type UserRole = 'customer' | 'driver' | 'admin';
export type VehicleType = 'economy' | 'comfort' | 'xl';
export type DriverApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type RideStatus = 'searching' | 'accepted' | 'arriving' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';
export type DiscountType = 'percentage' | 'fixed';
export type TicketStatus = 'open' | 'in_progress' | 'resolved';
export type NotificationType = 'ride_request' | 'ride_accepted' | 'driver_arriving' | 'ride_completed' | 'payment' | 'system';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  license_number: string | null;
  license_expiry: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: number | null;
  vehicle_color: string | null;
  vehicle_plate: string | null;
  vehicle_type: VehicleType;
  vehicle_image_url: string | null;
  license_image_url: string | null;
  status: DriverApprovalStatus;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  rating: number;
  total_rides: number;
  total_earnings: number;
  created_at: string;
}

export interface Ride {
  id: string;
  customer_id: string;
  driver_id: string | null;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  status: RideStatus;
  vehicle_type: VehicleType;
  estimated_price: number | null;
  final_price: number | null;
  distance_km: number | null;
  duration_minutes: number | null;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  stripe_payment_id: string | null;
  customer_rating: number | null;
  driver_rating: number | null;
  customer_review: string | null;
  driver_review: string | null;
  cancelled_by: string | null;
  cancel_reason: string | null;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}

export interface PricingConfig {
  id: string;
  vehicle_type: VehicleType;
  base_fare: number;
  per_km_rate: number;
  per_minute_rate: number;
  minimum_fare: number;
  surge_multiplier: number;
  is_active: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  expiry_date: string | null;
  is_active: boolean;
}

export interface Transaction {
  id: string;
  ride_id: string;
  driver_id: string;
  customer_id: string;
  gross_amount: number;
  platform_fee: number;
  driver_earning: number;
  status: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  ride_id: string | null;
  subject: string;
  message: string | null;
  status: TicketStatus;
  admin_reply: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  ride_id: string | null;
  created_at: string;
}

export interface RideTracking {
  id: string;
  ride_id: string;
  driver_lat: number;
  driver_lng: number;
  timestamp: string;
}
