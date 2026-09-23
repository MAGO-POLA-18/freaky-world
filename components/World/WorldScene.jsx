"use client";

import {
  Canvas,
} from "@react-three/fiber";

import {
  Physics,
} from "@react-three/rapier";

import WorldEnvironment from "./WorldEnvironment";
import DynamicSky from "./DynamicSky";
import WorldLighting from "./WorldLighting";
import PlayerController from "./PlayerController";
import CameraRig from "./CameraRig";
import MobileControls from "./MobileControls";

/* =========================================================
   WORLD SCENE
========================================================= */

export default function WorldScene() {
  return (
    <>
      {/* ===================================================
          INSTRUCCIONES DESKTOP
      =================================================== */}

      <div className="instructions">
        WASD para caminar · Shift para sprint · Arrastra para mover la cámara
      </div>

      {/* ===================================================
          MOTOR 3D
      =================================================== */}

      <Canvas
        shadows
        dpr={[1, 1.35]}
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
        {/* CIELO */}

        <DynamicSky />

        {/* ILUMINACIÓN */}

        <WorldLighting />

        {/* =================================================
            FÍSICA
        ================================================= */}

        <Physics
          gravity={[
            0,
            -9.81,
            0,
          ]}
          timeStep={1 / 60}
        >
          <WorldEnvironment />

          <PlayerController />

          <CameraRig />
        </Physics>
      </Canvas>

      {/* ===================================================
          CONTROLES MÓVILES
      =================================================== */}

      <MobileControls />
    </>
  );
}
