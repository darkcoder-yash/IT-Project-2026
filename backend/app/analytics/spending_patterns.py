import io
import base64
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, List


DAYS_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def day_of_week_category_matrix(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Aggregate expense spending into a Day of Week x Category matrix using Pandas pivot tables.
    Also identifies peak spending day of week.
    """
    if df.empty:
        return {
            "days": DAYS_ORDER,
            "categories": [],
            "matrix": [],
            "day_totals": {day: 0.0 for day in DAYS_ORDER},
            "peak_day": "N/A",
            "peak_day_amount": 0.0
        }

    expense_df = df[df['type'] == 'Expense'].copy()
    if expense_df.empty:
        return {
            "days": DAYS_ORDER,
            "categories": [],
            "matrix": [],
            "day_totals": {day: 0.0 for day in DAYS_ORDER},
            "peak_day": "N/A",
            "peak_day_amount": 0.0
        }

    expense_df['day_name'] = expense_df['date'].dt.day_name()
    categories = sorted(expense_df['category'].unique().tolist())

    pivot = pd.pivot_table(
        expense_df,
        values='amount',
        index='day_name',
        columns='category',
        aggfunc='sum',
        fill_value=0.0
    )

    pivot = pivot.reindex(DAYS_ORDER, fill_value=0.0)

    # Reindex columns to match categories
    for cat in categories:
        if cat not in pivot.columns:
            pivot[cat] = 0.0
    pivot = pivot[categories]

    # Calculate totals per day
    day_totals = pivot.sum(axis=1).to_dict()
    peak_day = max(day_totals, key=day_totals.get) if day_totals else "N/A"
    peak_day_amount = float(day_totals.get(peak_day, 0.0))

    # Format matrix as list of dicts for frontend grid
    matrix_rows = []
    for day in DAYS_ORDER:
        row_dict = {"day": day, "total": round(float(day_totals.get(day, 0.0)), 2)}
        for cat in categories:
            row_dict[cat] = round(float(pivot.loc[day, cat]), 2)
        matrix_rows.append(row_dict)

    return {
        "days": DAYS_ORDER,
        "categories": categories,
        "matrix": matrix_rows,
        "day_totals": {k: round(v, 2) for k, v in day_totals.items()},
        "peak_day": peak_day,
        "peak_day_amount": round(peak_day_amount, 2)
    }


def generate_seaborn_heatmap_png(df: pd.DataFrame) -> bytes:
    """
    Generate a statistical heatmap PNG image using Seaborn and Matplotlib.
    """
    matrix_data = day_of_week_category_matrix(df)
    categories = matrix_data["categories"]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    if not categories or df.empty:
        ax.text(0.5, 0.5, "No Expense Data Available", ha='center', va='center', fontsize=14)
        ax.axis('off')
    else:
        pivot_df = pd.DataFrame(matrix_data["matrix"]).set_index("day")
        if "total" in pivot_df.columns:
            pivot_df = pivot_df.drop(columns=["total"])

        sns.heatmap(
            pivot_df,
            annot=True,
            fmt=".0f",
            cmap="YlOrRd",
            cbar_kws={'label': 'Spending (₹)'},
            ax=ax,
            linewidths=0.5
        )
        ax.set_title("Spending Heatmap: Day of Week vs Category", fontsize=14, pad=15)
        ax.set_xlabel("Category", fontsize=11)
        ax.set_ylabel("Day of Week", fontsize=11)

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=150)
    plt.close(fig)
    buf.seek(0)
    return buf.getvalue()
