import pandas as pd
from typing import Dict, Any, List
from app.analytics.finance_analyzer import calculate_totals, month_over_month_change
from app.analytics.anomaly_detector import detect_anomalies


def calculate_financial_health(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate Financial Health Indicators with neutral status labels.
    """
    if df.empty:
        return {
            "overall_status": "Neutral",
            "score": 0,
            "indicators": []
        }

    totals = calculate_totals(df)
    mom = month_over_month_change(df)
    anomalies_res = detect_anomalies(df)

    indicators = []
    score_points = 0
    max_points = 4

    # 1. Savings Rate Indicator
    sav_rate = totals["savings_rate"]
    if sav_rate >= 20.0:
        sav_status = "Healthy"
        sav_color = "success"
        score_points += 1
        sav_detail = f"{sav_rate:.1f}% of income saved (Benchmark: 20%+)"
    elif sav_rate >= 10.0:
        sav_status = "Moderate"
        sav_color = "warning"
        score_points += 0.5
        sav_detail = f"{sav_rate:.1f}% of income saved (Benchmark: 20%+)"
    else:
        sav_status = "Needs Attention"
        sav_color = "danger"
        sav_detail = f"{sav_rate:.1f}% of income saved (Below target)"

    indicators.append({
        "key": "savings_rate",
        "label": "Savings Rate",
        "value": f"{sav_rate:.1f}%",
        "status": sav_status,
        "badge_type": sav_color,
        "detail": sav_detail
    })

    # 2. Expense-to-Income Ratio Indicator
    income = totals["total_income"]
    expense = totals["total_expense"]
    if income > 0:
        exp_ratio = (expense / income) * 100.0
        if exp_ratio <= 70.0:
            exp_status = "Healthy"
            exp_color = "success"
            score_points += 1
            exp_detail = f"{exp_ratio:.1f}% of income spent (Healthy boundary: <=70%)"
        elif exp_ratio <= 85.0:
            exp_status = "Moderate"
            exp_color = "warning"
            score_points += 0.5
            exp_detail = f"{exp_ratio:.1f}% of income spent (Moderate boundary)"
        else:
            exp_status = "Needs Attention"
            exp_color = "danger"
            exp_detail = f"{exp_ratio:.1f}% of income spent (High expense ratio)"
    else:
        exp_ratio = 100.0 if expense > 0 else 0.0
        exp_status = "Needs Attention" if expense > 0 else "Neutral"
        exp_color = "danger" if expense > 0 else "info"
        exp_detail = "No income recorded for ratio comparison"

    indicators.append({
        "key": "expense_ratio",
        "label": "Expense-to-Income Ratio",
        "value": f"{exp_ratio:.1f}%" if income > 0 else "N/A",
        "status": exp_status,
        "badge_type": exp_color,
        "detail": exp_detail
    })

    # 3. Spending Trend Indicator
    if mom["has_sufficient_data"]:
        pct = mom["percentage_change"]
        if pct <= 5.0:
            trend_status = "Healthy"
            trend_color = "success"
            score_points += 1
            trend_detail = f"{pct:+.1f}% change vs {mom['previous_month']} (Controlled)"
        elif pct <= 20.0:
            trend_status = "Moderate"
            trend_color = "warning"
            score_points += 0.5
            trend_detail = f"{pct:+.1f}% change vs {mom['previous_month']} (Moderate growth)"
        else:
            trend_status = "Needs Attention"
            trend_color = "danger"
            trend_detail = f"{pct:+.1f}% increase vs {mom['previous_month']} (Significant surge)"
    else:
        pct = 0.0
        trend_status = "Neutral"
        trend_color = "info"
        score_points += 0.5
        trend_detail = "Insufficient multi-month data"

    indicators.append({
        "key": "spending_trend",
        "label": "Monthly Expense Change",
        "value": f"{pct:+.1f}%" if mom["has_sufficient_data"] else "N/A",
        "status": trend_status,
        "badge_type": trend_color,
        "detail": trend_detail
    })

    # 4. Unusual Expense Count Indicator
    anomalies_count = anomalies_res.get("anomalies_detected", 0)
    if anomalies_count == 0:
        anom_status = "Healthy"
        anom_color = "success"
        score_points += 1
        anom_detail = "No statistical expense anomalies detected"
    elif anomalies_count <= 2:
        anom_status = "Moderate"
        anom_color = "warning"
        score_points += 0.5
        anom_detail = f"{anomalies_count} unusual transaction(s) flagged"
    else:
        anom_status = "Needs Attention"
        anom_color = "danger"
        anom_detail = f"{anomalies_count} unusual transactions flagged"

    indicators.append({
        "key": "unusual_expenses",
        "label": "Unusual Expenses Flagged",
        "value": str(anomalies_count),
        "status": anom_status,
        "badge_type": anom_color,
        "detail": anom_detail
    })

    # Overall Status Calculation
    health_percentage = (score_points / max_points) * 100.0
    if health_percentage >= 75.0:
        overall_status = "Healthy"
    elif health_percentage >= 50.0:
        overall_status = "Moderate"
    else:
        overall_status = "Needs Attention"

    return {
        "overall_status": overall_status,
        "health_score": round(health_percentage, 1),
        "indicators": indicators
    }
