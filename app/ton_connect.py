from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
import aiohttp
import json

router = APIRouter()

TONCONNECT_MANIFEST = {
    "url": "https://your-app.onrender.com",
    "name": "Wallet App",
    "iconUrl": "https://your-app.onrender.com/static/icon.png"
}

@router.get("/tonconnect/manifest")
async def get_manifest():
    return TONCONNECT_MANIFEST

@router.get("/tonconnect/wallets")
async def get_wallets():
    """Получаем список кошельков из TON Connect"""
    async with aiohttp.ClientSession() as session:
        async with session.get('https://raw.githubusercontent.com/ton-connect/wallets-list/main/wallets.json') as resp:
            wallets = await resp.json()
            return wallets

@router.post("/tonconnect/connect")
async def connect_wallet(wallet_data: dict):
    """Обрабатываем подключение кошелька"""
    wallet_address = wallet_data.get('address')
    # Здесь сохраняем адрес в базу
    return {"status": "connected", "address": wallet_address}