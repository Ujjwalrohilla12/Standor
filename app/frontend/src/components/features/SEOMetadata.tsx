import { Helmet } from 'react-helmet-async';

export interface SEOMetadataProps {
  /** Page title */
  title: string;
  /** Page description */
  description: string;
  /** Canonical URL */
  canonicalUrl?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Page type (website, article, etc.) */
  type?: string;
  /** Additional keywords */
  keywords?: string[];
}

/**
 * SEOMetadata Component
 * 
 * Provides comprehensive SEO metadata including:
 * - Meta title and description
 * - Open Graph tags for social sharing
 * - Twitter Card tags
 * - Canonical URL
 * - Keywords
 * 
 * @example
 * ```tsx
 * <SEOMetadata
 *   title="Features - Standor | FAANG-Grade Technical Interview Platform"
 *   description="Discover Standor's enterprise-grade features: real-time collaborative coding, AI analysis, session replay, and more."
 *   canonicalUrl="https://standor.com/features"
 *   ogImage="https://standor.com/og-features.png"
 * />
 * ```
 */
export function SEOMetadata({
  title,
  description,
  canonicalUrl,
  ogImage = '/og-default.png',
  type = 'website',
  keywords = [],
}: SEOMetadataProps) {
  const fullTitle = (() => {
    if (!title) return 'Standor | Technical Interview Platform';
    if (title.startsWith('Standor | ')) return title;
    if (title.includes(' | Standor')) return `Standor | ${title.replace(' | Standor', '').trim()}`;
    if (title.includes(' - Standor')) return `Standor | ${title.replace(' - Standor', '').trim()}`;
    if (title.includes(' — Standor')) return `Standor | ${title.replace(' — Standor', '').trim()}`;
    return `Standor | ${title}`;
  })();
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://standor.com';
  const fullCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Standor" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Standor" />
    </Helmet>
  );
}

export default SEOMetadata;
