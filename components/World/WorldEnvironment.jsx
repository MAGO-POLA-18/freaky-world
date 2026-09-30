"use client";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — BASE DEL JOYSTICK

   ETAPA ESTRUCTURAL

   AHORA:
   - rectángulo perfectamente plano
   - superficie visible
   - superficie completamente caminable
   - límites invisibles
   - cruceta/hall colocada a la izquierda
   - sin botones todavía

   MÁS ADELANTE:
   - esquinas redondeadas
   - botones
   - Select / Start
   - detalles Family Game
========================================================= */

/* =========================================================
   DIMENSIONES DEL JOYSTICK

   Proporción horizontal aproximada:
   340 x 150
========================================================= */

const CONTROLLER_WIDTH = 340;
const CONTROLLER_DEPTH = 150;

/*
  Espesor físico del mando.

  La cara superior queda en Y = 0.
*/

const CONTROLLER_HEIGHT = 2;

/* =========================================================
   SEGURIDAD

   Paredes invisibles alrededor del perímetro.

   Evitan que el jugador pueda caminar fuera
   de la superficie mientras diseñamos.
========================================================= */

const SAFETY_HEIGHT = 12;
const SAFETY_THICKNESS = 1;

/* =========================================================
   COLORES TEMPORALES
========================================================= */

const COLORS = {
  top: "#d8d1c3",
  side: "#a89e90",
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
          BLOQUE VISUAL

          IMPORTANTE:

          NO usamos RoundedBox todavía.

          Es un boxGeometry simple para garantizar
          una superficie absolutamente plana.
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
          COLISIÓN DE TODO EL RECTÁNGULO

          La superficie superior termina en Y = 0.
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
          BORDE INVISIBLE NORTE
      =================================================== */}

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

      {/* ===================================================
          BORDE INVISIBLE SUR
      =================================================== */}

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

      {/* ===================================================
          BORDE INVISIBLE IZQUIERDO
      =================================================== */}

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

      {/* ===================================================
          BORDE INVISIBLE DERECHO
      =================================================== */}

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

   Queremos verlo todo claramente mientras definimos
   la escala y distribución del mando.
========================================================= */

function WorkLights() {
  return (
    <>
      <ambientLight
        intensity={2.5}
      />

      <hemisphereLight
        skyColor="#ffffff"
        groundColor="#b8b09f"
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
      {/* ILUMINACIÓN */}

      <WorkLights />

      {/* ===================================================
          JOYSTICK

          Una sola superficie plana.
      =================================================== */}

      <ControllerBase />

      {/* ===================================================
          CRUCETA / MAIN HALL

          Museum.jsx controla su posición.
      =================================================== */}

      <Museum />
    </group>
  );
}
