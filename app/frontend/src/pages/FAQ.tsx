import { Plus, Minus, Search, MessageSquare } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FaqJsonLd } from "../components/JsonLd";

const FAQS = [
  {
    category: "General",
    items: [
      {
        q: "Is Standor free?",
        a: "Yes. You can use Standor for free to run interviews, collaborate live, and review candidate performance with your team.",
      },
      {
        q: "Do candidates need to sign up first?",
        a: "No. Candidates just open your invite link and join the interview directly. They do not need to create an account.",
      },
      {
        q: "Can we use different coding languages in interviews?",
        a: "Yes. You can run interviews in all the common languages most engineering teams use.",
      },
      {
        q: "Can we use our own interview questions?",
        a: "Absolutely. You can bring your own questions or pick from ready-made challenges inside Standor.",
      },
    ],
  },
  {
    category: "How It Works",
    items: [
      {
        q: "Can interviewer and candidate code together in real time?",
        a: "Yes. Both people can type in the same editor at the same time and see updates instantly.",
      },
      {
        q: "Can candidates run their code during the interview?",
        a: "Yes. Candidates can run code during the session so you can both review output and discuss their approach.",
      },
      {
        q: "What does AI analysis actually give me?",
        a: "It gives you a clear summary of code quality, strengths, and possible improvements so feedback is faster and more consistent.",
      },
      {
        q: "Can we connect Standor to our hiring workflow?",
        a: "Yes. Standor can fit into your existing process, so your team can keep hiring workflows in one place.",
      },
    ],
  },
  {
    category: "Security & Privacy",
    items: [
      {
        q: "Is interview data secure?",
        a: "Yes. Interview sessions and account data are protected so only authorized people in your organization can access them.",
      },
      {
        q: "Can we control how long interview data is kept?",
        a: "Yes. You can export important sessions and remove data you no longer want to keep.",
      },
      {
        q: "Can companies host Standor on their own infrastructure?",
        a: "Yes. Teams that need more control can run Standor in their own environment.",
      },
    ],
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggle = (id: string) => setOpenIndex(openIndex === id ? null : id);

  const faqItems = FAQS.flatMap((cat) =>
    cat.items.map((i) => ({ question: i.q, answer: i.a })),
  );
  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(search.toLowerCase());

  const filteredFaqs = FAQS.filter(
    (cat) => !activeCategory || cat.category === activeCategory,
  )
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) => !search || matchesSearch(i.q) || matchesSearch(i.a),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <>
      <FaqJsonLd items={faqItems} />

      <div className="min-h-screen bg-[#0B0B0D] pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#137fec]/30 bg-[#137fec]/10 mb-6">
              <span className="text-[10px] font-mono text-[#137fec] uppercase tracking-widest">
                Support
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6">
              Frequently asked
              <br />
              <span className="text-[#6B7178]">questions.</span>
            </h1>
            <p className="text-xl text-[#6B7178] leading-relaxed">
              Answers about Standor's interview platform, real-time
              collaboration, AI evaluation, and code execution.
            </p>
          </motion.div>

          {/* Search + Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-3 mb-12"
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7178]"
              />
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full bg-[#0B1220] border border-[#1a1a1a] rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-[#333] outline-none focus:border-[#137fec]/40 transition-colors"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[null, ...FAQS.map((c) => c.category)].map((cat) => (
                <button
                  key={cat ?? "all"}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    activeCategory === cat
                      ? "bg-white text-black border-white"
                      : "border-[#1a1a1a] text-[#6B7178] hover:text-white hover:border-[#333]"
                  }`}
                >
                  {cat ?? "All"}
                </button>
              ))}
            </div>
          </motion.div>

          {/* FAQ Content */}
          <div className="space-y-10">
            {filteredFaqs.map((cat, ci) => (
              <motion.div
                key={cat.category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.05 }}
              >
                <p className="text-[10px] font-mono text-[#137fec] uppercase tracking-widest mb-4">
                  {cat.category}
                </p>
                <div className="space-y-2">
                  {cat.items.map((item, i) => {
                    const id = `${ci}-${i}`;
                    const isOpen = openIndex === id;
                    return (
                      <div
                        key={id}
                        className={`rounded-2xl border transition-colors ${isOpen ? "border-[#137fec]/30 bg-[#0B1220]" : "border-[#1a1a1a] bg-[#0B1220] hover:border-[#2a2a2a]"}`}
                      >
                        <button
                          onClick={() => toggle(id)}
                          className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
                        >
                          <h4
                            className={`font-semibold text-sm transition-colors ${isOpen ? "text-white" : "text-[#A6AAB0]"}`}
                          >
                            {item.q}
                          </h4>
                          <div
                            className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${isOpen ? "border-[#137fec] bg-[#137fec]/10 text-[#137fec]" : "border-[#333] text-[#6B7178]"}`}
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
                              <p className="px-6 pb-6 text-sm text-[#6B7178] leading-relaxed">
                                {item.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-20 text-[#333]">
                <Search size={32} className="mx-auto mb-4 opacity-40" />
                <p className="text-sm">No matching questions found.</p>
              </div>
            )}
          </div>

          {/* Support CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 border border-[#1a1a1a] rounded-2xl p-12 text-center bg-[#0B1220]"
          >
            <MessageSquare size={32} className="text-[#137fec] mx-auto mb-5" />
            <h3 className="text-2xl font-bold text-white mb-3">
              Still have questions?
            </h3>
            <p className="text-[#6B7178] mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Our team is available to help with Standor deployments,
              integrations, and custom enterprise setups.
            </p>
            <Link
              to="/#footer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-all"
            >
              <MessageSquare size={15} /> Contact Support
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}
