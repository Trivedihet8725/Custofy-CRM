import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

/* ---------------- FETCH COMPANY PROFILE ---------------- */

export const fetchCompanyProfile = createAsyncThunk(
  "company/fetchCompanyProfile",
  async () => {
    try {
      const response = await api.get("/profile/company");
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  }
);

/* ---------------- SAVE / UPDATE COMPANY PROFILE ---------------- */

export const saveCompanyProfile = createAsyncThunk(
  "company/saveCompanyProfile",
  async ({ data }) => {
    const response = await api.post("/profile/company", data);
    return response.data;
  }
);

/* ---------------- SLICE ---------------- */

const companySlice = createSlice({
  name: "company",
  initialState: {
    profile: null,
    loading: false,
  },
  reducers: {
    clearCompany: (state) => {
      state.profile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchCompanyProfile.rejected, (state) => {
        state.loading = false;
      })
      .addCase(saveCompanyProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const { clearCompany } = companySlice.actions;
export default companySlice.reducer;
