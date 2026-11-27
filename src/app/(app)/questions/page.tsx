"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Award,
  AlertCircle,
  Loader2,
  Zap,
  Mail,
  AlertTriangle,
} from "lucide-react";

interface Answer {
  id: string;
  text: string;
  sortOrder: number;
}

interface Question {
  id: string;
  statement: string;
  difficulty: string;
  points: number;
  xpReward: number;
  recommendedTime: number;
  category: { id: number; name: string; color: string; icon: string | null } | null;
  subject: { id: number; name: string; color: string } | null;
  album?: { id: string; name: string } | null;
  answers: Answer[];
}

interface CardWon {
  id: string;
  name: string;
  number: number;
  description: string | null;
  imageUrl: string | null;
  value: number;
  rarity: {
    name: string;
    colorHex: string;
    glowColor: string;
    sortOrder: number;
  };
  category: {
    name: string;
    color: string;
  } | null;
  isDuplicate: boolean;
  quantityTotal: number;
}

interface AlbumInfo {
  id: string;
  name: string;
  description?: string;
  totalCards?: number;
  ownedCount?: number;
  completionPercentage?: number;
  isEnrolled?: boolean;
}

interface DailyStatus {
  dailyLimit: number;
  attemptsToday: number;
  remainingToday: number;
  isUnlimited: boolean;
  canAnswer: boolean;
}

interface AnswerResult {
  isCorrect: boolean;
  explanation: string | null;
  pointsEarned: number;
  xpEarned: number;
  currentPoints: number;
  currentXp: number;
  currentLevel: number;
  levelUp: boolean;
  secondsUsed: number;
  cardsWonCount: number;
  cardsWon?: CardWon[];
  cardWon?: CardWon;
}

const QUESTION_TIMEOUT = 20; // 20 segons per pregunta segons especificació

export default function QuestionsPage() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [dailyLimitReached, setDailyLimitReached] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIMEOUT);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [showCardModal, setShowCardModal] = useState(false);

  // Gestió d'àlbums i selecció obligatòria
  const [userAlbums, setUserAlbums] = useState<AlbumInfo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumInfo | null>(null);
  const [noEnrollments, setNoEnrollments] = useState(false);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Carregar llista d'àlbums
  const loadAlbums = useCallback(async () => {
    setLoadingAlbums(true);
    try {
      const res = await fetch("/api/album");
      const data = await res.json();
      if (res.ok && data.albums) {
        setUserAlbums(data.albums);
      }
    } catch (e) {
      console.error("Error carregant àlbums:", e);
    } finally {
      setLoadingAlbums(false);
    }
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  // Carregar una pregunta nova per a l'àlbum triat
  const fetchNewQuestion = useCallback(async (albumIdOverride?: string) => {
    const targetAlbumId = albumIdOverride || selectedAlbum?.id;
    if (!targetAlbumId) return;

    setLoading(true);
    setError(null);
    setSelectedAnswerId(null);
    setResult(null);
    setShowCardModal(false);
    setNoEnrollments(false);

    const url = `/api/questions/random?albumId=${encodeURIComponent(targetAlbumId)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.noEnrollments) {
        setNoEnrollments(true);
        if (data.dailyStatus) setDailyStatus(data.dailyStatus);
        setQuestion(null);
        setLoading(false);
        return;
      }

      if (res.status === 429 || data.dailyLimitReached) {
        setDailyLimitReached(true);
        if (data.dailyStatus) setDailyStatus(data.dailyStatus);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "No s'ha pogut carregar cap pregunta per a aquest àlbum.");
        setQuestion(null);
        setLoading(false);
        return;
      }

      setQuestion(data.question);
      if (data.dailyStatus) setDailyStatus(data.dailyStatus);
      setTimeLeft(QUESTION_TIMEOUT);
      setTimerActive(true);
    } catch {
      setError("Error de connexió amb el servidor.");
    } finally {
      setLoading(false);
    }
  }, [selectedAlbum]);

  // Triar un àlbum per respondre preguntes
  const handleSelectAlbum = async (album: AlbumInfo) => {
    setSelectedAlbum(album);
    // Si l'usuari encara no estava inscrit, l'inscrivim automàticament
    if (!album.isEnrolled) {
      try {
        await fetch("/api/album/enroll", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumId: album.id }),
        });
        setUserAlbums((prev) =>
          prev.map((a) => (a.id === album.id ? { ...a, isEnrolled: true } : a))
        );
      } catch (e) {
        console.error("Error auto-inscrivint:", e);
      }
    }
    fetchNewQuestion(album.id);
  };

  // Tornar a la pantalla de triar àlbum
  const handleBackToAlbumPicker = () => {
    setSelectedAlbum(null);
    setQuestion(null);
    setResult(null);
    setError(null);
    setTimerActive(false);
    loadAlbums();
  };

  // Commutar participació en un àlbum des de la pantalla de preguntes
  const handleToggleEnrollment = async (albumId: string) => {
    setEnrollingId(albumId);
    try {
      const res = await fetch("/api/album/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserAlbums((prev) =>
          prev.map((a) => (a.id === albumId ? { ...a, isEnrolled: data.isEnrolled } : a))
        );
        // Recarregar preguntes
        fetchNewQuestion();
      }
    } catch (e) {
      console.error("Error canviant inscripció:", e);
    } finally {
      setEnrollingId(null);
    }
  };

  // Gestió del temporitzador (20 segons)
  useEffect(() => {
    if (!timerActive || timeLeft <= 0 || result !== null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, result]);

  // Enviar resposta
  const handleAnswerSubmit = async (answerId: string) => {
    if (!question || submitting || result !== null || timeLeft <= 0) return;

    const secondsUsed = Math.max(1, QUESTION_TIMEOUT - timeLeft);
    setSelectedAnswerId(answerId);
    setSubmitting(true);
    setTimerActive(false);

    try {
      const res = await fetch(`/api/questions/${question.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerId, secondsUsed }),
      });

      const data: AnswerResult = await res.json();

      if (!res.ok) {
        setError("Error processant la resposta.");
        setSubmitting(false);
        return;
      }

      setResult(data);

      // Si ha guanyat cromos, obrir modal de celebració
      if (data.cardsWon && data.cardsWon.length > 0) {
        setShowCardModal(true);
      }
    } catch {
      setError("Error de xarxa en enviar la resposta.");
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "easy":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Fàcil</span>;
      case "hard":
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Difícil</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Mitjana</span>;
    }
  };

  // Recompensa en sobres segons el compte enrere
  // Els 10 primers (20s a 10s restants) -> 3 sobres
  // Del segon 10 al 15 (10s a 5s restants) -> 2 sobres
  // Últims 5 segons (5s a 1s restants) -> 1 sobre
  // Temps esgotat (0s) -> 0 sobres
  const getRewardTierInfo = () => {
    if (timeLeft > 10) {
      return {
        cards: 3,
        label: "3 Sobres",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        barColor: "from-emerald-500 to-green-400",
      };
    } else if (timeLeft > 5) {
      return {
        cards: 2,
        label: "2 Sobres",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        barColor: "from-amber-500 to-yellow-400",
      };
    } else if (timeLeft > 0) {
      return {
        cards: 1,
        label: "1 Sobre",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
        barColor: "from-orange-500 to-rose-600",
      };
    } else {
      return {
        cards: 0,
        label: "0 Sobres (Temps Esgotat)",
        color: "text-slate-500 bg-slate-800 border-slate-700",
        barColor: "bg-slate-700",
      };
    }
  };

  const currentTier = getRewardTierInfo();
  const timePercent = Math.max(0, Math.min(100, (timeLeft / QUESTION_TIMEOUT) * 100));

  const isUrgent = timeLeft <= 5 && timeLeft > 0 && result === null;
  const isWarning = timeLeft <= 10 && timeLeft > 5 && result === null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Capçalera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <HelpCircle className="w-7 h-7 text-indigo-400" />
              <span>Repte del Coneixement SMIX</span>
            </h1>

            {dailyStatus && (
              dailyStatus.isUnlimited ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ♾️ Mode Proves: Il·limitat
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  🎯 {dailyStatus.attemptsToday} / {dailyStatus.dailyLimit} avui ({dailyStatus.remainingToday} restants)
                </span>
              )
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Contesta abans que s&apos;esgoti el temps per aconseguir fins a 3 sobres de cromos!
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dailyStatus && (
            dailyStatus.isUnlimited ? (
              <span className="sm:hidden px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ♾️ Il·limitat
              </span>
            ) : (
              <span className="sm:hidden px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                🎯 {dailyStatus.attemptsToday}/{dailyStatus.dailyLimit}
              </span>
            )
          )}
          <a
            href="/dashboard"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Tornar al Tauler
          </a>
        </div>
      </div>

      {/* PANTALLA 1: SELECCIÓ D'ÀLBUM OBLIGATÒRIA (quan selectedAlbum === null) */}
      {!selectedAlbum && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pas 1: Tria la teva aventura</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              De quin àlbum vols respondre preguntes?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Totes les preguntes que contestis i els sobres de cromos que guanyis seran exclusivament de l&apos;àlbum que triïs.
            </p>
          </div>

          {loadingAlbums && (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-sm font-medium text-slate-400">Carregant els àlbums disponibles...</p>
            </div>
          )}

          {!loadingAlbums && userAlbums.length === 0 && (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <p className="text-sm text-slate-400">No s&apos;ha trobat cap àlbum disponible actualment.</p>
            </div>
          )}

          {!loadingAlbums && userAlbums.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAlbums.map((album) => {
                const isMusicTrista = album.id.includes("musica-trista");
                const isMusicPower = album.id.includes("musica-bemparida");
                const isHardware = album.id.includes("hardware");
                const isSistemes = album.id.includes("sistemes");

                let icon = "📚";
                let badgeColor = "bg-indigo-500/10 border-indigo-500/30 text-indigo-300";
                let gradient = "from-indigo-950/40 to-slate-900";

                if (isMusicTrista) {
                  icon = "🎵";
                  badgeColor = "bg-blue-500/10 border-blue-500/30 text-blue-300";
                  gradient = "from-blue-950/40 to-slate-900";
                } else if (isMusicPower) {
                  icon = "⚡";
                  badgeColor = "bg-amber-500/10 border-amber-500/30 text-amber-300";
                  gradient = "from-amber-950/40 to-slate-900";
                } else if (isHardware) {
                  icon = "🖥️";
                  badgeColor = "bg-cyan-500/10 border-cyan-500/30 text-cyan-300";
                  gradient = "from-cyan-950/40 to-slate-900";
                } else if (isSistemes) {
                  icon = "🌐";
                  badgeColor = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                  gradient = "from-emerald-950/40 to-slate-900";
                }

                return (
                  <div
                    key={album.id}
                    className={`p-6 rounded-3xl bg-gradient-to-b ${gradient} border border-slate-800 hover:border-indigo-500/60 transition-all flex flex-col justify-between space-y-4 shadow-xl hover:shadow-2xl group`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                          {icon}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${badgeColor}`}>
                          {album.totalCards || 50} cromos
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                          {album.name}
                        </h3>
                        {album.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {album.description}
                          </p>
                        )}
                      </div>

                      {album.completionPercentage !== undefined && (
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-slate-400">
                            <span>Completat:</span>
                            <span className="font-bold text-white">{album.completionPercentage}%</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${album.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectAlbum(album)}
                      className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                    >
                      <span>Respondre preguntes d&apos;aquest àlbum</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PANTALLA 2: JOC DE PREGUNTES (quan selectedAlbum !== null) */}
      {selectedAlbum && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Banner indicador de l'àlbum triat i botó per canviar */}
          <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-xl">
                📖
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Àlbum seleccionat
                </div>
                <div className="font-extrabold text-white text-sm sm:text-base">
                  {selectedAlbum.name}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackToAlbumPicker}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <span>🔄 Canviar d&apos;àlbum</span>
            </button>
          </div>

          {/* Estat sense àlbums inscrits */}
          {!loading && noEnrollments && (
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/40 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
                ⏸️
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  No estàs participant en aquest àlbum!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Per rebre preguntes i començar a col·leccionar cromos, has d&apos;activar la participació.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSelectAlbum(selectedAlbum)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Activar participació i començar
              </button>
            </div>
          )}

      {/* Estat de límit diari assolit */}
      {!loading && dailyLimitReached && (
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-inner">
            <Award className="w-10 h-10 text-indigo-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Entrenament d&apos;avui completat!
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              Has contestat les <span className="font-bold text-indigo-400">{dailyStatus?.dailyLimit || 10} preguntes</span> diàries autoritzades.
              Per garantir un aprenentatge constant i equilibrat, demà a les 00:00 tindràs una nova tanda de 10 preguntes per aconseguir més sobres!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Tornaràs a tenir preguntes disponibles demà a la mitjanit.</span>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/album"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Girar pàgines de l&apos;Àlbum</span>
            </a>
            <a
              href="/trades"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Mercat d&apos;Intercanvis</span>
            </a>
          </div>
        </div>
      )}

      {/* Estat de càrrega */}
      {loading && (
        <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Carregant la següent pregunta...</p>
        </div>
      )}

      {/* Estat d'error */}
      {!loading && !dailyLimitReached && error && (
        <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200">{error}</p>
          <button
            type="button"
            onClick={() => fetchNewQuestion()}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
          >
            Tornar a provar
          </button>
        </div>
      )}

      {/* Targeta de la Pregunta */}
      {!loading && !dailyLimitReached && question && (
        <div
          className={`p-6 sm:p-8 rounded-3xl bg-slate-900 border transition-all duration-300 shadow-xl space-y-6 ${
            isUrgent
              ? "border-rose-500 ring-4 ring-rose-500/30 animate-pulse bg-gradient-to-b from-rose-950/30 to-slate-900"
              : isWarning
              ? "border-amber-500/80 ring-2 ring-amber-500/20"
              : "border-slate-800"
          }`}
        >
          {/* Metadades, Sobres Tancats & Temporitzador */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {question.album && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-indigo-500/15 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Àlbum: {question.album.name.split("(")[0].trim()}</span>
                </span>
              )}

              {question.subject && (
                <span
                  className="px-2.5 py-1 rounded-xl text-xs font-bold border"
                  style={{
                    backgroundColor: `${question.subject.color}15`,
                    borderColor: `${question.subject.color}40`,
                    color: question.subject.color,
                  }}
                >
                  {question.subject.name}
                </span>
              )}

              {question.category && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {question.category.name}
                </span>
              )}

              {getDifficultyBadge(question.difficulty)}
            </div>

            {/* SECCIÓ DELS 3 SOBRES TANCATS & COMPTE ENRERE */}
            <div className="flex items-center gap-3">
              {/* Visualitzador de sobres (3, 2, 1 o 0) */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
                {[1, 2, 3].map((num) => {
                  const isAvailable = currentTier.cards >= num;
                  return (
                    <div
                      key={num}
                      className={`relative flex items-center justify-center rounded-xl transition-all duration-300 ${
                        isAvailable
                          ? "bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-300 text-slate-950 shadow-md shadow-amber-500/30 scale-100 ring-1 ring-amber-200"
                          : "bg-slate-900 border border-slate-800 text-slate-600 scale-90 opacity-30"
                      }`}
                      style={{ width: "36px", height: "30px" }}
                      title={isAvailable ? `Sobre ${num} actiu (tancat)` : `Sobre ${num} perdut pel temps`}
                    >
                      <span className="text-sm select-none">✉️</span>
                      {isAvailable && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Temporitzador amb visibilitat creixent */}
              <div
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border font-black text-xs transition-all ${
                  isUrgent
                    ? "bg-rose-600 text-white border-rose-400 animate-bounce shadow-lg shadow-rose-600/50 scale-105"
                    : isWarning
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                    : "bg-slate-800 text-slate-200 border-slate-700"
                }`}
              >
                <Clock className={`w-4 h-4 ${isUrgent ? "animate-spin" : ""}`} />
                <span className="text-sm">{timeLeft}s</span>
              </div>
            </div>
          </div>

          {/* Avís visual creixent de temps */}
          {isUrgent && (
            <div className="p-3 rounded-2xl bg-rose-600 text-white text-xs font-black flex items-center justify-center gap-2 animate-pulse shadow-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>ÚLTIMS 5 SEGONS! Respon ara o perdràs l&apos;últim sobre disponible!</span>
            </div>
          )}

          {isWarning && (
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Temps avançant! Queden 2 sobres tancats.</span>
            </div>
          )}

          {/* Barra de compte enrere visual de 20s */}
          <div className="space-y-1">
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className={`bg-gradient-to-r ${currentTier.barColor} h-full rounded-full transition-all duration-300`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 px-1 font-semibold">
              <span className={timeLeft > 10 ? "text-emerald-400 font-bold" : "text-slate-500 line-through"}>
                0-10s: 3 sobres ✉️✉️✉️
              </span>
              <span className={timeLeft <= 10 && timeLeft > 5 ? "text-amber-400 font-bold" : "text-slate-500"}>
                10-15s: 2 sobres ✉️✉️
              </span>
              <span className={timeLeft <= 5 && timeLeft > 0 ? "text-rose-400 font-bold" : "text-slate-500"}>
                15-20s: 1 sobre ✉️
              </span>
            </div>
          </div>

          {/* Enunciat */}
          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
              {question.statement}
            </h2>
          </div>

          {/* SI EL TEMPS S'HA ESGOTAT (0 SEGONS): NO DEIXAR RESPONDRE I MOSTRAR AVÍS AMB BOTÓ "SEGÜENT" */}
          {timeLeft <= 0 && result === null ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-950/40 border-2 border-rose-500/80 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-rose-600/20 border-2 border-rose-500 text-rose-300 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-rose-500/20">
                ⏰
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight">TEMPS ESGOTAT!</h3>
                <p className="text-xs sm:text-sm text-rose-200/90 max-w-md mx-auto">
                  S&apos;han acabat els 20 segons per respondre. No s&apos;ha obtingut cap sobre de cromos en aquest torn.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fetchNewQuestion()}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 mx-auto transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Següent Pregunta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Llista d'opcions de resposta actives */
            <div className="grid grid-cols-1 gap-3 pt-2">
              {question.answers.map((answer, index) => {
                const letter = String.fromCharCode(65 + index);
                const isSelected = selectedAnswerId === answer.id;

                return (
                  <button
                    key={answer.id}
                    type="button"
                    disabled={submitting || result !== null || timeLeft <= 0}
                    onClick={() => handleAnswerSubmit(answer.id)}
                    className={`w-full p-4 rounded-2xl border text-left font-medium transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? "bg-indigo-600/30 border-indigo-500 text-white shadow-lg"
                        : "bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:border-slate-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-semibold">{answer.text}</span>
                    </div>

                    {isSelected && submitting && (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Resultat de la resposta un cop contestat */}
          {result && (
            <div
              className={`p-6 rounded-2xl border animate-in fade-in duration-300 space-y-4 ${
                result.isCorrect
                  ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                  : "bg-rose-950/30 border-rose-500/30 text-rose-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-white">
                      {result.isCorrect ? "Correcte! Molt bona feina!" : "Incorrecte"}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-900 border border-slate-700 text-indigo-300">
                        +{result.xpEarned} XP
                      </span>
                    </div>
                  </div>

                  {result.explanation && (
                    <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                      <strong>Explicació:</strong> {result.explanation}
                    </p>
                  )}

                  {/* Resum de sobres/cromos obtinguts */}
                  {result.isCorrect && (
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          Temps: {result.secondsUsed}s · Has guanyat {result.cardsWonCount} {result.cardsWonCount === 1 ? "sobre de cromos" : "sobres de cromos"}!
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botons d'acció */}
              <div className="pt-2 flex items-center justify-end gap-3">
                {result.cardsWon && result.cardsWon.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCardModal(true)}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-300" />
                    <span>Obrir Sobres ({result.cardsWon.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fetchNewQuestion()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <span>Següent Pregunta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL D'OBERTURA DELS SOBRES GUANYATS (1, 2 o 3) */}
      {showCardModal && result?.cardsWon && result.cardsWon.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-xl max-h-[92vh] sm:max-h-[90vh] rounded-3xl bg-slate-900 border border-indigo-500/40 p-4 sm:p-6 text-center shadow-2xl relative flex flex-col justify-between overflow-hidden my-auto">
            {/* Capçalera compacta */}
            <div className="relative z-10 shrink-0">
              <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                🎉 SOBRES OBERTS AMB ÈXIT!
              </span>
              <h3 className="text-lg sm:text-2xl font-black text-white">
                Has obtingut {result.cardsWon.length} {result.cardsWon.length === 1 ? "cromo nou" : "cromos"}!
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">
                Contestat en {result.secondsUsed}s · Afegits al teu àlbum i inventari
              </p>
            </div>

            {/* Graella dels Cromos revelats adaptada a mòbils (en mòbil 3 en fila compactes o scroll contingut) */}
            <div className="overflow-y-auto my-2 py-1 px-1 max-h-[52vh] sm:max-h-none">
              <div
                className={`grid gap-2 sm:gap-4 ${
                  result.cardsWon.length === 1
                    ? "grid-cols-1 max-w-[200px] sm:max-w-xs mx-auto"
                    : result.cardsWon.length === 2
                    ? "grid-cols-2 max-w-md mx-auto"
                    : "grid-cols-3 max-w-lg mx-auto"
                }`}
              >
                {result.cardsWon.map((card, idx) => (
                  <div
                    key={`${card.id}-${idx}`}
                    className="p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center justify-between relative shadow-lg"
                    style={{
                      backgroundColor: "#0f172a",
                      borderColor: card.rarity.colorHex,
                      boxShadow: `0 0 14px ${card.rarity.glowColor || card.rarity.colorHex}35`,
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] sm:text-xs font-black text-slate-400">#{card.number}</span>
                      {card.isDuplicate ? (
                        <span className="px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-purple-600 text-white text-[9px] sm:text-[10px] font-black">
                          Rep. ({card.quantityTotal})
                        </span>
                      ) : (
                        <span className="px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black">
                          Nou!
                        </span>
                      )}
                    </div>

                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center my-1 sm:my-2 text-xl sm:text-2xl shadow-inner overflow-hidden">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover rounded-xl sm:rounded-2xl" />
                      ) : (
                        "🃏"
                      )}
                    </div>

                    <div className="text-[11px] sm:text-sm font-extrabold text-white text-center leading-tight line-clamp-2 min-h-[1.75rem] sm:min-h-0 flex items-center justify-center">
                      {card.name}
                    </div>

                    {card.description && (
                      <p className="hidden sm:block text-[10px] text-slate-400 mt-1 text-center line-clamp-2">
                        {card.description}
                      </p>
                    )}

                    <div
                      className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider truncate max-w-full"
                      style={{
                        backgroundColor: `${card.rarity.colorHex}25`,
                        color: card.rarity.colorHex,
                        border: `1px solid ${card.rarity.colorHex}60`,
                      }}
                    >
                      {card.rarity.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botons del modal sempre visibles i accessibles sense scroll */}
            <div className="flex gap-2 sm:gap-3 pt-2 shrink-0 max-w-md mx-auto w-full">
              <a
                href="/album"
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Veure Àlbum</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setShowCardModal(false);
                  fetchNewQuestion();
                }}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Següent Pregunta</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
