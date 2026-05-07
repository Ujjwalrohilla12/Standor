import React, { Suspense, useEffect, useState, ReactNode } from 'react';
import { Html } from '@react-three/drei';
import { useGLTF } from '@react-three/drei';

class GLBErrorBoundary extends React.Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function GLTFViewer({ path, onGLTF }: { path: string; onGLTF?: (gltf: any) => void }) {
  const gltf = useGLTF(path);
  // notify parent that glTF loaded (mixer/animations can be accessed)
  if (onGLTF) {
    try { onGLTF(gltf); } catch (e) { /* ignore */ }
  }
  return <primitive object={(gltf as any).scene} dispose={null} />;
}

export default function GLBLoaderWrapper({ modelPath, children, onGLTF }: { modelPath: string; children: ReactNode; onGLTF?: (gltf: any) => void }) {
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  useEffect(() => {
    let canceled = false;
    // GET request to check if the model exists (more reliable than HEAD)
    fetch(modelPath, { method: 'GET' })
      .then((res) => {
        if (!canceled) {
          // Check if it's actually a valid file (not HTML error page)
          const contentType = res.headers.get('content-type');
          const isValid = res.ok && (contentType?.includes('application/octet-stream') || contentType?.includes('model/gltf'));
          setHasModel(isValid);
        }
      })
      .catch(() => {
        if (!canceled) setHasModel(false);
      });
    return () => { canceled = true; };
  }, [modelPath]);

  if (hasModel === null) {
    return (
      <Html center>
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
          <span className="text-xs text-neutral-400">Checking model…</span>
        </div>
      </Html>
    );
  }

  if (hasModel) {
    return (
      <GLBErrorBoundary fallback={<>{children}</>}>
        <Suspense fallback={<Html center><span className="text-sm text-neutral-400">Loading model…</span></Html>}>
          <GLTFViewer path={modelPath} onGLTF={onGLTF} />
        </Suspense>
      </GLBErrorBoundary>
    );
  }

  // Fallback to procedural children
  return <>{children}</>;
}
