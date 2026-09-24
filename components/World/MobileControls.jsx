"use client";

import {
  useRef,
} from "react";

import {
  playerInput,
} from "./PlayerController";

/* =========================================================
   MOBILE CONTROLS

   IZQUIERDA
   - cruceta visual
   - comportamiento analógico 360°
   - deslizar para dirección / velocidad

   DERECHA
   - arrastrar = cámara
   - doble toque = dash
========================================================= */

const DOUBLE_TAP_TIME = 280;

const TAP_MOVE_LIMIT = 18;

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
     DOBLE TAP
  ======================================================= */

  const lastRightTap =
    useRef(0);

  const rightTouchStart =
    useRef(null);

  /* =======================================================
     JOYSTICK ANALÓGICO

     IMPORTANTE:
     Aunque visualmente ahora sea una cruceta,
     la lógica sigue siendo 100 % analógica.
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

    const maxDistance =
      rect.width *
      0.39;

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

    /* =====================================================
       MOVIMIENTO VISUAL DE LA CRUCETA
    ===================================================== */

    knob.current
      .style.transform =
      `translate(${dx}px, ${dy}px)`;

    /* =====================================================
       INPUT ANALÓGICO REAL
    ===================================================== */

    playerInput.x =
      dx /
      maxDistance;

    playerInput.y =
      -dy /
      maxDistance;
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetJoystick =
    () => {
      playerInput.x = 0;
      playerInput.y = 0;

      if (
        knob.current
      ) {
        knob.current
          .style.transform =
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
         IZQUIERDA
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
         DERECHA
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

          rightTouchStart.current = {
            id:
              touch.identifier,

            x:
              touch.clientX,

            y:
              touch.clientY,

            moved:
              false,
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
      /* ===================================================
         CRUCETA ANALÓGICA
      =================================================== */

      if (
        touch.identifier ===
        joystickTouch.current
      ) {
        updateJoystick(
          touch
        );
      }

      /* ===================================================
         CÁMARA
      =================================================== */

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
          dx *
          0.0035;

        playerInput.lookY +=
          dy *
          0.0028;

        lookTouch.current.x =
          touch.clientX;

        lookTouch.current.y =
          touch.clientY;

        if (
          rightTouchStart
            .current &&
          touch.identifier ===
            rightTouchStart
              .current.id
        ) {
          const totalDX =
            touch.clientX -
            rightTouchStart
              .current.x;

          const totalDY =
            touch.clientY -
            rightTouchStart
              .current.y;

          const totalDistance =
            Math.sqrt(
              totalDX *
                totalDX +
              totalDY *
                totalDY
            );

          if (
            totalDistance >
            TAP_MOVE_LIMIT
          ) {
            rightTouchStart
              .current.moved =
              true;
          }
        }
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
      /* ===================================================
         CRUCETA
      =================================================== */

      if (
        touch.identifier ===
        joystickTouch.current
      ) {
        resetJoystick();
      }

      /* ===================================================
         DERECHA
      =================================================== */

      if (
        lookTouch.current &&
        touch.identifier ===
          lookTouch.current.id
      ) {
        const touchStart =
          rightTouchStart
            .current;

        if (
          touchStart &&
          touchStart.id ===
            touch.identifier &&
          !touchStart.moved
        ) {
          const now =
            performance.now();

          const elapsed =
            now -
            lastRightTap.current;

          /* ===============================================
             DOBLE TAP = DASH
          =============================================== */

          if (
            elapsed > 0 &&
            elapsed <
              DOUBLE_TAP_TIME
          ) {
            playerInput
              .dashRequested =
              true;

            lastRightTap.current =
              0;
          }

          else {
            lastRightTap.current =
              now;
          }
        }

        lookTouch.current =
          null;

        rightTouchStart.current =
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
          ZONA ANALÓGICA IZQUIERDA
      ================================================= */}

      <div
        ref={joystick}
        className="mobile-joystick"
      >
        {/* ===============================================
            CRUCETA VISUAL

            Este elemento se mueve exactamente como
            se movía el joystick circular anterior.
        =============================================== */}

        <div
          ref={knob}
          className="joystick-knob joystick-dpad"
        >
          <div className="joystick-dpad-vertical" />

          <div className="joystick-dpad-horizontal" />

          {/* flechas */}

          <div className="joystick-dpad-arrow joystick-dpad-arrow-up" />

          <div className="joystick-dpad-arrow joystick-dpad-arrow-down" />

          <div className="joystick-dpad-arrow joystick-dpad-arrow-left" />

          <div className="joystick-dpad-arrow joystick-dpad-arrow-right" />

          {/* centro hundido */}

          <div className="joystick-dpad-center" />
        </div>
      </div>

      {/* =================================================
          DERECHA
      ================================================= */}

      <div className="mobile-look">
        Desliza para mirar
      </div>
    </div>
  );
}
