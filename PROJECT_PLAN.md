# ILUSTRUM — Pla de Projecte
> Plataforma educativa gamificada amb sistema de cromos digitals

**Versió:** 1.0.0  
**Data:** Novembre 2026  
**Estat:** FASE 1 — Planificació completada

---

## Índex

1. [Visió General](#1-visió-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologies i Dependències](#3-tecnologies-i-dependències)
4. [Estructura de Directoris](#4-estructura-de-directoris)
5. [Model de Base de Dades](#5-model-de-base-de-dades)
6. [API — Mapa de Rutes](#6-api--mapa-de-rutes)
7. [Fases de Desenvolupament](#7-fases-de-desenvolupament)
8. [Riscos i Mitigació](#8-riscos-i-mitigació)
9. [Decisions Tècniques](#9-decisions-tècniques)
10. [Configuració del Servidor](#10-configuració-del-servidor)
11. [Seguretat — Pla Complet](#11-seguretat--pla-complet)

---

## 1. Visió General

### 1.1 Descripció

**ILUSTRUM** és una plataforma educativa gamificada que utilitza el col·leccionisme de cromos digitals com a mecànica central d'aprenentatge. Els alumnes de l'institut Lacetània responen preguntes educatives per guanyar cromos, completar àlbums i desbloquejat recompenses, fomentant la motivació intrínseca i l'aprenentatge actiu.

### 1.2 Públic Objectiu

| Rol | Descripció | Accions principals |
|-----|-----------|-------------------|
| **Alumne** | Estudiant del domini @lacetania.cat | Respondre, col·leccionar, intercanviar |
| **Professor** | Docent del domini @lacetania.cat | Gestionar preguntes, consultar estadístiques |
| **Administrador** | Gestor de la plataforma | Gestió completa del sistema |

### 1.3 Principis de Disseny

- **Security by default**: Cap lògica de puntuació o recompenses s'executa al client.
- **Progressive Enhancement**: Funcional sense JS avançat, millora amb animacions.
- **Mobile First**: Dissenyat primerament per a mòbil, optimitzat per escriptori.
- **Data Integrity**: Totes les transaccions de cromos fan ús de transaccions ACID a PostgreSQL.
- **No Magic Numbers**: Tota la configuració (probabilitats, punts, nivells) és configurable des de l'administració.

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                        SERVIDOR UBUNTU 26                        │
│                       (10.51.100.102)                           │
│                                                                  │
│  ┌──────────┐    ┌──────────────────────────────────────────┐   │
│  │  Nginx   │───▶│          Next.js App (PM2)               │   │
│  │  :443    │    │          /opt/ilustrum                   │   │
│  │  :80     │    │                                          │   │
│  └──────────┘    │   ┌─────────────┐  ┌────────────────┐   │   │
│                  │   │  App Router │  │  API Routes    │   │   │
│                  │   │  (Frontend) │  │  (Backend)     │   │   │
│                  │   └─────────────┘  └────────────────┘   │   │
│                  │          │                │              │   │
│                  │   ┌──────▼──────────────▼──────┐        │   │
│                  │   │     Capa de Serveis         │        │   │
│                  │   │  (Business Logic Layer)     │        │   │
│                  │   └─────────────────────────────┘        │   │
│                  │                  │                        │   │
│                  │   ┌──────────────▼───────────────┐       │   │
│                  │   │     PostgreSQL (port 5432)    │       │   │
│                  │   └──────────────────────────────┘       │   │
│                  └──────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Serveis Externs                                         │   │
│  │  • Google OAuth 2.0  • SMTP (opcional)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Capes de l'Aplicació

```
┌───────────────────────────────────────────────────┐
│  PRESENTACIÓ (React Server/Client Components)      │
│  Pages, Layouts, UI Components                     │
├───────────────────────────────────────────────────┤
│  API (Next.js Route Handlers)                      │
│  Validació Zod, Autenticació, Rate Limiting        │
├───────────────────────────────────────────────────┤
│  SERVEIS (Business Logic)                          │
│  QuestionService, CardService, TradeService...     │
├───────────────────────────────────────────────────┤
│  REPOSITORIS (Data Access Layer)                   │
│  Abstracció sobre Prisma                           │
├───────────────────────────────────────────────────┤
│  BASE DE DADES (PostgreSQL via Prisma ORM)         │
│  Migracions, Índexs, Constraints                  │
└───────────────────────────────────────────────────┘
```

### 2.3 Flux d'Autenticació

```
Usuari ──▶ /login ──▶ Google OAuth ──▶ Callback
                                           │
                              ┌────────────▼─────────────┐
                              │  Verifica @lacetania.cat  │
                              │  al SERVIDOR             │
                              └────────────┬─────────────┘
                                           │
                              ┌────────────▼─────────────┐
                              │  Crea/actualitza usuari   │
                              │  a PostgreSQL             │
                              └────────────┬─────────────┘
                                           │
                              ┌────────────▼─────────────┐
                              │  Crea sessió segura       │
                              │  (JWT + cookie httpOnly)  │
                              └────────────┬─────────────┘
                                           │
                                      Dashboard ◀──────────
```

### 2.4 Flux de Resposta a Pregunta

```
Client ──▶ POST /api/questions/[id]/answer
              │  { answerId }
              │
         ┌────▼──────────────────────────────────┐
         │  API Route                             │
         │  1. Verifica sessió                    │
         │  2. Valida answerId (Zod)              │
         │  3. Rate limit (màx. X/min)            │
         └────┬──────────────────────────────────┘
              │
         ┌────▼──────────────────────────────────┐
         │  QuestionService.submitAnswer()        │
         │  1. Carrega pregunta de BD             │
         │  2. Comprova resposta correcta         │
         │  3. Registra intent (evita duplicats)  │
         │  4. Calcula punts al servidor          │
         └────┬──────────────────────────────────┘
              │
         ┌────▼──────────────────────────────────┐
         │  RewardService.checkAndGrant()         │
         │  1. Actualitza experiència + punts     │
         │  2. Comprova canvi de nivell           │
         │  3. Comprova missions completes        │
         │  4. Llença probabilitat de cromo       │
         │  5. Genera cromo (si pertoca)          │
         └────┬──────────────────────────────────┘
              │
         ┌────▼──────────────────────────────────┐
         │  Resposta al client                    │
         │  { correct, explanation, points,       │
         │    xpGained, newCard?, levelUp? }      │
         └───────────────────────────────────────┘
```

---

## 3. Tecnologies i Dependències

### 3.1 Stack Principal

| Tecnologia | Versió | Propòsit |
|-----------|--------|---------|
| **Node.js** | 24.x LTS | Runtime |
| **Next.js** | 15.x (App Router) | Framework full-stack |
| **React** | 19.x | UI |
| **TypeScript** | 5.x | Tipatge estricte |
| **Tailwind CSS** | 4.x | Estils utilitaris |
| **PostgreSQL** | 16.x | Base de dades principal |
| **Prisma** | 6.x | ORM + migracions |
| **Nginx** | 1.26.x | Proxy invers + TLS |
| **PM2** | 5.x | Gestió de processos |

### 3.2 Dependències NPM — Producció

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^6.0.0",
    "next-auth": "^5.0.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.9.0",
    "react-hook-form": "^7.53.0",
    "jose": "^5.9.0",
    "bcryptjs": "^2.4.3",
    "sharp": "^0.33.0",
    "nanoid": "^5.0.0",
    "date-fns": "^4.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.456.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "framer-motion": "^11.11.0",
    "recharts": "^2.13.0",
    "rate-limiter-flexible": "^5.0.0",
    "helmet": "^8.0.0",
    "pino": "^9.5.0",
    "pino-pretty": "^13.0.0"
  }
}
```

### 3.3 Dependències de Desenvolupament

```json
{
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^6.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "prettier": "^3.3.0",
    "jest": "^29.7.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.2.0",
    "supertest": "^7.0.0"
  }
}
```

---

## 4. Estructura de Directoris

```
/home/klemen/Escriptori/asincron/Ilustrum/   ← Directori de treball
/opt/ilustrum/                                ← Desplegament producció

ilustrum/
├── .env.example                    # Variables d'entorn (plantilla)
├── .env.local                      # Variables locals (NO al repo)
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.ts                  # Configuració Next.js
├── tsconfig.json                   # TypeScript estricte
├── tailwind.config.ts
├── postcss.config.js
├── package.json
├── prisma/
│   ├── schema.prisma               # Esquema complet
│   ├── migrations/                 # Migracions versionades
│   └── seed.ts                     # Dades inicials (rareses, config)
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Layout arrel
│   │   ├── page.tsx                # Landing / redirect
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/                 # Grup de rutes auth
│   │   │   ├── login/page.tsx
│   │   │   └── error/page.tsx
│   │   │
│   │   ├── (app)/                  # Rutes protegides (alumne)
│   │   │   ├── layout.tsx          # Layout amb nav + auth check
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx        # Selecció de preguntes
│   │   │   │   └── [id]/page.tsx   # Pregunta individual
│   │   │   ├── album/
│   │   │   │   ├── page.tsx        # Àlbums disponibles
│   │   │   │   └── [albumId]/page.tsx
│   │   │   ├── inventory/page.tsx  # Inventari i repetits
│   │   │   ├── trades/
│   │   │   │   ├── page.tsx        # Llistat d'intercanvis
│   │   │   │   ├── new/page.tsx    # Nova proposta
│   │   │   │   └── [tradeId]/page.tsx
│   │   │   ├── ranking/page.tsx
│   │   │   └── missions/page.tsx
│   │   │
│   │   ├── (admin)/                # Rutes admin protegides
│   │   │   ├── layout.tsx          # Layout admin + rol check
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx        # Dashboard admin
│   │   │   │   ├── users/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [userId]/page.tsx
│   │   │   │   ├── questions/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [questionId]/page.tsx
│   │   │   │   ├── cards/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [cardId]/page.tsx
│   │   │   │   ├── albums/page.tsx
│   │   │   │   ├── rarities/page.tsx
│   │   │   │   ├── rewards/page.tsx
│   │   │   │   ├── trades/page.tsx
│   │   │   │   ├── stats/page.tsx
│   │   │   │   ├── config/page.tsx
│   │   │   │   └── logs/page.tsx
│   │   │
│   │   └── api/                    # API Routes (backend)
│   │       ├── auth/
│   │       │   └── [...nextauth]/route.ts
│   │       ├── users/
│   │       │   ├── route.ts
│   │       │   └── [userId]/route.ts
│   │       ├── questions/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       └── answer/route.ts
│   │       ├── cards/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── albums/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── inventory/
│   │       │   └── route.ts
│   │       ├── trades/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       ├── route.ts
│   │       │       ├── accept/route.ts
│   │       │       └── reject/route.ts
│   │       ├── ranking/route.ts
│   │       ├── missions/route.ts
│   │       ├── rewards/route.ts
│   │       ├── stats/route.ts
│   │       └── admin/
│   │           ├── users/route.ts
│   │           ├── questions/route.ts
│   │           ├── cards/route.ts
│   │           ├── config/route.ts
│   │           └── logs/route.ts
│   │
│   ├── components/                 # Components React reutilitzables
│   │   ├── ui/                     # Primitius UI (Button, Card, Modal...)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── loading.tsx
│   │   │
│   │   ├── layout/                 # Estructura de pàgina
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── mobile-nav.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── login-button.tsx
│   │   │   └── session-provider.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── stats-card.tsx
│   │   │   ├── activity-feed.tsx
│   │   │   ├── level-progress.tsx
│   │   │   └── recent-cards.tsx
│   │   │
│   │   ├── questions/
│   │   │   ├── question-card.tsx
│   │   │   ├── answer-option.tsx
│   │   │   ├── result-modal.tsx
│   │   │   └── timer.tsx
│   │   │
│   │   ├── cards/                  # Components de cromos
│   │   │   ├── card-display.tsx    # Cromo individual (visual)
│   │   │   ├── card-flip.tsx       # Animació de girar
│   │   │   ├── card-reveal.tsx     # Animació d'obtenció
│   │   │   ├── rarity-badge.tsx
│   │   │   └── card-grid.tsx
│   │   │
│   │   ├── album/
│   │   │   ├── album-cover.tsx
│   │   │   ├── album-page.tsx
│   │   │   ├── card-slot.tsx       # Espai buit o ocupat
│   │   │   └── completion-bar.tsx
│   │   │
│   │   ├── trades/
│   │   │   ├── trade-proposal.tsx
│   │   │   ├── trade-card.tsx
│   │   │   └── trade-history.tsx
│   │   │
│   │   ├── gamification/
│   │   │   ├── xp-bar.tsx
│   │   │   ├── level-badge.tsx
│   │   │   ├── mission-card.tsx
│   │   │   ├── badge-display.tsx
│   │   │   └── ranking-row.tsx
│   │   │
│   │   └── admin/
│   │       ├── data-table.tsx
│   │       ├── question-form.tsx
│   │       ├── card-form.tsx
│   │       └── stats-chart.tsx
│   │
│   ├── lib/                        # Utilitats compartides
│   │   ├── auth.ts                 # Configuració NextAuth
│   │   ├── db.ts                   # Client Prisma singleton
│   │   ├── validations/            # Schemas Zod
│   │   │   ├── auth.ts
│   │   │   ├── question.ts
│   │   │   ├── card.ts
│   │   │   ├── trade.ts
│   │   │   └── admin.ts
│   │   ├── utils.ts                # Helpers generals
│   │   ├── constants.ts            # Constants de l'app
│   │   └── rate-limit.ts           # Rate limiting
│   │
│   ├── services/                   # Lògica de negoci
│   │   ├── question.service.ts
│   │   ├── card.service.ts
│   │   ├── album.service.ts
│   │   ├── trade.service.ts
│   │   ├── reward.service.ts
│   │   ├── gamification.service.ts
│   │   ├── mission.service.ts
│   │   ├── user.service.ts
│   │   └── notification.service.ts
│   │
│   ├── repositories/               # Accés a dades (DAL)
│   │   ├── user.repository.ts
│   │   ├── question.repository.ts
│   │   ├── card.repository.ts
│   │   ├── album.repository.ts
│   │   ├── trade.repository.ts
│   │   └── inventory.repository.ts
│   │
│   ├── types/                      # Tipus TypeScript globals
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   ├── game.ts
│   │   └── api.ts
│   │
│   ├── hooks/                      # React Custom Hooks
│   │   ├── use-session.ts
│   │   ├── use-cards.ts
│   │   ├── use-trades.ts
│   │   └── use-gamification.ts
│   │
│   └── middleware.ts               # Protecció de rutes global
│
├── public/
│   ├── images/
│   │   ├── cards/                  # Imatges de cromos
│   │   ├── albums/                 # Portades d'àlbums
│   │   ├── badges/                 # Insígnies
│   │   └── avatars/                # Avatars per defecte
│   └── icons/
│
├── docs/
│   ├── PROJECT_PLAN.md             # Aquest document
│   ├── API.md                      # Documentació API
│   ├── DATABASE.md                 # Esquema BD detallat
│   ├── DEPLOYMENT.md               # Guia de desplegament
│   └── SECURITY.md                 # Decisions de seguretat
│
├── scripts/
│   ├── setup.sh                    # Instal·lació al servidor
│   ├── deploy.sh                   # Script de desplegament
│   ├── backup.sh                   # Backup de BD
│   └── migrate.sh                  # Execució de migracions
│
└── __tests__/
    ├── unit/
    │   ├── services/
    │   └── utils/
    ├── integration/
    │   └── api/
    └── security/
```

---

## 5. Model de Base de Dades

### 5.1 Diagrama Entitat-Relació (Principal)

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users     │────<│  user_sessions   │     │    roles     │
│              │     └──────────────────┘     │              │
│  id (PK)     │                              │  id (PK)     │
│  email       │────────────────────────────>│  name        │
│  name        │     ┌──────────────────┐     └──────────────┘
│  avatar      │────<│  user_inventory  │
│  role_id     │     │                  │     ┌──────────────┐
│  level       │     │  user_id (FK)    │────▶│    cards     │
│  xp          │     │  card_id (FK)    │     │              │
│  points      │     │  quantity        │     │  id (PK)     │
│  is_active   │     │  obtained_at     │     │  name        │
│  created_at  │     └──────────────────┘     │  description │
└──────────────┘                              │  image_url   │
       │                                      │  category_id │
       │          ┌─────────────────────┐     │  album_id    │
       │────────<│  question_attempts  │     │  number      │
       │          │                     │     │  rarity_id   │
       │          │  user_id            │     │  value       │
       │          │  question_id        │     │  is_active   │
       │          │  answer_id          │     │  created_at  │
       │          │  is_correct         │     └──────────────┘
       │          │  points_earned      │            │
       │          │  attempted_at       │            │
       │          └─────────────────────┘     ┌──────▼───────┐
       │                                       │   rarities   │
       │          ┌─────────────────────┐     │              │
       │────────<│      trades         │     │  id (PK)     │
                  │                     │     │  name        │
                  │  id (PK)            │     │  probability │
                  │  proposer_id (FK)   │     │  color_hex   │
                  │  receiver_id (FK)   │     │  sort_order  │
                  │  status             │     └──────────────┘
                  │  message            │
                  │  created_at         │     ┌──────────────┐
                  │  updated_at         │     │    albums    │
                  └─────────────────────┘     │              │
                         │                    │  id (PK)     │
                         │                    │  name        │
              ┌──────────┴──────┐             │  description │
              ▼                 ▼             │  cover_image │
   ┌────────────────┐ ┌──────────────────┐   │  total_cards │
   │ trade_offers   │ │ trade_requests   │   │  is_active   │
   │ (cromos oferts)│ │(cromos sol·licits)│  └──────────────┘
   └────────────────┘ └──────────────────┘
```

### 5.2 Esquema Prisma Complet (Draft)

```prisma
// === USUARIS I AUTENTICACIÓ ===

model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique // "student" | "teacher" | "admin"
  users User[]
}

model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String
  displayName     String?
  avatar          String?
  googleId        String?  @unique
  roleId          Int      @default(1)
  role            Role     @relation(fields: [roleId], references: [id])
  level           Int      @default(1)
  xp              Int      @default(0)
  xpToNextLevel   Int      @default(100)
  points          Int      @default(0)
  totalPoints     Int      @default(0)
  isActive        Boolean  @default(true)
  lastLoginAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relacions
  sessions        Session[]
  inventory       UserInventory[]
  questionAttempts QuestionAttempt[]
  badgeUsers      UserBadge[]
  missionProgress MissionProgress[]
  tradesProposed  Trade[]  @relation("Proposer")
  tradesReceived  Trade[]  @relation("Receiver")
  activityLogs    ActivityLog[]
  stats           UserStats?

  @@index([email])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessionToken String   @unique
  expires      DateTime
  createdAt    DateTime @default(now())

  @@index([sessionToken])
  @@index([userId])
}

// === CROMOS I RARESES ===

model Rarity {
  id          Int     @id @default(autoincrement())
  name        String  @unique // "comú" | "poc comú" | "rar" | "èpic" | "llegendari"
  nameKey     String  @unique // "common" | "uncommon" | "rare" | "epic" | "legendary"
  probability Float   // 0.0 - 1.0 (configurable per admin)
  colorHex    String  // "#gray" | "#green" | "#blue" | "#purple" | "#gold"
  glowColor   String  // Per efectes visuals
  sortOrder   Int
  cards       Card[]
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  color     String
  icon      String?
  cards     Card[]
  questions Question[]
}

model Subject {
  id        Int        @id @default(autoincrement())
  name      String     @unique
  slug      String     @unique
  color     String
  icon      String?
  questions Question[]
}

model Album {
  id          String   @id @default(cuid())
  name        String
  description String?
  coverImage  String?
  totalCards  Int
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  cards       Card[]
  pages       AlbumPage[]
}

model AlbumPage {
  id       String @id @default(cuid())
  albumId  String
  album    Album  @relation(fields: [albumId], references: [id])
  pageNum  Int
  layout   String @default("grid-3x3") // Configuració de layout
  cards    Card[]
}

model Card {
  id          String    @id @default(cuid())
  name        String
  description String?
  imageUrl    String?
  number      Int
  rarityId    Int
  rarity      Rarity    @relation(fields: [rarityId], references: [id])
  categoryId  Int?
  category    Category? @relation(fields: [categoryId], references: [id])
  albumId     String
  album       Album     @relation(fields: [albumId], references: [id])
  pageId      String?
  page        AlbumPage? @relation(fields: [pageId], references: [id])
  value       Int       @default(10) // Valor en punts
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relacions
  inventory         UserInventory[]
  tradeOfferItems   TradeOfferItem[]
  tradeRequestItems TradeRequestItem[]

  @@unique([albumId, number])
  @@index([rarityId])
  @@index([albumId])
}

// === INVENTARI ===

model UserInventory {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cardId     String
  card       Card     @relation(fields: [cardId], references: [id])
  quantity   Int      @default(1)
  obtainedAt DateTime @default(now())
  source     String   // "question" | "reward" | "trade" | "event" | "pack"

  @@unique([userId, cardId])
  @@index([userId])
  @@index([cardId])
}

// === PREGUNTES ===

model Question {
  id              String   @id @default(cuid())
  statement       String
  categoryId      Int?
  category        Category? @relation(fields: [categoryId], references: [id])
  subjectId       Int?
  subject         Subject?  @relation(fields: [subjectId], references: [id])
  difficulty      String    // "easy" | "medium" | "hard"
  explanation     String?
  points          Int       @default(10)
  xpReward        Int       @default(15)
  recommendedTime Int       @default(60) // Segons
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  answers         Answer[]
  attempts        QuestionAttempt[]

  @@index([difficulty])
  @@index([subjectId])
  @@index([categoryId])
}

model Answer {
  id         String   @id @default(cuid())
  questionId String
  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  text       String
  isCorrect  Boolean  @default(false)
  sortOrder  Int      @default(0)

  attempts   QuestionAttempt[]

  @@index([questionId])
}

model QuestionAttempt {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  questionId  String
  question    Question @relation(fields: [questionId], references: [id])
  answerId    String?
  answer      Answer?  @relation(fields: [answerId], references: [id])
  isCorrect   Boolean
  pointsEarned Int     @default(0)
  xpEarned    Int      @default(0)
  attemptedAt DateTime @default(now())

  @@index([userId, questionId])
  @@index([userId])
}

// === INTERCANVIS ===

enum TradeStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
  EXPIRED
}

model Trade {
  id          String      @id @default(cuid())
  proposerId  String
  proposer    User        @relation("Proposer", fields: [proposerId], references: [id])
  receiverId  String
  receiver    User        @relation("Receiver", fields: [receiverId], references: [id])
  status      TradeStatus @default(PENDING)
  message     String?
  expiresAt   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  offerItems   TradeOfferItem[]
  requestItems TradeRequestItem[]
  history      TradeHistory[]

  @@index([proposerId])
  @@index([receiverId])
  @@index([status])
}

model TradeOfferItem {
  id      String @id @default(cuid())
  tradeId String
  trade   Trade  @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  cardId  String
  card    Card   @relation(fields: [cardId], references: [id])
  quantity Int   @default(1)
}

model TradeRequestItem {
  id      String @id @default(cuid())
  tradeId String
  trade   Trade  @relation(fields: [tradeId], references: [id], onDelete: Cascade)
  cardId  String
  card    Card   @relation(fields: [cardId], references: [id])
  quantity Int   @default(1)
}

model TradeHistory {
  id        String   @id @default(cuid())
  tradeId   String
  trade     Trade    @relation(fields: [tradeId], references: [id])
  action    String   // "created" | "accepted" | "rejected" | "cancelled" | "expired"
  actorId   String
  note      String?
  createdAt DateTime @default(now())
}

// === GAMIFICACIÓ ===

model Badge {
  id          String      @id @default(cuid())
  name        String      @unique
  description String
  imageUrl    String?
  condition   String      // JSON: { type, threshold, ... }
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())

  userBadges  UserBadge[]
}

model UserBadge {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badgeId    String
  badge      Badge    @relation(fields: [badgeId], references: [id])
  earnedAt   DateTime @default(now())

  @@unique([userId, badgeId])
}

model Mission {
  id          String   @id @default(cuid())
  name        String
  description String
  type        String   // "daily" | "weekly" | "permanent"
  condition   String   // JSON: condicions
  rewardPoints Int     @default(0)
  rewardXp    Int      @default(0)
  rewardCardId String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  progress    MissionProgress[]
}

model MissionProgress {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  missionId   String
  mission     Mission  @relation(fields: [missionId], references: [id])
  progress    Int      @default(0)
  isCompleted Boolean  @default(false)
  completedAt DateTime?
  resetAt     DateTime? // Per missions diàries/setmanals

  @@unique([userId, missionId])
}

// === ESTADÍSTIQUES ===

model UserStats {
  id                String @id @default(cuid())
  userId            String @unique
  user              User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  totalAnswers      Int    @default(0)
  correctAnswers    Int    @default(0)
  totalCards        Int    @default(0)
  uniqueCards       Int    @default(0)
  tradesCompleted   Int    @default(0)
  streakDays        Int    @default(0)
  lastActivityDate  DateTime?
  updatedAt         DateTime @updatedAt
}

// === CONFIGURACIÓ ===

model AppConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String   // JSON o valor simple
  updatedAt DateTime @updatedAt
  updatedBy String?
}

// === LOGS ===

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String
  entity    String?
  entityId  String?
  metadata  String?  // JSON
  ip        String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

### 5.3 Taula de Configuració (AppConfig)

| Clau | Valor per defecte | Descripció |
|------|------------------|-----------|
| `rarity.common.probability` | `0.60` | Probabilitat de cromo comú |
| `rarity.uncommon.probability` | `0.25` | Probabilitat poc comú |
| `rarity.rare.probability` | `0.10` | Probabilitat rar |
| `rarity.epic.probability` | `0.04` | Probabilitat èpic |
| `rarity.legendary.probability` | `0.01` | Probabilitat llegendari |
| `card.chance_on_correct` | `0.30` | Prob. d'obtenir cromo per resposta correcta |
| `xp.level_formula` | `"100 * level^1.5"` | Fórmula de XP per nivell |
| `trade.expiry_hours` | `48` | Hores fins que expira una proposta |
| `rate_limit.answers_per_minute` | `10` | Màx. respostes per minut |

---

## 6. API — Mapa de Rutes

### 6.1 Autenticació

| Mètode | Ruta | Descripció | Auth |
|--------|------|-----------|------|
| GET | `/api/auth/signin` | Inici OAuth Google | — |
| GET | `/api/auth/callback/google` | Callback OAuth | — |
| POST | `/api/auth/signout` | Logout | ✓ |
| GET | `/api/auth/session` | Sessió actual | ✓ |

### 6.2 Usuaris

| Mètode | Ruta | Descripció | Auth |
|--------|------|-----------|------|
| GET | `/api/users/me` | Perfil propi | ✓ |
| PATCH | `/api/users/me` | Actualitzar perfil | ✓ |
| GET | `/api/users/[id]` | Perfil públic | ✓ |
| GET | `/api/users` | Llistat (admin) | ADMIN |

### 6.3 Preguntes

| Mètode | Ruta | Descripció | Auth |
|--------|------|-----------|------|
| GET | `/api/questions` | Llista paginada | ✓ |
| GET | `/api/questions/random` | Pregunta aleatòria | ✓ |
| POST | `/api/questions/[id]/answer` | Respondre pregunta | ✓ |
| POST | `/api/questions` | Crear pregunta | ADMIN |
| PATCH | `/api/questions/[id]` | Editar pregunta | ADMIN |
| DELETE | `/api/questions/[id]` | Eliminar pregunta | ADMIN |

### 6.4 Cromos i Inventari

| Mètode | Ruta | Descripció | Auth |
|--------|------|-----------|------|
| GET | `/api/cards` | Catàleg complet | ✓ |
| GET | `/api/cards/[id]` | Detall cromo | ✓ |
| GET | `/api/inventory` | Inventari propi | ✓ |
| GET | `/api/inventory/[userId]` | Inventari d'un usuari | ✓ |
| POST | `/api/cards` | Crear cromo | ADMIN |
| PATCH | `/api/cards/[id]` | Editar cromo | ADMIN |

### 6.5 Intercanvis

| Mètode | Ruta | Descripció | Auth |
|--------|------|-----------|------|
| GET | `/api/trades` | Llistat intercanvis | ✓ |
| POST | `/api/trades` | Nova proposta | ✓ |
| GET | `/api/trades/[id]` | Detall intercanvi | ✓ |
| POST | `/api/trades/[id]/accept` | Acceptar | ✓ |
| POST | `/api/trades/[id]/reject` | Rebutjar | ✓ |
| DELETE | `/api/trades/[id]` | Cancel·lar | ✓ |

### 6.6 Gamificació

| Mètode | Ruta | Descripció | Auth |
|--------|------|-----------|------|
| GET | `/api/ranking` | Rànquing global | ✓ |
| GET | `/api/missions` | Missions actives | ✓ |
| GET | `/api/stats/me` | Estadístiques pròpies | ✓ |

---

## 7. Fases de Desenvolupament

### FASE 1 — Planificació ✅
**Durada estimada:** 2h  
**Lliurables:** `PROJECT_PLAN.md`

### FASE 2 — Infraestructura
**Durada estimada:** 3-4h  
**Subtasques:**
- [ ] `npx create-next-app` amb TypeScript i Tailwind
- [ ] Configurar `tsconfig.json` en mode estricte
- [ ] Instal·lar Prisma i inicialitzar
- [ ] Escriure `prisma/schema.prisma` complet
- [ ] Executar primera migració
- [ ] Crear `seed.ts` (rareses, rols, config)
- [ ] Crear `.env.example`
- [ ] Configurar estructura de directoris
- [ ] Configurar ESLint + Prettier
- [ ] Configurar `next.config.ts` (headers de seguretat)

### FASE 3 — Autenticació
**Durada estimada:** 3h  
**Subtasques:**
- [ ] Configurar NextAuth v5 amb Google Provider
- [ ] Implementar validació de domini `@lacetania.cat` al servidor
- [ ] Crear callback per crear/actualitzar usuaris a BD
- [ ] Configurar `middleware.ts` per protegir rutes
- [ ] Implementar pàgina de login
- [ ] Implementar logout
- [ ] Implementar Session Provider
- [ ] Tests de permisos per rol

### FASE 4 — Interfície Principal
**Durada estimada:** 4-5h  
**Subtasques:**
- [ ] Disseny del sistema de colors i tipografia
- [ ] Components UI bàsics (Button, Card, Badge, etc.)
- [ ] Layout principal (Navbar, Sidebar, Footer)
- [ ] Dashboard de l'alumne
- [ ] Pàgina de perfil
- [ ] Responsive mobile/tablet/desktop
- [ ] Microanimacions base (Framer Motion)

### FASE 5 — Preguntes
**Durada estimada:** 4h  
**Subtasques:**
- [ ] API GET preguntes aleatòries (evitant repeticions)
- [ ] API POST resposta (validació al servidor)
- [ ] Servei de puntuació i XP
- [ ] Lògica de nivell (canvi de nivell)
- [ ] UI de pregunta (timer, opcions, resultat)
- [ ] Modal de resultat (correcte/incorrecte + explicació)
- [ ] Integració amb sistema de recompenses

### FASE 6 — Cromos i Àlbums
**Durada estimada:** 5h  
**Subtasques:**
- [ ] Model de probabilitats configurable
- [ ] Servei de generació de cromos (`CardService.grant()`)
- [ ] Gestió d'inventari i repetits
- [ ] API d'inventari
- [ ] Visualitzador d'àlbum (pàgines, espais buits)
- [ ] Component `CardDisplay` amb rareses visuals
- [ ] Animació d'obtenció de cromo (`CardReveal`)
- [ ] Pàgina de catàleg

### FASE 7 — Intercanvis
**Durada estimada:** 4h  
**Subtasques:**
- [ ] API creació de proposta (amb validació de propietat)
- [ ] API acceptació amb transacció PostgreSQL (SELECT FOR UPDATE)
- [ ] API rebuig i cancel·lació
- [ ] UI de propostes rebudes/enviades
- [ ] UI de creació de proposta (selecció de cromos)
- [ ] Historial d'intercanvis
- [ ] Tests de transaccionalitat i concurrència

### FASE 8 — Administració
**Durada estimada:** 4h  
**Subtasques:**
- [ ] Layout admin (protecció per rol ADMIN)
- [ ] Dashboard d'estadístiques
- [ ] CRUD de preguntes
- [ ] CRUD de cromos
- [ ] CRUD d'àlbums
- [ ] Gestió d'usuaris (activar/desactivar/canviar rol)
- [ ] Configuració de probabilitats
- [ ] Consulta de logs d'activitat

### FASE 9 — Tests i Seguretat
**Durada estimada:** 4h  
**Subtasques:**
- [ ] Tests unitaris: `QuestionService`, `CardService`, `TradeService`
- [ ] Tests d'integració: APIs principals
- [ ] Tests de seguretat: validació domini, permisos per rol
- [ ] Tests de transaccions: intercanvis concurrents
- [ ] Rate limiting: test d'abús
- [ ] Revisió de headers HTTP (Helmet)
- [ ] Revisió de validació Zod a totes les APIs

### FASE 10 — Documentació i Desplegament
**Durada estimada:** 3h  
**Subtasques:**
- [ ] Script `setup.sh` per al servidor Ubuntu
- [ ] Script `deploy.sh` per actualitzacions
- [ ] Script `backup.sh` per PostgreSQL
- [ ] Configuració Nginx (proxy + TLS)
- [ ] Configuració PM2 (ecosystem.config.js)
- [ ] `DEPLOYMENT.md` complet
- [ ] Verificació final de producció

---

## 8. Riscos i Mitigació

### 8.1 Riscos Tècnics

| Risc | Probabilitat | Impacte | Mitigació |
|------|-------------|---------|-----------|
| **Condició de carrera en intercanvis** | Alta | Crític | `SELECT FOR UPDATE` + transaccions ACID |
| **Manipulació de puntuació des del client** | Alta | Crític | Tota la lògica de puntuació és server-side |
| **OAuth bypass del domini** | Mitjana | Crític | Validació de domini al callback del servidor |
| **Duplicació de cromos** | Mitjana | Alt | Constraint `UNIQUE(userId, cardId)` + transaccions |
| **Rate abuse de preguntes** | Alta | Mitjà | Rate limiting per IP i per usuari |
| **XSS en contingut d'usuari** | Baixa | Alt | Sanitització de totes les entrades |
| **SQL Injection** | Baixa | Crític | Prisma usa queries parametritzades |
| **Sessió invàlida a producció** | Baixa | Mitjà | JWT segur + rotació de secrets |

### 8.2 Riscos de Projecte

| Risc | Probabilitat | Impacte | Mitigació |
|------|-------------|---------|-----------|
| **Complexitat de la UI de l'àlbum** | Alta | Mitjà | Prototip UI ràpid + iteració |
| **Volum de dades en rànquings** | Baixa | Baix | Paginació + caché |
| **Configuració OAuth a producció** | Mitjana | Alt | Documentació detallada + OAuth authorized domains |

### 8.3 Decisions Bloquejants (cal resoldre)

> ⚠️ **Credencials Google OAuth**: Cal crear un projecte a Google Cloud Console i obtenir `GOOGLE_CLIENT_ID` i `GOOGLE_CLIENT_SECRET`. Sense aquests valors, la FASE 3 no es pot completar.

> ⚠️ **Certificat TLS**: Cal disposar d'un domini o usar un certificat auto-signat per a la xarxa local. Caldrà decidir si s'usa Let's Encrypt (requereix domini públic) o `mkcert` per a xarxa local.

---

## 9. Decisions Tècniques

### 9.1 Per què Next.js App Router?
- Server Components redueixen el JS al client
- Route Handlers simplifiquen l'API (no cal servidor Express separat)
- Millor SEO i rendiment
- Ecosistema madur per a autenticació (NextAuth v5)

### 9.2 Per què Prisma com a ORM?
- Tipatge automàtic generat des de l'esquema
- Sistema de migracions integrat i robust
- Suport natiu per a PostgreSQL
- Queries parametritzades per defecte (protecció SQL Injection)

### 9.3 Per què NextAuth v5 (Auth.js)?
- Integració nativa amb Next.js App Router
- Suport Google OAuth out-of-the-box
- Gestió segura de sessions (JWT + cookies httpOnly)
- Fàcil extensió per validar el domini

### 9.4 Per què Zod per a validació?
- Validació i tipatge TypeScript en un sol lloc
- Integració amb React Hook Form (formularis)
- Errors descriptius per a l'API

### 9.5 Per què Framer Motion?
- Animacions fluides per a la revelació de cromos
- API declarativa integrada amb React
- Suport per a gestos (swipe en mòbil)

### 9.6 Per què PM2 en lloc de systemd?
- Reinici automàtic en fallada
- Monitoratge integrat (CPU, memòria, logs)
- Zero-downtime deployments (`pm2 reload`)
- Ecosystem config per a variables d'entorn de producció

### 9.7 Estratègia d'Intercanvis (Concurrència)
Per garantir la integritat dels intercanvis:
```sql
-- Pseudocodi de la transacció d'acceptació
BEGIN;
  SELECT * FROM user_inventory 
    WHERE user_id = $proposerId AND card_id = ANY($offeredCards) 
    FOR UPDATE;  -- Bloqueja les files
  
  SELECT * FROM user_inventory 
    WHERE user_id = $receiverId AND card_id = ANY($requestedCards) 
    FOR UPDATE;
  
  -- Verifica quantitats
  -- Executa l'intercanvi
  -- Actualitza estat del trade
  -- Registra a TradeHistory
COMMIT;
```

### 9.8 Sistema de Probabilitats de Rareses
```typescript
// Algorisme de selecció de raresa
function selectRarity(config: RarityConfig[]): Rarity {
  const random = Math.random(); // Server-side, no manipulable
  let cumulative = 0;
  
  for (const rarity of config.sortedByProbability) {
    cumulative += rarity.probability;
    if (random <= cumulative) return rarity;
  }
  
  return config.common; // Fallback
}
```

---

## 10. Configuració del Servidor

### 10.1 Estructura de Directoris al Servidor

```
/opt/ilustrum/
├── app/           # Codi de l'aplicació (desplegat)
├── logs/          # Logs de PM2 i Nginx
├── backups/       # Backups de PostgreSQL
└── ssl/           # Certificats TLS

/etc/nginx/sites-available/ilustrum
/etc/postgresql/16/main/
```

### 10.2 Variables d'Entorn (.env.example)

```bash
# === APLICACIÓ ===
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://10.51.100.102
PORT=3000

# === BASE DE DADES ===
DATABASE_URL="postgresql://ilustrum_user:CANVIA_AIXO@localhost:5432/ilustrum_db"

# === AUTENTICACIÓ ===
NEXTAUTH_URL=https://10.51.100.102
NEXTAUTH_SECRET=GENERA_AMB_openssl_rand_-base64_32

# === GOOGLE OAUTH ===
GOOGLE_CLIENT_ID=el_teu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=el_teu_client_secret

# === DOMINI AUTORITZAT ===
ALLOWED_EMAIL_DOMAIN=lacetania.cat

# === CONFIGURACIÓ ===
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### 10.3 Configuració Nginx

```nginx
server {
    listen 80;
    server_name 10.51.100.102;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 10.51.100.102;

    ssl_certificate /opt/ilustrum/ssl/cert.pem;
    ssl_certificate_key /opt/ilustrum/ssl/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; ...";

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 11. Seguretat — Pla Complet

### 11.1 Capa de Transport
- [ ] HTTPS obligatori (redirecció HTTP → HTTPS)
- [ ] TLS 1.2+ (desactivar TLS 1.0/1.1)
- [ ] Headers de seguretat via Nginx

### 11.2 Autenticació i Sessions
- [ ] Google OAuth com a únic mètode d'autenticació
- [ ] Validació de domini `@lacetania.cat` al **servidor** (callback NextAuth)
- [ ] JWT signat amb `NEXTAUTH_SECRET` (mínim 32 bytes aleatoris)
- [ ] Cookies `httpOnly`, `Secure`, `SameSite=lax`
- [ ] Expiració de sessions configurable

### 11.3 Autorització
- [ ] Middleware Next.js: protecció de rutes per rol
- [ ] Verificació de rol a cada API Route (no confiar en middleware sol)
- [ ] Validació de propietat de recursos (un usuari no pot modificar recursos d'un altre)

### 11.4 Validació de Dades
- [ ] Zod en totes les APIs (body, query params, path params)
- [ ] Sanitització de strings d'entrada
- [ ] Validació de types estricta (TypeScript strict mode)

### 11.5 Protecció contra Atacs
- [ ] Rate limiting per IP i per usuari autenticat
- [ ] Protecció CSRF: cookies SameSite + headers d'origen
- [ ] SQL Injection: Prisma (queries parametritzades)
- [ ] XSS: React escapa per defecte + CSP headers
- [ ] Protecció de manipulació: punts i recompenses calculats servidor

### 11.6 Logs i Auditoria
- [ ] Log de totes les accions administratives
- [ ] Log d'intents d'autenticació fallits
- [ ] Log de transaccions d'intercanvi
- [ ] Rotació de logs automàtica (PM2 + logrotate)

---

## Resum Executiu

| Aspecte | Decisió |
|---------|---------|
| **Framework** | Next.js 15 App Router |
| **BD** | PostgreSQL 16 + Prisma ORM |
| **Auth** | NextAuth v5 + Google OAuth |
| **Estils** | Tailwind CSS 4 + Framer Motion |
| **Validació** | Zod (server + client) |
| **Process Manager** | PM2 |
| **Proxy** | Nginx |
| **Tests** | Jest + Testing Library |
| **Desplegament** | Ubuntu 26, /opt/ilustrum |
| **Seguretat** | Server-side only logic, JWT httpOnly, Rate limiting |

**Total estimat de desenvolupament:** ~35-40 hores de treball

---

*Document generat per l'equip ILUSTRUM — FASE 1 completada*  
*Pendent aprovació per continuar amb FASE 2*
