from sqlalchemy.orm import Session
from .models import User, Transaction
from .schemas import UserCreate

def get_user_by_telegram_id(db: Session, telegram_id: str):
    return db.query(User).filter(User.telegram_id == telegram_id).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user_wallet(db: Session, telegram_id: str, wallet_address: str):
    user = get_user_by_telegram_id(db, telegram_id)
    if user:
        user.wallet_address = wallet_address
        db.commit()
        db.refresh(user)
    return user

def create_deposit(db: Session, telegram_id: str, amount: float, description: str = None):
    user = get_user_by_telegram_id(db, telegram_id)
    if not user:
        return None
    
    transaction = Transaction(
        user_id=user.id,
        amount=amount,
        transaction_type='deposit',
        description=description or f"Deposit ${amount}"
    )
    
    user.balance += amount
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    db.refresh(user)
    
    return user