import { axiosInstance } from "../lib/axios";

export const sessionApi = {
  createSession: async (data) => {
    const response = await axiosInstance.post("/sessions", data);
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await axiosInstance.get("/sessions/active");
    return response.data;
  },
  getMyRecentSessions: async () => {
    const response = await axiosInstance.get("/sessions/my-recent");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await axiosInstance.get(`/sessions/${id}`);
    return response.data;
  },

  joinSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/join`);
    return response.data;
  },
  endSession: async (id) => {
    const response = await axiosInstance.post(`/sessions/${id}/end`);
    return response.data;
  },
  getStreamToken: async () => {
    const response = await axiosInstance.get(`/chat/token`);
    return response.data;
  },
};
// AI analysis
sessionApi.analyzeCode = async (id, data) => {
  const response = await axiosInstance.post(`/sessions/${id}/analyze`, data);
  return response.data;
};

sessionApi.getAnalysis = async (id) => {
  const response = await axiosInstance.get(`/sessions/${id}/analysis`);
  return response.data;
};

// Code snapshots
sessionApi.saveSnapshot = async (id, data) => {
  const response = await axiosInstance.post(`/sessions/${id}/snapshot`, data);
  return response.data;
};

sessionApi.getSnapshots = async (id) => {
  const response = await axiosInstance.get(`/sessions/${id}/snapshots`);
  return response.data;
};
