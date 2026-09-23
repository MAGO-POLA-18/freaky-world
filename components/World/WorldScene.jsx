"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Canvas,
} from "@react-three/fiber";

import {
  Physics,
} from "@react-three/rapier";

import WorldEnvironment from "./WorldEnvironment";
import DynamicSky from "./DynamicSky";
import WorldLighting from "./WorldLighting";
import PlayerController, {
  playerInput,
} from "./PlayerController";

import CameraRig from "./CameraRig";
import MobileControls from "./MobileControls";
import RankingOverlay from "./RankingOverlay";

/* =========================================================
   WORLD SCENE
========================================================= */

export default function WorldScene() {
  const [
    terminalNear,
    setTerminalNear,
  ] = useState(false);

  const [
    rankingOpen,
    setRankingOpen,
  ] = useState(false);

  /* =======================================================
     ABRIR RANKING
  ======================================================= */

  const openRanking =
    useCallback(() => {
      playerInput.x = 0;
      playerInput.y = 0;

      playerInput
        .dashRequested =
        false;

      playerInput.uiLocked =
        true;

      setRankingOpen(true);
    }, []);

  /* =======================================================
     CERRAR
  ======================================================= */

  const closeRanking =
    useCallback(() => {
      playerInput.uiLocked =
        false;

      setRankingOpen(false);
    }, []);

  /* =======================================================
     EVENTO DE PROXIMIDAD
  ======================================================= */

  useEffect(() => {
    const handleTerminalNear =
      (event) => {
        setTerminalNear(
          Boolean(
            event.detail
              ?.near
          )
        );
      };

    window.addEventListener(
      "freaky:retro-terminal-near",
      handleTerminalNear
    );

    return () => {
      window.removeEventListener(
        "freaky:retro-terminal-near",
        handleTerminalNear
      );
    };
  }, []);

  /* =======================================================
     TECLADO

     E = abrir
     ESC = cerrar
  ======================================================= */

  useEffect(() => {
    const handleKey =
      (event) => {
        if (
          event.code ===
            "KeyE" &&
          terminalNear &&
          !rankingOpen
        ) {
          openRanking();
        }

        if (
          event.code ===
            "Escape" &&
          rankingOpen
        ) {
          closeRanking();
        }
      };

    window.addEventListener(
      "keydown",
      handleKey
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKey
      );
    };
  }, [
    terminalNear,
    rankingOpen,
    openRanking,
    closeRanking,
  ]);

  /* =======================================================
     CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      playerInput.uiLocked =
        false;
    };
  }, []);

  return (
    <>
      {/* ===================================================
          INSTRUCCIONES DESKTOP
      =================================================== */}

      {!rankingOpen && (
        <div className="instructions">
          WASD para caminar · Shift para sprint · Arrastra para mover la cámara
        </div>
      )}

      {/* ===================================================
          MOTOR 3D
      =================================================== */}

      <Canvas
        shadows
        dpr={[
          1,
          1.35,
        ]}
        camera={{
          position: [
            0,
            3,
            6,
          ],

          fov: 60,
          near: 0.1,
          far: 600,
        }}
        gl={{
          antialias: true,

          powerPreference:
            "high-performance",
        }}
      >
        <DynamicSky />

        <WorldLighting />

        <Physics
          gravity={[
            0,
            -9.81,
            0,
          ]}
          timeStep={
            1 / 60
          }
        >
          <WorldEnvironment />

          <PlayerController />

          <CameraRig />
        </Physics>
      </Canvas>

      {/* ===================================================
          CONTROLES MÓVILES

          Cuando abrimos 2D desaparecen.
      =================================================== */}

      {!rankingOpen && (
        <MobileControls />
      )}

      {/* ===================================================
          AVISO DE INTERACCIÓN
      =================================================== */}

      {terminalNear &&
        !rankingOpen && (
          <button
            type="button"
            className="world-interaction-button"
            onClick={
              openRanking
            }
          >
            <span className="world-interaction-icon">
              R
            </span>

            <span>
              Abrir Ranking
            </span>

            <small>
              E
            </small>
          </button>
        )}

      {/* ===================================================
          INTERFAZ 2D
      =================================================== */}

      {rankingOpen && (
        <RankingOverlay
          onClose={
            closeRanking
          }
        />
      )}
    </>
  );
}
