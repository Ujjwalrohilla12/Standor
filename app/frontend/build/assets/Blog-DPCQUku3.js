import{u as h,r as c,j as e,X as p,A as m}from"./index-BokT9ag_.js";import{S as g}from"./search-D28UjujC.js";import{C as y}from"./clock-D5rl0Go5.js";const b=[{slug:"designing-real-time-collaborative-editors",title:"Designing Real-Time Collaborative Code Editors at Interview Scale",tag:"Engineering",date:"Feb 24, 2026",readTime:"8 min read",author:"Standor Team",excerpt:"Building a collaborative editor where two developers type simultaneously — with zero conflicts and sub-100ms propagation — requires more than WebSockets. Here is how Standor combines Monaco Editor, Yjs CRDTs, and Socket.io to make it work reliably at scale.",content:`A collaborative coding editor is deceptively hard to build correctly. Naive approaches — sending the entire document on every keystroke, or using last-write-wins — break down as soon as two users type at the same position simultaneously. Standor solves this with Conflict-Free Replicated Data Types (CRDTs) via Yjs, paired with Monaco Editor and a Socket.io persistence layer.

## Why CRDTs instead of Operational Transforms

Operational Transforms (OT) — the approach used by Google Docs — require a central server to serialize and transform concurrent operations. Every edit must be routed through the server before it is applied locally, which introduces latency proportional to the round-trip time. CRDTs have a mathematically guaranteed merge property: any two replicas, given the same set of operations in any order, converge to identical state. This means edits can be applied locally and immediately, then synced asynchronously.

## Monaco + Yjs binding

Standor uses the \`y-monaco\` binding to synchronize Monaco Editor state through a \`Y.Text\` CRDT:

\`\`\`typescript
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { SocketIOProvider } from 'y-socket.io';

const ydoc = new Y.Doc();
const yText = ydoc.getText('interview-code');
const provider = new SocketIOProvider(socket, 'room:' + roomId, ydoc);

// Bind Monaco model to Yjs document
const binding = new MonacoBinding(
  yText,
  monacoEditor.getModel()!,
  new Set([monacoEditor]),
  provider.awareness,
);
\`\`\`

Each keystroke produces a compact binary Yjs update — typically 10–50 bytes — that is broadcast to all peers in the room. The server persists the latest document state so late joiners receive the current version immediately.

## Awareness: cursors and presence

Beyond text sync, Standor uses Yjs Awareness to broadcast cursor positions, selections, and user metadata in real time. Each participant's cursor is rendered as a colored overlay in Monaco with their name label. Awareness updates are ephemeral — they are not persisted — and propagate within one Socket.io broadcast cycle.

## Handling reconnects

When a participant loses connectivity, their local Yjs document accumulates pending updates. On reconnect, the Socket.io provider exchanges the full update history with the server in a single round-trip using Yjs's state vector protocol. Diverged edits merge deterministically — no manual conflict resolution is required, regardless of how long the participant was offline.`},{slug:"secure-code-execution-sandbox",title:"Secure Code Execution: How Standor Runs Untrusted Interview Code Safely",tag:"Security",date:"Feb 18, 2026",readTime:"10 min read",author:"Standor Team",excerpt:"Running arbitrary candidate code on shared infrastructure is a significant attack surface. Standor uses a multi-layer sandbox model — containerised runtimes, resource limits, network isolation, and timeout enforcement — to execute code safely without exposing host systems.",content:`Every interview on Standor involves executing code written by a candidate who may be unknown and untrusted. This code could attempt to read the filesystem, exfiltrate environment variables, consume unbounded CPU, fork-bomb the process, or establish outbound network connections. The execution sandbox must prevent all of these while returning accurate stdout, stderr, and exit codes within a few seconds.

## Execution architecture

Standor's execution engine is built on isolated container instances per execution request. Each submission is routed to a worker that:

1. Spawns a fresh container from a language-specific runtime image (Node 22, Python 3.12, Go 1.22, Java 21, Rust 1.77)
2. Writes the submitted code to a tmpfs mount (RAM-backed, no persistent disk I/O)
3. Executes the entry point with enforced resource limits
4. Streams stdout/stderr back to the API within the timeout window
5. Destroys the container immediately after execution completes or times out

## Resource constraints

Each container runs under strict cgroup v2 limits:

\`\`\`
CPU:     0.5 vCPU (burst allowed up to 1.0 for 2s)
Memory:  256 MB hard limit — OOM kill on breach
PIDs:    64 max — prevents fork bombs
Wall time: 10s execution timeout
Network: egress blocked via iptables DROP policy
\`\`\`

The network block is enforced at the host level, not inside the container — a compromised runtime cannot bypass it by modifying iptables inside the namespace.

## Syscall filtering

Beyond cgroups, Standor applies a seccomp-bpf profile that allowlists only the syscalls required for compilation and execution. Dangerous calls — \`ptrace\`, \`mount\`, \`kexec_load\`, \`open_by_handle_at\`, and kernel module operations — are blocked at the kernel level. A blocked syscall returns \`EPERM\` and the execution fails safely without crashing the host.

## Output sanitisation

Stdout and stderr are capped at 256 KB per stream. Candidates cannot use execution as a data exfiltration channel by writing arbitrarily large outputs. Binary output is base64-encoded before transmission to prevent injection via terminal control sequences in the interviewer's browser.`},{slug:"ai-powered-code-evaluation",title:"AI-Powered Code Evaluation: How Standor Uses AI to Assess Interview Submissions",tag:"AI",date:"Feb 10, 2026",readTime:"7 min read",author:"Standor Team",excerpt:"Rubric-based scoring misses context. A candidate who writes an O(n²) solution with excellent error handling and clean abstractions is different from one who submits O(n) code that crashes on empty input. Standor uses AI to evaluate submissions along multiple dimensions simultaneously.",content:`Traditional automated code assessment scores correctness by running test cases and counting passes. This produces a single binary signal — passed or failed — that ignores code quality, algorithmic reasoning, readability, and the candidate's apparent thought process. Standor's AI evaluation layer sends each submission to Standor AI with a structured prompt that requests multi-dimensional feedback.

## The evaluation prompt

Standor sends AI the problem statement, the candidate's code, the language, and execution results (stdout, stderr, exit code, runtime). The prompt requests a structured JSON response covering:

- **Correctness**: Does the solution handle the stated requirements and edge cases?
- **Time complexity**: Big-O notation with reasoning
- **Space complexity**: Big-O notation with reasoning
- **Code quality**: Naming, structure, modularity, readability
- **Bugs**: Specific issues with line references where possible
- **Suggestions**: Concrete improvements, not generic advice
- **Score**: 1–10 overall rating with justification

\`\`\`typescript
const response = await standorAI.messages.create({
  model: 'standor-ai-pro',
  max_tokens: 1024,
  thinking: { type: 'enabled', budget_tokens: 8000 },
  messages: [{
    role: 'user',
    content: buildEvaluationPrompt({ problem, code, language, executionResult }),
  }],
});
\`\`\`

Extended thinking is enabled so Standor AI reasons through edge cases and algorithmic tradeoffs before producing the evaluation, rather than pattern-matching on surface features.

## What the analysis surfaces

For a two-sum problem submission in Python, a typical evaluation flags: correct result for the provided test case, O(n²) time complexity due to nested loops, O(1) space, missing handling for empty input, and suggests a hashmap approach to achieve O(n) time. This gives interviewers concrete discussion points rather than a pass/fail verdict.

## Interviewer override

AI evaluation is advisory, not determinative. Interviewers can amend any field — adjust the score, add context, flag the analysis as inaccurate — and the amended version is what appears in the final interview report. The AI output is a starting point, not a verdict.`},{slug:"replayable-interview-timelines",title:"Replayable Interview Timelines: Reconstructing the Candidate's Thought Process",tag:"Product",date:"Feb 3, 2026",readTime:"9 min read",author:"Standor Team",excerpt:"The final submitted code tells you what a candidate produced. The timeline tells you how they got there — when they deleted a working approach and started over, where they got stuck, how long they spent on edge cases. Standor captures the full edit history and makes it replayable.",content:`A completed coding interview produces an artifact: the final code. But the process that produced it — the sequence of decisions, dead ends, corrections, and breakthroughs — is often more informative than the result. Standor persists the full Yjs CRDT update log throughout the interview and exposes it as a replayable timeline.

## How the timeline is captured

Every keystroke in the collaborative editor produces a Yjs update — a compact binary diff that describes the change applied to the shared document. The Socket.io provider forwards each update to the server, which appends it to an append-only log with a monotonic timestamp. At the end of an interview session, this log is a complete, ordered history of every edit made by every participant.

\`\`\`typescript
// Server-side: persist each Yjs update with timestamp
socket.on('yjs-update', async (roomId: string, update: Uint8Array) => {
  await db.interviewUpdates.create({
    data: {
      roomId,
      update: Buffer.from(update),
      timestamp: Date.now(),
      authorId: socket.data.userId,
    },
  });
  // Broadcast to other participants
  socket.to(roomId).emit('yjs-update', update);
});
\`\`\`

## Replay mechanics

To replay an interview, Standor initialises a fresh \`Y.Doc\`, then applies the persisted updates in timestamp order at a configurable playback speed (1×, 2×, 4×). Each update is applied using \`Y.applyUpdate\`, which triggers Monaco's model change events — the editor re-renders exactly as it appeared during the live session.

Timeline markers are overlaid at points of interest: first execution, AI evaluation request, language switch, long pause (>60s of inactivity), and final submission.

## Privacy controls

Interview replays are accessible only to the interviewer and designated reviewers. Participants are notified during the session that their edits are recorded. Organisations can configure retention windows — 30, 90, or 365 days — after which update logs are permanently deleted. Replay access is logged in the organisation's audit trail.`},{slug:"scaling-interview-platforms",title:"Scaling a Real-Time Interview Platform: Lessons from Standor's Infrastructure",tag:"Infrastructure",date:"Jan 27, 2026",readTime:"11 min read",author:"Standor Team",excerpt:"Real-time collaborative applications have different scaling characteristics than request/response APIs. A single interview room involves persistent WebSocket connections, CRDT sync, code execution workers, and AI evaluation — all with latency requirements under 200ms. Here is how we architect for this.",content:`A typical REST API scales horizontally by adding stateless instances behind a load balancer. Real-time collaborative applications cannot: a WebSocket connection is stateful, a Yjs document must be routed to a consistent server for a given room, and code execution requires available worker capacity rather than compute time spread across many instances.

## WebSocket routing with sticky sessions

Standor uses Socket.io with Redis Pub/Sub as the adapter. This means any server node can receive a message for any room and fan it out via Redis to the node that holds the active connections for that room. Clients connect to any available node — no sticky routing required at the load balancer level.

\`\`\`typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
\`\`\`

The Yjs document state is stored in Redis as a binary blob. When a new participant joins, the server fetches the current document state from Redis and sends it as the initial sync payload — the participant is immediately up to date regardless of which server node they connect to.

## Code execution worker pool

Execution workers are separate processes from the API servers. They pull jobs from a Bull queue (Redis-backed), spin up execution containers, and return results. The worker pool auto-scales based on queue depth — when pending jobs exceed a threshold, new worker instances are provisioned. Workers are stateless and can be terminated at any time; in-flight jobs are retried with a fresh container.

## AI evaluation throughput

AI API calls for code evaluation are async — the frontend receives an immediate acknowledgement and polls for results. This prevents API latency (typically 3–8 seconds with extended thinking) from blocking the UI. Evaluation jobs are queued separately from execution jobs to prevent a spike in AI requests from starving code execution capacity.

## Database partitioning

Interview rooms, update logs, and execution results are stored in PostgreSQL with partitioning by \`created_at\` month. Old partitions are archived to object storage after the organisation's retention window expires. Active interview data stays in hot storage; historical replays are served from the archive tier with a slightly higher first-load latency.`}],x=["All","Engineering","AI","Security","Infrastructure","Product"];function k(){const n=h(),[r,d]=c.useState("All"),[a,i]=c.useState(""),o=b.filter(t=>{const l=r==="All"||t.tag===r,s=a.trim().toLowerCase(),u=!s||t.title.toLowerCase().includes(s)||t.excerpt.toLowerCase().includes(s)||t.author.toLowerCase().includes(s);return l&&u});return e.jsx("div",{className:"pt-32 pb-24 px-6",children:e.jsxs("div",{className:"ns-container",children:[e.jsxs("div",{className:"max-w-4xl mb-24",children:[e.jsxs("h1",{className:"text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-white leading-[0.9] tracking-tighter mb-10",children:["Insights & ",e.jsx("br",{}),e.jsx("span",{className:"text-ns-grey-600",children:"Research."})]}),e.jsx("p",{className:"text-lg md:text-2xl text-ns-grey-400 leading-relaxed font-medium max-w-2xl",children:"Deep technical articles on collaborative coding systems, AI code evaluation, engineering hiring, and distributed developer tools."})]}),e.jsx("div",{className:"flex flex-col sm:flex-row gap-4 mb-8",children:e.jsxs("div",{className:"relative flex-1 max-w-sm",children:[e.jsx(g,{size:13,className:"absolute left-3.5 top-1/2 -translate-y-1/2 text-ns-grey-600"}),e.jsx("input",{type:"text",value:a,onChange:t=>i(t.target.value),placeholder:"Search posts...",className:"w-full pl-9 pr-9 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-ns-grey-700 focus:border-white/20 outline-none transition-colors"}),a&&e.jsx("button",{onClick:()=>i(""),className:"absolute right-3 top-1/2 -translate-y-1/2 text-ns-grey-600 hover:text-white transition-colors",children:e.jsx(p,{size:12})})]})}),e.jsx("div",{className:"flex flex-wrap gap-3 mb-16",children:x.map(t=>e.jsx("button",{onClick:()=>d(t),className:`px-5 py-2 rounded-full text-sm font-medium transition-all ${r===t?"bg-white text-black":"border border-white/[0.08] text-ns-grey-400 hover:border-white/20 hover:text-white"}`,children:t},t))}),e.jsx("div",{className:"grid md:grid-cols-2 gap-8 mb-48",children:o.map(t=>e.jsxs("article",{onClick:()=>n(`/blog/${t.slug}`),className:"group ns-glass rounded-[2rem] md:rounded-[2.5rem] border border-white/[0.05] p-6 md:p-10 hover:border-white/12 transition-all duration-500 cursor-pointer flex flex-col gap-6",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-[9px] font-mono text-ns-accent uppercase tracking-widest px-3 py-1 rounded-full bg-ns-accent/10 border border-ns-accent/20",children:t.tag}),e.jsxs("div",{className:"flex items-center gap-3 text-xs text-ns-grey-600 font-mono",children:[e.jsx(y,{size:11}),t.readTime]})]}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h2",{className:"text-xl font-bold text-white mb-4 tracking-tight leading-snug group-hover:text-ns-accent transition-colors",children:t.title}),e.jsx("p",{className:"text-sm text-ns-grey-500 leading-relaxed line-clamp-3",children:t.excerpt})]}),e.jsxs("div",{className:"flex items-center justify-between pt-4 border-t border-white/[0.04]",children:[e.jsxs("span",{className:"text-xs text-ns-grey-600",children:[t.date," · ",t.author]}),e.jsxs("span",{className:"flex items-center gap-1 text-xs font-semibold text-white group-hover:text-ns-accent transition-colors",children:["Read",e.jsx(m,{size:12,className:"group-hover:translate-x-1 transition-transform"})]})]})]},t.slug))}),o.length===0&&e.jsxs("div",{className:"mb-48 text-center py-24",children:[e.jsx("p",{className:"text-ns-grey-600 mb-3",children:a?`No posts matching "${a}"`:"No posts in this category yet."}),a&&e.jsx("button",{onClick:()=>i(""),className:"text-xs text-ns-grey-500 hover:text-white transition-colors underline",children:"Clear search"})]}),e.jsxs("div",{className:"ns-glass-dark rounded-[2rem] md:rounded-[3.5rem] border border-white/[0.05] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12",children:[e.jsxs("div",{className:"max-w-xl text-center md:text-left",children:[e.jsx("h3",{className:"text-2xl md:text-3xl font-bold text-white mb-4 tracking-tighter",children:"Engineering Blog"}),e.jsx("p",{className:"text-ns-grey-400",children:"Engineers, researchers, and hiring leaders — share your insights on developer tooling, AI evaluation, and the future of technical interviews. We welcome deep technical content."})]}),e.jsx("button",{onClick:()=>n("/contact"),className:"px-8 py-3 bg-white/[0.05] border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-all text-xs uppercase tracking-widest shrink-0",children:"Share an Article"})]})]})})}export{b as POSTS,k as default};
