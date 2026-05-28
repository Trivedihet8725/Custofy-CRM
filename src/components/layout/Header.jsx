import { useSelector,useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { logoutUser } from "../../store/authSlice";

export default function Header() {
const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, authUser } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const userName = profile?.name || authUser?.name || authUser?.email?.split('@')[0] || "User";

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b bg-white">
      <span className="text-lg font-bold text-gray-800 select-none cursor-default tracking-wide drop-shadow-sm">
        Welcome, <span className="text-indigo-600">{userName}</span>
      </span>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-600"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
