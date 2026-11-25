"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Layers,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface RankingUser {
  position: number;
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  level: number;
  points: number;
  totalPoints: number;
  uniqueCards: number;
  correctAnswers: number;
  totalAnswers: number;
  isCurrentUser: boolean;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRanking() {
      try {
        const res = await fetch("/api/ranking");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "No s'ha pogut carregar el rànquing.");
          return;
        }

        setRanking(data.ranking || []);
      } catch {
        setError("Error de connexió carregant la classificació.");
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Capçalera */}
      <div className="text-center space-y-2">
        <div
          className="inline-flex items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-1"
          style={{ width: "48px", height: "48px" }}
        >
          <Trophy style={{ width: "24px", height: "24px" }} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Classificació General de l&apos;Institut
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Compara el teu progrés, punts i cromos amb la resta de companys de l&apos;Institut Lacetània!
        </p>
      </div>

      {loading && (
        <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Calculant posicions del rànquing...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {!loading && ranking.length > 0 && (
        <>
          {/* PODI DELS 3 MILLORS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 items-end">
            {/* 2n Lloc (Plata) */}
            {top3[1] && (
              <div
                className={`p-6 rounded-3xl border-2 text-center flex flex-col items-center justify-between order-2 sm:order-1 ${
                  top3[1].isCurrentUser
                    ? "bg-indigo-950/40 border-indigo-500 shadow-xl"
                    : "bg-slate-900 border-slate-700/80"
                }`}
                style={{ minHeight: "220px" }}
              >
                <div
                  className="rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-black text-sm mb-2"
                  style={{ width: "36px", height: "36px" }}
                >
                  2
                </div>
                <div className="text-3xl mb-1">🥈</div>
                <div className="font-extrabold text-white text-base truncate max-w-full">
                  {top3[1].name}
                  {top3[1].isCurrentUser && <span className="text-indigo-400 text-xs ml-1">(Tu)</span>}
                </div>
                <div className="text-xs text-slate-400">Nivell {top3[1].level}</div>
                <div className="mt-2 text-base font-black text-indigo-400">
                  {top3[1].uniqueCards} cromos
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {top3[1].correctAnswers} encerts
                </div>
              </div>
            )}

            {/* 1r Lloc (Or) */}
            {top3[0] && (
              <div
                className={`p-6 sm:p-8 rounded-3xl border-2 text-center flex flex-col items-center justify-between order-1 sm:order-2 shadow-2xl relative ${
                  top3[0].isCurrentUser
                    ? "bg-amber-950/40 border-amber-500"
                    : "bg-slate-900 border-amber-500/50"
                }`}
                style={{
                  minHeight: "260px",
                  boxShadow: "0 0 30px rgba(245, 158, 11, 0.2)",
                }}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Crown style={{ width: "12px", height: "12px" }} />
                  <span>Campió</span>
                </div>

                <div
                  className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-black text-base mb-2 mt-1"
                  style={{ width: "42px", height: "42px" }}
                >
                  1
                </div>
                <div className="text-4xl mb-1">🥇</div>
                <div className="font-black text-white text-lg truncate max-w-full">
                  {top3[0].name}
                  {top3[0].isCurrentUser && <span className="text-amber-400 text-xs ml-1">(Tu)</span>}
                </div>
                <div className="text-xs text-amber-300 font-semibold">Nivell {top3[0].level}</div>
                <div className="mt-2 text-lg font-black text-amber-400">
                  {top3[0].uniqueCards} cromos
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {top3[0].correctAnswers} encerts
                </div>
              </div>
            )}

            {/* 3r Lloc (Bronze) */}
            {top3[2] && (
              <div
                className={`p-6 rounded-3xl border-2 text-center flex flex-col items-center justify-between order-3 sm:order-3 ${
                  top3[2].isCurrentUser
                    ? "bg-indigo-950/40 border-indigo-500 shadow-xl"
                    : "bg-slate-900 border-amber-700/60"
                }`}
                style={{ minHeight: "200px" }}
              >
                <div
                  className="rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center font-black text-sm mb-2"
                  style={{ width: "36px", height: "36px" }}
                >
                  3
                </div>
                <div className="text-3xl mb-1">🥉</div>
                <div className="font-extrabold text-white text-base truncate max-w-full">
                  {top3[2].name}
                  {top3[2].isCurrentUser && <span className="text-indigo-400 text-xs ml-1">(Tu)</span>}
                </div>
                <div className="text-xs text-slate-400">Nivell {top3[2].level}</div>
                <div className="mt-2 text-base font-black text-amber-500">
                  {top3[2].uniqueCards} cromos
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {top3[2].correctAnswers} encerts
                </div>
              </div>
            )}
          </div>

          {/* TAULA DE CLASSIFICACIÓ COMPLETA */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Medal className="text-amber-400" style={{ width: "18px", height: "18px" }} />
                <span>Taula de Classificació</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Top 50 alumnes</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 text-center w-14">Pos.</th>
                    <th className="p-3.5">Alumne</th>
                    <th className="p-3.5">Nivell</th>
                    <th className="p-3.5">Cromos a l&apos;Àlbum</th>
                    <th className="p-3.5 text-right">Encerts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {ranking.map((u) => (
                    <tr
                      key={u.id}
                      className={`transition-colors ${
                        u.isCurrentUser
                          ? "bg-indigo-950/40 hover:bg-indigo-950/60 font-bold"
                          : "hover:bg-slate-800/40 text-slate-300"
                      }`}
                    >
                      <td className="p-3.5 text-center font-black">
                        {u.position === 1 ? (
                          "🥇"
                        ) : u.position === 2 ? (
                          "🥈"
                        ) : u.position === 3 ? (
                          "🥉"
                        ) : (
                          <span className="text-slate-500">#{u.position}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ width: "28px", height: "28px" }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-white block font-semibold">
                              {u.name} {u.isCurrentUser && <span className="text-indigo-400 text-[10px] font-black">(Tu)</span>}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                          Nivell {u.level}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        <span className="px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-mono">
                          {u.uniqueCards} cromos
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-300">
                        {u.correctAnswers} encerts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
