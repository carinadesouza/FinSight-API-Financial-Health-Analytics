from pydantic import BaseModel, validator
from typing import Dict, List

class FinancialData(BaseModel):
    income: float
    expenses: Dict[str, float]   # now accepts any category keys
    debts: float
    savings: float
    investments: Dict[str, float] = {}

    @validator("income")
    def income_positive(cls, v):
        if v < 0:
            raise ValueError("Income must be non-negative")
        return v

    @validator("debts", "savings")
    def non_negative(cls, v):
        if v < 0:
            raise ValueError("Value must be non-negative")
        return v

class FinancialHealthResponse(BaseModel):
    financial_health_score: float
    savings_ratio: float
    debt_ratio: float
    expense_ratio: float
    recommendations: List[str]
    investments: dict
