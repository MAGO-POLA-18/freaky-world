"use client";

import { RoundedBox } from "@react-three/drei";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — BASE DEL MANDO

   PRUEBA ESTRUCTURAL LIMPIA

   OBJETIVO:
   - una sola superficie rectangular
   - completamente plana
   - totalmente caminable
   - imposible caerse por los bordes
   - proporciones similares a un mando Family/NES
   - cruceta/hall a la izquierda
   - SIN botones todavía
   - SIN decoraciones todavía
========================================================= */

/* =========================================================
   PROPORCIÓN DEL MANDO

   Aproximadamente 2.25 : 1

   340 x 150
========================================================= */

const CONTROLLER_WIDTH = 340;
const CONTROLLER_DEPTH = 150;

const CONTROLLER_HEIGHT = 2;

/*
  La superficie caminable queda exactamente en Y = 0.
*/

const TOP_Y = 0;

/* =========================================================
   BORDE DE SEGURIDAD

   Es invisible.

   Evita que el jugador pueda abandonar el mando
   mientras diseñamos la estructura.
========================================================= */

const SAFETY_WALL_HEIGHT = 10;
const SAFETY_WALL_THICKNESS = 1;

/* =========================================================
   COLORES TEMPORALES

   Queremos máxima lectura visual.
========================================================= */

const COLORS = {
  body: "#d8d1c3",
  side: "#b9afa0",
};

/* =========================================================
   CUERPO DEL MANDO
========================================================= */

function ControllerBase() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* ===================================================
          SUPERFICIE VISUAL

          Un único bloque.
          Sin placas.
          Sin niveles.
          Sin agujeros.
      =================================================== */}

      <RoundedBox
        position={[
          0,
          TOP_Y -
            CONTROLLER_HEIGHT / 2,
          0,
        ]}
        args={[
          CONTROLLER_WIDTH,
          CONTROLLER_HEIGHT,
          CONTROLLER_DEPTH,
        ]}
        radius={7}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={COLORS.body}
          roughness={0.88}
          metalness={0}
        />
      </RoundedBox>

      {/* ===================================================
          SUELO FÍSICO

          Todo el rectángulo tiene física.
      =================================================== */}

      <CuboidCollider
        position={[
          0,
          TOP_Y -
            CONTROLLER_HEIGHT / 2,
          0,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          CONTROLLER_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />

      {/* ===================================================
          LÍMITES INVISIBLES

          NORTE
      =================================================== */}

      <CuboidCollider
        position={[
          0,
          SAFETY_WALL_HEIGHT / 2,
          -CONTROLLER_DEPTH / 2 +
            SAFETY_WALL_THICKNESS / 2,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          SAFETY_WALL_HEIGHT / 2,
          SAFETY_WALL_THICKNESS / 2,
        ]}
      />

      {/* SUR */}

      <CuboidCollider
        position={[
          0,
          SAFETY_WALL_HEIGHT / 2,
          CONTROLLER_DEPTH / 2 -
            SAFETY_WALL_THICKNESS / 2,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          SAFETY_WALL_HEIGHT / 2,
          SAFETY_WALL_THICKNESS / 2,
        ]}
      />

      {/* IZQUIERDA */}

      <CuboidCollider
        position={[
          -CONTROLLER_WIDTH / 2 +
            SAFETY_WALL_THICKNESS / 2,
          SAFETY_WALL_HEIGHT / 2,
          0,
        ]}
        args={[
          SAFETY_WALL_THICKNESS / 2,
          SAFETY_WALL_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />

      {/* DERECHA */}

      <CuboidCollider
        position={[
          CONTROLLER_WIDTH / 2 -
            SAFETY_WALL_THICKNESS / 2,
          SAFETY_WALL_HEIGHT / 2,
          0,
        ]}
        args={[
          SAFETY_WALL_THICKNESS / 2,
          SAFETY_WALL_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />
    </RigidBody>
  );
}

/* =========================================================
   ILUMINACIÓN TEMPORAL DE TRABAJO

   No buscamos todavía ambiente bonito.

   Buscamos VER:
   - superficie
   - avatar
   - edificio
   - proporciones
========================================================= */

function WorkLights() {
  return (
    <>
      <ambientLight
        intensity={3}
      />

      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#d8d1c3"
        intensity={2.5}
      />

      <directionalLight
        position={[
          80,
          120,
          60,
        ]}
        intensity={2.8}
        castShadow={false}
      />

      <directionalLight
        position={[
          -90,
          70,
          -50,
        ]}
        intensity={1.3}
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

      {/* SUPERFICIE ÚNICA */}

      <ControllerBase />

      {/* CRUCETA / HALL */}

      <Museum />
    </group>
  );
}
