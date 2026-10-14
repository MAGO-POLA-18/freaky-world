"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  playerInput,
} from "./PlayerController";

/* =========================================================
   MOBILE CONTROLS

   - Cruceta visual, comportamiento analógico 360°
   - Solo el círculo invisible de la cruceta captura movimiento
   - A = interactuar
   - B mantenido = sprint
   - Todo el resto de pantalla queda libre para cámara/zoom
========================================================= */

export default function MobileControls({
  interactionAvailable = false,
}) {
  const joystick =
    useRef(null);

  const dpad =
    useRef(null);

  const joystickPointer =
    useRef(null);

  const sprintPointer =
    useRef(null);

  const [
    sprintPressed,
    setSprintPressed,
  ] = useState(false);

  /* =======================================================
     EFECTO VISUAL CRUCETA
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
    clientX,
    clientY
  ) => {
    if (!joystick.current) {
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
      clientX -
      centerX;

    let dy =
      clientY -
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

    playerInput.x =
      normalizedX;

    playerInput.y =
      -normalizedY;

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

      joystickPointer.current =
        null;

      setDpadPressure(
        0,
        0
      );
    };

  /* =======================================================
     JOYSTICK POINTER
  ======================================================= */

  const handleJoystickDown = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      joystickPointer.current !==
      null
    ) {
      return;
    }

    joystickPointer.current =
      event.pointerId;

    event.currentTarget
      .setPointerCapture?.(
        event.pointerId
      );

    updateJoystick(
      event.clientX,
      event.clientY
    );
  };

  const handleJoystickMove = (
    event
  ) => {
    if (
      event.pointerId !==
      joystickPointer.current
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    updateJoystick(
      event.clientX,
      event.clientY
    );
  };

  const handleJoystickUp = (
    event
  ) => {
    if (
      event.pointerId !==
      joystickPointer.current
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .releasePointerCapture?.(
        event.pointerId
      );

    resetJoystick();
  };

  /* =======================================================
     BOTÓN B — SPRINT MANTENIDO
  ======================================================= */

  const startSprint = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    sprintPointer.current =
      event.pointerId;

    event.currentTarget
      .setPointerCapture?.(
        event.pointerId
      );

    playerInput.sprint =
      true;

    setSprintPressed(
      true
    );
  };

  const stopSprint = (
    event
  ) => {
    if (
      sprintPointer.current !==
      event.pointerId
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    event.currentTarget
      .releasePointerCapture?.(
        event.pointerId
      );

    sprintPointer.current =
      null;

    playerInput.sprint =
      false;

    setSprintPressed(
      false
    );
  };

  /* =======================================================
     BOTÓN A — INTERACTUAR
  ======================================================= */

  const interact = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      !interactionAvailable
    ) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(
        "freaky:interact"
      )
    );
  };

  /* =======================================================
     RESET GENERAL
  ======================================================= */

  useEffect(() => {
    const reset =
      () => {
        resetJoystick();

        playerInput.sprint =
          false;

        sprintPointer.current =
          null;

        setSprintPressed(
          false
        );
      };

    window.addEventListener(
      "blur",
      reset
    );

    window.addEventListener(
      "orientationchange",
      reset
    );

    return () => {
      window.removeEventListener(
        "blur",
        reset
      );

      window.removeEventListener(
        "orientationchange",
        reset
      );

      reset();
    };
  }, []);

  return (
    <div
      className="mobile-controls"
      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          90,

        pointerEvents:
          "none",

        userSelect:
          "none",

        WebkitUserSelect:
          "none",

        WebkitTouchCallout:
          "none",
      }}
    >
      {/* =================================================
          ZONA CIRCULAR INVISIBLE DE MOVIMIENTO

          Solo esta zona captura el dedo izquierdo.
      ================================================= */}

      <div
        ref={joystick}
        className="mobile-joystick"

        onPointerDown={
          handleJoystickDown
        }

        onPointerMove={
          handleJoystickMove
        }

        onPointerUp={
          handleJoystickUp
        }

        onPointerCancel={
          handleJoystickUp
        }

        style={{
          pointerEvents:
            "auto",

          touchAction:
            "none",
        }}
      >
        <div
          ref={dpad}
          className="mobile-dpad"
        >
          <div className="mobile-dpad-arm mobile-dpad-up">
            <span />
          </div>

          <div className="mobile-dpad-arm mobile-dpad-down">
            <span />
          </div>

          <div className="mobile-dpad-arm mobile-dpad-left">
            <span />
          </div>

          <div className="mobile-dpad-arm mobile-dpad-right">
            <span />
          </div>

          <div className="mobile-dpad-center" />
        </div>
      </div>

      {/* =================================================
          BOTONES A / B
      ================================================= */}

      <div
        className="mobile-action-buttons"
        style={{
          pointerEvents:
            "none",
        }}
      >
        {/* B */}

        <button
          type="button"
          className={[
            "mobile-game-button",
            "mobile-game-button-b",
            sprintPressed
              ? "is-pressed"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}

          aria-label="Sprint"

          onPointerDown={
            startSprint
          }

          onPointerUp={
            stopSprint
          }

          onPointerCancel={
            stopSprint
          }

          style={{
            pointerEvents:
              "auto",

            touchAction:
              "none",
          }}
        >
          B
        </button>

        {/* A */}

        <button
          type="button"
          className={[
            "mobile-game-button",
            "mobile-game-button-a",
            interactionAvailable
              ? "is-active"
              : "is-disabled",
          ]
            .filter(Boolean)
            .join(" ")}

          aria-label="Interactuar"

          onPointerDown={
            interact
          }

          style={{
            pointerEvents:
              "auto",

            touchAction:
              "none",
          }}
        >
          A
        </button>
      </div>
    </div>
  );
}
