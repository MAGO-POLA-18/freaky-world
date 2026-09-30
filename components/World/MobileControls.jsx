"use client";

import {
  useEffect,
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

   WEB / IOS
   - sin selección azul
   - sin callout de mantener pulsado
   - sin drag accidental
   - resetea touches al girar pantalla
========================================================= */

const DOUBLE_TAP_TIME = 280;
const TAP_MOVE_LIMIT = 18;

export default function MobileControls() {
  const controlsRef =
    useRef(null);

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

    /* MOVIMIENTO */

    playerInput.x =
      normalizedX;

    playerInput.y =
      -normalizedY;

    /* PRESIÓN VISUAL */

    setDpadPressure(
      normalizedX,
      normalizedY
    );
  };

  /* =======================================================
     RESET JOYSTICK
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
     RESET COMPLETO DE TOUCH

     Útil al:
     - girar dispositivo
     - cancelar gesto
     - perder foco
  ======================================================= */

  const resetTouches =
    () => {
      resetJoystick();

      lookTouch.current =
        null;

      rightTouchStart.current =
        null;

      lastRightTap.current =
        0;

      playerInput.dashRequested =
        false;
    };

  /* =======================================================
     ORIENTACIÓN / FOCUS

     Evita que un dedo quede "enganchado"
     después de vertical ↔ horizontal.
  ======================================================= */

  useEffect(() => {
    function resetAfterViewportChange() {
      resetTouches();
    }

    function handleBlur() {
      resetTouches();
    }

    window.addEventListener(
      "orientationchange",
      resetAfterViewportChange
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      window.removeEventListener(
        "orientationchange",
        resetAfterViewportChange
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );
    };
  }, []);

  /* =======================================================
     EVITAR SELECCIÓN / CALLOUT IOS

     Solo dentro de los controles del mundo.
     No afecta fichas, buscadores ni overlays.
  ======================================================= */

  useEffect(() => {
    const element =
      controlsRef.current;

    if (!element) {
      return;
    }

    function preventContextMenu(
      event
    ) {
      event.preventDefault();
    }

    function preventSelect(
      event
    ) {
      event.preventDefault();
    }

    function preventDrag(
      event
    ) {
      event.preventDefault();
    }

    element.addEventListener(
      "contextmenu",
      preventContextMenu
    );

    element.addEventListener(
      "selectstart",
      preventSelect
    );

    element.addEventListener(
      "dragstart",
      preventDrag
    );

    return () => {
      element.removeEventListener(
        "contextmenu",
        preventContextMenu
      );

      element.removeEventListener(
        "selectstart",
        preventSelect
      );

      element.removeEventListener(
        "dragstart",
        preventDrag
      );
    };
  }, []);

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
      /* IZQUIERDA */

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

      /* DERECHA */

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
      /* CRUCETA */

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
          rightTouchStart.current &&
          touch.identifier ===
            rightTouchStart.current.id
        ) {
          const totalDX =
            touch.clientX -
            rightTouchStart.current.x;

          const totalDY =
            touch.clientY -
            rightTouchStart.current.y;

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
            rightTouchStart.current.moved =
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
    event.preventDefault();

    for (
      const touch
      of event.changedTouches
    ) {
      /* CRUCETA */

      if (
        touch.identifier ===
        joystickTouch.current
      ) {
        resetJoystick();
      }

      /* DERECHA */

      if (
        lookTouch.current &&
        touch.identifier ===
          lookTouch.current.id
      ) {
        const touchStart =
          rightTouchStart.current;

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
            playerInput.dashRequested =
              true;

            lastRightTap.current =
              0;
          } else {
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
     TOUCH CANCEL
  ======================================================= */

  const handleTouchCancel =
    (event) => {
      event.preventDefault();

      resetTouches();
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      ref={
        controlsRef
      }
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
        handleTouchCancel
      }

      style={{
        /*
          Hace que la zona jugable se comporte
          como una superficie de control y no
          como una página web seleccionable.
        */

        userSelect:
          "none",

        WebkitUserSelect:
          "none",

        WebkitTouchCallout:
          "none",

        touchAction:
          "none",

        WebkitTapHighlightColor:
          "transparent",
      }}
    >
      {/* =================================================
          CRUCETA ANALÓGICA FIJA
      ================================================= */}

      <div
        ref={
          joystick
        }
        className="mobile-joystick"

        style={{
          userSelect:
            "none",

          WebkitUserSelect:
            "none",

          WebkitTouchCallout:
            "none",

          touchAction:
            "none",
        }}
      >
        <div
          ref={
            dpad
          }
          className="mobile-dpad"

          style={{
            userSelect:
              "none",

            WebkitUserSelect:
              "none",

            WebkitTouchCallout:
              "none",

            touchAction:
              "none",
          }}
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

      <div
        className="mobile-look"

        style={{
          userSelect:
            "none",

          WebkitUserSelect:
            "none",

          WebkitTouchCallout:
            "none",

          touchAction:
            "none",

          pointerEvents:
            "none",
        }}
      >
        Desliza para mirar
      </div>
    </div>
  );
}
