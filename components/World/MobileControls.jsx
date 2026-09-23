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
   - joystick
   - dirección
   - velocidad analógica

   DERECHA
   - arrastrar = cámara
   - doble toque = dash
========================================================= */

const DOUBLE_TAP_TIME = 280;

/*
  Si el dedo se mueve demasiado,
  consideramos que fue un gesto de cámara
  y no un tap.

  Esto evita activar dash mientras
  simplemente estamos girando.
*/

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

  /*
    Guardamos dónde empezó el toque.

    Después podemos distinguir:

    tap real
    vs
    arrastre de cámara.
  */

  const rightTouchStart =
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
      Recorrido amplio para poder
      controlar bien la velocidad.
    */

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

    knob.current
      .style.transform =
      `translate(${dx}px, ${dy}px)`;

    playerInput.x =
      dx /
      maxDistance;

    playerInput.y =
      -dy /
      maxDistance;
  };

  /* =======================================================
     RESET JOYSTICK
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
         JOYSTICK
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
         CÁMARA / TAP
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
         JOYSTICK
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

        /* ===============================================
           DETECTAR SI DEJÓ DE SER TAP
        =============================================== */

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
         JOYSTICK
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
        /* ===============================================
           ¿FUE TAP REAL?
        =============================================== */

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

          /* =============================================
             DOBLE TAP
          ============================================= */

          if (
            elapsed > 0 &&
            elapsed <
              DOUBLE_TAP_TIME
          ) {
            /*
              Solo pedimos el dash.

              PlayerController decidirá
              si corresponde ejecutarlo.
            */

            playerInput
              .dashRequested =
              true;

            /*
              Reiniciamos para evitar
              que tres taps seguidos
              produzcan dos dashes
              accidentalmente.
            */

            lastRightTap.current =
              0;
          }

          /* =============================================
             PRIMER TAP
          ============================================= */

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
          JOYSTICK
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
          DERECHA

          Sin botones.

          Arrastrar = mirar
          doble tap = dash
      ================================================= */}

      <div className="mobile-look">
        Desliza para mirar
      </div>
    </div>
  );
}
