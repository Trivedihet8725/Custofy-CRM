import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser, googleLogin } from "../store/authSlice";
import { isValidEmail } from "../utils/validation";
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🔥 Redux auth state (source of truth)
  const { authUser, loading: authLoading } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  /* ---------------- Redirect after auth ready ---------------- */

  useEffect(() => {
    if (authUser && !authLoading) {
      navigate("/dashboard");
    }
  }, [authUser, authLoading, navigate]);

  /* ---------------- Handlers ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please enter email and password", { toastId: "Please enter email and password" });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address", { toastId: "invalid-email" });
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
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

      toast.success("Login successful");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
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
              Welcome to <br /> Custofy
            </h1>
            <p className="text-lg text-indigo-100/80 max-w-md font-light leading-relaxed">
              Experience the future of customer relationship management. Deep insights, stunning analytics, and a beautiful 3D interface.
            </p>
          </div>

          {/* Right Side: 3D Glass Form */}
          <div className="flex-1 w-full max-w-md" style={{ perspective: "1000px" }}>
            <div className="glass-panel rounded-3xl p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-[40px] opacity-50"></div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-8 relative z-10 drop-shadow-sm">
                Sign In
              </h2>

              <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                <Input
                  label="Email ID"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || authLoading}
                    className={`w-full py-3.5 rounded-xl text-white font-semibold text-lg tracking-wide 
                    ${
                      loading || authLoading
                        ? "bg-indigo-400/50 cursor-not-allowed"
                        : "btn-3d"
                    }`}
                  >
                    {loading || authLoading ? "Authenticating..." : "Enter Workspace"}
                  </button>
                </div>
              </form>

              {/* LINKS */}
              <div className="text-center mt-6 relative z-10">
                <div className="flex items-center my-5">
                  <div className="flex-1 border-t border-slate-300/50"></div>
                  <span className="px-3 text-sm text-slate-500 font-medium tracking-wide">Or continue with</span>
                  <div className="flex-1 border-t border-slate-300/50"></div>
                </div>

                <div className="flex justify-center mb-6 drop-shadow-md hover:scale-105 transition-transform duration-200">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      setLoading(true);
                      dispatch(googleLogin(credentialResponse.credential))
                        .unwrap()
                        .then(() => {
                          toast.success("Google Login successful");
                          navigate("/dashboard");
                        })
                        .catch((err) => {
                          toast.error(err);
                          setLoading(false);
                        });
                    }}
                    onError={() => {
                      toast.error("Google Login Failed");
                    }}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="continue_with"
                  />
                </div>

                <Link
                  to="/forgotpassword"
                  className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors block mb-2"
                >
                  Forgot password?
                </Link>

                <p className="text-slate-600">
                  New here?{" "}
                  <Link to="/registration" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                    Create an account
                  </Link>
                </p>

                <div className="pt-5 mt-3 border-t border-slate-200/50">
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

/* ------------------ Reusable Input ------------------ */

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
