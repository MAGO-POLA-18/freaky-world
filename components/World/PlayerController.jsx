"use client";

import {
  useEffect,
  useRef,
} from "react";

import { useFrame } from "@react-three/fiber";

import {
  RigidBody,
  CapsuleCollider,
} from "@react-three/rapier";

import * as THREE from "three";

import TierraVicioAvatar from "./TierraVicioAvatar";

/* =========================================================
   INPUT GLOBAL
========================================================= */

export const playerInput = {
  x: 0,
  y: 0,

  lookX: 0,
  lookY: 0,

  /* B móvil */
  sprint: false,

  /* se mantiene por compatibilidad */
  dashRequested: false,

  uiLocked: false,
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
   MOVIMIENTO
========================================================= */

const SLOW_SPEED = 2.2;
const WALK_SPEED = 5.2;

const SPRINT_SPEED = 40;

const DASH_SPEED = 20;
const DASH_DURATION = 0.16;

const ACCELERATION = 12;
const ROTATION_SPEED = 12;

/* =========================================================
   PLAYER CONTROLLER
========================================================= */

export default function PlayerController() {
  const body =
    useRef(null);

  const visual =
    useRef(null);

  const movementAmount =
    useRef(0);

  const targetRotation =
    useRef(0);

  const dashTimer =
    useRef(0);

  const keyboard =
    useRef({
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
    });

  const cameraForward =
    useRef(
      new THREE.Vector3()
    );

  const cameraRight =
    useRef(
      new THREE.Vector3()
    );

  const worldUp =
    useRef(
      new THREE.Vector3(
        0,
        1,
        0
      )
    );

  const movementDirection =
    useRef(
      new THREE.Vector3()
    );

  /* =======================================================
     TECLADO
  ======================================================= */

  useEffect(() => {
    function setKey(
      code,
      pressed
    ) {
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          keyboard.current.forward =
            pressed;
          break;

        case "KeyS":
        case "ArrowDown":
          keyboard.current.backward =
            pressed;
          break;

        case "KeyA":
        case "ArrowLeft":
          keyboard.current.left =
            pressed;
          break;

        case "KeyD":
        case "ArrowRight":
          keyboard.current.right =
            pressed;
          break;

        case "ShiftLeft":
        case "ShiftRight":
          keyboard.current.sprint =
            pressed;
          break;

        default:
          break;
      }
    }

    function resetKeyboard() {
      keyboard.current.forward = false;
      keyboard.current.backward = false;
      keyboard.current.left = false;
      keyboard.current.right = false;
      keyboard.current.sprint = false;
    }

    function onKeyDown(event) {
      if (playerInput.uiLocked) {
        resetKeyboard();
        return;
      }

      setKey(
        event.code,
        true
      );
    }

    function onKeyUp(event) {
      if (playerInput.uiLocked) {
        resetKeyboard();
        return;
      }

      setKey(
        event.code,
        false
      );
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    window.addEventListener(
      "keyup",
      onKeyUp
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
      );

      window.removeEventListener(
        "keyup",
        onKeyUp
      );
    };
  }, []);

  /* =======================================================
     LOOP PRINCIPAL
  ======================================================= */

  useFrame(
    ({ camera }, delta) => {
      if (!body.current) {
        return;
      }

      playerRuntime.body =
        body.current;

      /* UI ABIERTA */

      if (playerInput.uiLocked) {
        const velocity =
          body.current.linvel();

        body.current.setLinvel(
          {
            x: 0,
            y: velocity.y,
            z: 0,
          },
          true
        );

        movementAmount.current =
          THREE.MathUtils.lerp(
            movementAmount.current,
            0,
            0.18
          );

        return;
      }

      /* INPUT MÓVIL */

      let inputX =
        playerInput.x || 0;

      let inputY =
        playerInput.y || 0;

      /* INPUT TECLADO */

      const keyboardX =
        (
          keyboard.current.right
            ? 1
            : 0
        ) -
        (
          keyboard.current.left
            ? 1
            : 0
        );

      const keyboardY =
        (
          keyboard.current.forward
            ? 1
            : 0
        ) -
        (
          keyboard.current.backward
            ? 1
            : 0
        );

      const keyboardActive =
        keyboardX !== 0 ||
        keyboardY !== 0;

      if (keyboardActive) {
        inputX =
          keyboardX;

        inputY =
          keyboardY;
      }

      const rawMagnitude =
        Math.sqrt(
          inputX * inputX +
          inputY * inputY
        );

      const magnitude =
        Math.min(
          rawMagnitude,
          1
        );

      if (rawMagnitude > 1) {
        inputX /=
          rawMagnitude;

        inputY /=
          rawMagnitude;
      }

      /* ===================================================
         SPRINT

         Escritorio: Shift
         Móvil: mantener B
      =================================================== */

      const sprinting =
        keyboardActive
          ? keyboard.current.sprint
          : Boolean(
              playerInput.sprint
            );

      /* ===================================================
         VELOCIDAD
      =================================================== */

      let moveSpeed = 0;

      if (magnitude > 0.08) {
        if (sprinting) {
          moveSpeed =
            SPRINT_SPEED;
        } else if (
          magnitude < 0.38
        ) {
          moveSpeed =
            THREE.MathUtils.lerp(
              SLOW_SPEED * 0.45,
              SLOW_SPEED,
              magnitude / 0.38
            );
        } else {
          moveSpeed =
            THREE.MathUtils.lerp(
              SLOW_SPEED,
              WALK_SPEED,

              Math.min(
                1,

                (
                  magnitude -
                  0.38
                ) /
                  0.62
              )
            );
        }
      }

      /* ===================================================
         DASH ANTIGUO
      =================================================== */

      if (
        playerInput.dashRequested &&
        magnitude > 0.1
      ) {
        dashTimer.current =
          DASH_DURATION;

        playerInput.dashRequested =
          false;
      }

      if (
        dashTimer.current > 0
      ) {
        dashTimer.current -=
          delta;

        moveSpeed =
          DASH_SPEED;
      }

      /* ===================================================
         DIRECCIÓN REAL DE CÁMARA
      =================================================== */

      camera.getWorldDirection(
        cameraForward.current
      );

      cameraForward.current.y =
        0;

      if (
        cameraForward.current.lengthSq() <
        0.0001
      ) {
        cameraForward.current.set(
          -Math.sin(
            playerRuntime.yaw
          ),

          0,

          -Math.cos(
            playerRuntime.yaw
          )
        );
      }

      cameraForward.current.normalize();

      cameraRight.current
        .crossVectors(
          cameraForward.current,
          worldUp.current
        )
        .normalize();

      movementDirection.current.set(
        0,
        0,
        0
      );

      movementDirection.current
        .addScaledVector(
          cameraForward.current,
          inputY
        );

      movementDirection.current
        .addScaledVector(
          cameraRight.current,
          inputX
        );

      if (
        movementDirection.current.lengthSq() >
        0.0001
      ) {
        movementDirection.current.normalize();
      }

      const directionX =
        movementDirection.current.x;

      const directionZ =
        movementDirection.current.z;

      /* ===================================================
         VELOCIDAD FÍSICA
      =================================================== */

      const currentVelocity =
        body.current.linvel();

      const desiredX =
        directionX *
        moveSpeed;

      const desiredZ =
        directionZ *
        moveSpeed;

      const smoothing =
        1 -
        Math.exp(
          -ACCELERATION *
            delta
        );

      const nextX =
        THREE.MathUtils.lerp(
          currentVelocity.x,
          desiredX,
          smoothing
        );

      const nextZ =
        THREE.MathUtils.lerp(
          currentVelocity.z,
          desiredZ,
          smoothing
        );

      body.current.setLinvel(
        {
          x: nextX,
          y: currentVelocity.y,
          z: nextZ,
        },
        true
      );

      /* ===================================================
         ANIMACIÓN
      =================================================== */

      const animationMovement =
        sprinting &&
        magnitude > 0.08
          ? 1
          : magnitude;

      movementAmount.current =
        THREE.MathUtils.lerp(
          movementAmount.current,
          animationMovement,

          1 -
            Math.exp(
              -delta * 8
            )
        );

      /* ===================================================
         ROTACIÓN DEL AVATAR
      =================================================== */

      if (
        magnitude > 0.08 &&
        movementDirection.current.lengthSq() >
          0.0001
      ) {
        targetRotation.current =
          Math.atan2(
            directionX,
            directionZ
          );

        if (visual.current) {
          let difference =
            targetRotation.current -
            visual.current.rotation.y;

          difference =
            Math.atan2(
              Math.sin(
                difference
              ),

              Math.cos(
                difference
              )
            );

          visual.current.rotation.y +=
            difference *
            Math.min(
              ROTATION_SPEED *
                delta,
              1
            );
        }
      }
    }
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <RigidBody
      ref={body}
      colliders={false}

      enabledRotations={[
        false,
        false,
        false,
      ]}

      position={[
        playerRuntime.spawn.x,
        playerRuntime.spawn.y,
        playerRuntime.spawn.z,
      ]}

      linearDamping={5}
      angularDamping={10}
      canSleep={false}
    >
      <CapsuleCollider
        args={[
          0.7,
          0.35,
        ]}
      />

      <TierraVicioAvatar
        visualRef={visual}
        movementAmount={
          movementAmount
        }
      />
    </RigidBody>
  );
}
