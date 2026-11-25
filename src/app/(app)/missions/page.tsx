"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface Mission {
  id: string;
  name: string;
  description: string;
  type: string;
  rewardPoints: number;
  rewardXp: number;
  currentProgress: number;
  target: number;
  percent: number;
  isCompleted: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isEarned: boolean;
  earnedAt: string | null;
}

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMissions() {
      try {
        const res = await fetch("/api/missions");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "No s'han pogut carregar les missions.");
          return;
        }

        setMissions(data.missions || []);
        setBadges(data.badges || []);
      } catch {
        setError("Error de connexió carregant les fites.");
      } finally {
        setLoading(false);
      }
    }

    fetchMissions();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Capçalera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Flame className="w-8 h-8 text-amber-400" />
            <span>Missions i Fites Educatives</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supera reptes, aconsegueix insígnies d&apos;honor i guanya punts i experiència extra.
          </p>
        </div>

        <a
          href="/questions"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md flex items-center gap-1.5 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Respondre Preguntes</span>
        </a>
      </div>

      {loading && (
        <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Carregant les teves missions...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {!loading && (
        <>
          {/* SECCIÓ 1: MISSIONS ACTIVES */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Missions en Curs</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className={`p-6 rounded-3xl border transition-all space-y-3 ${
                    m.isCompleted
                      ? "bg-emerald-950/20 border-emerald-500/40 shadow-lg"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-base">{m.name}</h3>
                        {m.isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                            Completada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {m.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-black text-xs">
                        +{m.rewardPoints} pts
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progrés */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Progrés</span>
                      <span className="text-slate-200">
                        {m.currentProgress} / {m.target} ({m.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          m.isCompleted
                            ? "bg-emerald-400"
                            : "bg-gradient-to-r from-indigo-500 to-purple-500"
                        }`}
                        style={{ width: `${m.percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓ 2: GALERIA D'INSÍGNIES */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Insígnies i Distincions d&apos;Honor</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`p-5 rounded-3xl border text-center flex flex-col items-center justify-between space-y-3 transition-all ${
                    b.isEarned
                      ? "bg-slate-900 border-purple-500/40 shadow-lg"
                      : "bg-slate-950/60 border-slate-800/80 opacity-60"
                  }`}
                  style={{ minHeight: "180px" }}
                >
                  <div
                    className={`rounded-2xl flex items-center justify-center text-3xl shadow-inner border ${
                      b.isEarned
                        ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                        : "bg-slate-900 border-slate-800 text-slate-600"
                    }`}
                    style={{ width: "56px", height: "56px" }}
                  >
                    {b.isEarned ? "🎖️" : <Lock style={{ width: "22px", height: "22px" }} />}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-white line-clamp-1">{b.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                      {b.description}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      b.isEarned
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "text-slate-500"
                    }`}
                  >
                    {b.isEarned ? "Desbloquejada" : "Bloquejada"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
