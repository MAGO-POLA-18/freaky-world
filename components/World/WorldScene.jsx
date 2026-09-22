"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";

import Museum from "../Museum/Museum";

import DynamicSky from "./DynamicSky";
import WorldLighting from "./WorldLighting";
import PlayerController from "./PlayerController";
import CameraRig from "./CameraRig";
import MobileControls from "./MobileControls";

/* =========================================================
   WORLD SCENE

   Orquestador principal de Freaky World.

   Este archivo NO implementa los sistemas.
   Únicamente compone:

   - render 3D
   - cielo
   - iluminación
   - física
   - mundo
   - jugador
   - cámara
   - controles

========================================================= */

export default function WorldScene() {
  return (
    <>
      {/* ===================================================
          UI DESKTOP
      =================================================== */}

      <div className="instructions">
        WASD para caminar · Mantén clic izquierdo y arrastra para mover la cámara
      </div>

      {/* ===================================================
          MOTOR 3D
      =================================================== */}

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
          powerPreference:
            "high-performance",
        }}
      >
        {/* ===============================================
            ENTORNO
        =============================================== */}

        <DynamicSky />

        <WorldLighting />

        {/* ===============================================
            MUNDO FÍSICO
        =============================================== */}

        <Physics
          gravity={[0, -9.81, 0]}
          timeStep={1 / 60}
        >
          <Museum />

          <PlayerController />
        </Physics>

        {/* ===============================================
            CÁMARA
        =============================================== */}

        <CameraRig />
      </Canvas>

      {/* ===================================================
          CONTROLES MÓVILES
      =================================================== */}

      <MobileControls />
    </>
  );
}
