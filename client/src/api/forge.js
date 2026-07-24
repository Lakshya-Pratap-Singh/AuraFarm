import { apiClient } from "./client.js";

export const forgeApi = {
  listForges: (params) => apiClient.get("/forges", params),
  getForge: (id, params) => apiClient.get(`/forges/${id}`, params),

  listResources: (params) => apiClient.get("/resources", params),
  listSavedResources: () => apiClient.get("/resources/saved"),
  getResource: (id) => apiClient.get(`/resources/${id}`),
  toggleSaveResource: (id) => apiClient.post(`/resources/${id}/save`),
  forgeMission: (id, data) => apiClient.post(`/resources/${id}/forge-mission`, data),

  submitResource: (data) => apiClient.post("/resource-submissions", data),
  myResourceSubmissions: () => apiClient.get("/resource-submissions"),

  getObjectiveTaxonomy: () => apiClient.get("/objectives/forge/taxonomy"),
  createStructuredObjective: (data) => apiClient.post("/objectives/forge", data),
  getAuraGrowth: (objectiveId) => apiClient.get(`/objectives/forge/${objectiveId}/aura-growth`),

  // Admin (role-gated server-side; safe to import from a non-admin page,
  // the backend rejects it if the signed-in user isn't ADMIN/MODERATOR)
  listPendingSubmissions: (params) => apiClient.get("/admin/submissions", params),
  reviewSubmission: (id, data) => apiClient.patch(`/admin/submissions/${id}/review`, data)
};
