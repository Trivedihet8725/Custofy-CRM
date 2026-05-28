import { useEffect, useState } from "react";
import api from "../../utils/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import KpiCard from "../../components/dashboard/KpiCard";
import SalesPurchaseChart from "../../components/chart/SalesPurchaseChart";
import MonthlyRevenueChart from "../../components/chart/MonthlyRevenueChart";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  IndianRupee,
} from "lucide-react";

export default function Dashboard() {
  const { authUser } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);

  const [kpis, setKpis] = useState({
    totalSales: 0,
    totalPurchase: 0,
    totalItems: 0,
    lowStock: 0,
  });

  useEffect(() => {
    if (!authUser?.uid) return;

    const fetchDashboardData = async () => {
      setLoading(true);

      /* ---------------- TOTAL SALES ---------------- */
      let totalSales = 0;
      let totalPurchase = 0;
      let totalItems = 0;
      let lowStock = 0;

      try {
        const [salesSnap, purchaseSnap, itemsSnap, inventorySnap] = await Promise.all([
          api.get("/invoices/"),
          api.get("/bills/"),
          api.get("/items/"),
          api.get("/inventory/"),
        ]);

        totalSales = salesSnap.data
          .filter(d => d.status === "Saved")
          .reduce((sum, d) => sum + (d.total || 0), 0);
          
        totalPurchase = purchaseSnap.data.reduce(
          (sum, d) => sum + (d.total || 0),
          0
        );

        totalItems = itemsSnap.data.length;

        lowStock = inventorySnap.data.filter(
          (d) => (d.quantity || 0) <= 5
        ).length;
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }

      setKpis({
        totalSales,
        totalPurchase,
        totalItems,
        lowStock,
      });

      setLoading(false);
    };

    fetchDashboardData();
  }, [authUser]);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Link to="/dashboard/sales/invoices" className="block focus:outline-none">
          <KpiCard
            title="Total Sales"
            value={`₹${kpis.totalSales.toLocaleString()}`}
            subtitle="Paid invoices"
            icon={IndianRupee}
          />
        </Link>

        <Link to="/dashboard/purchases/bills" className="block focus:outline-none">
          <KpiCard
            title="Total Purchase"
            value={`₹${kpis.totalPurchase.toLocaleString()}`}
            subtitle="Bills amount"
            icon={ShoppingCart}
          />
        </Link>

        <Link to="/dashboard/items" className="block focus:outline-none">
          <KpiCard
            title="Total Items"
            value={kpis.totalItems}
            subtitle="Active products"
            icon={TrendingUp}
          />
        </Link>

        <Link to="/dashboard/inventory" className="block focus:outline-none">
          <KpiCard
            title="Low Stock"
            value={kpis.lowStock}
            subtitle="Qty ≤ 5"
            icon={Package}
          />
        </Link>
      </div>

      {/* PLACEHOLDERS FOR NEXT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesPurchaseChart/>

        <MonthlyRevenueChart />
      </div>

     

     
    </div>
  );
}
