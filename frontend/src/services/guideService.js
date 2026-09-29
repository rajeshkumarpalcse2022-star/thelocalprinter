import api from "./api";

export const getGuideRows = async (slug) => {
  const response = await api.get(`/guides/${slug}/rows`);
  return response.data;
};

export const addGuideRow = async (slug, data) => {
  const response = await api.post(`/guides/${slug}/rows`, data);
  return response.data;
};

export const deleteGuideRow = async (slug, id) => {
  const response = await api.delete(`/guides/${slug}/rows/${id}`);
  return response.data;
};
