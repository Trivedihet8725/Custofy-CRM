import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";
import { fetchCompanyProfile } from "./companySlice";

/* ---------------- THUNK ---------------- */

export const listenToAuthChanges = createAsyncThunk(
  "auth/listen",
  async (_, { dispatch }) => {
    return new Promise((resolve) => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch(
          setUser({
            authUser: {
              uid: user.uid,
              email: user.email,
            },
            profile: null,
          })
        );
        // Load company profile so it persists on page refresh
        dispatch(fetchCompanyProfile());
      } else {
        dispatch(logout());
      }
      resolve();
    });
  }
);

/* ---------------- GOOGLE LOGIN THUNK ---------------- */

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credential, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post("/auth/google", { credential });
      const { access_token, user } = response.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(
        setUser({
          authUser: {
            uid: user.uid,
            email: user.email,
            name: user.displayName,
          },
          profile: null,
        })
      );
      dispatch(fetchCompanyProfile());
      return user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Google login failed");
    }
  }
);

/* ---------------- LOGOUT THUNK ---------------- */

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(logout());
  }
);

/* ---------------- SLICE ---------------- */

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null, // { uid, email }
    profile: null, // admin profile (serializable)
    loading: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.authUser = action.payload.authUser;
      state.profile = action.payload.profile;
      state.loading = false;
    },
    logout: (state) => {
      state.authUser = null;
      state.profile = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listenToAuthChanges.pending, (state) => {
      state.loading = true;
    });
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
