"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Physics, RigidBody } from "@react-three/rapier";

function Character() {
  const player = useRef();
  const { gl } = useThree();

  const keys = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
  });

  const cameraRotation = useRef({
    yaw: 0,
    pitch: 0.35,
  });

  const dragging = useRef(false);

  useEffect(() => {
    const keyDown = (e) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.w = true;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.s = true;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.a = true;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.d = true;
    };

    const keyUp = (e) => {
      if (e.code === "KeyW" || e.code === "ArrowUp") keys.current.w = false;
      if (e.code === "KeyS" || e.code === "ArrowDown") keys.current.s = false;
      if (e.code === "KeyA" || e.code === "ArrowLeft") keys.current.a = false;
      if (e.code === "KeyD" || e.code === "ArrowRight") keys.current.d = false;
    };

    const mouseDown = (e) => {
      if (e.button === 0) dragging.current = true;
    };

    const mouseUp = () => {
      dragging.current = false;
    };

    const mouseMove = (e) => {
      if (!dragging.current) return;

      cameraRotation.current.yaw -= e.movementX * 0.006;
      cameraRotation.current.pitch += e.movementY * 0.004;

      cameraRotation.current.pitch = THREE.MathUtils.clamp(
        cameraRotation.current.pitch,
        -0.15,
        0.9
      );
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    gl.domElement.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      gl.domElement.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mouseup", mouseUp);
      window.removeEventListener("mousemove", mouseMove);
    };
  }, [gl]);

  useFrame(({ camera }, delta) => {
    if (!player.current) return;

    const yaw = cameraRotation.current.yaw;
    const pitch = cameraRotation.current.pitch;

    // Dirección frontal según la cámara
    const forward = new THREE.Vector3(
      -Math.sin(yaw),
      0,
      -Math.cos(yaw)
    );

    const right = new THREE.Vector3(
      Math.cos(yaw),
      0,
      -Math.sin(yaw)
    );

    const movement = new THREE.Vector3();

    if (keys.current.w) movement.add(forward);
    if (keys.current.s) movement.sub(forward);
    if (keys.current.d) movement.add(right);
    if (keys.current.a) movement.sub(right);

    if (movement.lengthSq() > 0) {
      movement.normalize();

      const speed = 3;

      player.current.position.addScaledVector(
        movement,
        speed * delta
      );

      // Límites provisionales de la habitación
      player.current.position.x = THREE.MathUtils.clamp(
        player.current.position.x,
        -4.4,
        4.4
      );

      player.current.position.z = THREE.MathUtils.clamp(
        player.current.position.z,
        -18.4,
        4.4
      );

      // El personaje mira hacia donde camina
      const targetRotation = Math.atan2(
        movement.x,
        movement.z
      );

      let difference =
        targetRotation - player.current.rotation.y;

      difference = Math.atan2(
        Math.sin(difference),
        Math.cos(difference)
      );

      player.current.rotation.y += difference * 0.15;
    }

    // Cámara orbital alrededor del personaje
    const distance = 5;
    const height = 1.5;

    const horizontalDistance =
      Math.cos(pitch) * distance;

    const verticalDistance =
      Math.sin(pitch) * distance;

    const desiredCameraPosition = new THREE.Vector3(
      player.current.position.x +
        Math.sin(yaw) * horizontalDistance,
      player.current.position.y +
        height +
        verticalDistance,
      player.current.position.z +
        Math.cos(yaw) * horizontalDistance
    );

    camera.position.lerp(
      desiredCameraPosition,
      0.12
    );

    camera.lookAt(
      player.current.position.x,
      player.current.position.y + 1.2,
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
     <RigidBody type="fixed" colliders="cuboid">
    <>
      <ambientLight intensity={1.5} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2}
      />

      {/* ===== SALA 1 ===== */}

      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#777777" />
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

      {/* Pared trasera con hueco para puerta */}
      <mesh position={[-3.5, 2, -5]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      <mesh position={[3.5, 2, -5]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      <mesh position={[0, 3.5, -5]}>
        <boxGeometry args={[4, 1, 0.2]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      {/* ===== PASILLO ===== */}

      <mesh position={[0, -0.1, -7]}>
        <boxGeometry args={[4, 0.2, 4]} />
        <meshStandardMaterial color="#666666" />
      </mesh>

      <mesh position={[-2, 2, -7]}>
        <boxGeometry args={[0.2, 4, 4]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      <mesh position={[2, 2, -7]}>
        <boxGeometry args={[0.2, 4, 4]} />
        <meshStandardMaterial color="#cccccc" />
      </mesh>

      {/* ===== SALA 2 ===== */}

      <mesh position={[0, -0.1, -14]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      <mesh position={[-5, 2, -14]}>
        <boxGeometry args={[0.2, 4, 10]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>

      <mesh position={[5, 2, -14]}>
        <boxGeometry args={[0.2, 4, 10]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>

      <mesh position={[0, 2, -19]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>
              {/* ===== CIERRE DEL EDIFICIO ===== */}

      {/* Techo sala 1 */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#e5e5e5" />
      </mesh>

      {/* Techo pasillo */}
      <mesh position={[0, 4, -7]}>
        <boxGeometry args={[4, 0.2, 4]} />
        <meshStandardMaterial color="#d8d8d8" />
      </mesh>

      {/* Techo sala 2 */}
      <mesh position={[0, 4, -14]}>
        <boxGeometry args={[10, 0.2, 10]} />
        <meshStandardMaterial color="#d0d0d0" />
      </mesh>

      {/* Pared frontal sala 1 */}
      <mesh position={[0, 2, 5]}>
        <boxGeometry args={[10, 4, 0.2]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      {/* Frente sala 2 - lado izquierdo de entrada */}
      <mesh position={[-3.5, 2, -9]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>

      {/* Frente sala 2 - lado derecho de entrada */}
      <mesh position={[3.5, 2, -9]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>

      {/* Parte superior de entrada sala 2 */}
      <mesh position={[0, 3.5, -9]}>
        <boxGeometry args={[4, 1, 0.2]} />
        <meshStandardMaterial color="#bbbbbb" />
      </mesh>
    </>
    </RigidBody>
  );
}

export default function Home() {
  return (
    <main>
      <div className="instructions">
        WASD para caminar · Mantén clic izquierdo y arrastra para mover la cámara
      </div>

      <Canvas camera={{ position: [0, 3, 6], fov: 60 }}>
       <Physics gravity={[0, -9.81, 0]}>
  <Room />
  <Character />
      </Canvas>
    </main>
  );
}
