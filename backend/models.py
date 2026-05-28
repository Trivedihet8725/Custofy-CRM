from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    name: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    credential: str

class UserInDB(BaseModel):
    id: str
    email: EmailStr
    hashed_password: str
    name: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None

class CustomerBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: str
    ownerId: str
    createdAt: datetime

# --- Items ---
class ItemBase(BaseModel):
    name: str
    unit: str

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None

class ItemResponse(ItemBase):
    id: str
    ownerId: str
    createdAt: datetime

# --- Vendors ---
class VendorBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None

class VendorCreate(VendorBase):
    pass

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class VendorResponse(VendorBase):
    id: str
    ownerId: str
    createdAt: datetime

# --- Shared for Bills & Invoices ---
class LineItem(BaseModel):
    item: str # matching item name
    qty: float
    rate: float

# --- Bills ---
class BillBase(BaseModel):
    vendor: str
    billNo: str
    date: str
    items: List[LineItem]
    total: float

class BillCreate(BillBase):
    pass

class BillUpdate(BaseModel):
    vendor: Optional[str] = None
    billNo: Optional[str] = None
    date: Optional[str] = None
    items: Optional[List[LineItem]] = None
    total: Optional[float] = None

class BillResponse(BillBase):
    id: str
    ownerId: str
    createdAt: datetime

# --- Invoices ---
class InvoiceBase(BaseModel):
    customer: str
    invoiceNo: str
    date: str
    items: List[LineItem]
    total: float
    status: str

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    customer: Optional[str] = None
    invoiceNo: Optional[str] = None
    date: Optional[str] = None
    items: Optional[List[LineItem]] = None
    total: Optional[float] = None
    status: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: str
    ownerId: str
    createdAt: datetime

# --- Company ---
class CompanyProfileBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str

class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class CompanyProfileResponse(CompanyProfileBase):
    id: str
    ownerId: str
    updatedAt: datetime
    
# --- Inventory Ledger ---
class InventoryLedgerEntry(BaseModel):
    itemId: str
    itemName: str
    unit: str
    change: float
    reason: str
    refId: str
    
class InventoryLedgerCreate(InventoryLedgerEntry):
    pass
    
class InventoryLedgerResponse(InventoryLedgerEntry):
    id: str
    ownerId: str
    createdAt: datetime

# --- Payments Received (Sales) ---
class PaymentReceivedBase(BaseModel):
    invoiceNo: str
    customer: str
    amount: float
    paymentDate: str
    paymentMode: str
    reference: Optional[str] = None

class PaymentReceivedCreate(PaymentReceivedBase):
    pass

class PaymentReceivedUpdate(BaseModel):
    invoiceNo: Optional[str] = None
    customer: Optional[str] = None
    amount: Optional[float] = None
    paymentDate: Optional[str] = None
    paymentMode: Optional[str] = None
    reference: Optional[str] = None

class PaymentReceivedResponse(PaymentReceivedBase):
    id: str
    ownerId: str
    createdAt: datetime

# --- Payments Made (Purchases) ---
class PaymentMadeBase(BaseModel):
    billNo: str
    vendor: str
    amount: float
    paymentDate: str
    paymentMode: str
    reference: Optional[str] = None

class PaymentMadeCreate(PaymentMadeBase):
    pass

class PaymentMadeUpdate(BaseModel):
    billNo: Optional[str] = None
    vendor: Optional[str] = None
    amount: Optional[float] = None
    paymentDate: Optional[str] = None
    paymentMode: Optional[str] = None
    reference: Optional[str] = None

class PaymentMadeResponse(PaymentMadeBase):
    id: str
    ownerId: str
    createdAt: datetime
