import numpy as np
from sklearn.linear_model import LinearRegression

def calculate_financial_health(data: dict):
    """Calculate financial health score and ratios."""
    income = data.get("income", 0)
    expenses = sum(data.get("expenses", {}).values())
    debts = data.get("debts", 0)
    savings = data.get("savings", 0)

    # Ratios
    savings_ratio = savings / income if income else 0
    debt_ratio = debts / income if income else 0
    expense_ratio = expenses / income if income else 0

    # Financial health score formula (0-100)
    score = 50 + (savings_ratio - debt_ratio - expense_ratio) * 50
    score = max(0, min(100, score))

    # Recommendations
    recommendations = []
    if debt_ratio > 0.4:
        recommendations.append("Reduce your debts for better financial health.")
    if savings_ratio < 0.2:
        recommendations.append("Increase your savings to at least 20% of income.")
    if expense_ratio > 0.6:
        recommendations.append("Try to reduce your monthly expenses.")

    return {
        "financial_health_score": round(score, 2),
        "savings_ratio": round(savings_ratio, 2),
        "debt_ratio": round(debt_ratio, 2),
        "expense_ratio": round(expense_ratio, 2),
        "recommendations": recommendations
    }


def predict_savings(monthly_savings: list[float]):
    """Predict next 6 months savings using linear regression."""
    if len(monthly_savings) < 2:
        return [monthly_savings[-1] if monthly_savings else 0] * 6

    X = np.arange(len(monthly_savings)).reshape(-1, 1)
    y = np.array(monthly_savings)

    model = LinearRegression()
    model.fit(X, y)

    future_X = np.arange(len(monthly_savings), len(monthly_savings) + 6).reshape(-1, 1)
    predictions = model.predict(future_X).round(2).tolist()
    return predictions


def evaluate_investments(investments: dict, income: float):
    """Evaluate investments relative to recommended ratio (20% of income)."""
    total_invested = sum(investments.values())
    recommended_ratio = 0.2 * income
    score = min(100, (total_invested / recommended_ratio) * 100) if recommended_ratio else 0

    recommendations = []
    if total_invested < recommended_ratio:
        recommendations.append("Consider investing more to reach 20% of your income.")
    if total_invested > recommended_ratio * 2:
        recommendations.append("Your investments are high. Ensure liquidity for emergencies.")

    return {
        "investment_score": round(score, 2),
        "total_invested": total_invested,
        "recommendations": recommendations
    }