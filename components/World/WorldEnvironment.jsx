"use client";

import {
  RigidBody,
  CuboidCollider,
  CylinderCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — FAMILY / NES CONTROLLER

   ESCALA MAESTRA 1:1

   Cruceta real de Freaky World:
   102 unidades

   D-pad NES real:
   26.5 mm

   ESCALA:
   102 / 26.5 = 3.8490566 unidades/mm

   NES real:
   124 x 54 mm

   Freaky World:
   477.28 x 207.85 unidades

   IMPORTANTE:
   - la cruceta NO cambia de tamaño
   - el mando se adapta a la cruceta
   - CameraRig NO se toca
   - PlayerController NO se toca
========================================================= */

/* =========================================================
   ESCALA REAL
========================================================= */

const WORLD_UNITS_PER_MM =
  102 / 26.5;

const REAL_CONTROLLER_WIDTH_MM =
  124;

const REAL_CONTROLLER_DEPTH_MM =
  54;

const CONTROLLER_WIDTH =
  REAL_CONTROLLER_WIDTH_MM *
  WORLD_UNITS_PER_MM;

const CONTROLLER_DEPTH =
  REAL_CONTROLLER_DEPTH_MM *
  WORLD_UNITS_PER_MM;

const CONTROLLER_HEIGHT = 2;

/* =========================================================
   ESCALA DE LA DISTRIBUCIÓN ANTERIOR

   El diseño anterior era:
   340 x 150.

   Ahora conservamos la composición,
   pero ocupando el tamaño correcto.
========================================================= */

const OLD_CONTROLLER_WIDTH = 340;
const OLD_CONTROLLER_DEPTH = 150;

const SCALE_X =
  CONTROLLER_WIDTH /
  OLD_CONTROLLER_WIDTH;

const SCALE_Z =
  CONTROLLER_DEPTH /
  OLD_CONTROLLER_DEPTH;

/* =========================================================
   HELPERS DE ESCALA
========================================================= */

const sx = (value) =>
  value * SCALE_X;

const sz = (value) =>
  value * SCALE_Z;

/* =========================================================
   ALTURAS
========================================================= */

export const VISUAL_FLOOR_Y =
  0.024;

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

/*
   NUEVO:

   No tocamos diámetro ni ubicación de los botones.

   Sólo les damos profundidad física.

   Los A/B sobresalen más.
   Select/Start quedan más bajos,
   como en un mando real.
*/

const ACTION_BUTTON_HEIGHT = 6;

const CENTER_BUTTON_HEIGHT = 3.4;

/* =========================================================
   SEGURIDAD
========================================================= */

const SAFETY_HEIGHT = 12;
const SAFETY_THICKNESS = 1;

/* =========================================================
   COLORES
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
   BASE DEL MANDO
========================================================= */

function ControllerBase() {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
    >
      {/* CARCASA */}

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

      {/* SUELO FÍSICO */}

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
          BARRERAS EXTERIORES
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
   BLOQUES VISUALES
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
   BOTÓN REDONDO CON VOLUMEN

   Conserva exactamente:
   - X
   - Z
   - radio

   Sólo crece verticalmente.
========================================================= */

function RaisedCircleButton({
  position,
  radius,
  height,
  color,
  roughness = 0.3,
}) {
  const baseY =
    position[1];

  const centerY =
    baseY +
    height / 2;

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      friction={0.9}
      restitution={0}
    >
      <CylinderCollider
        args={[
          height / 2,
          radius,
        ]}
        position={[
          position[0],
          centerY,
          position[2],
        ]}
        friction={0.9}
        restitution={0}
      />

      <mesh
        position={[
          position[0],
          centerY,
          position[2],
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            radius,
            radius,
            height,
            56,
          ]}
        />

        <ButtonPlasticMaterial
          color={color}
          roughness={roughness}
          polygonOffsetFactor={-6}
        />
      </mesh>

      {/* TAPA MUY LEVE */}

      <mesh
        position={[
          position[0],
          baseY +
            height +
            0.035,
          position[2],
        ]}
        castShadow
      >
        <cylinderGeometry
          args={[
            radius * 0.94,
            radius * 0.98,
            0.07,
            56,
          ]}
        />

        <ButtonPlasticMaterial
          color={color}
          roughness={0.27}
          polygonOffsetFactor={-7}
        />
      </mesh>
    </RigidBody>
  );
}

/* =========================================================
   BOTÓN RECTANGULAR CON VOLUMEN

   Para SELECT / START.

   Conserva ancho y profundidad actuales.
========================================================= */

function RaisedRectButton({
  position,
  width,
  depth,
  height,
  color,
}) {
  const baseY =
    position[1];

  const centerY =
    baseY +
    height / 2;

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      friction={0.9}
      restitution={0}
    >
      <CuboidCollider
        args={[
          width / 2,
          height / 2,
          depth / 2,
        ]}
        position={[
          position[0],
          centerY,
          position[2],
        ]}
        friction={0.9}
        restitution={0}
      />

      <mesh
        position={[
          position[0],
          centerY,
          position[2],
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            width,
            height,
            depth,
          ]}
        />

        <DarkPlasticMaterial
          color={color}
          roughness={0.4}
          polygonOffsetFactor={-5}
        />
      </mesh>

      {/* TAPA */}

      <mesh
        position={[
          position[0],
          baseY +
            height +
            0.025,
          position[2],
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            width * 0.92,
            0.05,
            depth * 0.82,
          ]}
        />

        <DarkPlasticMaterial
          color={color}
          roughness={0.34}
          polygonOffsetFactor={-6}
        />
      </mesh>
    </RigidBody>
  );
}

/* =========================================================
   PANEL CENTRAL
========================================================= */

function MainPanel() {
  return (
    <FlatVisualBox
      position={[
        sx(10),
        0,
        0,
      ]}
      width={sx(246)}
      depth={sz(108)}
      thickness={0.02}
      color={COLORS.mainPanel}
      roughness={0.48}
      polygonOffsetFactor={-1}
    />
  );
}

/* =========================================================
   LÍNEAS ROJAS
========================================================= */

function ControllerTrim() {
  return (
    <group>
      <FlatPlane
        position={[
          0,

          VISUAL_FLOOR_Y +
            0.001,

          sz(-67),
        ]}
        width={sx(308)}
        depth={2.3}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />

      <FlatPlane
        position={[
          0,

          VISUAL_FLOOR_Y +
            0.001,

          sz(67),
        ]}
        width={sx(308)}
        depth={2.3}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />
    </group>
  );
}

/* =========================================================
   BASE DE LA CRUCETA

   NO dibujamos otra cruceta.

   La cruceta real es Museum/MainHall.
========================================================= */

function DpadBackdrop() {
  const panelYOffset =
    0.0015;

  return (
    <group>
      <FlatVisualBox
        position={[
          sx(-103.5),
          panelYOffset,
          0,
        ]}
        width={sx(108)}
        depth={sz(112)}
        thickness={0.018}
        color={COLORS.midPanel}
        roughness={0.52}
        polygonOffsetFactor={-2}
      />

      <FlatPlane
        position={[
          sx(-103.5),

          VISUAL_FLOOR_Y +
            panelYOffset +
            0.001,

          sz(-52),
        ]}
        width={sx(98)}
        depth={2.2}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />

      <FlatPlane
        position={[
          sx(-103.5),

          VISUAL_FLOOR_Y +
            panelYOffset +
            0.001,

          sz(52),
        ]}
        width={sx(98)}
        depth={2.2}
        color={COLORS.red}
        material="button"
        polygonOffsetFactor={-4}
      />
    </group>
  );
}

/* =========================================================
   SELECT / START

   MISMA POSICIÓN Y MISMAS PROPORCIONES.

   Ahora tienen:
   - volumen
   - collider
   - altura menor que A/B
========================================================= */

function CenterControls() {
  const panelYOffset =
    0.002;

  const buttonYOffset =
    panelYOffset +
    0.0015;

  const baseY =
    VISUAL_FLOOR_Y +
    buttonYOffset;

  return (
    <group>
      <FlatVisualBox
        position={[
          sx(10),
          panelYOffset,
          sz(35),
        ]}
        width={sx(64)}
        depth={sz(20)}
        thickness={0.016}
        color={COLORS.shellShadow}
        roughness={0.56}
        polygonOffsetFactor={-2}
      />

      {/* SELECT */}

      <RaisedRectButton
        position={[
          sx(-7),
          baseY,
          sz(35),
        ]}
        width={sx(24)}
        depth={sz(7.5)}
        height={
          CENTER_BUTTON_HEIGHT
        }
        color={
          COLORS.blackPlasticSoft
        }
      />

      {/* START */}

      <RaisedRectButton
        position={[
          sx(27),
          baseY,
          sz(35),
        ]}
        width={sx(24)}
        depth={sz(7.5)}
        height={
          CENTER_BUTTON_HEIGHT
        }
        color={
          COLORS.blackPlastic
        }
      />
    </group>
  );
}

/* =========================================================
   A / B

   IMPORTANTE:

   Las coordenadas y radios siguen siendo
   exactamente los mismos que en el mando 1:1.

   Sólo damos altura al botón interior.

   Los aros mantienen su posición original.
========================================================= */

function ActionButtons() {
  const panelYOffset =
    0.0015;

  const buttonBaseY =
    VISUAL_FLOOR_Y +
    0.005;

  return (
    <group>
      {/* ZONA DERECHA */}

      <FlatVisualBox
        position={[
          sx(98),
          panelYOffset,
          0,
        ]}
        width={sx(104)}
        depth={sz(112)}
        thickness={0.018}
        color={COLORS.midPanel}
        roughness={0.5}
        polygonOffsetFactor={-2}
      />

      {/* BOTÓN B — ARO */}

      <FlatCircle
        position={[
          sx(78),

          VISUAL_FLOOR_Y +
            0.004,

          sz(18),
        ]}
        radius={27}
        color={COLORS.redDark}
        material="button"
        roughness={0.34}
        polygonOffsetFactor={-4}
      />

      {/* BOTÓN B — VOLUMEN */}

      <RaisedCircleButton
        position={[
          sx(78),
          buttonBaseY,
          sz(18),
        ]}
        radius={22}
        height={
          ACTION_BUTTON_HEIGHT
        }
        color={COLORS.red}
        roughness={0.3}
      />

      {/* BOTÓN A — ARO */}

      <FlatCircle
        position={[
          sx(118),

          VISUAL_FLOOR_Y +
            0.004,

          sz(-18),
        ]}
        radius={27}
        color={COLORS.redDark}
        material="button"
        roughness={0.34}
        polygonOffsetFactor={-4}
      />

      {/* BOTÓN A — VOLUMEN */}

      <RaisedCircleButton
        position={[
          sx(118),
          buttonBaseY,
          sz(-18),
        ]}
        radius={22}
        height={
          ACTION_BUTTON_HEIGHT
        }
        color={
          COLORS.redBright
        }
        roughness={0.3}
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
      {/* CUERPO FÍSICO */}
      <ControllerBase />

      {/* MANDO PROPORCIONADO 1:1 */}
      <MainPanel />
      <ControllerTrim />
      <DpadBackdrop />

      {/* BOTONES CON VOLUMEN */}
      <CenterControls />
      <ActionButtons />

      {/*
        La cruceta arquitectónica mantiene
        EXACTAMENTE su tamaño actual.
      */}
      <Museum />
    </group>
  );
}
