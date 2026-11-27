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
  Sparkles,
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
  isEnrolled?: boolean;
}

interface AlbumSummary {
  id: string;
  name: string;
  description: string | null;
  totalCards: number;
  ownedCount: number;
  completionPercentage: number;
  isEnrolled?: boolean;
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
  const [pastingAll, setPastingAll] = useState(false);
  const [justPastedCardId, setJustPastedCardId] = useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [togglingEnrollment, setTogglingEnrollment] = useState(false);

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

  // Acció d'enganxar un cromo de manera instantània i optimista
  const handlePasteCard = async (cardId: string) => {
    if (!album) return;
    
    const cardToPaste = album.unpastedCards.find((c) => c.id === cardId);
    if (!cardToPaste) return;

    // Actualització optimista instantània al client (JavaScript directe)
    setJustPastedCardId(cardId);
    setTimeout(() => setJustPastedCardId(null), 2500);

    // Actualitzar l'estat local de l'àlbum sense esperar la xarxa
    setAlbum((prev) => {
      if (!prev) return null;

      const newUnpasted = prev.unpastedCards.filter((c) => c.id !== cardId);
      const newCards = prev.cards.map((c) => {
        if (c.id === cardId || c.number === cardToPaste.number) {
          return {
            ...c,
            isPasted: true,
            pastedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      const newPastedCount = prev.pastedCount + 1;
      const newCompletion = Math.round((newPastedCount / prev.totalCards) * 100);

      return {
        ...prev,
        cards: newCards,
        unpastedCards: newUnpasted,
        pastedCount: newPastedCount,
        completionPercentage: newCompletion,
      };
    });

    // Actualitzar també a la llista d'àlbums
    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id === album.id) {
          const newPasted = (a as any).pastedCount ? (a as any).pastedCount + 1 : 1;
          return {
            ...a,
            completionPercentage: Math.round((newPasted / a.totalCards) * 100),
          };
        }
        return a;
      })
    );

    // Enviar petició en segon pla
    try {
      const res = await fetch("/api/album/paste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });

      if (!res.ok) {
        // En cas d'error revertir o sincronitzar
        if (selectedAlbumId) {
          await loadAlbumData(selectedAlbumId);
        }
      }
    } catch {
      // Revertir sincronitzant si falla la xarxa
      if (selectedAlbumId) {
        await loadAlbumData(selectedAlbumId);
      }
    }
  };

  // Acció d'enganxar TOTS els cromos pendents alhora
  const handlePasteAllCards = async () => {
    if (!album || album.unpastedCards.length === 0) return;

    const cardsToPaste = [...album.unpastedCards];
    setPastingAll(true);

    // Actualització optimista instantània de tots els cromos
    setAlbum((prev) => {
      if (!prev) return null;

      const unpastedIds = new Set(cardsToPaste.map((c) => c.id));
      const unpastedNumbers = new Set(cardsToPaste.map((c) => c.number));

      const newCards = prev.cards.map((c) => {
        if (unpastedIds.has(c.id) || unpastedNumbers.has(c.number)) {
          return {
            ...c,
            isPasted: true,
            pastedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      const newPastedCount = Math.min(prev.totalCards, prev.pastedCount + cardsToPaste.length);
      const newCompletion = Math.round((newPastedCount / prev.totalCards) * 100);

      return {
        ...prev,
        cards: newCards,
        unpastedCards: [],
        pastedCount: newPastedCount,
        completionPercentage: newCompletion,
      };
    });

    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id === album.id) {
          const newPasted = Math.min(a.totalCards, (a.ownedCount || 0));
          return {
            ...a,
            completionPercentage: Math.round((newPasted / a.totalCards) * 100),
          };
        }
        return a;
      })
    );

    try {
      const res = await fetch("/api/album/paste-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId: album.id }),
      });

      if (!res.ok) {
        if (selectedAlbumId) {
          await loadAlbumData(selectedAlbumId);
        }
      }
    } catch {
      if (selectedAlbumId) {
        await loadAlbumData(selectedAlbumId);
      }
    } finally {
      setPastingAll(false);
    }
  };

  // Commutar la participació en l'àlbum
  const handleToggleEnrollment = async (albumId: string) => {
    setTogglingEnrollment(true);
    try {
      const res = await fetch("/api/album/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlbum((prev) => (prev ? { ...prev, isEnrolled: data.isEnrolled } : null));
        setAlbums((prev) =>
          prev.map((a) => (a.id === albumId ? { ...a, isEnrolled: data.isEnrolled } : a))
        );
      }
    } catch {
      alert("Error de connexió en canviar la participació.");
    } finally {
      setTogglingEnrollment(false);
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
    } else if (albumId.includes("m02")) {
      switch (page) {
        case 1: return "Pàgina 1: GNU/Linux, Bash & Kernel";
        case 2: return "Pàgina 2: Sistemes de Fitxers & Gestió";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("m03")) {
      switch (page) {
        case 1: return "Pàgina 1: Fulls de Càlcul & Fórmules";
        case 2: return "Pàgina 2: Processament de Textos & BD";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("m04")) {
      switch (page) {
        case 1: return "Pàgina 1: Active Directory & GPO";
        case 2: return "Pàgina 2: Serveis Corporatius & SAMBA";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("m05") || albumId.includes("xarxes")) {
      switch (page) {
        case 1: return "Pàgina 1: Cablejat & Commutació L2";
        case 2: return "Pàgina 2: Adreçament IP & VLANs";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("m06") || albumId.includes("seguretat")) {
      switch (page) {
        case 1: return "Pàgina 1: Ciberseguretat & Criptografia";
        case 2: return "Pàgina 2: Tallafocs, Backups & Malware";
        default: return `Pàgina ${page}`;
      }
    } else if (albumId.includes("m07") || albumId.includes("serveis")) {
      switch (page) {
        case 1: return "Pàgina 1: Servidors DNS & DHCP";
        case 2: return "Pàgina 2: Servidors Web, Correu & Proxy";
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

  // Estils i imatges temàtiques de fons segons l'àlbum
  const getAlbumTheme = (albumId: string) => {
    if (albumId.includes("trista")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-blue-950/85 to-slate-950/95",
        borderColor: "border-blue-500/40",
        ringColor: "ring-blue-500/20",
        bindingSpine: "from-blue-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-blue-950/40 border-blue-800/40",
        badgeBg: "bg-blue-500/15 border-blue-500/40 text-blue-300",
        ambientGlow: "rgba(59, 130, 246, 0.15)",
      };
    } else if (albumId.includes("bemparida")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-purple-950/85 to-amber-950/90",
        borderColor: "border-amber-500/50",
        ringColor: "ring-amber-500/20",
        bindingSpine: "from-amber-950 via-purple-950 to-slate-900",
        cardSlotBg: "bg-purple-950/40 border-amber-800/40",
        badgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
        ambientGlow: "rgba(245, 158, 11, 0.18)",
      };
    } else if (albumId.includes("m01") || albumId.includes("hardware")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-amber-950/85 to-slate-950/95",
        borderColor: "border-amber-500/40",
        ringColor: "ring-amber-500/20",
        bindingSpine: "from-amber-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-amber-950/40 border-amber-800/40",
        badgeBg: "bg-amber-500/15 border-amber-500/40 text-amber-300",
        ambientGlow: "rgba(245, 158, 11, 0.15)",
      };
    } else if (albumId.includes("m02")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-blue-950/85 to-slate-950/95",
        borderColor: "border-blue-500/40",
        ringColor: "ring-blue-500/20",
        bindingSpine: "from-blue-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-blue-950/40 border-blue-800/40",
        badgeBg: "bg-blue-500/15 border-blue-500/40 text-blue-300",
        ambientGlow: "rgba(59, 130, 246, 0.15)",
      };
    } else if (albumId.includes("m03")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-cyan-950/85 to-slate-950/95",
        borderColor: "border-cyan-500/40",
        ringColor: "ring-cyan-500/20",
        bindingSpine: "from-cyan-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-cyan-950/40 border-cyan-800/40",
        badgeBg: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
        ambientGlow: "rgba(6, 182, 212, 0.15)",
      };
    } else if (albumId.includes("m04")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-indigo-950/85 to-slate-950/95",
        borderColor: "border-indigo-500/40",
        ringColor: "ring-indigo-500/20",
        bindingSpine: "from-indigo-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-indigo-950/40 border-indigo-800/40",
        badgeBg: "bg-indigo-500/15 border-indigo-500/40 text-indigo-300",
        ambientGlow: "rgba(99, 102, 241, 0.15)",
      };
    } else if (albumId.includes("m05")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-emerald-950/85 to-slate-950/95",
        borderColor: "border-emerald-500/40",
        ringColor: "ring-emerald-500/20",
        bindingSpine: "from-emerald-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-emerald-950/40 border-emerald-800/40",
        badgeBg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
        ambientGlow: "rgba(16, 185, 129, 0.15)",
      };
    } else if (albumId.includes("m06")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-rose-950/85 to-slate-950/95",
        borderColor: "border-rose-500/40",
        ringColor: "ring-rose-500/20",
        bindingSpine: "from-rose-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-rose-950/40 border-rose-800/40",
        badgeBg: "bg-rose-500/15 border-rose-500/40 text-rose-300",
        ambientGlow: "rgba(239, 68, 68, 0.15)",
      };
    } else if (albumId.includes("m07")) {
      return {
        coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-purple-950/85 to-slate-950/95",
        borderColor: "border-purple-500/40",
        ringColor: "ring-purple-500/20",
        bindingSpine: "from-purple-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-purple-950/40 border-purple-800/40",
        badgeBg: "bg-purple-500/15 border-purple-500/40 text-purple-300",
        ambientGlow: "rgba(139, 92, 246, 0.15)",
      };
    } else {
      return {
        coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&auto=format&fit=crop&q=80",
        textureOverlay: "from-slate-950/92 via-slate-900/85 to-slate-950/95",
        borderColor: "border-indigo-500/40",
        ringColor: "ring-indigo-500/20",
        bindingSpine: "from-slate-950 via-slate-900 to-slate-800",
        cardSlotBg: "bg-slate-900/40 border-slate-800/40",
        badgeBg: "bg-indigo-500/15 border-indigo-500/40 text-indigo-300",
        ambientGlow: "rgba(99, 102, 241, 0.15)",
      };
    }
  };

  const albumTheme = album ? getAlbumTheme(album.id) : null;

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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedAlbumId === a.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title={a.isEnrolled ? "Àlbum actiu (reps preguntes d'aquest àlbum)" : "Àlbum pausat"}
              >
                <span
                  className={`w-2 h-2 rounded-full inline-block ${
                    a.isEnrolled ? "bg-emerald-400" : "bg-slate-500 opacity-60"
                  }`}
                />
                <span>{a.name.split("(")[0].trim()}</span>
                <span className="text-[10px] opacity-80 font-mono">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

                {/* Botó per enganxar-los tots alhora */}
                <button
                  type="button"
                  onClick={handlePasteAllCards}
                  disabled={pastingAll}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {pastingAll ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-slate-950" />
                  )}
                  <span>Enganxar tots els cromos ({album.unpastedCards.length})</span>
                </button>
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

          {/* L'ÀLBUM FÍSIC EN FORMAT VERTICAL AMB FONS TEMÀTIC REAL */}
          <div
            className={`relative mx-auto rounded-3xl bg-[#090d16] border-4 ${
              albumTheme?.borderColor || "border-slate-800"
            } shadow-2xl overflow-hidden transition-all duration-500`}
            style={{
              boxShadow: albumTheme ? `0 20px 50px -10px ${albumTheme.ambientGlow}` : undefined,
            }}
          >
            {/* IMATGE DE FONS TEMÀTICA AMB CAPA D'OPACITAT D'ÀLBUM DE CROMOS */}
            {albumTheme && (
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <img
                  src={albumTheme.coverImage}
                  alt={album.name}
                  className="w-full h-full object-cover object-center opacity-25 filter blur-[2px] scale-105 transform"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${albumTheme.textureOverlay} mix-blend-multiply`}
                />
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />
              </div>
            )}

            {/* Vora d'enquadernació física a l'esquerra (simulació de llom de cuir / espiral) */}
            <div
              className={`absolute top-0 bottom-0 left-0 w-6 sm:w-8 bg-gradient-to-r ${
                albumTheme?.bindingSpine || "from-slate-950 via-slate-900 to-slate-800/80"
              } border-r border-slate-700/50 flex flex-col justify-around items-center py-6 z-10 shadow-lg`}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-950 border border-slate-700 shadow-inner"
                />
              ))}
            </div>

            {/* Contingut de la Pàgina de l'Àlbum */}
            <div className="relative z-10 pl-8 sm:pl-12 pr-4 sm:pr-8 py-6 space-y-6 min-h-[700px] flex flex-col justify-between">
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

                {/* Estat de participació & Progrés */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleEnrollment(album.id)}
                    disabled={togglingEnrollment}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                      album.isEnrolled
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                        : "bg-slate-800/90 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                    title={
                      album.isEnrolled
                        ? "Fes clic per deixar de participar en aquest àlbum"
                        : "Fes clic per començar a participar en aquest àlbum"
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        album.isEnrolled ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                      }`}
                    />
                    <span>
                      {album.isEnrolled ? "Participes en aquest àlbum" : "No hi participes"}
                    </span>
                    <span className="text-[10px] opacity-75 underline ml-0.5">
                      {album.isEnrolled ? "(Pausar)" : "(Activar)"}
                    </span>
                  </button>

                  <div className="flex items-center gap-2.5">
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
              </div>

              {/* Avís si no participa en aquest àlbum */}
              {!album.isEnrolled && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⏸️</span>
                    <div>
                      <span className="font-bold block text-amber-300">
                        No estàs participant en aquest àlbum
                      </span>
                      <span className="text-slate-300">
                        No rebràs preguntes d&apos;aquesta temàtica ni en guanyaràs cromos fins que activis la teva participació.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleEnrollment(album.id)}
                    disabled={togglingEnrollment}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs whitespace-nowrap self-start sm:self-auto transition-colors shadow-sm"
                  >
                    Vull participar-hi!
                  </button>
                </div>
              )}

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
                          : `${albumTheme?.cardSlotBg || "bg-slate-950/60 border-slate-800/80"} border shadow-inner backdrop-blur-sm`
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
