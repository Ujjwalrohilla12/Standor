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
  dataGovernance?: {
    storeFullPayload?: boolean;
    analyticsConsent?: boolean;
  };
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
  tokenExpiration: number | null;
  sessionCheckInterval: ReturnType<typeof setInterval> | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setAuthLoading: (v: boolean) => void;
  checkTokenExpiration: () => boolean;
  startSessionMonitor: () => void;
  stopSessionMonitor: () => void;

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
  user: (() => {
    try {
      const user = JSON.parse(localStorage.getItem('standor_user') || 'null');
      const token = localStorage.getItem('standor_token');
      const expiration = localStorage.getItem('standor_token_expiration');

      if (user && token && expiration) {
        const exp = parseInt(expiration, 10);
        if (Date.now() >= exp) {
          localStorage.removeItem('standor_user');
          localStorage.removeItem('standor_token');
          localStorage.removeItem('standor_token_expiration');
          return null;
        }
        return user;
      }
      return null;
    } catch {
      return null;
    }
  })(),
  token: (() => {
    const token = localStorage.getItem('standor_token');
    const expiration = localStorage.getItem('standor_token_expiration');
    if (token && expiration) {
      const exp = parseInt(expiration, 10);
      if (Date.now() >= exp) {
        localStorage.removeItem('standor_token');
        localStorage.removeItem('standor_token_expiration');
        return null;
      }
      return token;
    }
    return null;
  })(),
  tokenExpiration: (() => {
    const expiration = localStorage.getItem('standor_token_expiration');
    if (expiration) {
      const exp = parseInt(expiration, 10);
      if (Date.now() >= exp) {
        localStorage.removeItem('standor_token_expiration');
        return null;
      }
      return exp;
    }
    return null;
  })(),
  sessionCheckInterval: null,
  authLoading: false,

  // Start session monitor automatically if user is already authenticated from localStorage
  ...((() => {
    const token = localStorage.getItem('standor_token');
    const expiration = localStorage.getItem('standor_token_expiration');
    if (token && expiration && Date.now() < parseInt(expiration, 10)) {
      // Will be started after store creation via setTimeout
      setTimeout(() => {
        useStore.getState().startSessionMonitor();
      }, 0);
    }
    return {};
  })()),

  setAuth: (user, token) => {
    try {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const loginTime = Date.now();

      // Decode JWT expiry if available
      let jwtExpiration: number | null = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp) jwtExpiration = payload.exp * 1000;
      } catch { /* ignore malformed JWT */ }

      // Enforce strict 1-hour cap from login time (client-side rate limit)
      const maxAllowed = loginTime + ONE_HOUR_MS;
      const expiration = jwtExpiration
        ? Math.min(jwtExpiration, maxAllowed)
        : maxAllowed;

      localStorage.setItem('standor_user', JSON.stringify(user));
      localStorage.setItem('standor_token', token);
      localStorage.setItem('standor_token_expiration', expiration.toString());
      localStorage.setItem('standor_login_time', loginTime.toString());

      set({ user, token, tokenExpiration: expiration, authLoading: false });

      get().startSessionMonitor();
    } catch (error) {
      console.error('Error setting auth:', error);
      // Fallback: still enforce 1-hour cap even if token decode fails
      const expiration = Date.now() + 60 * 60 * 1000;
      localStorage.setItem('standor_user', JSON.stringify(user));
      localStorage.setItem('standor_token', token);
      localStorage.setItem('standor_token_expiration', expiration.toString());
      set({ user, token, tokenExpiration: expiration, authLoading: false });
      get().startSessionMonitor();
    }
  },

  logout: () => {
    get().stopSessionMonitor();

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
    localStorage.removeItem('standor_token_expiration');
    localStorage.removeItem('standor_login_time');

    set({
      user: null,
      token: null,
      tokenExpiration: null,
      sessionCheckInterval: null,
      sessions: [],
      currentSession: null,
      packets: [],
      selectedPacket: null,
      annotations: [],
      collaborators: []
    });
  },

  setAuthLoading: (v) => set({ authLoading: v }),

  checkTokenExpiration: () => {
    const expiration = get().tokenExpiration;
    if (!expiration) return true;
    return Date.now() >= expiration;
  },

  startSessionMonitor: () => {
    const existing = get().sessionCheckInterval;
    if (existing) clearInterval(existing);

    const interval = setInterval(() => {
      const isExpired = get().checkTokenExpiration();
      if (isExpired) {
        import('sonner').then(({ toast }) => {
          toast.error('Session Expired', {
            description: 'Your session has expired. Please log in again.',
          });
        });
        get().logout();
        window.location.href = '/login';
      }
    }, 60000);

    set({ sessionCheckInterval: interval });
  },

  stopSessionMonitor: () => {
    const interval = get().sessionCheckInterval;
    if (interval) {
      clearInterval(interval);
      set({ sessionCheckInterval: null });
    }
  },

  theme: (() => {
    try {
      return (localStorage.getItem('standor_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  })(),
  toggleTheme: () => {
    set((s) => {
      const newTheme = s.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('standor_theme', newTheme);
      } catch {
        // Ignore localStorage errors
      }
      return { theme: newTheme };
    });
  },

  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions: sessions || [] }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
  deleteSession: (id) => set((s) => ({ sessions: s.sessions.filter(x => x.id !== id) })),

  packets: [],
  selectedPacket: null,
  setPackets: (packets) => set({ packets: packets || [] }),
  setSelectedPacket: (packet) => set({ selectedPacket: packet }),

  selectedLayer: null,
  setSelectedLayer: (layer) => set({ selectedLayer: layer }),

  annotations: [],
  setAnnotations: (annotations) => set({ annotations: annotations || [] }),
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
