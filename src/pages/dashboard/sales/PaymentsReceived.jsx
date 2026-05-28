import { useEffect, useState } from "react";
import { Plus, X, Trash2, Pencil, Download } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import { useSelector } from "react-redux";

export default function PaymentsReceived() {
  const { authUser } = useSelector((state) => state.auth);
  const { profile: companyProfile } = useSelector((state) => state.company);

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [search, setSearch] = useState("");

  const [paymentData, setPaymentData] = useState({
    invoiceNo: "",
    customer: "",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMode: "Bank Transfer",
    reference: "",
  });

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    if (!authUser) return;

    const fetchAll = async () => {
      try {
        const invSnap = await api.get("/invoices/");
        setInvoices(invSnap.data);

        const paySnap = await api.get("/payments_received/");
        setPayments(paySnap.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data", { toastId: "Failed to load data" });
      }
    };

    fetchAll();
  }, [authUser]);

  /* ---------------- FILTER ---------------- */
  const filteredPayments = payments.filter((payment) => {
    return (
      payment.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
      payment.customer?.toLowerCase().includes(search.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(search.toLowerCase())
    );
  });

  /* ---------------- HANDLERS ---------------- */
  const openNewPayment = () => {
    setEditingPayment(null);
    setPaymentData({
      invoiceNo: "",
      customer: "",
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMode: "Bank Transfer",
      reference: "",
    });
    setShowForm(true);
  };

  const editPayment = (payment) => {
    setEditingPayment(payment);
    setPaymentData({
      invoiceNo: payment.invoiceNo,
      customer: payment.customer,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMode: payment.paymentMode,
      reference: payment.reference || "",
    });
    setShowForm(true);
  };

  const deletePayment = async (payment) => {
    if (!window.confirm("Delete this payment record?")) return;

    try {
      await api.delete(`/payments_received/${payment.id}`);
      setPayments((prev) => prev.filter((p) => p.id !== payment.id));
      toast.success("Payment deleted");
    } catch {
      toast.error("Failed to delete payment", { toastId: "Failed to delete payment" });
    }
  };

  const handleInvoiceSelect = (e) => {
    const selectedInvoiceNo = e.target.value;
    const inv = invoices.find(i => i.invoiceNo === selectedInvoiceNo);
    if(inv) {
      setPaymentData({
        ...paymentData,
        invoiceNo: inv.invoiceNo,
        customer: inv.customer,
        amount: inv.total
      });
    } else {
      setPaymentData({
        ...paymentData,
        invoiceNo: "",
        customer: "",
        amount: 0
      });
    }
  };

  /* ---------------- SAVE PAYMENT ---------------- */
  const savePayment = async () => {
    if (!paymentData.invoiceNo || !paymentData.amount) {
      toast.error("Invoice number and amount are required!", { toastId: "Invoice number and amount are required!" });
      return;
    }

    if (paymentData.amount <= 0) {
      toast.error("Amount must be greater than 0", { toastId: "invalid-amount" });
      return;
    }

    try {
      const payload = { ...paymentData };
      let paymentId;

      if (editingPayment) {
        await api.put(`/payments_received/${editingPayment.id}`, payload);
        paymentId = editingPayment.id;
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId ? { ...payload, id: paymentId } : p
          )
        );
        toast.success("Payment updated");
      } else {
        const docRef = await api.post("/payments_received/", payload);
        paymentId = docRef.data.id;
        setPayments((prev) => [...prev, { ...payload, id: paymentId }]);
        toast.success("Payment recorded");
      }

      setShowForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save payment", { toastId: "Failed to save payment" });
    }
  };

  /* ---------------- PDF EXPORT ---------------- */
  const exportReceiptPDF = (pay) => {
    if (!companyProfile) {
      toast.error("Company profile not found", { toastId: "Company profile not found" });
      return;
    }

    const doc = new jsPDF();
    doc.text("PAYMENT RECEIPT", 105, 10, { align: "center" });
    doc.setFontSize(14);
    doc.text(companyProfile.name, 14, 15);
    doc.setFontSize(10);
    doc.text(companyProfile.address, 14, 22);
    doc.text(`Phone: ${companyProfile.phone}`, 14, 28);
    doc.text(`Email: ${companyProfile.email}`, 14, 34);

    doc.line(14, 38, 195, 38);

    doc.setFontSize(11);
    doc.text(`Receipt Date: ${pay.paymentDate}`, 14, 50);
    doc.text(`Received From: ${pay.customer}`, 14, 58);
    doc.text(`For Invoice: ${pay.invoiceNo}`, 14, 66);
    doc.text(`Payment Mode: ${pay.paymentMode}`, 14, 74);
    if(pay.reference) {
      doc.text(`Reference: ${pay.reference}`, 14, 82);
    }

    doc.setFontSize(14);
    doc.text(`Amount Received: ₹${pay.amount}`, 14, pay.reference ? 96 : 88);

    doc.setFontSize(9);
    doc.text(
      "This is a digitally generated receipt. Signature not required.",
      105,
      120,
      { align: "center" }
    );

    doc.save(`Receipt_${pay.invoiceNo}.pdf`);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white rounded-xl shadow h-[calc(100vh-8rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between px-6 py-4 border-b">
        <h2 className="text-xl font-semibold">Payments Received</h2>
        <button
          onClick={openNewPayment}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex gap-2 transition"
        >
          <Plus size={18} /> Record Payment
        </button>
      </div>

      {/* SEARCH */}
      <div className="p-6 flex gap-3">
        <input
          placeholder="Search customer, invoice, or reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full max-w-md"
        />
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto px-6">
        <table className="min-w-full text-sm">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="text-left">Invoice No</th>
              <th className="text-left">Customer</th>
              <th className="text-left">Mode</th>
              <th className="text-left">Amount</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((pay) => (
              <tr key={pay.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{pay.paymentDate}</td>
                <td className="font-medium text-indigo-600">{pay.invoiceNo}</td>
                <td>{pay.customer}</td>
                <td>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                    {pay.paymentMode}
                  </span>
                </td>
                <td className="font-bold">₹{pay.amount}</td>
                <td className="text-right space-x-3">
                  <button onClick={() => exportReceiptPDF(pay)} title="Download Receipt">
                     <Download size={16} className="text-slate-600 hover:text-indigo-600" />
                  </button>
                  <button onClick={() => editPayment(pay)}>
                    <Pencil size={16} className="text-slate-600 hover:text-emerald-600" />
                  </button>
                  <button onClick={() => deletePayment(pay)}>
                    <Trash2 size={16} className="text-slate-600 hover:text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingPayment ? "Edit Payment" : "Record Payment"}
              </h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setShowForm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invoice</label>
                <select
                  value={paymentData.invoiceNo}
                  onChange={handleInvoiceSelect}
                  className="w-full border border-slate-300 px-3 py-2 rounded-lg bg-slate-50"
                  disabled={editingPayment !== null}
                >
                  <option value="">Select Invoice</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNo}>
                      {inv.invoiceNo} - {inv.customer} (Total: ₹{inv.total})
                    </option>
                  ))}
                  {/* Fallback if editing an invoice that doesn't exist anymore */}
                  {editingPayment && !invoices.find(i => i.invoiceNo === paymentData.invoiceNo) && (
                    <option value={paymentData.invoiceNo}>{paymentData.invoiceNo}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentData.paymentMode}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference No.</label>
                  <input
                    placeholder="Txn ID or Cheque No"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                    className="w-full border border-slate-300 px-3 py-2 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={savePayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition shadow-sm"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}