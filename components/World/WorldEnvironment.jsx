"use client";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — FAMILY CONTROLLER

   PASADA VISUAL:
   - plástico más creíble
   - proporciones reajustadas
   - A/B más grandes
   - Select/Start más grandes
   - todo continúa siendo plano y caminable
   - botones todavía NO tienen volumen físico
========================================================= */

/* =========================================================
   MANDO
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
   PALETA

   Inspiración:
   plástico gris cálido + grafito + bordó oscuro.
========================================================= */

const COLORS = {
  shell: "#9f9a90",

  shellEdge: "#817d75",

  panel: "#4a4949",

  panelLight: "#5a5856",

  blackPlastic: "#202124",

  blackPlasticSoft: "#303034",

  burgundy: "#84293d",

  burgundyBright: "#9a3148",

  burgundyDark: "#591b2b",
};

/* =========================================================
   MATERIAL PLÁSTICO CLARO
========================================================= */

function ShellMaterial() {
  return (
    <meshPhysicalMaterial
      color={COLORS.shell}
      roughness={0.46}
      metalness={0}
      clearcoat={0.28}
      clearcoatRoughness={0.4}
    />
  );
}

/* =========================================================
   MATERIAL PLÁSTICO OSCURO
========================================================= */

function DarkPlasticMaterial({
  color = COLORS.panel,
  roughness = 0.42,
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.2}
      clearcoatRoughness={0.38}
    />
  );
}

/* =========================================================
   MATERIAL BOTÓN

   Algo más satinado que la carcasa.
========================================================= */

function ButtonPlasticMaterial({
  color = COLORS.burgundy,
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.3}
      metalness={0}
      clearcoat={0.48}
      clearcoatRoughness={0.25}
    />
  );
}

/* =========================================================
   CUERPO PRINCIPAL
========================================================= */

function ControllerBase() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* ===================================================
          CARCASA

          Superficie caminable en Y = 0.
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

        <ShellMaterial />
      </mesh>

      {/* ===================================================
          COLISIÓN TOTAL
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
   PANEL PRINCIPAL OSCURO

   Muy fino.
   No modifica el nivel físico del suelo.
========================================================= */

function MainPanel() {
  return (
    <mesh
      position={[
        12,
        0.011,
        0,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          242,
          0.018,
          116,
        ]}
      />

      <DarkPlasticMaterial
        color={
          COLORS.panel
        }
        roughness={0.48}
      />
    </mesh>
  );
}

/* =========================================================
   ZONA D-PAD

   El verdadero D-pad es MainHall.

   Esto es únicamente el área de plástico donde se integra.
========================================================= */

function DpadZone() {
  return (
    <group>
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

        <DarkPlasticMaterial
          color={
            COLORS.panelLight
          }
          roughness={0.5}
        />
      </mesh>

      {/* detalle superior */}

      <mesh
        position={[
          -105,
          0.041,
          -57,
        ]}
      >
        <boxGeometry
          args={[
            102,
            0.018,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundy
          }
        />
      </mesh>

      {/* detalle inferior */}

      <mesh
        position={[
          -105,
          0.042,
          57,
        ]}
      >
        <boxGeometry
          args={[
            102,
            0.018,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundy
          }
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   A / B

   AHORA:
   - diámetro 52
   - suficientemente grandes para convertirse
     después en salas circulares / arenas

   Todavía son superficies planas.
========================================================= */

const ACTION_RADIUS = 26;

function ActionButtons() {
  return (
    <group>
      {/* ===================================================
          BASE DERECHA
      =================================================== */}

      <mesh
        position={[
          94,
          0.026,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            112,
            0.026,
            112,
          ]}
        />

        <DarkPlasticMaterial
          color={
            COLORS.panelLight
          }
          roughness={0.48}
        />
      </mesh>

      {/* ===================================================
          BOTÓN B
      =================================================== */}

      <mesh
        position={[
          70,
          0.048,
          21,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <circleGeometry
          args={[
            ACTION_RADIUS +
              3,
            48,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundyDark
          }
        />
      </mesh>

      <mesh
        position={[
          70,
          0.052,
          21,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <circleGeometry
          args={[
            ACTION_RADIUS,
            48,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundy
          }
        />
      </mesh>

      {/* ===================================================
          BOTÓN A
      =================================================== */}

      <mesh
        position={[
          116,
          0.048,
          -21,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <circleGeometry
          args={[
            ACTION_RADIUS +
              3,
            48,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundyDark
          }
        />
      </mesh>

      <mesh
        position={[
          116,
          0.052,
          -21,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <circleGeometry
          args={[
            ACTION_RADIUS,
            48,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundyBright
          }
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SELECT / START

   Agrandados ligeramente.

   31 × 11 cada uno.
========================================================= */

function CenterControls() {
  return (
    <group>
      {/* zona central */}

      <mesh
        position={[
          5,
          0.026,
          35,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            82,
            0.026,
            26,
          ]}
        />

        <DarkPlasticMaterial
          color={
            COLORS.shellEdge
          }
          roughness={0.52}
        />
      </mesh>

      {/* SELECT */}

      <mesh
        position={[
          -15,
          0.05,
          35,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            31,
            0.022,
            11,
          ]}
        />

        <DarkPlasticMaterial
          color={
            COLORS.blackPlasticSoft
          }
          roughness={0.4}
        />
      </mesh>

      {/* START */}

      <mesh
        position={[
          24,
          0.051,
          35,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            31,
            0.022,
            11,
          ]}
        />

        <DarkPlasticMaterial
          color={
            COLORS.blackPlastic
          }
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   MARCAS DE CARCASA
========================================================= */

function ControllerTrim() {
  return (
    <group>
      {/* superior */}

      <mesh
        position={[
          0,
          0.04,
          -67,
        ]}
      >
        <boxGeometry
          args={[
            308,
            0.018,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundy
          }
        />
      </mesh>

      {/* inferior */}

      <mesh
        position={[
          0,
          0.041,
          67,
        ]}
      >
        <boxGeometry
          args={[
            308,
            0.018,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={
            COLORS.burgundy
          }
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   WORLD
========================================================= */

export default function WorldEnvironment() {
  return (
    <group>
      <ControllerBase />

      <MainPanel />

      <DpadZone />

      <ActionButtons />

      <CenterControls />

      <ControllerTrim />

      {/* ===================================================
          CRUCETA / HALL PRINCIPAL
      =================================================== */}

      <Museum />
    </group>
  );
}
