from datetime import date as date_type, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class TransactionBase(BaseModel):
    date: date_type
    category: str = Field(..., min_length=1, max_length=100)
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    type: str = Field(..., description="Income or Expense")
    description: Optional[str] = Field(default="", max_length=500)

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        v_title = v.strip().title()
        if v_title not in ["Income", "Expense"]:
            raise ValueError("Type must be 'Income' or 'Expense'")
        return v_title

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        v_clean = v.strip()
        if not v_clean:
            raise ValueError("Category cannot be empty")
        return v_clean


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    date: Optional[date_type] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    description: Optional[str] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v_title = v.strip().title()
        if v_title not in ["Income", "Expense"]:
            raise ValueError("Type must be 'Income' or 'Expense'")
        return v_title

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v


class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CSVRowError(BaseModel):
    row_index: int
    data: Dict[str, Any]
    error: str


class CSVImportPreview(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    errors: List[CSVRowError]
    preview_valid: List[Dict[str, Any]]


class CSVImportResult(BaseModel):
    imported_count: int
    skipped_count: int
    message: str
