from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    telegram_id: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserUpdate(BaseModel):
    wallet_address: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    telegram_id: str
    username: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    wallet_address: Optional[str]
    balance: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class DepositRequest(BaseModel):
    amount: float
    description: Optional[str] = None