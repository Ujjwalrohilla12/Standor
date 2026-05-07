import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Html, Line, Text } from '@react-three/drei';
import GLBLoaderWrapper from './GLBLoaderWrapper';
import * as THREE from 'three';

function LoginShieldCore() {
  const coreRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.28;
      coreRef.current.rotation.x = Math.sin(t * 0.9) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.26;
    }
  });

  return (
    <group ref={coreRef}>
      <mesh>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#1b2647" emissive="#3557d3" emissiveIntensity={0.65} roughness={0.16} metalness={0.82} wireframe />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#9db4ff" emissive="#86a5ff" emissiveIntensity={0.95} roughness={0.1} metalness={0.9} transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, -0.1, 0.48]}>
        <boxGeometry args={[0.2, 0.26, 0.06]} />
        <meshStandardMaterial color="#e0ebff" emissive="#9db4ff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, -0.03, 0.56]}>
        <torusGeometry args={[0.08, 0.025, 12, 24]} />
        <meshStandardMaterial color="#86a5ff" emissive="#86a5ff" emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.03, 18, 120]} />
        <meshStandardMaterial color="#86a5ff" emissive="#86a5ff" emissiveIntensity={0.45} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function LoginTokenStream({ radius, speed, color, count, tiltX, tiltZ }: { radius: number; speed: number; color: string; count: number; tiltX: number; tiltZ: number; }) {
  const groupRef = useRef<THREE.Group>(null);
  const angles = useMemo(() => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2), [count]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * speed;
    }
  });

  return (
    <group ref={groupRef} rotation={[tiltX, 0, tiltZ]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 8, 96]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={0.22} />
      </mesh>
      {angles.map((angle, index) => (
        <mesh key={index} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.25} />
        </mesh>
      ))}
    </group>
  );
}

function LoginAuthCards() {
  const cards = useMemo(() => [
    { label: 'MFA', sublabel: 'Device check', position: [-1.95, 0.9, 0.15] as [number, number, number], accent: '#86a5ff' },
    { label: 'SSO', sublabel: 'Google sign-in', position: [1.95, 0.55, 0.25] as [number, number, number], accent: '#a5b4fc' },
    { label: 'SESSION', sublabel: 'Protected token', position: [0.15, -1.2, -0.2] as [number, number, number], accent: '#3557d3' },
  ], []);

  return (
    <>
      {cards.map((card, index) => (
        <AuthCard key={card.label} {...card} phase={index * 1.2} />
      ))}
    </>
  );
}

function AuthCard({ label, sublabel, position, accent, phase }: { label: string; sublabel: string; position: [number, number, number]; accent: string; phase: number; }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 1.1) * 0.08;
      ref.current.rotation.y = Math.sin(t * 0.7) * 0.12;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[1.08, 0.46, 0.08]} />
        <meshStandardMaterial color="#111827" roughness={0.55} metalness={0.25} transparent opacity={0.96} />
      </mesh>
      <mesh position={[-0.38, 0.03, 0.06]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
      <Text position={[-0.24, 0.06, 0.06]} fontSize={0.085} color="#eef2ff" anchorX="left" anchorY="middle" fontWeight="bold">
        {label}
      </Text>
      <Text position={[-0.24, -0.07, 0.06]} fontSize={0.046} color="#9ca3af" anchorX="left" anchorY="middle">
        {sublabel}
      </Text>
    </group>
  );
}

function LoginSignals() {
  const positions = useMemo(() => {
    const arr = new Float32Array(96 * 3);
    for (let i = 0; i < 96; i += 1) {
      const radius = 2.2 + Math.random() * 1.6;
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
    const pos = ref.current.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      pos[i + 1] += Math.sin(t * 0.45 + i) * 0.0005;
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#9db4ff" size={0.04} transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function LoginConnector({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  return <Line points={[start, end]} color={color} lineWidth={1.1} transparent opacity={0.33} dashed dashSize={0.18} gapSize={0.08} />;
}

export default function LoginCrystal3D({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-[26rem] md:h-[31rem] rounded-[1.75rem] overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_center,_rgba(79,70,229,0.18),_transparent_65%),linear-gradient(180deg,#0d0f1a_0%,#070810_100%)] shadow-2xl shadow-indigo-950/40 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
        <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-indigo-200/70">Secure Access</div>
            <div className="mt-0.5 text-sm font-semibold tracking-[0.24em] text-indigo-100">Standor Platform</div>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0.25, 5.7], fov: 40 }} dpr={[1, 1.5]} shadows>
        <color attach="background" args={['#08091a']} />
        <ambientLight intensity={0.42} />
        <pointLight position={[4, 5, 4]} intensity={1.45} color="#a5b4fc" />
        <pointLight position={[-4, -3, 3]} intensity={0.95} color="#4f46e5" />
        <pointLight position={[0, -4, -2]} intensity={0.55} color="#6366f1" />

        <Suspense fallback={<Html center><span className="text-indigo-300 text-sm">Loading…</span></Html>}>
          <GLBLoaderWrapper modelPath="/models/login.glb">
            <Float speed={0.95} rotationIntensity={0.22} floatIntensity={0.45}>
              <LoginShieldCore />
            </Float>

            <LoginTokenStream radius={1.55} speed={0.5} color="#818cf8" count={8} tiltX={0.25} tiltZ={0.1} />
            <LoginTokenStream radius={2.0} speed={-0.38} color="#4f46e5" count={6} tiltX={-0.55} tiltZ={0.35} />
            <LoginTokenStream radius={1.2} speed={0.75} color="#a5b4fc" count={10} tiltX={0.78} tiltZ={-0.25} />

            <LoginAuthCards />
            <LoginConnector start={[-1.05, 0.56, 0.16]} end={[0.3, 0.2, 0.1]} color="#a5b4fc" />
            <LoginConnector start={[1.2, 0.25, 0.14]} end={[0.0, -0.52, -0.02]} color="#6366f1" />
            <LoginConnector start={[-0.4, -0.92, -0.08]} end={[-1.05, 0.16, 0.12]} color="#818cf8" />

            <LoginSignals />
            <Environment preset="night" />
          </GLBLoaderWrapper>
        </Suspense>
      </Canvas>
    </div>
  );
}
