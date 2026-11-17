import io
import pandas as pd
from typing import Tuple, List, Dict, Any
from datetime import datetime
from app.schemas.transaction import CSVImportPreview, CSVRowError, TransactionCreate


REQUIRED_COLUMNS = ["Date", "Category", "Amount", "Type"]


def parse_and_validate_csv(file_content: bytes) -> Tuple[CSVImportPreview, List[TransactionCreate]]:
    """
    Parse CSV file content with Pandas, validate columns, types, dates, and amounts.
    Returns preview summary and list of valid TransactionCreate schemas.
    """
    try:
        df = pd.read_csv(io.BytesIO(file_content))
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file format: {str(e)}")

    # Standardize column headers (strip spaces, title case)
    df.columns = [str(c).strip().title() for c in df.columns]

    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"CSV missing required column(s): {', '.join(missing_cols)}. Expected columns: Date, Category, Amount, Type, Description")

    if "Description" not in df.columns:
        df["Description"] = ""

    total_rows = len(df)
    errors: List[CSVRowError] = []
    valid_transactions: List[TransactionCreate] = []
    preview_valid: List[Dict[str, Any]] = []

    for idx, row in df.iterrows():
        row_num = idx + 1
        row_data = row.to_dict()

        # 1. Validate Category
        raw_category = str(row.get("Category", "")).strip()
        if not raw_category or raw_category.lower() == "nan":
            errors.append(CSVRowError(row_index=row_num, data=row_data, error="Category cannot be empty."))
            continue

        # 2. Validate Type
        raw_type = str(row.get("Type", "")).strip().title()
        if raw_type not in ["Income", "Expense"]:
            errors.append(CSVRowError(row_index=row_num, data=row_data, error=f"Invalid type '{row.get('Type')}'. Must be 'Income' or 'Expense'."))
            continue

        # 3. Validate Amount
        raw_amount = row.get("Amount")
        try:
            amount = float(str(raw_amount).replace(",", "").strip())
            if amount <= 0:
                errors.append(CSVRowError(row_index=row_num, data=row_data, error="Amount must be greater than 0."))
                continue
        except (ValueError, TypeError):
            errors.append(CSVRowError(row_index=row_num, data=row_data, error=f"Invalid amount '{raw_amount}'. Must be a valid positive number."))
            continue

        # 4. Validate & Parse Date
        raw_date = str(row.get("Date", "")).strip()
        parsed_date = None
        
        # Try Pandas pd.to_datetime with dayfirst fallback
        try:
            dt = pd.to_datetime(raw_date, dayfirst=True)
            if not pd.isna(dt):
                parsed_date = dt.date()
        except Exception:
            parsed_date = None

        if not parsed_date:
            errors.append(CSVRowError(row_index=row_num, data=row_data, error=f"Invalid date format '{raw_date}'. Use DD-MM-YYYY or YYYY-MM-DD."))
            continue

        # 5. Clean Description
        raw_desc = str(row.get("Description", "")).strip()
        if raw_desc.lower() == "nan":
            raw_desc = ""

        tx = TransactionCreate(
            date=parsed_date,
            category=raw_category,
            amount=amount,
            type=raw_type,
            description=raw_desc
        )
        valid_transactions.append(tx)
        
        if len(preview_valid) < 5:
            preview_valid.append({
                "row": row_num,
                "date": str(parsed_date),
                "category": raw_category,
                "amount": amount,
                "type": raw_type,
                "description": raw_desc
            })

    preview = CSVImportPreview(
        total_rows=total_rows,
        valid_rows=len(valid_transactions),
        invalid_rows=len(errors),
        errors=errors,
        preview_valid=preview_valid
    )

    return preview, valid_transactions
