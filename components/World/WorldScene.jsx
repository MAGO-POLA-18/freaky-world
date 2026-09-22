"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { useRef } from "react";

import Museum from "../Museum/Museum";
import DynamicSky from "./DynamicSky";
import WorldLighting from "./WorldLighting";
import PlayerController, {
  playerInput,
} from "./PlayerController";
import CameraRig from "./CameraRig";

function MobileControls() {
  const joystick = useRef();
  const knob = useRef();

  const joystickTouch =
    useRef(null);

  const lookTouch =
    useRef(null);

  const updateJoystick = (touch) => {
    if (
      !joystick.current ||
      !knob.current
    ) {
      return;
    }

    const rect =
      joystick.current
        .getBoundingClientRect();

    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    let dx =
      touch.clientX -
      centerX;

    let dy =
      touch.clientY -
      centerY;

    const maxDistance =
      rect.width * 0.34;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (
      distance >
      maxDistance
    ) {
      dx =
        (dx / distance) *
        maxDistance;

      dy =
        (dy / distance) *
        maxDistance;
    }

    knob.current.style.transform =
      `translate(${dx}px, ${dy}px)`;

    playerInput.x =
      dx / maxDistance;

    playerInput.y =
      -dy / maxDistance;
  };

  const resetJoystick = () => {
    playerInput.x = 0;
    playerInput.y = 0;

    if (knob.current) {
      knob.current.style.transform =
        "translate(0px, 0px)";
    }

    joystickTouch.current = null;
  };

  const handleTouchStart = (event) => {
    event.preventDefault();

    for (
      const touch
      of event.changedTouches
    ) {
      if (
        touch.clientX <
        window.innerWidth * 0.45
      ) {
        if (
          joystickTouch.current ===
          null
        ) {
          joystickTouch.current =
            touch.identifier;

          updateJoystick(touch);
        }
      } else {
        if (
          lookTouch.current ===
          null
        ) {
          lookTouch.current = {
            id: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
          };
        }
      }
    }
  };

  const handleTouchMove = (event) => {
    event.preventDefault();

    for (
      const touch
      of event.changedTouches
    ) {
      if (
        touch.identifier ===
        joystickTouch.current
      ) {
        updateJoystick(touch);
      }

      if (
        lookTouch.current &&
        touch.identifier ===
          lookTouch.current.id
      ) {
        const dx =
          touch.clientX -
          lookTouch.current.x;

        const dy =
          touch.clientY -
          lookTouch.current.y;

        playerInput.lookX +=
          dx * 0.0035;

        playerInput.lookY +=
          dy * 0.0028;

        lookTouch.current.x =
          touch.clientX;

        lookTouch.current.y =
          touch.clientY;
      }
    }
  };

  const handleTouchEnd = (event) => {
    for (
      const touch
      of event.changedTouches
    ) {
      if (
        touch.identifier ===
        joystickTouch.current
      ) {
        resetJoystick();
      }

      if (
        lookTouch.current &&
        touch.identifier ===
          lookTouch.current.id
      ) {
        lookTouch.current = null;
      }
    }
  };

  return (
    <div
      className="mobile-controls"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        ref={joystick}
        className="mobile-joystick"
      >
        <div
          ref={knob}
          className="joystick-knob"
        />
      </div>

      <div className="mobile-look">
        Desliza para mirar
      </div>
    </div>
  );
}

export default function WorldScene() {
  return (
    <>
      <div className="instructions">
        WASD para caminar · Mantén clic izquierdo y arrastra para mover la cámara
      </div>

      <Canvas
        shadows
        dpr={[1, 1.35]}
        camera={{
          position: [0, 3, 6],
          fov: 60,
          near: 0.1,
          far: 600,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <DynamicSky />

        <WorldLighting />

        <Physics
          gravity={[0, -9.81, 0]}
          timeStep={1 / 60}
        >
          <Museum />
          <PlayerController />
        </Physics>

        <CameraRig />
      </Canvas>

      <MobileControls />
    </>
  );
}
