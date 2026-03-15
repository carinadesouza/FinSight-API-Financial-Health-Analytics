# FinSight — Personal Financial Intelligence

A full-stack app that gives you a clear picture of your finances. Enter your income, expenses, debts, and savings — FinSight scores your financial health, breaks down your spending, and predicts your savings for the next 6 months using machine learning.

No account needed. Just open it and start.

**Live:** [fin-sight-api-financial-health-anal.vercel.app](https://fin-sight-api-financial-health-anal.vercel.app)  
**API docs:** [finsight-api-financial-health-analytics.onrender.com/docs](https://finsight-api-financial-health-analytics.onrender.com/docs)

> The backend runs on Render's free tier and may take 30–60 seconds to wake up on the first request.

---

## What it does

Walk through a 4-step form — income, expenses, debts & savings, savings history — and get back a full financial breakdown:

- **Health score (0–100)** based on your savings, debt, and expense ratios
- **Monthly cash flow** — what's left after all expenses
- **Net worth** — savings minus total debts
- **Emergency fund check** — whether you have 3–6 months of income saved
- **Debt payoff estimate** — how many months to clear your debt at the current rate
- **Expense breakdown** — 6 categories with progress bars showing % of income
- **6-month savings forecast** — linear regression model predicts where your savings are headed
- **Personalised recommendations** — triggered automatically when your ratios fall outside healthy ranges

---

## Saving your report

Once the analysis is done, hit **Save Report** in the header or at the bottom of the results page.

| Option | What happens |
|---|---|
| Download JSON | Exports all your data, ratios, score, and forecast as a `.json` file |
| Print / Save as PDF | Opens the browser print dialog — choose "Save as PDF" for a clean copy |

Your data never leaves your device. There's no account, no server storage, no tracking.

---

## Tech stack

| | |
|---|---|
| Backend | FastAPI, Python 3.11, scikit-learn, NumPy, Pydantic |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Charts | Custom SVG — no chart library |
| Hosting | Vercel (frontend), Render (backend) |

---

## Project structure

```
FinSight-API-Financial-Health-Analytics/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS
│   │   ├── models.py            # Pydantic models
│   │   ├── routes/
│   │   │   ├── finances.py      # Health, history, predict endpoints
│   │   │   └── users.py         # User endpoints
│   │   ├── services/
│   │   │   └── analytics.py     # Score formula + ML prediction
│   │   └── utils/
│   │       └── db.py            # In-memory store
│   ├── requirements.txt
│   └── runtime.txt
│
└── frontend/
    ├── app/
    │   ├── page.tsx             # Full dashboard UI
    │   ├── layout.tsx
    │   └── globals.css
    ├── utils/
    │   └── api.ts               # API fetch functions
    └── package.json
```

---

## Running locally

**Prerequisites:** Python 3.11+, Node.js 18+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs at `http://localhost:8000` — API docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Runs at `http://localhost:3000`

---

## API reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/users/signup` | Create a user |
| `GET` | `/users/{user_id}` | Get user profile |
| `POST` | `/finances/health` | Calculate health score |
| `GET` | `/finances/history/{user_id}` | Get saved record |
| `POST` | `/finances/predict-savings` | 6-month ML forecast |

### Calculate health score

```bash
curl -X POST "http://localhost:8000/finances/health?user_id=alex" \
  -H "Content-Type: application/json" \
  -d '{
    "income": 6500,
    "expenses": {
      "rent": 1400, "food": 450, "utilities": 120,
      "transport": 200, "entertainment": 150, "healthcare": 80
    },
    "debts": 4000,
    "savings": 18000,
    "investments": {}
  }'
```

```json
{
  "financial_health_score": 75.5,
  "savings_ratio": 2.77,
  "debt_ratio": 0.62,
  "expense_ratio": 0.37,
  "recommendations": []
}
```

### Savings forecast

```bash
curl -X POST "http://localhost:8000/finances/predict-savings?user_id=alex" \
  -H "Content-Type: application/json" \
  -d '{"monthly_savings": [900, 950, 1000, 1100, 1050, 1200]}'
```

---

## How the health score is calculated

```
score = 50 + (savings_ratio - debt_ratio - expense_ratio) × 50
score is clamped between 0 and 100
```

| Score | What it means |
|---|---|
| 70–100 | Strong — good habits across the board |
| 40–69 | Fair — one or two areas need attention |
| 0–39 | Needs work — significant changes recommended |

Recommendations appear automatically when:
- Debt exceeds 40% of monthly income
- Savings rate is below 20% of monthly income
- Total expenses exceed 60% of monthly income

---

## Test data

<details>
<summary>Healthy finances — score ~75</summary>

| | |
|---|---|
| Income | $6,500 |
| Rent | $1,400 |
| Food | $450 |
| Utilities | $120 |
| Transport | $200 |
| Entertainment | $150 |
| Healthcare | $80 |
| Debts | $4,000 |
| Savings | $18,000 |
| History | 900, 950, 1000, 1100, 1050, 1200 |

</details>

<details>
<summary>Average — score ~42</summary>

| | |
|---|---|
| Income | $4,500 |
| Rent | $1,300 |
| Food | $600 |
| Utilities | $180 |
| Transport | $350 |
| Entertainment | $300 |
| Healthcare | $100 |
| Debts | $12,000 |
| Savings | $3,500 |
| History | 300, 250, 400, 350, 420, 380 |

</details>

<details>
<summary>Needs attention — score ~10</summary>

| | |
|---|---|
| Income | $3,200 |
| Rent | $1,200 |
| Food | $700 |
| Utilities | $250 |
| Transport | $400 |
| Entertainment | $350 |
| Healthcare | $150 |
| Debts | $28,000 |
| Savings | $800 |
| History | 100, 80, 150, 50, 120, 90 |

</details>

---

## Deploying your own copy

### Backend (Render)

1. Connect this repo on [render.com](https://render.com)
2. Root directory: `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment variable: `FRONTEND_URL` → your Vercel URL

### Frontend (Vercel)

1. Import this repo on [vercel.com](https://vercel.com)
2. Root directory: `frontend`
3. Environment variable: `NEXT_PUBLIC_API_URL` → your Render URL

**Tip:** Render's free tier sleeps after 15 minutes of inactivity. Set up a free monitor on [UptimeRobot](https://uptimerobot.com) pinging your Render URL every 5 minutes to keep it awake.

---

## Known limitations

- **In-memory database** — data resets whenever the Render server restarts. PostgreSQL is planned for a future version.
- **No authentication** — any `user_id` can be accessed by anyone. JWT auth is on the roadmap.
- **Single record per user** — saving new data overwrites the previous entry.

---

## Roadmap

- [ ] PostgreSQL for persistent storage
- [ ] JWT authentication
- [ ] Investment portfolio tracking
- [ ] PDF report export
- [ ] Historical records with trend analysis over time

---

## Author

**Carina Desouza** — [github.com/carinadesouza](https://github.com/carinadesouza)
