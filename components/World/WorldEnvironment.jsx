"use client";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — FAMILY CONTROLLER

   SUELO UNIFICADO:
   - una única altura física caminable
   - capas visuales por debajo de esa altura
   - sin escalones físicos entre colores
   - el avatar nunca pisa las capas decorativas
========================================================= */

/* =========================================================
   MANDO
========================================================= */

const CONTROLLER_WIDTH = 340;
const CONTROLLER_DEPTH = 150;
const CONTROLLER_HEIGHT = 2;

/*
  ALTURA MAESTRA DEL MUNDO.

  Esta es la superficie REAL sobre la que camina el avatar.

  Todo elemento decorativo del piso debe terminar
  como máximo en esta altura.
*/

const WALK_SURFACE_Y = 0.024;

/*
  Lámina física superior.

  Se superpone ligeramente con la carcasa para que
  no exista ningún hueco entre colliders.
*/

const WALK_COLLIDER_THICKNESS = 0.04;

/* =========================================================
   SEGURIDAD
========================================================= */

const SAFETY_HEIGHT = 12;
const SAFETY_THICKNESS = 1;

/* =========================================================
   PALETA
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

          La carcasa continúa terminando en Y = 0.

          Encima colocamos una única lámina física continua.
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
          COLISIÓN BASE
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
          LÁMINA FÍSICA CAMINABLE

          Esta es ahora la única referencia para los pies.

          Superficie superior:
          Y = WALK_SURFACE_Y

          Las zonas de colores NO necesitan collider.
      =================================================== */}

      <CuboidCollider
        position={[
          0,
          WALK_SURFACE_Y -
            WALK_COLLIDER_THICKNESS / 2,
          0,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          WALK_COLLIDER_THICKNESS / 2,
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

   Todas las capas terminan prácticamente en WALK_SURFACE_Y.
   El color cambia, la altura caminable NO.
========================================================= */

function MainPanel() {
  const thickness = 0.018;

  return (
    <mesh
      position={[
        12,
        WALK_SURFACE_Y -
          thickness / 2 -
          0.0005,
        0,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          242,
          thickness,
          116,
        ]}
      />

      <DarkPlasticMaterial
        color={COLORS.panel}
        roughness={0.48}
      />
    </mesh>
  );
}

/* =========================================================
   ZONA D-PAD
========================================================= */

function DpadZone() {
  const zoneThickness = 0.025;
  const detailThickness = 0.018;

  return (
    <group>
      <mesh
        position={[
          -105,
          WALK_SURFACE_Y -
            zoneThickness / 2 -
            0.0006,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            112,
            zoneThickness,
            122,
          ]}
        />

        <DarkPlasticMaterial
          color={COLORS.panelLight}
          roughness={0.5}
        />
      </mesh>

      {/* detalle superior */}

      <mesh
        position={[
          -105,
          WALK_SURFACE_Y -
            detailThickness / 2 -
            0.0002,
          -57,
        ]}
      >
        <boxGeometry
          args={[
            102,
            detailThickness,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
        />
      </mesh>

      {/* detalle inferior */}

      <mesh
        position={[
          -105,
          WALK_SURFACE_Y -
            detailThickness / 2 -
            0.0002,
          57,
        ]}
      >
        <boxGeometry
          args={[
            102,
            detailThickness,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   A / B

   Visualmente siguen diferenciados,
   físicamente pertenecen al mismo piso.
========================================================= */

const ACTION_RADIUS = 26;

function ActionButtons() {
  const baseThickness = 0.026;

  /*
    Los círculos no tienen volumen físico.
    Los dejamos unas décimas por debajo de la superficie
    caminable para que jamás atraviesen los zapatos.
  */

  const circleY =
    WALK_SURFACE_Y -
    0.00015;

  return (
    <group>
      {/* BASE DERECHA */}

      <mesh
        position={[
          94,
          WALK_SURFACE_Y -
            baseThickness / 2 -
            0.0005,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            112,
            baseThickness,
            112,
          ]}
        />

        <DarkPlasticMaterial
          color={COLORS.panelLight}
          roughness={0.48}
        />
      </mesh>

      {/* BOTÓN B — BORDE */}

      <mesh
        position={[
          70,
          circleY - 0.00015,
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
            ACTION_RADIUS + 3,
            48,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundyDark}
        />
      </mesh>

      {/* BOTÓN B */}

      <mesh
        position={[
          70,
          circleY,
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
          color={COLORS.burgundy}
        />
      </mesh>

      {/* BOTÓN A — BORDE */}

      <mesh
        position={[
          116,
          circleY - 0.00015,
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
            ACTION_RADIUS + 3,
            48,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundyDark}
        />
      </mesh>

      {/* BOTÓN A */}

      <mesh
        position={[
          116,
          circleY,
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
          color={COLORS.burgundyBright}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SELECT / START
========================================================= */

function CenterControls() {
  const zoneThickness = 0.026;
  const buttonThickness = 0.022;

  return (
    <group>
      {/* zona central */}

      <mesh
        position={[
          5,
          WALK_SURFACE_Y -
            zoneThickness / 2 -
            0.0006,
          35,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            82,
            zoneThickness,
            26,
          ]}
        />

        <DarkPlasticMaterial
          color={COLORS.shellEdge}
          roughness={0.52}
        />
      </mesh>

      {/* SELECT */}

      <mesh
        position={[
          -15,
          WALK_SURFACE_Y -
            buttonThickness / 2 -
            0.00015,
          35,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            31,
            buttonThickness,
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
          WALK_SURFACE_Y -
            buttonThickness / 2 -
            0.00015,
          35,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            31,
            buttonThickness,
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
  const thickness = 0.018;

  return (
    <group>
      {/* superior */}

      <mesh
        position={[
          0,
          WALK_SURFACE_Y -
            thickness / 2 -
            0.00015,
          -67,
        ]}
      >
        <boxGeometry
          args={[
            308,
            thickness,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
        />
      </mesh>

      {/* inferior */}

      <mesh
        position={[
          0,
          WALK_SURFACE_Y -
            thickness / 2 -
            0.00015,
          67,
        ]}
      >
        <boxGeometry
          args={[
            308,
            thickness,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
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

          MainHall tiene su propio suelo prácticamente
          enrasado con esta nueva superficie.

          Sus líneas decorativas alcanzan aproximadamente
          la misma cota, por lo que no generan escalón.
      =================================================== */}

      <Museum />
    </group>
  );
}
