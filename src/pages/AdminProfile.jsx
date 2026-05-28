import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import api from "../utils/api";
import { setUser } from "../store/authSlice";
import { isValidEmail, isValidPhone } from "../utils/validation";

export default function AdminProfile() {
  const { authUser } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formData, setFormData] = useState(profile);

  const dispatch = useDispatch();

  // --- Local Profile Photo State ---
  const [profilePhoto, setProfilePhoto] = useState(localStorage.getItem("adminProfilePhoto") || null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        localStorage.setItem("adminProfilePhoto", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {
    if (!authUser?.uid) return;

    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile/admin");
        const data = response.data;
        
        setProfile({
          name: data.name || "",
          email: data.email || authUser.email,
          phone: data.phone || "",
        });
        setFormData({
          name: data.name || "",
          email: data.email || authUser.email,
          phone: data.phone || "",
        });
      } catch (error) {
        console.error(error);
        if (error.response?.status !== 404) {
          toast.error("Failed to load profile", { toastId: "profile-error" });
        } else {
            // First time logic if missing data (handled by backend mostly on register, but just in case)
          setProfile({
            name: authUser.displayName || "",
            email: authUser.email,
            phone: "",
          });
          setFormData({
            name: authUser.displayName || "",
            email: authUser.email,
            phone: "",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("All fields are required", { toastId: "All fields are required" });
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
      await api.post("/profile/admin", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      // Optionally refresh user auth session data in Redux/Storage if display name changed
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.displayName = formData.name;
        user.email = formData.email;
        localStorage.setItem("user", JSON.stringify(user));
        dispatch(
          setUser({
            authUser: { uid: user.uid, email: user.email, displayName: user.displayName },
            profile: null,
          })
        );
      }

      setProfile(formData);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile", { toastId: "Failed to update profile" });
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow h-[calc(100vh-8rem)] p-6 max-w-3xl overflow-y-auto">
      
      {/* PROFILE PHOTO COMPONENT */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-32 h-32 relative mb-5">
          <div className="w-full h-full rounded-full shadow-lg overflow-hidden border-4 border-white bg-slate-100 flex items-center justify-center select-none">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover pointer-events-none" />
            ) : (
              <span className="text-slate-400 text-sm font-medium pointer-events-none text-center leading-tight">No Photo</span>
            )}
          </div>
        </div>

        {/* Action */}
        <label className="bg-white border shadow-sm px-5 py-2.5 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition tracking-wide">
          Upload Photo
          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </label>
      </div>

      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Admin Profile
        </h2>
        <p className="text-sm text-gray-500">
          Manage your personal information
        </p>
      </div>

      {/* FORM */}
      <div className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={!editing}
        />

        <Input
          label="Email ID"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!editing}
        />

        <Input
          label="Contact Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={!editing}
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3 mt-8">
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------ Reusable Input ------------------ */

function Input({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        {...props}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg
        focus:outline-none focus:ring-2 focus:ring-indigo-500
        ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
