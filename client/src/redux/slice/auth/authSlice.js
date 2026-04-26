import { createSlice } from "@reduxjs/toolkit";

const storedSession = localStorage.getItem("docshield_session");

const parseStoredSession = () => {
  if (!storedSession) return { user: null, token: null };
  try {
    return JSON.parse(storedSession);
  } catch {
    return { user: null, token: null };
  }
};

const persisted = parseStoredSession();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: persisted.user,
    token: persisted.token,
    isLoggedIn: Boolean(persisted.token),
    loading: false,
    error: null,
  },
  reducers: {
    setSession: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = Boolean(action.payload.token);
      state.error = null;
      localStorage.setItem("docshield_session", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.error = null;
      localStorage.removeItem("docshield_session");
    },
    loadUserFromStorage: (state) => {
      const session = localStorage.getItem("docshield_session");
      if (!session) return;
      try {
        const parsed = JSON.parse(session);
        state.user = parsed.user;
        state.token = parsed.token;
        state.isLoggedIn = Boolean(parsed.token);
      } catch {
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
      }
    },
  },
});

export const { setSession, logoutUser, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
