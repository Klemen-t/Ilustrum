"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  HandMetal,
  Check,
} from "lucide-react";

interface CardRarity {
  id: number;
  name: string;
  nameKey: string;
  colorHex: string;
  glowColor: string;
  sortOrder: number;
}

interface CardCategory {
  id: number;
  name: string;
  color: string;
}

interface AlbumCard {
  id: string;
  name: string;
  description: string | null;
  number: number;
  imageUrl: string | null;
  pageId: string | null;
  rarity: CardRarity;
  category: CardCategory | null;
  isOwned: boolean;
  isPasted: boolean;
  canPaste: boolean;
  quantity: number;
  duplicates: number;
  obtainedAt: string | null;
  pastedAt: string | null;
}

interface AlbumPageItem {
  id: string;
  pageNum: number;
  layout: string;
}

interface AlbumDetail {
  id: string;
  name: string;
  description: string | null;
  totalCards: number;
  ownedCount: number;
  pastedCount: number;
  totalDuplicates: number;
  completionPercentage: number;
  pages: AlbumPageItem[];
  cards: AlbumCard[];
  unpastedCards: AlbumCard[];
}

interface AlbumSummary {
  id: string;
  name: string;
  description: string | null;
  totalCards: number;
  ownedCount: number;
  completionPercentage: number;
}

const CARDS_PER_PAGE = 10;

export default function AlbumPage() {
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<AlbumCard | null>(null);
  const [pastingCardId, setPastingCardId] = useState<string | null>(null);
  const [justPastedCardId, setJustPastedCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Carregar dades de l'àlbum
  const loadAlbumData = useCallback(async (albumId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = albumId ? `/api/album?albumId=${albumId}` : "/api/album";
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error carregant l'àlbum.");
        return;
      }

      setAlbums(data.albums || []);
      setAlbum(data.album || null);
      if (data.album) {
        setSelectedAlbumId(data.album.id);
      }
    } catch {
      setError("Error de connexió amb el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlbumData();
  }, [loadAlbumData]);

  // Acció d'enganxar un cromo
  const handlePasteCard = async (cardId: string) => {
    setPastingCardId(cardId);
    try {
      const res = await fetch("/api/album/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });

      const data = await res.json();
      if (res.ok) {
        setJustPastedCardId(cardId);
        setTimeout(() => setJustPastedCardId(null), 2500);
        // Recarregar estat de l'àlbum
        if (selectedAlbumId) {
          await loadAlbumData(selectedAlbumId);
        }
      } else {
        alert(data.error || "No s'ha pogut enganxar el cromo.");
      }
    } catch {
      alert("Error de connexió en enganxar el cromo.");
    } finally {
      setPastingCardId(null);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (cardId: string) => {
    setDraggedCardId(cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnSlot = async (slotCardNumber: number) => {
    if (!draggedCardId || !album) return;
    const cardToPaste = album.unpastedCards.find((c) => c.id === draggedCardId);
    if (cardToPaste && cardToPaste.number === slotCardNumber) {
      await handlePasteCard(draggedCardId);
    }
    setDraggedCardId(null);
  };

  // Càlcul de pàgines
  const totalPages = album ? Math.max(1, Math.ceil(album.totalCards / CARDS_PER_PAGE)) : 1;
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = startIndex + CARDS_PER_PAGE;
  const currentCards = album ? album.cards.slice(startIndex, endIndex) : [];

  // Pàgines d'àlbum temàtiques per títol
  const getPageTitle = (page: number, albumId: string) => {
    if (albumId.includes("m01")) {
      switch (page) {
        case 1: return "Pàgina 1: Processadors & Sòcols";
        case 2: return "Pàgina 2: Memòria RAM & Emmagatzematge";
        case 3: return "Pàgina 3: Plaques Base & Xipsets";
        case 4: return "Pàgina 4: Refrigeració & Alimentació";
        case 5: return "Pàgina 5: Targetes Gràfiques & Eines";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("m02") || albumId.includes("xarxes")) {
      switch (page) {
        case 1: return "Pàgina 1: GNU/Linux, Bash & Kernel";
        case 2: return "Pàgina 2: Windows Server & Active Directory";
        case 3: return "Pàgina 3: Cablejat Estructurat & Capa Física";
        case 4: return "Pàgina 4: Adreçament IP & Protocols";
        case 5: return "Pàgina 5: Serveis de Xarxa & Ciberseguretat";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("trista")) {
      switch (page) {
        case 1: return "Pàgina 1: Cançons Mítiques & Inicis";
        case 2: return "Pàgina 2: Discografia & Àlbums";
        case 3: return "Pàgina 3: Lletres, Nostàlgia & Sentiments";
        case 4: return "Pàgina 4: Escenaris & Grans Concerts";
        case 5: return "Pàgina 5: L'Univers Dausà & Simbologia";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("bemparida")) {
      switch (page) {
        case 1: return "Pàgina 1: Rhapsody & Emerald Sword Saga";
        case 2: return "Pàgina 2: Herois d'Algalord & Membres";
        case 3: return "Pàgina 3: Armes Màgiques & Encanteris";
        case 4: return "Pàgina 4: Gegants del Power Metal";
        case 5: return "Pàgina 5: L'Esperit del Metall Simfònic";
        default: return `Pàgina ${page}`;
      }
    } else {
      return `Pàgina ${page}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Selector d'Àlbums & Progrés General */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" />
            <span>Col·lecció d&apos;Àlbums</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gira les pàgines de l&apos;àlbum i enganxa els cromos que has guanyat als reptes!
          </p>
        </div>

        {/* Pestañes d'àlbums */}
        {albums.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
            {albums.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAlbumId(a.id);
                  setCurrentPage(1);
                  loadAlbumData(a.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedAlbumId === a.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {a.name.split("(")[0].trim()}
                <span className="ml-1.5 text-[10px] opacity-80 font-mono">
                  {a.completionPercentage}%
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Obrint el teu àlbum de cromos...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {!loading && album && (
        <div className="space-y-6">
          {/* SAFATA INFERIOR / A LA MÀ: CROMOS PENDENTS D'ENGANXAR */}
          {album.unpastedCards && album.unpastedCards.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-purple-500/15 border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    🃏
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <span>Cromos a la teva mà per enganxar</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        {album.unpastedCards.length} pendents
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Arrossega el cromo cap al seu buit a l&apos;àlbum o fes clic a &quot;Enganxar&quot;!
                    </p>
                  </div>
                </div>
              </div>

              {/* Llista de cromos a la mà */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {album.unpastedCards.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => handleDragStart(c.id)}
                    className="shrink-0 w-32 p-2.5 rounded-2xl bg-slate-900 border-2 border-dashed border-amber-400/60 hover:border-amber-400 cursor-grab active:cursor-grabbing hover:scale-105 transition-all shadow-lg text-center space-y-2 group"
                  >
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <span className="text-2xl">💻</span>
                      )}
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black bg-black/80 text-white">
                        #{c.number}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold text-white truncate">{c.name}</p>

                    <button
                      type="button"
                      disabled={pastingCardId === c.id}
                      onClick={() => handlePasteCard(c.id)}
                      className="w-full py-1.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-1"
                    >
                      {pastingCardId === c.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <HandMetal className="w-3 h-3" />
                          <span>Enganxar</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* L'ÀLBUM FÍSIC EN FORMAT VERTICAL */}
          <div className="relative mx-auto rounded-3xl bg-[#0f172a] border-4 border-slate-800 shadow-2xl overflow-hidden">
            {/* Vora d'enquadernació física a l'esquerra (simulació de llom de cuir / espiral) */}
            <div className="absolute top-0 bottom-0 left-0 w-6 sm:w-8 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800/80 border-r border-slate-700/50 flex flex-col justify-around items-center py-6 z-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-950 border border-slate-700 shadow-inner"
                />
              ))}
            </div>

            {/* Contingut de la Pàgina de l'Àlbum */}
            <div className="pl-8 sm:pl-12 pr-4 sm:pr-8 py-6 space-y-6 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 min-h-[700px] flex flex-col justify-between">
              {/* Capçal de la Pàgina */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                    {album.name}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {getPageTitle(currentPage, album.id)}
                  </h2>
                </div>

                {/* Progrés de la col·lecció */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Completat</span>
                    <span className="text-sm font-black text-white font-mono">
                      {album.pastedCount} / {album.totalCards} ({album.completionPercentage}%)
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-mono font-black text-indigo-300 text-sm">
                    {album.completionPercentage}%
                  </div>
                </div>
              </div>

              {/* GRAELLA DE CROMOS DE LA PÀGINA EN FORMAT VERTICAL (2 columnes a mòbil, 2 o 5 a tauleta) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4 my-auto">
                {currentCards.map((card) => {
                  const isJustPasted = justPastedCardId === card.id;

                  return (
                    <div
                      key={card.id}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnSlot(card.number)}
                      onClick={() => card.isPasted && setSelectedCard(card)}
                      className={`relative rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-300 aspect-[3/4] select-none ${
                        card.isPasted
                          ? "bg-slate-900/90 border-2 cursor-pointer hover:scale-105 hover:shadow-2xl hover:z-20 group"
                          : card.isOwned
                          ? "bg-amber-950/20 border-2 border-dashed border-amber-400/80 animate-pulse shadow-inner"
                          : "bg-slate-950/60 border border-slate-800/80 shadow-inner"
                      }`}
                      style={{
                        borderColor: card.isPasted
                          ? card.rarity.colorHex
                          : undefined,
                        boxShadow: card.isPasted
                          ? `0 4px 20px -2px ${card.rarity.glowColor}`
                          : undefined,
                      }}
                    >
                      {/* Animació d'enganxat recent */}
                      {isJustPasted && (
                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 border-2 border-emerald-400 flex flex-col items-center justify-center gap-1 z-30 animate-ping">
                          <Check className="w-8 h-8 text-emerald-300" />
                          <span className="text-[10px] font-black text-white uppercase">Enganxat!</span>
                        </div>
                      )}

                      {/* Capçal del cromo: Número i Raresa */}
                      <div className="flex items-center justify-between z-10">
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-black/70 text-slate-200">
                          #{card.number}
                        </span>

                        {card.isPasted && (
                          <span
                            className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
                            style={{
                              backgroundColor: `${card.rarity.colorHex}25`,
                              color: card.rarity.colorHex,
                            }}
                          >
                            {card.rarity.name}
                          </span>
                        )}

                        {/* Si està a la mà però no enganxat */}
                        {!card.isPasted && card.isOwned && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                            A la mà
                          </span>
                        )}
                      </div>

                      {/* Imatge o Buït del cromo */}
                      <div className="my-auto flex flex-col items-center justify-center text-center">
                        {card.isPasted ? (
                          <div className="w-full h-24 sm:h-28 rounded-xl overflow-hidden relative shadow-inner">
                            {card.imageUrl ? (
                              <img
                                src={card.imageUrl}
                                alt={card.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-3xl">
                                💻
                              </div>
                            )}

                            {/* Adhesiu simulat a les cantonades per donar sensació física */}
                            <div className="absolute top-0 right-0 w-3 h-3 bg-white/20 rotate-45 transform translate-x-1.5 -translate-y-1.5" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 bg-white/20 rotate-45 transform -translate-x-1.5 translate-y-1.5" />
                          </div>
                        ) : card.isOwned ? (
                          <div className="space-y-1 py-4 text-center">
                            <span className="text-2xl animate-bounce block">✨</span>
                            <p className="text-[10px] font-black text-amber-300">
                              Llest per enganxar!
                            </p>
                            <button
                              type="button"
                              onClick={() => handlePasteCard(card.id)}
                              className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black uppercase"
                            >
                              Enganxar
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 py-6 text-center opacity-40">
                            <span className="text-2xl block">🔒</span>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              Sense descobrir
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Peu del cromo: Nom i Repetits */}
                      <div className="z-10">
                        <p
                          className={`text-[11px] font-bold truncate text-center ${
                            card.isPasted ? "text-white" : "text-slate-500"
                          }`}
                        >
                          {card.isPasted ? card.name : `Cromo #${card.number}`}
                        </p>

                        {/* Indicador de cromos repetits */}
                        {card.duplicates > 0 && (
                          <div className="mt-1 flex items-center justify-center">
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              +{card.duplicates} repetits
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Peu de Pàgina & Controls de Girar Pàgina */}
              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 shadow shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span><span className="hidden sm:inline">Pàgina </span>Ant.</span>
                </button>

                {/* Indicadors de Pàgina / Pestanyes */}
                <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-xl text-xs font-bold font-mono transition-all shrink-0 ${
                        currentPage === i + 1
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40 scale-110"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 shadow-lg shadow-indigo-600/30 shrink-0"
                >
                  <span><span className="hidden sm:inline">Pàgina </span>Seg.</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALL DEL CROMO */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 p-6 space-y-5 shadow-2xl relative"
            style={{ borderColor: selectedCard.rarity.colorHex }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-black/60 text-white">
                #{selectedCard.number}
              </span>
              <span
                className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${selectedCard.rarity.colorHex}20`,
                  color: selectedCard.rarity.colorHex,
                }}
              >
                {selectedCard.rarity.name}
              </span>
            </div>

            <div className="w-full h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
              {selectedCard.imageUrl ? (
                <img
                  src={selectedCard.imageUrl}
                  alt={selectedCard.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">
                  💻
                </div>
              )}
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">{selectedCard.name}</h3>
              {selectedCard.category && (
                <p className="text-xs text-indigo-400 font-semibold">
                  {selectedCard.category.name}
                </p>
              )}
            </div>

            {selectedCard.description && (
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                {selectedCard.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
              <span>Exemplars a l&apos;inventari:</span>
              <span className="font-mono font-bold text-white">
                {selectedCard.quantity} ({selectedCard.duplicates} repetits)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCard(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Tancar Detall
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
