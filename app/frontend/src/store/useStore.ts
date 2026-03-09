import { create } from 'zustand';

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  emailVerified?: boolean;
  mfaEnabled?: boolean;
  providers?: Array<{ provider: string; providerId?: string }>;
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
  authLoading: boolean;
  setAuth: (user: User, token: string) => void;
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
  user: (() => { try { return JSON.parse(localStorage.getItem('standor_user') || 'null'); } catch { return null; } })(),
  token: localStorage.getItem('standor_token') || null,
  authLoading: false,

  setAuth: (user, token) => {
    localStorage.setItem('standor_user', JSON.stringify(user));
    localStorage.setItem('standor_token', token);
    set({ user, token, authLoading: false });
  },

  logout: () => {
    const token = localStorage.getItem('standor_token');
    if (token) {
      fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
      }).catch(() => { });
    }
    localStorage.removeItem('standor_user');
    localStorage.removeItem('standor_token');
    set({ user: null, token: null, sessions: [], currentSession: null, packets: [], selectedPacket: null, annotations: [], collaborators: [] });
  },

  setAuthLoading: (v) => set({ authLoading: v }),

  theme: 'dark',
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
  deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter(x => x.id !== id) })),

  packets: [],
  selectedPacket: null,
  setPackets: (packets) => set({ packets }),
  setSelectedPacket: (packet) => set({ selectedPacket: packet }),

  selectedLayer: null,
  setSelectedLayer: (layer) => set({ selectedLayer: layer }),

  annotations: [],
  setAnnotations: (annotations) => set({ annotations }),
  addAnnotation: (annotation) => set((s) => ({ annotations: [...s.annotations, annotation] })),

  collaborators: [],
  addCollaborator: (user) => set((s) => ({ collaborators: [...s.collaborators, user] })),
  removeCollaborator: (userId) => set((s) => ({ collaborators: s.collaborators.filter(c => c.id !== userId) })),

  isPlaying: false,
  playbackSpeed: 1,
  currentTime: 0,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setCurrentTime: (time) => set({ currentTime: time }),

  showPayloadPanel: true,
  navCollapsed: false,
  togglePayloadPanel: () => set((s) => ({ showPayloadPanel: !s.showPayloadPanel })),
  toggleNav: () => set((s) => ({ navCollapsed: !s.navCollapsed })),

  settings: { reducedMotion: false, highContrast: false, obfuscateData: true },
  updateSettings: (newSettings) => set((s) => ({ settings: { ...s.settings, ...newSettings } })),

  notifications: [],
  addNotification: (notification) => set((s) => ({ notifications: [{ id: Date.now(), ...notification }, ...s.notifications] })),
  dismissNotification: (id) => set((s) => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}));

export default useStore;
