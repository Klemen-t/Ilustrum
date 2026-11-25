# ILUSTRUM — Guia de Desplegament i Manteniment en Producció

> Plataforma educativa gamificada de cromos digitals de l'Institut Lacetània  
> **Servidor:** Ubuntu Server 26 (10.51.100.102) · **Ruta:** `/opt/ilustrum` · **Usuari:** `ilustrum-dev`

---

## 1. Arquitectura de l'Entorn

L'aplicació està dissenyada per funcionar de forma nativa sense Docker, aprofitant al màxim els recursos del servidor:

| Servei | Tecnologia | Port / Ruta | Rol |
|---|---|---|---|
| **Reverse Proxy** | Nginx 1.28 | `:80` (HTTP → HTTPS), `:443` (TLS / HTTP/2) | Proxy invers, terminació TLS, capçaleres de seguretat HSTS |
| **Procés Web** | Next.js 16 (Node.js 24) | `127.0.0.1:3000` | Frontend App Router i Route Handlers (API) gestionat per PM2 |
| **Base de Dades** | PostgreSQL 18.6 | `127.0.0.1:5432` | BBDD `ilustrum_db` (transaccions ACID amb bloqueig `FOR UPDATE`) |
| **Gestor de Processos**| PM2 7.1 | `systemd (pm2-root)` | Auto-arrencada amb el sistema, rotació de logs i zero-downtime |

---

## 2. Variables d'Entorn (`/opt/ilustrum/app/.env`)

```ini
# Base de Dades PostgreSQL (sense Docker)
DATABASE_URL="postgresql://ilustrum_user:IlustrumDB2026!Secure@127.0.0.1:5432/ilustrum_db?schema=public"

# Entorn i Port de l'aplicació
NODE_ENV="production"
PORT=3000
NEXT_PUBLIC_APP_URL="https://10.51.100.102"

# Seguretat & Autenticació (JWT signat)
NEXTAUTH_URL="https://10.51.100.102"
NEXTAUTH_SECRET="e93c8374d758b29f0469b6f84918f67e4268e27c1a8519d0e2e5c8e235a9f6d3"

# Google OAuth 2.0 (Restricció per @lacetania.cat)
GOOGLE_CLIENT_ID="canvia_per_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="canvia_per_google_client_secret"
ALLOWED_EMAIL_DOMAIN="lacetania.cat"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=60
```

---

## 3. Gestió del Servei (Comandes PM2)

```bash
# Veure estat del servei
pm2 status ilustrum-web

# Veure logs en temps real
pm2 logs ilustrum-web

# Recarregar l'aplicació sense caiguda (Zero-downtime)
pm2 reload ilustrum-web

# Reiniciar completament
pm2 restart ilustrum-web
```

---

## 4. Còpies de Seguretat de la Base de Dades (Backups)

S'ha preparat l'script [`/opt/ilustrum/app/scripts/backup.sh`](file:///opt/ilustrum/app/scripts/backup.sh).

Per executar una còpia manual:
```bash
bash /opt/ilustrum/app/scripts/backup.sh
```

Per programar la còpia diària automàtica (a les 03:00 AM) mitjançant `crontab`:
```bash
0 3 * * * /bin/bash /opt/ilustrum/app/scripts/backup.sh >> /opt/ilustrum/logs/backup.log 2>&1
```

Les còpies es desen comprimides en format `.sql.gz` a `/opt/ilustrum/backups/` i es mantenen durant 30 dies.

---

## 5. Actualització i Desplegament de Codi Nou

Quan es facin canvis o millores en el codi, n'hi ha prou amb executar:
```bash
bash /opt/ilustrum/app/scripts/deploy.sh
```

Aquest script automàticament:
1. Comprova i instal·la noves dependències amb npm.
2. Sincronitza l'esquema de Prisma si hi ha nous models.
3. Compila el projecte Next.js per a producció (`next build`).
4. Executa un `pm2 reload` sense interrompre els usuaris connectats.

---

## 6. Seguretat i Domini

- **Restricció @lacetania.cat**: Cap compte fora del domini corporatiu de l'Institut Lacetània pot accedir a la plataforma ni crear registres a PostgreSQL.
- **Autorització d'Administració**: Protegida al servidor a `src/lib/admin.ts`. Només usuaris amb `role === "admin"` poden entrar al panell `/admin`.
- **Certificat SSL**: Allotjat a `/opt/ilustrum/ssl/`.
