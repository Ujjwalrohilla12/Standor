import axios from 'axios';
import { Session, Packet, Annotation, User } from '../store/useStore';

const envUrl = import.meta.env.VITE_BACKEND_URL;
const API = (envUrl && envUrl !== 'undefined') ? (envUrl as string) : 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Required for secure cookies
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('standor_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ──
// When the access token expires, use the refresh token to get a new one
// transparently, so the user stays logged in.
let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401s that aren't the refresh endpoint itself
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    // The refresh token is stored as an HTTP-only cookie, automatically sent
    // with withCredentials: true. No need to check localStorage.

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Send empty body — backend reads refresh token from HTTP-only cookie
      const { data } = await axios.post(`${API}/api/auth/refresh`, {}, { withCredentials: true });
      const newToken = data.accessToken || data.token;
      localStorage.setItem('standor_token', newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Refresh failed — clear auth state
      localStorage.removeItem('standor_token');
      localStorage.removeItem('standor_refresh');
      localStorage.removeItem('standor_user');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export interface AuthResponse {
  token: string;
  refreshToken?: string; // Optional now that we use cookies
  user: User;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface UploadResponse {
  session: { id: string; title: string; packets: number; tags: string[] };
  packetCount: number;
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(r => r.data),
  login: (data: { email: string; password: string }): Promise<AuthResponse> =>
    api.post('/auth/login', data).then(r => r.data),
  mfaVerify: (data: { mfaToken: string; code: string }): Promise<AuthResponse> =>
    api.post('/auth/mfa/verify', data).then(r => r.data),
  mfaSetup: (): Promise<{ secret: string; qrCodeUrl: string }> =>
    api.post('/auth/mfa/setup').then(r => r.data),
  mfaEnable: (data: { secret: string; code: string }): Promise<{ success: boolean; backupCodes: string[] }> =>
    api.post('/auth/mfa/enable', data).then(r => r.data),
  mfaRegenerateBackupCodes: (): Promise<{ backupCodes: string[] }> =>
    api.post('/auth/mfa/regenerate-backup-codes').then(r => r.data),
  mfaDisable: (data: { code: string }): Promise<{ success: boolean; message: string }> =>
    api.post('/auth/mfa/disable', data).then(r => r.data),
  logout: () => api.post('/auth/logout').then(r => r.data),
  verifyPassword: (password: string) => api.post('/auth/verify-password', { password }).then(r => r.data),
  me: (): Promise<User> => api.get('/auth/me').then(r => r.data),
  refresh: (): Promise<{ token: string }> =>
    api.post('/auth/refresh').then(r => r.data),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data).then(r => r.data),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data).then(r => r.data),
  verifyEmail: (token: string, email: string) =>
    api.post('/auth/verify-email', { token, email }).then(r => r.data),
  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }).then(r => r.data),
  exportData: () => api.get('/auth/export-data').then(r => r.data),
  deleteAccount: () => api.delete('/auth/delete-account').then(r => r.data),
  getAuditLogs: (): Promise<any[]> => api.get('/auth/audit-logs').then(r => r.data),
  listApiKeys: (): Promise<any[]> => api.get('/auth/api-keys').then(r => r.data),
  createApiKey: (name: string): Promise<{ name: string, key: string }> => api.post('/auth/api-keys', { name }).then(r => r.data),
  revokeApiKey: (name: string) => api.delete(`/auth/api-keys/${name}`).then(r => r.data),
  googleUrl: (): string => `${API}/api/auth/google`,
  getSessions: (): Promise<Array<{ userAgent: string; ip: string; lastUsed: string; createdAt: string; isCurrent: boolean }>> =>
    api.get('/auth/sessions').then(r => r.data),
  revokeSession: (createdAt: string) => api.delete(`/auth/sessions/${encodeURIComponent(createdAt)}`).then(r => r.data),
  logoutEverywhere: () => api.post('/auth/logout-everywhere').then(r => r.data),
  requestMagicLink: (email: string) => api.post('/auth/magic-link', { email }).then(r => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data).then(r => r.data),
  unlinkProvider: (provider: string) =>
    api.delete(`/auth/providers/${provider}`).then(r => r.data),
  updateGovernance: (data: { storeFullPayload?: boolean; analyticsConsent?: boolean }) =>
    api.patch('/auth/governance', data).then(r => r.data),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.patch('/auth/me', data).then(r => r.data),
};

export const sessionsApi = {
  getAll: (): Promise<Session[]> => api.get('/sessions').then(r => r.data),
  getOne: (id: string): Promise<Session> => api.get(`/sessions/${id}`).then(r => r.data),
  create: (data: { title: string; tags?: string[] }): Promise<Session> =>
    api.post('/sessions', data).then(r => r.data),
  delete: (id: string) => api.delete(`/sessions/${id}`).then(r => r.data),
  update: (id: string, data: Partial<Session>): Promise<Session> =>
    api.patch(`/sessions/${id}`, data).then(r => r.data),
  exportSnapshot: async (id: string, title: string): Promise<void> => {
    const response = await api.get(`/sessions/${id}/export`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standor-session-${title.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  getDpi: (id: string): Promise<DpiResult | { status: string; message: string }> =>
    api.get(`/sessions/${id}/dpi`).then(r => r.data),
  getAnomaly: (id: string): Promise<AnomalyResult | { status: string; message: string }> =>
    api.get(`/sessions/${id}/anomaly`).then(r => r.data),
  getStreams: (id: string): Promise<StreamFlow[]> =>
    api.get(`/sessions/${id}/streams`).then(r => r.data),
  createShareLink: (id: string): Promise<{ url: string; token: string; expiresAt: string }> =>
    api.post(`/sessions/${id}/share`).then(r => r.data),
  getShared: (token: string): Promise<{ session: Session; expiresAt: string; viewCount: number }> =>
    api.get(`/sessions/share/${token}`).then(r => r.data),
  getActivity: (id: string): Promise<ActivityEvent[]> =>
    api.get(`/sessions/${id}/activity`).then(r => r.data),
  getReport: (id: string): Promise<InvestigationReport> =>
    api.get(`/sessions/${id}/report`).then(r => r.data),
};

export interface StreamFlow {
  streamId: string;
  src: string;
  srcPort: number;
  dst: string;
  dstPort: number;
  protocol: string;
  packetCount: number;
  bytes: number;
  startTs: string;
  endTs: string;
  durationMs: number;
  flagsSeen: string[];
  isEncrypted: boolean;
  ja3?: string;
  httpSummary?: string;
  dnsSummary?: string;
  avgEntropy: number;
  entropyFlagged: number;
}

export interface ActivityEvent {
  type: string;
  ts: string;
  actor?: string;
  detail: string;
}

export interface InvestigationReport {
  reportVersion: string;
  generatedAt: string;
  session: { id: string; title: string; created: string; packets: number; tags: string[] };
  summary: {
    totalPackets: number;
    totalBytes: number;
    highEntropyPackets: number;
    totalAnnotations: number;
    uniqueFlows: number;
    ja3Fingerprints: string[];
  };
  protocolDistribution: Record<string, number>;
  topTalkers: Array<{ ip: string; bytes: number }>;
  topFlows: StreamFlow[];
  anomalyFindings: AnomalyFinding[];
  annotations: Array<{ id: string; packetId: string; userName: string; comment: string; tags: string[]; created: string }>;
}

export interface AnomalyFinding {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  detail: string;
  count: number;
  score: number;
}

export interface AnomalyResult {
  overallScore: number;
  riskLabel: 'clean' | 'low' | 'medium' | 'high' | 'critical';
  findings: AnomalyFinding[];
  analysedAt: string;
  packetCount: number;
}

export interface DpiProcessingStats {
  sniExtractions: number;
  alpnExtractions: number;
  classificationHits: number;
  dnsExtractions: number;
  httpHostExtractions: number;
  quicDetections: number;
}

export interface DpiFlowDetail {
  src: string;
  srcPort: number;
  dst: string;
  dstPort: number;
  protocol: string;
  app: string;
  state: 'SYN_ONLY' | 'ESTABLISHED' | 'CLASSIFIED' | 'CLOSED_FIN' | 'CLOSED_RST' | 'ACTIVE';
  /** C++ PacketAction: FORWARD (normal), DROP (anomalous/rule-blocked), LOG_ONLY (suspicious/scan) */
  action: 'FORWARD' | 'DROP' | 'LOG_ONLY';
  packetsIn: number;
  packetsOut: number;
  bytesIn: number;
  bytesOut: number;
  firstSeen: string;
  lastSeen: string;
  durationMs: number;
  sni?: string;
  alpn?: string[];
  tlsVersion?: string;
  /** JA3 TLS fingerprint hash (MD5 of ClientHello: version:ciphers:exts:groups:pointfmts) */
  ja3?: string;
  isEncrypted: boolean;
  /** True for IPv6 flows */
  isIpv6?: boolean;
  /** PolicyRule name that blocked this flow (C++ RuleManager equivalent) */
  blockedByRule?: string;
}

export interface DpiConnectionStats {
  classified: number;
  established: number;
  synOnly: number;
  closedFin: number;
  closedRst: number;
  active: number;
  tcpFlows: number;
  udpFlows: number;
  otherFlows: number;
}

export interface DpiPortScan {
  scannerIp: string;
  targetsCount: number;
  portsTargeted: number[];
  isPrivate: boolean;
}

export interface DpiTopTalker {
  ip: string;
  flows: number;
  bytes: number;
  isPrivate: boolean;
  topApp: string;
}

export interface DpiProtocolAnomaly {
  type: 'dns_long_name' | 'high_entropy_nonstandard' | 'ip_fragment' | 'ttl_anomaly' | 'tcp_zero_window' | 'icmp_flood';
  src: string;
  srcPort: number;
  dst: string;
  dstPort: number;
  detail: string;
}

export interface DpiResult {
  totalPackets: number;
  forwarded: number;
  dropped: number;
  activeFlows: number;
  classificationRate: number;
  appStats: Array<{ app: string; count: number; percent: number }>;
  detectedDomains: Array<{ domain: string; app: string; count: number }>;
  connectionStats: DpiConnectionStats;
  portScans: DpiPortScan[];
  topTalkers: DpiTopTalker[];
  flowDetails: DpiFlowDetail[];
  protocolAnomalies: DpiProtocolAnomaly[];
  processingStats: DpiProcessingStats;
  /** IPv6 packet count */
  ipv6Packets?: number;
  /** ARP packet count */
  arpPackets?: number;
  /** Fragmented IP packet count */
  fragmentedPackets?: number;
  /** Flows blocked by PolicyRules (C++ RuleManager equivalent) */
  blockedFlows?: number;
  analysedAt: string;
}

export const packetsApi = {
  getBySession: (sessionId: string): Promise<Packet[]> =>
    api.get(`/packets/${sessionId}`).then(r => r.data),
  search: (sessionId: string, params: { q?: string; protocol?: string; src?: string; dst?: string; port?: string; flagged?: boolean }): Promise<Packet[]> =>
    api.get(`/packets/${sessionId}/search`, { params }).then(r => r.data),
  create: (data: Partial<Packet>): Promise<Packet> =>
    api.post('/packets', data).then(r => r.data),
};

export const annotationsApi = {
  getByPacket: (packetId: string): Promise<Annotation[]> =>
    api.get(`/annotations/${packetId}`).then(r => r.data),
  create: (data: Partial<Annotation>): Promise<Annotation> =>
    api.post('/annotations', data).then(r => r.data),
};

export const uploadApi = {
  pcap: (
    file: File,
    title: string,
    tags: string,
    onProgress?: (e: any) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || '');
    formData.append('tags', tags || '');
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then(r => r.data);
  },
};

export const dpiApi = {
  /** Direct PCAP analysis — no session created. Mirrors C++ DPIEngine::processFile() */
  analyze: (file: File, onProgress?: (e: any) => void): Promise<DpiResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${API}/api/dpi/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then(r => r.data);
  },

  /** PCAP analysis with C++ RuleManager-style blocking rules */
  analyzeWithRules: (
    file: File,
    rules: { blockedIPs?: string[]; blockedApps?: string[]; blockedDomains?: string[]; blockedPorts?: number[] },
    onProgress?: (e: any) => void,
  ): Promise<DpiResult & { blockedFlows: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rules', JSON.stringify(rules));
    return axios.post(`${API}/api/dpi/analyze-with-rules`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }).then(r => r.data);
  },

  /** List all classifiable applications (C++ AppType enum) */
  supportedApps: (): Promise<{ apps: string[]; protocols: string[] }> =>
    api.get('/dpi/supported-apps').then(r => r.data),

  /** URL for binary download */
  binaryUrl: (platform: string): string => `${API}/api/dpi/binary/${platform}`,

  /** URL for install script download */
  installScriptUrl: (platform: string): string => `${API}/api/dpi/install-script/${platform}`,

  /** List all DPI engine features */
  features: (): Promise<any> => api.get('/dpi/features').then(r => r.data),

  /** Get build instructions for a platform */
  buildInstructions: (platform: string): Promise<{ instructions: string[] }> =>
    api.get(`/dpi/build-instructions/${platform}`).then(r => r.data),
};

export const marketingApi = {
  contact: (data: { name: string; email: string; company?: string; role?: string; message: string; plan?: string }) =>
    api.post('/contact', data).then(r => r.data),
  newsletter: (email: string) =>
    api.post('/newsletter', { email }).then(r => r.data),
  newsletterUnsubscribe: (email: string) =>
    api.post('/newsletter/unsubscribe', { email }).then(r => r.data),
};

export interface WebAuthnCredential {
  id: string;
  credentialId: string;
  name: string;
  deviceType: string;
  backedUp: boolean;
  transports: string[];
  createdAt: string;
  lastUsed: string | null;
}

export const webauthnApi = {
  getCredentials: (): Promise<WebAuthnCredential[]> =>
    api.get('/webauthn/credentials').then(r => r.data),
  getRegistrationOptions: () =>
    api.post('/webauthn/register/options').then(r => r.data),
  verifyRegistration: (response: unknown, keyName: string) =>
    api.post('/webauthn/register/verify', { response, keyName }).then(r => r.data),
  deleteCredential: (credentialId: string) =>
    api.delete(`/webauthn/${credentialId}`).then(r => r.data),
  getAuthOptions: (email?: string) =>
    api.post('/webauthn/authenticate/options', { email }).then(r => r.data),
  verifyAuth: (response: unknown, challengeKey: string) =>
    api.post('/webauthn/authenticate/verify', { response, challengeKey }).then(r => r.data),
};

export interface OrgMember {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface OrgInvite {
  id: string;
  email: string;
  role: 'admin' | 'member';
  expiresAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: OrgMember[];
  invites: OrgInvite[];
  retentionDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export const orgsApi = {
  getMyOrg: (): Promise<Organization> => api.get('/orgs/me').then(r => r.data),
  create: (name: string): Promise<Organization> => api.post('/orgs', { name }).then(r => r.data),
  rename: (name: string): Promise<Organization> => api.patch('/orgs/me', { name }).then(r => r.data),
  invite: (email: string, role: 'admin' | 'member' = 'member') =>
    api.post('/orgs/invite', { email, role }).then(r => r.data),
  removeMember: (userId: string) => api.delete(`/orgs/members/${userId}`).then(r => r.data),
  changeMemberRole: (userId: string, role: 'admin' | 'member') =>
    api.patch(`/orgs/members/${userId}`, { role }).then(r => r.data),
  leave: () => api.post('/orgs/leave').then(r => r.data),
  deleteOrg: () => api.delete('/orgs/me').then(r => r.data),
  setRetention: (retentionDays: number | null) =>
    api.patch('/orgs/me/retention', { retentionDays }).then(r => r.data),
};

export const analyticsApi = {
  getTeam: (days = 30) => api.get(`/analytics/team?days=${days}`).then(r => r.data),
  exportCsv: async () => {
    const res = await api.get('/sessions/export', { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'standor-sessions.csv';
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ── Interview Rooms ───────────────────────────────────────────────────────────

export interface AIAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  correctness: string;
  bugs: string[];
  suggestions: string[];
  testCases: string[];
  codeStyle: string;
  overallScore: number;
  summary: string;
  analyzedAt: string;
}

export interface InterviewRoom {
  _id: string;
  roomId: string;
  problem: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  language: string;
  status: 'ACTIVE' | 'COMPLETED';
  callId?: string;
  hostId: string;
  participantId?: string;
  messages: Array<{ sender: string; text: string; timestamp: string }>;
  analyses: AIAnalysis[];
  codeSnapshots: Array<{ content: string; language: string; timestamp: string }>;
  startedAt: string;
  endedAt?: string;
  lastActivityAt?: string;
}

export interface ExecutionResult {
  run: { stdout: string; stderr: string; code: number; signal: string | null; cpu_time?: number; memory?: number };
  compile?: { stdout: string; stderr: string; code: number };
  language: string;
  version: string;
}

export const meetingsApi = {
  create: (data?: { title?: string }): Promise<{ _id: string; id: string; callId: string; roomId: string; hostId: string; status: string; maxParticipants: number; meetingLink: string }> =>
    api.post('/meetings', data || {}).then(r => r.data),
  get: (code: string) => api.get(`/meetings/${code}`).then(r => r.data),
  join: (code: string) => api.post(`/meetings/${code}/join`).then(r => r.data),
  guestJoin: (code: string, name: string) => api.post(`/meetings/${code}/guest-join`, { name }).then(r => r.data),
};

export const roomsApi = {
  getAll: (params?: { page?: number; limit?: number }): Promise<{ rooms: InterviewRoom[]; total: number; page: number; totalPages: number }> =>
    api.get('/sessions/my-sessions', { params }).then(r => r.data),
  create: (data: { problem: string; difficulty: 'EASY' | 'MEDIUM' | 'HARD'; language?: string }): Promise<InterviewRoom> =>
    api.post('/rooms', data).then(r => r.data),
  getOne: (roomId: string): Promise<InterviewRoom> =>
    api.get(`/sessions/${roomId}`).then(r => r.data),
  join: (roomId: string): Promise<{ joined: boolean }> =>
    api.post(`/sessions/${roomId}/join`).then(r => r.data),
  analyze: (roomId: string, data: { code: string; language: string }): Promise<{ aiAnalysis: AIAnalysis }> =>
    api.post(`/sessions/${roomId}/analyze`, data).then(r => r.data),
  snapshot: (roomId: string, data: { content: string; language: string }): Promise<{ saved: boolean }> =>
    api.post(`/sessions/${roomId}/snapshot`, data).then(r => r.data),
  end: (roomId: string): Promise<InterviewRoom> =>
    api.post(`/sessions/${roomId}/end`).then(r => r.data),
  delete: (roomId: string): Promise<{ deleted: boolean }> =>
    api.delete(`/rooms/${roomId}`).then(r => r.data),
  stats: (): Promise<{ total: number; active: number; completed: number; withParticipant: number; avgScore: number; passRate: number }> =>
    api.get('/sessions/stats').then(r => r.data),
  analytics: (): Promise<{ activity: Array<{ week: string; count: number }>; difficulty: Array<{ diff: string; count: number }> }> =>
    api.get('/sessions/analytics').then(r => r.data),
};

export const codeExecutionApi = {
  languages: (): Promise<Array<{ language: string; version: string }>> =>
    api.get('/execution/languages').then(r => r.data),
  execute: (data: { language: string; code: string; stdin?: string }): Promise<ExecutionResult> =>
    api.post('/execution/execute', data).then(r => r.data),
};

export const replayApi = {
  get: (roomId: string) => api.get(`/replay/${roomId}`).then(r => r.data),
};

export interface ProblemDetail {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  category: string;
  tags: string[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<string, string>;
  testCases: { input: string; expected: string }[];
}

export interface TestCaseResult {
  index: number;
  passed: boolean;
  hidden: boolean;
  input: string | null;
  expected: string | null;
  actual: string;
  stderr: string | null;
}

export interface RunTestsResult {
  passed: number;
  total: number;
  results: TestCaseResult[];
}

export const problemsApi = {
  getBySlug: (title: string): Promise<ProblemDetail> =>
    api.get(`/problems/${encodeURIComponent(title)}`).then(r => r.data),
  runTests: (title: string, data: { language: string; code: string }): Promise<RunTestsResult> =>
    api.post(`/problems/${encodeURIComponent(title)}/run`, data).then(r => r.data),
  list: (params?: { q?: string; difficulty?: string; category?: string }): Promise<ProblemDetail[]> =>
    api.get('/problems', { params }).then(r => r.data),
};

export default api;
