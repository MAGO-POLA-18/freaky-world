"use client";

import { RoundedBox } from "@react-three/drei";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   TIERRA VICIO — MAIN HALL

   NUEVA VERSIÓN

   - una sola planta
   - cruceta compacta
   - entrada orientada hacia +Z
   - suelo físico en Y = 0
   - espacio central continuo
========================================================= */

/* =========================================================
   MEDIDAS
========================================================= */

const ARM_WIDTH = 28;
const ARM_LENGTH = 34;

const CENTER_SIZE = 34;

const WALL_HEIGHT = 8.5;
const WALL_THICKNESS = 0.5;

const FLOOR_THICKNESS = 0.22;
const ROOF_THICKNESS = 0.3;

/* =========================================================
   ENTRADA SUR

   Cuando el edificio esté colocado al norte del patio,
   +Z apunta hacia la plaza.
========================================================= */

const DOOR_WIDTH = 10;
const DOOR_HEIGHT = 5.3;

/* =========================================================
   COLORES
========================================================= */

const COLORS = {
  floor: "#25292d",
  floorCenter: "#2d3237",

  wall: "#202428",
  wallAlt: "#292e33",
  wallBase: "#15181b",

  roof: "#131619",
  metal: "#3c4248",

  purple: "#7656d6",
  purpleDark: "#46327e",

  entrance: "#111418",
};

/* =========================================================
   DIMENSIONES DERIVADAS
========================================================= */

const HALF_CENTER =
  CENTER_SIZE / 2;

const HALF_ARM_WIDTH =
  ARM_WIDTH / 2;

const HALF_ARM_LENGTH =
  ARM_LENGTH / 2;

const NORTH_Z =
  -HALF_CENTER -
  HALF_ARM_LENGTH;

const SOUTH_Z =
  HALF_CENTER +
  HALF_ARM_LENGTH;

const EAST_X =
  HALF_CENTER +
  HALF_ARM_LENGTH;

const WEST_X =
  -HALF_CENTER -
  HALF_ARM_LENGTH;

const NORTH_END_Z =
  -HALF_CENTER -
  ARM_LENGTH;

const SOUTH_END_Z =
  HALF_CENTER +
  ARM_LENGTH;

const EAST_END_X =
  HALF_CENTER +
  ARM_LENGTH;

const WEST_END_X =
  -HALF_CENTER -
  ARM_LENGTH;

/* =========================================================
   PARED
========================================================= */

function Wall({
  position,
  size,
  color = COLORS.wall,
}) {
  return (
    <RoundedBox
      position={position}
      args={size}
      radius={0.16}
      smoothness={3}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={0.75}
        metalness={0.05}
      />
    </RoundedBox>
  );
}

/* =========================================================
   SUELO
========================================================= */

function FloorBlock({
  position,
  size,
  color = COLORS.floor,
}) {
  return (
    <>
      <mesh
        position={[
          position[0],
          -FLOOR_THICKNESS / 2,
          position[2],
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            size[0],
            FLOOR_THICKNESS,
            size[2],
          ]}
        />

        <meshStandardMaterial
          color={color}
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>

      <CuboidCollider
        position={[
          position[0],
          -FLOOR_THICKNESS / 2,
          position[2],
        ]}
        args={[
          size[0] / 2,
          FLOOR_THICKNESS / 2,
          size[2] / 2,
        ]}
      />
    </>
  );
}

/* =========================================================
   TECHO
========================================================= */

function RoofBlock({
  position,
  size,
}) {
  return (
    <mesh
      position={[
        position[0],
        WALL_HEIGHT +
          ROOF_THICKNESS / 2,
        position[2],
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry
        args={[
          size[0],
          ROOF_THICKNESS,
          size[2],
        ]}
      />

      <meshStandardMaterial
        color={COLORS.roof}
        roughness={0.64}
        metalness={0.12}
      />
    </mesh>
  );
}

/* =========================================================
   GUÍAS DEL SUELO

   Solo visuales.
========================================================= */

function FloorGuides() {
  const fullLength =
    CENTER_SIZE +
    ARM_LENGTH * 2 -
    3;

  return (
    <group>
      <mesh
        position={[
          0,
          0.012,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.1,
            0.018,
            fullLength,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.purple}
          emissive={COLORS.purpleDark}
          emissiveIntensity={0.24}
          roughness={0.6}
        />
      </mesh>

      <mesh
        position={[
          0,
          0.013,
          0,
        ]}
      >
        <boxGeometry
          args={[
            fullLength,
            0.018,
            0.1,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.purple}
          emissive={COLORS.purpleDark}
          emissiveIntensity={0.24}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   ENTRADA

   Apertura real en el extremo SUR.
========================================================= */

function SouthEntrance() {
  const remainingWidth =
    (
      ARM_WIDTH -
      DOOR_WIDTH
    ) / 2;

  const sideX =
    DOOR_WIDTH / 2 +
    remainingWidth / 2;

  const lintelHeight =
    WALL_HEIGHT -
    DOOR_HEIGHT;

  const lintelY =
    DOOR_HEIGHT +
    lintelHeight / 2;

  return (
    <group>
      {/* pared izquierda */}

      <Wall
        position={[
          -sideX,
          WALL_HEIGHT / 2,
          SOUTH_END_Z,
        ]}
        size={[
          remainingWidth,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wallAlt}
      />

      {/* pared derecha */}

      <Wall
        position={[
          sideX,
          WALL_HEIGHT / 2,
          SOUTH_END_Z,
        ]}
        size={[
          remainingWidth,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wallAlt}
      />

      {/* dintel */}

      <Wall
        position={[
          0,
          lintelY,
          SOUTH_END_Z,
        ]}
        size={[
          DOOR_WIDTH,
          lintelHeight,
          WALL_THICKNESS,
        ]}
        color={COLORS.wall}
      />

      {/* pilares metálicos */}

      <RoundedBox
        position={[
          -DOOR_WIDTH / 2 -
            0.18,
          DOOR_HEIGHT / 2,
          SOUTH_END_Z +
            0.2,
        ]}
        args={[
          0.38,
          DOOR_HEIGHT,
          0.4,
        ]}
        radius={0.1}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.metal}
          roughness={0.5}
          metalness={0.25}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          DOOR_WIDTH / 2 +
            0.18,
          DOOR_HEIGHT / 2,
          SOUTH_END_Z +
            0.2,
        ]}
        args={[
          0.38,
          DOOR_HEIGHT,
          0.4,
        ]}
        radius={0.1}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.metal}
          roughness={0.5}
          metalness={0.25}
        />
      </RoundedBox>

      {/* marco superior */}

      <RoundedBox
        position={[
          0,
          DOOR_HEIGHT +
            0.2,
          SOUTH_END_Z +
            0.2,
        ]}
        args={[
          DOOR_WIDTH +
            0.75,
          0.38,
          0.4,
        ]}
        radius={0.1}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.metal}
          roughness={0.5}
          metalness={0.25}
        />
      </RoundedBox>

      {/* línea Tierra Vicio */}

      <mesh
        position={[
          0,
          DOOR_HEIGHT +
            0.43,
          SOUTH_END_Z +
            0.42,
        ]}
      >
        <boxGeometry
          args={[
            DOOR_WIDTH +
              0.15,
            0.07,
            0.03,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.purple}
          emissive={COLORS.purpleDark}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PAREDES EXTERIORES
========================================================= */

function OuterWalls() {
  const y =
    WALL_HEIGHT / 2;

  return (
    <group>
      {/* ===================================================
          NORTE
      =================================================== */}

      <Wall
        position={[
          0,
          y,
          NORTH_END_Z,
        ]}
        size={[
          ARM_WIDTH,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
      />

      <Wall
        position={[
          -HALF_ARM_WIDTH,
          y,
          NORTH_Z,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          ARM_LENGTH,
        ]}
        color={COLORS.wallAlt}
      />

      <Wall
        position={[
          HALF_ARM_WIDTH,
          y,
          NORTH_Z,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          ARM_LENGTH,
        ]}
        color={COLORS.wallAlt}
      />

      {/* ===================================================
          SUR

          El extremo completo lo maneja SouthEntrance.
      =================================================== */}

      <Wall
        position={[
          -HALF_ARM_WIDTH,
          y,
          SOUTH_Z,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          ARM_LENGTH,
        ]}
        color={COLORS.wallAlt}
      />

      <Wall
        position={[
          HALF_ARM_WIDTH,
          y,
          SOUTH_Z,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          ARM_LENGTH,
        ]}
        color={COLORS.wallAlt}
      />

      <SouthEntrance />

      {/* ===================================================
          ESTE
      =================================================== */}

      <Wall
        position={[
          EAST_END_X,
          y,
          0,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          ARM_WIDTH,
        ]}
      />

      <Wall
        position={[
          EAST_X,
          y,
          -HALF_ARM_WIDTH,
        ]}
        size={[
          ARM_LENGTH,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wallAlt}
      />

      <Wall
        position={[
          EAST_X,
          y,
          HALF_ARM_WIDTH,
        ]}
        size={[
          ARM_LENGTH,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wallAlt}
      />

      {/* ===================================================
          OESTE
      =================================================== */}

      <Wall
        position={[
          WEST_END_X,
          y,
          0,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          ARM_WIDTH,
        ]}
      />

      <Wall
        position={[
          WEST_X,
          y,
          -HALF_ARM_WIDTH,
        ]}
        size={[
          ARM_LENGTH,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wallAlt}
      />

      <Wall
        position={[
          WEST_X,
          y,
          HALF_ARM_WIDTH,
        ]}
        size={[
          ARM_LENGTH,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wallAlt}
      />

      {/* ===================================================
          HOMBROS DEL CENTRO
      =================================================== */}

      <Wall
        position={[
          -15.5,
          y,
          -HALF_CENTER,
        ]}
        size={[
          3,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
      />

      <Wall
        position={[
          15.5,
          y,
          -HALF_CENTER,
        ]}
        size={[
          3,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
      />

      <Wall
        position={[
          -15.5,
          y,
          HALF_CENTER,
        ]}
        size={[
          3,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
      />

      <Wall
        position={[
          15.5,
          y,
          HALF_CENTER,
        ]}
        size={[
          3,
          WALL_HEIGHT,
          WALL_THICKNESS,
        ]}
      />

      <Wall
        position={[
          -HALF_CENTER,
          y,
          -15.5,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          3,
        ]}
      />

      <Wall
        position={[
          -HALF_CENTER,
          y,
          15.5,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          3,
        ]}
      />

      <Wall
        position={[
          HALF_CENTER,
          y,
          -15.5,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          3,
        ]}
      />

      <Wall
        position={[
          HALF_CENTER,
          y,
          15.5,
        ]}
        size={[
          WALL_THICKNESS,
          WALL_HEIGHT,
          3,
        ]}
      />
    </group>
  );
}

/* =========================================================
   COLISIONES
========================================================= */

function WallColliders() {
  const y =
    WALL_HEIGHT / 2;

  const remainingWidth =
    (
      ARM_WIDTH -
      DOOR_WIDTH
    ) / 2;

  const sideX =
    DOOR_WIDTH / 2 +
    remainingWidth / 2;

  const lintelHeight =
    WALL_HEIGHT -
    DOOR_HEIGHT;

  const lintelY =
    DOOR_HEIGHT +
    lintelHeight / 2;

  return (
    <>
      {/* NORTE */}

      <CuboidCollider
        position={[
          0,
          y,
          NORTH_END_Z,
        ]}
        args={[
          ARM_WIDTH / 2,
          WALL_HEIGHT / 2,
          WALL_THICKNESS / 2,
        ]}
      />

      <CuboidCollider
        position={[
          -HALF_ARM_WIDTH,
          y,
          NORTH_Z,
        ]}
        args={[
          WALL_THICKNESS / 2,
          WALL_HEIGHT / 2,
          ARM_LENGTH / 2,
        ]}
      />

      <CuboidCollider
        position={[
          HALF_ARM_WIDTH,
          y,
          NORTH_Z,
        ]}
        args={[
          WALL_THICKNESS / 2,
          WALL_HEIGHT / 2,
          ARM_LENGTH / 2,
        ]}
      />

      {/* SUR LATERALES */}

      <CuboidCollider
        position={[
          -HALF_ARM_WIDTH,
          y,
          SOUTH_Z,
        ]}
        args={[
          WALL_THICKNESS / 2,
          WALL_HEIGHT / 2,
          ARM_LENGTH / 2,
        ]}
      />

      <CuboidCollider
        position={[
          HALF_ARM_WIDTH,
          y,
          SOUTH_Z,
        ]}
        args={[
          WALL_THICKNESS / 2,
          WALL_HEIGHT / 2,
          ARM_LENGTH / 2,
        ]}
      />

      {/* ENTRADA SUR */}

      <CuboidCollider
        position={[
          -sideX,
          y,
          SOUTH_END_Z,
        ]}
        args={[
          remainingWidth / 2,
          WALL_HEIGHT / 2,
          WALL_THICKNESS / 2,
        ]}
      />

      <CuboidCollider
        position={[
          sideX,
          y,
          SOUTH_END_Z,
        ]}
        args={[
          remainingWidth / 2,
          WALL_HEIGHT / 2,
          WALL_THICKNESS / 2,
        ]}
      />

      <CuboidCollider
        position={[
          0,
          lintelY,
          SOUTH_END_Z,
        ]}
        args={[
          DOOR_WIDTH / 2,
          lintelHeight / 2,
          WALL_THICKNESS / 2,
        ]}
      />

      {/* ESTE */}

      <CuboidCollider
        position={[
          EAST_END_X,
          y,
          0,
        ]}
        args={[
          WALL_THICKNESS / 2,
          WALL_HEIGHT / 2,
          ARM_WIDTH / 2,
        ]}
      />

      <CuboidCollider
        position={[
          EAST_X,
          y,
          -HALF_ARM_WIDTH,
        ]}
        args={[
          ARM_LENGTH / 2,
          WALL_HEIGHT / 2,
          WALL_THICKNESS / 2,
        ]}
      />

      <CuboidCollider
        position={[
          EAST_X,
          y,
          HALF_ARM_WIDTH,
        ]}
        args={[
          ARM_LENGTH / 2,
          WALL_HEIGHT / 2,
          WALL_THICKNESS / 2,
        ]}
      />

      {/* OESTE */}

      <CuboidCollider
        position={[
          WEST_END_X,
          y,
          0,
        ]}
        args={[
          WALL_THICKNESS / 2,
          WALL_HEIGHT / 2,
          ARM_WIDTH / 2,
        ]}
      />

      <CuboidCollider
        position={[
          WEST_X,
          y,
          -HALF_ARM_WIDTH,
        ]}
        args={[
          ARM_LENGTH / 2,
          WALL_HEIGHT / 2,
          WALL_THICKNESS / 2,
        ]}
      />

      <CuboidCollider
        position={[
          WEST_X,
          y,
          HALF_ARM_WIDTH,
        ]}
        args={[
          ARM_LENGTH / 2,
          WALL_HEIGHT / 2,
          WALL_THICKNESS / 2,
        ]}
      />
    </>
  );
}

/* =========================================================
   MAIN HALL
========================================================= */

export default function MainHall({
  children = null,
  position = [
    0,
    0,
    0,
  ],
}) {
  return (
    <group
      position={position}
    >
      {/* ===================================================
          FÍSICA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {/* CENTRO */}

        <FloorBlock
          position={[
            0,
            0,
            0,
          ]}
          size={[
            CENTER_SIZE,
            FLOOR_THICKNESS,
            CENTER_SIZE,
          ]}
          color={COLORS.floorCenter}
        />

        {/* NORTE */}

        <FloorBlock
          position={[
            0,
            0,
            NORTH_Z,
          ]}
          size={[
            ARM_WIDTH,
            FLOOR_THICKNESS,
            ARM_LENGTH,
          ]}
        />

        {/* SUR */}

        <FloorBlock
          position={[
            0,
            0,
            SOUTH_Z,
          ]}
          size={[
            ARM_WIDTH,
            FLOOR_THICKNESS,
            ARM_LENGTH,
          ]}
        />

        {/* ESTE */}

        <FloorBlock
          position={[
            EAST_X,
            0,
            0,
          ]}
          size={[
            ARM_LENGTH,
            FLOOR_THICKNESS,
            ARM_WIDTH,
          ]}
        />

        {/* OESTE */}

        <FloorBlock
          position={[
            WEST_X,
            0,
            0,
          ]}
          size={[
            ARM_LENGTH,
            FLOOR_THICKNESS,
            ARM_WIDTH,
          ]}
        />

        <WallColliders />
      </RigidBody>

      {/* ===================================================
          ELEMENTOS VISUALES
      =================================================== */}

      <FloorGuides />

      <OuterWalls />

      {/* ===================================================
          TECHOS
      =================================================== */}

      <RoofBlock
        position={[
          0,
          0,
          0,
        ]}
        size={[
          CENTER_SIZE,
          ROOF_THICKNESS,
          CENTER_SIZE,
        ]}
      />

      <RoofBlock
        position={[
          0,
          0,
          NORTH_Z,
        ]}
        size={[
          ARM_WIDTH,
          ROOF_THICKNESS,
          ARM_LENGTH,
        ]}
      />

      <RoofBlock
        position={[
          0,
          0,
          SOUTH_Z,
        ]}
        size={[
          ARM_WIDTH,
          ROOF_THICKNESS,
          ARM_LENGTH,
        ]}
      />

      <RoofBlock
        position={[
          EAST_X,
          0,
          0,
        ]}
        size={[
          ARM_LENGTH,
          ROOF_THICKNESS,
          ARM_WIDTH,
        ]}
      />

      <RoofBlock
        position={[
          WEST_X,
          0,
          0,
        ]}
        size={[
          ARM_LENGTH,
          ROOF_THICKNESS,
          ARM_WIDTH,
        ]}
      />

      {children}
    </group>
  );
}
