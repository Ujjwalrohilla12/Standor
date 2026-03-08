import { create } from 'zustand';

const useStore = create((set, get) => ({
  // ── Auth ──
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
    localStorage.removeItem('standor_user');
    localStorage.removeItem('standor_token');
    localStorage.removeItem('standor_refresh');
    set({ user: null, token: null, refreshToken: null });
  },

  setAuthLoading: (v) => set({ authLoading: v }),

  // Theme
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  // Sessions
  sessions: [],
  currentSession: null,
  setSessions: (sessions) => set({ sessions }),
  setCurrentSession: (session) => set({ currentSession: session }),
  addSession: (session) => set((state) => ({ sessions: [session, ...state.sessions] })),
  deleteSession: (id) => set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) })),

  // Packets
  packets: [],
  selectedPacket: null,
  setPackets: (packets) => set({ packets }),
  setSelectedPacket: (packet) => set({ selectedPacket: packet }),

  // OSI Layer Selection
  selectedLayer: null,
  setSelectedLayer: (layer) => set({ selectedLayer: layer }),

  // Annotations
  annotations: [],
  setAnnotations: (annotations) => set({ annotations }),
  addAnnotation: (annotation) => set((state) => ({ annotations: [...state.annotations, annotation] })),

  // Collaborators
  collaborators: [],
  addCollaborator: (user) => set((state) => ({
    collaborators: [...state.collaborators, user]
  })),
  removeCollaborator: (userId) => set((state) => ({
    collaborators: state.collaborators.filter(c => c.id !== userId)
  })),

  // Playback
  isPlaying: false,
  playbackSpeed: 1,
  currentTime: 0,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setCurrentTime: (time) => set({ currentTime: time }),

  // UI State
  showPayloadPanel: true,
  navCollapsed: false,
  togglePayloadPanel: () => set((state) => ({ showPayloadPanel: !state.showPayloadPanel })),
  toggleNav: () => set((state) => ({ navCollapsed: !state.navCollapsed })),

  // Settings — derived from user when available
  settings: {
    reducedMotion: false,
    highContrast: false,
    obfuscateData: true,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [{ id: Date.now(), ...notification }, ...state.notifications]
  })),
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));

export default useStore;
