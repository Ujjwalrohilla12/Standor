import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Html, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Tone = "login" | "register" | "about";

function palette(tone: Tone) {
  switch (tone) {
    case "about":
      return {
        bg: ["#080704", "#12100a"] as const,
        glow: "rgba(245,158,11,0.12)",
        accent: "#fbbf24",
        emissive: "#f59e0b",
        labelTop: "Collaborative",
      };
    case "register":
      return {
        bg: ["#070810", "#14161a"] as const,
        glow: "rgba(34,197,94,0.12)",
        accent: "#34d399",
        emissive: "#22c55e",
        labelTop: "Create",
      };
    case "login":
    default:
      return {
        bg: ["#08091a", "#0d0f1a"] as const,
        glow: "rgba(79,70,229,0.16)",
        accent: "#a5b4fc",
        emissive: "#6366f1",
        labelTop: "Secure",
      };
  }
}

function BoxyHumanoid({ tone }: { tone: Tone }) {
  const rootRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const { accent, emissive } = palette(tone);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const walk = Math.sin(t * 2.2);
    const sway = Math.sin(t * 0.9);

    if (rootRef.current) {
      rootRef.current.rotation.y = Math.sin(t * 0.45) * 0.22;
      rootRef.current.position.y = 0.1 + Math.abs(Math.sin(t * 1.1)) * 0.08;
      rootRef.current.position.x = Math.sin(t * 0.55) * 0.05;
    }

    if (torsoRef.current) {
      torsoRef.current.rotation.z = sway * 0.06;
      torsoRef.current.rotation.x = Math.sin(t * 0.7) * 0.04;
    }

    const armSwing = walk * 0.55;
    const legSwing = -walk * 0.65;

    if (leftArmRef.current) leftArmRef.current.rotation.x = armSwing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -armSwing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;

    if (headRef.current) headRef.current.rotation.y = Math.sin(t * 0.6) * 0.12;
  });

  return (
    <group ref={rootRef} position={[0, -0.55, 0]}>
      <group ref={torsoRef}>
        {/* Torso */}
        <RoundedBox args={[1.1, 1.35, 0.55]} radius={0.12} smoothness={4}>
          <meshStandardMaterial color="#0b1020" roughness={0.45} metalness={0.6} />
        </RoundedBox>

        {/* Chest plate */}
        <mesh position={[0, 0.15, 0.3]}>
          <boxGeometry args={[0.72, 0.42, 0.06]} />
          <meshStandardMaterial color={accent} emissive={emissive} emissiveIntensity={0.55} roughness={0.3} metalness={0.15} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.78, 0.02]}>
          <boxGeometry args={[0.25, 0.16, 0.25]} />
          <meshStandardMaterial color="#0b1020" roughness={0.5} metalness={0.55} />
        </mesh>

        {/* Head (no face/eyes — plain block) */}
        <mesh ref={headRef} position={[0, 1.15, 0.02]}>
          <boxGeometry args={[0.62, 0.62, 0.62]} />
          <meshStandardMaterial color="#0a0f1b" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Arms (hinged groups for swing) */}
        <group ref={leftArmRef} position={[-0.72, 0.42, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.28, 0.9, 0.28]} />
            <meshStandardMaterial color="#0b1020" roughness={0.5} metalness={0.55} />
          </mesh>
          <mesh position={[0, -0.88, 0.06]}>
            <boxGeometry args={[0.3, 0.22, 0.36]} />
            <meshStandardMaterial color={accent} emissive={emissive} emissiveIntensity={0.35} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.72, 0.42, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.28, 0.9, 0.28]} />
            <meshStandardMaterial color="#0b1020" roughness={0.5} metalness={0.55} />
          </mesh>
          <mesh position={[0, -0.88, 0.06]}>
            <boxGeometry args={[0.3, 0.22, 0.36]} />
            <meshStandardMaterial color={accent} emissive={emissive} emissiveIntensity={0.35} />
          </mesh>
        </group>

        {/* Hips */}
        <mesh position={[0, -0.68, 0]}>
          <boxGeometry args={[0.78, 0.35, 0.5]} />
          <meshStandardMaterial color="#0b1020" roughness={0.55} metalness={0.55} />
        </mesh>

        {/* Legs (hinged groups for walk cycle) */}
        <group ref={leftLegRef} position={[-0.25, -0.86, 0]}>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[0.3, 1.0, 0.32]} />
            <meshStandardMaterial color="#0b1020" roughness={0.55} metalness={0.5} />
          </mesh>
          <mesh position={[0, -1.05, 0.12]}>
            <boxGeometry args={[0.42, 0.18, 0.7]} />
            <meshStandardMaterial color="#0a0f1b" roughness={0.6} metalness={0.35} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.25, -0.86, 0]}>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[0.3, 1.0, 0.32]} />
            <meshStandardMaterial color="#0b1020" roughness={0.55} metalness={0.5} />
          </mesh>
          <mesh position={[0, -1.05, 0.12]}>
            <boxGeometry args={[0.42, 0.18, 0.7]} />
            <meshStandardMaterial color="#0a0f1b" roughness={0.6} metalness={0.35} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function FloorRings({ tone }: { tone: Tone }) {
  const groupRef = useRef<THREE.Group>(null);
  const { accent } = palette(tone);

  const rings = useMemo(
    () => [
      { r: 1.5, s: 0.02, o: 0.22, speed: 0.22 },
      { r: 2.2, s: 0.015, o: 0.15, speed: -0.14 },
      { r: 3.0, s: 0.012, o: 0.1, speed: 0.08 },
    ],
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y = t * 0.12;
  });

  return (
    <group ref={groupRef} position={[0, -2.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      {rings.map((ring, idx) => (
        <mesh key={idx} rotation={[0, 0, idx * 0.8]}>
          <torusGeometry args={[ring.r, ring.s, 14, 140]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.28} transparent opacity={ring.o} />
        </mesh>
      ))}
    </group>
  );
}

export default function BoxyHumanoid3D({
  className = "",
  tone = "login",
}: {
  className?: string;
  tone?: Tone;
}) {
  const p = palette(tone);

  return (
    <div
      className={`relative w-full h-[26rem] md:h-[31rem] rounded-[1.75rem] overflow-hidden border border-white/10 shadow-2xl ${className}`}
      style={{
        backgroundImage: `radial-gradient(ellipse at center, ${p.glow}, transparent 58%), linear-gradient(180deg, ${p.bg[1]} 0%, ${p.bg[0]} 100%)`,
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center px-4">
        <div className="rounded-full border border-white/10 bg-black/35 px-4 py-2 backdrop-blur-md shadow-lg shadow-black/20">
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/60">{p.labelTop}</div>
            <div className="mt-0.5 text-sm font-semibold tracking-[0.24em] text-white/80">Standor</div>
          </div>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0.45, 6.2], fov: 38 }} dpr={[1, 1.5]} shadows>
        <color attach="background" args={[p.bg[0]]} />
        <ambientLight intensity={0.42} />
        <directionalLight position={[4, 6, 3]} intensity={1.15} color="#e5e7eb" castShadow />
        <pointLight position={[-4, 0.5, 3]} intensity={0.9} color={p.accent} />
        <pointLight position={[0, -3.5, -1]} intensity={0.55} color={p.emissive} />

        <Suspense fallback={<Html center><span className="text-sm text-white/60">Loading…</span></Html>}>
          <Float speed={0.7} rotationIntensity={0.08} floatIntensity={0.18}>
            <BoxyHumanoid tone={tone} />
          </Float>
          <FloorRings tone={tone} />
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
