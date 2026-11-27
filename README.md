# ILUSTRUM 🌟

> **Plataforma Educativa Gamificada de Col·leccionisme de Cromos Digitals**  
> Dissenyada per als cicles formatius d'informàtica (**IC10 - SMIX**) de l'**Institut Lacetània** (Manresa).

---

## 📱 Accés a l'Aplicació en Producció

- **Desplegament Oficial al Núvol (Vercel):** [https://ilustrum.vercel.app](https://ilustrum.vercel.app)
- **Repositori de Codi Font (GitHub):** [https://github.com/Klemen-t/Ilustrum](https://github.com/Klemen-t/Ilustrum)
- **Servidor Local / Proves Institut:** [https://ilustrum.infla.cat](https://ilustrum.infla.cat) (o `https://10.51.100.102/`)
- **Panell d'Administració:** `/admin` (Exclusivitat d'accés per a `ramon.clemente@lacetania.cat`)

---

## 🎯 Característiques Principals

### 1. Àlbums Temàtics Il·lustrats (Com Àlbums Reals)
- **Disseny immersiu:** Pàgines d'àlbum amb imatges de fons temàtiques en alta definició darrere les pàgines (auditoris íntims per a Joan Dausà, escenaris de metall i flames per a Rhapsody, circuiteria per a hardware i centres de dades per a sistemes/xarxes).
- **Format vertical i físic:** Enquadernació d'espiral amb llom lateral i anelles físiques simulades.
- **200 Cromos en 4 Àlbums (50 cromos cadascun, 10 cromos per pàgina):**
  1. 🖥️ **Hardware & Muntatge d'Equips (SMIX M01)**: CPU Intel/AMD, sòcols, RAM DDR4/DDR5, SSDs NVMe M.2, plaques base, xipsets, refrigeració líquida i eines de taller.
  2. 🌐 **Sistemes Operatius & Xarxes Locals (SMIX M02/M05)**: GNU/Linux, Bash, Active Directory, cablejat Cat 6A, fibra òptica, VLANs, IPv4/IPv6, protocols de xarxa i ciberseguretat.
  3. 🎵 **Música Trista (Joan Dausà & Cançó d'Autor)**: *'Jo Mai Mai'*, *'Judit'*, *'Ara Som Gegants'*, *'Ho Tenim Tot'*, les BSO de *'Barcelona, Nit d'Estiu/Hivern'* i el concert del Palau Sant Jordi.
  4. ⚡ **Música Bemparida (Rhapsody of Fire & Power Metal)**: *'Dawn of Victory'*, *'Emerald Sword'*, la saga d'Algalord, Luca Turilli, Fabio Lione, Sir Christopher Lee, Helloween, Blind Guardian, Stratovarius, DragonForce i Avantasia.

### 2. Participació Voluntària i Filtratge Estricte
- Els alumnes decideixen a quins àlbums volen participar.
- A la secció **Preguntes (`/questions`)**, és **obligatori triar l'àlbum** abans de començar: totes les preguntes i tots els sobres de cromos guanyats pertanyen exclusivament a l'àlbum escollit, amb opció de canviar d'àlbum en qualsevol moment.

### 3. Mecànica d'Enganxar Cromos (Drag & Drop i Tàctil)
- Els cromos guanyats van a la safata «Cromos a la teva mà».
- Es poden arrossegar directament a la seva casella buida (HTML5 Drag & Drop) o clicar a «Enganxar» per a dispositius mòbils.

### 4. Mercat d'Intercanvis Protegit
- **Només cromos repetits:** Mai no es pot bescanviar un cromo si és l'única còpia (la col·lecció queda blindada).
- **Ofertes públiques:** Es publiquen anuncis amb cromos repetits i es demanen cromos que faltin.
- **Acceptació amb 1 sol clic:** Qualsevol company de classe amb els cromos demanats pot tancar l'intercanvi de forma atòmica.
- **Pestanya «Repetits de la Classe»:** Vista de quins duplicats tenen els companys per negociar.

### 5. Repte de Preguntes amb Compte Enrere de 20s
- **0 a 10s:** 3 sobres de cromos ✉️✉️✉️
- **10 a 15s:** 2 sobres de cromos ✉️✉️
- **15 a 20s:** 1 sobre de cromos ✉️
- **Temps esgotat (> 20s):** 0 sobres
- Límit configurable de 10 preguntes diàries per garantir un ritme pedagògic continu.

### 6. Disseny 100% Mobile-Friendly
- Menú superior responsive sense scroll horitzontal.
- Barra inferior fixa estil app nativa mòbil.
- Modal de recompenses adaptat: s'ajusta a la pantalla dels telèfons intel·ligents sense necessitat de fer scroll per prémer «Següent Pregunta».

---

## 🛠️ Arquitectura Tècnica

- **Framework Web:** [Next.js 16](https://nextjs.org/) (App Router, Server Components, Route Handlers, TypeScript).
- **UI & Estils:** [Tailwind CSS 4](https://tailwindcss.com/) amb [Lucide React](https://lucide.dev/).
- **Base de Dades:** PostgreSQL hostatjada al núvol ([Neon.tech Serverless Postgres](https://neon.tech/)).
- **ORM:** [Prisma ORM 6.4](https://www.prisma.io/).
- **Autenticació:** Google OAuth 2.0 amb sessió JWT signada mitjançant [jose](https://github.com/panva/jose) i cookies HttpOnly `SameSite=Lax`.
- **Desplegament:** [Vercel](https://vercel.com/) amb integració contínua (CI/CD) des de la branca `main` de GitHub.

---

## 🚀 Guia Tècnica de Replicació (Com muntar el teu propi Ilustrum)

Si vols clonar o replicar aquest projecte per a un altre institut, escola o assignatura, segueix aquests passos:

### 1. Clonar el repositori
```bash
git clone https://github.com/Klemen-t/Ilustrum.git
cd Ilustrum
npm install
```

---

### 2. Crear la Base de Dades PostgreSQL (Neon.tech recomanat)
1. Registra't gratis a [Neon.tech](https://neon.tech/).
2. Crea un projecte nou (ex: `ilustrum-db`).
3. Copia la cadena de connexió `DATABASE_URL` (amb pooling i SSL activat):
   ```text
   postgresql://usuari:contrasenya@ep-nom-projecte-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### 3. Configurar Google Cloud OAuth 2.0
1. Vés a [Google Cloud Console](https://console.cloud.google.com/) i crea un projecte nou.
2. A **APIs & Services > Credentials**, crea un **OAuth 2.0 Client ID** (Tipus: Web Application).
3. A **Authorized JavaScript origins**, afegeix:
   - `http://localhost:3000`
   - `https://el-teu-domini.vercel.app`
4. A **Authorized redirect URIs**, afegeix **exactament**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://el-teu-domini.vercel.app/api/auth/callback/google`
5. Anota el **Client ID** i el **Client Secret**.

---

### 4. Variables d'Entorn (`.env`)
Crea un fitxer `.env` a l'arrel del projecte basat en `.env.example`:

```env
# Connexió a PostgreSQL
DATABASE_URL="postgresql://usuari:contrasenya@ep-nom.neon.tech/neondb?sslmode=require"

# Google OAuth
GOOGLE_CLIENT_ID="el-teu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="el-teu-client-secret"

# Secret JWT per a sessions (cadena aleatòria segura de 32+ caràcters)
NEXTAUTH_SECRET="clau-secreta-aleatoria-super-segura-de-32-caracters-minim"

# URL pública de l'aplicació
NEXT_PUBLIC_APP_URL="https://el-teu-domini.vercel.app"

# Domini autoritzat per a login institucional (Google Workspace for Education)
ALLOWED_EMAIL_DOMAIN="lacetania.cat"
```

---

### 5. Desplegar l'Esquema i Carregar les Dades Inicials (Seed)
Executa les comandes de Prisma per crear totes les taules i carregar els 4 àlbums, els 200 cromos i el banc de preguntes:
```bash
# 1. Crear taules a PostgreSQL
npx prisma db push

# 2. Carregar àlbums, cromos, preguntes i rols
npx tsx prisma/seed.ts
```

---

### 6. Desplegar a Vercel
1. Puja el teu codi a un repositori de GitHub.
2. Entra a [Vercel](https://vercel.com/) i fes clic a **"Add New Project" > "Import Git Repository"**.
3. A la secció **Environment Variables**, afegeix les mateixes variables del fitxer `.env`:
   - `DATABASE_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_APP_URL` (`https://el-teu-projecte.vercel.app`)
   - `ALLOWED_EMAIL_DOMAIN` (ex: `el-teu-institut.cat`)
4. Fes clic a **Deploy**.

> [!TIP]
> **Important per a Vercel i Google OAuth:**
> La lògica de l'aplicació a `src/app/api/auth/google/route.ts` i `src/app/api/auth/callback/google/route.ts` està preparada per utilitzar automàticament el domini de producció públic evitant el *Deployment Protection (Vercel SSO)* que tenen les branques de vista prèvia.

---

### 7. Sincronització de Canvis des de Terminal
El projecte inclou l'script `pujar_canvis_github.sh` per automatitzar la pujada a GitHub:
```bash
./pujar_canvis_github.sh "Missatge del commit"
```
Un cop enviat a `main`, Vercel recompila i desplega la nova versió automàticament en menys de 60 segons.

---

## 📄 Llicència
Projecte desenvolupat per a la comunitat educativa de l'Institut Lacetània (Manresa). Lliure per a ús docent i formatiu.
