import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Environment, Float } from '@react-three/drei';
import GLBLoaderWrapper from './GLBLoaderWrapper';
import * as THREE from 'three';

/* ── Central torus-knot portal ── */
function PortalKnot() {
  const knotRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (knotRef.current) {
      knotRef.current.rotation.x = t * 0.15;
      knotRef.current.rotation.y = t * 0.22;
      knotRef.current.rotation.z = t * 0.08;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = -t * 0.1;
      wireRef.current.rotation.y = -t * 0.18;
      wireRef.current.rotation.z = -t * 0.12;
    }
  });

  return (
    <group>
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[0.7, 0.22, 128, 24, 2, 3]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.7}
          roughness={0.08}
          metalness={0.9}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh ref={wireRef}>
        <torusKnotGeometry args={[0.74, 0.24, 64, 12, 2, 3]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#06b6d4"
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.3, 16, 16]} />
        <meshStandardMaterial
          color="#0891b2"
          emissive="#06b6d4"
          emissiveIntensity={0.35}
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

/* ── Concentric portal rings ── */
function PortalRings() {
  const rings = useMemo(() => [
    { radius: 1.5, speed: 0.6, color: '#22d3ee', tiltX: 0, tiltZ: 0 },
    { radius: 1.9, speed: -0.45, color: '#06b6d4', tiltX: Math.PI / 3, tiltZ: 0.2 },
    { radius: 2.3, speed: 0.35, color: '#67e8f9', tiltX: -Math.PI / 4, tiltZ: -0.3 },
  ], []);

  return (
    <>
      {rings.map((r, i) => (
        <PortalRing key={i} {...r} />
      ))}
    </>
  );
}

function PortalRing({ radius, speed, color, tiltX, tiltZ }: {
  radius: number; speed: number; color: string; tiltX: number; tiltZ: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, 0.012, 8, 80]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.25} />
    </mesh>
  );
}

/* ── Spiral particle trail ── */
function SpiralParticles() {
  const count = 100;
  const posRef = useRef<THREE.BufferGeometry>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 6;
      const r = 0.5 + (i / count) * 2.2;
      arr[i * 3] = Math.cos(t) * r;
      arr[i * 3 + 1] = (i / count) * 3 - 1.5;
      arr[i * 3 + 2] = Math.sin(t) * r;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!posRef.current) return;
    const pos = posRef.current.attributes.position.array as Float32Array;
    const time = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 6 + time * 0.4;
      const r = 0.5 + (i / count) * 2.2;
      pos[i * 3] = Math.cos(t) * r;
      pos[i * 3 + 2] = Math.sin(t) * r;
    }
    posRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={posRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#67e8f9" size={0.04} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

/* ── Floating energy cubes ── */
function EnergyCubes() {
  const cubes = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 4.5,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 2.5,
      ] as [number, number, number],
      speed: 0.3 + Math.random() * 0.5,
      size: 0.06 + Math.random() * 0.06,
      idx: i,
    })),
  []);

  return (
    <>
      {cubes.map((c) => (
        <EnergyCube key={c.idx} {...c} />
      ))}
    </>
  );
}

function EnergyCube({ pos, speed, size }: { pos: [number, number, number]; speed: number; size: number; idx: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = pos[1] + Math.sin(t * speed + pos[0]) * 0.4;
    ref.current.rotation.x = t * speed;
    ref.current.rotation.y = t * speed * 0.7;
  });
  return (
    <mesh ref={ref} position={pos}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color="#a5f3fc" emissive="#22d3ee" emissiveIntensity={1.0} transparent opacity={0.7} />
    </mesh>
  );
}

/* ── Main exported scene ── */
export default function SignUpPortal3D({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-[26rem] md:h-[31rem] rounded-[1.75rem] overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.14),_transparent_58%),linear-gradient(180deg,#0a1114_0%,#050809_100%)] shadow-2xl shadow-cyan-950/30 ${className}`}>
      <Canvas camera={{ position: [0, 0.5, 5.5], fov: 40 }} dpr={[1, 1.5]} shadows>
        <color attach="background" args={['#050a0d']} />
        <ambientLight intensity={0.35} />
        <pointLight position={[4, 5, 4]} intensity={1.4} color="#a5f3fc" />
        <pointLight position={[-4, -2, 3]} intensity={0.9} color="#06b6d4" />
        <pointLight position={[0, -4, 2]} intensity={0.5} color="#22d3ee" />

        <Suspense fallback={<Html center><span className="text-cyan-300 text-sm">Loading…</span></Html>}>
          <GLBLoaderWrapper modelPath="/models/signup.glb">
            <Float speed={1.0} rotationIntensity={0.25} floatIntensity={0.4}>
              <PortalKnot />
            </Float>
            <PortalRings />
            <SpiralParticles />
            <EnergyCubes />
            <Environment preset="night" />
          </GLBLoaderWrapper>
        </Suspense>
      </Canvas>
    </div>
  );
}
