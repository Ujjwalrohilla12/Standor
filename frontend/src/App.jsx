import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "./context/AuthContext";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

function AnimatedRoute({ element }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {element}
    </motion.div>
  );
}

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedRoute element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" />} />} />
          <Route path="/dashboard" element={<AnimatedRoute element={isSignedIn ? <DashboardPage /> : <Navigate to="/" />} />} />
          <Route path="/problems" element={<AnimatedRoute element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />} />} />
          <Route path="/problem/:id" element={<AnimatedRoute element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />} />} />
          <Route path="/session/:id" element={<AnimatedRoute element={isSignedIn ? <SessionPage /> : <Navigate to="/" />} />} />
        </Routes>
      </AnimatePresence>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
