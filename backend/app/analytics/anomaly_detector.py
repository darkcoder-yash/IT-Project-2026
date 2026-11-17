import numpy as np
import pandas as pd
from typing import List, Dict, Any


def detect_anomalies(df: pd.DataFrame, threshold_z: float = 2.0) -> Dict[str, Any]:
    """
    Statistical Anomaly Detection using NumPy.
    Detects unusually large expenses based on Z-score (amount > mean + z * std).
    Prefers category-specific baselines when N >= 3 data points exist.
    """
    if df.empty:
        return {
            "status": "Insufficient Data",
            "message": "No transactions available for analysis.",
            "total_expenses_analyzed": 0,
            "anomalies_detected": 0,
            "anomalies": []
        }

    expense_df = df[df['type'] == 'Expense'].copy()
    if len(expense_df) < 3:
        return {
            "status": "Insufficient Data",
            "message": "At least 3 expense transactions are required to perform statistical anomaly detection.",
            "total_expenses_analyzed": len(expense_df),
            "anomalies_detected": 0,
            "anomalies": []
        }

    global_amounts = expense_df['amount'].to_numpy(dtype=float)
    global_mean = float(np.mean(global_amounts))
    global_std = float(np.std(global_amounts))

    anomalies = []

    for idx, row in expense_df.iterrows():
        tx_id = int(row['id'])
        cat = str(row['category'])
        amount = float(row['amount'])
        tx_date = row['date'].strftime('%Y-%m-%d')
        description = str(row['description']) if row['description'] else ""

        # Category-specific subset excluding current transaction for baseline calculation
        cat_subset = expense_df[(expense_df['category'] == cat) & (expense_df['id'] != tx_id)]
        
        if len(cat_subset) >= 2:
            cat_amounts = cat_subset['amount'].to_numpy(dtype=float)
            baseline_mean = float(np.mean(cat_amounts))
            cat_std = float(np.std(cat_amounts))
            baseline_std = cat_std if cat_std > 0 else global_std
            analysis_type = "Category Baseline"
        else:
            baseline_mean = global_mean
            baseline_std = global_std
            analysis_type = "Overall Baseline"

        if baseline_std > 0:
            z_score = (amount - baseline_mean) / baseline_std
        else:
            z_score = 0.0

        if z_score >= threshold_z:
            deviation_pct = ((amount - baseline_mean) / baseline_mean * 100.0) if baseline_mean > 0 else 0.0
            
            if z_score > 3.0:
                severity = "High"
            else:
                severity = "Moderate"

            if analysis_type == "Category Baseline":
                reason = (f"₹{amount:,.2f} is significantly higher than your normal {cat} spending "
                          f"average of ₹{baseline_mean:,.2f} (Z-score: {z_score:.2f}).")
            else:
                reason = (f"₹{amount:,.2f} is significantly higher than your overall spending "
                          f"average of ₹{baseline_mean:,.2f} (Z-score: {z_score:.2f}).")

            anomalies.append({
                "id": tx_id,
                "date": tx_date,
                "category": cat,
                "amount": round(amount, 2),
                "description": description,
                "baseline_mean": round(baseline_mean, 2),
                "baseline_std": round(baseline_std, 2),
                "z_score": round(float(z_score), 2),
                "deviation_percentage": round(float(deviation_pct), 2),
                "severity": severity,
                "reason": reason,
                "analysis_type": analysis_type
            })

    anomalies.sort(key=lambda x: x['z_score'], reverse=True)

    return {
        "status": "Success" if anomalies else "No Anomalies",
        "message": f"Found {len(anomalies)} unusual expense(s)." if anomalies else "No unusual expenses detected.",
        "total_expenses_analyzed": len(expense_df),
        "anomalies_detected": len(anomalies),
        "anomalies": anomalies
    }
