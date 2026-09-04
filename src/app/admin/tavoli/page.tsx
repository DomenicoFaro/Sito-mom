import { createClient } from "@/lib/supabase/server";
import type { RestaurantTable } from "@/lib/types";
import { TablesAdmin } from "./TablesAdmin";

export const metadata = { title: "Backoffice · Tavoli" };

export default async function AdminTavoliPage() {
  const supabase = await createClient();
  const { data: tables } = await supabase
    .from("restaurant_tables")
    .select("*")
    .order("label");

  return <TablesAdmin tables={(tables as RestaurantTable[]) ?? []} />;
}
