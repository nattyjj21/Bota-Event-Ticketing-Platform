"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "./api-client";

export type Role = "user" | "organizer" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  organizer: {
    id: string;
    businessName: string;
    status: string;
    instagram: string | null;
    tiktok: string | null;
    payoutMethod: string | null;
    payoutAccount: string | null;
  } | null;
};

type Store = {
  user: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  search: string;
  setSearch: (s: string) => void;
  category: string;
  setCategory: (c: string) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
};

const Ctx = createContext<Store>(null as unknown as Store);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<{ user: SessionUser | null }>("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiSend("/api/auth/logout", "POST");
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bota_wishlist");
      if (raw) setWishlist(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bota_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const toggleWishlist = (id: string) =>
    setWishlist((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const value = useMemo(
    () => ({
      user,
      loading,
      refresh,
      logout,
      search,
      setSearch,
      category,
      setCategory,
      wishlist,
      toggleWishlist,
    }),
    [user, loading, refresh, logout, search, category, wishlist]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
