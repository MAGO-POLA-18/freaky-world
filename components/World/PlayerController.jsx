"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  CapsuleCollider,
} from "@react-three/rapier";
import * as THREE from "three";

/* =========================================================
   INPUT GLOBAL DEL JUGADOR

   Lo utiliza:
   - teclado
   - joystick móvil
   - cámara móvil
========================================================= */

export const playerInput = {
  x: 0,
  y: 0,
  lookX: 0,
  lookY: 0,
};

/* =========================================================
   RUNTIME GLOBAL DEL JUGADOR

   Punto único donde otros sistemas pueden consultar:
   - rigid body
   - rotación de cámara
   - spawn

   IMPORTANTE:
   spawn.y representa el CENTRO del collider.
========================================================= */

export const playerRuntime = {
  body: null,

  yaw: 0,
  pitch: 0.35,

  spawn: new THREE.Vector3(0, 1.05, 14),
};

/* =========================================================
   CONFIGURACIÓN DEL PERSONAJE
========================================================= */

const WALK_SPEED = 2;
const RUN_SPEED = 6.5;

const FALL_LIMIT = -8;

/*
  CapsuleCollider de Rapier:

  args={[
    halfHeight,
    radius
  ]}

  Altura total aproximada:
  halfHeight * 2 + radius * 2

  0.7 * 2 + 0.35 * 2 = 2.1 m
*/

const COLLIDER_HALF_HEIGHT = 0.7;
const COLLIDER_RADIUS = 0.35;

/* =========================================================
   PLAYER CONTROLLER
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
  });

  const movement = useRef(new THREE.Vector3());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());

  /* =======================================================
     RESET / RESPAWN
  ======================================================= */

  const respawn = () => {
    if (!body.current) return;

    const rigidBody = body.current;

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

        default:
          break;
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  /* =======================================================
     LOOP DEL JUGADOR
  ======================================================= */

  useFrame((_, delta) => {
    if (!body.current) return;

    const rigidBody = body.current;

    playerRuntime.body = rigidBody;

    /* -----------------------------------------------------
       SPAWN INICIAL CONTROLADO

       No dependemos únicamente de position={} de React.
       Una vez que Rapier ya creó el rigid body,
       colocamos explícitamente al jugador.
    ----------------------------------------------------- */

    if (!hasSpawned.current) {
      hasSpawned.current = true;

      respawn();

      return;
    }

    const position = rigidBody.translation();

    /* -----------------------------------------------------
       FALLBACK

       Si sale del escenario, vuelve al spawn.
    ----------------------------------------------------- */

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

    const yaw = playerRuntime.yaw;

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

    movement.current.set(0, 0, 0);

    /* =====================================================
       INPUT TECLADO
    ===================================================== */

    if (keys.current.w) {
      movement.current.add(forward.current);
    }

    if (keys.current.s) {
      movement.current.sub(forward.current);
    }

    if (keys.current.d) {
      movement.current.add(right.current);
    }

    if (keys.current.a) {
      movement.current.sub(right.current);
    }

    /* =====================================================
       INPUT MÓVIL
    ===================================================== */

    if (playerInput.y !== 0) {
      movement.current.addScaledVector(
        forward.current,
        playerInput.y
      );
    }

    if (playerInput.x !== 0) {
      movement.current.addScaledVector(
        right.current,
        playerInput.x
      );
    }

    /* =====================================================
       VELOCIDAD
    ===================================================== */

    const currentVelocity = rigidBody.linvel();

    let targetX = 0;
    let targetZ = 0;

    if (movement.current.lengthSq() > 0.0001) {
      const strength = Math.min(
        movement.current.length(),
        1
      );

      movement.current.normalize();

      const speed =
        WALK_SPEED +
        (RUN_SPEED - WALK_SPEED) *
          strength;

      targetX =
        movement.current.x * speed;

      targetZ =
        movement.current.z * speed;

      /* ===================================================
         ROTACIÓN VISUAL DEL PERSONAJE
      =================================================== */

      if (visual.current) {
        const targetRotation = Math.atan2(
          movement.current.x,
          movement.current.z
        );

        let difference =
          targetRotation -
          visual.current.rotation.y;

        difference = Math.atan2(
          Math.sin(difference),
          Math.cos(difference)
        );

        const rotationSmoothing =
          1 - Math.exp(-12 * delta);

        visual.current.rotation.y +=
          difference * rotationSmoothing;
      }
    }

    /* =====================================================
       SUAVIZADO DEL MOVIMIENTO
    ===================================================== */

    const movementSmoothing =
      1 - Math.exp(-10 * delta);

    const velocityX =
      THREE.MathUtils.lerp(
        currentVelocity.x,
        targetX,
        movementSmoothing
      );

    const velocityZ =
      THREE.MathUtils.lerp(
        currentVelocity.z,
        targetZ,
        movementSmoothing
      );

    /*
      Conservamos Y.

      Rapier controla:
      - gravedad
      - suelo
      - desniveles
      - colisiones verticales

      Nosotros controlamos únicamente X/Z.
    */

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
      {/* ===================================================
          COLLIDER

          El centro del collider coincide con el RigidBody.

          Altura total:
          ~2.1 m

          Spawn:
          Y = 1.05

          Por lo tanto la parte inferior aparece
          aproximadamente sobre Y = 0.
      =================================================== */}

      <CapsuleCollider
        args={[
          COLLIDER_HALF_HEIGHT,
          COLLIDER_RADIUS,
        ]}
        friction={0.45}
        restitution={0}
      />

      {/* ===================================================
          MODELO VISUAL TEMPORAL

          Después esto podrá sustituirse por:
          - avatar
          - GLTF
          - skins
          - personajes online

          sin tocar la física.
      =================================================== */}

      <group
        ref={visual}
        position={[0, -1.05, 0]}
      >
        {/* CUERPO */}

        <mesh
          position={[0, 1.2, 0]}
          castShadow
        >
          <boxGeometry
            args={[0.7, 1.1, 0.4]}
          />

          <meshStandardMaterial
            color="#333333"
          />
        </mesh>

        {/* CABEZA */}

        <mesh
          position={[0, 1.85, 0]}
          castShadow
        >
          <sphereGeometry
            args={[0.35, 24, 24]}
          />

          <meshStandardMaterial
            color="#d8a47f"
          />
        </mesh>

        {/* PIERNA IZQUIERDA */}

        <mesh
          position={[-0.2, 0.45, 0]}
          castShadow
        >
          <boxGeometry
            args={[0.25, 0.9, 0.3]}
          />

          <meshStandardMaterial
            color="#222222"
          />
        </mesh>

        {/* PIERNA DERECHA */}

        <mesh
          position={[0.2, 0.45, 0]}
          castShadow
        >
          <boxGeometry
            args={[0.25, 0.9, 0.3]}
          />

          <meshStandardMaterial
            color="#222222"
          />
        </mesh>
      </group>
    </RigidBody>
  );
}
