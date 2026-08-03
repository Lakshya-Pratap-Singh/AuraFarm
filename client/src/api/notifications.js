import { apiClient } from "./client.js";

export const notificationsApi = {
  list: (params) => apiClient.get("/notifications", params),
  unreadCount: () => apiClient.get("/notifications/unread-count"),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.patch("/notifications/read-all"),
  remove: (id) => apiClient.delete(`/notifications/${id}`),
  clearAll: () => apiClient.delete("/notifications/clear"),
  sendTest: () => apiClient.post("/notifications/test"),

  getTemplates: (type) => apiClient.get("/notifications/templates", type ? { type } : undefined),
  createTemplate: (data) => apiClient.post("/notifications/templates", data),
  updateTemplate: (id, data) => apiClient.put(`/notifications/templates/${id}`, data),
  removeTemplate: (id) => apiClient.delete(`/notifications/templates/${id}`),

  getPreferences: () => apiClient.get("/notifications/preferences"),
  updatePreferences: (data) => apiClient.put("/notifications/preferences", data),

  registerDevice: (deviceToken, deviceType) =>
    apiClient.post("/notifications/devices", { deviceToken, deviceType }),
  unregisterDevice: (deviceToken) =>
    apiClient.delete("/notifications/devices", { deviceToken }),
};