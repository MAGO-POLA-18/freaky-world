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

export default function CameraRig() {
  const { gl } = useThree();

  const dragging = useRef(false);
  const initialized = useRef(false);

  const smoothTarget = useRef(
    new THREE.Vector3()
  );

  const smoothCamera = useRef(
    new THREE.Vector3()
  );

  const rawTarget = useRef(
    new THREE.Vector3()
  );

  const desiredCamera = useRef(
    new THREE.Vector3()
  );

  useEffect(() => {
    const mouseDown = (event) => {
      if (event.button === 0) {
        dragging.current = true;
      }
    };

    const mouseUp = () => {
      dragging.current = false;
    };

    const mouseMove = (event) => {
      if (!dragging.current) return;

      playerRuntime.yaw -=
        event.movementX * 0.004;

      playerRuntime.pitch +=
        event.movementY * 0.003;

      playerRuntime.pitch =
        THREE.MathUtils.clamp(
          playerRuntime.pitch,
          -0.4,
          1.15
        );
    };

    gl.domElement.addEventListener(
      "mousedown",
      mouseDown
    );

    window.addEventListener(
      "mouseup",
      mouseUp
    );

    window.addEventListener(
      "mousemove",
      mouseMove
    );

    return () => {
      gl.domElement.removeEventListener(
        "mousedown",
        mouseDown
      );

      window.removeEventListener(
        "mouseup",
        mouseUp
      );

      window.removeEventListener(
        "mousemove",
        mouseMove
      );
    };
  }, [gl]);

  useFrame(({ camera }, delta) => {
    const body = playerRuntime.body;

    if (!body) return;

    playerRuntime.yaw -=
      playerInput.lookX;

    playerRuntime.pitch +=
      playerInput.lookY;

    playerRuntime.pitch =
      THREE.MathUtils.clamp(
        playerRuntime.pitch,
        -0.4,
        1.15
      );

    playerInput.lookX = 0;
    playerInput.lookY = 0;

    const position = body.translation();

    rawTarget.current.set(
      position.x,
      position.y + 1.25,
      position.z
    );

    if (!initialized.current) {
      smoothTarget.current.copy(
        rawTarget.current
      );

      smoothCamera.current.set(
        position.x,
        position.y + 2.8,
        position.z + 5
      );

      initialized.current = true;
    }

    const targetSmoothing =
      1 - Math.exp(-14 * delta);

    smoothTarget.current.lerp(
      rawTarget.current,
      targetSmoothing
    );

    const yaw = playerRuntime.yaw;
    const pitch = playerRuntime.pitch;

    const distance = 5;
    const baseHeight = 1.5;

    const horizontalDistance =
      Math.cos(pitch) * distance;

    const verticalDistance =
      Math.sin(pitch) * distance;

    desiredCamera.current.set(
      smoothTarget.current.x +
        Math.sin(yaw) *
          horizontalDistance,

      smoothTarget.current.y +
        baseHeight +
        verticalDistance,

      smoothTarget.current.z +
        Math.cos(yaw) *
          horizontalDistance
    );

    const cameraSmoothing =
      1 - Math.exp(-9 * delta);

    smoothCamera.current.lerp(
      desiredCamera.current,
      cameraSmoothing
    );

    camera.position.copy(
      smoothCamera.current
    );

    camera.lookAt(
      smoothTarget.current
    );
  });

  return null;
}
