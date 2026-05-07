import { Suspense, useState, useEffect } from 'react';
import PageShell from '../../components/PageShell';
import { sessionsApi, roomsApi, AIAnalysis } from '../../utils/api';
import { ChevronDown, Download, History, Zap } from 'lucide-react';

type FeedbackReport = {
  audience: string;
  summary: string;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  score: number;
  generatedAt: string;
  snapshotCount: number;
};

export default function AiAnalysisFeature() {
  const [title, setTitle] = useState('Live Interview');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState('function solution(arr) {\n  // Your code here\n  return result;\n}\n');
  const [language, setLanguage] = useState('javascript');
  
  // Analysis state
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [report, setReport] = useState<FeedbackReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzeHistory, setAnalyzeHistory] = useState<any[]>([]);
  const [snapshotHistory, setSnapshotHistory] = useState<any[]>([]);
  const [progression, setProgression] = useState<any>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'editor' | 'analysis' | 'history' | 'snapshots'>('editor');
  const [expandedReport, setExpandedReport] = useState(false);

  const createSession = async () => {
    setLoading(true);
    try {
      const session = await sessionsApi.create({ title });
      const sessionId = (session as any)._id || (session as any).id;
      setSessionId(sessionId);
      setAnalyzeHistory([]);
      setSnapshotHistory([]);
      setProgression(null);
    } catch (err) {
      console.error('Failed to create session', err);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!sessionId) return alert('Create a session first');
    setLoading(true);
    try {
      const { aiAnalysis } = await roomsApi.analyze(sessionId, { code, language });
      setAnalysis(aiAnalysis);
      const reportResponse = await sessionsApi.getReport(sessionId);
      setReport(reportResponse.report as FeedbackReport);
      
      // Fetch history
      await fetchAnalyzeHistory();
    } catch (err) {
      console.error('Analyze failed', err);
      alert('Analysis failed: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const saveSnapshot = async () => {
    if (!sessionId) return alert('Create a session first');
    setLoading(true);
    try {
      await roomsApi.snapshot(sessionId, { content: code, language });
      alert('Snapshot saved successfully');
      await fetchSnapshotHistory();
    } catch (err) {
      console.error('Snapshot failed', err);
      alert('Failed to save snapshot: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyzeHistory = async () => {
    if (!sessionId) return;
    try {
      const response = await sessionsApi.getAnalyses(sessionId);
      setAnalyzeHistory(response.detailedAnalyses || []);
    } catch (err) {
      console.error('Failed to fetch analysis history', err);
    }
  };

  const fetchSnapshotHistory = async () => {
    if (!sessionId) return;
    try {
      const response = await sessionsApi.getSnapshots(sessionId);
      setSnapshotHistory(response.snapshots || []);
    } catch (err) {
      console.error('Failed to fetch snapshot history', err);
    }
  };

  const analyzeProgression = async () => {
    if (!sessionId) return alert('Create a session first');
    if (snapshotHistory.length < 2) return alert('Need at least 2 snapshots for progression analysis');
    
    setLoading(true);
    try {
      const response = await sessionsApi.analyzeProgression(sessionId);
      setProgression(response.progression);
      setActiveTab('history');
    } catch (err) {
      console.error('Progression analysis failed', err);
      alert('Failed to analyze progression: ' + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const dataStr = JSON.stringify({
      session: sessionId,
      generatedAt: report.generatedAt,
      report,
      analysis
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `feedback-report-${sessionId}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <PageShell title="AI Code Analysis" description="Advanced code analysis with AI-powered feedback, session snapshots, and progression tracking.">
      <div className="ns-container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Code Analysis</h1>
          <p className="text-white/60">Advanced technical interview platform with real-time AI analysis and intelligent feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Session Creation */}
            <div className="bg-[var(--bg-800)] rounded-lg p-5 border border-white/[0.05]">
              <h2 className="text-lg font-semibold mb-4">Create Session</h2>
              <div className="space-y-3">
                <div>
                  <label htmlFor="ai-session-title" className="block text-xs text-white/60 uppercase tracking-wide">Session Title</label>
                  <input 
                    id="ai-session-title" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="mt-2 w-full px-3 py-2 rounded bg-[#0f1724] border border-white/[0.1] text-white text-sm focus:border-white/30 outline-none transition"
                    placeholder="e.g., Array Problem Solving"
                  />
                </div>
                <button 
                  onClick={createSession} 
                  disabled={loading} 
                  className="w-full px-4 py-2.5 bg-accent text-white rounded font-medium hover:bg-accent-secondary transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </button>
                {sessionId && (
                  <div className="text-xs bg-white/5 p-2 rounded">
                    <div className="text-white/50">Session ID</div>
                    <div className="font-mono text-white/80 break-all">{sessionId}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Language & Actions */}
            {sessionId && (
              <div className="bg-[var(--bg-800)] rounded-lg p-5 border border-white/[0.05]">
                <h3 className="text-lg font-semibold mb-4">Analysis Settings</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/60 uppercase tracking-wide">Programming Language</label>
                    <select 
                      value={language} 
                      onChange={e => setLanguage(e.target.value)} 
                      className="mt-2 w-full px-3 py-2 rounded bg-[#0f1724] border border-white/[0.1] text-white text-sm focus:border-white/30 outline-none transition"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={handleAnalyze} 
                      disabled={loading} 
                      className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded font-medium hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Zap size={16} />
                      {loading ? 'Analyzing...' : 'Analyze Code'}
                    </button>
                    <button 
                      onClick={saveSnapshot} 
                      disabled={loading} 
                      className="w-full px-4 py-2.5 bg-sky-600 text-white rounded font-medium hover:bg-sky-700 transition disabled:opacity-50"
                    >
                      Save Snapshot
                    </button>
                    {snapshotHistory.length >= 2 && (
                      <button 
                        onClick={analyzeProgression} 
                        disabled={loading} 
                        className="w-full px-4 py-2.5 bg-purple-600 text-white rounded font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <History size={16} />
                        Analyze Progression
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            {sessionId && (
              <div className="bg-[var(--bg-800)] rounded-lg p-5 border border-white/[0.05]">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-white/60 mb-3">Session Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Analyses:</span>
                    <span className="font-medium">{analyzeHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Snapshots:</span>
                    <span className="font-medium">{snapshotHistory.length}</span>
                  </div>
                  {report && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Latest Score:</span>
                      <span className="font-medium text-emerald-400">{report.score}/100</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            {sessionId && (
              <div className="flex gap-2 border-b border-white/[0.1]">
                {(['editor', 'analysis', 'history', 'snapshots'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-[2px] capitalize ${
                      activeTab === tab
                        ? 'border-accent text-white'
                        : 'border-transparent text-white/60 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Editor Tab */}
            {activeTab === 'editor' && (
              <div className="bg-[#071120] rounded-lg border border-white/[0.05] overflow-hidden">
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  rows={24}
                  className="w-full p-4 bg-[#071120] text-sm font-mono text-white outline-none resize-none"
                  placeholder="Write or paste your code here..."
                />
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && analysis && report && (
              <div className="space-y-4">
                {/* Score Card */}
                <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-lg p-6 border border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-white/60 uppercase tracking-wide">Overall Score</h3>
                      <div className="text-5xl font-bold text-emerald-400 mt-1">{analysis.overallScore}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-xs text-white/60">{analysis.timeComplexity}</div>
                      <div className="text-xs text-white/60">{analysis.spaceComplexity}</div>
                    </div>
                  </div>
                </div>

                {/* Report Details */}
                <div className="bg-[var(--bg-800)] rounded-lg border border-white/[0.05] overflow-hidden">
                  <button
                    onClick={() => setExpandedReport(!expandedReport)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition"
                  >
                    <h3 className="font-semibold">Feedback Report</h3>
                    <ChevronDown size={16} className={`transition ${expandedReport ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedReport && (
                    <div className="px-6 py-4 space-y-4 border-t border-white/[0.05]">
                      <div>
                        <h4 className="text-sm font-medium text-white/70 uppercase tracking-wide mb-2">Summary</h4>
                        <p className="text-white/80">{report.summary}</p>
                      </div>

                      {report.strengths.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-emerald-400 uppercase tracking-wide mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {report.strengths.map((s, i) => (
                              <li key={i} className="text-white/80 flex gap-2">
                                <span className="text-emerald-400">✓</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.improvementAreas.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-amber-400 uppercase tracking-wide mb-2">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {report.improvementAreas.map((area, i) => (
                              <li key={i} className="text-white/80 flex gap-2">
                                <span className="text-amber-400">→</span>
                                <span>{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.recommendations.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-blue-400 uppercase tracking-wide mb-2">Recommendations</h4>
                          <ul className="space-y-1">
                            {report.recommendations.map((rec, i) => (
                              <li key={i} className="text-white/80 flex gap-2">
                                <span className="text-blue-400">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={downloadReport}
                        className="w-full mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition flex items-center justify-center gap-2"
                      >
                        <Download size={16} />
                        Download Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Tab - Analysis History */}
            {activeTab === 'history' && analyzeHistory.length > 0 && (
              <div className="space-y-3">
                {progression && (
                  <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                    <h4 className="font-semibold mb-2">Progression Analysis</h4>
                    <div className="text-sm text-white/80 space-y-2">
                      <div>Score: {progression.progressionScore}/100</div>
                      {progression.improvements?.length > 0 && (
                        <div>
                          <strong>Improvements:</strong>
                          <ul className="list-disc ml-5">
                            {progression.improvements.map((i: string, idx: number) => (
                              <li key={idx}>{i}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {analyzeHistory.map((a, i) => (
                  <div key={i} className="bg-[var(--bg-800)] rounded-lg p-4 border border-white/[0.05]">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Analysis #{i + 1}</h4>
                      <span className="text-emerald-400 font-bold">{a.overallScore}/100</span>
                    </div>
                    <p className="text-sm text-white/70">{a.summary}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/60">
                      <div>Time: {a.timeComplexity}</div>
                      <div>Space: {a.spaceComplexity}</div>
                      <div>Bugs: {a.bugs?.length || 0}</div>
                      <div>{new Date(a.analyzedAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Snapshots Tab */}
            {activeTab === 'snapshots' && snapshotHistory.length > 0 && (
              <div className="space-y-3">
                {snapshotHistory.map((snap, i) => (
                  <div key={i} className="bg-[var(--bg-800)] rounded-lg border border-white/[0.05] overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/[0.05] flex justify-between items-center">
                      <h4 className="font-semibold">Snapshot #{i + 1}</h4>
                      <span className="text-xs text-white/60">{snap.lines} lines • {snap.language}</span>
                    </div>
                    <div className="px-4 py-3">
                      <pre className="text-xs font-mono text-white/70 overflow-x-auto bg-black/30 p-3 rounded max-h-40 overflow-y-auto">
                        {snap.preview}
                      </pre>
                      <div className="text-xs text-white/50 mt-2">{new Date(snap.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty States */}
            {activeTab === 'analysis' && !analysis && (
              <div className="bg-[var(--bg-800)] rounded-lg border border-white/[0.05] p-12 text-center">
                <p className="text-white/60">Create a session and click "Analyze Code" to see the AI analysis results.</p>
              </div>
            )}
            {activeTab === 'history' && analyzeHistory.length === 0 && (
              <div className="bg-[var(--bg-800)] rounded-lg border border-white/[0.05] p-12 text-center">
                <p className="text-white/60">No analysis history yet. Run an analysis to get started.</p>
              </div>
            )}
            {activeTab === 'snapshots' && snapshotHistory.length === 0 && (
              <div className="bg-[var(--bg-800)] rounded-lg border border-white/[0.05] p-12 text-center">
                <p className="text-white/60">No snapshots yet. Click "Save Snapshot" to store code at key moments.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

