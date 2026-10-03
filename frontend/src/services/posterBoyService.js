import api from "./api";

export const getPosterBoyProfile = async () => {
  const response = await api.get("/posterboy/profile");
  return response.data;
};

export const updatePosterBoyProfile = async (payload) => {
  const response = await api.put("/posterboy/profile", payload);
  return response.data;
};
