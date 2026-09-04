import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StaffProfile } from "@/lib/types";

export async function getStaffProfile(): Promise<StaffProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (data as StaffProfile) ?? null;
}
