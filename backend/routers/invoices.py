from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from motor.core import AgnosticDatabase
from bson import ObjectId

from models import InvoiceCreate, InvoiceUpdate, InvoiceResponse
from database import get_database
from routers.auth import get_current_user, UserInDB

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

@router.post("/", response_model=InvoiceResponse)
async def create_invoice(
    invoice: InvoiceCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    invoice_dict = invoice.dict()
    invoice_dict["ownerId"] = current_user.id
    invoice_dict["createdAt"] = datetime.utcnow()
    
    result = await db.invoices.insert_one(invoice_dict)
    return {**invoice_dict, "id": str(result.inserted_id)}

@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices(
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    cursor = db.invoices.find({"ownerId": current_user.id})
    invoices = await cursor.to_list(length=1000)
    for c in invoices:
        c["id"] = str(c["_id"])
    return invoices

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: str,
    invoice: InvoiceUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(invoice_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID")
        
    existing = await db.invoices.find_one({"_id": obj_id, "ownerId": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    update_data = {k: v for k, v in invoice.dict(exclude_unset=True).items() if v is not None}
    if update_data:
        await db.invoices.update_one({"_id": obj_id}, {"$set": update_data})
        
    updated = await db.invoices.find_one({"_id": obj_id})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    db: AgnosticDatabase = get_database()
    try:
        obj_id = ObjectId(invoice_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Invoice ID")
        
    result = await db.invoices.delete_one({"_id": obj_id, "ownerId": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    return {"status": "success"}
