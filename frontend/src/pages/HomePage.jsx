import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  CheckIcon,
  Code2Icon,
  SparklesIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
} from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

function HomePage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async ({ credential }) => {
    try {
      const res = await axiosInstance.post("/auth/google", { credential });
      signIn(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-base-100/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform duration-200">
            <div className="size-10 rounded-xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
              <SparklesIcon className="size-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-mono tracking-wider">
                Standor
              </span>
              <span className="text-xs text-base-content/60 font-medium -mt-1">Code Together</span>
            </div>
          </Link>

          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error("Google sign-in failed")}
            shape="pill"
            text="signin_with"
            size="large"
          />
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <motion.div className="space-y-8" variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="badge badge-primary badge-lg">
              <ZapIcon className="size-4" />
              Real-time Collaboration
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="text-5xl lg:text-7xl font-black leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Code Together,
              </span>
              <br />
              <span className="text-base-content">Learn Together</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-xl text-base-content/70 leading-relaxed max-w-xl">
              The ultimate platform for collaborative coding interviews and pair programming.
              Connect face-to-face, code in real-time, and ace your technical interviews.
            </motion.p>

            {/* FEATURE PILLS */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-3">
              {["Live Video Chat", "Code Editor", "Multi-Language"].map((label) => (
                <div key={label} className="badge badge-lg badge-outline">
                  <CheckIcon className="size-4 text-success" />
                  {label}
                </div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-4 items-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google sign-in failed")}
                shape="rectangular"
                text="signin_with"
                size="large"
              />
              <button className="btn btn-outline btn-lg">
                <VideoIcon className="size-5" />
                Watch Demo
              </button>
            </motion.div>

            {/* STATS */}
            <motion.div variants={fadeUp} custom={5} className="stats stats-vertical lg:stats-horizontal bg-base-100 shadow-lg">
              <div className="stat">
                <div className="stat-value text-primary">10K+</div>
                <div className="stat-title">Active Users</div>
              </div>
              <div className="stat">
                <div className="stat-value text-secondary">50K+</div>
                <div className="stat-title">Sessions</div>
              </div>
              <div className="stat">
                <div className="stat-value text-accent">99.9%</div>
                <div className="stat-title">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.img
            src="/hero.png"
            alt="Standor Platform"
            className="w-full h-auto rounded-3xl shadow-2xl border-4 border-base-100 hover:scale-105 transition-transform duration-500"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to <span className="text-primary font-mono">Succeed</span>
          </h2>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Powerful features designed to make your coding interviews seamless and productive
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {[
            {
              icon: <VideoIcon className="size-8 text-primary" />,
              title: "HD Video Call",
              desc: "Crystal clear video and audio for seamless communication during interviews",
            },
            {
              icon: <Code2Icon className="size-8 text-primary" />,
              title: "Live Code Editor",
              desc: "Collaborate in real-time with syntax highlighting and multiple language support",
            },
            {
              icon: <UsersIcon className="size-8 text-primary" />,
              title: "Easy Collaboration",
              desc: "Share your screen, discuss solutions, and learn from each other in real-time",
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="card bg-base-100 shadow-xl hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="card-body items-center text-center">
                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="text-base-content/70">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
export default HomePage;
