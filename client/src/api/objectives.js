import { apiClient } from "./client.js";

export const objectivesApi = {
  list: () => apiClient.get("/objectives"),
  create: (data) => apiClient.post("/objectives", data),
  update: (id, data) => apiClient.put(`/objectives/${id}`, data),
  remove: (id) => apiClient.delete(`/objectives/${id}`)
};
