"use client";

import { RoundedBox } from "@react-three/drei";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   FREAKY WORLD — WORLD ENVIRONMENT
   VERSIÓN MANDO FAMILY GAME / NES-LIKE

   Objetivo:
   - el mundo entero es el joystick
   - proporción coherente entre:
     - cruceta / hall
     - botones A / B
     - select / start
   - cambio visual / estructural
   - sin tocar la lógica existente
========================================================= */

/* =========================================================
   MEDIDAS GENERALES DEL MANDO
========================================================= */

const PAD_WIDTH = 300;
const PAD_DEPTH = 170;
const PAD_HEIGHT = 1.8;

/*
  La superficie superior jugable del mando
  queda exactamente en Y = 0.
*/
const PAD_TOP_Y = 0;

/* =========================================================
   COLORES
========================================================= */

const COLORS = {
  underFloor: "#2a2523",

  shell: "#d6cdbd",
  shellShadow: "#beb3a1",

  inset: "#c7bca9",
  insetDark: "#b3a693",

  burgundy: "#7a2e3c",
  burgundyDark: "#57202b",

  darkGray: "#48484c",
  darkGray2: "#59595e",

  black: "#121215",
  blackSoft: "#202024",

  textGray: "#8d867e",
};

/* =========================================================
   POSICIONES MAESTRAS

   D-pad / Hall:
   - lo coloca Museum.jsx

   Botones:
   - suficientemente grandes para futuro uso
   - proporcionales al hall
========================================================= */

const BUTTON_A_POS = [96, 0, -18];
const BUTTON_B_POS = [58, 0, 18];

const BUTTON_RADIUS = 27;

const SELECT_POS = [-2, 0, 34];
const START_POS = [30, 0, 34];

/* =========================================================
   SUELO INFERIOR GENERAL

   Solo para no dejar vacío alrededor del mando.
========================================================= */

function UnderFloor() {
  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
    >
      <mesh
        position={[
          0,
          -2.15,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            520,
            2,
            320,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.underFloor}
          roughness={1}
        />
      </mesh>
    </RigidBody>
  );
}

/* =========================================================
   CUERPO PRINCIPAL DEL MANDO
========================================================= */

function ControllerShell() {
  return (
    <group>
      {/* ===================================================
          CUERPO EXTERIOR CREMA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <RoundedBox
          position={[
            0,
            -PAD_HEIGHT / 2,
            0,
          ]}
          args={[
            PAD_WIDTH,
            PAD_HEIGHT,
            PAD_DEPTH,
          ]}
          radius={9}
          smoothness={4}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={COLORS.shell}
            roughness={0.86}
            metalness={0.03}
          />
        </RoundedBox>

        <CuboidCollider
          position={[
            0,
            -PAD_HEIGHT / 2,
            0,
          ]}
          args={[
            PAD_WIDTH / 2,
            PAD_HEIGHT / 2,
            PAD_DEPTH / 2,
          ]}
        />
      </RigidBody>

      {/* ===================================================
          PLACA INTERIOR SUAVE

          Unifica el "play area".
      =================================================== */}

      <RoundedBox
        position={[
          0,
          -0.045,
          0,
        ]}
        args={[
          280,
          0.09,
          148,
        ]}
        radius={7}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial
          color={COLORS.inset}
          roughness={0.9}
          metalness={0.02}
        />
      </RoundedBox>

      {/* ===================================================
          PLACA BORDÓ DERECHA

          Zona visual de botones / acciones.
      =================================================== */}

      <RoundedBox
        position={[
          70,
          -0.03,
          8,
        ]}
        args={[
          150,
          0.06,
          78,
        ]}
        radius={6}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.82}
          metalness={0.02}
        />
      </RoundedBox>

      {/* ===================================================
          PLACA CENTRAL PARA SELECT / START
      =================================================== */}

      <RoundedBox
        position={[
          14,
          -0.028,
          34,
        ]}
        args={[
          92,
          0.055,
          26,
        ]}
        radius={4}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial
          color={COLORS.insetDark}
          roughness={0.88}
          metalness={0.02}
        />
      </RoundedBox>

      {/* ===================================================
          SOMBRA IZQUIERDA BAJO LA CRUCETA-HALL

          Ayuda a integrarla como parte real del mando.
      =================================================== */}

      <RoundedBox
        position={[
          -89,
          -0.025,
          0,
        ]}
        args={[
          118,
          0.05,
          118,
        ]}
        radius={8}
        smoothness={4}
        receiveShadow
      >
        <meshStandardMaterial
          color={COLORS.blackSoft}
          roughness={0.95}
          metalness={0.01}
        />
      </RoundedBox>
    </group>
  );
}

/* =========================================================
   BOTÓN CIRCULAR

   Por ahora:
   - gran volumen visual
   - proporcional
   - preparado para futuro uso como sala

   Se mantiene al ras del mando para no romper
   la caminata ni exigir salto.
========================================================= */

function ActionButton({
  position,
  label,
}) {
  return (
    <group position={position}>
      {/* anillo exterior */}

      <mesh
        position={[
          0,
          -0.05,
          0,
        ]}
        receiveShadow
        castShadow
      >
        <cylinderGeometry
          args={[
            BUTTON_RADIUS,
            BUTTON_RADIUS,
            0.1,
            48,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundyDark}
          roughness={0.8}
          metalness={0.02}
        />
      </mesh>

      {/* cara superior */}

      <mesh
        position={[
          0,
          -0.03,
          0,
        ]}
        receiveShadow
        castShadow
      >
        <cylinderGeometry
          args={[
            BUTTON_RADIUS - 4,
            BUTTON_RADIUS - 4,
            0.06,
            48,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.72}
          metalness={0.04}
        />
      </mesh>

      {/* núcleo oscuro */}

      <mesh
        position={[
          0,
          -0.01,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            BUTTON_RADIUS - 9,
            BUTTON_RADIUS - 9,
            0.02,
            40,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.blackSoft}
          roughness={0.94}
          metalness={0.01}
        />
      </mesh>

      {/* letra */}

      <mesh
        position={[
          0,
          0.004,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <ringGeometry
          args={[
            0.001,
            0.0015,
            8,
          ]}
        />
        <meshBasicMaterial
          transparent
          opacity={0}
        />
      </mesh>

      <group
        position={[
          0,
          0.008,
          0,
        ]}
      >
        <mesh>
          <boxGeometry
            args={[
              0.001,
              0.001,
              0.001,
            ]}
          />
          <meshBasicMaterial
            transparent
            opacity={0}
          />
        </mesh>
      </group>
    </group>
  );
}

/* =========================================================
   BOTONES SELECT / START
========================================================= */

function CenterButton({
  position,
  width = 24,
  depth = 9,
  color = COLORS.darkGray,
}) {
  return (
    <RoundedBox
      position={[
        position[0],
        -0.035,
        position[2],
      ]}
      args={[
        width,
        0.07,
        depth,
      ]}
      radius={2.3}
      smoothness={4}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={0.78}
        metalness={0.05}
      />
    </RoundedBox>
  );
}

/* =========================================================
   DETALLES VISUALES
========================================================= */

function ControllerDetails() {
  return (
    <group>
      {/* línea bordó inferior */}

      <RoundedBox
        position={[
          0,
          -0.02,
          -54,
        ]}
        args={[
          214,
          0.04,
          10,
        ]}
        radius={2}
        smoothness={3}
      >
        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.82}
        />
      </RoundedBox>

      {/* línea bordó superior */}

      <RoundedBox
        position={[
          0,
          -0.02,
          58,
        ]}
        args={[
          214,
          0.04,
          8,
        ]}
        radius={2}
        smoothness={3}
      >
        <meshStandardMaterial
          color={COLORS.burgundy}
          roughness={0.82}
        />
      </RoundedBox>

      {/* select */}

      <CenterButton
        position={SELECT_POS}
        width={24}
        depth={9}
        color={COLORS.darkGray2}
      />

      {/* start */}

      <CenterButton
        position={START_POS}
        width={24}
        depth={9}
        color={COLORS.darkGray}
      />

      {/* A */}

      <ActionButton
        position={BUTTON_A_POS}
        label="A"
      />

      {/* B */}

      <ActionButton
        position={BUTTON_B_POS}
        label="B"
      />
    </group>
  );
}

/* =========================================================
   WORLD ENVIRONMENT
========================================================= */

export default function WorldEnvironment() {
  return (
    <group>
      <UnderFloor />

      <ControllerShell />

      <ControllerDetails />

      {/* ===================================================
          MUSEUM = CRUCETA / HALL

          Se posiciona aparte en Museum.jsx
      =================================================== */}

      <Museum />
    </group>
  );
}
