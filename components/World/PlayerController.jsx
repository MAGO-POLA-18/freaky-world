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

  /*
    MobileControls pone esto en true
    cuando detecta doble toque.

    PlayerController lo consume
    inmediatamente y lo devuelve a false.
  */
  dashRequested: false,
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
========================================================= */

const SLOW_SPEED = 2.2;
const WALK_SPEED = 5.2;
const SPRINT_SPEED = 12.5;

/*
  DASH

  Es deliberadamente corto.

  No queremos un teletransporte.
  Queremos un pequeño "fuf" de velocidad.
*/

const DASH_SPEED = 20;

const DASH_DURATION = 0.22;

const DASH_COOLDOWN = 0.32;

const FALL_LIMIT = -8;

const COLLIDER_HALF_HEIGHT = 0.7;
const COLLIDER_RADIUS = 0.35;

/* =========================================================
   CURVA ANALÓGICA DEL JOYSTICK
========================================================= */

function getAnalogSpeed(strength) {
  /* zona muerta */

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
     CAMINAR / CORRER

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

  const smoothT =
    t *
    t *
    (3 - 2 * t);

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

  const visual =
    useRef(null);

  const hasSpawned =
    useRef(false);

  /* =======================================================
     DASH RUNTIME
  ======================================================= */

  const dashRemaining =
    useRef(0);

  const dashCooldown =
    useRef(0);

  /*
    Dirección bloqueada durante el dash.

    Esto evita que el personaje cambie
    violentamente de dirección en mitad
    del impulso.
  */

  const dashDirection =
    useRef(
      new THREE.Vector3()
    );

  /* =======================================================
     TECLADO
  ======================================================= */

  const keys = useRef({
    w: false,
    s: false,
    a: false,
    d: false,

    sprint: false,
  });

  /* =======================================================
     VECTORES REUTILIZABLES
  ======================================================= */

  const movement =
    useRef(
      new THREE.Vector3()
    );

  const forward =
    useRef(
      new THREE.Vector3()
    );

  const right =
    useRef(
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
        x:
          playerRuntime
            .spawn.x,

        y:
          playerRuntime
            .spawn.y,

        z:
          playerRuntime
            .spawn.z,
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

    dashRemaining.current = 0;
    dashCooldown.current = 0;

    playerInput.dashRequested =
      false;

    rigidBody.wakeUp();
  };

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    const keyDown = (
      event
    ) => {
      switch (
        event.code
      ) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w =
            true;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.current.s =
            true;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.current.a =
            true;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.current.d =
            true;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint =
            true;
          break;

        default:
          break;
      }
    };

    const keyUp = (
      event
    ) => {
      switch (
        event.code
      ) {
        case "KeyW":
        case "ArrowUp":
          keys.current.w =
            false;
          break;

        case "KeyS":
        case "ArrowDown":
          keys.current.s =
            false;
          break;

        case "KeyA":
        case "ArrowLeft":
          keys.current.a =
            false;
          break;

        case "KeyD":
        case "ArrowRight":
          keys.current.d =
            false;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          keys.current.sprint =
            false;
          break;

        default:
          break;
      }
    };

    const resetKeys =
      () => {
        keys.current.w =
          false;

        keys.current.s =
          false;

        keys.current.a =
          false;

        keys.current.d =
          false;

        keys.current.sprint =
          false;
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

  useFrame(
    (_, delta) => {
      if (!body.current) {
        return;
      }

      const rigidBody =
        body.current;

      playerRuntime.body =
        rigidBody;

      /* ===================================================
         SPAWN
      =================================================== */

      if (
        !hasSpawned.current
      ) {
        hasSpawned.current =
          true;

        respawn();

        return;
      }

      const position =
        rigidBody.translation();

      /* ===================================================
         FALLBACK
      =================================================== */

      if (
        position.y <
          FALL_LIMIT ||
        !Number.isFinite(
          position.x
        ) ||
        !Number.isFinite(
          position.y
        ) ||
        !Number.isFinite(
          position.z
        )
      ) {
        respawn();

        return;
      }

      /* ===================================================
         TIMERS DEL DASH
      =================================================== */

      dashRemaining.current =
        Math.max(
          0,
          dashRemaining.current -
            delta
        );

      dashCooldown.current =
        Math.max(
          0,
          dashCooldown.current -
            delta
        );

      /* ===================================================
         DIRECCIÓN SEGÚN CÁMARA
      =================================================== */

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

      /* ===================================================
         TECLADO
      =================================================== */

      let keyboardActive =
        false;

      if (keys.current.w) {
        movement.current.add(
          forward.current
        );

        keyboardActive =
          true;
      }

      if (keys.current.s) {
        movement.current.sub(
          forward.current
        );

        keyboardActive =
          true;
      }

      if (keys.current.d) {
        movement.current.add(
          right.current
        );

        keyboardActive =
          true;
      }

      if (keys.current.a) {
        movement.current.sub(
          right.current
        );

        keyboardActive =
          true;
      }

      /* ===================================================
         JOYSTICK
      =================================================== */

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

      /* ===================================================
         NORMALIZAMOS DIRECCIÓN
      =================================================== */

      const hasMovement =
        movement.current
          .lengthSq() >
        0.0001;

      if (hasMovement) {
        movement.current.normalize();
      }

      /* ===================================================
         PETICIÓN DE DASH

         Solo funciona si:

         - estamos moviéndonos
         - no estamos ya haciendo dash
         - terminó el cooldown
      =================================================== */

      if (
        playerInput
          .dashRequested
      ) {
        if (
          hasMovement &&
          dashRemaining
            .current <= 0 &&
          dashCooldown
            .current <= 0
        ) {
          dashDirection.current.copy(
            movement.current
          );

          dashRemaining.current =
            DASH_DURATION;

          dashCooldown.current =
            DASH_COOLDOWN;
        }

        /*
          Consumimos siempre la petición.

          Así un doble toque no queda
          esperando hasta más tarde.
        */

        playerInput.dashRequested =
          false;
      }

      /* ===================================================
         VELOCIDAD ACTUAL
      =================================================== */

      const currentVelocity =
        rigidBody.linvel();

      let targetX = 0;
      let targetZ = 0;

      /* ===================================================
         DASH ACTIVO
      =================================================== */

      if (
        dashRemaining.current >
        0
      ) {
        targetX =
          dashDirection.current.x *
          DASH_SPEED;

        targetZ =
          dashDirection.current.z *
          DASH_SPEED;
      }

      /* ===================================================
         MOVIMIENTO NORMAL
      =================================================== */

      else if (
        hasMovement
      ) {
        let speed = 0;

        /* DESKTOP */

        if (
          keyboardActive
        ) {
          speed =
            keys.current
              .sprint
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
      }

      /* ===================================================
         ROTACIÓN VISUAL

         Durante dash usamos la dirección
         bloqueada del impulso.
      =================================================== */

      if (visual.current) {
        let visualDirection =
          null;

        if (
          dashRemaining
            .current > 0
        ) {
          visualDirection =
            dashDirection.current;
        } else if (
          hasMovement
        ) {
          visualDirection =
            movement.current;
        }

        if (
          visualDirection
        ) {
          const targetRotation =
            Math.atan2(
              visualDirection.x,
              visualDirection.z
            );

          let difference =
            targetRotation -
            visual.current
              .rotation.y;

          difference =
            Math.atan2(
              Math.sin(
                difference
              ),
              Math.cos(
                difference
              )
            );

          const rotationSmoothing =
            1 -
            Math.exp(
              -12 *
                delta
            );

          visual.current
            .rotation.y +=
            difference *
            rotationSmoothing;
        }
      }

      /* ===================================================
         SUAVIZADO

         Dash:
         respuesta más inmediata.

         Movimiento normal:
         suave.
      =================================================== */

      const smoothing =
        dashRemaining.current >
        0
          ? 1 -
            Math.exp(
              -28 * delta
            )
          : 1 -
            Math.exp(
              -14 * delta
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

          y:
            currentVelocity.y,

          z: velocityZ,
        },
        true
      );
    }
  );

  /* =======================================================
     PERSONAJE
  ======================================================= */

  return (
    <RigidBody
      ref={body}
      position={[
        playerRuntime
          .spawn.x,

        playerRuntime
          .spawn.y,

        playerRuntime
          .spawn.z,
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
