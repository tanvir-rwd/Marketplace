import { User, UserRole, Order } from "./types";

export const DEMO_SUPER_ADMIN = {
  email: "admin@yourwebsite.com",
  password: "Admin@12345",
  role: UserRole.SUPER_ADMIN
};

export const DEMO_REGULAR_ADMIN = {
  email: "admin@demo.com",
  password: "Admin@123",
  role: UserRole.ADMIN
};

export const DEMO_USERS: User[] = [
  { id: "1", username: "super_admin", full_name: "Super Admin", email: "super@admin.com", role: UserRole.SUPER_ADMIN, status: "Active", lastLogin: "2024-03-11 10:30 AM", total_orders: 0, pending_orders: 0, can_sell: 1, is_suspended: 0 },
  { id: "2", username: "admin_pro", full_name: "Pro Admin", email: "admin@pro.com", role: UserRole.ADMIN, status: "Active", lastLogin: "2024-03-11 09:15 AM", total_orders: 0, pending_orders: 0, can_sell: 1, is_suspended: 0 },
  { id: "3", username: "seller_one", full_name: "John Seller", email: "seller@one.com", role: UserRole.SELLER, status: "Active", lastLogin: "2024-03-10 08:45 PM", total_orders: 150, pending_orders: 12, can_sell: 1, is_suspended: 0 },
  { id: "4", username: "user_jane", full_name: "Jane Smith", email: "jane@user.com", role: UserRole.USER, status: "Active", lastLogin: "2024-03-11 07:20 AM", total_orders: 5, pending_orders: 1, can_sell: 0, is_suspended: 0 },
  { id: "5", username: "bad_user", full_name: "Restricted User", email: "bad@user.com", role: UserRole.USER, status: "Suspended", lastLogin: "2024-03-01 12:00 PM", total_orders: 0, pending_orders: 0, can_sell: 0, is_suspended: 1 },
];

export const DEMO_ORDERS: Order[] = [
  { id: "ORD-001", customer: "John Doe", email: "john@example.com", phone: "+1234567890", product: "Premium Subscription", quantity: 1, amount: 99.99, status: "Completed", date: "2024-03-10" },
  { id: "ORD-002", customer: "Michael Brown", email: "michael@example.com", phone: "+1987654321", product: "Basic Plan", quantity: 2, amount: 59.98, status: "Pending", date: "2024-03-11" },
  { id: "ORD-003", customer: "Sarah Wilson", email: "sarah@example.com", phone: "+1122334455", product: "Enterprise License", quantity: 1, amount: 499.99, status: "Completed", date: "2024-03-09" },
  { id: "ORD-004", customer: "David Miller", email: "david@example.com", phone: "+1555666777", product: "Standard Plan", quantity: 1, amount: 59.99, status: "Cancelled", date: "2024-03-08" },
  { id: "ORD-005", customer: "Emma Davis", email: "emma@example.com", phone: "+1444555666", product: "Pro Plan", quantity: 3, amount: 149.97, status: "Processing", date: "2024-03-11" },
  { id: "ORD-006", customer: "James Taylor", email: "james@example.com", phone: "+1777888999", product: "Basic Plan", quantity: 1, amount: 29.99, status: "Pending", date: "2024-03-10" },
];

export const VISITOR_DATA = [
  { name: 'Mon', visitors: 4000, sales: 2400 },
  { name: 'Tue', visitors: 3000, sales: 1398 },
  { name: 'Wed', visitors: 2000, sales: 9800 },
  { name: 'Thu', visitors: 2780, sales: 3908 },
  { name: 'Fri', visitors: 1890, sales: 4800 },
  { name: 'Sat', visitors: 2390, sales: 3800 },
  { name: 'Sun', visitors: 3490, sales: 4300 },
];
