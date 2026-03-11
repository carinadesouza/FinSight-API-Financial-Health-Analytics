from fastapi import APIRouter, HTTPException
from app.models import FinancialData, FinancialHealthResponse
from app.services.analytics import calculate_financial_health, predict_savings, evaluate_investments
from app.utils.db import save_financial_record, get_financial_record
from pydantic import BaseModel

router = APIRouter(prefix="/finances", tags=["Finances"])

class SavingsPredictionRequest(BaseModel):
    monthly_savings: list[float]

@router.post("/health", response_model=FinancialHealthResponse)
def financial_health(data: FinancialData, user_id: str):
    """Calculate financial health and save record."""
    save_financial_record(user_id, data)
    health = calculate_financial_health(data.dict())
    health["investments"] = evaluate_investments(data.investments, data.income)
    return health

@router.get("/history/{user_id}")
def get_financial_history(user_id: str):
    """Get last saved financial record."""
    record = get_financial_record(user_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@router.post("/predict-savings")
def savings_prediction(user_id: str, body: SavingsPredictionRequest):
    """Predict next 6 months savings based on input."""
    predictions = predict_savings(body.monthly_savings)
    return {
        "user_id": user_id,
        "past_savings": body.monthly_savings,
        "next_6_months_savings": predictions
    }
