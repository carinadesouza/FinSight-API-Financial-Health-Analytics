from pydantic import BaseModel
from typing import Dict, List

# Input data model for financial info
class FinancialData(BaseModel):
    income: float  # monthly income
    expenses: Dict[str, float]  # e.g., {"rent": 1000, "food": 400}
    debts: float  # total debts
    savings: float  # total savings
    investments: Dict[str, float] = {}  # optional, e.g., {"stocks": 2000}

# Output data model for API response
class FinancialHealthResponse(BaseModel):
    financial_health_score: float
    savings_ratio: float
    debt_ratio: float
    expense_ratio: float
    recommendations: List[str]
    investments: dict