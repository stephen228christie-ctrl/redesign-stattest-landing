"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

/**
 * A bivariate-normal point cloud: every dot is a "participant".
 * Points sitting past ±1.96 SD on x are drawn in significance red —
 * the rejection region, the p < .05 of the brand.
 * The cloud tilts gently toward the pointer and breathes; a flat
 * sampling "floor" of faint points anchors it like a scatter plot.
 */

const COUNT = 2400;
const FLOOR = 700;

function gaussian() {
  // Box–Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function BellCloud({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const { positions, colors, phases } = useMemo(() => {
    const positions = new Float32Array((COUNT + FLOOR) * 3);
    const colors = new Float32Array((COUNT + FLOOR) * 3);
    const phases = new Float32Array(COUNT + FLOOR);

    const ink = new THREE.Color("#3550a8");
    const sig = new THREE.Color("#c32b3e");
    const faint = new THREE.Color("#9fb0bf");

    for (let i = 0; i < COUNT; i++) {
      const x = gaussian();
      const z = gaussian();
      // Height follows the bivariate normal density, with vertical jitter
      const density = Math.exp(-(x * x + z * z) / 2);
      const y = density * 2.6 * (0.55 + Math.random() * 0.45);

      positions[i * 3] = x * 1.15;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z * 1.15;
      phases[i] = Math.random() * Math.PI * 2;

      const inTail = Math.abs(x) > 1.96;
      const c = inTail ? sig : ink;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    // Faint sampling floor beneath the bell
    for (let i = COUNT; i < COUNT + FLOOR; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = -0.02;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
      phases[i] = 0;
      colors[i * 3] = faint.r;
      colors[i * 3 + 1] = faint.g;
      colors[i * 3 + 2] = faint.b;
    }

    return { positions, colors, phases };
  }, []);

  const basePositions = useMemo(() => positions.slice(), [positions]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;

    if (!reduced) {
      // Slow idle spin + tilt toward the pointer
      group.current.rotation.y = t * 0.08 + pointer.x * 0.35;
      group.current.rotation.x =
        THREE.MathUtils.lerp(group.current.rotation.x, 0.32 - pointer.y * 0.18, 0.05);

      // Gentle vertical breathing per point
      const geo = points.current?.geometry;
      if (geo) {
        const pos = geo.attributes.position.array as Float32Array;
        for (let i = 0; i < COUNT; i++) {
          pos[i * 3 + 1] =
            basePositions[i * 3 + 1] + Math.sin(t * 0.9 + phases[i]) * 0.035;
        }
        geo.attributes.position.needsUpdate = true;
      }
    } else {
      group.current.rotation.y = 0.6;
      group.current.rotation.x = 0.32;
    }
  });

  return (
    <group ref={group} position={[0, -0.85, 0]}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </points>
      {/* x-axis line with σ ticks */}
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry args={[6.4, 0.012, 0.012]} />
        <meshBasicMaterial color="#4a5b6d" />
      </mesh>
      {[-1.96 * 1.15, 1.96 * 1.15].map((x) => (
        <mesh key={x} position={[x, 0.05, 0]}>
          <boxGeometry args={[0.012, 0.18, 0.012]} />
          <meshBasicMaterial color="#c32b3e" />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroVisual() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return (
    <div
      className="h-full w-full"
      aria-label="An animated three-dimensional bell curve made of individual data points, with the rejection regions beyond ±1.96 standard deviations highlighted in red"
      role="img"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.1, 5.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <BellCloud reduced={reduced} />
      </Canvas>
    </div>
  );
}
