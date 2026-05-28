import { useState } from "react";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "₹299",
    period: "/month",
    description: "Perfect for small businesses just getting started.",
    features: [
      "Up to 500 customers",
      "Basic analytics dashboard",
      "Invoice management",
      "Email support",
      "1 user account",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "₹499",
    period: "/month",
    description: "For growing businesses that need more power.",
    features: [
      "Up to 5,000 customers",
      "Advanced analytics & reports",
      "Kanban boards",
      "Inventory management",
      "Priority support",
      "5 user accounts",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₹699",
    period: "/month",
    description: "For large organizations with complex needs.",
    features: [
      "Unlimited customers",
      "Custom reports & dashboards",
      "Advanced automation",
      "Multi-location inventory",
      "24/7 dedicated support",
      "Unlimited users",
      "Custom integrations",
      "SLA guarantee",
    ],
    popular: false,
  },
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const navigate = useNavigate();

  return (
    <section
      id="pricing"
      className="py-20 px-6 md:px-12 bg-gray-50"
    >
      {/* Header */}
      <div className="text-center mb-14">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
          Simple & Transparent Pricing
        </h3>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Choose a plan that fits your business needs. Upgrade or downgrade at
          any time as your business grows.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`
              relative p-8 rounded-2xl bg-white
              border shadow-sm
              flex flex-col
              ${
                plan.popular
                  ? "border-indigo-600 scale-105 shadow-lg"
                  : "border-gray-200"
              }
            `}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <span className="absolute -top-3 right-6 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </span>
            )}

            {/* Plan Info */}
            <h4 className="text-xl font-bold text-gray-900">
              {plan.name}
            </h4>

            <p className="text-gray-600 mt-2 text-sm">
              {plan.description}
            </p>

            <div className="mt-6 flex items-end">
              <span className="text-4xl font-bold text-gray-900">
                {plan.price}
              </span>
              <span className="text-gray-500 ml-1">
                {plan.period}
              </span>
            </div>

            {/* Features */}
            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-gray-700"
                >
                  <Check className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              onClick={() => setSelectedPlan(plan)}
              className={`
                mt-8 inline-flex items-center justify-center
                rounded-xl py-3.5 text-sm font-semibold transition tracking-wide w-full
                ${
                  plan.popular
                    ? "btn-3d text-white"
                    : "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg"
                }
              `}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPlan(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100">
            <button 
              onClick={() => setSelectedPlan(null)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mt-2">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-1">Complete Payment</h3>
              <p className="text-slate-500 mb-6 text-sm">Scan QR to subscribe to {selectedPlan.name}</p>
              
              <div className="bg-white p-4 rounded-3xl mb-6 inline-block border-2 border-indigo-50 shadow-sm relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=hettrivedi2187-1@okicici&pn=Het%20Trivedi&am=${selectedPlan.price.replace('₹', '')}&cu=INR`} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 mx-auto relative z-10 rounded-xl"
                />
              </div>
              
              <div className="bg-indigo-50/80 border border-indigo-100 text-indigo-700 py-3 rounded-2xl font-bold text-xl mb-3 shadow-sm">
                Total Amount: {selectedPlan.price}
              </div>
              <p className="text-xs text-slate-400 mb-8 font-medium tracking-wide">
                UPI ID: hettrivedi2187-1@okicici
              </p>
              
              <button 
                onClick={() => navigate('/registration')}
                className="w-full btn-3d py-4 rounded-2xl text-white font-bold text-lg tracking-wide hover:scale-[1.02] transition-transform"
              >
                I have completed payment
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
