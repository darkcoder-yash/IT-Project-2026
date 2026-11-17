import pytest
import pandas as pd
import numpy as np
from datetime import date
from app.analytics.finance_analyzer import (
    calculate_totals,
    highest_expense_category,
    category_distribution,
    monthly_spending,
    month_over_month_change
)
from app.analytics.anomaly_detector import detect_anomalies
from app.services.csv_service import parse_and_validate_csv


@pytest.fixture
def sample_df():
    data = [
        {"id": 1, "date": pd.to_datetime("2026-07-01"), "category": "Salary", "amount": 50000.0, "type": "Income", "description": "Salary"},
        {"id": 2, "date": pd.to_datetime("2026-07-02"), "category": "Rent", "amount": 15000.0, "type": "Expense", "description": "Rent"},
        {"id": 3, "date": pd.to_datetime("2026-07-05"), "category": "Food", "amount": 5000.0, "type": "Expense", "description": "Groceries"},
        {"id": 4, "date": pd.to_datetime("2026-07-10"), "category": "Food", "amount": 2000.0, "type": "Expense", "description": "Dining"},
        {"id": 5, "date": pd.to_datetime("2026-08-01"), "category": "Salary", "amount": 50000.0, "type": "Income", "description": "Salary"},
        {"id": 6, "date": pd.to_datetime("2026-08-02"), "category": "Rent", "amount": 15000.0, "type": "Expense", "description": "Rent"},
        {"id": 7, "date": pd.to_datetime("2026-08-05"), "category": "Food", "amount": 6000.0, "type": "Expense", "description": "Groceries"},
        # Anomaly item in August
        {"id": 8, "date": pd.to_datetime("2026-08-15"), "category": "Electronics", "amount": 35000.0, "type": "Expense", "description": "Laptop"}
    ]
    return pd.DataFrame(data)


def test_totals_calculation(sample_df):
    totals = calculate_totals(sample_df)
    assert totals["total_income"] == 100000.0
    assert totals["total_expense"] == 78000.0
    assert totals["total_savings"] == 22000.0
    assert totals["savings_rate"] == 22.0
    assert totals["unique_expense_days"] == 6


def test_highest_expense_category(sample_df):
    top = highest_expense_category(sample_df)
    assert top["category"] == "Electronics"
    assert top["total"] == 35000.0


def test_monthly_spending_aggregation(sample_df):
    monthly = monthly_spending(sample_df)
    assert len(monthly) == 2
    assert monthly[0]["month"] == "2026-07"
    assert monthly[0]["income"] == 50000.0
    assert monthly[0]["expense"] == 22000.0
    assert monthly[0]["savings"] == 28000.0

    assert monthly[1]["month"] == "2026-08"
    assert monthly[1]["income"] == 50000.0
    assert monthly[1]["expense"] == 56000.0


def test_month_over_month_change(sample_df):
    mom = month_over_month_change(sample_df)
    assert mom["has_sufficient_data"] is True
    assert mom["current_expense"] == 56000.0
    assert mom["previous_expense"] == 22000.0
    # Change % = (56000 - 22000) / 22000 * 100 = 154.55%
    assert pytest.approx(mom["percentage_change"], 0.1) == 154.55


def test_anomaly_detection_z_score(sample_df):
    res = detect_anomalies(sample_df, threshold_z=1.5)
    assert res["status"] == "Success"
    assert res["anomalies_detected"] >= 1
    top_anomaly = res["anomalies"][0]
    assert top_anomaly["category"] == "Electronics"
    assert top_anomaly["amount"] == 35000.0
    assert top_anomaly["severity"] in ["Moderate", "High"]


def test_anomaly_detection_insufficient_data():
    data = [
        {"id": 1, "date": pd.to_datetime("2026-07-01"), "category": "Food", "amount": 100.0, "type": "Expense", "description": "Snack"}
    ]
    df = pd.DataFrame(data)
    res = detect_anomalies(df)
    assert res["status"] == "Insufficient Data"
    assert res["anomalies_detected"] == 0


def test_zero_income_and_empty_dataset():
    empty_df = pd.DataFrame(columns=["id", "date", "category", "amount", "type", "description"])
    totals = calculate_totals(empty_df)
    assert totals["total_income"] == 0.0
    assert totals["total_expense"] == 0.0
    assert totals["savings_rate"] == 0.0

    no_income_df = pd.DataFrame([
        {"id": 1, "date": pd.to_datetime("2026-07-01"), "category": "Food", "amount": 500.0, "type": "Expense", "description": "Lunch"}
    ])
    totals_no_inc = calculate_totals(no_income_df)
    assert totals_no_inc["total_income"] == 0.0
    assert totals_no_inc["total_expense"] == 500.0
    assert totals_no_inc["total_savings"] == -500.0
    assert totals_no_inc["savings_rate"] == 0.0


def test_csv_parser_validation():
    csv_data = b"""Date,Category,Amount,Type,Description
01-08-2026,Food,450,Expense,Lunch
02-08-2026,Salary,30000,Income,Monthly salary
03-08-2026,Travel,-50,Expense,Invalid Amount
04-08-2026,Shopping,2500,UnknownType,Invalid Type
"""
    preview, valid_txs = parse_and_validate_csv(csv_data)
    assert preview.total_rows == 4
    assert preview.valid_rows == 2
    assert preview.invalid_rows == 2
    assert len(valid_txs) == 2
    assert valid_txs[0].category == "Food"
    assert valid_txs[0].amount == 450.0
    assert valid_txs[1].type == "Income"
