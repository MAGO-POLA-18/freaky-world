"use client";

import { RoundedBox } from "@react-three/drei";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — CONTROLLER BASE

   PRUEBA DE ESCALA LIMPIA

   OBJETIVO:

   - una única superficie plana
   - completamente caminable
   - mando claramente legible
   - cruceta/hall a la izquierda
   - botones a la derecha
   - Select / Start en el centro
   - iluminación fuerte temporal
========================================================= */

/* =========================================================
   MANDO
========================================================= */

const CONTROLLER_WIDTH = 320;
const CONTROLLER_DEPTH = 180;

const CONTROLLER_HEIGHT = 2;

const CONTROLLER_TOP_Y = 0;

/* =========================================================
   COLORES FAMILY / FAMICOM INSPIRADOS
========================================================= */

const COLORS = {
  body: "#d8d0c2",
  bodySide: "#bcb2a2",

  burgundy: "#7a2639",
  burgundyDark: "#541b29",

  buttonDark: "#28272a",
  buttonMid: "#464449",

  line: "#9d9180",
};

/* =========================================================
   BOTONES GRANDES

   El tamaño está relacionado con la cruceta/hall.

   No son pequeños botones decorativos:
   en el futuro podrán convertirse en espacios utilizables.
========================================================= */

const ACTION_BUTTON_RADIUS = 25;

const BUTTON_A = [
  102,
  0,
  -22,
];

const BUTTON_B = [
  62,
  0,
  20,
];

/* =========================================================
   BOTÓN A / B
========================================================= */

function ActionButton({
  position,
}) {
  return (
    <group
      position={[
        position[0],
        0,
        position[2],
      ]}
    >
      {/* BASE */}

      <mesh
        position={[
          0,
          0.55,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            ACTION_BUTTON_RADIUS +
              2,
            ACTION_BUTTON_RADIUS +
              2,
            1.1,
            48,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.burgundyDark
          }
          roughness={0.78}
          metalness={0.02}
        />
      </mesh>

      {/* BOTÓN */}

      <mesh
        position={[
          0,
          1.25,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            ACTION_BUTTON_RADIUS,
            ACTION_BUTTON_RADIUS,
            1.5,
            48,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.burgundy
          }
          roughness={0.66}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SELECT / START

   También proporcionados al mando gigante.
========================================================= */

function CenterButton({
  x,
}) {
  return (
    <RoundedBox
      position={[
        x,
        0.55,
        35,
      ]}
      args={[
        29,
        1.1,
        11,
      ]}
      radius={3}
      smoothness={4}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={
          COLORS.buttonDark
        }
        roughness={0.72}
        metalness={0.04}
      />
    </RoundedBox>
  );
}

/* =========================================================
   SUPERFICIE COMPLETA DEL MANDO
========================================================= */

function ControllerBody() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* ===================================================
          CARCASA

          La cara superior queda exactamente en Y = 0.
      =================================================== */}

      <RoundedBox
        position={[
          0,
          -CONTROLLER_HEIGHT /
            2,
          0,
        ]}
        args={[
          CONTROLLER_WIDTH,
          CONTROLLER_HEIGHT,
          CONTROLLER_DEPTH,
        ]}
        radius={10}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={COLORS.body}
          roughness={0.86}
          metalness={0.01}
        />
      </RoundedBox>

      {/* ===================================================
          COLISIÓN ÚNICA

          TODO EL RECTÁNGULO ES CAMINABLE.
      =================================================== */}

      <CuboidCollider
        position={[
          0,
          -CONTROLLER_HEIGHT /
            2,
          0,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          CONTROLLER_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />
    </RigidBody>
  );
}

/* =========================================================
   DETALLES MUY SIMPLES

   Nada de paneles gigantes ni superficies oscuras.

   Solo unas líneas para ayudar a leer el objeto.
========================================================= */

function ControllerDetails() {
  return (
    <group>
      {/* línea superior */}

      <RoundedBox
        position={[
          0,
          0.025,
          -66,
        ]}
        args={[
          250,
          0.05,
          3,
        ]}
        radius={1.2}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            COLORS.burgundy
          }
          roughness={0.82}
        />
      </RoundedBox>

      {/* línea inferior */}

      <RoundedBox
        position={[
          0,
          0.025,
          66,
        ]}
        args={[
          250,
          0.05,
          3,
        ]}
        radius={1.2}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            COLORS.burgundy
          }
          roughness={0.82}
        />
      </RoundedBox>

      {/* botones centrales */}

      <CenterButton
        x={5}
      />

      <CenterButton
        x={40}
      />

      {/* A / B */}

      <ActionButton
        position={BUTTON_A}
      />

      <ActionButton
        position={BUTTON_B}
      />
    </group>
  );
}

/* =========================================================
   WORLD
========================================================= */

export default function WorldEnvironment() {
  return (
    <group>
      {/* ===================================================
          ILUMINACIÓN TEMPORAL DE TRABAJO

          NO reemplaza el cielo.

          Simplemente evita que el mando quede oscuro
          mientras definimos arquitectura y escala.
      =================================================== */}

      <ambientLight
        intensity={2.2}
      />

      <hemisphereLight
        intensity={1.7}
        groundColor="#8d8476"
      />

      <directionalLight
        position={[
          80,
          120,
          70,
        ]}
        intensity={2.3}
        castShadow={false}
      />

      {/* ===================================================
          SUPERFICIE ÚNICA
      =================================================== */}

      <ControllerBody />

      {/* ===================================================
          DETALLES
      =================================================== */}

      <ControllerDetails />

      {/* ===================================================
          CRUCETA / HALL
      =================================================== */}

      <Museum />
    </group>
  );
}
