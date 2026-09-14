import api from "./api";

export const loginAPI = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const signupAPI = async (fullName, email, password, role, additionalData = {}) => {
  const response = await api.post("/auth/signup-json", {
    fullName,
    email,
    password,
    role,
    ...additionalData,
  });
  return response.data;
};

export const sendOtp = async (email) => {
  const response = await api.post("/auth/send-otp", { email });
  return response.data;
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post("/auth/verify-otp", { email, otp });
  return response.data;
};

export const checkOtpVerified = async (email) => {
  const response = await api.get("/auth/check-otp", { params: { email } });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
