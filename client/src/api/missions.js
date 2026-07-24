import { apiClient } from "./client.js";

export const missionsApi = {
  list: () => apiClient.get("/missions"),
  create: (data) => apiClient.post("/missions", data),
  update: (id, data) => apiClient.put(`/missions/${id}`, data),
  remove: (id) => apiClient.delete(`/missions/${id}`),
  toggleCompletion: (id) => apiClient.patch(`/missions/${id}/toggle-complete`)
};
