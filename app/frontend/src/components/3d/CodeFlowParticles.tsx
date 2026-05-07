import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleMovement {
  position: [number, number, number];
  targetPosition: [number, number, number];
  speed: number;
}

interface ParticleProps extends ParticleMovement {
  progress: number;
}

const Particle = ({ position, targetPosition, speed, progress }: ParticleProps) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    
    // Lerp between positions
    ref.current.position.x = THREE.MathUtils.lerp(
      position[0],
      targetPosition[0],
      (progress * speed) % 1
    );
    ref.current.position.y = THREE.MathUtils.lerp(
      position[1],
      targetPosition[1],
      (progress * speed) % 1
    );
    ref.current.position.z = THREE.MathUtils.lerp(
      position[2],
      targetPosition[2],
      (progress * speed) % 1
    );
  });

  return (
    <Sphere ref={ref} args={[2, 8, 8]}>
      <meshStandardMaterial
        emissive={0x00d9ff}
        emissiveIntensity={0.5}
        color={0x00d9ff}
      />
    </Sphere>
  );
};

const NodeSphere = ({ position, intensity }: { position: [number, number, number]; intensity: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.3;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <Sphere ref={ref} position={position} args={[8, 32, 32]}>
      <meshStandardMaterial
        emissive={0x00d9ff}
        emissiveIntensity={intensity}
        wireframe={false}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
};

const CodeFlowParticles = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Three orbiting nodes
  const nodePositions: [number, number, number][] = [
    [60, 0, 0],
    [-30, 52, 0],
    [-30, -52, 0],
  ];

  const particles = Array.from({ length: 60 }).map((_, i) => {
    const startNode = nodePositions[i % 3];
    const endNode = nodePositions[(i + 1) % 3];
    return {
      position: startNode,
      targetPosition: endNode,
      speed: 0.5 + (i % 3) * 0.1,
    };
  });

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 150], fov: 50 }}>
        <color attach="background" args={['#0a0e27']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[100, 100, 100]} intensity={0.8} />

        {/* Orbiting nodes */}
        {nodePositions.map((pos, i) => (
          <group key={`node-${i}`}>
            <NodeSphere position={pos} intensity={0.6} />
            {/* Orbit lines */}
            <OrbitLine nodeIndex={i} />
          </group>
        ))}

        {/* Particles flowing between nodes */}
        <ParticleFlow particles={particles} />

        {/* Connecting lines */}
        <ConnectionLines nodePositions={nodePositions} />
      </Canvas>
    </div>
  );
};

const ParticleFlow = ({ particles }: { particles: ParticleMovement[] }) => {
  const progress = useRef(0);

  useFrame(() => {
    progress.current += 0.003;
  });

  return (
    <group>
      {particles.map((particle, i) => (
        <Particle
          key={`particle-${i}`}
          {...particle}
          progress={progress.current + i * 0.01}
        />
      ))}
    </group>
  );
};

const OrbitLine = ({ nodeIndex }: { nodeIndex: number }) => {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.elapsedTime * 0.2;
  });

  const radius = 80;
  const points: [number, number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(
      [
        Math.cos(angle + (nodeIndex * Math.PI * 2) / 3) * radius,
        Math.sin(angle + (nodeIndex * Math.PI * 2) / 3) * radius,
        0
      ]
    );
  }

  return (
    <group ref={ref}>
      <Line points={points} color="#00d9ff" lineWidth={1} transparent opacity={0.2} />
    </group>
  );
};

const ConnectionLines = ({ nodePositions }: { nodePositions: [number, number, number][] }) => {
  return (
    <group>
      {nodePositions.map((pos, i) => {
        const nextPos = nodePositions[(i + 1) % 3];
        return (
          <Line key={`line-${i}`} points={[pos, nextPos]} color="#00d9ff" lineWidth={1} transparent opacity={0.3} />
        );
      })}
    </group>
  );
};

export default CodeFlowParticles;
