"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useRapier,
} from "@react-three/rapier";

import * as THREE from "three";

import {
  playerInput,
  playerRuntime,
} from "./PlayerController";

/* =========================================================
   CÁMARA
========================================================= */

const DEFAULT_CAMERA_DISTANCE = 8.5;

const MIN_ZOOM_DISTANCE = 4.2;
const MAX_ZOOM_DISTANCE = 14;

const CAMERA_HEIGHT = 3.4;

const CAMERA_SENSITIVITY =
  0.0045;

const ZOOM_SENSITIVITY =
  0.012;

const MIN_PITCH = -1.38;
const MAX_PITCH = 1.2;

const CAMERA_WALL_MARGIN =
  0.45;

const MIN_CAMERA_DISTANCE =
  0.05;

/*
  Impide que la cámara entre en el suelo.

  El suelo visual está alrededor de Y=0.
  0.65 sigue permitiendo una cámara bastante baja,
  pero nunca enterrada.
*/

const MIN_CAMERA_WORLD_Y =
  0.65;

/*
  Después de que el usuario mueva la cámara,
  el follow automático espera un momento.
*/

const MANUAL_CAMERA_HOLD_MS =
  900;

const MOVEMENT_FOLLOW_THRESHOLD =
  0.35;

const WALK_FOLLOW_SPEED = 4.5;
const SPRINT_FOLLOW_SPEED = 7;

/* =========================================================
   CAMERA RIG
========================================================= */

export default function CameraRig() {
  const {
    gl,
  } = useThree();

  const {
    world,
    rapier,
  } = useRapier();

  /* =======================================================
     POINTERS
  ======================================================= */

  const pointers =
    useRef(
      new Map()
    );

  const primaryPointer =
    useRef(
      null
    );

  const lastPointer =
    useRef({
      x: 0,
      y: 0,
    });

  const pinchDistance =
    useRef(
      null
    );

  /* =======================================================
     CÁMARA
  ======================================================= */

  const cameraDistance =
    useRef(
      DEFAULT_CAMERA_DISTANCE
    );

  const initialized =
    useRef(
      false
    );

  const cameraInitialized =
    useRef(
      false
    );

  const smoothTarget =
    useRef(
      new THREE.Vector3()
    );

  const desiredPosition =
    useRef(
      new THREE.Vector3()
    );

  const safePosition =
    useRef(
      new THREE.Vector3()
    );

  const lookAtTarget =
    useRef(
      new THREE.Vector3()
    );

  const rayDirection =
    useRef(
      new THREE.Vector3()
    );

  const targetPosition =
    useRef(
      new THREE.Vector3()
    );

  const manualCameraUntil =
    useRef(
      0
    );

  /* =======================================================
     PINCH
  ======================================================= */

  const getPinchDistance =
    () => {
      const values =
        Array.from(
          pointers.current
            .values()
        );

      if (
        values.length <
        2
      ) {
        return null;
      }

      const first =
        values[0];

      const second =
        values[1];

      const dx =
        second.x -
        first.x;

      const dy =
        second.y -
        first.y;

      return Math.sqrt(
        dx * dx +
          dy * dy
      );
    };

  /* =======================================================
     INPUT POINTER / TOUCH
  ======================================================= */

  useEffect(() => {
    const canvas =
      gl.domElement;

    const previousTouchAction =
      canvas.style
        .touchAction;

    canvas.style
      .touchAction =
      "none";

    /* =====================================================
       POINTER DOWN
    ===================================================== */

    const onPointerDown =
      (
        event
      ) => {
        if (
          event.pointerType ===
            "mouse" &&
          event.button !==
            0
        ) {
          return;
        }

        pointers.current.set(
          event.pointerId,
          {
            x:
              event.clientX,

            y:
              event.clientY,
          }
        );

        canvas
          .setPointerCapture?.(
            event.pointerId
          );

        if (
          pointers.current
            .size === 1
        ) {
          primaryPointer.current =
            event.pointerId;

          lastPointer.current.x =
            event.clientX;

          lastPointer.current.y =
            event.clientY;

          pinchDistance.current =
            null;

          return;
        }

        if (
          pointers.current
            .size >= 2
        ) {
          primaryPointer.current =
            null;

          pinchDistance.current =
            getPinchDistance();
        }
      };

    /* =====================================================
       POINTER MOVE
    ===================================================== */

    const onPointerMove =
      (
        event
      ) => {
        if (
          !pointers.current.has(
            event.pointerId
          )
        ) {
          return;
        }

        pointers.current.set(
          event.pointerId,
          {
            x:
              event.clientX,

            y:
              event.clientY,
          }
        );

        /* =================================================
           PINCH
        ================================================= */

        if (
          pointers.current
            .size >= 2
        ) {
          const currentDistance =
            getPinchDistance();

          if (
            currentDistance &&
            pinchDistance.current
          ) {
            const difference =
              currentDistance -
              pinchDistance.current;

            cameraDistance.current =
              THREE.MathUtils.clamp(
                cameraDistance.current -
                  difference *
                    ZOOM_SENSITIVITY,

                MIN_ZOOM_DISTANCE,

                MAX_ZOOM_DISTANCE
              );
          }

          pinchDistance.current =
            currentDistance;

          return;
        }

        /* =================================================
           ROTACIÓN
        ================================================= */

        if (
          event.pointerId !==
          primaryPointer.current
        ) {
          return;
        }

        const dx =
          event.clientX -
          lastPointer.current.x;

        const dy =
          event.clientY -
          lastPointer.current.y;

        /*
          IMPORTANTE:
          al mover manualmente la cámara,
          bloqueamos temporalmente el auto-follow.
        */

        manualCameraUntil.current =
          performance.now() +
          MANUAL_CAMERA_HOLD_MS;

        playerRuntime.yaw -=
          dx *
          CAMERA_SENSITIVITY;

        playerRuntime.pitch =
          THREE.MathUtils.clamp(
            playerRuntime.pitch +
              dy *
                CAMERA_SENSITIVITY,

            MIN_PITCH,

            MAX_PITCH
          );

        lastPointer.current.x =
          event.clientX;

        lastPointer.current.y =
          event.clientY;
      };

    /* =====================================================
       POINTER STOP
    ===================================================== */

    const stopPointer =
      (
        event
      ) => {
        pointers.current.delete(
          event.pointerId
        );

        canvas
          .releasePointerCapture?.(
            event.pointerId
          );

        if (
          pointers.current
            .size === 0
        ) {
          primaryPointer.current =
            null;

          pinchDistance.current =
            null;

          return;
        }

        if (
          pointers.current
            .size === 1
        ) {
          const [
            id,
            pointer,
          ] =
            Array.from(
              pointers.current
                .entries()
            )[0];

          primaryPointer.current =
            id;

          lastPointer.current.x =
            pointer.x;

          lastPointer.current.y =
            pointer.y;

          pinchDistance.current =
            null;

          return;
        }

        pinchDistance.current =
          getPinchDistance();
      };

    /* =====================================================
       LISTENERS
    ===================================================== */

    canvas.addEventListener(
      "pointerdown",
      onPointerDown
    );

    canvas.addEventListener(
      "pointermove",
      onPointerMove
    );

    canvas.addEventListener(
      "pointerup",
      stopPointer
    );

    canvas.addEventListener(
      "pointercancel",
      stopPointer
    );

    return () => {
      canvas.style
        .touchAction =
        previousTouchAction;

      canvas.removeEventListener(
        "pointerdown",
        onPointerDown
      );

      canvas.removeEventListener(
        "pointermove",
        onPointerMove
      );

      canvas.removeEventListener(
        "pointerup",
        stopPointer
      );

      canvas.removeEventListener(
        "pointercancel",
        stopPointer
      );
    };
  }, [
    gl,
  ]);

  /* =======================================================
     LOOP
  ======================================================= */

  useFrame(
    (
      {
        camera,
      },
      delta
    ) => {
      const body =
        playerRuntime.body;

      if (
        !body
      ) {
        return;
      }

      /* ===================================================
         POSICIÓN DEL JUGADOR
      =================================================== */

      const playerPosition =
        body.translation();

      targetPosition.current.set(
        playerPosition.x,

        playerPosition.y +
          0.7,

        playerPosition.z
      );

      /* ===================================================
         TARGET SUAVIZADO
      =================================================== */

      if (
        !initialized.current
      ) {
        initialized.current =
          true;

        smoothTarget.current
          .copy(
            targetPosition.current
          );
      } else {
        smoothTarget.current
          .lerp(
            targetPosition.current,

            1 -
              Math.exp(
                -12 *
                  delta
              )
          );
      }

      /* ===================================================
         INPUT DE CÁMARA MÓVIL

         CORRECCIÓN IMPORTANTE:

         En el código anterior existían DOS bloques lookX.

         El primero consumía lookX y lo llevaba a 0,
         por lo que el segundo nunca podía marcar
         manualCameraUntil.

         Eso permitía que el follow automático luchara
         contra la cámara manual.
      =================================================== */

      if (
        playerInput.lookX !==
        0
      ) {
        manualCameraUntil.current =
          performance.now() +
          MANUAL_CAMERA_HOLD_MS;

        playerRuntime.yaw -=
          playerInput.lookX;

        playerInput.lookX =
          0;
      }

      if (
        playerInput.lookY !==
        0
      ) {
        manualCameraUntil.current =
          performance.now() +
          MANUAL_CAMERA_HOLD_MS;

        playerRuntime.pitch =
          THREE.MathUtils.clamp(
            playerRuntime.pitch +
              playerInput.lookY,

            MIN_PITCH,

            MAX_PITCH
          );

        playerInput.lookY =
          0;
      }

      /* ===================================================
         FOLLOW AUTOMÁTICO
      =================================================== */

      const velocity =
        body.linvel();

      const horizontalSpeed =
        Math.sqrt(
          velocity.x *
            velocity.x +
            velocity.z *
              velocity.z
        );

      const moving =
        horizontalSpeed >
        MOVEMENT_FOLLOW_THRESHOLD;

      const manualCameraActive =
        performance.now() <
        manualCameraUntil.current;

      if (
        moving &&
        !manualCameraActive
      ) {
        const targetYaw =
          Math.atan2(
            -velocity.x,
            -velocity.z
          );

        let yawDifference =
          targetYaw -
          playerRuntime.yaw;

        yawDifference =
          Math.atan2(
            Math.sin(
              yawDifference
            ),

            Math.cos(
              yawDifference
            )
          );

        const followSpeed =
          playerInput.sprint
            ? SPRINT_FOLLOW_SPEED
            : WALK_FOLLOW_SPEED;

        const followAmount =
          1 -
          Math.exp(
            -followSpeed *
              delta
          );

        playerRuntime.yaw +=
          yawDifference *
          followAmount;
      }

      /* ===================================================
         POSICIÓN DESEADA
      =================================================== */

      const yaw =
        playerRuntime.yaw;

      const pitch =
        playerRuntime.pitch;

      const distance =
        cameraDistance.current;

      const horizontalDistance =
        distance *
        Math.cos(
          pitch
        );

      desiredPosition.current.set(
        smoothTarget.current.x +
          Math.sin(
            yaw
          ) *
            horizontalDistance,

        smoothTarget.current.y +
          CAMERA_HEIGHT +
          Math.sin(
            pitch
          ) *
            distance,

        smoothTarget.current.z +
          Math.cos(
            yaw
          ) *
            horizontalDistance
      );

      /* ===================================================
         NUNCA ENTRAR EN EL SUELO
      =================================================== */

      desiredPosition.current.y =
        Math.max(
          desiredPosition.current.y,

          MIN_CAMERA_WORLD_Y
        );

      /* ===================================================
         PUNTO DE MIRADA
      =================================================== */

      lookAtTarget.current.set(
        smoothTarget.current.x,

        smoothTarget.current.y +
          0.9,

        smoothTarget.current.z
      );

      /* ===================================================
         RAYCAST CONTRA ARQUITECTURA
      =================================================== */

      rayDirection.current
        .copy(
          desiredPosition.current
        )
        .sub(
          lookAtTarget.current
        );

      const desiredDistance =
        rayDirection.current
          .length();

      if (
        desiredDistance >
        0.001
      ) {
        rayDirection.current
          .normalize();

        const ray =
          new rapier.Ray(
            {
              x:
                lookAtTarget
                  .current.x,

              y:
                lookAtTarget
                  .current.y,

              z:
                lookAtTarget
                  .current.z,
            },
            {
              x:
                rayDirection
                  .current.x,

              y:
                rayDirection
                  .current.y,

              z:
                rayDirection
                  .current.z,
            }
          );

        const hit =
          world.castRay(
            ray,

            desiredDistance,

            true,

            undefined,
            undefined,
            undefined,

            body
          );

        if (
          hit
        ) {
          const safeDistance =
            Math.max(
              MIN_CAMERA_DISTANCE,

              hit.timeOfImpact -
                CAMERA_WALL_MARGIN
            );

          safePosition.current
            .copy(
              lookAtTarget.current
            )
            .addScaledVector(
              rayDirection.current,

              safeDistance
            );
        } else {
          safePosition.current
            .copy(
              desiredPosition.current
            );
        }
      } else {
        safePosition.current
          .copy(
            desiredPosition.current
          );
      }

      /* ===================================================
         SEGURIDAD VERTICAL DEL RESULTADO
      =================================================== */

      safePosition.current.y =
        Math.max(
          safePosition.current.y,

          MIN_CAMERA_WORLD_Y
        );

      /* ===================================================
         SUAVIZADO
      =================================================== */

      if (
        !cameraInitialized.current
      ) {
        cameraInitialized.current =
          true;

        camera.position.copy(
          safePosition.current
        );
      } else {
        camera.position.lerp(
          safePosition.current,

          1 -
            Math.exp(
              -12 *
                delta
            )
        );
      }

      /* ===================================================
         SEGUNDA COMPROBACIÓN

         Evita atravesar esquinas durante la interpolación.
      =================================================== */

      rayDirection.current
        .copy(
          camera.position
        )
        .sub(
          lookAtTarget.current
        );

      const interpolatedDistance =
        rayDirection.current
          .length();

      if (
        interpolatedDistance >
        0.001
      ) {
        rayDirection.current
          .normalize();

        const finalRay =
          new rapier.Ray(
            {
              x:
                lookAtTarget
                  .current.x,

              y:
                lookAtTarget
                  .current.y,

              z:
                lookAtTarget
                  .current.z,
            },
            {
              x:
                rayDirection
                  .current.x,

              y:
                rayDirection
                  .current.y,

              z:
                rayDirection
                  .current.z,
            }
          );

        const finalHit =
          world.castRay(
            finalRay,

            interpolatedDistance,

            true,

            undefined,
            undefined,
            undefined,

            body
          );

        if (
          finalHit
        ) {
          const finalDistance =
            Math.max(
              MIN_CAMERA_DISTANCE,

              finalHit.timeOfImpact -
                CAMERA_WALL_MARGIN
            );

          camera.position
            .copy(
              lookAtTarget.current
            )
            .addScaledVector(
              rayDirection.current,

              finalDistance
            );
        }
      }

      /* ===================================================
         SEGURIDAD FINAL

         Ni siquiera después del raycast la cámara
         puede quedar debajo del piso.
      =================================================== */

      camera.position.y =
        Math.max(
          camera.position.y,

          MIN_CAMERA_WORLD_Y
        );

      camera.up.set(
        0,
        1,
        0
      );

      camera.lookAt(
        lookAtTarget.current
      );
    }
  );

  return null;
}
