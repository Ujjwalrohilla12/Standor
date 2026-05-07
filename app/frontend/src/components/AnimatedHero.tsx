import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const LoginCrystal3D = lazy(() => import('./3d/LoginCrystal3D'));
const RegisterHelix3D = lazy(() => import('./3d/RegisterHelix3D'));
const AboutOrbit3D = lazy(() => import('./3d/AboutOrbit3D'));
const SignUpPortal3D = lazy(() => import('./3d/SignUpPortal3D'));

// Fallback while lazy-loading the 3D scene
function SceneFallback() {
  return (
    <div className="w-full h-[26rem] md:h-[31rem] rounded-[1.75rem] overflow-hidden border border-white/10 bg-[linear-gradient(180deg,#14161a_0%,#090a0c_100%)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        <span className="text-[#4b4f55] text-xs tracking-wider uppercase">Loading 3D Scene</span>
      </div>
    </div>
  );
}

export type AnimatedHeroVariant = 'default' | 'auth' | 'login' | 'register' | 'signup' | 'about';

interface AnimatedHeroProps {
  className?: string;
  variant?: AnimatedHeroVariant;
  sceneProps?: Record<string, any>;
}

/**
 * AnimatedHero — renders a unique 3D animated scene per variant.
 *
 * Variants:
 *   - 'login' | 'auth' | 'default' → Crystalline rotating icosahedron (security/lock)
 *   - 'register'                    → DNA double-helix (growth/creation)
 *   - 'about'                       → Orbiting knowledge-node network (connections)
 *   - 'signup'                      → Geometric torus-knot portal (gateway/journey)
 */
export default function AnimatedHero({ className = '', variant = 'default', sceneProps }: AnimatedHeroProps) {
  return (
    <Suspense fallback={<SceneFallback />}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={variant}
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {(() => {
            switch (variant) {
              case 'register':
                return <RegisterHelix3D className={className} {...sceneProps} />;
              case 'about':
                return <AboutOrbit3D className={className} {...sceneProps} />;
              case 'signup':
                return <SignUpPortal3D className={className} {...sceneProps} />;
              case 'login':
                return <LoginCrystal3D className={className} {...sceneProps} />;
              case 'auth':
              case 'default':
              default:
                return <LoginCrystal3D className={className} {...sceneProps} />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
}
