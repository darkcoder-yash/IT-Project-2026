from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date as date_type

from app.database import get_db
from app.models.transaction import Transaction
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    CSVImportPreview,
    CSVImportResult
)
from app.services.csv_service import parse_and_validate_csv

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=dict)
def get_transactions(
    db: Session = Depends(get_db),
    start_date: Optional[date_type] = None,
    end_date: Optional[date_type] = None,
    month: Optional[str] = Query(None, description="Format YYYY-MM"),
    category: Optional[str] = None,
    type: Optional[str] = Query(None, description="Income or Expense"),
    search: Optional[str] = None,
    sort_by: str = Query("date", description="date or amount"),
    order: str = Query("desc", description="asc or desc")
):
    query = db.query(Transaction)

    if month:
        query = query.filter(Transaction.date.like(f"{month}%"))
    else:
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)

    if category:
        query = query.filter(Transaction.category.ilike(f"%{category.strip()}%"))

    if type:
        query = query.filter(Transaction.type == type.strip().title())

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            (Transaction.description.ilike(search_pattern)) |
            (Transaction.category.ilike(search_pattern))
        )

    # Sorting
    sort_column = Transaction.amount if sort_by.lower() == "amount" else Transaction.date
    if order.lower() == "asc":
        query = query.order_by(sort_column.asc(), Transaction.id.asc())
    else:
        query = query.order_by(sort_column.desc(), Transaction.id.desc())

    transactions = query.all()

    total_income = sum(t.amount for t in transactions if t.type == "Income")
    total_expense = sum(t.amount for t in transactions if t.type == "Expense")

    return {
        "count": len(transactions),
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "transactions": [TransactionResponse.model_validate(t) for t in transactions]
    }


@router.get("/{tx_id}", response_model=TransactionResponse)
def get_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    db_tx = Transaction(
        date=payload.date,
        category=payload.category.strip(),
        amount=payload.amount,
        type=payload.type.strip().title(),
        description=payload.description.strip() if payload.description else ""
    )
    db.add(db_tx)
    db.commit()
    db.refresh(db_tx)
    return db_tx


@router.put("/{tx_id}", response_model=TransactionResponse)
def update_transaction(tx_id: int, payload: TransactionUpdate, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            if key == "type":
                value = value.strip().title()
            elif key == "category":
                value = value.strip()
            elif key == "description":
                value = value.strip()
            setattr(tx, key, value)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=status.HTTP_200_OK)
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully", "id": tx_id}


@router.post("/import/preview", response_model=CSVImportPreview)
async def preview_csv_import(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")
    
    contents = await file.read()
    try:
        preview, _ = parse_and_validate_csv(contents)
        return preview
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/import", response_model=CSVImportResult)
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    contents = await file.read()
    try:
        preview, valid_txs = parse_and_validate_csv(contents)
        if not valid_txs:
            return CSVImportResult(
                imported_count=0,
                skipped_count=preview.invalid_rows,
                message="No valid transactions were found in the uploaded CSV file."
            )

        db_txs = [
            Transaction(
                date=tx.date,
                category=tx.category,
                amount=tx.amount,
                type=tx.type,
                description=tx.description
            )
            for tx in valid_txs
        ]
        db.bulk_save_objects(db_txs)
        db.commit()

        return CSVImportResult(
            imported_count=len(db_txs),
            skipped_count=preview.invalid_rows,
            message=f"Successfully imported {len(db_txs)} transactions ({preview.invalid_rows} invalid rows skipped)."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-sample-data", status_code=status.HTTP_200_OK)
@router.post("/reset-student-data", status_code=status.HTTP_200_OK)
def reset_sample_data(db: Session = Depends(get_db)):
    from app.utils.seed_data import reset_and_reseed_database
    count = reset_and_reseed_database(db)
    return {
        "status": "success",
        "message": f"Reset database transactions to sample dataset ({count} transactions loaded).",
        "count": count
    }


