"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrderItem } from "@/lib/types";

export function useRealtimeOrderItems(orderId: string, initial: OrderItem[]) {
  const [items, setItems] = useState<OrderItem[]>(initial);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-items-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as OrderItem;
              if (prev.some((i) => i.id === row.id)) return prev;
              return [...prev, row];
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as OrderItem;
              return prev.map((i) => (i.id === row.id ? row : i));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as OrderItem;
              return prev.filter((i) => i.id !== row.id);
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return items;
}
