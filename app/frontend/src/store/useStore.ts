import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  providers?: Array<{ provider: string; providerId?: string }>;
  emailVerified?: boolean;
  mfaEnabled: boolean;
}

export interface Session {
  id: string;
  title: string;
  created: string;
  lastActivity: string;
  packets: number;
  tags: string[];
  collaborators?: Array<{ id: string; name: string; email: string }>;
}

export interface Packet {
  id: string;
  sessionId: string;
  timestamp: string;
  protocol: string;
  src: string;
  dst: string;
  srcPort: number;
  dstPort: number;
  flags: string | null;
  size: number;
  entropy: number;
  entropyFlag: boolean;
  layers: Record<string, unknown>;
}

export interface Annotation {
  id: string;
  packetId: string;
  userId: string;
  userName: string;
  comment: string;
  tags: string[];
  created: string;
}

export interface OSILayer {
  id: number;
  name: string;
  description: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
}

export interface AppSettings {
  reducedMotion: boolean;
  highContrast: boolean;
  obfuscateData: boolean;
}

interface StoreState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  authLoading: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setAuthLoading: (v: boolean) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  sessions: Session[];
  currentSession: Session | null;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;
  deleteSession: (id: string) => void;

  packets: Packet[];
  selectedPacket: Packet | null;
  setPackets: (packets: Packet[]) => void;
  setSelectedPacket: (packet: Packet | null) => void;

  selectedLayer: OSILayer | null;
  setSelectedLayer: (layer: OSILayer | null) => void;

  annotations: Annotation[];
  setAnnotations: (annotations: Annotation[]) => void;
  addAnnotation: (annotation: Annotation) => void;

  collaborators: User[];
  addCollaborator: (user: User) => void;
  removeCollaborator: (userId: string) => void;

  isPlaying: boolean;
  playbackSpeed: number;
  currentTime: number;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setCurrentTime: (time: number) => void;

  showPayloadPanel: boolean;
  navCollapsed: boolean;
  togglePayloadPanel: () => void;
  toggleNav: () => void;

  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: number) => void;
}

const useStore = create<StoreState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('standor_user') || 'null'),
  token: localStorage.getItem('standor_token') || null,
  refreshToken: localStorage.getItem('standor_refresh') || null,
  authLoading: false,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('standor_user', JSON.stringify(user));
    localStorage.setItem('standor_token', token);
    if (refreshToken) localStorage.setItem('standor_refresh', refreshToken);
    set({ user, token, refreshToken: refreshToken || get().refreshToken, authLoading: false });
  },

  logout: () => {
    // Fire-and-forget: tell backend to invalidate refresh token
    const token = localStorage.getItem('standor_token');
    const refreshToken = localStorage.getItem('standor_refresh');
    const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8001';
    if (token || refreshToken) {
      fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => { /* ignore network errors during logout */ });
    }
    // Clear all local auth state
    localStorage.removeItem('standor_user');
    localStorage.removeItem('standor_token');
    localStorage.removeItem('standor_refresh');
    // Clear any other app-specific storage
    sessionStorage.clear();
    set({
      user: null,
      token: null,
      refreshToken: null,
      sessions: [],
      currentSession: null,
      packets: [],
      selectedPacket: null,
      annotations: [],
      collaborators: [],
    });
  },

  setAuthLoading: (v) => set({ authLoading: v }),

  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) })),

  packets: [],
  selectedPacket: null,
  setPackets: (packets) => set({ packets }),
  setSelectedPacket: (packet) => set({ selectedPacket: packet }),

  selectedLayer: null,
  setSelectedLayer: (layer) => set({ selectedLayer: layer }),

  annotations: [],
  setAnnotations: (annotations) => set({ annotations }),
  addAnnotation: (annotation) => set((state) => ({ annotations: [...state.annotations, annotation] })),

  collaborators: [],
  addCollaborator: (user) => set((state) => ({ collaborators: [...state.collaborators, user] })),
  removeCollaborator: (userId) => set((state) => ({
    collaborators: state.collaborators.filter(c => c.id !== userId),
  })),

  isPlaying: false,
  playbackSpeed: 1,
  currentTime: 0,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setCurrentTime: (time) => set({ currentTime: time }),

  showPayloadPanel: true,
  navCollapsed: false,
  togglePayloadPanel: () => set((state) => ({ showPayloadPanel: !state.showPayloadPanel })),
  toggleNav: () => set((state) => ({ navCollapsed: !state.navCollapsed })),

  settings: {
    reducedMotion: false,
    highContrast: false,
    obfuscateData: true,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),

  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [{ id: Date.now(), ...notification }, ...state.notifications],
  })),
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
  })),
}));

export default useStore;
