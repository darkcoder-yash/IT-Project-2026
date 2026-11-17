from datetime import date
from sqlalchemy.orm import Session
from app.models.transaction import Transaction

SEED_TRANSACTIONS = [
    # --- July 2026 ---
    {"date": date(2026, 7, 1), "category": "Salary", "amount": 40000.0, "type": "Income", "description": "Monthly Salary"},
    {"date": date(2026, 7, 2), "category": "Rent", "amount": 8000.0, "type": "Expense", "description": "Apartment Rent"},
    {"date": date(2026, 7, 6), "category": "Food", "amount": 3200.0, "type": "Expense", "description": "Groceries & Cafe"},
    {"date": date(2026, 7, 12), "category": "Bills", "amount": 1500.0, "type": "Expense", "description": "Electricity & Internet"},
    {"date": date(2026, 7, 19), "category": "Entertainment", "amount": 1200.0, "type": "Expense", "description": "Dining & Cinema"},
    {"date": date(2026, 7, 25), "category": "Travel", "amount": 1100.0, "type": "Expense", "description": "Metro & Transit"},

    # --- August 2026 (Unusual Expense: Laptop Upgrade ₹24,000) ---
    {"date": date(2026, 8, 1), "category": "Salary", "amount": 40000.0, "type": "Income", "description": "Monthly Salary"},
    {"date": date(2026, 8, 2), "category": "Rent", "amount": 8000.0, "type": "Expense", "description": "Apartment Rent"},
    {"date": date(2026, 8, 5), "category": "Food", "amount": 3500.0, "type": "Expense", "description": "Groceries & Dining"},
    {"date": date(2026, 8, 11), "category": "Bills", "amount": 1600.0, "type": "Expense", "description": "Electricity & Internet"},
    {"date": date(2026, 8, 15), "category": "Electronics", "amount": 24000.0, "type": "Expense", "description": "Laptop Upgrade"},
    {"date": date(2026, 8, 20), "category": "Travel", "amount": 1300.0, "type": "Expense", "description": "Metro & Transit"},
    {"date": date(2026, 8, 24), "category": "Entertainment", "amount": 1400.0, "type": "Expense", "description": "Weekend Outing"}
]


def seed_database_if_empty(db: Session):
    """
    Populate database with sample realistic dataset if table is empty.
    """
    count = db.query(Transaction).count()
    if count == 0:
        db_txs = [Transaction(**tx) for tx in SEED_TRANSACTIONS]
        db.bulk_save_objects(db_txs)
        db.commit()
        print(f"[SeedData] Automatically populated DB with {len(db_txs)} sample transactions.")


def reset_and_reseed_database(db: Session):
    """
    Wipe existing transactions and re-populate with sample transactions.
    """
    db.query(Transaction).delete()
    db.commit()
    db_txs = [Transaction(**tx) for tx in SEED_TRANSACTIONS]
    db.bulk_save_objects(db_txs)
    db.commit()
    print(f"[SeedData] Reset and re-populated DB with {len(db_txs)} sample transactions.")
    return len(db_txs)


