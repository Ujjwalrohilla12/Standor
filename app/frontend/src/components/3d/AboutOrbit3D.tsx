import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Html, Line, RoundedBox, Text } from '@react-three/drei';
import GLBLoaderWrapper from './GLBLoaderWrapper';
import * as THREE from 'three';

type ModuleSpec = {
  label: string;
  sublabel: string;
  position: [number, number, number];
  accent: string;
  phase: number;
};

function AboutCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.18;
      coreRef.current.rotation.x = Math.sin(t * 0.7) * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.28;
    }
  });

  return (
    <group ref={coreRef}>
      <RoundedBox args={[1.5, 0.9, 0.26]} radius={0.12} smoothness={4}>
        <meshStandardMaterial color="#19130d" roughness={0.55} metalness={0.28} />
      </RoundedBox>
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[1.08, 0.28, 0.08]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[-0.25, 0.16, 0.18]}>
        <boxGeometry args={[0.6, 0.1, 0.03]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fde68a" emissiveIntensity={0.35} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.45, -0.08, 0.18]}>
        <boxGeometry args={[0.85, 0.09, 0.03]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.45} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.03, 16, 100]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.45} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function AboutModule({ label, sublabel, position, accent, phase }: ModuleSpec) {
  const groupRef = useRef<THREE.Group>(null);
  const tileRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.3) * 0.08;
      groupRef.current.rotation.y = t * 0.15;
    }
    if (tileRef.current) {
      tileRef.current.rotation.z = Math.sin(t * 0.8) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <RoundedBox ref={tileRef} args={[1.0, 0.44, 0.08]} radius={0.07} smoothness={4}>
        <meshStandardMaterial color="#14110b" roughness={0.6} metalness={0.2} transparent opacity={0.94} />
      </RoundedBox>
      <mesh position={[-0.34, 0.03, 0.06]}>
        <boxGeometry args={[0.09, 0.09, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.75} />
      </mesh>
      <Text position={[-0.18, 0.06, 0.06]} fontSize={0.08} color="#fef3c7" anchorX="left" anchorY="middle" fontWeight="bold">
        {label}
      </Text>
      <Text position={[-0.18, -0.07, 0.06]} fontSize={0.045} color="#d6b36a" anchorX="left" anchorY="middle">
        {sublabel}
      </Text>
    </group>
  );
}

function AboutLink({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <group ref={ref}>
      <Line points={[start, end]} color={color} lineWidth={1.2} transparent opacity={0.35} dashed dashSize={0.15} gapSize={0.08} />
    </group>
  );
}

function AboutParticles() {
  const positions = useMemo(() => {
    const arr = new Float32Array(150 * 3);
    for (let i = 0; i < 150; i += 1) {
      const radius = 3.2 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);

  const ref = useRef<THREE.BufferGeometry>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const array = ref.current.attributes.position.array as Float32Array;
    for (let i = 0; i < array.length; i += 3) {
      array[i + 1] += Math.sin(t * 0.25 + i) * 0.0006;
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#f9d28a" size={0.028} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function AboutOrbit3D({ className = '' }: { className?: string }) {
  const modules: ModuleSpec[] = useMemo(() => [
    { label: 'Live Session', sublabel: 'Shared editor + timeline', position: [-1.85, 0.85, 0.35], accent: '#f59e0b', phase: 0 },
    { label: 'AI Analysis', sublabel: 'Signal, score, guidance', position: [1.95, 0.5, 0.1], accent: '#fbbf24', phase: 1.4 },
    { label: 'Replay & Audit', sublabel: 'Session memory and review', position: [-0.15, -1.05, -0.15], accent: '#fde68a', phase: 2.6 },
  ], []);

  return (
    <div className={`relative w-full h-[26rem] md:h-[31rem] rounded-[1.75rem] overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.12),_transparent_58%),linear-gradient(180deg,#12100a_0%,#080704_100%)] shadow-2xl shadow-amber-950/30 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
        <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-amber-200/70">Collaborative</div>
            <div className="mt-0.5 text-sm font-semibold tracking-[0.24em] text-amber-100">Standor Platform</div>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0.35, 6], fov: 38 }} dpr={[1, 1.5]} shadows>
        <color attach="background" args={['#080704']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 5, 4]} intensity={1.3} color="#fde68a" />
        <pointLight position={[-4, -2, 3]} intensity={0.9} color="#f59e0b" />
        <pointLight position={[0, 2, 6]} intensity={0.4} color="#fbbf24" />

        <Suspense fallback={<Html center><span className="text-amber-300 text-sm">Loading…</span></Html>}>
          <GLBLoaderWrapper modelPath="/models/about.glb">
            <Float speed={0.55} rotationIntensity={0.16} floatIntensity={0.28}>
              <AboutCore />
            </Float>

            {modules.map((module, index) => (
              <AboutModule key={module.label} {...module} />
            ))}

            <AboutLink start={[-1.1, 0.55, 0.12]} end={[0.6, 0.2, 0.08]} color="#f59e0b" />
            <AboutLink start={[1.25, 0.3, 0.05]} end={[-0.1, -0.5, -0.03]} color="#fbbf24" />
            <AboutLink start={[-0.55, -0.82, -0.06]} end={[-1.0, 0.15, 0.14]} color="#fde68a" />

            <AboutParticles />
            <Environment preset="sunset" />
          </GLBLoaderWrapper>
        </Suspense>
      </Canvas>
    </div>
  );
}
