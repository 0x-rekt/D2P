"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh } from "three";

const RotatingCube = () => {
  const mesh = useRef<Mesh>(null);

  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.001;
      mesh.current.rotation.y += 0.002;
      mesh.current.rotation.z += 0.001;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, 0]} scale={1.2}>
      <boxGeometry args={[2, 2, 2]} />
      <meshPhongMaterial
        color="#3b82f6"
        emissive="#1e40af"
        emissiveIntensity={0.3}
        shininess={100}
        wireframe={true}
        wireframeLinewidth={2}
      />
    </mesh>
  );
};

const FloatingOrb = ({ position, color, scale }: any) => {
  const mesh = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y += Math.sin(clock.elapsedTime * 0.5) * 0.005;
      mesh.current.rotation.x += 0.001;
      mesh.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh ref={mesh} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        shininess={100}
      />
    </mesh>
  );
};

export default function ThreeDBackground() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#60a5fa" />
        <pointLight
          position={[-10, -10, -10]}
          intensity={0.4}
          color="#a855f7"
        />

        <RotatingCube />
        <FloatingOrb position={[3, 2, -2]} color="#3b82f6" scale={0.6} />
        <FloatingOrb position={[-3, -2, -2]} color="#a855f7" scale={0.5} />
        <FloatingOrb position={[0, 3, -3]} color="#06b6d4" scale={0.4} />
      </Canvas>
    </div>
  );
}
