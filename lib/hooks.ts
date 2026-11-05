"use client";
import { useEffect, useState } from "react";
import { apiGet } from "./api-client";
import type { EventItem, OrderDTO } from "./data";

/** Loads the public event catalogue. */
export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet<{ events: EventItem[] }>("/api/events")
      .then((d) => {
        if (mounted) setEvents(d.events);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load events.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { events, loading, error };
}

/** Loads the signed-in buyer's orders. */
export function useMyOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    apiGet<{ orders: OrderDTO[] }>("/api/orders")
      .then((d) => {
        if (mounted) setOrders(d.orders);
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "Failed to load tickets.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { orders, setOrders, loading, error };
}
