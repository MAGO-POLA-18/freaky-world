"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

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

  dashRequested: false,

  /*
    Si una interfaz 2D está abierta,
    bloqueamos el movimiento.
  */

  uiLocked: false,
};

/* =========================================================
   RUNTIME
========================================================= */

export const playerRuntime = {
  body: null,

  yaw: 0,
  pitch: 0.35,

  spawn:
    new THREE.Vector3(
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

const SPRINT_SPEED =
  12.5;

const DASH_SPEED = 20;

const DASH_DURATION =
  0.22;

const DASH_COOLDOWN =
  0.32;

const FALL_LIMIT = -8;

const COLLIDER_HALF_HEIGHT =
  0.7;

const COLLIDER_RADIUS =
  0.35;

/* =========================================================
   VELOCIDAD ANALÓGICA
========================================================= */

function getAnalogSpeed(
  strength
) {
  if (
    strength <
    0.1
  ) {
    return 0;
  }

  if (
    strength <
    0.45
  ) {
    const t =
      (strength -
        0.1) /
      0.35;

    return THREE.MathUtils
      .lerp(
        0.8,
        SLOW_SPEED,
        t
      );
  }

  if (
    strength <
    0.82
  ) {
    const t =
      (strength -
        0.45) /
      0.37;

    return THREE.MathUtils
      .lerp(
        SLOW_SPEED,
        WALK_SPEED,
        t
      );
  }

  const t =
    (strength -
      0.82) /
    0.18;

  const smoothT =
    t *
    t *
    (3 - 2 * t);

  return THREE.MathUtils
    .lerp(
      WALK_SPEED,
      SPRINT_SPEED,
      smoothT
    );
}

/* =========================================================
   PLAYER
========================================================= */

export default function PlayerController() {
  const body =
    useRef(null);

  const visual =
    useRef(null);

  const hasSpawned =
    useRef(false);

  const dashRemaining =
    useRef(0);

  const dashCooldown =
    useRef(0);

  const dashDirection =
    useRef(
      new THREE.Vector3()
    );

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

  const keys =
    useRef({
      w: false,
      s: false,
      a: false,
      d: false,

      sprint: false,
    });

  /* =======================================================
     RESPAWN
  ======================================================= */

  const respawn = () => {
    if (
      !body.current
    ) {
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

    dashRemaining.current =
      0;

    dashCooldown.current =
      0;

    playerInput
      .dashRequested =
      false;

    rigidBody.wakeUp();
  };

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    const keyDown =
      (event) => {
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
            keys.current
              .sprint =
              true;
            break;

          default:
            break;
        }
      };

    const keyUp =
      (event) => {
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
            keys.current
              .sprint =
              false;
            break;

          default:
            break;
        }
      };

    const reset =
      () => {
        keys.current.w =
          false;

        keys.current.s =
          false;

        keys.current.a =
          false;

        keys.current.d =
          false;

        keys.current
          .sprint =
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
      reset
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
        reset
      );
    };
  }, []);

  /* =======================================================
     LOOP
  ======================================================= */

  useFrame(
    (_, delta) => {
      if (
        !body.current
      ) {
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
         UI BLOQUEADA

         El usuario está usando
         la interfaz 2D.
      =================================================== */

      if (
        playerInput.uiLocked
      ) {
        const velocity =
          rigidBody.linvel();

        rigidBody.setLinvel(
          {
            x: 0,
            y:
              velocity.y,
            z: 0,
          },
          true
        );

        dashRemaining.current =
          0;

        playerInput
          .dashRequested =
          false;

        return;
      }

      /* ===================================================
         DASH TIMERS
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
         DIRECCIÓN CÁMARA
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

      let keyboardActive =
        false;

      /* ===================================================
         DESKTOP
      =================================================== */

      if (
        keys.current.w
      ) {
        movement.current.add(
          forward.current
        );

        keyboardActive =
          true;
      }

      if (
        keys.current.s
      ) {
        movement.current.sub(
          forward.current
        );

        keyboardActive =
          true;
      }

      if (
        keys.current.d
      ) {
        movement.current.add(
          right.current
        );

        keyboardActive =
          true;
      }

      if (
        keys.current.a
      ) {
        movement.current.sub(
          right.current
        );

        keyboardActive =
          true;
      }

      /* ===================================================
         MÓVIL
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

      if (
        !keyboardActive &&
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

      const hasMovement =
        movement.current
          .lengthSq() >
        0.0001;

      if (
        hasMovement
      ) {
        movement.current
          .normalize();
      }

      /* ===================================================
         DASH REQUEST
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
          dashDirection.current
            .copy(
              movement.current
            );

          dashRemaining.current =
            DASH_DURATION;

          dashCooldown.current =
            DASH_COOLDOWN;
        }

        playerInput
          .dashRequested =
          false;
      }

      /* ===================================================
         VELOCIDAD
      =================================================== */

      const currentVelocity =
        rigidBody.linvel();

      let targetX = 0;
      let targetZ = 0;

      if (
        dashRemaining
          .current > 0
      ) {
        targetX =
          dashDirection
            .current.x *
          DASH_SPEED;

        targetZ =
          dashDirection
            .current.z *
          DASH_SPEED;
      } else if (
        hasMovement
      ) {
        const speed =
          keyboardActive
            ? keys.current
                .sprint
              ? SPRINT_SPEED
              : WALK_SPEED
            : getAnalogSpeed(
                analogStrength
              );

        targetX =
          movement
            .current.x *
          speed;

        targetZ =
          movement
            .current.z *
          speed;
      }

      /* ===================================================
         ROTACIÓN VISUAL
      =================================================== */

      if (
        visual.current
      ) {
        let direction =
          null;

        if (
          dashRemaining
            .current > 0
        ) {
          direction =
            dashDirection
              .current;
        } else if (
          hasMovement
        ) {
          direction =
            movement.current;
        }

        if (
          direction
        ) {
          const targetRotation =
            Math.atan2(
              direction.x,
              direction.z
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

          const smooth =
            1 -
            Math.exp(
              -12 *
                delta
            );

          visual.current
            .rotation.y +=
            difference *
            smooth;
        }
      }

      /* ===================================================
         SUAVIZADO
      =================================================== */

      const smoothing =
        dashRemaining
          .current > 0
          ? 1 -
            Math.exp(
              -28 *
                delta
            )
          : 1 -
            Math.exp(
              -14 *
                delta
            );

      const velocityX =
        THREE.MathUtils
          .lerp(
            currentVelocity.x,
            targetX,
            smoothing
          );

      const velocityZ =
        THREE.MathUtils
          .lerp(
            currentVelocity.z,
            targetZ,
            smoothing
          );

      rigidBody.setLinvel(
        {
          x:
            velocityX,

          y:
            currentVelocity.y,

          z:
            velocityZ,
        },
        true
      );
    }
  );

  /* =======================================================
     PERSONAJE TEMPORAL
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
