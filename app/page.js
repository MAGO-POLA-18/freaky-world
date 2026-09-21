"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function Character() {
  const player = useRef();
  const keys = useRef({ w: false, s: false, a: false, d: false });

  useEffect(() => {
    const down = (e) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.w = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.s = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.a = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.d = true;
    };

    const up = (e) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.w = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.s = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.a = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.d = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    if (!player.current) return;

    const direction = new THREE.Vector3();

    if (keys.current.w) direction.z -= 1;
    if (keys.current.s) direction.z += 1;
    if (keys.current.a) direction.x -= 1;
    if (keys.current.d) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();

      const speed = 3;

      player.current.position.x += direction.x * speed * delta;
      player.current.position.z += direction.z * speed * delta;

      player.current.position.x = THREE.MathUtils.clamp(
        player.current.position.x,
        -4.4,
        4.4
      );

      player.current.position.z = THREE.MathUtils.clamp(
        player.current.position.z,
        -4.4,
        4.4
      );

      player.current.rotation.y = Math.atan2(direction.x, direction.z);
    }

    // Cámara siguiendo al personaje
    const desiredCameraPosition = new THREE.Vector3(
      player.current.position.x,
      player.current.position.y + 3.2,
      player.current.position.z + 5
    );

    camera.position.lerp(desiredCameraPosition, 0.08);

    camera.lookAt(
      player.current.position.x,
      player.current.position.y + 1,
      player.current.position.z
    );
  });

  return (
    <group ref={player} position={[0, 0, 1]}>
      {/* Cuerpo */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.7, 1.1, 0.4]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Cabeza */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.38, 24, 24]} />
        <meshStandardMaterial color="#d8a47f" />
      </mesh>

      {/* Pierna izquierda */}
      <mesh position={[-0.2, 0.45, 0]}>
        <boxGeometry args={[0.25, 0.9, 0.3]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Pierna derecha */}
      <mesh position={[0.2, 0.45, 0]}>
        <boxGeometry args={[0.25, 0.9, 0.3]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  );
}

function Room() {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 8, 5]} intensity={2} />

      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#777777" />
      </mesh>

      <mesh position={[0, 2, -5]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      <mesh position={[-5, 2, 0]}>
        <boxGeometry args={[0.2, 4, 10]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      <mesh position={[5, 2, 0]}>
        <boxGeometry args={[0.2, 4, 10]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
    </>
  );
}

export default function Home() {
  return (
    <main>
      <div className="instructions">
        WASD para mover el personaje
      </div>

      <Canvas camera={{ position: [0, 3, 6], fov: 60 }}>
        <Room />
        <Character />
      </Canvas>
    </main>
  );
}
