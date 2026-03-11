import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, ArrowLeft, Code2, Users, Pencil } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { ExecutionPanel } from "./ExecutionPanel";
import { LanguageSelector } from "./LanguageSelector";
import { ParticipantsList } from "./ParticipantsList";
import { ShareButton } from "./ShareButton";
import { useCodeExecution } from "./useCodeExecution";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import useStore from "../../store/useStore";
import type { Participant } from "./types";

function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as unknown as T;
}

export default function CodePairPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useStore();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [code, setCode] = useState("# Welcome to CodePair\n\n");
  const [language, setLanguage] = useState("python");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] =
    useState<Participant | null>(null);
  const [roomFull, setRoomFull] = useState(false);

  // Identity state
  const [name, setName] = useState("");
  const [entryName, setEntryName] = useState("");
  const [sessionVerified, setSessionVerified] = useState(false);

  // Typing indicator state
  const [typingUser, setTypingUser] = useState<{
    name: string;
    color: string;
  } | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Code execution hook (WASM-based, runs in browser)
  const { result, isExecuting, isSupported, execute, clearResult } =
    useCodeExecution(language);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const nameRef = useRef(name);
  nameRef.current = name;

  // Identity check on mount — only auto-join if we have a stored identity for THIS session
  useEffect(() => {
    if (!roomId) {
      navigate("/dashboard");
      return;
    }

    const storedIdentity = localStorage.getItem(`code_sync_identity_${roomId}`);
    if (storedIdentity) {
      try {
        const { name: storedName } = JSON.parse(storedIdentity);
        setName(storedName);
        setSessionVerified(true);
      } catch {
        localStorage.removeItem(`code_sync_identity_${roomId}`);
      }
    }

    // Pre-fill the entry name from preferred name or user account
    const preferredName = localStorage.getItem("code_sync_preferred_name");
    if (preferredName) {
      setEntryName(preferredName);
    } else if (user?.name) {
      setEntryName(user.name);
    }
  }, [roomId, navigate, user]);

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryName.trim()) return;
    const trimmed = entryName.trim();
    setName(trimmed);
    localStorage.setItem("code_sync_preferred_name", trimmed);
    setSessionVerified(true);
  };

  // Socket.IO connection (only after identity is confirmed)
  useEffect(() => {
    if (!roomId || !sessionVerified || !name) return;

    const apiUrl =
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:4000";

    const newSocket = io(apiUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setConnectionState("connected");
      newSocket.emit("codepair:join", {
        roomId,
        user: { name: nameRef.current },
      });
    });

    newSocket.on("codepair:init", (data: any) => {
      setCode(data.code);
      setLanguage(data.language || "python");
      setParticipants(data.participants || []);
      const myId = data.participantId || newSocket.id || "";
      const me = (data.participants || []).find(
        (p: Participant) => p.id === myId,
      );
      setCurrentParticipant(
        me || { id: myId, name: nameRef.current, color: "#3b82f6" },
      );
    });

    newSocket.on("codepair:room-full", () => {
      setRoomFull(true);
      newSocket.disconnect();
    });

    newSocket.on(
      "codepair:code-sync",
      ({
        code: newCode,
        language: newLang,
      }: {
        code: string;
        language?: string;
      }) => {
        setCode(newCode);
        if (newLang) setLanguage(newLang);
      },
    );

    newSocket.on("codepair:user-joined", (data: any) => {
      setParticipants(data.participants || []);
    });

    newSocket.on("codepair:user-left", (data: any) => {
      setParticipants(data.participants || []);
    });

    newSocket.on("codepair:name-updated", (data: any) => {
      setParticipants(data.participants || []);
      // Update current participant if my name was changed
      const myId = currentParticipant?.id || newSocket.id;
      const me = (data.participants || []).find(
        (p: Participant) => p.id === myId,
      );
      if (me) setCurrentParticipant(me);
    });

    newSocket.on(
      "codepair:typing",
      ({
        name: typingName,
        color: typingColor,
      }: {
        name: string;
        color: string;
      }) => {
        setTypingUser({ name: typingName, color: typingColor });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 1500);
      },
    );

    newSocket.on("disconnect", () => {
      setConnectionState("disconnected");
    });

    newSocket.on("connect_error", () => {
      setConnectionState("disconnected");
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, sessionVerified, name]);

  // Save identity when connected
  useEffect(() => {
    if (currentParticipant && roomId) {
      localStorage.setItem(
        `code_sync_identity_${roomId}`,
        JSON.stringify({
          name: currentParticipant.name,
          participantId: currentParticipant.id,
        }),
      );
    }
  }, [currentParticipant, roomId]);

  // Debounced code update sender
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSendCodeUpdate = useCallback(
    debounce((newCode: string) => {
      socketRef.current?.emit("codepair:code-update", {
        roomId,
        code: newCode,
        language,
      });
    }, 100),
    [roomId, language],
  );

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    debouncedSendCodeUpdate(newCode);
  };

  const handleLanguageSelect = (newLanguage: string) => {
    setLanguage(newLanguage);
    clearResult();
    socket?.emit("codepair:language-change", { roomId, language: newLanguage });
  };

  const handleRunCode = async () => {
    await execute(code);
  };

  const handleNameChange = (newName: string) => {
    if (!roomId) return;
    setName(newName);
    localStorage.setItem("code_sync_preferred_name", newName);

    const storedIdentity = localStorage.getItem(`code_sync_identity_${roomId}`);
    if (storedIdentity) {
      try {
        const identity = JSON.parse(storedIdentity);
        identity.name = newName;
        localStorage.setItem(
          `code_sync_identity_${roomId}`,
          JSON.stringify(identity),
        );
      } catch {
        /* ignore */
      }
    }

    if (currentParticipant) {
      setCurrentParticipant({ ...currentParticipant, name: newName });
    }

    socket?.emit("codepair:name-change", { roomId, name: newName });
  };

  // Room full screen
  if (roomFull) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Room is Full</h1>
            <p className="text-zinc-400 text-sm mb-6">
              This CodePair session has reached the maximum of 10 participants. Please try again later or create a new session.
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If not verified, show the full-screen join page
  if (!sessionVerified) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 backdrop-blur-sm">
            {/* Logo / Icon */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-4">
                <Code2 className="w-8 h-8 text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Join CodePair Session
              </h1>
              <p className="text-zinc-400 text-sm mt-2 text-center">
                Enter your name to join the collaborative coding session
              </p>
            </div>

            {/* Session info */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-700 mb-6">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Room:</span>
              <span className="text-sm text-zinc-300 font-mono truncate">
                {roomId}
              </span>
            </div>

            {/* Name input form */}
            <form onSubmit={handleJoinSession} className="space-y-4">
              <div>
                <label
                  htmlFor="join-name"
                  className="block text-sm font-medium text-zinc-300 mb-2"
                >
                  Your Name
                </label>
                <Input
                  id="join-name"
                  placeholder="Enter your name"
                  value={entryName}
                  onChange={(e) => setEntryName(e.target.value)}
                  className="bg-zinc-900 border-zinc-600 focus-visible:ring-blue-500 text-zinc-100 h-12 text-base"
                  autoFocus
                  maxLength={30}
                />
              </div>

              <Button
                type="submit"
                disabled={!entryName.trim()}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium disabled:opacity-40"
              >
                Join Session
              </Button>
            </form>

            <p className="text-xs text-zinc-500 text-center mt-6">
              Your name will be visible to other participants
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-zinc-700 px-6 py-4"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>

          <LanguageSelector value={language} onChange={handleLanguageSelect} />

          {/* Connection status */}
          <div
            className={cn(
              "flex items-center gap-2 text-sm",
              connectionState === "connected"
                ? "text-green-400"
                : "text-zinc-400",
            )}
          >
            {connectionState === "connected" ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4" />
            )}
            <span className="capitalize">
              {connectionState === "disconnected" && !name
                ? "Waiting for Name"
                : connectionState}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: currentParticipant?.color || "#3b82f6",
              }}
            />
            <span className="text-sm text-zinc-300 font-medium">
              {name || "Connecting..."}
            </span>
          </div>
          <ShareButton shareUrl={`/codepair/${roomId}`} />
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col min-w-0"
        >
          {/* Typing indicator */}
          <AnimatePresence>
            {typingUser && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pt-2"
              >
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Pencil
                    className="w-3 h-3"
                    style={{ color: typingUser.color }}
                  />
                  <span>
                    <span
                      className="font-medium"
                      style={{ color: typingUser.color }}
                    >
                      {typingUser.name}
                    </span>{" "}
                    is typing...
                  </span>
                  <span className="flex gap-0.5">
                    <span
                      className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1 h-1 rounded-full bg-zinc-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 p-4">
            <CodeEditor
              value={code}
              language={language}
              onChange={handleCodeChange}
              className="h-full"
            />
          </div>

          {/* Execution panel */}
          <div className="h-64 p-4 border-t border-zinc-700">
            <ExecutionPanel
              result={result}
              isExecuting={isExecuting}
              isSupported={isSupported}
              onRun={handleRunCode}
              className="h-full"
            />
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 border-l border-zinc-700 p-4"
        >
          <ParticipantsList
            participants={participants}
            currentParticipant={currentParticipant}
            onNameChange={handleNameChange}
          />
        </motion.aside>
      </div>
    </div>
  );
}
