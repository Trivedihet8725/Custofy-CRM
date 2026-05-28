import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import api from "../../../utils/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { isValidEmail, isValidPhone } from "../../../utils/validation";

export default function Customers() {
  const { authUser } = useSelector((state) => state.auth);

  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  /* ---------------- Load Customers ---------------- */

  const fetchCustomers = async () => {
    try {
      const resp = await api.get("/customers/");
      setCustomers(resp.data);
    } catch (err) {
      toast.error("Failed to load customers", { toastId: "Failed to load customers" });
    }
  };

  useEffect(() => {
    if (!authUser?.uid) return;
    fetchCustomers();
  }, [authUser]);

  /* ---------------- Handlers ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required", { toastId: "Name and phone are required" });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address", { toastId: "invalid-email" });
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits", { toastId: "invalid-phone" });
      return;
    }

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        toast.success("Customer updated");
      } else {
        await api.post("/customers/", formData);
        toast.success("Customer added");
      }

      fetchCustomers();
      closeForm();
    } catch (err) {
      toast.error("Something went wrong", { toastId: "Something went wrong" });
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;

    try {
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch {
      toast.error("Failed to delete", { toastId: "Failed to delete" });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({ name: "", address: "", phone: "", email: "" });
  };

  /* ---------------- Search Filter ---------------- */

  const filteredCustomers = customers.filter((c) =>
    `${c.name} ${c.phone} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow h-[calc(100vh-8rem)] flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b gap-4">
        <h2 className="text-xl font-semibold">Customers</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCustomers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <p className="text-lg font-medium">No customers found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-left text-gray-600">
                <th>Name</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Address</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="border-b">
                  <td>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.email || "-"}</td>
                  <td>{c.address || "-"}</td>
                  <td className="text-right">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-2 text-indigo-600 cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-red-600 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h3>

            <div className="space-y-4">
              <Input label="Name" name="name" value={formData.name} onChange={handleChange} />
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
              <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={closeForm} className="px-4 py-2 border rounded-lg cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer">
                {editingCustomer ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Input ---------- */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
