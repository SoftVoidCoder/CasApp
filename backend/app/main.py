from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

# Импорты из текущей директории
from .database import get_db, engine
from .models import Base
from .schemas import UserCreate, UserUpdate, DepositRequest
from .crud import get_user_by_telegram_id, create_user, update_user_wallet, create_deposit

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Telegram Wallet API",
    description="API for Telegram Mini App Wallet",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Telegram Wallet API is running"}

@app.post("/users/")
def create_or_get_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_telegram_id(db, user.telegram_id)
    if db_user:
        return db_user
    return create_user(db, user)

@app.get("/users/{telegram_id}")
def get_user(telegram_id: str, db: Session = Depends(get_db)):
    user = get_user_by_telegram_id(db, telegram_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{telegram_id}/wallet")
def update_wallet(telegram_id: str, wallet: UserUpdate, db: Session = Depends(get_db)):
    user = update_user_wallet(db, telegram_id, wallet.wallet_address)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/{telegram_id}/deposit")
def make_deposit(telegram_id: str, deposit: DepositRequest, db: Session = Depends(get_db)):
    user = create_deposit(db, telegram_id, deposit.amount, deposit.description)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "message": "Deposit successful",
        "new_balance": user.balance
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Serve frontend files
@app.get("/frontend/{filename}")
def serve_frontend(filename: str):
    frontend_path = os.path.join(os.path.dirname(__file__), "../../frontend")
    file_path = os.path.join(frontend_path, filename)
    
    if os.path.exists(file_path):
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/frontend/")
def serve_index():
    frontend_path = os.path.join(os.path.dirname(__file__), "../../frontend")
    file_path = os.path.join(frontend_path, "index.html")
    
    if os.path.exists(file_path):
        from fastapi.responses import FileResponse
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Index file not found")