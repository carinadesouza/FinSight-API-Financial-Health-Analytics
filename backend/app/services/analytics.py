import numpy as np
from sklearn.linear_model import LinearRegression


def calculate_financial_health(data: dict):
    """Calculate financial health score and ratios.

    Ratio definitions used here:
    - savings_ratio  = monthly_savings / monthly_income
                       where monthly_savings = income - total_expenses (cash flow method)
    - debt_ratio     = total_debt / annual_income
                       (standard personal-finance convention: debt measured against a year's income)
    - expense_ratio  = total_monthly_expenses / monthly_income

    All three ratios are 0–1 fractions before being fed into the score formula,
    which keeps the formula's ×50 multiplier meaningful.

    Previous bug: savings_ratio and debt_ratio were both divided by monthly income,
    producing values like 2.77 (277%) for savings and inflating the health score to 100
    for anyone with modest savings.
    """

    income   = data.get("income", 0)
    expenses = sum(data.get("expenses", {}).values())
    debts    = data.get("debts", 0)
    # NOTE: 'savings' is the user's total accumulated savings (lump sum),
    # NOT a monthly figure. We do NOT divide it by monthly income.
    savings  = data.get("savings", 0)

    # ── Correct ratio calculations ────────────────────────────────────────

    # Monthly savings derived from cash flow (income minus all monthly expenses).
    # Clamped at 0 so a deficit doesn't produce a negative ratio.
    monthly_savings = max(income - expenses, 0)

    # savings_ratio: fraction of monthly income being saved each month (target ≥ 20%)
    savings_ratio = monthly_savings / income if income else 0

    # debt_ratio: total debt as a fraction of annual income (target < 40% of annual)
    annual_income = income * 12
    debt_ratio = debts / annual_income if annual_income else 0

    # expense_ratio: fraction of monthly income spent on expenses (target < 60%)
    expense_ratio = expenses / income if income else 0

    # ── Health score formula ──────────────────────────────────────────────
    # All three ratios are now proper 0–1 fractions, so the ×50 multiplier works correctly.
    # A person saving 30% of income, with low debt and 50% expense ratio, scores around 60.
    score = 50 + (savings_ratio - debt_ratio - expense_ratio) * 50
    score = max(0.0, min(100.0, score))

    # ── Recommendations ───────────────────────────────────────────────────
    recommendations = []

    if debt_ratio > 0.40:
        recommendations.append(
            "Your total debt exceeds 40% of your annual income. "
            "Prioritising debt reduction will meaningfully improve your score."
        )
    if savings_ratio < 0.20:
        recommendations.append(
            "You are saving less than 20% of your monthly income. "
            "Try to increase this gradually — even 1–2% per month adds up."
        )
    if expense_ratio > 0.60:
        recommendations.append(
            "Your monthly expenses exceed 60% of income. "
            "Reviewing discretionary spending could free up savings capacity."
        )

    return {
        "financial_health_score": round(score, 2),
        "savings_ratio":          round(savings_ratio, 4),   # e.g. 0.3692 = 36.9% saved monthly
        "debt_ratio":             round(debt_ratio, 4),       # e.g. 0.0513 = 5.1% of annual income
        "expense_ratio":          round(expense_ratio, 4),    # e.g. 0.3692 = 36.9% spent monthly
        "monthly_savings":        round(monthly_savings, 2),  # helpful for UI display
        "net_worth":              round(savings - debts, 2),  # total savings minus total debts
        "recommendations":        recommendations,
    }


def predict_savings(monthly_savings: list[float]):
    """Predict next 6 months of savings using linear regression.

    No changes needed here — this function receives actual monthly savings
    figures from the user's history input, so it was never affected by the
    ratio bug above.
    """
    if len(monthly_savings) < 2:
        return [monthly_savings[-1] if monthly_savings else 0.0] * 6

    X = np.arange(len(monthly_savings)).reshape(-1, 1)
    y = np.array(monthly_savings)

    model = LinearRegression()
    model.fit(X, y)

    future_X   = np.arange(len(monthly_savings), len(monthly_savings) + 6).reshape(-1, 1)
    predictions = model.predict(future_X).round(2).tolist()

    # Clamp predictions at 0 — a linear extrapolation can go negative for
    # someone whose savings history is declining, which is misleading in a UI.
    predictions = [max(0.0, p) for p in predictions]

    return predictions


def evaluate_investments(investments: dict, income: float):
    """Evaluate investments relative to recommended ratio (20% of monthly income).

    No changes needed here — logic was correct. Added a zero-investment
    edge-case guard and slightly clearer recommendation thresholds.
    """
    total_invested    = sum(investments.values())
    recommended_ratio = 0.20 * income  # 20% of monthly income as a monthly investment target

    if recommended_ratio > 0:
        score = min(100.0, (total_invested / recommended_ratio) * 100)
    else:
        score = 0.0

    recommendations = []

    if total_invested == 0:
        recommendations.append(
            "You have no recorded investments. "
            "Consider starting with even a small monthly contribution."
        )
    elif total_invested < recommended_ratio:
        recommendations.append(
            "Consider investing more to reach 20% of your monthly income."
        )

    if total_invested > recommended_ratio * 2:
        recommendations.append(
            "Your investments are well above the recommended level. "
            "Ensure you maintain enough liquidity for emergencies."
        )

    return {
        "investment_score": round(score, 2),
        "total_invested":   round(total_invested, 2),
        "recommendations":  recommendations,
    }
