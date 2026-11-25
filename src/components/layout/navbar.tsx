"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  Repeat,
  Trophy,
  Target,
  ShieldAlert,
  LogOut,
  Coins,
} from "lucide-react";

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    points: number;
  };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Tauler", icon: Sparkles },
    { href: "/questions", label: "Preguntes", icon: HelpCircle },
    { href: "/album", label: "Àlbum", icon: BookOpen },
    { href: "/inventory", label: "Inventari", icon: Layers },
    { href: "/trades", label: "Intercanvis", icon: Repeat },
    { href: "/ranking", label: "Rànquing", icon: Trophy },
    { href: "/missions", label: "Missions", icon: Target },
  ];

  if (user.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin", icon: ShieldAlert });
  }

  const xpPercent = Math.min(100, Math.round((user.xp / (user.xpToNextLevel || 100)) * 100));

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div
                className="rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0"
                style={{ width: "36px", height: "36px" }}
              >
                <Sparkles className="text-white shrink-0" style={{ width: "20px", height: "20px" }} />
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent block leading-tight">
                  ILUSTRUM
                </span>
                <span className="block text-[10px] text-slate-400 font-medium -mt-0.5">
                  Lacetània
                </span>
              </div>
            </Link>

            {/* Enllaços de navegació Desktop */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-600/25 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="shrink-0" style={{ width: "16px", height: "16px" }} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Dades de Gamificació & Usuari */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Nivell i Barra de XP */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Nivell</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold text-xs">
                  {user.level}
                </span>
              </div>
              <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden" style={{ width: "96px", height: "6px" }}>
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Usuari & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/60 transition-colors group"
                title="Veure el meu perfil"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="rounded-full border border-slate-700 bg-slate-800 object-cover shrink-0 group-hover:border-indigo-400 transition-colors"
                    style={{ width: "32px", height: "32px" }}
                  />
                ) : (
                  <div
                    className="rounded-full bg-indigo-700 flex items-center justify-center font-bold text-xs text-white shrink-0 group-hover:bg-indigo-600 transition-colors"
                    style={{ width: "32px", height: "32px" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {user.role === "admin" ? "Administrador" : user.role === "teacher" ? "Professor" : "Alumne"}
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Tancar sessió"
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de navegació Mobile Superior (Desplaçament Horitzontal de suport) */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white bg-slate-900/60"
                }`}
              >
                <Icon style={{ width: "14px", height: "14px" }} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* BARRA INFERIOR FIXA PER A DISPOSITIUS MÒBILS (Estil App Nativa) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1 shadow-2xl safe-area-bottom">
        <div className="grid grid-cols-5 items-center justify-around">
          {[
            { href: "/dashboard", label: "Tauler", icon: Sparkles },
            { href: "/questions", label: "Preguntes", icon: HelpCircle },
            { href: "/album", label: "Àlbum", icon: BookOpen },
            { href: "/trades", label: "Intercanvis", icon: Repeat },
            { href: "/ranking", label: "Rànquing", icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                  isActive
                    ? "text-indigo-400 font-extrabold"
                    : "text-slate-400 hover:text-slate-200 font-medium"
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? "bg-indigo-600/20 text-indigo-400 scale-110" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
