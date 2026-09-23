"use client";

import { useEffect, useRef } from "react";
import {
  useFrame,
  useThree,
} from "@react-three/fiber";
import * as THREE from "three";

import {
  playerInput,
  playerRuntime,
} from "./PlayerController";

const CAMERA_DISTANCE = 8.5;
const CAMERA_HEIGHT = 3.4;
const CAMERA_SENSITIVITY = 0.0045;
const MIN_PITCH = -0.35;
const MAX_PITCH = 1.05;

export default function CameraRig() {
  const { gl } = useThree();

  const dragging = useRef(false);
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

  const lookAtTarget = useRef(
    new THREE.Vector3()
  );

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (event) => {
      if (event.button !== 0) return;

      dragging.current = true;
      lastPointer.current.x = event.clientX;
      lastPointer.current.y = event.clientY;

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
        dx * CAMERA_SENSITIVITY;

      playerRuntime.pitch =
        THREE.MathUtils.clamp(
          playerRuntime.pitch +
            dy * CAMERA_SENSITIVITY,
          MIN_PITCH,
          MAX_PITCH
        );

      lastPointer.current.x = event.clientX;
      lastPointer.current.y = event.clientY;
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
    const body = playerRuntime.body;

    if (!body) return;

    const playerPosition =
      body.translation();

    smoothTarget.current.lerp(
      new THREE.Vector3(
        playerPosition.x,
        playerPosition.y + 0.7,
        playerPosition.z
      ),
      1 - Math.exp(-10 * delta)
    );

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

    const yaw = playerRuntime.yaw;
    const pitch = playerRuntime.pitch;

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

    camera.position.lerp(
      desiredPosition.current,
      1 - Math.exp(-8 * delta)
    );

    lookAtTarget.current.set(
      smoothTarget.current.x,
      smoothTarget.current.y + 0.9,
      smoothTarget.current.z
    );

    camera.up.set(0, 1, 0);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
