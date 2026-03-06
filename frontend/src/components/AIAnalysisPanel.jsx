import { BrainCircuitIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { useAnalyzeCode, useGetAnalysis } from "../hooks/useAiAnalysis";
import { motion, AnimatePresence } from "framer-motion";

function ScoreBadge({ score }) {
  const color = score >= 8 ? "badge-success" : score >= 5 ? "badge-warning" : "badge-error";
  return (
    <span className={`badge badge-lg font-bold ${color}`}>{score}/10</span>
  );
}

function AIAnalysisPanel({ sessionId, code, language, problem }) {
  const { data, isLoading: loadingExisting } = useGetAnalysis(sessionId);
  const analyzeMutation = useAnalyzeCode(sessionId);

  const analysis = analyzeMutation.data?.analysis || data?.analysis;
  const isPending = analyzeMutation.isPending;

  const handleAnalyze = () => {
    if (!code?.trim()) return;
    analyzeMutation.mutate({ code, language, problem });
  };

  return (
    <div className="bg-base-100 rounded-xl border border-base-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-b border-base-300">
        <div className="flex items-center gap-2">
          <BrainCircuitIcon className="size-5 text-primary" />
          <span className="font-semibold text-sm">AI Code Analysis</span>
        </div>
        <button
          className="btn btn-primary btn-xs gap-1"
          onClick={handleAnalyze}
          disabled={isPending || !code?.trim()}
        >
          {isPending ? (
            <Loader2Icon className="size-3 animate-spin" />
          ) : (
            <SparklesIcon className="size-3" />
          )}
          {isPending ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 text-sm">
        {isPending && (
          <div className="flex flex-col items-center justify-center py-6 gap-3 text-base-content/60">
            <Loader2Icon className="size-8 animate-spin text-primary" />
            <p>Claude is reviewing your code...</p>
          </div>
        )}

        {!isPending && !analysis && (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-base-content/50">
            <BrainCircuitIcon className="size-8" />
            <p className="text-center text-xs">
              Click "Analyze" to get AI feedback on correctness, complexity, bugs & style
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
        {!isPending && analysis && (
          <motion.div
            key="analysis-results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Metrics row */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-base-200 rounded-lg p-2">
                <p className="text-xs text-base-content/60 mb-1">Time Complexity</p>
                <p className="font-mono font-bold text-primary">{analysis.timeComplexity || "—"}</p>
              </div>
              <div className="bg-base-200 rounded-lg p-2">
                <p className="text-xs text-base-content/60 mb-1">Space Complexity</p>
                <p className="font-mono font-bold text-secondary">{analysis.spaceComplexity || "—"}</p>
              </div>
            </div>

            {/* Correctness + Score */}
            <div className="flex items-center justify-between bg-base-200 rounded-lg p-2">
              <div>
                <p className="text-xs text-base-content/60 mb-1">Correctness</p>
                <p className="font-medium">{analysis.correctness || "—"}</p>
              </div>
              {analysis.overallScore != null && (
                <div className="text-right">
                  <p className="text-xs text-base-content/60 mb-1">Score</p>
                  <ScoreBadge score={analysis.overallScore} />
                </div>
              )}
            </div>

            {/* Bugs */}
            <div className="bg-base-200 rounded-lg p-2">
              <p className="text-xs text-base-content/60 mb-1">Bugs Found</p>
              {analysis.bugs?.length ? (
                <ul className="space-y-1">
                  {analysis.bugs.map((bug, i) => (
                    <li key={i} className="flex gap-1.5 text-error text-xs">
                      <span className="mt-0.5">•</span>
                      <span>{bug}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-success text-xs font-medium">No bugs found</p>
              )}
            </div>

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="bg-base-200 rounded-lg p-2">
                <p className="text-xs text-base-content/60 mb-1">Suggestions</p>
                <ul className="space-y-1">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-1.5 text-xs">
                      <span className="text-warning mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Style */}
            {analysis.codeStyle && (
              <div className="bg-base-200 rounded-lg p-2">
                <p className="text-xs text-base-content/60 mb-1">Code Style</p>
                <p className="text-xs">{analysis.codeStyle}</p>
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
                <p className="text-xs text-base-content/60 mb-1">Summary</p>
                <p className="text-xs leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            {analysis.analyzedAt && (
              <p className="text-xs text-base-content/40 text-right">
                Analyzed {new Date(analysis.analyzedAt).toLocaleTimeString()}
              </p>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default AIAnalysisPanel;
