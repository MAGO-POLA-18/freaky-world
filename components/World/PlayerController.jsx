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
   VELOCIDADES

   El joystick móvil controla progresivamente todo el rango.

   Aproximadamente:

   0–10 %   = zona muerta
   10–45 %  = caminar lento
   45–82 %  = caminar rápido
   82–100 % = sprint

   En teclado:
   WASD = velocidad normal
   Shift = sprint
========================================================= */

const SLOW_SPEED = 2.2;
const WALK_SPEED = 5.2;
const SPRINT_SPEED = 12.5;

const FALL_LIMIT = -8;

const COLLIDER_HALF_HEIGHT = 0.7;
const COLLIDER_RADIUS = 0.35;

/* =========================================================
   CURVA DE VELOCIDAD DEL JOYSTICK
========================================================= */

function getAnalogSpeed(strength) {
  /*
    Zona muerta.

    Evita que pequeñas desviaciones del pulgar
    muevan al personaje.
  */

  if (strength < 0.1) {
    return 0;
  }

  /* =======================================================
     CAMINAR LENTO
     10 % -> 45 %
  ======================================================= */

  if (strength < 0.45) {
    const t =
      (strength - 0.1) /
      (0.45 - 0.1);

    return THREE.MathUtils.lerp(
      0.8,
      SLOW_SPEED,
      t
    );
  }

  /* =======================================================
     CAMINAR NORMAL / RÁPIDO
     45 % -> 82 %
  ======================================================= */

  if (strength < 0.82) {
    const t =
      (strength - 0.45) /
      (0.82 - 0.45);

    return THREE.MathUtils.lerp(
      SLOW_SPEED,
      WALK_SPEED,
      t
    );
  }

  /* =======================================================
     SPRINT
     82 % -> 100 %
  ======================================================= */

  const t =
    (strength - 0.82) /
    (1 - 0.82);

  /*
    smoothstep:

    Evita que el sprint entre como un golpe brusco.
  */

  const smoothT =
    t * t * (3 - 2 * t);

  return THREE.MathUtils.lerp(
    WALK_SPEED,
    SPRINT_SPEED,
    smoothT
  );
}

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
    if (!body.current) {
      return;
    }

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
    if (!body.current) {
      return;
    }

    const rigidBody =
      body.current;

    playerRuntime.body =
      rigidBody;

    /* =====================================================
       SPAWN
    ===================================================== */

    if (!hasSpawned.current) {
      hasSpawned.current = true;

      respawn();

      return;
    }

    const position =
      rigidBody.translation();

    /* =====================================================
       FALLBACK
    ===================================================== */

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

    let keyboardActive = false;

    if (keys.current.w) {
      movement.current.add(
        forward.current
      );

      keyboardActive = true;
    }

    if (keys.current.s) {
      movement.current.sub(
        forward.current
      );

      keyboardActive = true;
    }

    if (keys.current.d) {
      movement.current.add(
        right.current
      );

      keyboardActive = true;
    }

    if (keys.current.a) {
      movement.current.sub(
        right.current
      );

      keyboardActive = true;
    }

    /* =====================================================
       JOYSTICK MÓVIL
    ===================================================== */

    const analogStrength =
      Math.min(
        Math.sqrt(
          playerInput.x *
            playerInput.x +
          playerInput.y *
            playerInput.y
        ),
        1
      );

    if (!keyboardActive) {
      if (
        analogStrength >
        0.001
      ) {
        movement.current
          .addScaledVector(
            forward.current,
            playerInput.y
          );

        movement.current
          .addScaledVector(
            right.current,
            playerInput.x
          );
      }
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
      movement.current.normalize();

      let speed = 0;

      /* DESKTOP */

      if (keyboardActive) {
        speed =
          keys.current.sprint
            ? SPRINT_SPEED
            : WALK_SPEED;
      }

      /* MÓVIL */

      else {
        speed =
          getAnalogSpeed(
            analogStrength
          );
      }

      targetX =
        movement.current.x *
        speed;

      targetZ =
        movement.current.z *
        speed;

      /* ===================================================
         ROTACIÓN VISUAL
      =================================================== */

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
       ACELERACIÓN / DESACELERACIÓN

       El sprint entra rápido,
       pero sin cambiar de velocidad instantáneamente.
    ===================================================== */

    const movementSmoothing =
      1 -
      Math.exp(
        -14 * delta
      );

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
