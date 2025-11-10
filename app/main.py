from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
import json

from .database import get_db, engine
from .models import Base
from .schemas import UserCreate, UserUpdate, DepositRequest
from .crud import get_user_by_telegram_id, create_user, update_user_wallet, create_deposit
from .ton_connect import router as ton_connect_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(ton_connect_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")

@app.get("/tonconnect-manifest.json")
def tonconnect_manifest():
    return {
        "url": "https://your-app.onrender.com",
        "name": "Wallet App", 
        "iconUrl": "https://your-app.onrender.com/static/icon.png"
    }

@app.post("/api/users/")
def create_or_get_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user_by_telegram_id(db, user.telegram_id)
    if db_user:
        return db_user
    return create_user(db, user)

@app.get("/api/users/{telegram_id}")
def get_user(telegram_id: str, db: Session = Depends(get_db)):
    user = get_user_by_telegram_id(db, telegram_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/api/users/{telegram_id}/wallet")
def update_wallet(telegram_id: str, wallet: UserUpdate, db: Session = Depends(get_db)):
    user = update_user_wallet(db, telegram_id, wallet.wallet_address)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/users/{telegram_id}/deposit")
def make_deposit(telegram_id: str, deposit: DepositRequest, db: Session = Depends(get_db)):
    user = create_deposit(db, telegram_id, deposit.amount, deposit.description)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Deposit successful", "new_balance": user.balance}