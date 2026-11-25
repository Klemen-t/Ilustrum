"use client";

import { useState, useEffect } from "react";
import {
  Layers,
  Repeat,
  Sparkles,
  BookOpen,
  Filter,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

interface InventoryItem {
  inventoryId: string;
  quantity: number;
  duplicates: number;
  isDuplicate: boolean;
  source: string;
  obtainedAt: string;
  card: {
    id: string;
    name: string;
    description: string | null;
    number: number;
    imageUrl: string | null;
    value: number;
    rarity: {
      id: number;
      name: string;
      colorHex: string;
      glowColor: string;
      sortOrder: number;
    };
    category: {
      id: number;
      name: string;
      color: string;
    } | null;
    album: {
      id: string;
      name: string;
    };
  };
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "duplicates" | "rare">("all");

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/inventory");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "No s'ha pogut carregar l'inventari.");
          return;
        }

        setItems(data.inventory);
      } catch {
        setError("Error de connexió carregant l'inventari.");
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const totalCards = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalDuplicates = items.reduce((acc, item) => acc + item.duplicates, 0);
  const uniqueCards = items.length;

  const filteredItems = items.filter((item) => {
    if (filterType === "duplicates") return item.duplicates > 0;
    if (filterType === "rare") return item.card.rarity.sortOrder >= 3;
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Capçalera */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Layers className="w-8 h-8 text-indigo-400" />
            <span>Inventari de Cromos</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gestiona la teva col·lecció personal i prepara els cromos repetits per a intercanviar.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/album"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Veure Àlbum</span>
          </a>

          <a
            href="/trades"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Repeat className="w-4 h-4" />
            <span>Zona d&apos;Intercanvis</span>
          </a>
        </div>
      </div>

      {/* Targetes de Resum de l'Inventari */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cromos en Propietat</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{totalCards}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cromos Únics</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">{uniqueCards}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Repetits per Canviar</span>
            <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1">{totalDuplicates}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Repeat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Filtres */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setFilterType("all")}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            filterType === "all"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          Tots els Cromos ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType("duplicates")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            filterType === "duplicates"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Repeat className="w-3.5 h-3.5" />
          <span>Només Repetits ({totalDuplicates})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType("rare")}
          className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            filterType === "rare"
              ? "bg-amber-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rars, Èpics i Llegendaris</span>
        </button>
      </div>

      {loading && (
        <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Carregant el teu inventari...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-3xl bg-red-950/40 border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Llistat de Cromos de l'Inventari */}
      {!loading && (
        <>
          {filteredItems.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">
                {filterType === "duplicates"
                  ? "Encara no tens cap cromo repetit. Respon més preguntes per obtenir duplicats i poder intercanviar!"
                  : "El teu inventari està buit. Comença a jugar per desbloquejar els teus primers cromos!"}
              </p>
              <a
                href="/questions"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition-colors mt-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Anar a respondre preguntes</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.inventoryId}
                  className="rounded-3xl border-2 p-5 bg-slate-900/90 shadow-xl flex flex-col justify-between space-y-4 transition-all hover:scale-[1.01]"
                  style={{
                    borderColor: item.card.rarity.colorHex,
                    boxShadow: `0 0 20px ${item.card.rarity.colorHex}15`,
                  }}
                >
                  {/* Capçalera del cromo */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-400">
                      #{item.card.number}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs font-black">
                        x{item.quantity}
                      </span>

                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider"
                        style={{
                          backgroundColor: `${item.card.rarity.colorHex}20`,
                          color: item.card.rarity.colorHex,
                          border: `1px solid ${item.card.rarity.colorHex}40`,
                        }}
                      >
                        {item.card.rarity.name}
                      </span>
                    </div>
                  </div>

                  {/* Il·lustració */}
                  <div className="my-2 flex items-center justify-center">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-inner border"
                      style={{
                        backgroundColor: `${item.card.rarity.colorHex}15`,
                        borderColor: `${item.card.rarity.colorHex}40`,
                      }}
                    >
                      🃏
                    </div>
                  </div>

                  {/* Contingut i Descripció */}
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      {item.card.name}
                    </h3>
                    {item.card.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.card.description}
                      </p>
                    )}
                    {item.card.category && (
                      <div className="text-[11px] text-slate-400 mt-2 font-semibold">
                        Categoria: <span className="text-slate-300">{item.card.category.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Botó d'acció si està repetit */}
                  <div className="pt-2 border-t border-slate-800/80">
                    {item.duplicates > 0 ? (
                      <a
                        href={`/trades?offerCardId=${item.card.id}`}
                        className="w-full py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/40 hover:border-purple-600 text-purple-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Intercanviar ({item.duplicates} repetits)</span>
                      </a>
                    ) : (
                      <div className="text-center py-1.5 text-xs text-slate-500 font-medium">
                        (Còpia única en col·lecció)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
