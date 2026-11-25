# ILUSTRUM 🌟

> **Plataforma Educativa Gamificada de Col·leccionisme de Cromos Digitals**  
> Dissenyada per als cicles formatius d'informàtica (**IC10 - SMIX**) de l'**Institut Lacetània** (Manresa).

---

## 📱 Accés a l'Aplicació

- **Codi font oficial (GitHub):** [https://github.com/Klemen-t/Ilustrum](https://github.com/Klemen-t/Ilustrum)
- **URL Local / Servidor de Proves:** [https://ilustrum.infla.cat](https://ilustrum.infla.cat) (o `https://10.51.100.102/`)
- **Panell d'Administració:** `/admin` (Exclusiu per a `ramon.clemente@lacetania.cat`)

---

## 🚀 Novetats i Millores Recents

### 1. Àlbum Físic en Format Vertical
- Disseny visual que emula un llibret de col·leccionista real de mà amb enquadernació d'espirals i textura de cuir fosc.
- Graella adaptativa: 10 caselles per pàgina (2 columnes a mòbil, 5 columnes a tauleta/escriptori) amb numeració, siluetes bloquejades i marcs hologràfics segons la raresa.
- Controls de girar pàgina («Pàgina Anterior» / «Pàgina Següent») amb pestanyes directes.

### 2. Mecànica d'Enganxar Cromos (Drag & Drop)
- Safata inferior «Cromos a la teva mà»: Els cromos obtinguts es conserven a la mà de l'alumne fins que els enganxa físicament a l'àlbum.
- Suport per arrossegar el cromo directament a la seva casella buida (HTML5 Drag & Drop) amb animació atòmica de confirmació verda.
- Alternativa tàctil amb botó «Enganxar» per a telèfons intel·ligents o tauletes.

### 3. Mercat Lliure d'Intercanvis (Només Cromos Repetits)
- **Protecció de col·lecció**: Només es poden posar al mercat o oferir cromos duplicats (`quantitat > 1`). Els cromos únics queden blindats a l'àlbum.
- **Model de mercat**: L'usuari publica un anunci oferint 1 o més cromos repetits i estableix el cost (1 o diversos cromos que li faltin).
- **Intercanvi directe amb 1 clic**: Qualsevol company que disposi dels cromos demanats pot acceptar el canvi de forma atòmica i immediata.
- **Pestanya «Repetits de la Classe»**: Permet veure quins cromos duplicats tenen els companys per poder pactar bescanvis.

### 4. Reequilibri Estricte de Rareses
Distribució probabilística i ponderació d'àlbums:
- **Comú:** 75%
- **Poc comú:** 18%
- **Rar:** 5%
- **Èpic:** 1,8%
- **Llegendari:** 0,2%

### 5. Supressió del Sistema de Punts
- S'han eliminat els punts numèrics arbitraris. La progressió i el rànquing es basen purament en el **nombre de cromos únics enganxats a l'àlbum**, el nivell d'experiència (XP) i el percentatge d'encerts.

### 6. Catàleg d'Àlbums (200 Cromos en 4 Àlbums Temàtics)
La plataforma compta amb 4 àlbums complets de 50 cromos cadascun (5 pàgines per àlbum en format vertical de 10 caselles):
- **Àlbum 1: Hardware & Muntatge d'Equips (SMIX M01)** (50 cromos)
  - Processadors, sòcols Intel/AMD, memòries RAM DDR4/DDR5, unitats SSD NVMe, plaques base, xipsets, refrigeració líquida i eines de taller del tècnic informàtic.
- **Àlbum 2: Sistemes Operatius & Xarxes Locals (SMIX M02/M05)** (50 cromos)
  - Comandaments GNU/Linux, Bash, Active Directory, cablejat Cat 6A, fibra òptica, commutadors VLAN, adreçament IPv4/IPv6, protocols TCP/UDP i ciberseguretat.
- **Àlbum 3: Música Trista (Joan Dausà & Pop d'Autor)** (50 cromos)
  - Des de la confessió mítica de *'Jo Mai Mai'* i el retorn de *'Judit'*, fins a *'Ara Som Gegants'*, *'Ho Tenim Tot'*, les BSO de *'Barcelona, Nit d'Estiu/Hivern'* i el concert històric al Palau Sant Jordi.
- **Àlbum 4: Música Bemparida (Rhapsody of Fire & Power Metal)** (50 cromos)
  - Els himnes immortals de *'Dawn of Victory'* i *'Emerald Sword'*, la saga d'Algalord, Luca Turilli, Fabio Lione, Sir Christopher Lee i els grans gegants del Power Metal mundial (Helloween, Blind Guardian, Stratovarius, DragonForce, Avantasia).

### 7. Banc de Preguntes Educatives i Culturals
- Més de 70 preguntes reals amb opcions múltiples, explicació pedagògica i temporitzador de 20 segons per posar a prova els coneixements tant de tecnologia i sistemes com de cultura musical i metall èpic.

### 8. Importador Senzill de Preguntes per a l'Admin (`/admin`)
- Suport per a blocs de text pla intuïtius:
  ```text
  PREGUNTA: Quina comanda de Linux mostra els processos actius en temps real?
  A) ps
  B) top
  C) ls
  D) htop
  CORRECTA: B
  MODUL: smix-m02-som
  EXPLICACIO: La comanda top mostra una vista dinàmica dels processos en execució.
  ---
  ```
- Suport per a arxius CSV: `Pregunta;A;B;C;D;Correcta;Mòdul;Explicació`.
- Descàrrega directa de plantilles d'exemple i validació prèvia (dry-run).

### 9. Disseny 100% Adaptat a Mòbils («Mobile Friendly»)
- Barra de navegació inferior fixa estil aplicació nativa (`safe-area-bottom`) amb accés ràpid a Tauler, Preguntes, Àlbum, Intercanvis i Rànquing.
- Paginació compacta de l'àlbum i ajustament fluid de formularis.

---

## 🔒 Autenticació i Seguretat

- **Google OAuth 2.0:** Filtració forçada al servidor per al domini `@lacetania.cat`.
- **Llista blanca autoritzada:** Permís explícit per a alumnes/usuaris autoritzats adicionals (ex: `jrosanas17@gmail.com`).
- **Exclusivitat d'administrador:** Únicament `ramon.clemente@lacetania.cat` té el rol `admin`.
- **Límit diari de preguntes:** 10 preguntes al dia per alumne (il·limitat per a l'administrador o modes de prova).
- **Compte enrere de 20 segons per pregunta**:
  - Segons 0 a 10: 3 sobres de cromos ✉️✉️✉️.
  - Segons 10 a 15: 2 sobres de cromos ✉️✉️.
  - Segons 15 a 20: 1 sobre de cromos ✉️.
  - Temps esgotat (0s): 0 sobres (bloqueig de resposta i avís per passar a la següent).

---

## 🛠️ Stack Tecnològic

- **Frontend & Backend:** Next.js 16.4 (App Router, Turbopack, React 19, TypeScript).
- **Estils:** Tailwind CSS 4.
- **Base de Dades:** PostgreSQL amb Prisma ORM 6.4.
- **Transaccions:** Transaccions ACID atòmiques amb verificació de duplicats.
- **Servidor Web & Proxy:** Nginx amb HTTP/2 i SSL.
- **Process Manager:** PM2 (mode cluster).

---

## 💻 Comandes de Desenvolupament i Desplegament

### Sincronització amb GitHub
Per actualitzar el repositori remot a GitHub des del teu ordinador:
```bash
./pujar_canvis_github.sh
```

### Executar la suite de proves de seguretat i funcionalitat
```bash
npx tsx src/lib/test_suite.ts
```
*(Valida els 29 tests d'integritat: domini, transaccions ACID, rareses, exclusivitat admin i límits diaris).*

### Compilar l'aplicació per a producció
```bash
npm run build
```

---

## 🌐 Desplegament al Núvol (Com connectar la PostgreSQL sense Proxmox)

Per allotjar la web directament a **Vercel** o **Google Cloud (Firebase App Hosting)** sense dependre de la IP privada de Proxmox ni del firewall de l'institut:

1. **Crear una base de dades PostgreSQL al núvol gratuïta**:
   - Servei recomanat: **[Neon.tech](https://neon.tech)** o **[Supabase.com](https://supabase.com)** (100% gratuït, alta en 1 minut).
   - Copiar la cadena de connexió `DATABASE_URL` que et proporcionen (ex: `postgresql://usuari:password@ep-nom.neon.tech/neondb?sslmode=require`).
2. **Inicialitzar l'esquema i les dades a la nova base de dades**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
3. **Connectar GitHub amb Vercel / Firebase**:
   - Importar el repositori `Klemen-t/Ilustrum`.
   - Afegir a les variables d'entorn el `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` i el `NEXT_PUBLIC_APP_URL`.
