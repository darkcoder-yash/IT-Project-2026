from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.transaction import Transaction
from app.analytics.finance_analyzer import df_from_transactions
from app.analytics.report_generator import generate_structured_report, export_report_csv
from app.analytics.spending_patterns import generate_seaborn_heatmap_png

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/summary")
def get_report_summary(
    month: Optional[str] = Query(None, description="YYYY-MM"),
    start_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db)
):
    df = df_from_transactions(db.query(Transaction).all())
    return generate_structured_report(df, start_date=start_date, end_date=end_date, month=month)


@router.get("/export-csv")
def download_report_csv(
    month: Optional[str] = Query(None, description="YYYY-MM"),
    db: Session = Depends(get_db)
):
    df = df_from_transactions(db.query(Transaction).all())
    csv_content = export_report_csv(df, month=month)

    filename = f"financial_report_{month if month else 'all_time'}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/heatmap-image")
def get_heatmap_image(db: Session = Depends(get_db)):
    df = df_from_transactions(db.query(Transaction).all())
    image_bytes = generate_seaborn_heatmap_png(df)
    return Response(content=image_bytes, media_type="image/png")
