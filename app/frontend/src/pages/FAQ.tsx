import { Plus, Minus, Search, MessageSquare } from "lucide-react";
import { useState } from "react";
import { FaqJsonLd } from "../components/JsonLd"; // changed from "../components/seo/FaqJsonLd" to match existing project structure

const FAQS = [
  {
    category: "General",
    items: [
      {
        q: "Is Standor free to use?",
        a: "Yes. Standor offers a free Lab tier allowing packet analysis, basic storage, and small team collaboration. Larger teams can upgrade for additional capacity and enterprise security controls."
      },
      {
        q: "Can Standor run on-premises?",
        a: "Yes. Enterprise deployments support on-prem or private VPC environments so packet data never leaves your infrastructure."
      },
      {
        q: "Which file formats are supported?",
        a: "Standor currently supports PCAP and PCAP-NG captures. Compressed archives such as .gz or .zip can also be uploaded."
      }
    ]
  },
  {
    category: "Technical",
    items: [
      {
        q: "How does the visualization engine work?",
        a: "Standor uses WebGL rendering with React Three Fiber to map packet relationships across OSI layers and time windows."
      },
      {
        q: "Can Standor be automated?",
        a: "Yes. Standor provides a full REST API and official SDKs allowing automated ingestion, querying, and export of packet analysis results."
      },
      {
        q: "How are large PCAP files handled?",
        a: "Large captures are chunked and processed in parallel using distributed parsing workers, enabling efficient analysis of multi-gigabyte traffic captures."
      }
    ]
  },
  {
    category: "Security",
    items: [
      {
        q: "Is packet data encrypted?",
        a: "All data is encrypted in transit using TLS and encrypted at rest using AES-256. Enterprise deployments also support customer-managed keys."
      },
      {
        q: "Are packet payloads stored?",
        a: "Payloads are temporarily stored during active sessions and can be redacted or obfuscated before sharing analysis results."
      }
    ]
  }
];

export default function FAQ() {

  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggle = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  const faqItems = FAQS.flatMap(cat =>
    cat.items.map(i => ({
      question: i.q,
      answer: i.a
    }))
  );

  const matchesSearch = (text: string) =>
    text.toLowerCase().includes(search.toLowerCase());

  return (
    <>
      <FaqJsonLd items={faqItems} />

      <div className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}

          <div className="max-w-4xl mb-24">

            <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-bold text-white leading-tight mb-8">
              Frequently
              <br />
              <span className="text-neutral-500">
                asked questions
              </span>
            </h1>

            <p className="text-xl text-neutral-400 leading-relaxed max-w-2xl">
              Answers about Standor's architecture, security design,
              and packet analysis platform.
            </p>

          </div>


          {/* SEARCH */}

          <div className="max-w-xl mb-24">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                type="text"
                placeholder="Search questions..."
                className="w-full bg-neutral-900 border border-white/10 rounded-full py-4 pl-14 pr-6 text-white focus:outline-none focus:border-white/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

            </div>

          </div>


          {/* FAQ CONTENT */}

          <div className="grid lg:grid-cols-12 gap-16">

            {/* CATEGORY SIDEBAR */}

            <div className="lg:col-span-4">

              <div className="sticky top-32 space-y-4">

                {FAQS.map((cat, i) => (

                  <div
                    key={i}
                    className="px-6 py-4 rounded-xl border border-white/5 text-neutral-400"
                  >
                    <div className="flex justify-between">

                      <span className="font-semibold text-white">
                        {cat.category}
                      </span>

                      <span className="text-xs text-neutral-500">
                        {cat.items.length}
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </div>


            {/* QUESTIONS */}

            <div className="lg:col-span-8 space-y-10">

              {FAQS.map((cat, ci) => (

                <div key={ci}>

                  <h3 className="text-xs uppercase tracking-widest text-neutral-500 mb-6">
                    {cat.category}
                  </h3>

                  <div className="space-y-4">

                    {cat.items
                      .filter(
                        item =>
                          matchesSearch(item.q) ||
                          matchesSearch(item.a)
                      )
                      .map((item, i) => {

                        const id = `${ci}-${i}`;
                        const isOpen = openIndex === id;

                        return (
                          <div
                            key={id}
                            className="border border-white/10 rounded-2xl overflow-hidden bg-neutral-900"
                          >

                            <button
                              onClick={() => toggle(id)}
                              className="w-full text-left p-6 flex items-center justify-between"
                            >

                              <h4 className="text-white font-semibold">
                                {item.q}
                              </h4>

                              {isOpen ? (
                                <Minus size={18} />
                              ) : (
                                <Plus size={18} />
                              )}

                            </button>

                            {isOpen && (

                              <div className="px-6 pb-6 text-neutral-400 leading-relaxed">
                                {item.a}
                              </div>

                            )}

                          </div>
                        );

                      })}

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* SUPPORT CTA */}

          <div className="mt-32 border border-white/10 rounded-3xl p-12 text-center">

            <h3 className="text-3xl font-bold text-white mb-6">
              Still have questions?
            </h3>

            <p className="text-neutral-400 mb-10 max-w-xl mx-auto">
              Our support engineers are available to assist with
              Standor deployments, investigations, and integrations.
            </p>

            <button className="bg-white text-black px-8 py-3 rounded-full flex items-center gap-2 mx-auto">

              <MessageSquare size={18} />

              Contact Support

            </button>

          </div>

        </div>
      </div>
    </>
  );
}
