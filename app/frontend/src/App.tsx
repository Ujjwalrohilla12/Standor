import "@/styles/tokens.css";
import "@/styles/global.css";
import "@/index.css";
import "@/App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Suspense, lazy, Component, type ReactNode, useEffect } from "react";
import { initAccessibility } from "./hooks/useAccessibility";
import { trackPageview, onConsentChanged } from "./utils/analytics";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import { ArrowLeft, Home } from "lucide-react";

// ───── Eagerly loaded (critical path — tiny components) ─────
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import GridBackground from "./components/GridBackground";
import ProtectedRoute from "./components/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";
import PageShell from "./components/PageShell";
import GlowCursor from "./components/GlowCursor";
import PageTransition from "./components/PageTransition";
import { ErrorBoundary } from "./components/ErrorBoundaries";
import { PageLoader } from "./components/Skeletons"; // I should add PageLoader to Skeletons or just keep it here

// ───── Lazy-loaded pages (code split per route) ─────
// Marketing pages
const Landing = lazy(() => import("./pages/Landing"));
const About = lazy(() => import("./pages/About"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const UseCases = lazy(() => import("./pages/UseCases"));
const Customers = lazy(() => import("./pages/Customers"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Docs = lazy(() => import("./pages/Docs"));
const ApiSdks = lazy(() => import("./pages/ApiSdks"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Status = lazy(() => import("./pages/Status"));
const AccessibilityPage = lazy(() => import("./pages/AccessibilityPage"));
const Security = lazy(() => import("./pages/Security"));
const ROICalculator = lazy(() => import("./pages/ROICalculator"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Legal = lazy(() => import("./pages/Legal"));
const PrivacyData = lazy(() => import("./pages/PrivacyData"));
const Training = lazy(() => import("./pages/Training"));
const NewsletterConfirm = lazy(() => import("./pages/NewsletterConfirm"));
const Demo = lazy(() => import("./pages/Demo")); // Add Demo page

// Auth pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AuthMagic = lazy(() => import("./pages/AuthMagic"));
const OrgAcceptInvite = lazy(() => import("./pages/OrgAcceptInvite"));
const SharedSession = lazy(() => import("./pages/SharedSession"));

// App pages (protected)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CodePairPage = lazy(() => import("./features/codepair/CodePairPage"));
const CreateSession = lazy(() => import("./pages/CreateSession"));
const SessionView = lazy(() => import("./pages/SessionView"));
const Upload = lazy(() => import("./pages/Upload"));
const Settings = lazy(() => import("./pages/Settings"));
const TeamRoom = lazy(() => import("./pages/TeamRoom"));
const Rules = lazy(() => import("./pages/Rules"));
const Webhooks = lazy(() => import("./pages/Webhooks"));
const Admin = lazy(() => import("./pages/Admin"));
const DpiTools = lazy(() => import("./pages/DpiTools"));
const Problems = lazy(() => import("./pages/Problems"));
const Replay = lazy(() => import("./pages/Replay"));
const Lobby = lazy(() => import("./pages/Lobby"));
const JoinMeeting = lazy(() => import("./pages/JoinMeeting"));
const MeetingRoom = lazy(() => import("./pages/MeetingRoom"));

// ───── Apply accessibility on load ─────
initAccessibility();

// ───── Error Boundary to prevent full-page crashes ─────

// ───── 404 Page ─────
function NotFound() {
  const navigate = useNavigate();
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[var(--bg-900)]"
      data-testid="not-found-page"
    >
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-3">404</h1>
        <p className="text-base text-muted mb-6">Page not found</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/[0.1] text-neutral-300 rounded-lg text-sm hover:border-white/[0.2] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors"
          >
            <Home size={14} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ───── Route groups ─────
const authRoutes = [
  "/login",
  "/register",
  "/auth/callback",
  "/auth/magic",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/org/accept-invite",
];
const marketingRoutes = [
  "/use-cases",
  "/how-it-works",
  "/customers",
  "/faq",
  "/docs",
  "/developers",
  "/integrations",
  "/privacy",
  "/terms",
  "/system-status",
  "/status",
  "/accessibility",
  "/about",
  "/security",
  "/roi",
  "/legal",
  "/gallery",
  "/privacy-data",
  "/training",
  "/demo",
];
const isDocsSubpath = (path: string) => path.startsWith("/docs/");
const isNewsletterConfirm = (path: string) => path === "/newsletter/confirm";

function MarketingRoute({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  return (
    <PageShell title={title} description={description}>
      {children}
    </PageShell>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = authRoutes.includes(location.pathname);
  const isMarketingPage =
    marketingRoutes.includes(location.pathname) ||
    location.pathname === "/" ||
    isDocsSubpath(location.pathname) ||
    isNewsletterConfirm(location.pathname);

  // Demo runs as a standalone full-screen route, no global nav/footer
  const isDemoRoute = location.pathname === "/demo";
  const isCodePairRoute = location.pathname.startsWith("/codepair/");
  const isMeetingRoute = location.pathname.startsWith("/meeting/");
  const isJoinRoute = location.pathname.startsWith("/join");
  const isFullScreenRoute = isDemoRoute || isCodePairRoute || isMeetingRoute || isJoinRoute;

  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);
  useEffect(
    () => onConsentChanged(() => trackPageview(location.pathname)),
    [location.pathname],
  );

  return (
    <div className="App relative min-h-screen flex flex-col">
      <GlowCursor />
      <div
        className={`relative flex-1 flex flex-col ${!isAuthPage && !isFullScreenRoute ? "pt-10 md:pt-12" : ""}`}
      >
        {!isAuthPage && !isFullScreenRoute && <Navbar />}
        <PageTransition>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Marketing */}
              <Route
                path="/"
                element={
                  <MarketingRoute>
                    <Landing />
                  </MarketingRoute>
                }
              />
              <Route path="/join" element={<JoinMeeting />} />
              <Route path="/join/:code" element={<JoinMeeting />} />
              <Route path="/meeting/:code" element={<MeetingRoom />} />
              <Route path="/demo" element={<Demo />} />
              <Route
                path="/about"
                element={
                  <MarketingRoute title="About — Standor">
                    <About />
                  </MarketingRoute>
                }
              />
              <Route
                path="/how-it-works"
                element={
                  <MarketingRoute title="How It Works — Standor">
                    <HowItWorks />
                  </MarketingRoute>
                }
              />
              <Route
                path="/use-cases"
                element={
                  <MarketingRoute title="Use Cases — Standor">
                    <UseCases />
                  </MarketingRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <MarketingRoute title="Customers — Standor">
                    <Customers />
                  </MarketingRoute>
                }
              />
              <Route
                path="/faq"
                element={
                  <MarketingRoute title="FAQ — Standor">
                    <FAQ />
                  </MarketingRoute>
                }
              />
              <Route
                path="/docs"
                element={
                  <MarketingRoute title="Documentation — Standor">
                    <Docs />
                  </MarketingRoute>
                }
              />
              <Route path="/docs/*" element={<Navigate to="/docs" replace />} />
              <Route
                path="/developers"
                element={
                  <MarketingRoute title="API & SDKs — Standor">
                    <ApiSdks />
                  </MarketingRoute>
                }
              />
              <Route
                path="/integrations"
                element={
                  <MarketingRoute title="Integrations — Standor">
                    <Integrations />
                  </MarketingRoute>
                }
              />
              <Route
                path="/privacy"
                element={
                  <MarketingRoute title="Privacy Policy — Standor">
                    <Privacy />
                  </MarketingRoute>
                }
              />
              <Route
                path="/terms"
                element={
                  <MarketingRoute title="Terms of Service — Standor">
                    <Terms />
                  </MarketingRoute>
                }
              />
              <Route
                path="/system-status"
                element={
                  <MarketingRoute title="Status — Standor">
                    <Status />
                  </MarketingRoute>
                }
              />
              <Route
                path="/status"
                element={
                  <MarketingRoute title="Status — Standor">
                    <Status />
                  </MarketingRoute>
                }
              />
              <Route
                path="/accessibility"
                element={
                  <MarketingRoute title="Accessibility — Standor">
                    <AccessibilityPage />
                  </MarketingRoute>
                }
              />
              <Route
                path="/security"
                element={
                  <MarketingRoute title="Security — Standor">
                    <Security />
                  </MarketingRoute>
                }
              />
              <Route
                path="/roi"
                element={
                  <MarketingRoute title="ROI Calculator — Standor">
                    <ROICalculator />
                  </MarketingRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <MarketingRoute title="Product Gallery — Standor">
                    <Gallery />
                  </MarketingRoute>
                }
              />
              <Route
                path="/legal"
                element={
                  <MarketingRoute title="Legal — Standor">
                    <Legal />
                  </MarketingRoute>
                }
              />
              <Route
                path="/privacy-data"
                element={
                  <MarketingRoute title="Privacy & Data Handling — Standor">
                    <PrivacyData />
                  </MarketingRoute>
                }
              />
              <Route
                path="/training"
                element={
                  <MarketingRoute title="Security Training — Standor">
                    <Training />
                  </MarketingRoute>
                }
              />
              <Route
                path="/newsletter/confirm"
                element={<NewsletterConfirm />}
              />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/magic" element={<AuthMagic />} />
              <Route path="/org/accept-invite" element={<OrgAcceptInvite />} />
              <Route path="/shared/:token" element={<SharedSession />} />

              {/* Protected App */}
              <Route
                path="/tools"
                element={<Navigate to="/tools/dpi" replace />}
              />
              <Route
                path="/tools/dpi"
                element={
                  <ProtectedRoute>
                    <DpiTools />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tools/*"
                element={<Navigate to="/tools/dpi" replace />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/codepair/:roomId" element={<CodePairPage />} />
              <Route
                path="/create-session"
                element={
                  <ProtectedRoute>
                    <CreateSession />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/problems"
                element={
                  <ProtectedRoute>
                    <Problems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session"
                element={
                  <ProtectedRoute>
                    <SessionView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/session/:id"
                element={
                  <ProtectedRoute>
                    <SessionView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/replay/:id"
                element={
                  <ProtectedRoute>
                    <Replay />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lobby/:roomId"
                element={
                  <ProtectedRoute>
                    <Lobby />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team-rooms"
                element={
                  <ProtectedRoute>
                    <TeamRoom />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rules"
                element={
                  <ProtectedRoute>
                    <Rules />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/webhooks"
                element={
                  <ProtectedRoute>
                    <Webhooks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageTransition>
        {!isAuthPage && !isFullScreenRoute && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
          <CookieConsent />
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1A1A1A",
              color: "#F5F5F5",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
