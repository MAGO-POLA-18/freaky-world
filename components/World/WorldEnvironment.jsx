"use client";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — FAMILY CONTROLLER

   OBJETIVO:
   - mantener el suelo físico estable
   - mantener el piso visual sin temblores
   - reorganizar el diseño para que, en vista cenital,
     se lea claramente como un joystick de Family

   IMPORTANTE:
   - NO tocar Museum, CameraRig ni PlayerController
   - este archivo redefine solo la parte visual
========================================================= */

/* =========================================================
   MEDIDAS GENERALES
========================================================= */

const CONTROLLER_WIDTH = 340;
const CONTROLLER_DEPTH = 150;
const CONTROLLER_HEIGHT = 2;

/* =========================================================
   ALTURAS
========================================================= */

/*
  Cota visual del piso.
*/
export const VISUAL_FLOOR_Y = 0.024;

/*
  Cota física del piso.
  Ya está calibrada para que el avatar no entierre
  las zapatillas.
*/
export const PHYSICAL_FLOOR_Y =
  VISUAL_FLOOR_Y + 0.18;

const PHYSICAL_FLOOR_BOTTOM =
  -CONTROLLER_HEIGHT;

const PHYSICAL_FLOOR_HEIGHT =
  PHYSICAL_FLOOR_Y -
  PHYSICAL_FLOOR_BOTTOM;

const PHYSICAL_FLOOR_CENTER_Y =
  PHYSICAL_FLOOR_BOTTOM +
  PHYSICAL_FLOOR_HEIGHT / 2;

/* =========================================================
   SEGURIDAD / BARRERAS
========================================================= */

const SAFETY_HEIGHT = 12;
const SAFETY_THICKNESS = 1;

/* =========================================================
   PALETA — inspirada en mando Family / NES
========================================================= */

const COLORS = {
  shell: "#bebbb2",
  shellShadow: "#9f9a90",

  mainPanel: "#4a4a48",
  darkPanel: "#35373a",
  midPanel: "#6e6c66",

  blackPlastic: "#1e1f23",
  blackPlasticSoft: "#2b2d31",

  redDark: "#6e001f",
  red: "#8e0b30",
  redBright: "#a3143e",

  accent: "#d4d1c9",
};

/* =========================================================
   MATERIALES
========================================================= */

function ShellMaterial() {
  return (
    <meshPhysicalMaterial
      color={COLORS.shell}
      roughness={0.44}
      metalness={0}
      clearcoat={0.25}
      clearcoatRoughness={0.42}
    />
  );
}

function DarkPlasticMaterial({
  color = COLORS.mainPanel,
  roughness = 0.46,
  polygonOffsetFactor = -1,
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.16}
      clearcoatRoughness={0.42}
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
  color = COLORS.red,
  roughness = 0.32,
  polygonOffsetFactor = -3,
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={roughness}
      metalness={0}
      clearcoat={0.48}
      clearcoatRoughness={0.24}
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
   BASE FÍSICA DEL MANDO
========================================================= */

function ControllerBase() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* Carcasa visual */}

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

      {/* ÚNICO suelo físico */}

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

      {/* Barreras invisibles */}

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
   BLOQUES VISUALES

   yOffset = pequeño relieve visual local.
   No afecta al suelo físico.
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
  const yOffset =
    position[1] || 0;

  return (
    <mesh
      position={[
        position[0],
        VISUAL_FLOOR_Y +
          yOffset -
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

function FlatPlane({
  position,
  width,
  depth,
  color,
  material = "dark",
  roughness = 0.42,
  polygonOffsetFactor = -4,
}) {
  const Material =
    material === "button"
      ? ButtonPlasticMaterial
      : DarkPlasticMaterial;

  return (
    <mesh
      position={position}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      receiveShadow
    >
      <planeGeometry
        args={[
          width,
          depth,
        ]}
      />

      <Material
        color={color}
        roughness={roughness}
        polygonOffsetFactor={
          polygonOffsetFactor
        }
      />
    </mesh>
  );
}

function FlatCircle({
  position,
  radius,
  color,
  material = "button",
  roughness = 0.3,
  polygonOffsetFactor = -5,
}) {
  const Material =
    material === "button"
      ? ButtonPlasticMaterial
      : DarkPlasticMaterial;

  return (
    <mesh
      position={position}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
      receiveShadow
    >
      <circleGeometry
        args={[
          radius,
          56,
        ]}
      />

      <Material
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
   PANEL CENTRAL OSCURO

   Gran franja central típica del joystick.
========================================================= */

function MainPanel() {
  return (
    <FlatVisualBox
      position={[
        10,
        0,
        0,
      ]}
      width={246}
      depth={108}
      thickness={0.02}
      color={COLORS.mainPanel}
      roughness={0.48}
      polygonOffsetFactor={-1}
    />
  );
}

/* =========================================================
   MARCAS ROJAS DE CARCASA
========================================================= */

function ControllerTrim() {
  return (
    <group>
      {/* LÍNEA SUPERIOR */}

      <FlatPlane
        position={[
          0,
          VISUAL_FLOOR_Y +
            0.001,
          -67,
        ]}
        width={308}
        depth={2.3}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />

      {/* LÍNEA INFERIOR */}

      <FlatPlane
        position={[
          0,
          VISUAL_FLOOR_Y +
            0.001,
          67,
        ]}
        width={308}
        depth={2.3}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />
    </group>
  );
}

/* =========================================================
   ZONA DE CRUCETA
========================================================= */

function DpadZone() {
  const panelYOffset = 0.0015;
  const crossYOffset = 0.003;

  return (
    <group>
      {/* Base gris izquierda */}

      <FlatVisualBox
        position={[
          -96,
          panelYOffset,
          0,
        ]}
        width={108}
        depth={112}
        thickness={0.018}
        color={COLORS.midPanel}
        roughness={0.52}
        polygonOffsetFactor={-2}
      />

      {/* Líneas rojas arriba y abajo */}

      <FlatPlane
        position={[
          -96,
          VISUAL_FLOOR_Y +
            panelYOffset +
            0.001,
          -52,
        ]}
        width={98}
        depth={2.2}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />

      <FlatPlane
        position={[
          -96,
          VISUAL_FLOOR_Y +
            panelYOffset +
            0.001,
          52,
        ]}
        width={98}
        depth={2.2}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />

      {/* Cruceta horizontal */}

      <FlatVisualBox
        position={[
          -96,
          crossYOffset,
          0,
        ]}
        width={58}
        depth={18}
        thickness={0.014}
        color={
          COLORS.blackPlastic
        }
        roughness={0.4}
        polygonOffsetFactor={-4}
      />

      {/* Cruceta vertical */}

      <FlatVisualBox
        position={[
          -96,
          crossYOffset,
          0,
        ]}
        width={18}
        depth={58}
        thickness={0.014}
        color={
          COLORS.blackPlastic
        }
        roughness={0.4}
        polygonOffsetFactor={-4}
      />

      {/* Centro de cruceta */}

      <FlatCircle
        position={[
          -96,
          VISUAL_FLOOR_Y +
            crossYOffset +
            0.001,
          0,
        ]}
        radius={8.5}
        color={
          COLORS.blackPlasticSoft
        }
        material="dark"
        roughness={0.42}
        polygonOffsetFactor={-5}
      />
    </group>
  );
}

/* =========================================================
   SELECT / START
========================================================= */

function CenterControls() {
  const panelYOffset = 0.002;
  const buttonYOffset =
    panelYOffset + 0.0015;

  return (
    <group>
      {/* Base central pequeña */}

      <FlatVisualBox
        position={[
          10,
          panelYOffset,
          35,
        ]}
        width={64}
        depth={20}
        thickness={0.016}
        color={COLORS.shellShadow}
        roughness={0.56}
        polygonOffsetFactor={-2}
      />

      {/* SELECT */}

      <FlatPlane
        position={[
          -7,
          VISUAL_FLOOR_Y +
            buttonYOffset,
          35,
        ]}
        width={24}
        depth={7.5}
        color={
          COLORS.blackPlasticSoft
        }
        material="dark"
        roughness={0.42}
        polygonOffsetFactor={-5}
      />

      {/* START */}

      <FlatPlane
        position={[
          27,
          VISUAL_FLOOR_Y +
            buttonYOffset,
          35,
        ]}
        width={24}
        depth={7.5}
        color={
          COLORS.blackPlastic
        }
        material="dark"
        roughness={0.42}
        polygonOffsetFactor={-5}
      />
    </group>
  );
}

/* =========================================================
   ZONA A / B
========================================================= */

function ActionButtons() {
  const panelYOffset = 0.0015;

  return (
    <group>
      {/* Base gris derecha */}

      <FlatVisualBox
        position={[
          98,
          panelYOffset,
          0,
        ]}
        width={104}
        depth={112}
        thickness={0.018}
        color={COLORS.midPanel}
        roughness={0.5}
        polygonOffsetFactor={-2}
      />

      {/* Botón B — aro */}

      <FlatCircle
        position={[
          78,
          VISUAL_FLOOR_Y +
            0.004,
          18,
        ]}
        radius={27}
        color={COLORS.redDark}
        material="button"
        roughness={0.34}
        polygonOffsetFactor={-4}
      />

      {/* Botón B — centro */}

      <FlatCircle
        position={[
          78,
          VISUAL_FLOOR_Y +
            0.005,
          18,
        ]}
        radius={22}
        color={COLORS.red}
        material="button"
        roughness={0.3}
        polygonOffsetFactor={-6}
      />

      {/* Botón A — aro */}

      <FlatCircle
        position={[
          118,
          VISUAL_FLOOR_Y +
            0.004,
          -18,
        ]}
        radius={27}
        color={COLORS.redDark}
        material="button"
        roughness={0.34}
        polygonOffsetFactor={-4}
      />

      {/* Botón A — centro */}

      <FlatCircle
        position={[
          118,
          VISUAL_FLOOR_Y +
            0.005,
          -18,
        ]}
        radius={22}
        color={COLORS.redBright}
        material="button"
        roughness={0.3}
        polygonOffsetFactor={-6}
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
      {/* Física estable */}
      <ControllerBase />

      {/* Visual del mando */}
      <MainPanel />
      <ControllerTrim />
      <DpadZone />
      <CenterControls />
      <ActionButtons />

      {/* Museo / cruceta */}
      <Museum />
    </group>
  );
}
