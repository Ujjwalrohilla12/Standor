import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Footer from './Footer';
import { OrganizationJsonLd, BreadcrumbJsonLd } from './JsonLd';

const SITE_URL = 'https://standor.dev';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

interface PageShellProps {
  children: ReactNode;
  title?: string;
  description?: string;
  image?: string;
  transparentNav?: boolean;
}

/** Derive human-readable breadcrumb items from a pathname like /features → Home > Features */
function buildBreadcrumbs(pathname: string) {
  const crumbs = [{ name: 'Home', href: '/' }];
  const segments = pathname.replace(/\/$/, '').split('/').filter(Boolean);
  let acc = '';
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({
      name: seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      href: acc,
    });
  }
  return crumbs;
}

export default function PageShell({
  children,
  title = 'Standor — Technical Interview Platform',
  description = 'Reconstruct network truth, surface anomalies, and collaborate in real-time with Standor.',
  image,
  transparentNav = false
}: PageShellProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const breadcrumbs = buildBreadcrumbs(pathname);
  const ogImage = image || DEFAULT_OG_IMAGE;
  const canonicalUrl = `${SITE_URL}${pathname}`;

  return (
    <div className="min-h-screen flex flex-col bg-ns-bg">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="Standor" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}
