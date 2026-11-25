# ILUSTRUM 🌟

> **Plataforma Educativa Gamificada de Col·leccionisme de Cromos Digitals**  
> Desenvolupada per a l'**Institut Lacetània** (Manresa).

---

## 🚀 Accés Ràpid

- **URL de Producció:** [https://10.51.100.102/](https://10.51.100.102/)
- **Panell d'Administració:** [https://10.51.100.102/admin](https://10.51.100.102/admin)
- **Directori al Servidor:** `/opt/ilustrum`
- **Usuari:** `ilustrum-dev`

---

## 🎯 Característiques Principals

1. **Autenticació Google OAuth amb Domini Restringit**:
   - Accés exclusiu per a usuaris amb compte corporatiu `@lacetania.cat`.
   - Validació de seguretat forçada al servidor; rebuig automàtic de dominis externs.
2. **Sistema de Preguntes Educatives**:
   - Preguntes per assignatura, categoria i nivell de dificultat.
   - Algorisme intel·ligent que prioritza preguntes no contestades.
   - Opcions barrejades amb amagatall absolut de `isCorrect` per evitar trampes al navegador.
3. **Mecànica de Col·leccionisme de Cromos Digitals**:
   - Probabilitats configurables de *drop* en respondre correctament.
   - 5 Rareses ponderades: **Comú** (60%), **Poc comú** (25%), **Rar** (10%), **Èpic** (4%), **Llegendari** (1%).
   - Àlbum interactiu amb caselles bloquejades i cromos desbloquejats amb estètica hologràfica.
4. **Mercat d'Intercanvis Transaccionals (PostgreSQL ACID)**:
   - Bloqueig estricte amb `SELECT ... FOR UPDATE` per prevenir condicions de carrera.
   - Traspàs atòmic de cromos entre alumnes amb registre d'historial.
5. **Gamificació Integral**:
   - Puntuació, punts d'experiència (XP), nivells dinàmics, insígnies i missions.
6. **Panell d'Administració i Gestió**:
   - Gestor de preguntes, categories i assignatures.
   - Control d'usuaris i rols (`student`, `teacher`, `admin`).
   - Configuració en calent de probabilitats i mètriques globals.
   - Registre d'auditoria (logs).

---

## 🛠️ Stack Tecnològic

- **Frontend & Backend:** Next.js 16 (App Router, Turbopack, React 19, TypeScript).
- **Estils:** Tailwind CSS 4.
- **Base de Dades:** PostgreSQL 18.6 nativa (sense Docker).
- **ORM:** Prisma 6.4.
- **Servidor Web & Proxy:** Nginx 1.28 amb HTTP/2 i redirecció HTTP→HTTPS.
- **Process Manager:** PM2 7.1 amb servei systemd.

---

## 📜 Operacions i Manteniment

Consulteu la guia detallada a:
👉 [docs/DEPLOYMENT.md](file:///home/klemen/Escriptori/asincron/Ilustrum/docs/DEPLOYMENT.md)

- **Còpia de seguretat de PostgreSQL:**
  ```bash
  /opt/ilustrum/app/scripts/backup.sh
  ```
- **Desplegament d'actualitzacions:**
  ```bash
  /opt/ilustrum/app/scripts/deploy.sh
  ```
- **Suite de tests de seguretat:**
  ```bash
  npx tsx src/lib/test_suite.ts
  ```
