# Personal Finance Intelligence System

A production-grade, statistics-driven **Personal Finance Intelligence System** built with Python (FastAPI, Pandas, NumPy, SQLAlchemy, Matplotlib, Seaborn) and React TypeScript (Vite, Tailwind CSS, Recharts, Lucide Icons).

The system records financial transactions, computes category and monthly spending statistics, detects statistical anomalies using NumPy Z-scores, visualizes day-of-week spending heatmaps, generates automated rule-based financial insights, evaluates financial health indicators, and exports structured reports.

---

## Features

- **Financial Statistics & Metrics**: Income, Expenses, Net Savings, Savings Rate (%), Daily Average Expense, NumPy Mean Expense, and Highest Category breakdown.
- **NumPy Z-Score Anomaly Detection**: Detects unusually high expense items (`amount > mean + 2 * std`) using category-specific or dataset-wide statistical baselines with human-readable explanations.
- **Automated Rule-Based Insights**: Generates contextual financial insights and alerts dynamically without relying on external LLM APIs.
- **Day-of-Week Spending Heatmap**: Aggregates spending density (Day of Week vs Category) with color intensity shading via Pandas pivot tables and backend Seaborn image generation.
- **CSV Data Import**: Validates uploaded CSV files (`Date,Category,Amount,Type,Description`) using Pandas before saving data, preventing corrupt record insertion.
- **Financial Health Status**: Evaluates Savings Rate, Expense Ratio, Monthly Spending Trend, and Flagged Anomalies with transparent health badges.
- **Structured Financial Reports & CSV Export**: Provides summary reports by month or custom date range, with downloadable CSV export.

---

## Tech Stack

### Backend
- **Framework**: Python 3.11+, FastAPI, Uvicorn
- **Data Engine**: Pandas, NumPy
- **Visualizations**: Matplotlib, Seaborn
- **Database**: SQLite via SQLAlchemy ORM
- **Testing**: Pytest

### Frontend
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v3 (Dark glassmorphic UI design system)
- **Charts**: Recharts & Custom Heatmap Grid
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## Architecture

```
User
  ↓
React + TypeScript Frontend (Vite)
  ↓ REST API (http://localhost:8000)
FastAPI Backend Services
  ↓
Analytics Engine (Pandas + NumPy)
  ↓
SQLAlchemy ORM
  ↓
SQLite Database (finance.db)
```

---

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Activate on Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run pytest unit tests
python -m pytest tests/test_analytics.py

# Start FastAPI Uvicorn dev server
python -m app.main
# Server runs on http://localhost:8000 (OpenAPI docs at http://localhost:8000/docs)
```

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# Start Vite dev server
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Sample CSV Import Format

Upload a `.csv` file matching this header structure:

```csv
Date,Category,Amount,Type,Description
01-08-2026,Food,450,Expense,Lunch at cafe
02-08-2026,Salary,60000,Income,Monthly Salary
03-08-2026,Travel,900,Expense,Cab fare
04-08-2026,Shopping,2500,Expense,New clothes
```

---

## Core API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | API health check status |
| `GET` | `/api/dashboard/summary` | Aggregate dashboard summary metrics & charts |
| `GET` | `/api/transactions` | Query transactions with filters, search & sorting |
| `POST` | `/api/transactions` | Create a new transaction |
| `PUT` | `/api/transactions/{id}` | Update existing transaction |
| `DELETE` | `/api/transactions/{id}` | Delete transaction |
| `POST` | `/api/transactions/import/preview` | Preview & validate CSV file without saving |
| `POST` | `/api/transactions/import` | Bulk import valid CSV rows |
| `GET` | `/api/analytics/categories` | Category breakdown & frequency analytics |
| `GET` | `/api/analytics/monthly` | Monthly time series & MoM change stats |
| `GET` | `/api/analytics/anomalies` | NumPy Z-score statistical anomaly flags |
| `GET` | `/api/analytics/heatmap` | Day of Week x Category spending matrix |
| `GET` | `/api/analytics/insights` | Rule-based statistical financial insights |
| `GET` | `/api/analytics/health` | Financial health status indicators |
| `GET` | `/api/reports/summary` | Structured financial report payload |
| `GET` | `/api/reports/export-csv` | Download CSV financial report summary |
| `GET` | `/api/reports/heatmap-image` | Render Seaborn statistical heatmap PNG |

---

## Project Folder Structure

```
c:/IT Project/
├── backend/
│   ├── app/
│   │   ├── analytics/
│   │   │   ├── anomaly_detector.py
│   │   │   ├── finance_analyzer.py
│   │   │   ├── health_calculator.py
│   │   │   ├── insight_engine.py
│   │   │   ├── report_generator.py
│   │   │   └── spending_patterns.py
│   │   ├── models/
│   │   │   └── transaction.py
│   │   ├── routes/
│   │   │   ├── analytics.py
│   │   │   ├── dashboard.py
│   │   │   ├── reports.py
│   │   │   └── transactions.py
│   │   ├── schemas/
│   │   │   └── transaction.py
│   │   ├── services/
│   │   │   └── csv_service.py
│   │   ├── utils/
│   │   │   └── seed_data.py
│   │   ├── database.py
│   │   └── main.py
│   ├── tests/
│   │   └── test_analytics.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   └── transactions/
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── MonthlyTrendsPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   └── TransactionsPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── finance.ts
│   │   ├── utils/
│   │   │   └── formatters.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
└── README.md
```
