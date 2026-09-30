"use client";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — BASE DEL JOYSTICK

   ETAPA ESTRUCTURAL

   - base rectangular visible
   - superficie plana
   - superficie caminable
   - color tipo joystick / Family Game
   - cruceta/hall a la izquierda
   - sin botones todavía
========================================================= */

/* =========================================================
   DIMENSIONES
========================================================= */

const CONTROLLER_WIDTH = 340;
const CONTROLLER_DEPTH = 150;
const CONTROLLER_HEIGHT = 2;

/* =========================================================
   SEGURIDAD
========================================================= */

const SAFETY_HEIGHT = 12;
const SAFETY_THICKNESS = 1;

/* =========================================================
   COLORES TIPO JOYSTICK
========================================================= */

const COLORS = {
  top: "#d8cfbf",
  side: "#a79b8b",

  burgundy: "#8c3146",
  burgundyDark: "#682434",
};

/* =========================================================
   CUERPO DEL JOYSTICK
========================================================= */

function ControllerBase() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* ===================================================
          BASE PRINCIPAL
      =================================================== */}

      <mesh
        position={[
          0,
          -CONTROLLER_HEIGHT / 2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            CONTROLLER_WIDTH,
            CONTROLLER_HEIGHT,
            CONTROLLER_DEPTH,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.top}
          roughness={0.88}
          metalness={0}
        />
      </mesh>

      {/* ===================================================
          FRANJA BORDÓ SUPERIOR

          Solo visual.
          No afecta la física.
      =================================================== */}

      <mesh
        position={[
          0,
          0.03,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            CONTROLLER_WIDTH - 36,
            0.06,
            18,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.8}
          metalness={0.02}
        />
      </mesh>

      {/* ===================================================
          COLISIÓN GENERAL
      =================================================== */}

      <CuboidCollider
        position={[
          0,
          -CONTROLLER_HEIGHT / 2,
          0,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          CONTROLLER_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />

      {/* ===================================================
          BORDES INVISIBLES
      =================================================== */}

      {/* NORTE */}
      <CuboidCollider
        position={[
          0,
          SAFETY_HEIGHT / 2,
          -CONTROLLER_DEPTH / 2 +
            SAFETY_THICKNESS / 2,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          SAFETY_HEIGHT / 2,
          SAFETY_THICKNESS / 2,
        ]}
      />

      {/* SUR */}
      <CuboidCollider
        position={[
          0,
          SAFETY_HEIGHT / 2,
          CONTROLLER_DEPTH / 2 -
            SAFETY_THICKNESS / 2,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          SAFETY_HEIGHT / 2,
          SAFETY_THICKNESS / 2,
        ]}
      />

      {/* IZQUIERDA */}
      <CuboidCollider
        position={[
          -CONTROLLER_WIDTH / 2 +
            SAFETY_THICKNESS / 2,
          SAFETY_HEIGHT / 2,
          0,
        ]}
        args={[
          SAFETY_THICKNESS / 2,
          SAFETY_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />

      {/* DERECHA */}
      <CuboidCollider
        position={[
          CONTROLLER_WIDTH / 2 -
            SAFETY_THICKNESS / 2,
          SAFETY_HEIGHT / 2,
          0,
        ]}
        args={[
          SAFETY_THICKNESS / 2,
          SAFETY_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />
    </RigidBody>
  );
}

/* =========================================================
   ILUMINACIÓN DE TRABAJO
========================================================= */

function WorkLights() {
  return (
    <>
      <ambientLight
        intensity={2.5}
      />

      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#c6bbab"
        intensity={1.8}
      />

      <directionalLight
        position={[
          90,
          120,
          70,
        ]}
        intensity={2.2}
        castShadow={false}
      />

      <directionalLight
        position={[
          -80,
          60,
          -70,
        ]}
        intensity={0.8}
        castShadow={false}
      />
    </>
  );
}

/* =========================================================
   WORLD ENVIRONMENT
========================================================= */

export default function WorldEnvironment() {
  return (
    <group>
      <WorkLights />

      <ControllerBase />

      <Museum />
    </group>
  );
}
