import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Html, Line, Text } from '@react-three/drei';
import GLBLoaderWrapper from './GLBLoaderWrapper';
import * as THREE from 'three';

type StageSpec = {
  label: string;
  sublabel: string;
  position: [number, number, number];
  accent: string;
  phase: number;
};

function RegistrationCore() {
  const coreRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.22;
      coreRef.current.rotation.x = Math.sin(t * 0.8) * 0.09;
      coreRef.current.position.y = Math.sin(t * 1.2) * 0.05;
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.55 + Math.sin(t * 2) * 0.14;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
    }
  });

  return (
    <group ref={coreRef}>
      <mesh>
        <torusKnotGeometry args={[0.74, 0.2, 140, 20, 2, 3]} />
        <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={0.75} roughness={0.12} metalness={0.88} />
      </mesh>
      <mesh>
        <torusKnotGeometry args={[0.82, 0.22, 72, 12, 2, 3]} />
        <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={0.42} wireframe transparent opacity={0.28} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.15, 0.028, 18, 120]} />
        <meshStandardMaterial color="#6ee7b7" emissive="#34d399" emissiveIntensity={0.42} transparent opacity={0.42} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.32, 20, 20]} />
        <meshStandardMaterial color="#0f766e" emissive="#10b981" emissiveIntensity={0.5} transparent opacity={0.07} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function RegistrationStage({ label, sublabel, position, accent, phase }: StageSpec) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() + phase;
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 1.3) * 0.08;
      ref.current.rotation.y = Math.sin(t * 0.55) * 0.12;
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[1.06, 0.42, 0.08]} />
        <meshStandardMaterial color="#0f1721" roughness={0.58} metalness={0.22} transparent opacity={0.96} />
      </mesh>
      <mesh position={[-0.38, 0.02, 0.06]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.78} />
      </mesh>
      <Text position={[-0.24, 0.055, 0.06]} fontSize={0.08} color="#ecfdf5" anchorX="left" anchorY="middle" fontWeight="bold">
        {label}
      </Text>
      <Text position={[-0.24, -0.07, 0.06]} fontSize={0.045} color="#a7f3d0" anchorX="left" anchorY="middle">
        {sublabel}
      </Text>
    </group>
  );
}

function RegistrationLinks({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  return <Line points={[start, end]} color={color} lineWidth={1.15} transparent opacity={0.34} dashed dashSize={0.16} gapSize={0.08} />;
}

function RegistrationParticles({ success }: { success: boolean }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(84 * 3);
    for (let i = 0; i < 84; i += 1) {
      const radius = 2.0 + Math.random() * 1.8;
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
    const arr = ref.current.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += Math.sin(t * 0.3 + i * 0.1) * 0.0007;
    }
    ref.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry ref={ref}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={success ? '#a7f3d0' : '#6ee7b7'} size={0.038} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

function SuccessPulse() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    const scale = 1.0 + Math.sin(t * 1.8) * 0.08;
    ringRef.current.scale.setScalar(scale);
    (ringRef.current.material as THREE.MeshStandardMaterial).opacity = 0.14 + Math.sin(t * 1.8) * 0.05;
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.55, 0.018, 10, 120]} />
      <meshStandardMaterial color="#a7f3d0" emissive="#34d399" emissiveIntensity={0.35} transparent opacity={0.16} />
    </mesh>
  );
}

function RegisterScene({ triggerSuccess }: { triggerSuccess: boolean }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const successPulseStart = useRef<number | null>(null);

  const stages: StageSpec[] = useMemo(() => [
    { label: 'Profile', sublabel: 'Enter name and email', position: [-1.9, 0.9, 0.14], accent: '#6ee7b7', phase: 0 },
    { label: 'Verify', sublabel: 'Email link + password', position: [1.92, 0.58, 0.22], accent: '#10b981', phase: 1.3 },
    { label: 'Launch', sublabel: 'Join the workspace', position: [0.15, -1.18, -0.2], accent: '#a7f3d0', phase: 2.5 },
  ], []);

  useEffect(() => {
    if (triggerSuccess) {
      successPulseStart.current = performance.now();
    }
  }, [triggerSuccess]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (successPulseStart.current) {
      const elapsed = (performance.now() - successPulseStart.current) / 1000;
      const progress = Math.min(elapsed / 1.2, 1);
      const scale = 1 + Math.sin(progress * Math.PI) * 0.34;
      groupRef.current.scale.setScalar(scale);
      if (progress >= 1) {
        successPulseStart.current = null;
        groupRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={0.85} rotationIntensity={0.2} floatIntensity={0.35}>
        <RegistrationCore />
      </Float>

      {stages.map((stage) => (
        <RegistrationStage key={stage.label} {...stage} />
      ))}

      <RegistrationLinks start={[-1.06, 0.56, 0.18]} end={[0.3, 0.18, 0.08]} color="#6ee7b7" />
      <RegistrationLinks start={[1.18, 0.24, 0.12]} end={[0.0, -0.52, -0.02]} color="#10b981" />
      <RegistrationLinks start={[-0.42, -0.88, -0.06]} end={[-1.05, 0.14, 0.1]} color="#a7f3d0" />

      <RegistrationParticles success={triggerSuccess} />
      {triggerSuccess ? <SuccessPulse /> : null}
      <Environment preset="night" />
    </group>
  );
}

export default function RegisterHelix3D({ className = '', triggerSuccess = false }: { className?: string; triggerSuccess?: boolean }) {
  return (
    <div className={`relative w-full h-[26rem] md:h-[31rem] rounded-[1.75rem] overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.15),_transparent_60%),linear-gradient(180deg,#0a1410_0%,#060a08_100%)] shadow-2xl shadow-emerald-950/30 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
        <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-emerald-200/70">Workspace Creation</div>
            <div className="mt-0.5 text-sm font-semibold tracking-[0.24em] text-emerald-100">Standor Platform</div>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0.4, 5.5], fov: 42 }} dpr={[1, 1.5]} shadows>
        <color attach="background" args={['#060c09']} />
        <ambientLight intensity={0.38} />
        <pointLight position={[3, 5, 3]} intensity={1.45} color="#6ee7b7" />
        <pointLight position={[-3, -3, 2]} intensity={0.95} color="#10b981" />
        <pointLight position={[0, 0, 4]} intensity={0.65} color="#a7f3d0" />
        <directionalLight position={[-2, 4, 3]} intensity={0.75} color="#34d399" />

        <Suspense fallback={<Html center><span className="text-emerald-300 text-sm">Loading…</span></Html>}>
          <GLBLoaderWrapper modelPath="/models/register.glb">
            <RegisterScene triggerSuccess={triggerSuccess} />
          </GLBLoaderWrapper>
        </Suspense>
      </Canvas>
    </div>
  );
}
