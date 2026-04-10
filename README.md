# perk. — Benefits for every team

A benefits platform for small businesses. Virtual cards, spending stipends,
non-monetary perks, and year-end tax reporting — all in one app.

---

## Tech stack

| Layer       | Tool                  |
|-------------|----------------------|
| Framework   | Next.js 14 (App Router) |
| Database    | Supabase (Postgres + Auth + Storage) |
| Cards       | Stripe Issuing       |
| Wallet      | Stripe Treasury      |
| Billing     | Stripe Billing       |
| Deployment  | Vercel               |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/your-username/perk-app.git
cd perk-app
npm install
```

### 2. Set up Supabase

1. Go to https://supabase.com and create a new project
2. Once created, go to **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase-schema.sql` and run it
4. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set up Stripe

1. Go to https://dashboard.stripe.com and create an account
2. Go to **Developers → API keys** and copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. For webhooks (local dev): install Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`
4. For production: go to **Developers → Webhooks → Add endpoint**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `issuing_authorization.created`, `issuing_transaction.created`,
     `customer.subscription.updated`, `invoice.payment_succeeded`,
     `invoice.payment_failed`

### 4. Apply for Stripe Issuing + Treasury (for real cards)

Stripe Issuing and Treasury require separate approval:
- Apply at: https://stripe.com/issuing
- Typical approval: 1–2 weeks
- Until approved, the app works fully — card creation just logs a warning
  instead of actually creating cards. Good for testing the full flow first.

### 5. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values from steps 2 and 3.

### 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment to Vercel

### First deploy

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/your-username/perk-app.git
   git push -u origin main
   ```

2. Go to https://vercel.com → **Add New Project** → import your repo

3. Add all environment variables from `.env.local` in the Vercel dashboard
   under **Settings → Environment Variables**

4. Hit **Deploy**

### After every push

Vercel redeploys automatically on every push to `main`. No manual steps needed.

### Branches

| Branch    | Purpose                        | Deploy target |
|-----------|-------------------------------|---------------|
| `main`    | PWA (web, installable)        | Vercel        |
| `native`  | React Native / Expo (future)  | Expo / App Store |

---

## How to connect the UI to the backend

The `src/components/PerkApp.jsx` file is your full UI (copied from the prototype).
To connect it to real data, replace the in-memory state with API calls:

### Example: load company data on mount

```tsx
// Instead of: const [companies, setCompanies] = useState(SEED)
// Do:
const [company, setCompany] = useState(null)

useEffect(() => {
  fetch('/api/companies')
    .then(r => r.json())
    .then(setCompany)
}, [])
```

### Example: approve a transaction

```tsx
// Instead of: onUpdate({...company, transactions: ...})
// Do:
await fetch('/api/transactions', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: txId, status: 'approved' }),
})
```

---

## Project structure

```
perk-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── companies/route.ts      ← company signup
│   │   │   ├── members/route.ts        ← invite + card creation
│   │   │   ├── transactions/route.ts   ← approve/reject
│   │   │   └── stripe/webhook/route.ts ← Stripe events
│   │   ├── layout.tsx                  ← fonts, PWA meta tags
│   │   └── page.tsx                    ← renders PerkApp
│   ├── components/
│   │   └── PerkApp.jsx                 ← your full UI (paste here)
│   └── lib/
│       ├── stripe.ts                   ← Stripe helpers
│       └── supabase/
│           ├── client.ts               ← browser client
│           └── server.ts               ← server client + admin client
├── public/
│   └── manifest.json                   ← PWA config
├── supabase-schema.sql                 ← run this in Supabase SQL editor
├── .env.local.example                  ← copy to .env.local and fill in
├── next.config.js
└── package.json
```

---

## PWA installation

Once deployed, users on iPhone can:
1. Open the URL in Safari
2. Tap the share button
3. Tap "Add to Home Screen"
4. It installs like an app — fullscreen, no browser bar, home screen icon

Android users get an automatic install prompt in Chrome.

---

## Pricing model (implemented)

- **$19/mo** base (covers up to 3 members)
- **+$5/mo** per additional member
- Automatic discounts based on pre-loaded wallet balance:
  - $1,000–$4,999 → 10% off (Bronze)
  - $5,000–$9,999 → 20% off (Silver)
  - $10,000+ → 30% off (Gold)

---

## Questions?

The prototype (perk-app.jsx) has full working UI for every screen.
The API routes + schema handle persistence and real card operations.
Stripe Issuing handles card-level merchant category filtering automatically.
