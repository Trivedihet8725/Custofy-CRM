import { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useDispatch } from "react-redux";
import { setUser, googleLogin } from "../store/authSlice";
import { GoogleLogin } from '@react-oauth/google';
import { isValidEmail, isValidPhone } from "../utils/validation";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, email, phone, password, confirmPassword } = formData;

    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("All fields are required", { toastId: "All fields are required" });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address", { toastId: "invalid-email" });
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Phone number must be exactly 10 digits", { toastId: "invalid-phone" });
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match", { toastId: "Passwords do not match" });
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(
        setUser({
          authUser: { uid: user.uid, email: user.email },
          profile: null,
        })
      );

      toast.success("Registration successful");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed, please try again";
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((err) => `${err.loc.join(".")}: ${err.msg}`).join(", ");
        }
      }
      toast.error(errorMessage);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 flex items-center justify-center selection:bg-indigo-500 selection:text-white">
      {/* 3D Animated Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 relative z-10 flex items-center justify-center h-full py-12">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Side: 3D Typography & Floating Elements */}
          <div className="hidden md:flex flex-1 flex-col justify-center animate-float">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-white to-purple-300 drop-shadow-xl mb-6">
              Join <br /> Custofy
            </h1>
            <p className="text-lg text-indigo-100/80 max-w-md font-light leading-relaxed">
              Create your account and unlock the ultimate 3D CRM experience. Transform your business with stunning analytics today.
            </p>
          </div>

          {/* Right Side: 3D Glass Form */}
          <div className="flex-1 w-full max-w-md" style={{ perspective: "1000px" }}>
            <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-[40px] opacity-50"></div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-8 relative z-10 drop-shadow-sm">
                Create Account
              </h2>

              <form onSubmit={handleRegister} className="space-y-4 relative z-10">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />

                <Input
                  label="Email ID"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                />

                <Input
                  label="Contact Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                <Input
                  label="Re-enter Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-white font-semibold text-lg tracking-wide btn-3d"
                  >
                    Register
                  </button>
                </div>
              </form>

              {/* LINKS */}
              <div className="text-center mt-6 relative z-10">
                <div className="flex items-center my-5">
                  <div className="flex-1 border-t border-slate-300/50"></div>
                  <span className="px-3 text-sm text-slate-500 font-medium tracking-wide">Or sign up with</span>
                  <div className="flex-1 border-t border-slate-300/50"></div>
                </div>

                <div className="flex justify-center mb-6 drop-shadow-md hover:scale-105 transition-transform duration-200">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      setLoading(true);
                      dispatch(googleLogin(credentialResponse.credential))
                        .unwrap()
                        .then(() => {
                          toast.success("Google Sign-up successful");
                          navigate("/dashboard");
                        })
                        .catch((err) => {
                          toast.error(err);
                          setLoading(false);
                        });
                    }}
                    onError={() => {
                      toast.error("Google Sign-up Failed");
                    }}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="signup_with"
                  />
                </div>

                <p className="text-slate-600">
                  Already have an account?{" "}
                  <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                    Login
                  </Link>
                </p>

                <div className="pt-4 mt-3 border-t border-slate-200/50">
                  <Link to="/" className="text-slate-500 hover:text-slate-700 text-sm transition-colors font-medium">
                    &larr; Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ------------------ Input ------------------ */

function Input({ label, ...props }) {
  return (
    <div className="group relative">
      <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1 transition-colors group-focus-within:text-indigo-700 drop-shadow-sm">
        {label}
      </label>
      <input
        {...props}
        className="glass-input w-full px-4 py-3 rounded-xl text-slate-800 placeholder-slate-500/70"
      />
    </div>
  );
}
