"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Award,
  Flame,
  CheckCircle2,
  BookOpen,
  Repeat,
  Sparkles,
  Layers,
  Calendar,
  Save,
  Check,
  Shield,
  Coins,
} from "lucide-react";

interface ProfileData {
  user: {
    id: string;
    name: string;
    displayName: string;
    email: string;
    avatar: string | null;
    role: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    points: number;
    totalPoints: number;
    createdAt: string;
  };
  stats: {
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number;
    currentStreak: number;
    tradesCompleted: number;
    uniqueCards: number;
    totalCards: number;
    totalAlbumCards: number;
    albumCompletionPercent: number;
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    earned: boolean;
    earnedAt: string | null;
  }>;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "badges" | "edit">("stats");

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setDisplayName(json.user.displayName);
        setAvatarUrl(json.user.avatar || "");
      }
    } catch (err) {
      console.error("Error carregant el perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, avatar: avatarUrl }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        fetchProfile();
      }
    } catch (err) {
      console.error("Error desant el perfil:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div
          className="rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin shrink-0"
          style={{ width: "40px", height: "40px" }}
        />
        <p className="text-slate-400 text-sm font-medium">Carregant perfil d'alumne...</p>
      </div>
    );
  }

  const { user, stats, badges } = data;
  const xpPercent = Math.min(100, Math.round((user.xp / (user.xpToNextLevel || 100)) * 100));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header targeta d'usuari */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar gran */}
          <div className="relative shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="rounded-3xl border-2 border-indigo-500/40 object-cover shadow-2xl bg-slate-800"
                style={{ width: "112px", height: "112px" }}
              />
            ) : (
              <div
                className="rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-extrabold shadow-2xl shrink-0"
                style={{ width: "112px", height: "112px" }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-indigo-600 border border-indigo-400 text-white font-black text-xs shadow-lg">
              Nv. {user.level}
            </div>
          </div>

          {/* Dades d'identitat */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {user.displayName}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.role === "admin" ? "Administrador" : user.role === "teacher" ? "Professor" : "Alumne"}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Shield className="shrink-0" style={{ width: "12px", height: "12px" }} />
                  @lacetania.cat
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm">{user.email}</p>

            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="shrink-0 text-slate-500" style={{ width: "14px", height: "14px" }} />
                <span>Membre des de {new Date(user.createdAt).toLocaleDateString("ca-ES")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Coins className="shrink-0" style={{ width: "14px", height: "14px" }} />
                <span>{user.points} punts</span>
              </div>
            </div>

            {/* Barra de progrés de nivell */}
            <div className="pt-3 max-w-md">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-indigo-300">Progrés Nivell {user.level}</span>
                <span className="text-slate-400">
                  {user.xp} / {user.xpToNextLevel} XP ({xpPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/60" style={{ height: "8px" }}>
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "stats"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Estadístiques & Progrés
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "badges"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Award className="shrink-0" style={{ width: "16px", height: "16px" }} />
          <span>Insígnies ({badges.filter((b) => b.earned).length}/{badges.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "edit"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          Editar Perfil
        </button>
      </div>

      {/* Contingut Tab: Estadístiques */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Àlbum Completat</span>
              <BookOpen className="text-indigo-400 shrink-0" style={{ width: "20px", height: "20px" }} />
            </div>
            <div className="text-2xl font-black text-white">{stats.albumCompletionPercent}%</div>
            <p className="text-xs text-slate-500">
              {stats.uniqueCards} de {stats.totalAlbumCards} cromos únics
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Preguntes Contestades</span>
              <CheckCircle2 className="text-emerald-400 shrink-0" style={{ width: "20px", height: "20px" }} />
            </div>
            <div className="text-2xl font-black text-white">{stats.questionsAnswered}</div>
            <p className="text-xs text-emerald-400 font-semibold">
              {stats.accuracy}% d'encerts ({stats.correctAnswers} correctes)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Ratxa de Respostes</span>
              <Flame className="text-amber-400 shrink-0" style={{ width: "20px", height: "20px" }} />
            </div>
            <div className="text-2xl font-black text-white">{stats.currentStreak} dies</div>
            <p className="text-xs text-slate-500">Dies actiu consecutius</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Intercanvis Realitzats</span>
              <Repeat className="text-cyan-400 shrink-0" style={{ width: "20px", height: "20px" }} />
            </div>
            <div className="text-2xl font-black text-white">{stats.tradesCompleted}</div>
            <p className="text-xs text-slate-500">Total cromos en inventari: {stats.totalCards}</p>
          </div>
        </div>
      )}

      {/* Contingut Tab: Insígnies */}
      {activeTab === "badges" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all ${
                badge.earned
                  ? "bg-slate-900/90 border-amber-500/30 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/20"
                  : "bg-slate-950/40 border-slate-800/60 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`rounded-2xl p-2.5 shrink-0 flex items-center justify-center ${
                    badge.earned
                      ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30"
                      : "bg-slate-800 text-slate-500"
                  }`}
                  style={{ width: "44px", height: "44px" }}
                >
                  <Award className="shrink-0" style={{ width: "24px", height: "24px" }} />
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-white">{badge.name}</h3>
                    {badge.earned ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Aconseguida
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500">Bloquejada</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-[10px] text-amber-300/80 pt-1 font-medium">
                      Guanyada el {new Date(badge.earnedAt).toLocaleDateString("ca-ES")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contingut Tab: Editar perfil */}
      {activeTab === "edit" && (
        <div className="max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Ajustos del Perfil</h2>
            <p className="text-xs text-slate-400 mt-1">
              Personalitza com et veuen els teus companys a l'àlbum i al rànquing.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nom Visible (Display Name)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="Ex. Laura Mas"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL de l'Avatar (opcional)
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="https://..."
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Pots introduir un enllaç a una foto o avatar personalitzat.
              </p>
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Check className="shrink-0" style={{ width: "16px", height: "16px" }} />
                <span>Perfil actualitzat correctament!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Save className="shrink-0" style={{ width: "16px", height: "16px" }} />
                <span>{saving ? "Desant..." : "Desar Canvis"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
