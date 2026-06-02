import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, customers, items, vendors, bills, invoices, inventory, company, payments_received, payments_made

app = FastAPI(title="CRM API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://custofy-crm.web.app",
    "https://custofy-crm.firebaseapp.com",
    "https://custofy-crm-het.web.app",
    "https://custofy-crm-het.firebaseapp.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(company.router)
app.include_router(customers.router)
app.include_router(items.router)
app.include_router(vendors.router)
app.include_router(bills.router)
app.include_router(invoices.router)
app.include_router(inventory.router)
app.include_router(payments_received.router)
app.include_router(payments_made.router)


@app.get("/")
def root():
    return {"message": "Welcome to the CRM API"}
