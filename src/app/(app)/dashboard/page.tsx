import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Sparkles,
  BookOpen,
  HelpCircle,
  Repeat,
  Trophy,
  Flame,
  Award,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Carregar estadístiques de cromos de l'usuari
  const [inventoryItems, album, activeMissions, recentBadges] = await Promise.all([
    prisma.userInventory.findMany({
      where: { userId: user.id },
      include: {
        card: {
          include: { rarity: true, category: true },
        },
      },
    }),
    prisma.album.findFirst({
      where: { isActive: true },
      include: {
        cards: {
          include: { rarity: true },
        },
      },
    }),
    prisma.mission.findMany({
      where: { isActive: true },
      take: 3,
    }),
    prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      take: 4,
    }),
  ]);

  const uniqueCardsCount = inventoryItems.length;
  const pastedCardsCount = inventoryItems.filter((item) => item.isPasted).length;
  const totalCardsInAlbum = album?.cards.length || 9;
  const albumPercentage = Math.round((pastedCardsCount / Math.max(1, totalCardsInAlbum)) * 100);

  // Cromos repetits
  const duplicateCardsCount = inventoryItems.reduce(
    (acc, item) => acc + (item.quantity > 1 ? item.quantity - 1 : 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Targeta de Benvinguda Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName || user.name}
                className="rounded-2xl border-2 border-indigo-400/40 shadow-lg object-cover shrink-0"
                style={{ width: "64px", height: "64px" }}
              />
            ) : (
              <div
                className="rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shrink-0"
                style={{ width: "64px", height: "64px" }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Hola, {user.displayName || user.name}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  Nivell {user.level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Col·lecció oficial de l&apos;Institut Lacetània · {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href="/questions"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <HelpCircle className="shrink-0" style={{ width: "16px", height: "16px" }} />
              <span>Jugar i Guanyar Cromos</span>
              <ArrowRight className="shrink-0" style={{ width: "16px", height: "16px" }} />
            </a>
          </div>
        </div>
      </div>

      {/* Targetes de Mètriques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cromos Enganxats */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enganxats</span>
            <CheckCircle2 className="text-emerald-400 shrink-0" style={{ width: "20px", height: "20px" }} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{pastedCardsCount}</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Cromos fixats a l&apos;àlbum</div>
        </div>

        {/* Àlbum Compleció */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compleció Àlbum</span>
            <BookOpen className="text-indigo-400 shrink-0" style={{ width: "20px", height: "20px" }} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{albumPercentage}%</div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${albumPercentage}%` }} />
          </div>
        </div>

        {/* Cromos Únics */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cromos Únics</span>
            <Trophy className="text-emerald-400 shrink-0" style={{ width: "20px", height: "20px" }} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {uniqueCardsCount} <span className="text-sm font-normal text-slate-500">/ {totalCardsInAlbum}</span>
          </div>
          <div className="text-xs text-emerald-400/80 font-medium mt-1">Col·leccionats</div>
        </div>

        {/* Cromos Repetits per Intercanvi */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Repetits</span>
            <Repeat className="text-purple-400 shrink-0" style={{ width: "20px", height: "20px" }} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{duplicateCardsCount}</div>
          <a href="/trades" className="text-xs text-purple-400 hover:text-purple-300 font-medium mt-1 inline-flex items-center gap-1">
            <span>Anar a intercanvis</span>
            <ArrowRight className="shrink-0" style={{ width: "12px", height: "12px" }} />
          </a>
        </div>
      </div>

      {/* Secció Central: Accions Ràpides & Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panell de l'Àlbum Actiu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="text-indigo-400 shrink-0" style={{ width: "20px", height: "20px" }} />
                  <span>Àlbum: {album?.name || "Pioners del Saber"}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {album?.description || "Col·lecciona tots els cromos de la temporada."}
                </p>
              </div>
              <a
                href="/album"
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Obrir Àlbum
              </a>
            </div>

            {/* Mostrador ràpid dels 9 cromos */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {album?.cards.map((card) => {
                const userCard = inventoryItems.find((inv) => inv.cardId === card.id);
                const isOwned = !!userCard;

                return (
                  <div
                    key={card.id}
                    className={`relative p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center min-h-[110px] ${
                      isOwned
                        ? "bg-slate-800/90 border-indigo-500/40 shadow-md"
                        : "bg-slate-950/60 border-slate-800/60 opacity-60"
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-400 mb-1">
                      #{card.number}
                    </div>
                    <div className="text-xs font-extrabold text-slate-200 line-clamp-1">
                      {isOwned ? card.name : "Bloquejat"}
                    </div>
                    <div
                      className="mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${card.rarity.colorHex}20`,
                        color: card.rarity.colorHex,
                        border: `1px solid ${card.rarity.colorHex}40`,
                      }}
                    >
                      {card.rarity.name}
                    </div>
                    {userCard && userCard.quantity > 1 && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-black">
                        +{userCard.quantity - 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Lateral: Missions & Insígnies */}
        <div className="space-y-6">
          {/* Missions */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Flame className="text-amber-400 shrink-0" style={{ width: "20px", height: "20px" }} />
              <span>Missions en curs</span>
            </h3>

            <div className="space-y-3">
              {activeMissions.map((m) => (
                <div key={m.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>{m.name}</span>
                    <span className="text-amber-400">+{m.rewardXp > 0 ? `${m.rewardXp} XP` : "Recompensa"}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Insígnies obtingudes */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-purple-400 shrink-0" style={{ width: "20px", height: "20px" }} />
              <span>Insígnies ({recentBadges.length})</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {recentBadges.map((ub) => (
                <div
                  key={ub.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-purple-500/20 text-center flex flex-col items-center"
                >
                  <CheckCircle2 className="text-purple-400 mb-1 shrink-0" style={{ width: "20px", height: "20px" }} />
                  <span className="text-xs font-bold text-slate-200 leading-tight">
                    {ub.badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
