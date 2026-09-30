"use client";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — FAMILY CONTROLLER BASE

   OBJETIVO DE ESTA VERSIÓN

   - mando claramente reconocible
   - carcasa gris cálida
   - panel oscuro central
   - zona D-pad a la izquierda
   - zona botones a la derecha
   - SELECT / START marcados
   - TODO sigue siendo una única superficie caminable
   - todavía no agregamos botones elevados
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
   PALETA FAMILY
========================================================= */

const COLORS = {
  body: "#aaa397",

  panel: "#474749",
  panelSecondary: "#5a5754",

  burgundy: "#84293d",
  burgundyDark: "#5d1c2c",

  dark: "#242427",
  black: "#171719",
};

/* =========================================================
   CUERPO FÍSICO

   Una sola superficie.
========================================================= */

function ControllerBase() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* ===================================================
          CARCASA PRINCIPAL

          Parte superior exactamente en Y = 0.
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
          color={COLORS.body}
          roughness={0.84}
          metalness={0.01}
        />
      </mesh>

      {/* ===================================================
          COLISIÓN TOTAL DEL MANDO
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
          LÍMITES INVISIBLES
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
   PANEL OSCURO PRINCIPAL

   Es prácticamente plano.
   NO tiene collider.

   Por eso se puede caminar por encima sin escalón.
========================================================= */

function MainFacePanel() {
  return (
    <mesh
      position={[
        18,
        0.012,
        0,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          230,
          0.018,
          112,
        ]}
      />

      <meshStandardMaterial
        color={COLORS.panel}
        roughness={0.82}
        metalness={0.02}
      />
    </mesh>
  );
}

/* =========================================================
   ZONA IZQUIERDA

   Marco visual donde vive la cruceta/hall.
========================================================= */

function DpadZone() {
  return (
    <>
      <mesh
        position={[
          -105,
          0.025,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            112,
            0.025,
            122,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.panelSecondary}
          roughness={0.86}
          metalness={0.01}
        />
      </mesh>

      {/* línea bordó superior */}

      <mesh
        position={[
          -105,
          0.042,
          -57,
        ]}
      >
        <boxGeometry
          args={[
            100,
            0.018,
            3,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.72}
        />
      </mesh>

      {/* línea bordó inferior */}

      <mesh
        position={[
          -105,
          0.043,
          57,
        ]}
      >
        <boxGeometry
          args={[
            100,
            0.018,
            3,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.72}
        />
      </mesh>
    </>
  );
}

/* =========================================================
   ZONA DERECHA

   De momento solo marca dónde irán A y B.

   Todavía no son botones físicos.
========================================================= */

function ActionZone() {
  return (
    <>
      <mesh
        position={[
          92,
          0.026,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            92,
            0.026,
            100,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.panelSecondary}
          roughness={0.86}
          metalness={0.01}
        />
      </mesh>

      {/* posición B */}

      <mesh
        position={[
          70,
          0.045,
          20,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <circleGeometry
          args={[
            20,
            40,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundyDark}
          roughness={0.72}
        />
      </mesh>

      {/* posición A */}

      <mesh
        position={[
          110,
          0.046,
          -20,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <circleGeometry
          args={[
            20,
            40,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.7}
        />
      </mesh>
    </>
  );
}

/* =========================================================
   SELECT / START

   Por ahora siguen siendo marcas planas.

   Después los levantamos físicamente.
========================================================= */

function CenterControls() {
  return (
    <group>
      {/* SELECT */}

      <mesh
        position={[
          -8,
          0.047,
          34,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            25,
            0.02,
            9,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.dark}
          roughness={0.7}
        />
      </mesh>

      {/* START */}

      <mesh
        position={[
          24,
          0.048,
          34,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            25,
            0.02,
            9,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.black}
          roughness={0.7}
        />
      </mesh>

      {/* línea bordó */}

      <mesh
        position={[
          8,
          0.05,
          48,
        ]}
      >
        <boxGeometry
          args={[
            76,
            0.018,
            2.5,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.75}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   DETALLES DEL BORDE

   Ayudan a que la carcasa se lea como mando,
   pero no crean desniveles físicos.
========================================================= */

function ControllerTrim() {
  return (
    <>
      {/* superior */}

      <mesh
        position={[
          0,
          0.035,
          -66,
        ]}
      >
        <boxGeometry
          args={[
            306,
            0.02,
            3,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.75}
        />
      </mesh>

      {/* inferior */}

      <mesh
        position={[
          0,
          0.036,
          66,
        ]}
      >
        <boxGeometry
          args={[
            306,
            0.02,
            3,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.75}
        />
      </mesh>
    </>
  );
}

/* =========================================================
   WORLD
========================================================= */

export default function WorldEnvironment() {
  return (
    <group>
      {/* ===================================================
          NO agregamos luces acá.

          WorldScene ya tiene:
          - DynamicSky
          - WorldLighting
          - AdaptiveWorldLighting

          Y ahora está fijado a las 13:00.

          Esto evita volver a quemar los colores.
      =================================================== */}

      <ControllerBase />

      <MainFacePanel />

      <DpadZone />

      <ActionZone />

      <CenterControls />

      <ControllerTrim />

      {/* ===================================================
          CRUCETA / HALL
      =================================================== */}

      <Museum />
    </group>
  );
}
