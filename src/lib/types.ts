export type StaffRole = "cucina" | "sala" | "cassa" | "admin";

export type TableStatus = "libero" | "occupato" | "in_attesa_conto";

export type MenuType = "carta" | "ayce";

export type OrderStatus = "aperto" | "in_attesa_conto" | "chiuso" | "annullato";

export type OrderItemStatus =
  | "ricevuto"
  | "in_preparazione"
  | "pronto"
  | "servito"
  | "annullato";

export type MenuTag =
  | "piccante"
  | "vegetariano"
  | "gluten_free"
  | "nuovo"
  | "best_seller";

export interface RestaurantTable {
  id: string;
  label: string;
  seats: number;
  status: TableStatus;
  qr_token: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
  menu_type: MenuType;
  ayce_surcharge_cents: number;
  photo_url: string | null;
  allergens: string[];
  tags: string[];
  available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  table_id: string;
  status: OrderStatus;
  menu_mode: MenuType;
  guest_count: number;
  created_at: string;
  closed_at: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  round: number;
  quantity: number;
  unit_price_cents: number;
  notes: string;
  status: OrderItemStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItemWithMenuItem extends OrderItem {
  menu_items: Pick<MenuItem, "id" | "name" | "photo_url" | "category_id">;
}

export interface OrderWithItems extends Order {
  order_items: OrderItemWithMenuItem[];
  restaurant_tables: Pick<RestaurantTable, "id" | "label">;
}

export interface StaffProfile {
  id: string;
  full_name: string;
  role: StaffRole;
  active: boolean;
  created_at: string;
}

export interface ReservationRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  party_size: number;
  requested_date: string;
  requested_time: string;
  notes: string;
  status: string;
  created_at: string;
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
  });
}
