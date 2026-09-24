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
   - cruceta fija
   - comportamiento analógico 360°
   - cada brazo se hunde según la dirección

   DERECHA
   - arrastrar = cámara
   - doble toque = dash
========================================================= */

const DOUBLE_TAP_TIME = 280;
const TAP_MOVE_LIMIT = 18;

export default function MobileControls() {
  const joystick =
    useRef(null);

  const dpad =
    useRef(null);

  const joystickTouch =
    useRef(null);

  const lookTouch =
    useRef(null);

  const lastRightTap =
    useRef(0);

  const rightTouchStart =
    useRef(null);

  /* =======================================================
     EFECTO VISUAL DE PRESIÓN
  ======================================================= */

  const setDpadPressure = (
    x,
    y
  ) => {
    if (!dpad.current) {
      return;
    }

    /*
      x:
      -1 izquierda
       1 derecha

      y:
      -1 arriba
       1 abajo
    */

    const left =
      Math.max(
        0,
        -x
      );

    const right =
      Math.max(
        0,
        x
      );

    const up =
      Math.max(
        0,
        -y
      );

    const down =
      Math.max(
        0,
        y
      );

    dpad.current.style.setProperty(
      "--press-left",
      left
    );

    dpad.current.style.setProperty(
      "--press-right",
      right
    );

    dpad.current.style.setProperty(
      "--press-up",
      up
    );

    dpad.current.style.setProperty(
      "--press-down",
      down
    );
  };

  /* =======================================================
     JOYSTICK ANALÓGICO
  ======================================================= */

  const updateJoystick = (
    touch
  ) => {
    if (
      !joystick.current
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
      Área útil analógica.

      La cruceta NO se mueve.
      Solo usamos la posición
      del dedo para calcular
      dirección e intensidad.
    */

    const maxDistance =
      rect.width *
      0.42;

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

    const normalizedX =
      dx /
      maxDistance;

    const normalizedY =
      dy /
      maxDistance;

    /* =====================================================
       MOVIMIENTO REAL DEL PERSONAJE
    ===================================================== */

    playerInput.x =
      normalizedX;

    playerInput.y =
      -normalizedY;

    /* =====================================================
       PRESIÓN VISUAL

       Aquí usamos Y normal de pantalla:
       negativo = arriba
       positivo = abajo
    ===================================================== */

    setDpadPressure(
      normalizedX,
      normalizedY
    );
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetJoystick =
    () => {
      playerInput.x = 0;
      playerInput.y = 0;

      setDpadPressure(
        0,
        0
      );

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
          CRUCETA ANALÓGICA FIJA
      ================================================= */}

      <div
        ref={joystick}
        className="mobile-joystick"
      >
        <div
          ref={dpad}
          className="mobile-dpad"
        >
          {/* ARRIBA */}

          <div className="mobile-dpad-arm mobile-dpad-up">
            <span />
          </div>

          {/* ABAJO */}

          <div className="mobile-dpad-arm mobile-dpad-down">
            <span />
          </div>

          {/* IZQUIERDA */}

          <div className="mobile-dpad-arm mobile-dpad-left">
            <span />
          </div>

          {/* DERECHA */}

          <div className="mobile-dpad-arm mobile-dpad-right">
            <span />
          </div>

          {/* CENTRO */}

          <div className="mobile-dpad-center" />
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
