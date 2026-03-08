/**
 * English (default) locale strings for Standor.
 * Keys use dot-notation namespacing: nav.*, hero.*, common.*, etc.
 */
const en = {
  // Navigation
  'nav.features': 'Features',
  'nav.howItWorks': 'How It Works',
  'nav.docs': 'Docs',
  'nav.blog': 'Blog',
  'nav.pricing': 'Pricing',
  'nav.login': 'Sign In',
  'nav.signup': 'Get Started',

  // Common
  'common.learnMore': 'Learn more',
  'common.getStarted': 'Get started',
  'common.requestDemo': 'Request demo',
  'common.contactSales': 'Contact sales',
  'common.readMore': 'Read more',
  'common.tryFree': 'Try for free',
  'common.viewDocs': 'View docs',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.loading': 'Loading…',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.error': 'Something went wrong',
  'common.success': 'Done!',

  // Footer
  'footer.newsletter.title': 'Stay current on forensic techniques',
  'footer.newsletter.placeholder': 'Enter your email',
  'footer.newsletter.cta': 'Subscribe',
  'footer.newsletter.fine': 'No spam. Unsubscribe any time.',
  'footer.copyright': '© 2026 Standor. All rights reserved.',

  // Landing
  'landing.hero.headline': 'See inside every packet.',
  'landing.hero.sub': 'FAANG-grade network forensics platform. Upload a PCAP, reconstruct TCP streams, and investigate threats in a real-time 3D OSI slicer.',

  // Auth
  'auth.login.title': 'Sign in',
  'auth.register.title': 'Create account',
  'auth.forgotPassword': 'Forgot password?',
  'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'auth.signUp': 'Sign up',
  'auth.signIn': 'Sign in',

  // Errors
  'error.required': 'This field is required',
  'error.invalidEmail': 'Enter a valid email address',
  'error.minLength': 'Too short',
  'error.network': 'Network error — please try again',
};

export type Locale = 'en';
export type TranslationKey = keyof typeof en;
export default en;
