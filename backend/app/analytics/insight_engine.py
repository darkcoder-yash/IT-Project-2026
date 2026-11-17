import pandas as pd
from typing import List, Dict, Any
from app.analytics.finance_analyzer import (
    calculate_totals,
    highest_expense_category,
    month_over_month_change,
    category_distribution
)
from app.analytics.anomaly_detector import detect_anomalies
from app.analytics.spending_patterns import day_of_week_category_matrix


def generate_insights(df: pd.DataFrame) -> List[Dict[str, Any]]:
    """
    Rule-based Financial Insights Engine.
    Generates dynamic, statistics-driven insights based on calculated data patterns.
    """
    insights = []
    if df.empty:
        return [{
            "id": "no_data",
            "title": "Welcome to Personal Finance Intelligence",
            "description": "Add your first income or expense transaction to unlock automated statistical insights and anomaly detection.",
            "type": "info",
            "category": "Getting Started",
            "metric_badge": "0 Transactions"
        }]

    totals = calculate_totals(df)
    top_cat = highest_expense_category(df)
    mom = month_over_month_change(df)
    anomalies_res = detect_anomalies(df)
    heatmap_res = day_of_week_category_matrix(df)
    cats_dist = category_distribution(df)

    # 1. Savings Rate Insight
    sav_rate = totals["savings_rate"]
    if totals["total_income"] > 0:
        if sav_rate >= 30.0:
            insights.append({
                "id": "savings_strong",
                "title": "Healthy Savings Rate",
                "description": f"You saved {sav_rate:.1f}% (₹{totals['total_savings']:,.2f}) of your total income. This exceeds the healthy 20% benchmark.",
                "type": "success",
                "category": "Savings",
                "metric_badge": f"{sav_rate:.1f}% Savings"
            })
        elif sav_rate >= 10.0:
            insights.append({
                "id": "savings_moderate",
                "title": "Moderate Savings Rate",
                "description": f"You saved {sav_rate:.1f}% (₹{totals['total_savings']:,.2f}) of your total income. Aiming for 20%+ will build your reserve faster.",
                "type": "info",
                "category": "Savings",
                "metric_badge": f"{sav_rate:.1f}% Savings"
            })
        elif sav_rate > 0:
            insights.append({
                "id": "savings_low",
                "title": "Low Savings Rate",
                "description": f"You saved only {sav_rate:.1f}% (₹{totals['total_savings']:,.2f}) of your income. Consider reviewing top discretionary expense categories.",
                "type": "warning",
                "category": "Savings",
                "metric_badge": f"{sav_rate:.1f}% Savings"
            })
        else:
            insights.append({
                "id": "savings_negative",
                "title": "Expenses Exceed Income",
                "description": f"Your expenses exceed your total income by ₹{abs(totals['total_savings']):,.2f}. Review spending to prevent deficit accumulation.",
                "type": "alert",
                "category": "Savings",
                "metric_badge": "Deficit Alert"
            })

    # 2. Month-over-Month Trend Insight
    if mom["has_sufficient_data"]:
        pct = mom["percentage_change"]
        diff = mom["diff_amount"]
        if pct > 10.0:
            insights.append({
                "id": "mom_increase",
                "title": "Monthly Expenses Increased",
                "description": f"Your overall expenses increased by {pct:.1f}% (₹{abs(diff):,.2f}) compared with {mom['previous_month']}.",
                "type": "warning",
                "category": "Trend",
                "metric_badge": f"+{pct:.1f}% Expense"
            })
        elif pct < -10.0:
            insights.append({
                "id": "mom_decrease",
                "title": "Spending Reduced",
                "description": f"Great job! Your monthly spending decreased by {abs(pct):,.1f}% (₹{abs(diff):,.2f}) compared with {mom['previous_month']}.",
                "type": "success",
                "category": "Trend",
                "metric_badge": f"{pct:.1f}% Expense"
            })

    # 3. Highest Expense Category Insight
    if top_cat["category"] != "N/A" and top_cat["percentage"] > 0:
        insights.append({
            "id": "top_category",
            "title": f"{top_cat['category']} is Top Category",
            "description": f"{top_cat['category']} represents {top_cat['percentage']:.1f}% of your total expenses (₹{top_cat['total']:,.2f}).",
            "type": "info",
            "category": "Category",
            "metric_badge": f"{top_cat['percentage']:.1f}% of Total"
        })

    # 4. Anomaly Alert Insight
    anomalies = anomalies_res.get("anomalies", [])
    if anomalies:
        top_anomaly = anomalies[0]
        insights.append({
            "id": f"anomaly_{top_anomaly['id']}",
            "title": f"Unusual {top_anomaly['category']} Expense",
            "description": top_anomaly["reason"],
            "type": "alert" if top_anomaly["severity"] == "High" else "warning",
            "category": "Anomaly",
            "metric_badge": f"₹{top_anomaly['amount']:,.0f} ({top_anomaly['severity']})"
        })

    # 5. Peak Day Insight
    if heatmap_res["peak_day"] != "N/A" and heatmap_res["peak_day_amount"] > 0:
        insights.append({
            "id": "peak_day",
            "title": f"{heatmap_res['peak_day']} is Peak Spending Day",
            "description": f"You spend the highest total amount on {heatmap_res['peak_day']}s (₹{heatmap_res['peak_day_amount']:,.2f} total across recorded transactions).",
            "type": "info",
            "category": "Pattern",
            "metric_badge": f"Peak: {heatmap_res['peak_day']}"
        })

    # 6. Daily Average Expense Insight
    if totals["daily_avg_expense"] > 0:
        insights.append({
            "id": "daily_avg",
            "title": "Daily Expense Rate",
            "description": f"Your average daily spending is ₹{totals['daily_avg_expense']:,.2f} across {totals['unique_expense_days']} active spending days.",
            "type": "info",
            "category": "Rate",
            "metric_badge": f"₹{totals['daily_avg_expense']:,.0f} / day"
        })

    return insights
