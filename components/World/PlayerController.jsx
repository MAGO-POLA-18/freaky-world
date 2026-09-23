"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CapsuleCollider,
} from "@react-three/rapier";
import * as THREE from "three";

/* =========================================================
   INPUT GLOBAL
========================================================= */

export const playerInput = {
  x: 0,
  y: 0,

  lookX: 0,
  lookY: 0,

  sprint: false,
};

/* =========================================================
   RUNTIME GLOBAL
========================================================= */

export const playerRuntime = {
  body: null,

  yaw: 0,
  pitch: 0.35,

  spawn: new THREE.Vector3(
    0,
    1.05,
    14
  ),
};

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const WALK_SPEED = 5.2;
const SPRINT_SPEED = 12.5;

const FALL_LIMIT = -8;

const COLLIDER_HALF_HEIGHT = 0.7;
const COLLIDER_RADIUS = 0.35;

/* =========================================================
   PLAYER
========================================================= */

export default function PlayerController() {
  const body = useRef(null);
  const visual = useRef(null);

  const hasSpawned = useRef(false);

  const keys = useRef({
    w: false,
    s: false,
    a: false,
    d: false,
    sprint: false,
  });

  const movement = useRef(
    new THREE.Vector3()
  );

  const forward = useRef(
    new THREE.Vector3()
  );

  const right = useRef(
    new THREE.Vector3()
  );

  /* =======================================================
     RESPAWN
  ======================================================= */

  const respawn = () => {
    if (!body.current) return;

    const rigidBody =
      body.current;

    rigidBody.setTranslation(
      {
        x: playerRuntime.spawn.x,
        y: playerRuntime.spawn.y,
        z: playerRuntime.spawn.z,
      },
      true
    );

    rigidBody.setLinvel(
      {
        x: 0,
        y: 0,
        z: 0,
      },
      true
    );

    rigidBody.setAngvel(
      {
        x: 0,
        y: 0,
        z: 0,
      },
      true
    );

    rigidBody.wakeUp();
  };

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    const keyDown = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w = true;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.current.s = true;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.current.a = true;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.current.d = true;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint = true;
          break;

        default:
          break;
      }
    };

    const keyUp = (event) => {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w = false;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.current.s = false;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.current.a = false;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.current.d = false;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint = false;
          break;

        default:
          break;
      }
    };

    const resetKeys = () => {
      keys.current.w = false;
      keys.current.s = false;
      keys.current.a = false;
      keys.current.d = false;
      keys.current.sprint = false;

      playerInput.sprint = false;
    };

    window.addEventListener(
      "keydown",
      keyDown
    );

    window.addEventListener(
      "keyup",
      keyUp
    );

    window.addEventListener(
      "blur",
      resetKeys
    );

    return () => {
      window.removeEventListener(
        "keydown",
        keyDown
      );

      window.removeEventListener(
        "keyup",
        keyUp
      );

      window.removeEventListener(
        "blur",
        resetKeys
      );
    };
  }, []);

  /* =======================================================
     LOOP
  ======================================================= */

  useFrame((_, delta) => {
    if (!body.current) return;

    const rigidBody =
      body.current;

    playerRuntime.body =
      rigidBody;

    /* SPAWN */

    if (!hasSpawned.current) {
      hasSpawned.current = true;

      respawn();

      return;
    }

    const position =
      rigidBody.translation();

    /* FALLBACK */

    if (
      position.y < FALL_LIMIT ||
      !Number.isFinite(position.x) ||
      !Number.isFinite(position.y) ||
      !Number.isFinite(position.z)
    ) {
      respawn();

      return;
    }

    /* =====================================================
       DIRECCIÓN SEGÚN CÁMARA
    ===================================================== */

    const yaw =
      playerRuntime.yaw;

    forward.current.set(
      -Math.sin(yaw),
      0,
      -Math.cos(yaw)
    );

    right.current.set(
      Math.cos(yaw),
      0,
      -Math.sin(yaw)
    );

    movement.current.set(
      0,
      0,
      0
    );

    /* =====================================================
       TECLADO
    ===================================================== */

    if (keys.current.w) {
      movement.current.add(
        forward.current
      );
    }

    if (keys.current.s) {
      movement.current.sub(
        forward.current
      );
    }

    if (keys.current.d) {
      movement.current.add(
        right.current
      );
    }

    if (keys.current.a) {
      movement.current.sub(
        right.current
      );
    }

    /* =====================================================
       MÓVIL
    ===================================================== */

    if (playerInput.y !== 0) {
      movement.current
        .addScaledVector(
          forward.current,
          playerInput.y
        );
    }

    if (playerInput.x !== 0) {
      movement.current
        .addScaledVector(
          right.current,
          playerInput.x
        );
    }

    /* =====================================================
       VELOCIDAD
    ===================================================== */

    const currentVelocity =
      rigidBody.linvel();

    let targetX = 0;
    let targetZ = 0;

    if (
      movement.current.lengthSq() >
      0.0001
    ) {
      const strength =
        Math.min(
          movement.current.length(),
          1
        );

      movement.current.normalize();

      const sprinting =
        keys.current.sprint ||
        playerInput.sprint;

      const maxSpeed =
        sprinting
          ? SPRINT_SPEED
          : WALK_SPEED;

      /*
        Joystick analógico:
        cuanto más lo empujamos,
        más rápido caminamos.

        Teclado:
        strength = 1.
      */

      const speed =
        maxSpeed * strength;

      targetX =
        movement.current.x *
        speed;

      targetZ =
        movement.current.z *
        speed;

      /* ROTACIÓN VISUAL */

      if (visual.current) {
        const targetRotation =
          Math.atan2(
            movement.current.x,
            movement.current.z
          );

        let difference =
          targetRotation -
          visual.current.rotation.y;

        difference =
          Math.atan2(
            Math.sin(difference),
            Math.cos(difference)
          );

        const rotationSmoothing =
          1 -
          Math.exp(
            -12 * delta
          );

        visual.current.rotation.y +=
          difference *
          rotationSmoothing;
      }
    }

    /* =====================================================
       SUAVIZADO
    ===================================================== */

    const smoothing =
      1 -
      Math.exp(
        -13 * delta
      );

    const velocityX =
      THREE.MathUtils.lerp(
        currentVelocity.x,
        targetX,
        smoothing
      );

    const velocityZ =
      THREE.MathUtils.lerp(
        currentVelocity.z,
        targetZ,
        smoothing
      );

    rigidBody.setLinvel(
      {
        x: velocityX,
        y: currentVelocity.y,
        z: velocityZ,
      },
      true
    );
  });

  /* =======================================================
     PERSONAJE
  ======================================================= */

  return (
    <RigidBody
      ref={body}
      position={[
        playerRuntime.spawn.x,
        playerRuntime.spawn.y,
        playerRuntime.spawn.z,
      ]}
      colliders={false}
      enabledRotations={[
        false,
        false,
        false,
      ]}
      friction={0.45}
      restitution={0}
      linearDamping={1}
      angularDamping={1}
      ccd
      canSleep={false}
    >
      <CapsuleCollider
        args={[
          COLLIDER_HALF_HEIGHT,
          COLLIDER_RADIUS,
        ]}
        friction={0.45}
        restitution={0}
      />

      <group
        ref={visual}
        position={[
          0,
          -1.05,
          0,
        ]}
      >
        {/* CUERPO */}

        <mesh
          position={[
            0,
            1.2,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.7,
              1.1,
              0.4,
            ]}
          />

          <meshStandardMaterial
            color="#333333"
          />
        </mesh>

        {/* CABEZA */}

        <mesh
          position={[
            0,
            1.85,
            0,
          ]}
          castShadow
        >
          <sphereGeometry
            args={[
              0.35,
              24,
              24,
            ]}
          />

          <meshStandardMaterial
            color="#d8a47f"
          />
        </mesh>

        {/* PIERNA IZQUIERDA */}

        <mesh
          position={[
            -0.2,
            0.45,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.25,
              0.9,
              0.3,
            ]}
          />

          <meshStandardMaterial
            color="#222222"
          />
        </mesh>

        {/* PIERNA DERECHA */}

        <mesh
          position={[
            0.2,
            0.45,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.25,
              0.9,
              0.3,
            ]}
          />

          <meshStandardMaterial
            color="#222222"
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
