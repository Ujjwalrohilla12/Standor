import { Helmet } from "react-helmet-async";

/**
 * FAQ Structured Data
 *
 * Provides FAQ schema in JSON-LD format for search engines.
 */
export function FAQStructuredData() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Standor?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Standor is an AI-powered technical interview platform designed for engineering teams. It enables seamless collaborative coding sessions with real-time code execution, AI-driven insights, and comprehensive evaluation tools to help you hire the best talent efficiently.",
        },
      },
      {
        "@type": "Question",
        name: "How does real-time collaboration work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Standor uses CRDT (Conflict-free Replicated Data Types) technology to enable real-time collaborative coding with sub-50ms latency. Multiple users can edit code simultaneously without conflicts, with live cursor tracking and presence indicators.",
        },
      },
      {
        "@type": "Question",
        name: "What programming languages are supported?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Standor supports 12+ programming languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, Ruby, PHP, Swift, Kotlin, and more. All languages run in secure sandboxed containers.",
        },
      },
      {
        "@type": "Question",
        name: "Is Standor secure for enterprise use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Standor implements enterprise-grade security including Argon2id password hashing, JWT token rotation, TLS 1.2+ encryption, and full GDPR compliance. All code execution happens in isolated sandboxed containers.",
        },
      },
      {
        "@type": "Question",
        name: "Can I review past interviews?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Standor automatically captures session snapshots every 30 seconds and generates comprehensive AI-powered reports. You can replay any interview, export PDF reports, and share them with your hiring team.",
        },
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
    </Helmet>
  );
}

/**
 * Software Application Structured Data
 *
 * Provides SoftwareApplication schema in JSON-LD format for search engines.
 */
export function SoftwareApplicationStructuredData() {
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Standor",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Technical Interview Platform",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free tier available with premium plans for teams",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
      bestRating: "5",
      worstRating: "1",
    },
    description:
      "AI-powered technical interview platform for engineering teams. Features real-time collaborative coding, AI analysis, session replay, and comprehensive evaluation tools.",
    featureList: [
      "Real-time collaborative code editor",
      "AI-powered code analysis",
      "Session replay and recording",
      "Sandboxed code execution",
      "Multi-language support (12+ languages)",
      "Team analytics and reporting",
      "Enterprise security and compliance",
    ],
    screenshot: "https://standor.com/screenshots/dashboard.png",
    softwareVersion: "2.0",
    author: {
      "@type": "Organization",
      name: "Standor",
      url: "https://standor.com",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(appSchema)}</script>
    </Helmet>
  );
}

/**
 * Organization Structured Data
 *
 * Provides Organization schema in JSON-LD format for search engines.
 */
export function OrganizationStructuredData() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Standor",
    url: "https://standor.com",
    logo: "https://standor.com/logo.png",
    description:
      "AI-powered technical interview platform for engineering teams",
    sameAs: [
      "https://twitter.com/standor",
      "https://linkedin.com/company/standor",
      "https://github.com/standor",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@standor.com",
      url: "https://standor.com/#footer",
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
    </Helmet>
  );
}

/**
 * Breadcrumb Structured Data
 *
 * Provides BreadcrumbList schema in JSON-LD format for search engines.
 */
export function BreadcrumbStructuredData({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}

export default {
  FAQStructuredData,
  SoftwareApplicationStructuredData,
  OrganizationStructuredData,
  BreadcrumbStructuredData,
};
