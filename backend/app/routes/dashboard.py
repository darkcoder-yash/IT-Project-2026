from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.transaction import Transaction
from app.analytics.finance_analyzer import (
    df_from_transactions,
    calculate_totals,
    highest_expense_category,
    category_distribution,
    monthly_spending,
    month_over_month_change
)
from app.analytics.anomaly_detector import detect_anomalies
from app.analytics.insight_engine import generate_insights
from app.analytics.health_calculator import calculate_financial_health
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(
    month: Optional[str] = Query(None, description="YYYY-MM"),
    db: Session = Depends(get_db)
):
    all_txs = db.query(Transaction).all()
    df_all = df_from_transactions(all_txs)

    if month:
        txs_month = db.query(Transaction).filter(Transaction.date.like(f"{month}%")).all()
        df_selected = df_from_transactions(txs_month)
    else:
        df_selected = df_all

    totals = calculate_totals(df_selected)
    top_cat = highest_expense_category(df_selected)
    mom = month_over_month_change(df_all)
    monthly_series = monthly_spending(df_all)
    cats_dist = category_distribution(df_selected)
    insights = generate_insights(df_selected)
    anomalies_res = detect_anomalies(df_all)
    health = calculate_financial_health(df_selected)

    recent_txs = (
        db.query(Transaction)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .limit(5)
        .all()
    )

    return {
        "totals": totals,
        "highest_category": top_cat,
        "month_over_month": mom,
        "monthly_trend": monthly_series,
        "category_distribution": cats_dist,
        "recent_transactions": [TransactionResponse.model_validate(t) for t in recent_txs],
        "insights": insights[:3],
        "anomalies": anomalies_res.get("anomalies", []),
        "health": health
    }
