"use server";

import { createClient } from "@/lib/supabase/server";

export interface ReservationFormState {
  ok: boolean;
  error?: string;
}

export async function submitReservation(
  _prev: ReservationFormState,
  formData: FormData
): Promise<ReservationFormState> {
  const full_name = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const party_size = Number(formData.get("party_size"));
  const requested_date = String(formData.get("requested_date") ?? "");
  const requested_time = String(formData.get("requested_time") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!full_name || !phone || !party_size || !requested_date || !requested_time) {
    return { ok: false, error: "Compila tutti i campi obbligatori." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reservation_requests").insert({
    full_name,
    phone,
    email: email || null,
    party_size,
    requested_date,
    requested_time,
    notes,
  });

  if (error) {
    return { ok: false, error: "Impossibile inviare la richiesta. Riprova." };
  }

  return { ok: true };
}
