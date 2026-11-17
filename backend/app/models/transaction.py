from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False, index=True)  # Income or Expense
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
