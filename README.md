# SalaryScale

> A compensation intelligence system for the Indian tech market — structured, comparable, decision-ready.

**Live demo:** https://salary-records-mu.vercel.app  
**API:** https://salary-records.onrender.com  
**Stack:** Node.js · Express · PostgreSQL (Supabase) · Prisma · React · Vite

---

## What is this?

SalaryScale is a full-stack compensation intelligence platform inspired by [Levels.fyi](https://www.levels.fyi/). It solves the fundamental problem with platforms like AmbitionBox and Glassdoor: **unstructured, non-comparable salary data**.

The core insight: **same role ≠ same pay**. Compensation is tied to *level* (L3/L4/L5), not job title. SalaryScale treats level as a first-class field — always required, always validated — making every data point queryable and comparable.

---

## Features

- **Salary ingestion** — structured submission with full schema validation and duplicate detection
- **Quality scoring** — measures how trustworthy a submission is (confidence × completeness × coherence)
- **Market value scoring** — peer-percentile based compensation strength relative to same-level, same-location engineers
- **Ephemeral assessment** — check how your salary compares without storing anything
- **Company intelligence** — median total compensation + level distribution for any company
- **Side-by-side comparison** — delta breakdown on base / bonus / stock / total comp
- **On-demand recomputation** — refresh all market scores as the peer dataset grows
- **React frontend** — Market page, Benchmarks page, Compare page, Add Salary modal, Calculate modal

---

## Project Structure

```
/
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── src/
│   ├── middleware/
│   │   ├── normalize.js           # company/role/location normalization
│   │   ├── validateSchema.js      # ingestion validation
│   │   ├── validateCalculate.js   # calculate endpoint validation
│   │   └── errorHandler.js        # global error handler
│   ├── routes/
│   │   ├── salary.routes.js
│   │   └── company.routes.js
│   ├── handlers/
│   │   ├── salary.handler.js
│   │   └── company.handler.js
│   ├── services/
│   │   ├── salary.service.js
│   │   ├── company.service.js
│   │   ├── qualityScore.service.js
│   │   └── marketScore.service.js
│   ├── repositories/
│   │   ├── salary.repository.js
│   │   └── company.repository.js
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── market/
│   │   ├── benchmarks/
│   │   ├── compare/
│   │   ├── modals/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── Layout.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── vercel.json
│   └── vite.config.js
├── .env.example
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Supabase)

### Backend

```bash
# 1. Clone the repo
git clone https://github.com/5h-am/salary_records.git
cd salary_records

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Seed the database
npx prisma db seed

# 6. Start the server
node src/app.js
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:3000
npm run dev
```

---

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
PORT=3000
NODE_ENV=development
PEER_GROUP_MIN_SIZE=5
N_TARGET=30
CLIENT_ORIGIN=http://localhost:5173
```

For **Supabase** production, use the pooler connection string (port 6543) and add:

```env
DATABASE_URL=postgresql://...pooler...?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://...direct...    # port 5432, used only by Prisma migrations
```

### Frontend (`.env`)

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## API Reference

### POST `/ingest-salary`

Submit a salary record. Validates, normalizes, computes scores, stores.

```json
{
  "company": "google",
  "role": "Software Engineer",
  "level": "L4",
  "location": "Bangalore",
  "experience_years": 4,
  "base_salary": 3500000,
  "bonus": 800000,
  "stock": 1500000,
  "confidence_score": "A"
}
```

Response `201`:
```json
{
  "id": "uuid",
  "total_compensation": 5800000,
  "quality_score": 1.0,
  "market_value_score": 0.72,
  "peer_group_size": 3,
  "insufficient_data": true
}
```

---

### POST `/calculate-salary`

Ephemeral market assessment. **Nothing is stored.** Same input shape as `/ingest-salary`.

Response `200`:
```json
{
  "total_compensation": 5800000,
  "quality_score": 1.0,
  "market_value_score": 0.72,
  "score_interpretation": "Above market",
  "peer_group_size": 3,
  "insufficient_data": true
}
```

---

### POST `/recompute-market-scores`

Recomputes `market_value_score` for every record in the database.

Response `200`:
```json
{
  "updated": 47,
  "failed": 0,
  "errors": []
}
```

---

### GET `/salary/:id`

Fetch a single record by UUID.

---

### GET `/salaries`

List, filter, and paginate salary records.

| Query param | Type   | Description |
|-------------|--------|-------------|
| `company`   | string | Filter by company (partial match) |
| `role`      | string | Filter by role (partial match) |
| `level`     | string | `L3`, `L4`, or `L5` |
| `location`  | string | Filter by location |
| `page`      | int    | Default: 1 |
| `limit`     | int    | Default: 50, max: 100 |

Response `200`:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234,
    "totalPages": 5
  }
}
```

---

### GET `/company/:company`

Company summary.

Response `200`:
```json
{
  "company": "google",
  "median_total_compensation": 5800000,
  "level_distribution": { "L3": 2, "L4": 8, "L5": 3 },
  "salaries": [...]
}
```

---

### GET `/compare?salaryId1={id1}&salaryId2={id2}`

Side-by-side comparison with deltas.

Response `200`:
```json
{
  "entry1": { "id": "...", "company": "google", ... },
  "entry2": { "id": "...", "company": "microsoft", ... },
  "delta": {
    "base_salary": 700000,
    "bonus": 300000,
    "stock": 500000,
    "total_compensation": 1500000,
    "level_difference": "both are L4"
  }
}
```

---

## Scoring Algorithms

### Quality Score

Measures how trustworthy a submission is.

```
quality_score = round(confidence_weight × completeness_weight × coherence_weight, 2)
```

| Component | Logic |
|-----------|-------|
| **confidence_weight** | A=1.00, B=0.85, C=0.70, D=0.55, E=0.40, F=0.20 |
| **completeness_weight** | base+bonus+stock=1.00, one missing=0.85, both missing=0.70 |
| **coherence_weight** | Within expected YoE range for level=1.00, off by ≤2yr=0.85, off by >2yr=0.70 |

Expected YoE ranges: L3 = 0–3, L4 = 2–7, L5 = 5–15.

### Market Value Score

Measures compensation strength relative to real peers (same level + same location).

```
1. Build peer group (n records)
2. If n = 0: market_value_score = null
3. peer_percentile  = count(peers with TC < this TC) / n          [60% weight]
4. experience_edge  = normalized (expected_midpoint / exp_years)  [25% weight]
5. stability_ratio  = normalized (guaranteed_pay / total_comp)    [15% weight]
6. raw_score        = (peer_pct × 0.60) + (exp_edge × 0.25) + (stab × 0.15)
7. confidence_n     = log(n+1) / log(N_TARGET+1)                  [dampening]
8. market_value_score = round(0.5 + (raw - 0.5) × confidence_n, 2)
```

The log dampening shrinks scores toward neutral 0.5 when the peer group is small, preventing false confidence from limited data. `PEER_GROUP_MIN_SIZE` and `N_TARGET` are both configured via environment variables.

| Score range | Interpretation |
|-------------|----------------|
| `null` | Insufficient peer data |
| 0.00 – 0.35 | Below market |
| 0.35 – 0.50 | Slightly below market |
| 0.50 – 0.65 | At market |
| 0.65 – 0.80 | Above market |
| 0.80 – 1.00 | Well above market |

---

## Architecture

Strict layer separation — no cross-layer contamination:

```
Request
  → Normalize middleware     (company/role/location normalization)
  → Schema middleware        (validation — rejects bad data with 400 + reason)
  → Router
  → Handler                  (parse req, call service, send res — no logic)
  → Service                  (all business logic — no HTTP objects)
  → Repository               (only Prisma calls — no logic)
  → PostgreSQL
```

**Layer rules:**
- Handlers never contain business logic
- Services never see `req` or `res`
- Repositories never contain logic — only return data
- Global error handler catches everything and never exposes stack traces in production

---

## Deployment

The production stack uses three services:

| Service | Platform | Role |
|---------|----------|------|
| PostgreSQL | Supabase | Managed database with connection pooler |
| REST API | Render | Node.js web service, auto-deploys on push |
| Frontend | Vercel | Static SPA with client-side routing rewrite |

**Render build command:**
```
npm install && npx prisma generate && npx prisma migrate deploy
```

**Render start command:**
```
node src/app.js
```

`vercel.json` rewrites all routes to `index.html` for React Router to handle client-side navigation.

---

## What's Not Built (by design)

- Auth, login, user profiles
- Reviews or ratings
- AI features or integrations
- Employer dashboards
- Gender / ethnicity fields
- Currency conversion or tax tools
- History tab (no backend support)
- Export CSV (no backend support)

---

## License

MIT

---

*Built by Shubham Kumar (Sham) — IILM University, B.Tech CSE*
