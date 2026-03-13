export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  SELLER = "seller",
  USER = "user"
}

export interface User {
  id: number | string;
  username: string;
  email: string;
  full_name?: string;
  contact_number?: string;
  whatsapp_number?: string;
  business_name?: string;
  address?: string;
  profile_image?: string;
  role: UserRole | string;
  pending_role?: string;
  status: string;
  category?: string;
  can_sell?: number;
  is_suspended?: number;
  deletion_requested?: number;
  total_orders?: number;
  pending_orders?: number;
  bkash?: string;
  nagad?: string;
  rocket?: string;
  binance?: string;
  lastLogin?: string;
  lastActive?: string;
}

export interface Order {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  product: string;
  quantity?: number;
  amount: number;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  date: string;
}

export interface StatItem {
  label: string;
  value: string | number;
  change: number;
  icon: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  identifier: string;
  type: string;
  instructions: string;
  is_enabled: number;
}
