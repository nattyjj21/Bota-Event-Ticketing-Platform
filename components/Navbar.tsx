"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Bell, Calendar, ChevronDown, LayoutDashboard, LogOut, Shield, Ticket, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading, logout } = useStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => setMounted(true), []);

  const signedIn = mounted && !loading && Boolean(user);

  const dashHref = user?.role === "admin" ? "/admin" : user?.role === "organizer" ? "/dashboard" : "/tickets";

  const signOut = async () => {
    await logout();
    setShowMenu(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080706]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[56px] max-w-[1220px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-[22px] tracking-[0.08em] text-bota-coral">BOTA</Link>
          <nav className="hidden items-center gap-5 text-[12px] font-semibold tracking-wide md:flex">
            <Link href="/#events" className="nav-link text-bota-text hover:text-white">Events</Link>
            <Link href="/clubs" className="nav-link text-bota-text hover:text-white">Clubs</Link>
            {signedIn && <Link href="/tickets" className="nav-link text-bota-text hover:text-white">My Tickets</Link>}
            {signedIn && user?.role === "organizer" && (
              <Link href="/dashboard" className="nav-link text-bota-text hover:text-white">Dashboard</Link>
            )}
            {signedIn && user?.role === "admin" && (
              <Link href="/admin" className="nav-link text-bota-text hover:text-white">Admin</Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {signedIn && (
            <div className="relative">
              <button
                onClick={() => setShowUpdates((v) => !v)}
                className="relative p-2 text-bota-text transition-colors hover:text-white"
                aria-label="Updates"
              >
                <Bell size={20} />
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-bota-coral"></span>
              </button>
              {showUpdates && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/[0.06] bg-[#14120F] p-4 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-bota-text">Updates</h3>
                    <button onClick={() => setShowUpdates(false)} className="text-[10px] font-bold text-bota-muted hover:text-bota-text">CLOSE</button>
                  </div>
                  <div className="rounded-lg p-2 hover:bg-white/5">
                    <div className="text-[11px] font-bold text-bota-text">Welcome to BOTA</div>
                    <div className="text-[10px] text-bota-muted">
                      {user?.role === "organizer"
                        ? "Your organizer tools are ready — approve orders to issue QR tickets."
                        : "Discover and book the best events in Ethiopia."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <Link href="/#events" className="hidden p-2 text-bota-text transition-colors hover:text-white sm:block" aria-label="Browse events">
            <Calendar size={20} />
          </Link>

          {signedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="flex items-center gap-2 rounded-full bg-white/5 p-1 pr-3 transition-colors hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bota-surface text-bota-gold">
                  <User size={16} />
                </div>
                <span className="hidden text-[11px] font-bold uppercase tracking-widest text-bota-text sm:inline">
                  {user?.name?.split(" ")[0] || user?.role}
                </span>
                <ChevronDown size={14} className="text-bota-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-white/[0.06] bg-[#14120F] py-1.5 shadow-2xl">
                  <div className="border-b border-white/[0.06] px-4 py-3">
                    <div className="text-xs font-bold text-white">{user?.name}</div>
                    <div className="text-[10px] text-bota-muted">{user?.email}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="rounded-full bg-bota-coral/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-bota-coral">
                        {user?.role}
                      </span>
                      {user?.organizer && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-bota-muted">
                          {user.organizer.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={dashHref} onClick={() => setShowMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-bota-text hover:bg-white/5">
                    <LayoutDashboard size={14} />
                    {user?.role === "admin" ? "Admin panel" : user?.role === "organizer" ? "Organizer dashboard" : "My tickets"}
                  </Link>
                  {user?.role === "user" && (
                    <Link href="/become-organizer" onClick={() => setShowMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-bota-text hover:bg-white/5">
                      <Shield size={14} /> Become an organizer
                    </Link>
                  )}
                  {(user?.role === "organizer" || user?.role === "admin") && (
                    <Link href="/scan" onClick={() => setShowMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-bota-text hover:bg-white/5">
                      <Ticket size={14} /> Gate scanner
                    </Link>
                  )}
                  <button onClick={signOut} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-red-300 hover:bg-white/5">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-bota-text transition-colors hover:bg-white/5 sm:block">
                Sign In
              </Link>
              <Link href="/signup" className="btn-coral rounded-md bg-bota-coral px-4 py-2 text-xs font-bold text-[#0A0908]">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
