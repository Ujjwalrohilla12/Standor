/**
 * JSON-LD structured data components.
 * Rendered as <script type="application/ld+json"> tags via react-helmet-async.
 * Keeps SEO schemas co-located with the components that need them.
 */

import { Helmet } from 'react-helmet-async';

// ── Organization (site-wide) ──────────────────────────────────────────────────

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Standor',
    url: 'https://standor.dev',
    logo: 'https://standor.dev/logo.png',
    sameAs: [
      'https://github.com/standor',
    ],
    description:
      'Standor is a FAANG-grade, open-source network forensics platform for uploading, visualising, and analysing PCAP/PCAPNG captures in 3D with real-time collaboration.',
    foundingDate: '2024',
    applicationCategory: 'SecurityApplication',
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ── SoftwareApplication (product) ────────────────────────────────────────────

export function SoftwareAppJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Standor',
    operatingSystem: 'Web',
    applicationCategory: 'SecurityApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Upload PCAP and PCAPNG captures, explore packets in an interactive 3D OSI slicer, annotate anomalies, set policy alert rules, and collaborate in real time.',
    url: 'https://standor.dev',
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ── BreadcrumbList (per-page) ─────────────────────────────────────────────────

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl = 'https://standor.dev';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${baseUrl}${item.href}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqJsonLdProps {
  items: FaqItem[];
}

export function FaqJsonLd({ items }: FaqJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
