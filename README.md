# FinSight Personal Financial Intelligence

A full-stack financial health analysis app built with **FastAPI** (Python) and **Next.js** (TypeScript). Enter your income, expenses, debts and savings to get a personalised financial health score, ratio analysis, expense breakdown, and a **6-month savings forecast powered by machine learning**.

---
## 🔗 Live Demo
[🚀 Click here to try the live demo](https://fin-sight-api-financial-health-anal.vercel.app)

## ✨ Features

- **Financial Health Score** — 0 to 100 score calculated from your savings, debt, and expense ratios
- **Expense Breakdown** — 6 categories with visual progr]ss bars and % of income
- **Net Worth Tracker** — real-time savings minus debts calculation
- **Monthly Cash Flow** — income minus total expenses
- **Emergency Fund Check** — tells you if you have 3–6 months of income saved
- **Debt Payoff Estimate** — calculates how many months to pay off debt at current cash flow
- **Savings Forecast Chart** — ML-powered 6-month prediction using linear regression
- **Personalised Recommendations** — actionable advice based on your ratios
- **No signup required** — just enter your name and start

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **Python 3.11** | Backend language |
| **Pydantic** | Data validation |
| **scikit-learn** | Linear regression for savings forecast |
| **NumPy** | Numerical calculations |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15** | React framework |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Styling |
| **SVG Charts** | Custom built, no external chart library |

### Deployment
| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **GitHub** | Version control |
 
---
 
## 📁 Project Structure
 
```
finsight-api/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + CORS config
│   │   ├── models.py            # Pydantic request/response models
│   │   ├── routes/
│   │   │   ├── finances.py      # /finances endpoints
│   │   │   └── users.py         # /users endpoints
│   │   ├── services/
│   │   │   └── analytics.py     # Health score formula + ML logic
│   │   └── utils/
│   │       └── db.py            # In-memory database
│   ├── requirements.txt
│   └── runtime.txt
│
└── frontend/
    ├── app/
    │   ├── page.tsx             # Main app — full dashboard UI
    │   ├── layout.tsx           # Root layout
    │   └── globals.css          # Global styles
    ├── utils/
    │   └── api.ts               # API fetch functions
    ├── public/                  # Static assets (SVGs)
    ├── .gitignore
    ├── eslint.config.mjs
    └── package.json
```
 
---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the dev server
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/users/signup` | Create a user |
| `GET` | `/users/{user_id}` | Get user profile |
| `POST` | `/finances/health` | Calculate financial health score |
| `GET` | `/finances/history/{user_id}` | Get saved financial record |
| `POST` | `/finances/predict-savings` | ML savings forecast |

### Example Request — Financial Health

```bash
curl -X POST "http://localhost:8000/finances/health?user_id=alex" \
  -H "Content-Type: application/json" \
  -d '{
    "income": 6500,
    "expenses": {
      "rent": 1400,
      "food": 450,
      "utilities": 120,
      "transport": 200,
      "entertainment": 150,
      "healthcare": 80
    },
    "debts": 4000,
    "savings": 18000,
    "investments": {}
  }'
```

### Example Response

```json
{
  "financial_health_score": 75.5,
  "savings_ratio": 2.77,
  "debt_ratio": 0.62,
  "expense_ratio": 0.37,
  "recommendations": [],
  "investments": {
    "investment_score": 0,
    "total_invested": 0,
    "recommendations": ["Consider investing more to reach 20% of your income."]
  }
}
```

### Example Request — Savings Prediction

```bash
curl -X POST "http://localhost:8000/finances/predict-savings?user_id=alex" \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_savings": [900, 950, 1000, 1100, 1050, 1200]
  }'
```

---

## 📊 How the Health Score Works

```
score = 50 + (savings_ratio - debt_ratio - expense_ratio) × 50
score = clamped between 0 and 100
```

| Score | Rating | Meaning |
|---|---|---|
| 70–100 | 🟢 Strong | Great financial habits |
| 40–69 | 🟡 Fair | Some areas to improve |
| 0–39 | 🔴 Needs Work | Significant changes needed |

**Recommendations are triggered when:**
- Debt ratio > 40% of income
- Savings ratio < 20% of income
- Expense ratio > 60% of income

---

## 🧪 Test Data

**Healthy Finances (score ~75)**
```
Income: $6,500 | Rent: $1,400 | Food: $450 | Utilities: $120
Transport: $200 | Entertainment: $150 | Healthcare: $80
Debts: $4,000 | Savings: $18,000
History: 900, 950, 1000, 1100, 1050, 1200
```

**Average (score ~42)**
```
Income: $4,500 | Rent: $1,300 | Food: $600 | Utilities: $180
Transport: $350 | Entertainment: $300 | Healthcare: $100
Debts: $12,000 | Savings: $3,500
History: 300, 250, 400, 350, 420, 380
```

**Needs Attention (score ~10)**
```
Income: $3,200 | Rent: $1,200 | Food: $700 | Utilities: $250
Transport: $400 | Entertainment: $350 | Healthcare: $150
Debts: $28,000 | Savings: $800
History: 100, 80, 150, 50, 120, 90
```

---

## 🚢 Deployment

### Backend (Render)
1. Connect GitHub repo to Render
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `FRONTEND_URL = https://your-app.vercel.app`

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Root Directory: `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL = https://your-api.onrender.com`
