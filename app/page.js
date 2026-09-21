"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";

function Player() {
  const { camera } = useThree();

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    camera.position.set(0, 1.7, 3);

    const keyDown = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;
      }
    };

    const keyUp = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [camera]);

  useFrame((_, delta) => {
    const speed = 3;
    const direction = new THREE.Vector3();

    if (keys.current.forward) direction.z -= 1;
    if (keys.current.backward) direction.z += 1;
    if (keys.current.left) direction.x -= 1;
    if (keys.current.right) direction.x += 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();

      direction.applyQuaternion(camera.quaternion);
      direction.y = 0;
      direction.normalize();

      const nextPosition = camera.position
        .clone()
        .addScaledVector(direction, speed * delta);

      // Límites provisionales de nuestra habitación
      nextPosition.x = THREE.MathUtils.clamp(nextPosition.x, -4.6, 4.6);
      nextPosition.z = THREE.MathUtils.clamp(nextPosition.z, -4.6, 4.6);
      nextPosition.y = 1.7;

      camera.position.copy(nextPosition);
    }
  });

  return null;
}

function Room() {
  return (
    <>
      <ambientLight intensity={1.5} />
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

      {/* Pared frontal */}
      <mesh position={[0, 2, 5]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>
    </>
  );
}

export default function Home() {
  return (
    <main>
      <div className="instructions">
        Haz clic para entrar · WASD para caminar · Ratón para mirar
      </div>

      <Canvas camera={{ position: [0, 1.7, 3], fov: 70 }}>
        <Room />
        <Player />
        <PointerLockControls />
      </Canvas>
    </main>
  );
}
