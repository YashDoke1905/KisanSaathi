# 🌾 KisanSaathi (किसानसाथी)
> **Production-Quality, Mobile-First Progressive Web App for Indian Smallholder Farmers**

KisanSaathi is an open-source, multilingual, offline-first precision agriculture and financial intelligence platform designed from the ground up for small and marginal farmers in India (operational landholding $<2.0$ hectares), starting with Maharashtra.

---

## 🌟 Core Pillars & Standards

1. **Strictly 360px Mobile-First**: Built for entry-level Android smartphones with high daylight contrast, $\ge 48\text{px}$ touch targets, and a thumb-friendly bottom navigation bar.
2. **Honest Data Provenance Badges**: Every single figure displayed is tagged with:
   - 🟢 `Live data` (with source and fetch timestamp)
   - 🟡 `Estimate` (transparent formula + step-by-step math explainer)
   - 🔵 `Entered by you` (farmer customizations)
   - 🟣 `Demo data` (graceful fallback when external government APIs lack keys)
3. **Multilingual from Day 1**: English, Marathi (मराठी), and Hindi (हिंदी) with a one-tap header switcher and zero hardcoded UI strings.
4. **Voice Interaction**: Native Web Speech API integration for speech-to-text voice input and speech synthesis read-aloud on all key screens.
5. **Offline-First PWA**: Service Worker caching of the application shell, farm plots, and offline fallback.
6. **Zero-Setup Database Architecture**: Out-of-the-box local SQLite with Prisma ORM, seamlessly switchable to Supabase PostgreSQL for cloud production.

---

## 🏗️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) + TypeScript (Strict Mode) |
| **Styling** | Tailwind CSS with custom agricultural color tokens |
| **Database** | Prisma ORM with SQLite (Local default) & Supabase PostgreSQL (Production) |
| **PWA & Offline** | Web App Manifest, Service Worker (`sw.js`), IndexedDB |
| **Authentication** | Password + Mobile OTP (Console simulator in dev; SMS API in prod) + 1-Tap Demo Login |
| **Security** | Bcrypt password hashing, Jose JWT HTTP-only sessions, database-backed rate limiting |
| **Voice & Audio** | Native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Testing** | Vitest unit test suite |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js `v20.0.0` or higher (`v24.x` recommended)
- npm `v10.x` or higher

### 2. Installation
```powershell
# Clone or navigate to the repository
cd SmartHarvest

# Install all dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env`:
```powershell
cp .env.example .env
```
Default `.env` configuration works out of the box with zero external dependencies!

### 4. Database Setup (Local SQLite)
```powershell
# Generate Prisma Client
npm run prisma:generate

# Sync schema to SQLite database (creates dev.db)
npx prisma db push

# Pre-seed demo farmer account (Tukaram Patil, Nashik)
npm run prisma:seed
```

### 5. Run Development Server
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser (use Chrome DevTools mobile view at 360px width).

### 6. Run Automated Tests
```powershell
npm test
```

---

## 👤 Test Credentials & 1-Tap Login

To evaluate the application instantly, you can:
- **Option A (Instant)**: Click the **"१-टॅप नमुना लॉगिन (तुकाराम पाटील)"** button on the `/login` screen.
- **Option B (Username & Password)**:
  - **Username**: `demo`
  - **Password**: `farmer123`
- **Option C (Mobile OTP in Dev Mode)**:
  - Enter mobile number: `9876543210`
  - In Dev Mode (`OTP_DEV_MODE="true"`), the 6-digit OTP is automatically printed in your terminal console and shown in the amber debug banner on screen!

---

## 🗄️ Database Provider Switching (SQLite ⇄ Supabase Postgres)

The application provides a dedicated switching script to maintain portable models across local SQLite and cloud PostgreSQL:

### To switch to Supabase PostgreSQL (Cloud Production):
```powershell
npm run db:switch:postgres
```
Then set `DATABASE_URL` in `.env` to your Supabase PostgreSQL connection string.

### To switch back to Local SQLite:
```powershell
npm run db:switch:sqlite
```

---

## 📂 Project Architecture

```text
SmartHarvest/
├── archive/                      # Preserved v0 draft legacy backend and frontend
│   └── v0-draft/
├── prisma/
│   ├── schema.prisma             # Active Prisma schema
│   ├── schema.sqlite.prisma      # SQLite schema source
│   ├── schema.postgres.prisma    # PostgreSQL / Supabase schema source
│   └── seed.ts                   # Realistic Maharashtra farmer seeder
├── public/
│   ├── manifest.json             # PWA web app manifest
│   ├── sw.js                     # Service Worker script
│   └── icons/                    # App icons
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── page.tsx              # Smart Home Dashboard shell
│   │   ├── login/page.tsx        # Password, OTP & Demo Auth
│   │   ├── signup/page.tsx       # 60-second onboarding
│   │   ├── forgot-password/      # OTP-based password reset
│   │   ├── farm/page.tsx         # Farm Plot Manager & Completeness Meter
│   │   ├── market/page.tsx       # Mandi Market shell (Phase 4)
│   │   ├── schemes/page.tsx      # Schemes shell (Phase 5)
│   │   ├── more/page.tsx         # Settings, Language & Account
│   │   ├── offline/page.tsx      # Offline fallback page
│   │   └── api/                  # Route handlers (Auth, Farm, OTP)
│   ├── components/               # 360px-first UI components
│   │   ├── Header.tsx            # Language toggle, network & dark mode
│   │   ├── BottomNav.tsx         # 5-tab sticky bottom navigation
│   │   ├── ProvenanceBadge.tsx   # Live / Estimate / User / Demo badges
│   │   ├── UnitConverterModal.tsx # Acre / Guntha / Hectare / Bigha converter
│   │   └── VoiceAssistantButton.tsx # Web Speech API voice reader & mic
│   ├── lib/
│   │   ├── auth.ts               # Jose JWT session & cookie handling
│   │   ├── prisma.ts             # Prisma singleton client
│   │   ├── rateLimit.ts          # Database-backed rate limiter
│   │   ├── sms.ts                # Dev & Prod SMS OTP adapter
│   │   ├── languageContext.tsx   # Multilingual i18n & Speech synthesizer
│   │   └── themeContext.tsx      # Light/Dark mode state
│   └── locales/
│       ├── en.json               # English translations
│       ├── mr.json               # Marathi translations (मराठी)
│       └── hi.json               # Hindi translations (हिंदी)
└── tests/
    └── phase1.test.ts            # Security, Auth & Land Math test suite
```

---

## 🚢 Deployment to Production (Vercel)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Switch database provider to PostgreSQL: `npm run db:switch:postgres`.
4. Configure environment variables in Vercel project settings:
   - `DATABASE_URL`: Your Supabase connection pooler URL (`postgres://...`).
   - `JWT_SECRET`: A secure 32+ character random string.
   - `OTP_DEV_MODE`: `"false"`.
   - `SMS_PROVIDER_API_KEY`: Your SMS gateway API key.
5. Deploy! Vercel automatically detects Next.js 15 and deploys edge route handlers and static assets.
