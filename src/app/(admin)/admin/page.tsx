"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  HelpCircle,
  Users,
  Sliders,
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Power,
  Layers,
  Sparkles,
  UploadCloud,
  Download,
  BookOpen,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<"stats" | "questions" | "users" | "config" | "logs" | "import">("stats");
  const [stats, setStats] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulari d'importació d'àlbums
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Formulari d'importació senzilla de preguntes (Text / CSV)
  const [qImportSubTab, setQImportSubTab] = useState<"simple" | "full">("simple");
  const [qImportFormat, setQImportFormat] = useState<"text" | "csv">("text");
  const [qImportContent, setQImportContent] = useState("");
  const [qImporting, setQImporting] = useState(false);
  const [qImportPreview, setQImportPreview] = useState<any[] | null>(null);
  const [qImportError, setQImportError] = useState<string | null>(null);
  const [qImportSuccess, setQImportSuccess] = useState<string | null>(null);

  const sampleTextQuestions = `PREGUNTA: Quina comanda a GNU/Linux mostra les adreces IP de les interfícies de xarxa?
A) ifconfig /all
B) ip addr
C) netstat -rn
D) ping localhost
CORRECTA: B
MÒDUL: SMIX M02
EXPLICACIÓ: La comanda 'ip addr' de la suite iproute2 és l'estàndard modern a Linux.

PREGUNTA: Quin port TCP utilitza per defecte el servei de navegació web segura HTTPS?
A) 80
B) 22
C) 443
D) 53
CORRECTA: C
MÒDUL: SMIX M05
EXPLICACIÓ: HTTPS utilitza el port 443 xifrat amb TLS, mentre que HTTP normal usa el port 80.`;

  const sampleCsvQuestions = `Pregunta;Resposta A;Resposta B;Resposta C;Resposta D;Correcta;Mòdul;Explicació
Quina eina analitza trames de xarxa en temps real?;Wireshark;Notepad++;GIMP;VirtualBox;A;SMIX M05;Wireshark és un sniffer de paquets.
Quin fitxer conté els usuaris locals a Linux?;/etc/shadow;/etc/passwd;/etc/group;/etc/hosts;B;SMIX M02;El fitxer /etc/passwd defineix els usuaris.`;

  // Formulari de nova pregunta
  const [showNewQModal, setShowNewQModal] = useState(false);
  const [newStatement, setNewStatement] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("medium");
  const [newPoints, setNewPoints] = useState(10);
  const [newXpReward, setNewXpReward] = useState(15);
  const [newExplanation, setNewExplanation] = useState("");
  const [answers, setAnswers] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, qRes, usersRes, configRes, logsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/questions"),
        fetch("/api/admin/users"),
        fetch("/api/admin/config"),
        fetch("/api/admin/logs"),
      ]);

      if (statsRes.ok) setStats((await statsRes.json()).stats);
      if (qRes.ok) setQuestions((await qRes.json()).questions);
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users);
        setRoles(uData.roles);
      }
      if (configRes.ok) setConfigs((await configRes.json()).configs);
      if (logsRes.ok) setLogs((await logsRes.json()).logs);
    } catch {
      setError("Error carregant les dades administratives.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Commutar estat actiu de pregunta
  const toggleQuestionStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? { ...q, isActive: !currentStatus } : q))
        );
        setSuccessMsg("Estat de la pregunta actualitzat!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {
      setError("Error canviant estat de la pregunta.");
    }
  };

  // Canviar rol d'usuari
  const handleRoleChange = async (userId: string, newRoleId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleId: newRoleId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: updated.user.role } : u))
        );
        setSuccessMsg("Rol d'usuari actualitzat amb èxit!");
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {
      setError("Error canviant el rol de l'usuari.");
    }
  };

  // Crear nova pregunta
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatement.trim()) return;

    try {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statement: newStatement,
          difficulty: newDifficulty,
          points: newPoints,
          xpReward: newXpReward,
          explanation: newExplanation,
          answers: answers.filter((a) => a.text.trim() !== ""),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error creant la pregunta.");
        return;
      }

      setSuccessMsg("Pregunta creada correctament!");
      setShowNewQModal(false);
      setNewStatement("");
      setNewExplanation("");
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setError("Error de connexió creant la pregunta.");
    }
  };

  // Desar configuració
  const handleSaveConfig = async (key: string, value: string) => {
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (res.ok) {
        setSuccessMsg(`Paràmetre ${key} actualitzat a ${value}!`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {
      setError("Error desant la configuració.");
    }
  };

  // Importador d'àlbums
  const handleLoadSampleTemplate = async () => {
    try {
      const res = await fetch("/api/admin/import");
      if (res.ok) {
        const data = await res.json();
        setImportJson(JSON.stringify(data.template, null, 2));
      }
    } catch {
      setImportError("Error carregant la plantilla.");
    }
  };

  const handleDownloadTemplate = () => {
    fetch("/api/admin/import")
      .then((res) => res.json())
      .then((data) => {
        const blob = new Blob([JSON.stringify(data.template, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "plantilla_importacio_album_smix.json";
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJson(content);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!importJson.trim()) {
      setImportError("L'àrea de JSON és buida. Enganxa o carrega un fitxer JSON.");
      return;
    }

    setImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Error processant la importació.");
      } else {
        setImportResult(data.result);
        setSuccessMsg(data.message);
        loadData();
      }
    } catch (err: any) {
      setImportError(err.message || "Format JSON no vàlid.");
    } finally {
      setImporting(false);
    }
  };

  const handleSimpleQuestionsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setQImportContent(content);
      if (file.name.endsWith(".csv")) {
        setQImportFormat("csv");
      } else {
        setQImportFormat("text");
      }
    };
    reader.readAsText(file);
  };

  const handleValidateQuestions = async () => {
    if (!qImportContent.trim()) {
      setQImportError("Enganxa o puja el contingut de les preguntes.");
      return;
    }
    setQImporting(true);
    setQImportError(null);
    setQImportSuccess(null);
    setQImportPreview(null);
    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: qImportContent,
          format: qImportFormat,
          dryRun: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQImportError(data.error || "Error validant les preguntes.");
      } else {
        setQImportPreview(data.preview);
        setQImportSuccess(`Format vàlid! S'han detectat ${data.detectedCount} preguntes a punt per importar.`);
      }
    } catch {
      setQImportError("Error connectant amb el servidor.");
    } finally {
      setQImporting(false);
    }
  };

  const handleExecuteSimpleQuestionsImport = async () => {
    if (!qImportContent.trim()) {
      setQImportError("Enganxa o puja el contingut de les preguntes.");
      return;
    }
    setQImporting(true);
    setQImportError(null);
    setQImportSuccess(null);
    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: qImportContent,
          format: qImportFormat,
          dryRun: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setQImportError(data.error || "Error important les preguntes.");
      } else {
        setQImportSuccess(data.message);
        setQImportContent("");
        setQImportPreview(null);
        loadData();
      }
    } catch {
      setQImportError("Error connectant amb el servidor.");
    } finally {
      setQImporting(false);
    }
  };

  const handleDownloadSimpleTemplate = (format: "text" | "csv") => {
    const content = format === "csv" ? sampleCsvQuestions : sampleTextQuestions;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla_preguntes_smix.${format === "csv" ? "csv" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Navegació de pestanyes */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setTab("stats")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "stats"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Estadístiques Globals</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("questions")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "questions"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Banc de Preguntes ({questions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "users"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuaris ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("config")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "config"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Probabilitats & Sistema</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("logs")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "logs"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Logs d&apos;Auditoria</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("import")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            tab === "import"
              ? "bg-purple-600 text-white shadow-md"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Importar Àlbums & Preguntes</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="p-16 text-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Carregant dades administratives...</p>
        </div>
      )}

      {/* 1. SECCIÓ ESTADÍSTIQUES */}
      {!loading && tab === "stats" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Usuaris Totals</span>
              <div className="text-3xl font-black text-white mt-1">{stats.totalUsers}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {stats.totalStudents} alumnes · {stats.totalTeachers} professors
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Respostes Realitzades</span>
              <div className="text-3xl font-black text-white mt-1">{stats.totalAttempts}</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                Taxa d&apos;encert: {stats.successRate}% ({stats.correctAttempts} encerts)
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Cromos en Circulació</span>
              <div className="text-3xl font-black text-purple-400 mt-1">{stats.totalCardsInCirculation}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Unitats als inventaris</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase">Intercanvis Completats</span>
              <div className="text-3xl font-black text-amber-400 mt-1">{stats.totalTradesCompleted}</div>
              <span className="text-[11px] text-slate-500 mt-1 block">Transaccions executades</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECCIÓ PREGUNTES */}
      {!loading && tab === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Gestió del Banc de Preguntes</h2>
            <button
              type="button"
              onClick={() => setShowNewQModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Nova Pregunta</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Enunciat</th>
                    <th className="p-3.5">Matèria</th>
                    <th className="p-3.5">Dificultat</th>
                    <th className="p-3.5">Punts / XP</th>
                    <th className="p-3.5">Intents</th>
                    <th className="p-3.5">Estat</th>
                    <th className="p-3.5 text-right">Accions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-medium text-slate-200 max-w-sm">
                        <div className="line-clamp-2">{q.statement}</div>
                        {q.explanation && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                            {q.explanation}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {q.subject?.name || q.category?.name || "General"}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold text-[10px]">
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-amber-300">
                        +{q.points} pts / +{q.xpReward} XP
                      </td>
                      <td className="p-3.5 text-slate-400 font-semibold">
                        {q._count.attempts}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            q.isActive
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-red-500/20 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {q.isActive ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => toggleQuestionStatus(q.id, q.isActive)}
                          title={q.isActive ? "Desactivar" : "Activar"}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            q.isActive
                              ? "border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                              : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECCIÓ USUARIS */}
      {!loading && tab === "users" && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Gestió d&apos;Alumnes i Personal</h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Nom</th>
                    <th className="p-3.5">Correu (@lacetania.cat)</th>
                    <th className="p-3.5">Rol</th>
                    <th className="p-3.5">Nivell</th>
                    <th className="p-3.5">Punts</th>
                    <th className="p-3.5">Cromos</th>
                    <th className="p-3.5 text-right">Canviar Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-white">{u.displayName || u.name}</td>
                      <td className="p-3.5 text-slate-400">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            u.role.name === "admin"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : u.role.name === "teacher"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {u.role.name}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-indigo-300">Nivell {u.level}</td>
                      <td className="p-3.5 font-bold text-amber-300">{u.points} pts</td>
                      <td className="p-3.5 text-slate-400">{u._count.inventory} items</td>
                      <td className="p-3.5 text-right">
                        <select
                          value={u.role.id}
                          onChange={(e) => handleRoleChange(u.id, Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                        >
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SECCIÓ CONFIGURACIÓ I PROBABILITATS */}
      {!loading && tab === "config" && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-base font-bold text-white">Configuració de Probabilitats de Cromos</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajusta les taxes d&apos;aparició dels cromos directament a PostgreSQL.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl bg-slate-900 border border-slate-800 p-6">
            {configs.map((cfg) => (
              <div key={cfg.id} className="flex items-center justify-between gap-4 py-2 border-b border-slate-800/60 last:border-0">
                <div>
                  <div className="text-xs font-bold text-white font-mono">{cfg.key}</div>
                  <div className="text-[10px] text-slate-400">
                    {cfg.key === "card.chance_on_correct"
                      ? "Probabilitat d'obtenir un cromo en respondre correctament (ex: 0.35 = 35%)"
                      : cfg.key.startsWith("rarity.")
                      ? "Taxa de distribució ponderada de la raresa"
                      : "Paràmetre del sistema"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={cfg.value}
                    onBlur={(e) => {
                      if (e.target.value !== cfg.value) {
                        handleSaveConfig(cfg.key, e.target.value);
                      }
                    }}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono text-right focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECCIÓ LOGS D'AUDITORIA */}
      {!loading && tab === "logs" && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white">Registre d&apos;Auditoria del Sistema</h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Data & Hora</th>
                    <th className="p-3.5">Acció</th>
                    <th className="p-3.5">Usuari</th>
                    <th className="p-3.5">Detalls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 text-[11px]">
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("ca-ES")}
                      </td>
                      <td className="p-3.5 font-bold text-purple-300">{log.action}</td>
                      <td className="p-3.5 text-slate-300 font-sans">{log.user?.email || "Sistema"}</td>
                      <td className="p-3.5 text-slate-400 font-sans max-w-xs truncate">
                        {log.metadata || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. SECCIÓ IMPORTADOR D'ÀLBUMS I PREGUNTES */}
      {!loading && tab === "import" && (
        <div className="space-y-6">
          {/* Sub-pestanyes d'importació */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setQImportSubTab("simple")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                qImportSubTab === "simple"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>📝 Importar Preguntes (Text o CSV Senzill)</span>
            </button>

            <button
              type="button"
              onClick={() => setQImportSubTab("full")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                qImportSubTab === "full"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>📦 Importar Paquet Complet d&apos;Àlbum (JSON)</span>
            </button>
          </div>

          {/* SUB-PESTANYA 1: IMPORTADOR SENZILL DE PREGUNTES */}
          {qImportSubTab === "simple" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-purple-400" />
                    <span>Importador Ràpid de Preguntes SMIX</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Copia o puja directament preguntes en format text fàcil d&apos;omplir o fitxer CSV/Excel.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setQImportFormat("text");
                      setQImportContent(sampleTextQuestions);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Carregar Exemple Text</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSimpleTemplate("text")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Plantilla (.txt)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSimpleTemplate("csv")}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar Plantilla (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Guia de Format Visual */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] block">
                  💡 Format recomanat per a cada pregunta (4 opcions A/B/C/D i una correcta):
                </span>
                <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-xl overflow-x-auto leading-relaxed border border-slate-800/80">
{`PREGUNTA: Enunciat de la pregunta aquí?
A) Primera opció de resposta
B) Segona opció de resposta
C) Tercera opció de resposta
D) Quarta opció de resposta
CORRECTA: B
MÒDUL: SMIX M02  (opcional, ex: SMIX M01, M02, M05)
EXPLICACIÓ: Motiu pel qual la B és la correcta. (opcional)`}
                </pre>
              </div>

              {/* Textarea i Càrrega de Fitxer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-200">
                      Contingut de les preguntes a importar:
                    </label>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setQImportFormat("text")}
                        className={`px-2 py-0.5 rounded font-bold ${
                          qImportFormat === "text" ? "bg-purple-600 text-white" : "text-slate-400"
                        }`}
                      >
                        Format Text
                      </button>
                      <button
                        type="button"
                        onClick={() => setQImportFormat("csv")}
                        className={`px-2 py-0.5 rounded font-bold ${
                          qImportFormat === "csv" ? "bg-purple-600 text-white" : "text-slate-400"
                        }`}
                      >
                        Format CSV
                      </button>
                    </div>
                  </div>

                  <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                    <span>📁 Pujar fitxer (.txt o .csv)</span>
                    <input
                      type="file"
                      accept=".txt,.csv,text/plain,text/csv"
                      onChange={handleSimpleQuestionsUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows={12}
                  value={qImportContent}
                  onChange={(e) => setQImportContent(e.target.value)}
                  placeholder="Enganxa aquí les teves preguntes seguint el format o fes clic a 'Carregar Exemple Text'..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
                />

                {qImportError && (
                  <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{qImportError}</span>
                  </div>
                )}

                {qImportSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{qImportSuccess}</span>
                  </div>
                )}

                {/* Previsualització de preguntes detectades */}
                {qImportPreview && qImportPreview.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Vista prèvia de preguntes detectades ({qImportPreview.length}):
                    </span>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {qImportPreview.map((pq, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                          <p className="font-bold text-white">
                            {idx + 1}. {pq.statement}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {pq.answers.map((a: any, aidx: number) => (
                              <span
                                key={aidx}
                                className={`px-2 py-1 rounded-lg border ${
                                  a.isCorrect
                                    ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-bold"
                                    : "bg-slate-900 border-slate-800 text-slate-400"
                                }`}
                              >
                                {String.fromCharCode(65 + aidx)}) {a.text} {a.isCorrect && "✓ (Correcta)"}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={qImporting || !qImportContent.trim()}
                    onClick={handleValidateQuestions}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors disabled:opacity-40"
                  >
                    {qImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validar i Previsualitzar"}
                  </button>

                  <button
                    type="button"
                    disabled={qImporting || !qImportContent.trim()}
                    onClick={handleExecuteSimpleQuestionsImport}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-40"
                  >
                    {qImporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>Importar Preguntes al Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-PESTANYA 2: IMPORTADOR COMPLET JSON */}
          {qImportSubTab === "full" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-purple-400" />
                    <span>Importador d&apos;Àlbums, Cromos i Bancs de Preguntes</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Importa col·leccions completes per a SMIX en format JSON estructurat amb validació automàtica.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSampleTemplate}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Carregar Exemple SMIX</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descarregar Plantilla</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Fitxer o contingut JSON del paquet:
                  </label>

                  <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors">
                    <span>📁 Pujar fitxer .json</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  rows={14}
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder='Enganxa aquí el JSON de l&apos;àlbum o fes clic a "Carregar Exemple SMIX" per veure l&apos;estructura...'
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
                />

                {importError && (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {importResult && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Importació completada amb èxit!</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-slate-400 block text-[10px]">Àlbum:</span>
                        <span className="text-white font-bold">{importResult.albumName}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-slate-400 block text-[10px]">Cromos creats:</span>
                        <span className="text-emerald-400 font-bold">{importResult.cardsCreated}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-slate-400 block text-[10px]">Preguntes creades:</span>
                        <span className="text-purple-400 font-bold">{importResult.questionsCreated}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/30">
                        <span className="text-slate-400 block text-[10px]">Pàgines generades:</span>
                        <span className="text-indigo-400 font-bold">{importResult.pagesCreated}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={importing || !importJson.trim()}
                    onClick={handleExecuteImport}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processant importació...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Processar i Importar Paquet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL CREAR PREGUNTA */}
      {showNewQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Crear Nova Pregunta Educativa</h3>
              <button
                type="button"
                onClick={() => setShowNewQModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">Enunciat:</label>
                <textarea
                  required
                  rows={3}
                  value={newStatement}
                  onChange={(e) => setNewStatement(e.target.value)}
                  placeholder="Escriu aquí la pregunta que hauran de contestar els alumnes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">Dificultat:</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  >
                    <option value="easy">Fàcil</option>
                    <option value="medium">Mitjana</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">Punts:</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-200 mb-1">XP Recompensa:</label>
                  <input
                    type="number"
                    value={newXpReward}
                    onChange={(e) => setNewXpReward(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>
              </div>

              {/* Opcions de resposta */}
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-slate-200">
                  Opcions de resposta (marca la correcta amb el selector):
                </label>
                {answers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={ans.isCorrect}
                      onChange={() => {
                        setAnswers((prev) =>
                          prev.map((a, i) => ({ ...a, isCorrect: i === idx }))
                        );
                      }}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder={`Opció ${idx + 1}`}
                      value={ans.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAnswers((prev) =>
                          prev.map((a, i) => (i === idx ? { ...a, text: val } : a))
                        );
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">
                  Explicació Didàctica (es mostra a l&apos;alumne després de respondre):
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={(e) => setNewExplanation(e.target.value)}
                  placeholder="Explica breument per què aquesta és la resposta correcta..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewQModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md"
                >
                  Guardar Pregunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
