"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Physics,
  RigidBody,
  useRapier,
} from "@react-three/rapier";

const mobileInput = {
  x: 0,
  y: 0,
  lookX: 0,
  lookY: 0,
};

function Character() {
  const body = useRef();
  const player = useRef();
  const { gl } = useThree();
  const { world, rapier } = useRapier();

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
        0.65
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

  useFrame(({ camera }) => {
    if (!body.current || !player.current) return;

    const yaw = cameraRotation.current.yaw;
    const pitch = cameraRotation.current.pitch;

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

    // PC
    if (keys.current.w) movement.add(forward);
    if (keys.current.s) movement.sub(forward);
    if (keys.current.d) movement.add(right);
    if (keys.current.a) movement.sub(right);

    // Móvil
    if (mobileInput.y !== 0) {
      movement.addScaledVector(forward, mobileInput.y);
    }

    if (mobileInput.x !== 0) {
      movement.addScaledVector(right, mobileInput.x);
    }

    // Cámara táctil
    cameraRotation.current.yaw -= mobileInput.lookX;
    cameraRotation.current.pitch += mobileInput.lookY;

    cameraRotation.current.pitch = THREE.MathUtils.clamp(
      cameraRotation.current.pitch,
      -0.15,
      0.65
    );

    mobileInput.lookX = 0;
    mobileInput.lookY = 0;

   const currentVelocity = body.current.linvel();

if (movement.lengthSq() > 0) {
  const inputStrength = Math.min(movement.length(), 1);

  movement.normalize();

  const minSpeed = 2;
  const maxSpeed = 10;

  const speed =
    minSpeed + (maxSpeed - minSpeed) * inputStrength;

      body.current.setLinvel(
        {
          x: movement.x * speed,
          y: currentVelocity.y,
          z: movement.z * speed,
        },
        true
      );

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
    } else {
      body.current.setLinvel(
        {
          x: 0,
          y: currentVelocity.y,
          z: 0,
        },
        true
      );
    }

    const position = body.current.translation();

    const distance = 5;
    const height = 1.5;

    const horizontalDistance =
      Math.cos(pitch) * distance;

    const verticalDistance =
      Math.sin(pitch) * distance;

    const cameraTarget = new THREE.Vector3(
      position.x,
      position.y + 1.2,
      position.z
    );

    const desiredCameraPosition = new THREE.Vector3(
      position.x + Math.sin(yaw) * horizontalDistance,
      position.y + height + verticalDistance,
      position.z + Math.cos(yaw) * horizontalDistance
    );

    const cameraDirection = desiredCameraPosition
      .clone()
      .sub(cameraTarget);

    const cameraDistance = cameraDirection.length();

    cameraDirection.normalize();

    const ray = new rapier.Ray(
      {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
      },
      {
        x: cameraDirection.x,
        y: cameraDirection.y,
        z: cameraDirection.z,
      }
    );

    const hit = world.castRay(
      ray,
      cameraDistance,
      true,
      undefined,
      undefined,
      undefined,
      body.current
    );

    let finalCameraPosition = desiredCameraPosition;

    if (hit) {
      const safeDistance = Math.max(
        hit.timeOfImpact - 0.25,
        0.6
      );

      finalCameraPosition = cameraTarget
        .clone()
        .add(
          cameraDirection
            .clone()
            .multiplyScalar(safeDistance)
        );
    }

    camera.position.lerp(
      finalCameraPosition,
      0.2
    );

    camera.lookAt(
      position.x,
      position.y + 1.2,
      position.z
    );
  });

  return (
    <RigidBody
      ref={body}
      position={[0, 0.95, 14]}
      colliders="cuboid"
      enabledRotations={[false, false, false]}
      friction={0}
    >
      <group ref={player} position={[0, -0.95, 0]}>

        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.7, 1.1, 0.4]} />
          <meshStandardMaterial color="#333333" />
        </mesh>

        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[0.38, 24, 24]} />
          <meshStandardMaterial color="#d8a47f" />
        </mesh>

        <mesh position={[-0.2, 0.45, 0]}>
          <boxGeometry args={[0.25, 0.9, 0.3]} />
          <meshStandardMaterial color="#222222" />
        </mesh>

        <mesh position={[0.2, 0.45, 0]}>
          <boxGeometry args={[0.25, 0.9, 0.3]} />
          <meshStandardMaterial color="#222222" />
        </mesh>

      </group>
    </RigidBody>
  );
}

function MobileControls() {
  const joystick = useRef();
  const knob = useRef();

  const joystickTouch = useRef(null);
  const lookTouch = useRef(null);

  const updateJoystick = (touch) => {
    if (!joystick.current || !knob.current) return;

    const rect = joystick.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    const maxDistance = rect.width * 0.34;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }

    knob.current.style.transform =
      `translate(${dx}px, ${dy}px)`;

    mobileInput.x = dx / maxDistance;
    mobileInput.y = -dy / maxDistance;
  };

  const resetJoystick = () => {
    mobileInput.x = 0;
    mobileInput.y = 0;

    if (knob.current) {
      knob.current.style.transform = "translate(0px, 0px)";
    }

    joystickTouch.current = null;
  };

  const handleTouchStart = (e) => {
    e.preventDefault();

    for (const touch of e.changedTouches) {
      if (touch.clientX < window.innerWidth * 0.45) {
        if (joystickTouch.current === null) {
          joystickTouch.current = touch.identifier;
          updateJoystick(touch);
        }
      } else {
        if (lookTouch.current === null) {
          lookTouch.current = {
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
          };
        }
      }
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();

    for (const touch of e.changedTouches) {
      if (touch.identifier === joystickTouch.current) {
        updateJoystick(touch);
      }

      if (
        lookTouch.current &&
        touch.identifier === lookTouch.current.id
      ) {
        const dx =
          touch.clientX - lookTouch.current.x;

        const dy =
          touch.clientY - lookTouch.current.y;

        mobileInput.lookX += dx * 0.004;
        mobileInput.lookY += dy * 0.003;

        lookTouch.current.x = touch.clientX;
        lookTouch.current.y = touch.clientY;
      }
    }
  };

  const handleTouchEnd = (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier === joystickTouch.current) {
        resetJoystick();
      }

      if (
        lookTouch.current &&
        touch.identifier === lookTouch.current.id
      ) {
        lookTouch.current = null;
      }
    }
  };

  return (
    <div
      className="mobile-controls"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        ref={joystick}
        className="mobile-joystick"
      >
        <div
          ref={knob}
          className="joystick-knob"
        />
      </div>

      <div className="mobile-look">
        Desliza para mirar
      </div>
    </div>
  );
}

function Room() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <>
        <ambientLight intensity={1.3} />

        <directionalLight
          position={[10, 14, 8]}
          intensity={2}
        />

        {/* SUELO */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[36, 0.2, 36]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* TECHO */}
        <mesh position={[0, 12, 0]}>
          <boxGeometry args={[36, 0.2, 36]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>

        {/* PARED ENTRADA IZQUIERDA */}
        <mesh position={[-11, 6, 18]}>
          <boxGeometry args={[14, 12, 0.3]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>

        {/* PARED ENTRADA DERECHA */}
        <mesh position={[11, 6, 18]}>
          <boxGeometry args={[14, 12, 0.3]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>

        {/* SOBRE ENTRADA */}
        <mesh position={[0, 9, 18]}>
          <boxGeometry args={[8, 6, 0.3]} />
          <meshStandardMaterial color="#dddddd" />
        </mesh>

        {/* PARED IZQUIERDA */}
        <mesh position={[-18, 6, 0]}>
          <boxGeometry args={[0.3, 12, 36]} />
          <meshStandardMaterial color="#d5d5d5" />
        </mesh>

        {/* PARED DERECHA */}
        <mesh position={[18, 6, 0]}>
          <boxGeometry args={[0.3, 12, 36]} />
          <meshStandardMaterial color="#d5d5d5" />
        </mesh>

        {/* FONDO IZQUIERDO */}
        <mesh position={[-11, 6, -18]}>
          <boxGeometry args={[14, 12, 0.3]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>

        {/* FONDO DERECHO */}
        <mesh position={[11, 6, -18]}>
          <boxGeometry args={[14, 12, 0.3]} />
          <meshStandardMaterial color="#cccccc" />
        </mesh>

        {/* SOBRE ACCESO DEL FONDO */}
        <mesh position={[0, 9, -18]}>
          <boxGeometry args={[8, 6, 0.3]} />
          <meshStandardMaterial color="#cccccc" />
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

      <Canvas
        camera={{
          position: [0, 3, 6],
          fov: 60,
        }}
      >
        <Physics gravity={[0, -9.81, 0]}>
          <Room />
          <Character />
        </Physics>
      </Canvas>

      <MobileControls />
    </main>
  );
}
