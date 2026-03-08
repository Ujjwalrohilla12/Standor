// @ts-nocheck
import React, { useState, useRef, Suspense, useCallback, useMemo } from 'react';
import useStore from '../../store/useStore';
import { osiLayers } from '../../utils/mockData';

let Canvas, useFrame, OrbitControls, THREE;
try {
  Canvas = require('@react-three/fiber').Canvas;
  useFrame = require('@react-three/fiber').useFrame;
  OrbitControls = require('@react-three/drei').OrbitControls;
  THREE = require('three');
} catch (e) {
  console.warn('R3F not available');
}

function LayerBox({ layer, index, total, isSelected, isHovered, onSelect, onHover }: any) {
  const meshRef = useRef();
  const yPos = (total - index - 1) * 0.7 - (total * 0.7) / 2;
  const brightness = 0.12 + (index / total) * 0.3;

  useFrame(() => {
    if (!meshRef.current) return;
    const ts = isSelected ? 1.08 : isHovered ? 1.03 : 1;
    const ty = isSelected ? yPos + 0.15 : yPos;
    meshRef.current.scale.x += (ts - meshRef.current.scale.x) * 0.12;
    meshRef.current.scale.z += (ts - meshRef.current.scale.z) * 0.12;
    meshRef.current.position.y += (ty - meshRef.current.position.y) * 0.12;
  });

  const grey = isSelected ? 0.95 : isHovered ? brightness + 0.15 : brightness;
  const opacity = isSelected ? 0.9 : isHovered ? 0.7 : 0.5;
  const color = useMemo(() => new THREE.Color(grey, grey, grey), [grey]);

  return (
    <mesh
      ref={meshRef}
      position={[0, yPos, 0]}
      onClick={(e) => { e.stopPropagation(); onSelect(layer); }}
      onPointerOver={(e) => { e.stopPropagation(); onHover(layer); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(null); document.body.style.cursor = 'default'; }}
    >
      <boxGeometry args={[3.2, 0.4, 2]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function OSIStack() {
  const { selectedLayer, setSelectedLayer } = useStore();
  const [hoveredLayer, setHoveredLayer] = useState<any>(null);
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {osiLayers.map((layer, index) => (
        <LayerBox
          key={layer.id}
          layer={layer}
          index={index}
          total={osiLayers.length}
          isSelected={selectedLayer?.id === layer.id}
          isHovered={hoveredLayer?.id === layer.id}
          onSelect={setSelectedLayer}
          onHover={setHoveredLayer}
        />
      ))}
    </group>
  );
}

function R3FScene({ onDeselect }: { onDeselect: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 5.5], fov: 42 }}
      style={{ background: '#0A0A0A' }}
      onClick={onDeselect}
      onCreated={({ gl }) => { gl.setClearColor('#0A0A0A'); }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <pointLight position={[-3, 2, 3]} intensity={0.2} />
      <OSIStack />
      <OrbitControls enablePan={false} enableZoom minDistance={3} maxDistance={10} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 6} />
      <gridHelper args={[12, 24, '#1a1a1a', '#111111']} position={[0, -3, 0]} />
    </Canvas>
  );
}

// Each layer gets a signature color that gradients into the dark bg
const LAYER_COLORS: Record<number, { r: number; g: number; b: number; hex: string }> = {
  7: { r: 99,  g: 102, b: 241, hex: '#6366f1' },  // Application - Indigo
  6: { r: 168, g: 85,  b: 247, hex: '#a855f7' },  // Presentation - Purple
  5: { r: 20,  g: 184, b: 166, hex: '#14b8a6' },  // Session - Teal
  4: { r: 6,   g: 182, b: 212, hex: '#06b6d4' },  // Transport - Cyan
  3: { r: 245, g: 158, b: 11,  hex: '#f59e0b' },  // Network - Amber
  2: { r: 244, g: 63,  b: 94,  hex: '#f43f5e' },  // Data Link - Rose
  1: { r: 132, g: 204, b: 22,  hex: '#84cc16' },  // Physical - Lime
};

function CSSSlicerView() {
  const { selectedLayer, setSelectedLayer } = useStore();
  const [hoveredLayer, setHoveredLayer] = useState<any>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Subtle radial glow from selected layer color */}
      {selectedLayer && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{
          background: `radial-gradient(ellipse at center, ${LAYER_COLORS[selectedLayer.id].hex}08 0%, transparent 70%)`,
        }} />
      )}

      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ perspective: '1200px' }}>
        <div style={{ transformStyle: 'preserve-3d', transform: 'rotateX(15deg) rotateY(-22deg)' }}>
          {osiLayers.map((layer, index) => {
            const isSelected = selectedLayer?.id === layer.id;
            const isHovered = hoveredLayer?.id === layer.id;
            const yOffset = (osiLayers.length - index - 1) * 36;
            const c = LAYER_COLORS[layer.id];

            // Default: very low opacity color fading into the dark bg
            // Hover: color becomes more visible
            // Selected: rich gradient with glow
            const baseAlpha = 0.12;
            const hoverAlpha = 0.3;
            const selectedAlpha = 0.55;
            const alpha = isSelected ? selectedAlpha : isHovered ? hoverAlpha : baseAlpha;

            return (
              <div
                key={layer.id}
                className="absolute cursor-pointer"
                style={{
                  width: '360px', height: '44px', top: `${yOffset}px`, left: '-180px',
                  transition: 'all 250ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                  transform: isSelected ? 'scale(1.06) translateY(-6px) translateZ(10px)' : isHovered ? 'scale(1.02) translateZ(4px)' : 'scale(1)',
                }}
                onClick={() => setSelectedLayer(isSelected ? null : layer)}
                onMouseEnter={() => setHoveredLayer(layer)}
                onMouseLeave={() => setHoveredLayer(null)}
                data-testid={`osi-layer-${layer.id}`}
              >
                <div
                  className="w-full h-full rounded-lg border flex items-center px-4 justify-between backdrop-blur-sm overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, rgba(${c.r},${c.g},${c.b},${alpha}) 0%, rgba(${c.r},${c.g},${c.b},${alpha * 0.3}) 60%, rgba(10,10,10,${isSelected ? 0.4 : 0.8}) 100%)`,
                    borderColor: isSelected
                      ? `rgba(${c.r},${c.g},${c.b},0.6)`
                      : isHovered
                        ? `rgba(${c.r},${c.g},${c.b},0.25)`
                        : `rgba(${c.r},${c.g},${c.b},0.08)`,
                    boxShadow: isSelected
                      ? `0 4px 28px rgba(${c.r},${c.g},${c.b},0.25), inset 0 1px 0 rgba(255,255,255,0.08)`
                      : isHovered
                        ? `0 2px 16px rgba(${c.r},${c.g},${c.b},0.1)`
                        : 'none',
                  }}
                >
                  <span className="text-xs font-semibold" style={{
                    color: isSelected ? '#fff' : isHovered ? `rgba(${Math.min(c.r+60,255)},${Math.min(c.g+60,255)},${Math.min(c.b+60,255)},0.95)` : '#b0b0b0',
                  }}>
                    L{layer.id} {layer.name}
                  </span>
                  <span className="text-[10px]" style={{
                    color: isSelected ? 'rgba(255,255,255,0.7)' : '#555',
                  }}>
                    {layer.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) {
    console.warn('R3F Error:', error.message);
    this.props.onError?.();
  }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export default function OSISlicer() {
  const { selectedLayer, setSelectedLayer } = useStore();
  const [use3D, setUse3D] = useState(false);
  const [r3fError, setR3fError] = useState(false);
  const canUse3D = Canvas && useFrame && OrbitControls && THREE;

  const handleError = useCallback(() => { setR3fError(true); setUse3D(false); }, []);

  return (
    <div className="relative w-full h-full bg-ns-bg-900" data-testid="osi-slicer-container">
      {use3D && canUse3D && !r3fError ? (
        <ErrorBoundary onError={handleError} fallback={<CSSSlicerView />}>
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm">Loading 3D...</div>
          }>
            <R3FScene onDeselect={() => setSelectedLayer(null)} />
          </Suspense>
        </ErrorBoundary>
      ) : (
        <CSSSlicerView />
      )}

      {selectedLayer && (() => {
        const sc = LAYER_COLORS[selectedLayer.id];
        return (
          <div
            className="absolute top-4 right-4 px-4 py-3 rounded-lg backdrop-blur-md max-w-xs"
            style={{
              background: `linear-gradient(135deg, rgba(${sc.r},${sc.g},${sc.b},0.12) 0%, rgba(18,18,18,0.92) 100%)`,
              border: `1px solid rgba(${sc.r},${sc.g},${sc.b},0.2)`,
            }}
            data-testid="layer-info-panel"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: sc.hex }} />
              <h3 className="font-semibold text-xs text-white">Layer {selectedLayer.id}: {selectedLayer.name}</h3>
            </div>
            <p className="text-[10px] text-neutral-500">{selectedLayer.description}</p>
          </div>
        );
      })()}

      <div className="absolute bottom-4 right-4 flex items-center gap-3">
        {canUse3D && (
          <button
            onClick={() => { setUse3D(!use3D); if (r3fError) setR3fError(false); }}
            className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06]"
            data-testid="toggle-3d-btn"
          >
            {use3D && !r3fError ? 'Switch to 2D' : 'Switch to 3D'}
          </button>
        )}
        <div className="text-neutral-700 text-[10px]" data-testid="controls-hint">
          {use3D ? 'Click: Select | Drag: Rotate | Scroll: Zoom' : 'Click layers to inspect'}
        </div>
      </div>
    </div>
  );
}
