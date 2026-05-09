import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ────────────────────────────────────────────
   Flow Particles — DNA Double Helix (Refined)
   Engineered spline paths, depth layering,
   packet pulses, depth fog, camera drift.
   Tuned for restraint & premium feel.
   ──────────────────────────────────────────── */

/* ── Config (refined) ──────────────────── */
const PARTICLES_PER_STRAND = 1250;  // ← ~15% reduced from 1500
const TOTAL = PARTICLES_PER_STRAND * 2;
const PACKET_COUNT = 4;              // fewer, more impactful
const X_SPAN = 55;
const WRAP = Math.PI * 10;
const HELIX_RADIUS = 2.5;
const HELIX_FREQ = 0.55;
const MOTION_SCALE = 0.9;            // ← 10% slower globally
const PARALLAX_SCALE = 0.85;         // ← 15% reduced parallax

/* ── Palettes (desaturated ~10-15%) ───── */
const PAL_A = ['#5B2D8A', '#6A3EBD', '#7B56C6', '#3B78D6', '#1A7AE0'].map(c => new THREE.Color(c));
const PAL_B = ['#1A9EB8', '#1EA898', '#1A8EC6', '#2AC0D0', '#1A7AE0'].map(c => new THREE.Color(c));
const HIGHLIGHT = new THREE.Color('#D8DFEF'); // slightly toned down

/* ── Helix wave functions (slowed) ───── */
function helixY(x: number, t: number, strand: number) {
    const s = strand === 0 ? 1 : -1;
    const st = t * MOTION_SCALE;
    return (
        s * Math.sin(x * HELIX_FREQ + st * 0.2) * HELIX_RADIUS +
        Math.sin(x * 0.15 + st * 0.1) * 0.3 +
        Math.sin(x * 0.25 + st * 0.15) * 0.5
    );
}
function helixZ(x: number, t: number, strand: number) {
    const s = strand === 0 ? 1 : -1;
    const st = t * MOTION_SCALE;
    return (
        s * Math.cos(x * HELIX_FREQ + st * 0.2) * (HELIX_RADIUS * 0.6) +
        Math.cos(x * 0.2 + st * 0.12) * 0.3
    );
}

/* ── Velocity profile ──────────────────── */
function velocityAt(normX: number): number {
    const c = (normX - 0.5) * 2;
    return 0.7 + 0.3 * (1 - c * c);
}

/* ── Depth fog: far Z fades out ────────── */
function depthFog(z: number): number {
    // z ranges roughly -7..+2; far back → stronger fade
    const normalized = (z + 7) / 9;
    return 0.2 + Math.max(0, Math.min(1, normalized)) * 0.8;
}

/* ── Particle type ─────────────────────── */
type Particle = {
    strand: 0 | 1;
    layer: 0 | 1 | 2;
    phase: number;
    offsetY: number;
    offsetZ: number;
    baseSpeed: number;
    color: THREE.Color;
    size: number;
};

type PacketPulse = {
    strand: 0 | 1;
    phase: number;
    speed: number;
    life: number;
    active: boolean;
    nextSpawn: number;
};

function createParticle(strand: 0 | 1): Particle {
    const pal = strand === 0 ? PAL_A : PAL_B;
    const color = pal[Math.floor(Math.random() * pal.length)].clone();
    if (Math.random() < 0.05) color.copy(HIGHLIGHT);

    const lane = Math.floor(Math.random() * 3);
    const laneOffsetY = (lane - 1) * 0.35;
    const laneOffsetZ = (lane - 1) * 0.2;

    const r = Math.random();
    // Reduce bg layer: 25% bg, 40% mid, 35% fg
    const layer: 0 | 1 | 2 = r < 0.25 ? 0 : r < 0.65 ? 1 : 2;

    const layerOpacity = [0.3, 0.65, 0.95][layer];
    const layerSizeMult = [0.45, 0.9, 1.37][layer]; // fg +5%, bg -10%

    return {
        strand,
        layer,
        phase: Math.random() * WRAP,
        offsetY: laneOffsetY + (Math.random() - 0.5) * 0.25,
        offsetZ: laneOffsetZ + (Math.random() - 0.5) * 0.15 + [-3, 0, 2][layer],
        baseSpeed: (0.08 + Math.random() * 0.15) * layerOpacity * MOTION_SCALE,
        color: color.multiplyScalar(layerOpacity + 0.5),
        size: (0.016 + Math.random() * 0.032) * layerSizeMult,
    };
}

/* ── Slow camera drift component ───────── */
function CameraDrift() {
    const { camera } = useThree();
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        // ±0.2° drift over ~30s cycle
        camera.rotation.y = Math.sin(t * 0.033) * 0.0035;
        camera.rotation.x = Math.cos(t * 0.025) * 0.002;
    });
    return null;
}

/* ── Scene ──────────────────────────────── */
function DNAScene() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const packetRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const mouseRef = useRef({ x: 0, y: 0 });

    const particles = useMemo<Particle[]>(() => {
        const arr: Particle[] = [];
        for (let i = 0; i < PARTICLES_PER_STRAND; i++) arr.push(createParticle(0));
        for (let i = 0; i < PARTICLES_PER_STRAND; i++) arr.push(createParticle(1));
        return arr;
    }, []);

    // Packet pulses — longer spawn interval (15-20s feel)
    const packets = useMemo<PacketPulse[]>(() =>
        Array.from({ length: PACKET_COUNT * 2 }, (_, i) => ({
            strand: (i < PACKET_COUNT ? 0 : 1) as 0 | 1,
            phase: 0,
            speed: 0.35 + Math.random() * 0.2,  // slower packets
            life: 0,
            active: false,
            nextSpawn: 8 + Math.random() * 12,  // 8-20s spawn interval
        })),
        []
    );

    const colorSetup = useRef(false);
    const colorArray = useMemo(() => {
        const a = new Float32Array(TOTAL * 3);
        particles.forEach((p, i) => {
            a[i * 3] = p.color.r;
            a[i * 3 + 1] = p.color.g;
            a[i * 3 + 2] = p.color.b;
        });
        return a;
    }, [particles]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', handler, { passive: true });
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const t = clock.getElapsedTime();
        const dt = 0.016;

        if (!colorSetup.current) {
            meshRef.current.geometry.setAttribute(
                'color',
                new THREE.InstancedBufferAttribute(colorArray, 3)
            );
            colorSetup.current = true;
        }

        // Mouse parallax (reduced amplitude)
        const mx = mouseRef.current.x * 1.2 * PARALLAX_SCALE;
        const my = mouseRef.current.y * 0.4 * PARALLAX_SCALE;

        // ── Update particles ──
        for (let i = 0; i < TOTAL; i++) {
            const p = particles[i];

            const rawX = p.phase % WRAP;
            const normX = rawX / WRAP;
            const velMult = velocityAt(normX);
            p.phase += p.baseSpeed * velMult * dt * 60;

            const wrappedX = p.phase % WRAP;
            const x = (wrappedX / WRAP) * X_SPAN - X_SPAN / 2;

            const cy = helixY(wrappedX, t, p.strand);
            const cz = helixZ(wrappedX, t, p.strand);

            const parallaxMult = [0.25, 0.5, 0.85][p.layer]; // reduced from [0.3, 0.6, 1.0]

            const finalZ = cz + p.offsetZ - 4;

            dummy.position.set(
                x + mx * parallaxMult * 0.4,
                cy + p.offsetY + my * parallaxMult * 0.25,
                finalZ
            );

            // Size: crossover pulse + depth fog
            const crossover = Math.abs(Math.sin(wrappedX * HELIX_FREQ + t * MOTION_SCALE * 0.2));
            const fog = depthFog(finalZ);
            dummy.scale.setScalar(p.size * (1 + (1 - crossover) * 0.25) * fog);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;

        // ── Update packet pulses ──
        if (packetRef.current) {
            for (let i = 0; i < packets.length; i++) {
                const pk = packets[i];
                if (!pk.active) {
                    pk.nextSpawn -= dt;
                    if (pk.nextSpawn <= 0) {
                        pk.active = true;
                        pk.phase = 0;
                        pk.life = 1;
                        pk.speed = 0.3 + Math.random() * 0.2;
                    }
                    dummy.position.set(0, -100, 0);
                    dummy.scale.setScalar(0);
                } else {
                    pk.phase += pk.speed * dt * 60 * MOTION_SCALE;
                    pk.life -= dt * 0.12;  // slower fade

                    if (pk.life <= 0 || pk.phase > WRAP) {
                        pk.active = false;
                        pk.nextSpawn = 10 + Math.random() * 10; // 10-20s respawn
                        dummy.position.set(0, -100, 0);
                        dummy.scale.setScalar(0);
                    } else {
                        const wrappedX = pk.phase % WRAP;
                        const x = (wrappedX / WRAP) * X_SPAN - X_SPAN / 2;
                        const cy = helixY(wrappedX, t, pk.strand);
                        const cz = helixZ(wrappedX, t, pk.strand);

                        dummy.position.set(
                            x + mx * 0.4,
                            cy + my * 0.25,
                            cz - 2
                        );
                        const pulse = 0.07 + Math.sin(t * 6) * 0.015;
                        dummy.scale.setScalar(pulse * pk.life);
                    }
                }
                dummy.updateMatrix();
                packetRef.current.setMatrixAt(i, dummy.matrix);
            }
            packetRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    // Materials — desaturated base color
    const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
    const particleMat = useMemo(() =>
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.85,  // doubled from 0.45
            color: new THREE.Color('#A0B4FF'), // brighter
            toneMapped: false,
        }), []);
    const packetGeo = useMemo(() => new THREE.SphereGeometry(1, 8, 8), []);
    const packetMat = useMemo(() =>
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.85,
            color: new THREE.Color('#E8EEFF'), // slightly warm white
            toneMapped: false,
        }), []);

    return (
        <>
            <instancedMesh ref={meshRef} args={[sphereGeo, particleMat, TOTAL]} />
            <instancedMesh ref={packetRef} args={[packetGeo, packetMat, packets.length]} />
        </>
    );
}

/* ── Error Boundary ────────────────────── */
class WebGLErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error) {
        console.warn('[FlowParticles] WebGL error caught, hiding 3D layer:', error.message);
    }
    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

/* ── Export ─────────────────────────────── */
export type FlowParticlesProps = { className?: string };

export default function FlowParticles({ className }: FlowParticlesProps) {
    return (
        <WebGLErrorBoundary>
            <div
                className={className}
                aria-hidden="true"
                style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}
            >
                <Canvas
                    camera={{ fov: 50, position: [0, 0, 20] }}
                    gl={{
                        antialias: false,
                        alpha: true,
                        powerPreference: 'high-performance',
                        failIfMajorPerformanceCaveat: false,
                    }}
                    dpr={[1, 1.5]}
                    style={{ width: '100%', height: '100%' }}
                >
                    <CameraDrift />
                    <DNAScene />
                </Canvas>
            </div>
        </WebGLErrorBoundary>
    );
}

