from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.database import engine, Base, SessionLocal
from app.routes.transactions import router as transactions_router
from app.routes.analytics import router as analytics_router
from app.routes.dashboard import router as dashboard_router
from app.routes.reports import router as reports_router
from app.utils.seed_data import seed_database_if_empty

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial data if DB is empty
db = SessionLocal()
try:
    seed_database_if_empty(db)
finally:
    db.close()

app = FastAPI(
    title="Personal Finance Intelligence System API",
    description="Backend API powered by FastAPI, Pandas, NumPy, and SQLAlchemy for statistical financial analytics and anomaly detection.",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard_router)
app.include_router(transactions_router)
app.include_router(analytics_router)
app.include_router(reports_router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Personal Finance Intelligence System API",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
