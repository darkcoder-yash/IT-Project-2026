import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional


def df_from_transactions(transactions: List[Any]) -> pd.DataFrame:
    """
    Convert a list of SQLAlchemy Transaction models to a Pandas DataFrame.
    Guarantees correct columns and types even for empty lists.
    """
    if not transactions:
        return pd.DataFrame(columns=[
            "id", "date", "category", "amount", "type", "description", "created_at"
        ])
    
    data = []
    for t in transactions:
        data.append({
            "id": t.id,
            "date": pd.to_datetime(t.date),
            "category": t.category,
            "amount": float(t.amount),
            "type": t.type,
            "description": t.description or "",
            "created_at": t.created_at
        })
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    return df


def calculate_totals(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate primary financial totals: Income, Expenses, Savings, Savings Rate, Daily Avg Expense.
    """
    if df.empty:
        return {
            "total_income": 0.0,
            "total_expense": 0.0,
            "total_savings": 0.0,
            "savings_rate": 0.0,
            "daily_avg_expense": 0.0,
            "numpy_mean_expense": 0.0,
            "total_transactions": 0,
            "unique_expense_days": 0
        }

    income_df = df[df['type'] == 'Income']
    expense_df = df[df['type'] == 'Expense']

    total_income = float(income_df['amount'].sum()) if not income_df.empty else 0.0
    total_expense = float(expense_df['amount'].sum()) if not expense_df.empty else 0.0
    total_savings = total_income - total_expense
    
    savings_rate = (total_savings / total_income * 100.0) if total_income > 0 else 0.0

    if not expense_df.empty:
        unique_days = expense_df['date'].dt.date.nunique()
        daily_avg_expense = total_expense / unique_days if unique_days > 0 else 0.0
        numpy_mean_expense = float(np.mean(expense_df['amount'].to_numpy()))
    else:
        unique_days = 0
        daily_avg_expense = 0.0
        numpy_mean_expense = 0.0

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "total_savings": round(total_savings, 2),
        "savings_rate": round(savings_rate, 2),
        "daily_avg_expense": round(daily_avg_expense, 2),
        "numpy_mean_expense": round(numpy_mean_expense, 2),
        "total_transactions": len(df),
        "unique_expense_days": unique_days
    }


def highest_expense_category(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Find the category with the highest total expense.
    """
    if df.empty:
        return {"category": "N/A", "total": 0.0, "percentage": 0.0}
    
    expense_df = df[df['type'] == 'Expense']
    if expense_df.empty:
        return {"category": "N/A", "total": 0.0, "percentage": 0.0}

    total_expense = expense_df['amount'].sum()
    grouped = expense_df.groupby('category')['amount'].sum().reset_index()
    grouped = grouped.sort_values(by='amount', ascending=False)
    
    top_row = grouped.iloc[0]
    top_cat = top_row['category']
    top_amount = float(top_row['amount'])
    pct = (top_amount / total_expense * 100.0) if total_expense > 0 else 0.0

    return {
        "category": top_cat,
        "total": round(top_amount, 2),
        "percentage": round(pct, 2)
    }


def category_distribution(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate expense distribution grouped by category.
    """
    if df.empty:
        return []

    expense_df = df[df['type'] == 'Expense']
    if expense_df.empty:
        return []

    total_expense = float(expense_df['amount'].sum())
    grouped = expense_df.groupby('category').agg(
        total_amount=('amount', 'sum'),
        transaction_count=('amount', 'count')
    ).reset_index()

    grouped['percentage'] = (grouped['total_amount'] / total_expense * 100.0) if total_expense > 0 else 0.0
    grouped = grouped.sort_values(by='total_amount', ascending=False)

    results = []
    for _, row in grouped.iterrows():
        results.append({
            "category": row['category'],
            "total": round(float(row['total_amount']), 2),
            "percentage": round(float(row['percentage']), 2),
            "count": int(row['transaction_count'])
        })
    return results


def monthly_spending(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Aggregate transactions chronologically by Year-Month.
    Calculates Income, Expense, Savings, and Savings Rate for each month.
    """
    if df.empty:
        return []

    df_copy = df.copy()
    df_copy['year_month'] = df_copy['date'].dt.to_period('M')

    months = sorted(df_copy['year_month'].unique())
    results = []

    for m in months:
        m_df = df_copy[df_copy['year_month'] == m]
        inc = float(m_df[m_df['type'] == 'Income']['amount'].sum())
        exp = float(m_df[m_df['type'] == 'Expense']['amount'].sum())
        sav = inc - exp
        sav_rate = (sav / inc * 100.0) if inc > 0 else 0.0
        
        results.append({
            "month": str(m),
            "income": round(inc, 2),
            "expense": round(exp, 2),
            "savings": round(sav, 2),
            "savings_rate": round(sav_rate, 2),
            "transaction_count": len(m_df)
        })
    return results


def month_over_month_change(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate expense percentage change between the latest month and previous month.
    """
    monthly = monthly_spending(df)
    if len(monthly) < 2:
        current = monthly[-1]['expense'] if len(monthly) == 1 else 0.0
        return {
            "current_month": monthly[-1]['month'] if len(monthly) == 1 else "N/A",
            "previous_month": "N/A",
            "current_expense": current,
            "previous_expense": 0.0,
            "percentage_change": 0.0,
            "diff_amount": 0.0,
            "has_sufficient_data": False
        }

    prev_month = monthly[-2]
    curr_month = monthly[-1]

    prev_exp = prev_month['expense']
    curr_exp = curr_month['expense']
    diff = curr_exp - prev_exp

    if prev_exp > 0:
        pct_change = (diff / prev_exp) * 100.0
    else:
        pct_change = 100.0 if curr_exp > 0 else 0.0

    return {
        "current_month": curr_month['month'],
        "previous_month": prev_month['month'],
        "current_expense": round(curr_exp, 2),
        "previous_expense": round(prev_exp, 2),
        "percentage_change": round(pct_change, 2),
        "diff_amount": round(diff, 2),
        "has_sufficient_data": True
    }


def top_transactions(df: pd.DataFrame, limit: int = 5, tx_type: str = 'Expense') -> List[Dict[str, Any]]:
    """
    Get top N transactions by amount.
    """
    if df.empty:
        return []
    
    filtered = df[df['type'] == tx_type] if tx_type else df
    if filtered.empty:
        return []

    top_df = filtered.sort_values(by='amount', ascending=False).head(limit)
    results = []
    for _, row in top_df.iterrows():
        results.append({
            "id": int(row['id']),
            "date": row['date'].strftime('%Y-%m-%d'),
            "category": row['category'],
            "amount": round(float(row['amount']), 2),
            "type": row['type'],
            "description": row['description']
        })
    return results


def spending_frequency(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Calculate spending frequency (count of transactions per category).
    """
    if df.empty:
        return []

    expense_df = df[df['type'] == 'Expense']
    if expense_df.empty:
        return []

    counts = expense_df.groupby('category')['id'].count().reset_index()
    counts.columns = ['category', 'count']
    counts = counts.sort_values(by='count', ascending=False)

    return counts.to_dict(orient='records')
