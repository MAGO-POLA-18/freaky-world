"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function Home() {
  return (
    <main>
      <Canvas camera={{ position: [8, 6, 8], fov: 50 }}>
        {/* Luz ambiental */}
        <ambientLight intensity={1.5} />

        {/* Luz principal */}
        <directionalLight position={[5, 8, 5]} intensity={2} />

        {/* Suelo */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[10, 0.2, 10]} />
          <meshStandardMaterial color="#777777" />
        </mesh>

        {/* Pared trasera */}
        <mesh position={[0, 2, -5]}>
          <boxGeometry args={[10, 4, 0.2]} />
          <meshStandardMaterial color="#eeeeee" />
        </mesh>

        {/* Pared izquierda */}
        <mesh position={[-5, 2, 0]}>
          <boxGeometry args={[0.2, 4, 10]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>

        {/* Pared derecha */}
        <mesh position={[5, 2, 0]}>
          <boxGeometry args={[0.2, 4, 10]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>

        <OrbitControls />
      </Canvas>
    </main>
  );
}
