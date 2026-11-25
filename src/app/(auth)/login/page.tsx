"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Shield, AlertCircle, CheckCircle2, ArrowRight, UserCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const detailsParam = searchParams.get("details");
    const emailParam = searchParams.get("email");

    if (errorParam === "domain_not_allowed") {
      setErrorMsg(`Accés denegat: El compte ${emailParam || ""} no pertany al domini @lacetania.cat ni a la llista autoritzada.`);
    } else if (errorParam === "token_exchange_failed") {
      setErrorMsg(`Error autenticant amb Google: ${detailsParam || "Token invàlid"}. Comprova la configuració a Vercel.`);
    } else if (errorParam === "email_not_provided") {
      setErrorMsg("Google no ha proporcionat cap adreça de correu.");
    } else if (errorParam === "internal_auth_error") {
      setErrorMsg(`Error intern de base de dades o sessió: ${detailsParam || "Error al servidor"}.`);
    } else if (errorParam === "oauth_cancelled") {
      setErrorMsg("S'ha cancel·lat l'inici de sessió amb Google.");
    }
  }, [searchParams]);

  const handleDevLogin = async (email: string, name: string, roleName: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/dev-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, roleName }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.message || data.error || "Error iniciant sessió.");
          return;
        }

        setSuccessMsg(`Benvingut/da, ${data.user.name}! Accedint al tauler...`);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 600);
      } catch {
        setErrorMsg("Error de connexió amb el servidor.");
      }
    });
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    handleDevLogin(customEmail, customName || customEmail.split("@")[0], "student");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
      {/* Targeta Principal */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Llum ambiental decorativa */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Capçalera */}
        <div className="text-center mb-6 relative">
          <div
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 mb-3 mx-auto"
            style={{ width: "56px", height: "56px" }}
          >
            <Sparkles className="text-white shrink-0" style={{ width: "28px", height: "28px" }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
            ILUSTRUM
          </h1>
          <p className="text-xs sm:text-sm font-medium text-indigo-300">
            Plataforma Gamificada de Cromos Digitals
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" style={{ width: "8px", height: "8px" }} />
            <span>Institut Lacetània</span>
          </div>
        </div>

        {/* Notificació d'Error o Èxit */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" style={{ width: "16px", height: "16px" }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" style={{ width: "16px", height: "16px" }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Acció 1: Connexió amb Google */}
        <div className="space-y-3 mb-6">
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-all shadow-md active:scale-[0.99]"
          >
            {/* Logo oficial de Google amb dimensions exactes inline per evitar que es vegi gran */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              className="shrink-0"
              style={{ width: "20px", height: "20px", minWidth: "20px", maxWidth: "20px", display: "inline-block" }}
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continua amb Google</span>
          </a>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
            <Shield className="text-amber-400 shrink-0" style={{ width: "16px", height: "16px" }} />
            <span className="text-[11px]">
              Restringit a comptes <strong>@lacetania.cat</strong>
            </span>
          </div>
        </div>

        {/* Separador */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2.5 text-slate-500 font-bold tracking-wider">
              Accés ràpid per rols (Demo)
            </span>
          </div>
        </div>

        {/* Botons ràpids per a rols */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDevLogin("alumne.demo@lacetania.cat", "Alumne Demo", "student")}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all group disabled:opacity-50"
          >
            <UserCheck className="text-indigo-400 mb-1 shrink-0" style={{ width: "20px", height: "20px" }} />
            <span className="text-xs font-bold text-slate-200">Alumne</span>
            <span className="text-[9px] text-slate-400">@lacetania.cat</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDevLogin("professor.demo@lacetania.cat", "Professor Demo", "teacher")}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all group disabled:opacity-50"
          >
            <UserCheck className="text-cyan-400 mb-1 shrink-0" style={{ width: "20px", height: "20px" }} />
            <span className="text-xs font-bold text-slate-200">Professor</span>
            <span className="text-[9px] text-slate-400">@lacetania.cat</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDevLogin("admin@lacetania.cat", "Administrador", "admin")}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/50 transition-all group disabled:opacity-50"
          >
            <UserCheck className="text-purple-400 mb-1 shrink-0" style={{ width: "20px", height: "20px" }} />
            <span className="text-xs font-bold text-slate-200">Admin</span>
            <span className="text-[9px] text-slate-400">@lacetania.cat</span>
          </button>
        </div>

        {/* Formulari per introduir qualsevol correu @lacetania.cat */}
        <form onSubmit={handleCustomSubmit} className="space-y-2">
          <label className="block text-[11px] font-medium text-slate-400">
            O prova amb el teu correu institucional:
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="nom.cognom@lacetania.cat"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isPending || !customEmail}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white disabled:opacity-40 transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Entrar</span>
              <ArrowRight style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        </form>

        {/* Peu de pàgina */}
        <div className="mt-6 pt-3 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500">
            ILUSTRUM © 2026 · Institut Lacetània (Manresa)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
