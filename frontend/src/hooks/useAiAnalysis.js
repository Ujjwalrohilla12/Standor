import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sessionApi } from "../api/sessions";
import toast from "react-hot-toast";

export const useAnalyzeCode = (sessionId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, language, problem }) =>
      sessionApi.analyzeCode(sessionId, { code, language, problem }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analysis", sessionId] });
      toast.success("AI analysis complete!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Analysis failed");
    },
  });
};

export const useGetAnalysis = (sessionId) => {
  return useQuery({
    queryKey: ["analysis", sessionId],
    queryFn: () => sessionApi.getAnalysis(sessionId),
    enabled: !!sessionId,
  });
};

export const useSaveSnapshot = (sessionId) => {
  return useMutation({
    mutationFn: ({ content, language }) =>
      sessionApi.saveSnapshot(sessionId, { content, language }),
  });
};
