import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://standor.dev';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEO({ title, description, path = '/', image }) {
  const fullTitle = title
    ? title.startsWith('Standor | ')
      ? title
      : `Standor | ${title}`
    : 'Standor | Technical Interview Platform';
  const desc = description || 'Conduct AI-powered technical interviews, analyze candidate code in real time, and collaborate seamlessly. Free for everyone.';
  const url = `${BASE_URL}${path}`;
  const img = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="Standor" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
