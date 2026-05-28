import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  Briefcase
} from "lucide-react";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const KPI_CARD = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-800">
        ₹{value.toLocaleString()}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-2 text-sm font-medium">
          {trend > 0 ? (
            <span className="text-emerald-500 flex items-center">
              <TrendingUp size={16} className="mr-1" /> +{trend}%
            </span>
          ) : (
            <span className="text-rose-500 flex items-center">
              <TrendingDown size={16} className="mr-1" /> {trend}%
            </span>
          )}
          <span className="text-slate-400 font-normal">from last month</span>
        </div>
      )}
    </div>
  </div>
);

export default function Reports() {
  const { authUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  // KPIs
  const [kpis, setKpis] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    cashFlowBalance: 0,
  });

  // Chart Data
  const [revenueExpenseData, setRevenueExpenseData] = useState([]);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [invoiceStatusData, setInvoiceStatusData] = useState([]);

  useEffect(() => {
    if (!authUser?.uid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          invoicesRes,
          billsRes,
          paymentsReceivedRes,
          paymentsMadeRes,
        ] = await Promise.all([
          api.get("/invoices/"),
          api.get("/bills/"),
          api.get("/payments_received/"),
          api.get("/payments_made/"),
        ]);

        const invoices = invoicesRes.data || [];
        const bills = billsRes.data || [];
        const paymentsReceived = paymentsReceivedRes.data || [];
        const paymentsMade = paymentsMadeRes.data || [];

        // 1. KPI Calculations
        const totalSales = invoices
          .filter((inv) => inv.status === "Saved")
          .reduce((sum, inv) => sum + (inv.total || 0), 0);

        const totalExpenses = bills.reduce(
          (sum, bill) => sum + (bill.total || 0),
          0
        );

        const totalPaymentsReceived = paymentsReceived.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        );
        const totalPaymentsMade = paymentsMade.reduce(
          (sum, p) => sum + (p.amount || 0),
          0
        );

        setKpis({
          totalSales,
          totalExpenses,
          netProfit: totalSales - totalExpenses,
          cashFlowBalance: totalPaymentsReceived - totalPaymentsMade,
        });

        // 2. Revenue vs Expenses Chart Data (Monthly)
        const monthlyMap = {};
        const processDate = (dateString, amount, type) => {
          if (!dateString) return;
          const date = new Date(dateString);
          if (isNaN(date)) return;
          const month = date.toLocaleString("default", { month: "short" });
          if (!monthlyMap[month]) {
            monthlyMap[month] = { month, Revenue: 0, Expenses: 0, Inflow: 0, Outflow: 0 };
          }
          monthlyMap[month][type] += amount || 0;
        };

        invoices
          .filter((inv) => inv.status === "Saved")
          .forEach((inv) => processDate(inv.createdAt, inv.total, "Revenue"));
        bills.forEach((bill) => processDate(bill.createdAt, bill.total, "Expenses"));

        paymentsReceived.forEach((p) => processDate(p.paymentDate, p.amount, "Inflow"));
        paymentsMade.forEach((p) => processDate(p.paymentDate, p.amount, "Outflow"));

        const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyArray = Object.values(monthlyMap).sort((a, b) => {
          return monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month);
        });

        setRevenueExpenseData(monthlyArray);
        
        // Use same data for Cash Flow
        setCashFlowData(monthlyArray);

        // 3. Invoice Status Pie Chart
        let draftCount = 0;
        let savedCount = 0;
        invoices.forEach((inv) => {
          if (inv.status === "Draft") draftCount++;
          if (inv.status === "Saved") savedCount++;
        });

        setInvoiceStatusData([
          { name: "Saved (Finalized)", value: savedCount },
          { name: "Draft", value: draftCount },
        ]);

      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authUser?.uid]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 bg-slate-50 min-h-screen select-none cursor-default">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial Reports</h1>
        <p className="text-slate-500">
          Analyze your business performance and financial health.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI_CARD
          title="Total Revenue"
          value={kpis.totalSales}
          icon={Activity}
          color="bg-indigo-100 text-indigo-600"
        />
        <KPI_CARD
          title="Total Expenses"
          value={kpis.totalExpenses}
          icon={Briefcase}
          color="bg-rose-100 text-rose-600"
        />
        <KPI_CARD
          title="Net Profit"
          value={kpis.netProfit}
          icon={PieChartIcon}
          color="bg-emerald-100 text-emerald-600"
        />
        <KPI_CARD
          title="Cash Flow Balance"
          value={kpis.cashFlowBalance}
          icon={DollarSign}
          color="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Revenue vs Expenses</h2>
            <p className="text-sm text-slate-500">Monthly breakdown of your financial performance</p>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueExpenseData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                <Bar dataKey="Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Invoice Status</h2>
            <p className="text-sm text-slate-500">Ratio of Draft vs Saved invoices</p>
          </div>
          <div className="h-80 flex flex-col items-center justify-center">
            {invoiceStatusData.length > 0 && invoiceStatusData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value} Invoices`}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend iconType="circle" verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <PieChartIcon size={48} className="mb-2 opacity-50" />
                <p>No invoice data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section 2 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">Cash Flow Trends</h2>
          <p className="text-sm text-slate-500">Payments received vs payments made over time</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
              <Area type="monotone" dataKey="Inflow" name="Payments Received" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" activeDot={{r: 8, strokeWidth: 0, fill: '#10b981'}} />
              <Area type="monotone" dataKey="Outflow" name="Payments Made" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" activeDot={{r: 8, strokeWidth: 0, fill: '#f59e0b'}} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}