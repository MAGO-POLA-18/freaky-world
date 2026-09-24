"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import * as THREE from "three";

import {
  playerInput,
  playerRuntime,
} from "./PlayerController";

const CAMERA_DISTANCE = 8.5;
const CAMERA_HEIGHT = 3.4;
const CAMERA_SENSITIVITY = 0.0045;

/*
  Mucho más rango vertical.

  -1.38 rad ≈ mirar casi verticalmente hacia arriba.
   1.20 rad ≈ mirar bastante hacia abajo.

  No llegamos a ±90° para evitar invertir la cámara.
*/
const MIN_PITCH = -1.38;
const MAX_PITCH = 1.20;

const CAMERA_WALL_MARGIN = 0.45;
const MIN_CAMERA_DISTANCE = 1.4;

export default function CameraRig() {
  const { gl } = useThree();
  const { world, rapier } = useRapier();

  const dragging = useRef(false);
  const initialized = useRef(false);
  const cameraInitialized = useRef(false);

  const lastPointer = useRef({
    x: 0,
    y: 0,
  });

  const smoothTarget = useRef(
    new THREE.Vector3()
  );

  const desiredPosition = useRef(
    new THREE.Vector3()
  );

  const safePosition = useRef(
    new THREE.Vector3()
  );

  const lookAtTarget = useRef(
    new THREE.Vector3()
  );

  const rayDirection = useRef(
    new THREE.Vector3()
  );

  const targetPosition = useRef(
    new THREE.Vector3()
  );

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (event) => {
      if (event.button !== 0) return;

      dragging.current = true;

      lastPointer.current.x =
        event.clientX;

      lastPointer.current.y =
        event.clientY;

      canvas.setPointerCapture?.(
        event.pointerId
      );
    };

    const onPointerMove = (event) => {
      if (!dragging.current) return;

      const dx =
        event.clientX -
        lastPointer.current.x;

      const dy =
        event.clientY -
        lastPointer.current.y;

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

    const stopDragging = (event) => {
      dragging.current = false;

      canvas.releasePointerCapture?.(
        event.pointerId
      );
    };

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
      stopDragging
    );

    canvas.addEventListener(
      "pointercancel",
      stopDragging
    );

    canvas.addEventListener(
      "pointerleave",
      stopDragging
    );

    return () => {
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
        stopDragging
      );

      canvas.removeEventListener(
        "pointercancel",
        stopDragging
      );

      canvas.removeEventListener(
        "pointerleave",
        stopDragging
      );
    };
  }, [gl]);

  useFrame(({ camera }, delta) => {
    const body =
      playerRuntime.body;

    if (!body) return;

    const playerPosition =
      body.translation();

    targetPosition.current.set(
      playerPosition.x,
      playerPosition.y + 0.7,
      playerPosition.z
    );

    if (!initialized.current) {
      initialized.current = true;

      smoothTarget.current.copy(
        targetPosition.current
      );
    } else {
      smoothTarget.current.lerp(
        targetPosition.current,
        1 -
          Math.exp(
            -12 * delta
          )
      );
    }

    /* MÓVIL */

    if (playerInput.lookX !== 0) {
      playerRuntime.yaw -=
        playerInput.lookX;

      playerInput.lookX = 0;
    }

    if (playerInput.lookY !== 0) {
      playerRuntime.pitch =
        THREE.MathUtils.clamp(
          playerRuntime.pitch +
            playerInput.lookY,
          MIN_PITCH,
          MAX_PITCH
        );

      playerInput.lookY = 0;
    }

    const yaw =
      playerRuntime.yaw;

    const pitch =
      playerRuntime.pitch;

    const horizontalDistance =
      CAMERA_DISTANCE *
      Math.cos(pitch);

    desiredPosition.current.set(
      smoothTarget.current.x +
        Math.sin(yaw) *
          horizontalDistance,

      smoothTarget.current.y +
        CAMERA_HEIGHT +
        Math.sin(pitch) *
          CAMERA_DISTANCE,

      smoothTarget.current.z +
        Math.cos(yaw) *
          horizontalDistance
    );

    lookAtTarget.current.set(
      smoothTarget.current.x,
      smoothTarget.current.y + 0.9,
      smoothTarget.current.z
    );

    rayDirection.current
      .copy(desiredPosition.current)
      .sub(lookAtTarget.current);

    const desiredDistance =
      rayDirection.current.length();

    if (desiredDistance > 0.001) {
      rayDirection.current.normalize();

      const ray =
        new rapier.Ray(
          {
            x: lookAtTarget.current.x,
            y: lookAtTarget.current.y,
            z: lookAtTarget.current.z,
          },
          {
            x: rayDirection.current.x,
            y: rayDirection.current.y,
            z: rayDirection.current.z,
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

      if (hit) {
        const safeDistance =
          Math.max(
            MIN_CAMERA_DISTANCE,

            hit.timeOfImpact -
              CAMERA_WALL_MARGIN
          );

        safePosition.current
          .copy(lookAtTarget.current)
          .addScaledVector(
            rayDirection.current,
            safeDistance
          );
      } else {
        safePosition.current.copy(
          desiredPosition.current
        );
      }
    } else {
      safePosition.current.copy(
        desiredPosition.current
      );
    }

    if (!cameraInitialized.current) {
      cameraInitialized.current = true;

      camera.position.copy(
        safePosition.current
      );
    } else {
      camera.position.lerp(
        safePosition.current,
        1 -
          Math.exp(
            -12 * delta
          )
      );
    }

    camera.up.set(
      0,
      1,
      0
    );

    camera.lookAt(
      lookAtTarget.current
    );
  });

  return null;
}
