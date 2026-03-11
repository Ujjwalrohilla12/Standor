import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Is Standor free?",
    a: "Yes. Standor is free for individual interviewers and small teams.",
  },
  {
    q: "Do candidates need to create an account?",
    a: "No. Candidates can join right away from your invite link without signing up.",
  },
  {
    q: "Can we interview in different coding languages?",
    a: "Yes. You can run interviews in the major coding languages your team already uses.",
  },
  {
    q: "How does live coding work during an interview?",
    a: "You and the candidate edit the same code together in real time, so collaboration feels natural.",
  },
  {
    q: "Is interview data secure?",
    a: "Yes. Interview content stays protected and is only accessible to authorized users.",
  },
  {
    q: "Can companies use Standor at team scale?",
    a: "Yes. Standor works for growing teams and larger organizations, with options for stricter control when needed.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="w-full py-24 px-6 lg:px-12 bg-black border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-white uppercase tracking-widest">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-colors ${
                  isOpen
                    ? "border-white/20 bg-white/5"
                    : "border-white/10 bg-white/[0.02] hover:border-white/15"
                }`}
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                >
                  <h4
                    className={`font-semibold text-sm transition-colors ${isOpen ? "text-white" : "text-neutral-300"}`}
                  >
                    {item.q}
                  </h4>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                      isOpen
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/20 text-neutral-400"
                    }`}
                  >
                    {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-neutral-400 leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
