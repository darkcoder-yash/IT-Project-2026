import io
import csv
import pandas as pd
from typing import Dict, Any, Optional
from app.analytics.finance_analyzer import (
    calculate_totals,
    highest_expense_category,
    category_distribution,
    monthly_spending,
    month_over_month_change,
    top_transactions
)
from app.analytics.anomaly_detector import detect_anomalies
from app.analytics.insight_engine import generate_insights
from app.analytics.health_calculator import calculate_financial_health


def filter_by_date_range(
    df: pd.DataFrame,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    month: Optional[str] = None
) -> pd.DataFrame:
    """
    Filter DataFrame by start_date/end_date (YYYY-MM-DD) or month (YYYY-MM).
    """
    if df.empty:
        return df

    filtered_df = df.copy()

    if month:
        filtered_df = filtered_df[filtered_df['date'].dt.strftime('%Y-%m') == month]
    else:
        if start_date:
            filtered_df = filtered_df[filtered_df['date'] >= pd.to_datetime(start_date)]
        if end_date:
            filtered_df = filtered_df[filtered_df['date'] <= pd.to_datetime(end_date)]

    return filtered_df


def generate_structured_report(
    df: pd.DataFrame,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    month: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a complete structured report object.
    """
    report_df = filter_by_date_range(df, start_date=start_date, end_date=end_date, month=month)

    period_label = "All Time"
    if month:
        period_label = f"Month: {month}"
    elif start_date or end_date:
        period_label = f"Range: {start_date or 'Beginning'} to {end_date or 'Latest'}"

    totals = calculate_totals(report_df)
    top_cat = highest_expense_category(report_df)
    cats_dist = category_distribution(report_df)
    anomalies = detect_anomalies(report_df)
    insights = generate_insights(report_df)
    health = calculate_financial_health(report_df)
    largest_expenses = top_transactions(report_df, limit=5, tx_type="Expense")
    mom = month_over_month_change(df)  # Compare using overall timeline context

    return {
        "title": "Personal Financial Report",
        "period_label": period_label,
        "totals": totals,
        "highest_spending_category": top_cat,
        "category_distribution": cats_dist,
        "largest_expenses": largest_expenses,
        "month_over_month": mom,
        "anomalies": anomalies.get("anomalies", []),
        "insights": insights,
        "health": health
    }


def export_report_csv(df: pd.DataFrame, month: Optional[str] = None) -> str:
    """
    Export financial summary & transaction log as a CSV string.
    """
    filtered_df = filter_by_date_range(df, month=month)
    output = io.StringIO()
    writer = csv.writer(output)

    # Header section
    writer.writerow(["PERSONAL FINANCIAL REPORT"])
    writer.writerow(["Period", month if month else "All Time"])
    writer.writerow([])

    # Metrics section
    totals = calculate_totals(filtered_df)
    writer.writerow(["SUMMARY METRICS"])
    writer.writerow(["Metric", "Value"])
    writer.writerow(["Total Income", f"₹{totals['total_income']:,.2f}"])
    writer.writerow(["Total Expense", f"₹{totals['total_expense']:,.2f}"])
    writer.writerow(["Net Savings", f"₹{totals['total_savings']:,.2f}"])
    writer.writerow(["Savings Rate", f"{totals['savings_rate']}%"])
    writer.writerow(["Daily Avg Expense", f"₹{totals['daily_avg_expense']:,.2f}"])
    writer.writerow([])

    # Transaction log
    writer.writerow(["TRANSACTION LOG"])
    writer.writerow(["ID", "Date", "Category", "Amount", "Type", "Description"])
    
    if not filtered_df.empty:
        sorted_df = filtered_df.sort_values(by="date", ascending=False)
        for _, row in sorted_df.iterrows():
            writer.writerow([
                row["id"],
                row["date"].strftime("%Y-%m-%d"),
                row["category"],
                f"{row['amount']:.2f}",
                row["type"],
                row["description"]
            ])

    return output.getvalue()
