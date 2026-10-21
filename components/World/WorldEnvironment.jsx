"use client";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — FAMILY CONTROLLER

   SISTEMA DE SUELO ÚNICO

   VISUAL:
   Y = 0.024

   FÍSICO:
   Y = 0.204

   La diferencia de 0.18 compensa la geometría de las
   zapatillas, que visualmente baja ~18 cm más que
   la cápsula física del jugador.

   Resultado:
   - collider estable
   - zapatos apoyados visualmente
   - sin múltiples colliders de piso
   - sin escalones físicos entre colores
========================================================= */

/* =========================================================
   MEDIDAS
========================================================= */

const CONTROLLER_WIDTH = 340;
const CONTROLLER_DEPTH = 150;
const CONTROLLER_HEIGHT = 2;

/* =========================================================
   ALTURAS MAESTRAS
========================================================= */

/*
  Todas las superficies visuales principales terminan aquí.
*/

export const VISUAL_FLOOR_Y = 0.024;

/*
  La cápsula física termina aprox. 0.18 m antes que
  las suelas visuales.

  Por eso el collider invisible del suelo está 18 cm
  por encima de la superficie visual.
*/

export const PHYSICAL_FLOOR_Y =
  VISUAL_FLOOR_Y + 0.18;

/*
  El collider físico es UN ÚNICO bloque.

  Parte desde el fondo de la carcasa y termina exactamente
  en PHYSICAL_FLOOR_Y.
*/

const PHYSICAL_FLOOR_BOTTOM =
  -CONTROLLER_HEIGHT;

const PHYSICAL_FLOOR_HEIGHT =
  PHYSICAL_FLOOR_Y -
  PHYSICAL_FLOOR_BOTTOM;

const PHYSICAL_FLOOR_CENTER_Y =
  PHYSICAL_FLOOR_BOTTOM +
  PHYSICAL_FLOOR_HEIGHT / 2;

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
   MATERIALES
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

function DarkPlasticMaterial({
  color = COLORS.panel,
  roughness = 0.42,
  polygonOffsetFactor = -1,
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.2}
      clearcoatRoughness={0.38}
      polygonOffset
      polygonOffsetFactor={
        polygonOffsetFactor
      }
      polygonOffsetUnits={
        polygonOffsetFactor
      }
    />
  );
}

function ButtonPlasticMaterial({
  color = COLORS.burgundy,
  polygonOffsetFactor = -3,
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.3}
      metalness={0}
      clearcoat={0.48}
      clearcoatRoughness={0.25}
      polygonOffset
      polygonOffsetFactor={
        polygonOffsetFactor
      }
      polygonOffsetUnits={
        polygonOffsetFactor
      }
    />
  );
}

/* =========================================================
   CUERPO PRINCIPAL + ÚNICO SUELO FÍSICO
========================================================= */

function ControllerBase() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* ===================================================
          CARCASA VISUAL

          La carcasa visible continúa terminando en Y = 0.
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
          ÚNICO SUELO FÍSICO GLOBAL

          IMPORTANTE:

          Ya NO hay:
          - collider base + collider laminado
          - colliders independientes de colores
          - colliders de piso en la cruceta

          Este es el único suelo que pisa el jugador.
      =================================================== */}

      <CuboidCollider
        position={[
          0,
          PHYSICAL_FLOOR_CENTER_Y,
          0,
        ]}
        args={[
          CONTROLLER_WIDTH / 2,
          PHYSICAL_FLOOR_HEIGHT / 2,
          CONTROLLER_DEPTH / 2,
        ]}
      />

      {/* ===================================================
          LÍMITES INVISIBLES

          Empiezan exactamente encima del suelo físico.
          No penetran dentro del suelo.
      =================================================== */}

      {/* NORTE */}

      <CuboidCollider
        position={[
          0,
          PHYSICAL_FLOOR_Y +
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
          PHYSICAL_FLOOR_Y +
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
          PHYSICAL_FLOOR_Y +
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
          PHYSICAL_FLOOR_Y +
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
   UTILIDAD

   Todos estos bloques terminan EXACTAMENTE en
   VISUAL_FLOOR_Y.

   Cambian de color/material, NO de altura.
========================================================= */

function FlatVisualBox({
  position,
  width,
  depth,
  thickness = 0.02,
  color,
  roughness = 0.48,
  polygonOffsetFactor = -1,
}) {
  return (
    <mesh
      position={[
        position[0],
        VISUAL_FLOOR_Y -
          thickness / 2,
        position[2],
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          width,
          thickness,
          depth,
        ]}
      />

      <DarkPlasticMaterial
        color={color}
        roughness={roughness}
        polygonOffsetFactor={
          polygonOffsetFactor
        }
      />
    </mesh>
  );
}

/* =========================================================
   PANEL PRINCIPAL
========================================================= */

function MainPanel() {
  return (
    <FlatVisualBox
      position={[12, 0, 0]}
      width={242}
      depth={116}
      color={COLORS.panel}
      roughness={0.48}
      polygonOffsetFactor={-1}
    />
  );
}

/* =========================================================
   ZONA D-PAD
========================================================= */

function DpadZone() {
  return (
    <group>
      <FlatVisualBox
        position={[-105, 0, 0]}
        width={112}
        depth={122}
        color={COLORS.panelLight}
        roughness={0.5}
        polygonOffsetFactor={-2}
      />

      {/* borde superior */}

      <mesh
        position={[
          -105,
          VISUAL_FLOOR_Y,
          -57,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            102,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
          polygonOffsetFactor={-4}
        />
      </mesh>

      {/* borde inferior */}

      <mesh
        position={[
          -105,
          VISUAL_FLOOR_Y,
          57,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            102,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
          polygonOffsetFactor={-4}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   BOTONES A / B
========================================================= */

const ACTION_RADIUS = 26;

function ActionButtons() {
  return (
    <group>
      {/* BASE DERECHA */}

      <FlatVisualBox
        position={[94, 0, 0]}
        width={112}
        depth={112}
        color={COLORS.panelLight}
        roughness={0.48}
        polygonOffsetFactor={-2}
      />

      {/* ===================================================
          B — CONTORNO
      =================================================== */}

      <mesh
        position={[
          70,
          VISUAL_FLOOR_Y,
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
          color={
            COLORS.burgundyDark
          }
          polygonOffsetFactor={-3}
        />
      </mesh>

      {/* B */}

      <mesh
        position={[
          70,
          VISUAL_FLOOR_Y,
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
          polygonOffsetFactor={-5}
        />
      </mesh>

      {/* ===================================================
          A — CONTORNO
      =================================================== */}

      <mesh
        position={[
          116,
          VISUAL_FLOOR_Y,
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
          color={
            COLORS.burgundyDark
          }
          polygonOffsetFactor={-3}
        />
      </mesh>

      {/* A */}

      <mesh
        position={[
          116,
          VISUAL_FLOOR_Y,
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
          polygonOffsetFactor={-5}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SELECT / START
========================================================= */

function CenterControls() {
  return (
    <group>
      {/* ZONA CENTRAL */}

      <FlatVisualBox
        position={[1, 0, 35]}
        width={74}
        depth={26}
        color={COLORS.shellEdge}
        roughness={0.52}
        polygonOffsetFactor={-2}
      />

      {/* SELECT */}

      <mesh
        position={[
          -15,
          VISUAL_FLOOR_Y,
          35,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            31,
            11,
          ]}
        />

        <DarkPlasticMaterial
          color={
            COLORS.blackPlasticSoft
          }
          roughness={0.4}
          polygonOffsetFactor={-5}
        />
      </mesh>

      {/* START */}

      <mesh
        position={[
          24,
          VISUAL_FLOOR_Y,
          35,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            31,
            11,
          ]}
        />

        <DarkPlasticMaterial
          color={
            COLORS.blackPlastic
          }
          roughness={0.4}
          polygonOffsetFactor={-5}
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
      {/* SUPERIOR */}

      <mesh
        position={[
          0,
          VISUAL_FLOOR_Y,
          -67,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            308,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
          polygonOffsetFactor={-4}
        />
      </mesh>

      {/* INFERIOR */}

      <mesh
        position={[
          0,
          VISUAL_FLOOR_Y,
          67,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <planeGeometry
          args={[
            308,
            2.2,
          ]}
        />

        <ButtonPlasticMaterial
          color={COLORS.burgundy}
          polygonOffsetFactor={-4}
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
      {/* ÚNICO SISTEMA FÍSICO DE SUELO */}

      <ControllerBase />

      {/* ===================================================
          DECORACIÓN VISUAL

          Ninguno de estos elementos tiene collider.
      =================================================== */}

      <MainPanel />

      <DpadZone />

      <ActionButtons />

      <CenterControls />

      <ControllerTrim />

      {/* ===================================================
          CRUCETA / MUSEO

          Museum se alinea con VISUAL_FLOOR_Y.

          MainHall ya NO crea colisiones de suelo.
      =================================================== */}

      <Museum />
    </group>
  );
}
