import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Editor, { type OnMount } from "@monaco-editor/react";
type IStandaloneCodeEditor = Parameters<OnMount>[0];
import { io, Socket } from "socket.io-client";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Play,
  Loader2,
  Brain,
  ChevronDown,
  Users,
  Square,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  FlaskConical,
  CircleCheck,
  CircleX,
  Shield,
  Code2,
  Hand,
  Share,
  Info,
  Maximize2,
} from "lucide-react";
import useStore from "../store/useStore";
import {
  roomsApi,
  sessionsApi,
  meetingsApi,
  codeExecutionApi,
  problemsApi,
  AIAnalysis,
  ExecutionResult,
  ProblemDetail,
  RunTestsResult,
} from "../utils/api";
import { MediaProvider, useMedia } from "../components/session/MediaProvider";

const API_BASE =
  (import.meta as any).env?.VITE_BACKEND_URL || "http://localhost:4000";
const WS_BASE = API_BASE.replace(/^http/, "ws");

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-accent bg-accent/10 border-accent/20",
  MEDIUM:
    "text-accent-secondary bg-accent-secondary/10 border-accent-secondary/20",
  HARD: "text-accent-tertiary bg-accent-tertiary/10 border-accent-tertiary/20",
};

const STARTER_CODE: Record<string, string> = {
  javascript: "// Write your solution here\nfunction solution() {\n  \n}\n",
  typescript:
    "// Write your solution here\nfunction solution(): void {\n  \n}\n",
  python: "# Write your solution here\ndef solution():\n    pass\n",
  java: '// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}\n',
  cpp: "// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solution() {\n    \n}\n",
  go: "// Write your solution here\npackage main\n\nfunc solution() {\n\t\n}\n",
  rust: "// Write your solution here\nfn solution() {\n    \n}\n",
};

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "go",
  "rust",
];

interface Participant {
  userId: string;
  name: string;
  role: string;
  micOn: boolean;
  camOn: boolean;
  handRaised?: boolean;
}

interface PendingParticipant {
  userId?: string;
  name: string;
  isGuest: boolean;
  requestedAt: string;
}

interface ChatMessage {
  sender: string;
  text: string;
  ts: number;
  mine?: boolean;
}

type RightTab = "chat" | "output" | "ai" | "participants";
type LeftTab = "description" | "tests";

function RemoteVideo({ stream, name }: { stream: MediaStream; name: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden border border-white/10 shadow-xl group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity">
        {name}
      </div>
    </div>
  );
}

function MeetingInner({
  socket,
  code: meetingCode,
}: {
  socket: Socket | null;
  code: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useStore();
  const {
    localStream,
    remoteStreams,
    joinMedia,
    leaveMedia,
    toggleAudio,
    toggleVideo,
    audioEnabled,
    videoEnabled,
    getPeerConnections,
  } = useMedia();
  const { remoteNames, remoteSocketToUserId } = useMedia();

  // Meeting-specific state
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pendingParticipants, setPendingParticipants] = useState<
    PendingParticipant[]
  >([]);
  const [handRaised, setHandRaised] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [admitted, setAdmitted] = useState(
    !!(location.state as any)?.admitted,
  );
  const [codingMode, setCodingMode] = useState(false);
  const [editorAccess, setEditorAccess] = useState<string[]>([]);
  const [meetingInfo, setMeetingInfo] = useState<{
    problem?: string;
    difficulty?: string;
    language?: string;
    id?: string;
    roomId?: string;
  }>({});

  // Problem state (from SessionView)
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [leftTab, setLeftTab] = useState<LeftTab>("description");
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<RunTestsResult | null>(null);

  // Editor state (from SessionView)
  const [code, setCode] = useState("// Your code here...");
  const [language, setLanguage] = useState("javascript");
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Execution state (from SessionView)
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [liveTranscriptCount, setLiveTranscriptCount] = useState(0);
  const [finalizingMeeting, setFinalizingMeeting] = useState(false);

  // Chat state (from SessionView)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatTypingUsers, setChatTypingUsers] = useState<Set<string>>(
    new Set(),
  );
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatTypingTimeouts = useRef<
    Map<string, ReturnType<typeof setTimeout>>
  >(new Map());

  // Socket-based editor typing writers (fallback when Yjs awareness not available)
  const [socketTypingWriters, setSocketTypingWriters] = useState<string[]>([]);
  const socketTypingTimeouts = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // UI state
  const [rightTab, setRightTab] = useState<RightTab>("chat");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // Network quality state (from SessionView)
  type NetQuality = "good" | "fair" | "poor" | "unknown";
  const [netQuality, setNetQuality] = useState<NetQuality>("unknown");
  const [netStats, setNetStats] = useState<{ rtt?: number; loss?: number }>({});

  // AI hints state (host-only)
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  // Yjs refs (from SessionView)
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const yjsProviderRef = useRef<WebsocketProvider | null>(null);
  const monacoEditorRef = useRef<IStandaloneCodeEditor | null>(null);
  const [yjsConnected, setYjsConnected] = useState(false);
  const isApplyingYjs = useRef(false);
  const [remoteUsers, setRemoteUsers] = useState<
    Array<{ name: string; color: string; typing?: boolean }>
  >([]);
  const [activeWriters, setActiveWriters] = useState<string[]>([]);
  const localTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-save state
  const lastSavedCode = useRef("");
  const snapshotTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  const joinedAt = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(Math.floor((Date.now() - joinedAt.current) / 1000)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  // ==========================================
  // Meeting socket events
  // ==========================================
  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("join-meeting", {
      code: meetingCode,
      userId: user.id || (user as any)._id,
      name: user.name,
    });
    joinMedia(meetingCode, user.id || (user as any)._id, user.name);

    socket.on("meeting:participants", (list: Participant[]) => {
      setParticipants(list);
      const isMeAdmitted = list.some(
        (p) => p.userId === (user.id || (user as any)._id),
      );
      if (isMeAdmitted) setAdmitted(true);
    });

    socket.on("meeting:admitted", () => {
      setAdmitted(true);
      toast.success("You have been admitted to the meeting");
    });

    socket.on("meeting:participant-joined", (p: Participant) => {
      setParticipants((prev) => {
        const exists = prev.find((x) => x.userId === p.userId);
        return exists ? prev : [...prev, p];
      });
      toast(`${p.name} joined`);
    });

    socket.on("meeting:participant-left", ({ userId, name }: any) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== userId));
      toast(`${name} left`);
    });

    socket.on("meeting:chat-message", (msg: ChatMessage) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, mine: msg.sender === user?.name },
      ]);
    });

    socket.on("meeting:mic-status", ({ userId, micOn }: any) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, micOn } : p)),
      );
    });

    socket.on("meeting:cam-status", ({ userId, camOn }: any) => {
      setParticipants((prev) =>
        prev.map((p) => (p.userId === userId ? { ...p, camOn } : p)),
      );
    });

    socket.on("meeting:hand-raised", ({ userId, raised }: any) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.userId === userId ? { ...p, handRaised: raised } : p,
        ),
      );
    });

    socket.on("meeting:info", (info: any) => {
      setIsHost(info.hostId === user.id || info.hostId === (user as any)._id);
      if (info.hostId === (user.id || (user as any)._id)) setAdmitted(true);
      if (info.pendingParticipants)
        setPendingParticipants(info.pendingParticipants);
      if (info.codingModeEnabled !== undefined)
        setCodingMode(info.codingModeEnabled);
      if (info.editorAccess) setEditorAccess(info.editorAccess);
      if (info.code) setCode(info.code);
      if (info.language) setLanguage(info.language);
    });

    socket.on("meeting:editor-access-updated", (accessList: string[]) => {
      setEditorAccess(accessList);
      const hasAccess = accessList.includes(user.id || (user as any)._id);
      if (hasAccess) {
        toast.success("You have been granted editor access");
      }
    });

    socket.on("meeting:coding-toggled", ({ enabled }: any) => {
      setCodingMode(enabled);
      toast(
        enabled ? "Host enabled coding mode" : "Host disabled coding mode",
        { icon: enabled ? "💻" : "🎥" },
      );
    });

    socket.on("coding:sync", ({ code: newCode, language: lang }: any) => {
      setCode(newCode);
      if (lang) setLanguage(lang);
      // Also update Yjs document if connected
      const ytext = ytextRef.current;
      const ydoc = ydocRef.current;
      if (ytext && ydoc && ytext.toString() !== newCode) {
        isApplyingYjs.current = true;
        ydoc.transact(() => {
          ytext.delete(0, ytext.length);
          ytext.insert(0, newCode);
        });
        isApplyingYjs.current = false;
      }
    });

    // Socket.IO typing indicator for coding — drives real-time "who is typing" display
    socket.on("meeting:coding-typing-indicator", ({ userId, name }: any) => {
      if (!name || userId === user?.id || name === user?.name) return;
      // Add to socket typing writers
      setSocketTypingWriters((prev) =>
        prev.includes(name) ? prev : [...prev, name]
      );
      // Auto-clear after 1.5 s of no activity
      const existing = socketTypingTimeouts.current.get(name);
      if (existing) clearTimeout(existing);
      socketTypingTimeouts.current.set(
        name,
        setTimeout(() => {
          setSocketTypingWriters((prev) => prev.filter((n) => n !== name));
          socketTypingTimeouts.current.delete(name);
        }, 1500),
      );
    });

    socket.on("meeting:pending-list-updated", (list: PendingParticipant[]) => {
      setPendingParticipants(list);
    });

    socket.on("meeting:ended", () => {
      toast.error("The meeting has been ended by the host.");
      leaveMedia();
      navigate("/dashboard");
    });

    // Chat typing indicators
    socket.on("meeting:chat-typing", ({ name: typerName }: any) => {
      if (typerName === user?.name) return;
      setChatTypingUsers((prev) => new Set(prev).add(typerName));
      const existing = chatTypingTimeouts.current.get(typerName);
      if (existing) clearTimeout(existing);
      chatTypingTimeouts.current.set(
        typerName,
        setTimeout(() => {
          setChatTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(typerName);
            return next;
          });
          chatTypingTimeouts.current.delete(typerName);
        }, 3000),
      );
    });

    socket.on("meeting:chat-stop-typing", ({ name: typerName }: any) => {
      setChatTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(typerName);
        return next;
      });
      const existing = chatTypingTimeouts.current.get(typerName);
      if (existing) clearTimeout(existing);
      chatTypingTimeouts.current.delete(typerName);
    });

    return () => {
      socket.off("meeting:participants");
      socket.off("meeting:admitted");
      socket.off("meeting:participant-joined");
      socket.off("meeting:participant-left");
      socket.off("meeting:chat-message");
      socket.off("meeting:mic-status");
      socket.off("meeting:cam-status");
      socket.off("meeting:hand-raised");
      socket.off("meeting:info");
      socket.off("meeting:editor-access-updated");
      socket.off("meeting:coding-toggled");
      socket.off("coding:sync");
      socket.off("meeting:coding-typing-indicator");
      socket.off("meeting:pending-list-updated");
      socket.off("meeting:ended");
      socket.off("meeting:chat-typing");
      socket.off("meeting:chat-stop-typing");
    };
  }, [socket, meetingCode, user, joinMedia, leaveMedia, navigate]);

  // Fetch meeting details
  useEffect(() => {
    if (!meetingCode) return;
    meetingsApi
      .get(meetingCode)
      .then((info) => {
        setMeetingInfo({
          problem: info.problem,
          difficulty: info.difficulty,
          language: info.language,
          id: info.id,
          roomId: info.roomId,
        });
        if (info.language) setLanguage(info.language);
      })
      .catch(() => {});
  }, [meetingCode]);

  // Fetch full problem details (from SessionView)
  useEffect(() => {
    if (!meetingInfo.problem || meetingInfo.problem === "Meeting") return;
    problemsApi
      .getBySlug(meetingInfo.problem)
      .then(setProblem)
      .catch(() => {});
  }, [meetingInfo.problem]);

  // Real-time audio chunk capture and upload for meeting analysis
  useEffect(() => {
    if (!meetingInfo.id || !admitted || !localStream || !audioEnabled) return;
    if (audioRecorderRef.current) return;
    if (typeof MediaRecorder === "undefined") return;

    const sourceTracks = localStream.getAudioTracks();
    if (!sourceTracks.length) return;

    const clonedTracks = sourceTracks.map((track) => track.clone());
    const audioOnlyStream = new MediaStream(clonedTracks);

    let recorder: MediaRecorder;
    try {
      const preferredMime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      recorder = new MediaRecorder(audioOnlyStream, { mimeType: preferredMime });
    } catch {
      clonedTracks.forEach((track) => track.stop());
      return;
    }

    audioRecorderRef.current = recorder;

    recorder.ondataavailable = async (event) => {
      if (!meetingInfo.id || !event.data || event.data.size < 2048) return;
      try {
        await sessionsApi.uploadAudioChunk(
          meetingInfo.id,
          event.data,
          isHost ? "interviewer" : "candidate",
        );
        setLiveTranscriptCount((prev) => prev + 1);
      } catch {
        // Keep meeting uninterrupted if chunk upload fails
      }
    };

    recorder.start(15000);

    return () => {
      if (audioRecorderRef.current && audioRecorderRef.current.state !== "inactive") {
        audioRecorderRef.current.stop();
      }
      audioRecorderRef.current = null;
      clonedTracks.forEach((track) => track.stop());
    };
  }, [meetingInfo.id, admitted, localStream, audioEnabled, isHost]);

  // ==========================================
  // Yjs collaborative editing (from SessionView)
  // ==========================================
  useEffect(() => {
    if (!meetingCode || !token || !codingMode) return;

    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("code");
    ydocRef.current = ydoc;
    ytextRef.current = ytext;

    const wsUrl = `${WS_BASE}/yjs?token=${encodeURIComponent(token)}`;
    const provider = new WebsocketProvider(
      wsUrl,
      `meeting-${meetingCode}`,
      ydoc,
      { connect: true },
    );
    yjsProviderRef.current = provider;

    provider.on("status", ({ status }: any) =>
      setYjsConnected(status === "connected"),
    );

    const COLORS = [
      "#60a5fa",
      "#f472b6",
      "#34d399",
      "#fb923c",
      "#a78bfa",
      "#facc15",
    ];
    const myColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    provider.awareness.setLocalStateField("user", {
      name: user?.name || "Anonymous",
      color: myColor,
    });
    provider.awareness.setLocalStateField("typing", false);

    let remoteDecorationIds: string[] = [];
    const updateRemoteUsers = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const others = states.filter(([clientId]) => clientId !== ydoc.clientID);
      const remotePresence = others
        .map(([, state]) => {
          const remoteUser = (state as any).user;
          if (!remoteUser) return null;
          return {
            ...remoteUser,
            typing: Boolean((state as any).typing),
          };
        })
        .filter(Boolean) as Array<{ name: string; color: string; typing?: boolean }>;

      setRemoteUsers(remotePresence);
      setActiveWriters(
        remotePresence.filter((remoteUser) => remoteUser.typing).map((remoteUser) => remoteUser.name),
      );

      const editor = monacoEditorRef.current;
      if (!editor) return;

      const newDecorations: any[] = [];
      states.forEach(([clientId, state]) => {
        if (
          clientId === ydoc.clientID ||
          !(state as any).user ||
          !(state as any).selection
        )
          return;
        const { anchor, head } = (state as any).selection;
        const model = editor.getModel();
        if (!model) return;
        const startPos = model.getPositionAt(Math.min(anchor, head));
        const endPos = model.getPositionAt(Math.max(anchor, head));
        const cursorPos = model.getPositionAt(head);

        if (anchor !== head) {
          newDecorations.push({
            range: new (window as any).monaco.Range(
              startPos.lineNumber,
              startPos.column,
              endPos.lineNumber,
              endPos.column,
            ),
            options: { className: "yRemoteSelection", stickiness: 1 },
          });
        }
        newDecorations.push({
          range: new (window as any).monaco.Range(
            cursorPos.lineNumber,
            cursorPos.column,
            cursorPos.lineNumber,
            cursorPos.column,
          ),
          options: {
            className: "yRemoteSelectionHead",
            beforeContentClassName: `yRemoteSelectionHeadLabel-${clientId}`,
            stickiness: 1,
          },
        });
        const styleId = `yjs-cursor-style-${clientId}`;
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = styleId;
          document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = `.yRemoteSelectionHeadLabel-${clientId}::after { content: "${(state as any).user.name}"; background-color: ${(state as any).user.color}; } .yRemoteSelectionHead { border-color: ${(state as any).user.color}; }`;
      });
      remoteDecorationIds = editor.deltaDecorations(
        remoteDecorationIds,
        newDecorations,
      );
    };
    provider.awareness.on("change", updateRemoteUsers);

    const handleSelectionChange = () => {
      const editor = monacoEditorRef.current;
      const model = editor?.getModel();
      if (!editor || !model) return;
      const selection = editor.getSelection();
      if (selection) {
        provider.awareness.setLocalStateField("selection", {
          anchor: model.getOffsetAt(selection.getStartPosition()),
          head: model.getOffsetAt(selection.getEndPosition()),
        });
      }
    };
    const monacoSelectionSub =
      monacoEditorRef.current?.onDidChangeCursorSelection(
        handleSelectionChange,
      );

    ytext.observe(() => {
      const newContent = ytext.toString();
      setCode(newContent);
      const editor = monacoEditorRef.current;
      const editorModel = editor?.getModel();
      if (editorModel && editorModel.getValue() !== newContent) {
        isApplyingYjs.current = true;
        const pos = editor?.getPosition();
        editorModel.setValue(newContent);
        if (pos) editor?.setPosition(pos);
        isApplyingYjs.current = false;
      }
    });

    // Initialize Yjs with current code if empty
    if (ytext.length === 0 && code) {
      ydoc.transact(() => {
        ytext.insert(0, code);
      });
    }

    return () => {
      if (localTypingTimeout.current) clearTimeout(localTypingTimeout.current);
      monacoSelectionSub?.dispose();
      provider.disconnect();
      ydoc.destroy();
      yjsProviderRef.current = null;
    };
  }, [meetingCode, token, codingMode, user?.name]);

  // Chat typing logic
  useEffect(() => {
    if (!socket || !meetingCode) return;
    const timeout = setTimeout(() => {
      socket.emit("meeting:chat-stop-typing", { code: meetingCode });
    }, 2000);
    if (chatInput) socket.emit("meeting:chat-typing", { code: meetingCode });
    return () => clearTimeout(timeout);
  }, [chatInput, socket, meetingCode]);

  // Auto-save snapshots every 30s
  useEffect(() => {
    if (!meetingInfo.id || !codingMode) return;
    snapshotTimer.current = setInterval(() => {
      const currentCode = ytextRef.current?.toString() || code;
      if (currentCode && currentCode !== lastSavedCode.current) {
        lastSavedCode.current = currentCode;
        roomsApi
          .snapshot(meetingInfo.id!, { content: currentCode, language })
          .catch(() => {});
      }
    }, 30000);
    return () => {
      if (snapshotTimer.current) clearInterval(snapshotTimer.current);
    };
  }, [meetingInfo.id, codingMode, code, language]);

  // Network quality via WebRTC getStats (from SessionView)
  useEffect(() => {
    const id = setInterval(async () => {
      const pcs = getPeerConnections();
      if (pcs.size === 0) {
        setNetQuality("unknown");
        return;
      }
      const pc = pcs.values().next().value as RTCPeerConnection;
      try {
        const stats = await pc.getStats();
        let rtt: number | undefined;
        let packetsLost = 0,
          packetsReceived = 0;
        stats.forEach((r: RTCStats) => {
          if (r.type === "remote-inbound-rtp") {
            const rr = r as any;
            if (typeof rr.roundTripTime === "number")
              rtt = rr.roundTripTime * 1000;
            packetsLost += rr.packetsLost || 0;
          }
          if (r.type === "inbound-rtp") {
            const ir = r as any;
            packetsReceived += ir.packetsReceived || 0;
          }
        });
        const total = packetsReceived + packetsLost;
        const loss = total > 0 ? (packetsLost / total) * 100 : 0;
        let q: NetQuality = "unknown";
        if (rtt !== undefined) {
          if (rtt < 150 && loss < 1) q = "good";
          else if (rtt < 300 && loss < 5) q = "fair";
          else q = "poor";
        }
        setNetQuality(q);
        setNetStats({
          rtt: rtt ? Math.round(rtt) : undefined,
          loss: Math.round(loss * 10) / 10,
        });
      } catch {
        /* ignore */
      }
    }, 3000);
    return () => clearInterval(id);
  }, [getPeerConnections]);

  // AI hints — listen for hint from server (from SessionView)
  useEffect(() => {
    if (!socket) return;
    const onHint = ({ hint }: { hint: string }) => {
      setHintLoading(false);
      toast(hint, { duration: 10_000, icon: "💡" });
    };
    socket.on("ai:hint", onHint);
    return () => {
      socket.off("ai:hint", onHint);
    };
  }, [socket]);

  // AI hints — auto-request when host enables hints (from SessionView)
  useEffect(() => {
    if (!hintsEnabled || !socket || !meetingCode || !meetingInfo.id) return;
    const request = () => {
      const currentCode = ytextRef.current?.toString() || code;
      if (!currentCode.trim()) return;
      setHintLoading(true);
      socket.emit("ai:hint-request", {
        roomId: meetingInfo.id,
        code: currentCode,
        language,
        problem: meetingInfo.problem || "",
      });
    };
    request();
    const id = setInterval(request, 45_000);
    return () => clearInterval(id);
  }, [
    hintsEnabled,
    socket,
    meetingCode,
    meetingInfo.id,
    meetingInfo.problem,
    code,
    language,
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatTypingUsers, rightTab]);

  // ==========================================
  // Monaco editor mount handler with Yjs + Socket.IO sync
  // ==========================================
  // Debounce Socket.IO code updates (like CodePair)
  const debouncedCodeUpdate = useRef<any>(null);
  const debouncedTypingEmit = useRef<any>(null);

  const handleEditorMount = useCallback(
    (editorInstance: IStandaloneCodeEditor) => {
      monacoEditorRef.current = editorInstance;
      editorInstance.onDidChangeModelContent((e) => {
        if (isApplyingYjs.current) return;
        
        // 1. Update Yjs (primary collaborative sync)
        const provider = yjsProviderRef.current;
        const ytext = ytextRef.current;
        const ydoc = ydocRef.current;
        
        if (provider) {
          provider.awareness.setLocalStateField("typing", true);
        }

        // 2. Emit Socket.IO typing indicator (secondary, for cross-feature compatibility)
        if (debouncedTypingEmit.current) clearTimeout(debouncedTypingEmit.current);
        debouncedTypingEmit.current = setTimeout(() => {
          socket?.emit("meeting:coding-typing", { code: meetingCode });
        }, 50);

        // 3. Clear typing state after inactivity
        if (localTypingTimeout.current) clearTimeout(localTypingTimeout.current);
        localTypingTimeout.current = setTimeout(() => {
          if (provider) {
            provider.awareness.setLocalStateField("typing", false);
          }
        }, 1200);

        if (!ytext || !ydoc) {
          // Fallback: if Yjs not connected, use socket sync
          const newCode = editorInstance.getValue();
          setCode(newCode);
          
          // Debounce Socket.IO code updates
          if (debouncedCodeUpdate.current) clearTimeout(debouncedCodeUpdate.current);
          debouncedCodeUpdate.current = setTimeout(() => {
            socket?.emit("coding:update", {
              code: meetingCode,
              newCode,
              language,
            });
          }, 100);
          return;
        }

        // Apply Yjs changes
        ydoc.transact(() => {
          const changes = [...e.changes].sort(
            (a, b) => b.rangeOffset - a.rangeOffset,
          );
          changes.forEach((change) => {
            if (change.rangeLength > 0)
              ytext.delete(change.rangeOffset, change.rangeLength);
            if (change.text) ytext.insert(change.rangeOffset, change.text);
          });
        });

        // Also emit Socket.IO coding update for fallback sync (like CodePair)
        if (debouncedCodeUpdate.current) clearTimeout(debouncedCodeUpdate.current);
        debouncedCodeUpdate.current = setTimeout(() => {
          const newCode = editorInstance.getValue();
          socket?.emit("coding:update", {
            code: meetingCode,
            newCode,
            language,
          });
        }, 100);
      });
    },
    [socket, meetingCode, language],
  );

  const canEdit =
    Boolean(user && (isHost || admitted || editorAccess.includes(user?.id || (user as any)?._id)));

  useEffect(() => {
    if (!isHost && rightTab === "ai") {
      setRightTab("chat");
    }
  }, [isHost, rightTab]);

  // ==========================================
  // Handlers
  // ==========================================

  // Code execution (from SessionView — inline with stdin/stdout/stderr)
  const handleRun = async () => {
    const currentCode = ytextRef.current?.toString() || code;
    if (!currentCode.trim()) return;
    setExecuting(true);
    setRightTab("output");
    try {
      const result = await codeExecutionApi.execute({
        language,
        code: currentCode,
        stdin: stdin || undefined,
      });
      setExecResult(result);
    } catch {
      toast.error("Execution failed");
    } finally {
      setExecuting(false);
    }
  };

  // Test running (from SessionView)
  const handleRunTests = async () => {
    const currentCode = ytextRef.current?.toString() || code;
    if (!currentCode.trim() || !problem) return;
    setRunningTests(true);
    setLeftTab("tests");
    try {
      const res = await problemsApi.runTests(problem.title, {
        language,
        code: currentCode,
      });
      setTestResults(res);
    } catch {
      toast.error("Failed to run tests");
    } finally {
      setRunningTests(false);
    }
  };

  // AI analysis (from SessionView)
  const handleAnalyze = async () => {
    if (!isHost) {
      toast.error("Only the meeting host can analyze code");
      return;
    }
    const currentCode = ytextRef.current?.toString() || code;
    if (!currentCode.trim() || !meetingInfo.id) return;
    setAnalyzing(true);
    setRightTab("ai");
    try {
      const { aiAnalysis } = await roomsApi.analyze(meetingInfo.id, {
        code: currentCode,
        language,
      });
      setAnalysis(aiAnalysis);
      toast.success("AI analysis complete");
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket?.emit("meeting:chat", { code: meetingCode, text: chatInput.trim() });
    socket?.emit("meeting:chat-stop-typing", { code: meetingCode });
    setChatInput("");
  };

  const handleLeave = () => {
    if (window.confirm("Leave the meeting?")) {
      leaveMedia();
      navigate("/dashboard");
    }
  };

  const handleToggleMic = () => {
    const next = !audioEnabled;
    toggleAudio();
    socket?.emit("meeting:mic-toggle", { code: meetingCode, micOn: next });
  };

  const handleToggleCam = () => {
    const next = !videoEnabled;
    toggleVideo();
    socket?.emit("meeting:cam-toggle", { code: meetingCode, camOn: next });
  };

  const handleRaiseHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    socket?.emit("meeting:hand-raise", { code: meetingCode, raised: next });
  };

  const handleAdmit = (pendingUserId: string) => {
    socket?.emit("meeting:admit", { code: meetingCode, pendingUserId });
  };

  const handleDeny = (pendingUserId: string) => {
    socket?.emit("meeting:deny", { code: meetingCode, pendingUserId });
  };

  const handleEndMeeting = async () => {
    if (!window.confirm("End the meeting for everyone?")) return;

    setFinalizingMeeting(true);
    try {
      if (meetingInfo.id) {
        await sessionsApi.finalizeMeeting(meetingInfo.id);
        await roomsApi.end(meetingInfo.id);
      }
      toast.success("Meeting finalized. Report email sent to interviewer and generic email sent to candidate.");
    } catch {
      toast.error("Meeting ended, but report finalization failed. You can retry from session report endpoint.");
    } finally {
      if (audioRecorderRef.current && audioRecorderRef.current.state !== "inactive") {
        audioRecorderRef.current.stop();
      }
      socket?.emit("meeting:end-for-all", { code: meetingCode });
      setFinalizingMeeting(false);
    }
  };

  const toggleCodingMode = () => {
    socket?.emit("meeting:toggle-coding", {
      code: meetingCode,
      enabled: !codingMode,
    });
  };

  const handleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    } else {
      try {
        const stream = await (navigator.mediaDevices as any).getDisplayMedia({
          video: true,
        });
        setScreenStream(stream);
        stream.getVideoTracks()[0].onended = () => setScreenStream(null);
      } catch {
        /* user cancelled */
      }
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setShowLangMenu(false);
    setExecResult(null);
    socket?.emit("coding:update", {
      code: meetingCode,
      newCode: code,
      language: lang,
    });
  };

  // Video grid helper
  const allStreams = Array.from(remoteStreams.entries());
  // Always count self — local tile shows avatar when camera is off
  const gridCount = allStreams.length + 1;

  // ==========================================
  // Waiting screen
  // ==========================================
  if (!admitted && !isHost) {
    return (
      <div className="h-screen w-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center relative">
          <Loader2 className="animate-spin text-white/40" size={32} />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#137fec] text-white rounded-full flex items-center justify-center shadow-lg">
            <Shield size={14} />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">
            Waiting for host to admit you...
          </h3>
          <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
            Stay on this screen. You'll be admitted as soon as the interviewer
            is ready.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-6 py-2 rounded-xl bg-white/05 border border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
        >
          Leave Room
        </button>
      </div>
    );
  }

  // ==========================================
  // Main UI — exact SessionView layout
  // ==========================================
  return (
    <div className="h-screen bg-bg-900 flex flex-col overflow-hidden">
      {/* Top Bar — exact SessionView layout + meeting extras */}
      <div className="flex items-center gap-2 px-2 sm:px-4 h-12 border-b border-border shrink-0 z-20 overflow-x-auto">
        <button
          onClick={() => {
            leaveMedia();
            navigate("/dashboard");
          }}
          className="flex items-center gap-1.5 text-neutral-500 hover:text-white transition-colors text-xs"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
        <div className="w-px h-4 bg-border" />
        <span className="text-white font-semibold text-sm truncate max-w-xs">
          {meetingCode}
        </span>
        {liveTranscriptCount > 0 && (
          <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Audio analyzed: {liveTranscriptCount} chunks
          </span>
        )}
        <button
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/join/${meetingCode}`,
            );
            toast.success("Meeting link copied");
          }}
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
          title="Copy join link"
        >
          <Share size={12} />
        </button>

                  disabled={finalizingMeeting}
        {meetingInfo.problem && meetingInfo.problem !== "Meeting" && (
          <>
                  {finalizingMeeting ? "Finalizing..." : "End Meeting"}
            <span className="hidden sm:inline text-xs text-neutral-400 font-medium truncate max-w-[180px]">
              {meetingInfo.problem}
            </span>
            {meetingInfo.difficulty && (
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[meetingInfo.difficulty] || DIFFICULTY_COLORS.MEDIUM}`}
              >
                {meetingInfo.difficulty}
              </span>
            )}
          </>
        )}

        <div className="flex-1" />

        {/* Media Controls — exact from SessionView */}
        <div className="flex items-center gap-1.5 glass-panel px-1 py-1 rounded-xl">
          <button
            onClick={handleToggleMic}
            className={`p-1.5 rounded-lg transition-colors ${audioEnabled ? "text-neutral-400 hover:bg-white/10" : "text-red-400 bg-red-400/10"}`}
          >
            {audioEnabled ? <Mic size={14} /> : <MicOff size={14} />}
          </button>
          <button
            onClick={handleToggleCam}
            className={`p-1.5 rounded-lg transition-colors ${videoEnabled ? "text-neutral-400 hover:bg-white/10" : "text-red-400 bg-red-400/10"}`}
          >
            {videoEnabled ? <Video size={14} /> : <VideoOff size={14} />}
          </button>
          <button
            onClick={handleScreenShare}
            title={screenStream ? "Stop sharing" : "Share screen"}
            className={`p-1.5 rounded-lg transition-colors ${screenStream ? "text-accent-tertiary bg-accent-tertiary/10" : "text-neutral-400 hover:bg-white/10"}`}
          >
            <Monitor size={14} />
          </button>
        </div>

        {/* Timer — exact from SessionView */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
          <Clock size={13} />
          <span>
            {Math.floor(elapsed / 60)}:
            {String(elapsed % 60).padStart(2, "0")}
          </span>
        </div>

        {/* Coding mode toggle — host only */}
        {isHost && (
          <button
            onClick={toggleCodingMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
              codingMode
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                : "bg-white/[0.04] border-white/[0.06] text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Code2 size={11} /> {codingMode ? "Code On" : "Code Off"}
          </button>
        )}

        {/* Network Quality Indicator — exact from SessionView */}
        {(() => {
          const NET_DOT: Record<string, string> = {
            good: "#22c55e",
            fair: "#f59e0b",
            poor: "#ef4444",
            unknown: "#4b5563",
          };
          const NET_LABEL: Record<string, string> = {
            good: "Excellent",
            fair: "Fair",
            poor: "Poor",
            unknown: "No peers",
          };
          return (
            <div className="relative group flex items-center">
              <div
                className="w-2 h-2 rounded-full cursor-default"
                style={{
                  backgroundColor: NET_DOT[netQuality],
                  boxShadow:
                    netQuality !== "unknown"
                      ? `0 0 6px ${NET_DOT[netQuality]}90`
                      : "none",
                }}
              />
              <div className="absolute top-full right-0 mt-2 px-3 py-2 rounded-xl bg-[#0f0f0f] border border-white/[0.08] text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl min-w-[140px]">
                <div
                  className="font-semibold mb-1"
                  style={{ color: NET_DOT[netQuality] }}
                >
                  Network: {NET_LABEL[netQuality]}
                </div>
                {netStats.rtt !== undefined && (
                  <div className="text-neutral-400 font-mono">
                    RTT: {netStats.rtt}ms
                  </div>
                )}
                {(netStats.loss ?? 0) > 0 && (
                  <div className="text-neutral-400 font-mono">
                    Loss: {netStats.loss}%
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* AI Hints Toggle — host only, coding mode */}
        {isHost && codingMode && (
          <button
            onClick={() => setHintsEnabled((v) => !v)}
            title={
              hintsEnabled ? "Disable AI hints" : "Send AI hints to candidate"
            }
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${hintsEnabled ? "bg-accent-tertiary/10 border-accent-tertiary/30 text-accent-tertiary" : "bg-white/[0.04] border-white/[0.06] text-neutral-500 hover:text-neutral-300"}`}
          >
            {hintLoading ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Zap size={11} />
            )}
            {hintsEnabled ? "Hints On" : "Hints"}
          </button>
        )}

        {/* Analyze — from SessionView */}
        {codingMode && isHost && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-300 hover:bg-white/[0.08] text-xs"
          >
            {analyzing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Brain size={12} />
            )}{" "}
            Analyze
          </button>
        )}

        {/* Hand raise */}
        <button
          onClick={handleRaiseHand}
          className={`p-1.5 rounded-lg transition-colors ${handRaised ? "text-yellow-400 bg-yellow-400/10" : "text-neutral-500 hover:bg-white/10"}`}
        >
          <Hand size={14} />
        </button>

        {/* Pending badge */}
        {isHost && pendingParticipants.length > 0 && (
          <button
            onClick={() => setRightTab("participants")}
            className="relative p-1.5 rounded-lg text-neutral-400 hover:bg-white/10"
          >
            <Shield size={14} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] flex items-center justify-center rounded-full border border-black font-bold animate-pulse">
              {pendingParticipants.length}
            </span>
          </button>
        )}

        {/* End / Leave */}
        {isHost ? (
          <button
            onClick={handleEndMeeting}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <Square size={12} /> End
          </button>
        ) : (
          <button
            onClick={handleLeave}
            className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-neutral-300 text-xs hover:bg-white/[0.08] transition-colors flex items-center gap-1.5"
          >
            <PhoneOff size={12} className="text-red-400" /> Leave
          </button>
        )}
      </div>

      {/* Main — three-panel layout (from SessionView) */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Problem — exact from SessionView */}
        {codingMode &&
          meetingInfo.problem &&
          meetingInfo.problem !== "Meeting" && (
            <div
              className={`flex flex-col border-b lg:border-b-0 lg:border-r border-border bg-bg-900 overflow-hidden transition-all shrink-0 ${leftCollapsed ? "h-10 lg:w-10 w-full lg:h-full" : "w-full lg:w-80 h-[35vh] lg:h-full"}`}
            >
              <div className="flex items-center px-3 py-2 border-b border-border shrink-0">
                {!leftCollapsed && (
                  <>
                    <button
                      onClick={() => setLeftTab("description")}
                      className={`text-[10px] uppercase font-mono tracking-widest px-2 py-1 rounded transition-colors ${leftTab === "description" ? "text-white" : "text-neutral-600 hover:text-neutral-400"}`}
                    >
                      Problem
                    </button>
                    <button
                      onClick={() => setLeftTab("tests")}
                      className={`text-[10px] uppercase font-mono tracking-widest px-2 py-1 rounded transition-colors flex items-center gap-1 ${leftTab === "tests" ? "text-white" : "text-neutral-600 hover:text-neutral-400"}`}
                    >
                      <FlaskConical size={10} /> Tests
                      {testResults && (
                        <span
                          className={`text-[9px] font-bold ml-0.5 ${testResults.passed === testResults.total ? "text-accent" : "text-red-400"}`}
                        >
                          {testResults.passed}/{testResults.total}
                        </span>
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setLeftCollapsed(!leftCollapsed)}
                  className="ml-auto text-neutral-600 hover:text-white transition-colors"
                >
                  {leftCollapsed ? (
                    <PanelLeftOpen size={14} />
                  ) : (
                    <PanelLeftClose size={14} />
                  )}
                </button>
              </div>

              {!leftCollapsed && leftTab === "description" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-sm font-bold text-white">
                        {meetingInfo.problem}
                      </h2>
                      {meetingInfo.difficulty && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[meetingInfo.difficulty] || DIFFICULTY_COLORS.MEDIUM}`}
                        >
                          {meetingInfo.difficulty}
                        </span>
                      )}
                    </div>
                    {problem?.tags && (
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-mono px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-neutral-500"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-neutral-400 leading-relaxed">
                    {problem?.description || "Loading problem description..."}
                  </div>

                  {problem?.examples && problem.examples.length > 0 && (
                    <div className="space-y-3">
                      {problem.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="bg-black/30 border border-white/[0.05] rounded-xl p-3 space-y-2"
                        >
                          <span className="text-[9px] font-mono text-neutral-600 uppercase">
                            Example {i + 1}
                          </span>
                          <div>
                            <span className="text-[9px] font-mono text-neutral-600 block">
                              Input:
                            </span>
                            <pre className="text-[11px] font-mono text-neutral-300 whitespace-pre-wrap">
                              {ex.input}
                            </pre>
                          </div>
                          <div>
                            <span className="text-[9px] font-mono text-neutral-600 block">
                              Output:
                            </span>
                            <pre className="text-[11px] font-mono text-accent-tertiary whitespace-pre-wrap">
                              {ex.output}
                            </pre>
                          </div>
                          {ex.explanation && (
                            <p className="text-[10px] text-neutral-500 italic">
                              {ex.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem && (
                    <button
                      onClick={handleRunTests}
                      disabled={runningTests}
                      className="w-full flex items-center justify-center gap-2 py-2 mt-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors disabled:opacity-50"
                    >
                      {runningTests ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <FlaskConical size={12} />
                      )}
                      {runningTests ? "Running..." : "Run Test Cases"}
                    </button>
                  )}
                </div>
              )}

              {!leftCollapsed && leftTab === "tests" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <button
                    onClick={handleRunTests}
                    disabled={runningTests || !problem}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors disabled:opacity-50"
                  >
                    {runningTests ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Play size={12} />
                    )}
                    {runningTests ? "Running..." : "Run Tests"}
                  </button>

                  {runningTests && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-neutral-500">
                      <Loader2
                        size={20}
                        className="animate-spin text-accent"
                      />
                      <span className="text-[10px] font-mono uppercase tracking-widest animate-pulse">
                        Running test cases...
                      </span>
                    </div>
                  )}

                  {testResults && !runningTests && (
                    <div className="space-y-2">
                      <div
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border ${testResults.passed === testResults.total ? "bg-accent/5 border-accent/20 text-accent" : "bg-red-500/5 border-red-500/20 text-red-400"}`}
                      >
                        <span className="text-xs font-bold">
                          {testResults.passed === testResults.total
                            ? "✓ All Tests Passed"
                            : `${testResults.passed}/${testResults.total} Passed`}
                        </span>
                        <span className="text-[10px] font-mono">
                          {testResults.passed}/{testResults.total}
                        </span>
                      </div>

                      {testResults.results.map((tc) => (
                        <div
                          key={tc.index}
                          className={`rounded-xl border overflow-hidden ${tc.passed ? "border-accent/15 bg-accent/5" : "border-red-500/20 bg-red-500/5"}`}
                        >
                          <div className="flex items-center gap-2 px-3 py-2">
                            {tc.passed ? (
                              <CircleCheck
                                size={12}
                                className="text-accent shrink-0"
                              />
                            ) : (
                              <CircleX
                                size={12}
                                className="text-red-400 shrink-0"
                              />
                            )}
                            <span className="text-[10px] font-mono text-neutral-400">
                              Case {tc.index}
                            </span>
                            {tc.hidden && (
                              <span className="text-[8px] font-mono text-neutral-600 ml-auto">
                                hidden
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-bold ml-auto ${tc.passed ? "text-accent" : "text-red-400"}`}
                            >
                              {tc.passed ? "PASS" : "FAIL"}
                            </span>
                          </div>
                          {!tc.hidden && !tc.passed && (
                            <div className="px-3 pb-2 space-y-1 text-[10px] font-mono">
                              {tc.input && (
                                <div>
                                  <span className="text-neutral-600">
                                    in:{" "}
                                  </span>
                                  <span className="text-neutral-400">
                                    {tc.input}
                                  </span>
                                </div>
                              )}
                              {tc.expected && (
                                <div>
                                  <span className="text-neutral-600">
                                    exp:{" "}
                                  </span>
                                  <span className="text-accent-tertiary">
                                    {tc.expected}
                                  </span>
                                </div>
                              )}
                              {tc.actual && (
                                <div>
                                  <span className="text-neutral-600">
                                    got:{" "}
                                  </span>
                                  <span className="text-red-300">
                                    {tc.actual}
                                  </span>
                                </div>
                              )}
                              {tc.stderr && (
                                <div className="text-red-500/70 truncate">
                                  {tc.stderr.slice(0, 120)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!testResults && !runningTests && (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                      <div className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-neutral-600">
                        <FlaskConical size={18} />
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        {problem
                          ? 'Click "Run Tests" to validate your solution'
                          : "No problem loaded yet"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        {/* Center: Editor (coding) or Video Grid */}
        <div className="flex flex-col flex-1 overflow-hidden bg-black/20">
          {codingMode ? (
            <>
              {/* Editor toolbar — exact from SessionView */}
              <div className="flex items-center gap-3 px-3 h-10 border-b border-border shrink-0">
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu((v) => !v)}
                    className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 hover:text-white transition-colors uppercase"
                  >
                    {language} <ChevronDown size={9} />
                  </button>
                  {showLangMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-[#0f0f0f] border border-white/[0.08] rounded-lg overflow-hidden z-50 shadow-2xl min-w-[120px]">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l}
                          onClick={() => handleLanguageChange(l)}
                          className={`w-full text-left px-3 py-1.5 text-[10px] font-mono hover:bg-white/[0.06] transition-colors ${l === language ? "text-accent" : "text-neutral-400"}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1" />
                {/* Yjs connection indicator */}
                <div
                  className={`w-1.5 h-1.5 rounded-full ${yjsConnected ? "bg-accent shadow-[0_0_8px_rgba(19,127,236,0.4)]" : "bg-neutral-700"}`}
                />
{(() => {
                  const allTyping = [...new Set([...activeWriters, ...socketTypingWriters])];
                  const isTyping = allTyping.length > 0;
                  return codingMode ? (
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-300 ${isTyping ? "bg-accent/15 border border-accent/50 shadow-sm shadow-accent/20" : "bg-white/[0.02] border border-white/[0.05]"}`}>
                      <div className="flex items-center gap-1.5 min-w-0 max-w-[200px]">
                        {isTyping && (
                          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        )}
                        <span className={`text-[9px] font-mono uppercase shrink-0 transition-all duration-300 ${isTyping ? "text-accent font-bold tracking-widest" : "text-neutral-500"}`}>
                          {isTyping ? "Typing" : "Collab"}
                        </span>
                        <span className={`text-[9px] truncate font-medium transition-all duration-300 ${isTyping ? "text-accent-secondary" : "text-neutral-400"}`}>
                          {isTyping
                            ? allTyping.join(", ")
                            : remoteUsers.length > 0
                              ? remoteUsers.map((u) => u.name).join(", ")
                              : "Shared editing live"}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
                {problem && (
                  <button
                    onClick={handleRunTests}
                    disabled={runningTests}
                    className="px-3 py-1 bg-white/[0.06] border border-white/[0.08] text-neutral-300 rounded text-[10px] font-bold hover:bg-white/[0.1] transition-colors uppercase tracking-wider flex items-center gap-1"
                  >
                    {runningTests ? (
                      <Loader2 size={10} className="animate-spin" />
                    ) : (
                      <FlaskConical size={10} />
                    )}
                    {runningTests ? "" : "Tests"}
                  </button>
                )}
                <button
                  onClick={handleRun}
                  disabled={executing}
                  className="px-3 py-1 bg-accent text-white rounded text-[10px] font-bold hover:bg-accent-secondary transition-colors uppercase tracking-wider"
                >
                  {executing ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    "Run Code"
                  )}
                </button>
              </div>

              {/* Monaco Editor — exact from SessionView */}
              <div className="flex-1 relative">
                {(() => {
                  const allTyping = [...new Set([...activeWriters, ...socketTypingWriters])];
                  return codingMode && allTyping.length > 0 ? (
                    <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
                      <div className="inline-flex items-center gap-2.5 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-md border border-accent/50 shadow-lg shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-mono text-accent font-bold whitespace-nowrap">
                          {allTyping.length === 1 ? `${allTyping[0]} is typing...` : `${allTyping.join(", ")} are typing...`}
                        </span>
                      </div>
                    </div>
                  ) : null;
                })()}
                <Editor
                  language={language}
                  value={code}
                  onMount={handleEditorMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: '"JetBrains Mono", monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16 },
                    readOnly: !canEdit,
                  }}
                />

                {/* WebRTC Video Overlay — exact from SessionView */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-3 pointer-events-none z-10">
                  {screenStream && (
                    <div className="relative w-48 h-32 bg-black rounded-lg overflow-hidden border border-accent-tertiary/40 shadow-2xl pointer-events-auto">
                      <video
                        ref={(v) => {
                          if (v) v.srcObject = screenStream;
                        }}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-accent-tertiary">
                        Screen
                      </div>
                    </div>
                  )}
                  {localStream && (
                    <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden border border-white/20 shadow-2xl pointer-events-auto">
                      <video
                        ref={(v) => {
                          if (v) v.srcObject = localStream;
                        }}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover grayscale opacity-80"
                      />
                      <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[8px] font-mono text-white">
                        You
                      </div>
                    </div>
                  )}
                  {allStreams.map(([userId, stream]) => {
                    const participantUserId = remoteSocketToUserId.get(userId);
                    const p = participantUserId
                      ? participants.find((x) => x.userId === participantUserId)
                      : undefined;
                    const name = p?.name || remoteNames.get(userId) || "Participant";
                    return (
                      <div key={userId} className="pointer-events-auto">
                        <RemoteVideo
                          stream={stream}
                          name={name}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Video Grid — Google Meet style */
            <div className="flex-1 flex flex-col relative">
              <div className="flex-1 p-2 sm:p-4 overflow-hidden">
                {screenStream && (
                  <div className="mb-3 sm:mb-4">
                    <div className="relative w-full aspect-video max-h-[50vh] bg-black rounded-2xl overflow-hidden border border-accent-tertiary/30 shadow-2xl">
                      <video
                        ref={(v) => {
                          if (v) v.srcObject = screenStream;
                        }}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-accent-tertiary border border-accent-tertiary/20">
                        Screen Share
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`grid h-full gap-2 sm:gap-4 ${
                    screenStream
                      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-h-32"
                      : gridCount === 1
                        ? "grid-cols-1"
                        : gridCount === 2
                          ? "grid-cols-2"
                          : gridCount <= 4
                            ? "grid-cols-2"
                            : "grid-cols-3"
                  }`}
                >
                  {/* Always show local tile — shows avatar when camera is off */}
                  <VideoCard
                    stream={localStream}
                    name={user?.name || "You"}
                    isLocal
                    micOn={audioEnabled}
                    camOn={videoEnabled}
                    handRaised={handRaised}
                  />
                  {allStreams.map(([userId, stream]) => {
                    // userId here is actually a socketId — map through remoteSocketToUserId
                    const participantUserId = remoteSocketToUserId.get(userId);
                    const p = participantUserId
                      ? participants.find((x) => x.userId === participantUserId)
                      : undefined;
                    const name = p?.name || remoteNames.get(userId) || "Participant";
                    return (
                      <VideoCard
                        key={userId}
                        stream={stream}
                        name={name}
                        micOn={p?.micOn ?? true}
                        camOn={p?.camOn ?? true}
                        handRaised={p?.handRaised}
                      />
                    );
                  })}
                </div>

                {gridCount === 1 && !screenStream && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                    <div className="flex flex-col items-center justify-center border border-dashed border-white/[0.05] rounded-3xl bg-[#050505]/40 backdrop-blur-sm p-12 max-w-md text-center pointer-events-auto">
                      <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                        <Info size={24} className="text-white/20" />
                      </div>
                      <p className="text-white/20 text-sm font-medium tracking-tight">
                        Wait for others to join using the code:
                        <br />
                        <span className="text-white/40 font-mono mt-2 block">
                          {meetingCode}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Google Meet bottom control bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
                <button
                  onClick={handleToggleMic}
                  className={`p-3.5 rounded-full transition-all ${audioEnabled ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                  title={audioEnabled ? "Mute" : "Unmute"}
                >
                  {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button
                  onClick={handleToggleCam}
                  className={`p-3.5 rounded-full transition-all ${videoEnabled ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}
                  title={videoEnabled ? "Turn off camera" : "Turn on camera"}
                >
                  {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                </button>
                <button
                  onClick={handleScreenShare}
                  className={`p-3.5 rounded-full transition-all ${screenStream ? "bg-accent-tertiary/20 text-accent-tertiary hover:bg-accent-tertiary/30" : "bg-white/10 hover:bg-white/20 text-white"}`}
                  title={screenStream ? "Stop sharing" : "Share screen"}
                >
                  <Monitor size={20} />
                </button>
                <button
                  onClick={handleRaiseHand}
                  className={`p-3.5 rounded-full transition-all ${handRaised ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" : "bg-white/10 hover:bg-white/20 text-white"}`}
                  title={handRaised ? "Lower hand" : "Raise hand"}
                >
                  <Hand size={20} />
                </button>
                <div className="w-px h-8 bg-white/10 mx-1" />
                {isHost ? (
                  <button
                    onClick={handleEndMeeting}
                    className="px-5 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <PhoneOff size={18} /> End
                  </button>
                ) : (
                  <button
                    onClick={handleLeave}
                    className="px-5 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all flex items-center gap-2 text-sm font-medium"
                  >
                    <PhoneOff size={18} /> Leave
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Tabbed panel — SessionView tabs + participants */}
        <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-border bg-bg-900 w-full lg:w-80 h-[37vh] lg:h-full shrink-0 overflow-hidden">
          <div className="flex border-b border-border">
            {(
              [
                "chat",
                ...(codingMode ? ["output", ...(isHost ? ["ai"] : [])] : []),
                "participants",
              ] as RightTab[]
            ).map((t) => (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                className={`flex-1 py-2.5 text-[10px] uppercase font-mono tracking-widest border-b-2 transition-colors relative ${rightTab === t ? "text-white border-white" : "text-neutral-600 border-transparent hover:text-neutral-400"}`}
              >
                {t === "output"
                  ? "run"
                  : t === "participants"
                    ? "users"
                    : t}
                {t === "participants" &&
                  isHost &&
                  pendingParticipants.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[7px] flex items-center justify-center rounded-full font-bold">
                      {pendingParticipants.length}
                    </span>
                  )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 flex flex-col">
            {rightTab === "output" ? (
              /* Output/Run tab — exact from SessionView */
              <div className="flex-1 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                      Stdin (optional)
                    </span>
                    <button
                      onClick={() => setShowStdin((v) => !v)}
                      className="text-[9px] text-neutral-500 hover:text-white transition-colors"
                    >
                      {showStdin ? "hide" : "show"}
                    </button>
                  </div>
                  {showStdin && (
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      rows={3}
                      placeholder="Program input..."
                      className="w-full glass-panel px-3 py-2 text-[11px] font-mono text-white placeholder:text-neutral-700 outline-none resize-none rounded-xl"
                    />
                  )}
                </div>
                <button
                  onClick={handleRun}
                  disabled={executing}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-accent-secondary transition-colors disabled:opacity-50"
                >
                  {executing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Play size={12} />
                  )}
                  {executing ? "Running..." : "Run Code"}
                </button>
                {execResult ? (
                  <div className="space-y-3 mt-1">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                      <span>
                        Exit:{" "}
                        <span
                          className={
                            execResult.run?.code === 0
                              ? "text-accent"
                              : "text-red-400"
                          }
                        >
                          {execResult.run?.code ?? "—"}
                        </span>
                      </span>
                      {execResult.run?.cpu_time !== undefined && (
                        <span>CPU: {execResult.run.cpu_time}ms</span>
                      )}
                    </div>
                    {execResult.run?.stdout && (
                      <div>
                        <span className="text-[9px] font-mono text-neutral-600 uppercase block mb-1">
                          Stdout
                        </span>
                        <pre className="bg-black/40 border border-white/[0.05] rounded-xl p-3 text-[11px] font-mono text-accent-tertiary whitespace-pre-wrap overflow-x-auto max-h-48">
                          {execResult.run.stdout}
                        </pre>
                      </div>
                    )}
                    {execResult.run?.stderr && (
                      <div>
                        <span className="text-[9px] font-mono text-red-500/60 uppercase block mb-1">
                          Stderr
                        </span>
                        <pre className="bg-red-950/20 border border-red-500/10 rounded-xl p-3 text-[11px] font-mono text-red-300 whitespace-pre-wrap overflow-x-auto max-h-32">
                          {execResult.run.stderr}
                        </pre>
                      </div>
                    )}
                    {execResult.compile?.stderr && (
                      <div>
                        <span className="text-[9px] font-mono text-yellow-500/60 uppercase block mb-1">
                          Compile Error
                        </span>
                        <pre className="bg-yellow-950/20 border border-yellow-500/10 rounded-xl p-3 text-[11px] font-mono text-yellow-300 whitespace-pre-wrap overflow-x-auto max-h-32">
                          {execResult.compile.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-16 text-center gap-3">
                    <div className="w-10 h-10 rounded-2xl glass-panel flex items-center justify-center text-neutral-600">
                      <Play size={18} />
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Run your code to see output here
                    </p>
                  </div>
                )}
              </div>
            ) : rightTab === "chat" ? (
              /* Chat — exact from SessionView */
              <div className="flex-1 flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[9px] text-neutral-600 font-mono mb-1">
                      {m.sender}
                    </span>
                    <div
                      className={`px-3 py-1.5 rounded-xl text-xs max-w-[90%] ${m.mine ? "bg-accent text-white" : "glass-panel text-neutral-300"}`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator — exact from SessionView */}
                {chatTypingUsers.size > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono italic animate-pulse">
                    <Users size={10} />
                    {Array.from(chatTypingUsers).join(", ")}{" "}
                    {chatTypingUsers.size === 1 ? "is" : "are"} typing...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            ) : rightTab === "ai" ? (
              /* AI Analysis — exact from SessionView */
              <div className="flex-1 flex flex-col gap-5">
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center h-40 text-neutral-500 gap-3">
                    <Loader2
                      size={24}
                      className="animate-spin text-teal-500"
                    />
                    <span className="text-xs font-mono uppercase tracking-widest animate-pulse">
                      Deep Analysis in Progress...
                    </span>
                  </div>
                ) : analysis ? (
                  <div className="space-y-6">
                    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Brain size={60} className="text-accent" />
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-4">
                        Overall Score
                      </span>
                      <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold text-white leading-none">
                          {analysis.overallScore}
                        </span>
                        <span className="text-xl text-neutral-600 font-medium pb-1">
                          /10
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/[0.05] rounded-full mt-4 overflow-hidden">
                        <div
                          className="h-full bg-accent shadow-[0_0_10px_rgba(19,127,236,0.5)] transition-all duration-1000"
                          style={{
                            width: `${(analysis.overallScore / 10) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="glass-panel rounded-xl p-3">
                        <span className="text-[9px] font-mono text-neutral-600 uppercase block mb-1">
                          Time
                        </span>
                        <span className="text-xs font-mono text-accent font-semibold">
                          {analysis.timeComplexity}
                        </span>
                      </div>
                      <div className="glass-panel rounded-xl p-3">
                        <span className="text-[9px] font-mono text-neutral-600 uppercase block mb-1">
                          Space
                        </span>
                        <span className="text-xs font-mono text-accent font-semibold">
                          {analysis.spaceComplexity}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> Executive Summary
                      </span>
                      <p className="text-xs text-neutral-400 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
                        {analysis.summary}
                      </p>
                    </div>

                    {analysis.bugs.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle size={12} /> Critical Issues
                        </span>
                        <ul className="space-y-2">
                          {analysis.bugs.map((bug, i) => (
                            <li
                              key={i}
                              className="text-[11px] text-neutral-300 bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg flex gap-2.5"
                            >
                              <span className="text-red-500">•</span> {bug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-accent-tertiary/80 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={12} /> Growth Suggestions
                        </span>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((s, i) => (
                            <li
                              key={i}
                              className="text-[11px] text-neutral-300 bg-accent-tertiary/10 border border-accent-tertiary/20 p-2.5 rounded-lg flex gap-2.5"
                            >
                              <span className="text-accent-tertiary">•</span>{" "}
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center mt-20 text-center px-4 gap-4">
                    <div className="w-12 h-12 rounded-2xl glass-panel flex items-center justify-center text-neutral-600">
                      <Brain size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">
                        AI Analysis Ready
                      </h4>
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        Execute the "Analyze" command to get FAANG-level
                        feedback on complexity, correctness, and style.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Participants + Waiting Room */
              <div className="flex-1 space-y-4">
                <div className="space-y-3">
                  {participants.map((p) => (
                    <div
                      key={p.userId}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-xs font-bold text-white">
                          {p.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{p.name}</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-tighter">
                            {p.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {codingMode && (
                          <span className="text-[9px] font-bold uppercase px-2 py-1 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                            Editor
                          </span>
                        )}
                        {!p.micOn && (
                          <MicOff size={12} className="text-red-500/60" />
                        )}
                        {!p.camOn && (
                          <VideoOff size={12} className="text-red-500/60" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isHost && pendingParticipants.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                      Waiting Room ({pendingParticipants.length})
                    </span>
                    {pendingParticipants.map((p) => (
                      <div
                        key={p.userId || p.name}
                        className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center font-bold text-sm">
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold">{p.name}</p>
                            <p className="text-[10px] text-white/30 italic">
                              Wants to join...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleAdmit(p.userId || p.name)
                            }
                            className="flex-1 h-8 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-neutral-200 transition-colors"
                          >
                            Admit
                          </button>
                          <button
                            onClick={() =>
                              handleDeny(p.userId || p.name)
                            }
                            className="flex-1 h-8 bg-white/[0.05] text-white/60 text-[10px] font-bold uppercase rounded-lg hover:bg-white/[0.1] transition-colors border border-white/[0.05]"
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {rightTab === "chat" && (
            <form
              onSubmit={sendChat}
              className="p-3 border-t border-border flex gap-2 shrink-0"
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 glass-panel px-3 py-2 text-xs text-white placeholder:text-neutral-700 outline-none focus:border-accent/40 transition-all"
              />
              <button
                disabled={!chatInput.trim()}
                className="p-2 bg-accent text-white rounded-xl hover:bg-accent-secondary transition-colors disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoCard({
  stream,
  name,
  isLocal,
  micOn,
  camOn,
  handRaised,
  isSpeaking = false,
}: {
  stream: MediaStream | null;
  name: string;
  isLocal?: boolean;
  micOn: boolean;
  camOn: boolean;
  handRaised?: boolean;
  isSpeaking?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
    }
  }, [stream]);

  return (
    <motion.div
      layout
      className={`relative aspect-video bg-[#0A0A0A] rounded-3xl border overflow-hidden group shadow-2xl transition-all duration-300 ${
        isSpeaking
          ? "border-indigo-500 ring-4 ring-indigo-500/20"
          : "border-white/[0.08]"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal}
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-1000 ${camOn ? "opacity-100" : "opacity-0"}`}
      />

      <AnimatePresence>
        {!camOn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-[#080808]"
          >
            <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shadow-2xl">
              <span className="text-3xl font-bold text-white/40">
                {name[0]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        <div className="px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.1] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-indigo-400 animate-pulse" : "bg-white/20"}`}
          />
          {name} {isLocal && "(You)"}
        </div>

        <div className="flex gap-2">
          {!micOn && (
            <div className="p-2 rounded-lg bg-red-500/20 backdrop-blur-md border border-red-500/30">
              <MicOff size={12} className="text-red-500" />
            </div>
          )}
        </div>
      </div>

      {handRaised && (
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute bottom-4 right-4 w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/20"
        >
          <Hand size={20} fill="currentColor" />
        </motion.div>
      )}

      <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 hover:text-white">
        <Maximize2 size={20} />
      </button>
    </motion.div>
  );
}

export default function MeetingRoom() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useStore();

  useEffect(() => {
    if (!token) {
      navigate(`/join/${code}`, { replace: true });
      return;
    }
    const s = io(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [token, code, navigate]);

  if (!code) return null;

  return (
    <MediaProvider socket={socket}>
      <MeetingRoomWithMedia socket={socket} code={code} />
    </MediaProvider>
  );
}

function MeetingRoomWithMedia({
  socket,
  code,
}: {
  socket: Socket | null;
  code: string;
}) {
  // In privacy mode localStream can be intentionally null (mic/cam off),
  // so never block the meeting UI behind media availability.
  useMedia();
  return <MeetingInner socket={socket} code={code} />;
}
