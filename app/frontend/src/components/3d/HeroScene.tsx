import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function TorusRing({ count = 2500, torusR = 2.1, tubeR = 0.42, speed = 0.07, color = '#137fec' }) {
    const ref = useRef(null);
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI * 2;
            pos[i * 3] = (torusR + tubeR * Math.cos(v)) * Math.cos(u);
            pos[i * 3 + 1] = (torusR + tubeR * Math.cos(v)) * Math.sin(u);
            pos[i * 3 + 2] = tubeR * Math.sin(v);
        }
        return pos;
    }, [count, torusR, tubeR]);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        ref.current.rotation.x = t * speed * 0.7;
        ref.current.rotation.y = t * speed;
        ref.current.rotation.z = t * speed * 0.25;
    });
    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial transparent color={color} size={0.018} sizeAttenuation depthWrite={false} opacity={0.75} blending={THREE.AdditiveBlending} />
        </Points>
    );
}

function SessionNode({ radius, angle, speed, yOffset, color }) {
    const ref = useRef(null);
    const haloRef = useRef(null);
    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime() * speed + angle;
        const x = Math.cos(t) * radius;
        const z = Math.sin(t) * radius;
        const y = Math.sin(t * 1.3) * 0.35 + yOffset;
        ref.current.position.set(x, y, z);
        if (haloRef.current) {
            haloRef.current.position.set(x, y, z);
            const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2.5 + angle) * 0.3;
            haloRef.current.scale.setScalar(pulse);
        }
    });
    return (
        <>
            <mesh ref={ref}><sphereGeometry args={[0.05, 10, 10]} /><meshBasicMaterial color={color} transparent opacity={0.95} /></mesh>
            <mesh ref={haloRef}><sphereGeometry args={[0.09, 10, 10]} /><meshBasicMaterial color={color} transparent opacity={0.15} /></mesh>
        </>
    );
}

function HaloRing({ radius = 2.8, tilt = 0, opacity = 0.12, color = '#137fec', rotSpeed = 0.04 }) {
    const lineRef = useRef(null);
    const geo = useMemo(() => {
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        return new THREE.BufferGeometry().setFromPoints(pts);
    }, [radius]);
    useFrame((state) => { if (lineRef.current) lineRef.current.rotation.y = state.clock.getElapsedTime() * rotSpeed; });
    return (
        <group rotation={[tilt, 0, 0]}>
            <line ref={lineRef} geometry={geo}><lineBasicMaterial color={color} transparent opacity={opacity} /></line>
        </group>
    );
}

function Starfield({ count = 900 }) {
    const ref = useRef(null);
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
        }
        return pos;
    }, [count]);
    useFrame((state) => { if (ref.current) ref.current.rotation.y = state.clock.getElapsedTime() * 0.008; });
    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial transparent color="#ffffff" size={0.007} sizeAttenuation depthWrite={false} opacity={0.35} blending={THREE.AdditiveBlending} />
        </Points>
    );
}

const SESSION_NODES = [
    { radius: 1.15, angle: 0, speed: 0.36, yOffset: 0.10, color: '#137fec' },
    { radius: 1.55, angle: 2.1, speed: 0.27, yOffset: -0.10, color: '#af25f4' },
    { radius: 1.02, angle: 4.2, speed: 0.44, yOffset: 0.20, color: '#137fec' },
    { radius: 0.85, angle: 1.5, speed: 0.50, yOffset: -0.25, color: '#FFBD2E' },
    { radius: 1.30, angle: 3.5, speed: 0.39, yOffset: 0.00, color: '#af25f4' },
    { radius: 1.60, angle: 5.2, speed: 0.17, yOffset: 0.15, color: '#137fec' },
];

export default function HeroScene() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return null;
    return (
        <div className="w-full h-full absolute inset-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0.6, 5.8], fov: 55 }} dpr={[1, 1.5]}>
                {/* Main Particle System */}
                <group>
                    <TorusRing count={2400} torusR={2.1} tubeR={0.42} speed={0.07} color="#137fec" />
                    <TorusRing count={700} torusR={1.35} tubeR={0.18} speed={-0.04} color="#af25f4" />

                    <HaloRing radius={3.1} tilt={Math.PI / 8} opacity={0.07} color="#137fec" rotSpeed={0.03} />
                    <HaloRing radius={2.5} tilt={-Math.PI / 5} opacity={0.05} color="#af25f4" rotSpeed={-0.05} />
                </group>
                {SESSION_NODES.map((n, i) => <SessionNode key={i} {...n} />)}
            </Canvas>
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, #0B0B0D 72%)' }} />
        </div>
    );
}
