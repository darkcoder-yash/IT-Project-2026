from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date as date_type

from app.database import get_db
from app.models.transaction import Transaction
from app.analytics.finance_analyzer import (
    df_from_transactions,
    highest_expense_category,
    category_distribution,
    monthly_spending,
    month_over_month_change,
    top_transactions,
    spending_frequency
)
from app.analytics.anomaly_detector import detect_anomalies
from app.analytics.spending_patterns import day_of_week_category_matrix
from app.analytics.insight_engine import generate_insights
from app.analytics.health_calculator import calculate_financial_health

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/categories")
def get_category_analytics(
    db: Session = Depends(get_db),
    start_date: Optional[date_type] = None,
    end_date: Optional[date_type] = None,
    month: Optional[str] = None
):
    query = db.query(Transaction)
    if month:
        query = query.filter(Transaction.date.like(f"{month}%"))
    else:
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)

    df = df_from_transactions(query.all())
    
    return {
        "highest_category": highest_expense_category(df),
        "distribution": category_distribution(df),
        "frequency": spending_frequency(df),
        "top_5_expenses": top_transactions(df, limit=5, tx_type="Expense")
    }


@router.get("/monthly")
def get_monthly_analytics(db: Session = Depends(get_db)):
    df = df_from_transactions(db.query(Transaction).all())
    
    monthly_series = monthly_spending(df)
    mom_change = month_over_month_change(df)

    # Calculate highlights
    if monthly_series:
        highest_spending_m = max(monthly_series, key=lambda x: x["expense"])
        lowest_spending_m = min(monthly_series, key=lambda x: x["expense"])
        best_savings_m = max(monthly_series, key=lambda x: x["savings"])
        worst_savings_m = min(monthly_series, key=lambda x: x["savings"])
    else:
        highest_spending_m = lowest_spending_m = best_savings_m = worst_savings_m = None

    return {
        "monthly_series": monthly_series,
        "month_over_month": mom_change,
        "highlights": {
            "highest_spending_month": highest_spending_m,
            "lowest_spending_month": lowest_spending_m,
            "best_savings_month": best_savings_m,
            "worst_savings_month": worst_savings_m
        }
    }


@router.get("/anomalies")
def get_anomalies_analytics(
    threshold_z: float = Query(2.0, ge=1.0, le=5.0),
    db: Session = Depends(get_db)
):
    df = df_from_transactions(db.query(Transaction).all())
    return detect_anomalies(df, threshold_z=threshold_z)


@router.get("/heatmap")
def get_spending_heatmap(db: Session = Depends(get_db)):
    df = df_from_transactions(db.query(Transaction).all())
    return day_of_week_category_matrix(df)


@router.get("/insights")
def get_financial_insights(db: Session = Depends(get_db)):
    df = df_from_transactions(db.query(Transaction).all())
    return generate_insights(df)


@router.get("/health")
def get_financial_health(db: Session = Depends(get_db)):
    df = df_from_transactions(db.query(Transaction).all())
    return calculate_financial_health(df)
