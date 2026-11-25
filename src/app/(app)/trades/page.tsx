"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeftRight,
  PlusCircle,
  Users,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Handshake,
  Tag,
  Search,
} from "lucide-react";

interface CardRarity {
  name: string;
  colorHex: string;
}

interface TradeCard {
  id: string;
  name: string;
  number: number;
  imageUrl: string | null;
  rarity: CardRarity;
  category?: string | null;
}

interface DuplicateCard extends TradeCard {
  availableCount: number;
}

interface MarketListing {
  id: string;
  createdAt: string;
  message: string | null;
  isMyListing: boolean;
  canAcceptDirectly: boolean;
  matchingRequestedCards: {
    id: string;
    name: string;
    number: number;
    rarity: string;
    colorHex: string;
  }[];
  proposer: {
    id: string;
    name: string;
    avatar: string | null;
    email: string;
    level: number;
  };
  offeredCards: TradeCard[];
  requestedCards: TradeCard[];
}

interface PeerWithDuplicates {
  id: string;
  name: string;
  avatar: string | null;
  level: number;
  duplicateCards: {
    id: string;
    name: string;
    number: number;
    imageUrl: string | null;
    duplicatesCount: number;
    rarity: CardRarity;
    category?: string | null;
  }[];
}

export default function TradesPage() {
  const [activeTab, setActiveTab] = useState<"market" | "peers" | "create">("market");
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [myDuplicates, setMyDuplicates] = useState<DuplicateCard[]>([]);
  const [missingCards, setMissingCards] = useState<
    { id: string; name: string; number: number; rarity: CardRarity }[]
  >([]);
  const [peers, setPeers] = useState<PeerWithDuplicates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulari de nou anunci al mercat
  const [selectedOfferCardIds, setSelectedOfferCardIds] = useState<string[]>([]);
  const [selectedRequestCardIds, setSelectedRequestCardIds] = useState<string[]>([]);
  const [listingMessage, setListingMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptingTradeId, setAcceptingTradeId] = useState<string | null>(null);

  // Carregar mercat
  const loadMarketData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trades");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error carregant el mercat d'intercanvis.");
        return;
      }

      setListings(data.listings || []);
      setMyDuplicates(data.myDuplicates || []);
      setMissingCards(data.missingCards || []);
    } catch {
      setError("Error de comunicació amb el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar repetits de companys
  const loadPeersData = useCallback(async () => {
    try {
      const res = await fetch("/api/trades/peers");
      const data = await res.json();
      if (res.ok) {
        setPeers(data.peers || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  useEffect(() => {
    if (activeTab === "peers") {
      loadPeersData();
    }
  }, [activeTab, loadPeersData]);

  // Publicar nou anunci al mercat
  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOfferCardIds.length === 0) {
      alert("Selecciona com a mínim un dels teus cromos repetits per oferir.");
      return;
    }
    if (selectedRequestCardIds.length === 0) {
      alert("Selecciona com a mínim un cromo que demanes a canvi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeredCardIds: selectedOfferCardIds,
          requestedCardIds: selectedRequestCardIds,
          message: listingMessage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No s'ha pogut publicar l'anunci.");
        return;
      }

      // Netejar formulari i anar al mercat
      setSelectedOfferCardIds([]);
      setSelectedRequestCardIds([]);
      setListingMessage("");
      setActiveTab("market");
      await loadMarketData();
    } catch {
      alert("Error publicant l'anunci al mercat.");
    } finally {
      setSubmitting(false);
    }
  };

  // Acceptar anunci del mercat
  const handleAcceptListing = async (tradeId: string, cardIdToGive: string) => {
    if (!confirm("Vols acceptar aquest intercanvi ara mateix entregant el teu cromo repetit?")) {
      return;
    }

    setAcceptingTradeId(tradeId);
    try {
      const res = await fetch(`/api/trades/${tradeId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardIdToGive }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 Intercanvi completat amb èxit! El nou cromo ja està al teu àlbum.");
        await loadMarketData();
      } else {
        alert(data.error || "No s'ha pogut completar l'intercanvi.");
      }
    } catch {
      alert("Error de connexió acceptant l'intercanvi.");
    } finally {
      setAcceptingTradeId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Capçalera del Mercat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ArrowLeftRight className="w-7 h-7 text-emerald-400" />
            <span>Mercat d&apos;Intercanvis SMIX</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Bescanvia els teus cromos repetits amb la resta de la classe per completar la col·lecció!
          </p>
        </div>

        {/* Botó publicar anunci */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === "create" ? "market" : "create")}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shadow-lg self-start sm:self-auto ${
            activeTab === "create"
              ? "bg-slate-800 text-slate-300 border border-slate-700"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{activeTab === "create" ? "Veure el Mercat" : "Publicar un Anunci"}</span>
        </button>
      </div>

      {/* Pestanyes de navegació */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start">
        <button
          type="button"
          onClick={() => setActiveTab("market")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "market"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Anuncis del Mercat ({listings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("peers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === "peers"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Repetits de la Classe</span>
        </button>
      </div>

      {loading && (
        <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm font-medium text-slate-400">Carregant el mercat d&apos;intercanvis...</p>
        </div>
      )}

      {!loading && error && (
        <div className="p-6 rounded-3xl bg-rose-950/40 border border-rose-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      )}

      {/* FORMULARI DE PUBLICAR NOU ANUNCI */}
      {!loading && activeTab === "create" && (
        <form
          onSubmit={handleCreateListing}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl"
        >
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Publicar un Nou Anunci al Mercat</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Només pots oferir cromos que tinguis repetits. Estableix quins cromos demanes a canvi perquè qualsevol company pugui fer el tracte.
            </p>
          </div>

          {/* PAS 1: Què ofereixes (Només repetits) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Tria quin cromo repetit ofereixes ({myDuplicates.length} disponibles)
              </label>
              {myDuplicates.length === 0 && (
                <span className="text-[11px] font-bold text-amber-400">
                  ⚠️ No tens cromos repetits per oferir actualment!
                </span>
              )}
            </div>

            {myDuplicates.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
                {myDuplicates.map((card) => {
                  const isSelected = selectedOfferCardIds.includes(card.id);
                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setSelectedOfferCardIds((prev) =>
                          prev.includes(card.id) ? prev.filter((id) => id !== card.id) : [...prev, card.id]
                        );
                      }}
                      className={`p-2 rounded-xl border-2 cursor-pointer transition-all text-center space-y-1 ${
                        isSelected
                          ? "bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/20"
                          : "bg-slate-900 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="w-full h-16 rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center">
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>💻</span>
                        )}
                      </div>
                      <p className="text-[10px] font-bold text-white truncate">#{card.number} {card.name}</p>
                      <span className="text-[9px] font-black text-emerald-400 block">
                        +{card.availableCount} repetits
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-500">
                Respon més preguntes al Repte de Coneixement per aconseguir sobres i cromos repetits!
              </div>
            )}
          </div>

          {/* PAS 2: Què demanes a canvi */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              2. Tria quins cromos acceptaries a canvi (cromos que et falten)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-56 overflow-y-auto p-2 rounded-2xl bg-slate-950/60 border border-slate-800">
              {missingCards.map((card) => {
                const isSelected = selectedRequestCardIds.includes(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedRequestCardIds((prev) =>
                        prev.includes(card.id) ? prev.filter((id) => id !== card.id) : [...prev, card.id]
                      );
                    }}
                    className={`p-2 rounded-xl border-2 cursor-pointer transition-all text-center space-y-1 ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-400 ring-2 ring-indigo-400/20"
                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">#{card.number}</span>
                    <p className="text-[10px] font-bold text-white truncate">{card.name}</p>
                    <span className="text-[9px] font-semibold text-indigo-300 block">{card.rarity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missatge opcional */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Comentari o condicions (opcional):</label>
            <input
              type="text"
              value={listingMessage}
              onChange={(e) => setListingMessage(e.target.value)}
              placeholder="Ex: Canvio el meu cromo repetit per qualsevol dels que demano!"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("market")}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={submitting || selectedOfferCardIds.length === 0 || selectedRequestCardIds.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
              <span>Publicar Anunci</span>
            </button>
          </div>
        </form>
      )}

      {/* LLISTAT D'ANUNCIS DEL MERCAT */}
      {!loading && activeTab === "market" && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Tag className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No hi ha anuncis al mercat ara mateix</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sigues el primer de la classe a posar els teus cromos repetits al mercat fent clic a &quot;Publicar un Anunci&quot;!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 shadow-xl ${
                    item.canAcceptDirectly
                      ? "bg-slate-900 border-emerald-500/80 ring-2 ring-emerald-500/20"
                      : item.isMyListing
                      ? "bg-slate-900/90 border-indigo-500/40"
                      : "bg-slate-900/80 border-slate-800"
                  }`}
                >
                  {/* Propietari de l'anunci */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                        {item.proposer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-black text-white block">
                          {item.proposer.name}
                          {item.isMyListing && " (El teu anunci)"}
                        </span>
                        <span className="text-[10px] text-slate-400">Nivell {item.proposer.level}</span>
                      </div>
                    </div>

                    {item.canAcceptDirectly && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ⚡ Pots fer el canvi!
                      </span>
                    )}
                  </div>

                  {/* Cromos: Ofereix vs Demana */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                    {/* Oferta */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                        🎁 Ofereix:
                      </span>
                      {item.offeredCards.map((c) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                            {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" /> : "💻"}
                          </div>
                          <span className="text-[11px] font-bold text-white truncate">
                            #{c.number} {c.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Preu / Demana */}
                    <div className="space-y-1.5 border-l border-slate-800 pl-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                        🏷️ Demana a canvi:
                      </span>
                      {item.requestedCards.map((c) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{c.number}</span>
                          <span className="text-[11px] font-semibold text-slate-200 truncate">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {item.message && (
                    <p className="text-[11px] text-slate-400 italic bg-slate-950/30 px-3 py-1.5 rounded-xl">
                      &quot;{item.message}&quot;
                    </p>
                  )}

                  {/* Acció */}
                  <div className="flex items-center justify-between pt-1">
                    {item.isMyListing ? (
                      <span className="text-[11px] text-slate-400">Pendent que un company ho accepti</span>
                    ) : item.canAcceptDirectly ? (
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-[10px] text-emerald-400 font-semibold truncate">
                          Tens repetit: #{item.matchingRequestedCards[0].number} {item.matchingRequestedCards[0].name}
                        </span>
                        <button
                          type="button"
                          disabled={acceptingTradeId === item.id}
                          onClick={() => handleAcceptListing(item.id, item.matchingRequestedCards[0].id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors shrink-0 flex items-center gap-1 shadow-md shadow-emerald-600/30"
                        >
                          {acceptingTradeId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <Handshake className="w-3.5 h-3.5" />
                              <span>Acceptar Canvi</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        No tens cap dels cromos que demana repetits
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PESTANYA: REPETITS DE LA CLASSE */}
      {!loading && activeTab === "peers" && (
        <div className="space-y-4">
          {peers.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              Cap company té cromos repetits registrats en aquest moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {peers.map((peer) => (
                <div key={peer.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {peer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-white">{peer.name}</h3>
                      <span className="text-[10px] text-slate-400">Nivell {peer.level}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Cromos repetits disponibles ({peer.duplicateCards.length}):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {peer.duplicateCards.map((c) => (
                        <div
                          key={c.id}
                          className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2"
                        >
                          <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                            {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" /> : "💻"}
                          </div>
                          <div className="truncate">
                            <p className="text-[10px] font-bold text-white truncate">#{c.number} {c.name}</p>
                            <span className="text-[9px] font-black text-emerald-400">+{c.duplicatesCount} repetits</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
