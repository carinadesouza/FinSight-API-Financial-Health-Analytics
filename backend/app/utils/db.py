from typing import Dict
from app.models import FinancialData

# Simulated in-memory database
users_db: Dict[str, dict] = {}
financial_records_db: Dict[str, FinancialData] = {}

# Example helper functions

def add_user(user_id: str, user_info: dict):
    users_db[user_id] = user_info
    return users_db[user_id]

def get_user(user_id: str):
    return users_db.get(user_id)

def save_financial_record(user_id: str, data: FinancialData):
    financial_records_db[user_id] = data.dict()
    return financial_records_db[user_id]

def get_financial_record(user_id: str):
    return financial_records_db.get(user_id)