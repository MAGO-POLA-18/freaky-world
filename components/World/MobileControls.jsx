"use client";

import { useRef } from "react";

import {
  playerInput,
} from "./PlayerController";

/* =========================================================
   MOBILE CONTROLS

   Izquierda:
   joystick analógico

   Derecha:
   cámara

   La distancia del joystick al centro controla
   directamente la velocidad.
========================================================= */

export default function MobileControls() {
  const joystick =
    useRef(null);

  const knob =
    useRef(null);

  const joystickTouch =
    useRef(null);

  const lookTouch =
    useRef(null);

  /* =======================================================
     JOYSTICK
  ======================================================= */

  const updateJoystick = (
    touch
  ) => {
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

    /*
      Usamos bastante recorrido.

      Esto da más precisión para distinguir:

      - caminar lento
      - caminar
      - correr
      - sprint
    */

    const maxDistance =
      rect.width * 0.39;

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

  /* =======================================================
     RESET
  ======================================================= */

  const resetJoystick = () => {
    playerInput.x = 0;
    playerInput.y = 0;

    if (knob.current) {
      knob.current.style.transform =
        "translate(0px, 0px)";
    }

    joystickTouch.current =
      null;
  };

  /* =======================================================
     TOUCH START
  ======================================================= */

  const handleTouchStart = (
    event
  ) => {
    event.preventDefault();

    for (
      const touch
      of event.changedTouches
    ) {
      /* ===================================================
         MITAD IZQUIERDA
         MOVIMIENTO
      =================================================== */

      if (
        touch.clientX <
        window.innerWidth *
          0.45
      ) {
        if (
          joystickTouch.current ===
          null
        ) {
          joystickTouch.current =
            touch.identifier;

          updateJoystick(
            touch
          );
        }
      }

      /* ===================================================
         MITAD DERECHA
         CÁMARA
      =================================================== */

      else {
        if (
          lookTouch.current ===
          null
        ) {
          lookTouch.current = {
            id:
              touch.identifier,

            x:
              touch.clientX,

            y:
              touch.clientY,
          };
        }
      }
    }
  };

  /* =======================================================
     TOUCH MOVE
  ======================================================= */

  const handleTouchMove = (
    event
  ) => {
    event.preventDefault();

    for (
      const touch
      of event.changedTouches
    ) {
      /* MOVIMIENTO */

      if (
        touch.identifier ===
        joystickTouch.current
      ) {
        updateJoystick(
          touch
        );
      }

      /* CÁMARA */

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

  /* =======================================================
     TOUCH END
  ======================================================= */

  const handleTouchEnd = (
    event
  ) => {
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
        lookTouch.current =
          null;
      }
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="mobile-controls"
      onTouchStart={
        handleTouchStart
      }
      onTouchMove={
        handleTouchMove
      }
      onTouchEnd={
        handleTouchEnd
      }
      onTouchCancel={
        handleTouchEnd
      }
    >
      {/* =================================================
          JOYSTICK

          El mismo joystick controla
          dirección + velocidad.
      ================================================= */}

      <div
        ref={joystick}
        className="mobile-joystick"
      >
        <div
          ref={knob}
          className="joystick-knob"
        />
      </div>

      {/* =================================================
          ZONA DERECHA
      ================================================= */}

      <div className="mobile-look">
        Desliza para mirar
      </div>
    </div>
  );
}
