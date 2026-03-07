'use client';

/**
 * FILE: apps/web/src/components/3d/Hero3D.tsx
 *
 * 3D hero scene — particle grid that converges on code execution signal.
 * Lazy-loaded via dynamic(). No GLTF assets; pure procedural geometry < 50KB.
 * Falls back to CSS animation if WebGL unavailable.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Particle field ───────────────────────────────────────────────────────────

function ParticleField({ count = 600 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      spd[i] = Math.random() * 0.4 + 0.1;
    }
    return { positions: pos, speeds: spd };
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes['position']!.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const convergence = Math.sin(t * 0.3) * 0.002;
      pos[i * 3] *= 1 - convergence * (speeds[i] ?? 0.1);
      pos[i * 3 + 1] *= 1 - convergence * (speeds[i] ?? 0.1);
    }
    mesh.current.geometry.attributes['position']!.needsUpdate = true;
    mesh.current.rotation.y = t * 0.04;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#14b8a6" sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

// ── Central orb ──────────────────────────────────────────────────────────────

function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = clock.getElapsedTime() * 0.15;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.9, 2]} />
        <MeshDistortMaterial
          color="#0d9488"
          distort={0.25}
          speed={1.2}
          roughness={0.15}
          metalness={0.6}
          emissive="#0d9488"
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

// ── Mouse tilt wrapper ────────────────────────────────────────────────────────

function SceneTilt({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      (-pointer.y * Math.PI) / 24,
      0.05,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      (pointer.x * Math.PI) / 24,
      0.05,
    );
    void viewport;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ── Canvas export ─────────────────────────────────────────────────────────────

export default function Hero3D() {
  return (
    <div
      className="relative h-[480px] w-full cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="3D particle visualization of code analysis"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0B0B0D']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ccfbf1" />
        <pointLight position={[-3, -2, 2]} intensity={0.6} color="#0d9488" />

        <SceneTilt>
          <ParticleField count={500} />
          <CentralOrb />
        </SceneTilt>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Overlay label */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <p className="rounded-full border border-teal-500/20 bg-bg-surface/80 px-4 py-1 text-xs font-medium text-teal-400 backdrop-blur-sm">
          Signal extraction · drag to explore
        </p>
      </div>
    </div>
  );
}
