"use client";

import { RoundedBox } from "@react-three/drei";
import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   D-PAD WING
   - esquinas exteriores rectas
   - sin mocheta exterior
   - sin cruceta interna rara
   - sin línea violeta visual
   - mantiene colisiones estables
========================================================= */

/* =========================================================
   MEDIDAS
========================================================= */

const WING_WIDTH = 60;
const WING_DEPTH = 70;
const WING_HEIGHT = 15;

const HALF_WIDTH = WING_WIDTH / 2;
const HALF_DEPTH = WING_DEPTH / 2;

const WALL_THICKNESS = 0.5;
const FLOOR_THICKNESS = 0.3;
const ROOF_THICKNESS = 0.35;

/* =========================================================
   ENTRADA
========================================================= */

const DOOR_WIDTH = 10;
const DOOR_HEIGHT = 6;

const SIDE_FRONT_WIDTH =
  (WING_WIDTH - DOOR_WIDTH) / 2;

/* =========================================================
   PALETA
========================================================= */

const COLORS = {
  wall: "#202327",
  sideWall: "#22262b",
  wallLower: "#171a1d",
  roof: "#14171a",
  roofTrim: "#353a40",
  floor: "#25292d",
  floorInset: "#30353a",
  floorBorder: "#181b1e",
  entranceFrame: "#454b52",
  entranceInner: "#15181b",
  metalDark: "#101216",
};

/* =========================================================
   HELPERS
========================================================= */

function SharpWall({
  position,
  args,
  color,
  roughness = 0.78,
  metalness = 0.04,
  castShadow = true,
  receiveShadow = true,
}) {
  return (
    <mesh
      position={position}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </mesh>
  );
}

function RoundedTrim({
  position,
  args,
  color,
  radius = 0.08,
  roughness = 0.7,
  metalness = 0.08,
}) {
  return (
    <RoundedBox
      position={position}
      args={args}
      radius={radius}
      smoothness={3}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
      />
    </RoundedBox>
  );
}

/* =========================================================
   CORNISA SUPERIOR
========================================================= */

function RoofTrim({
  frontZ,
  sideFrontX,
}) {
  const trimHeight = 0.42;
  const y =
    WING_HEIGHT -
    trimHeight / 2 -
    0.08;

  return (
    <group>
      {/* lateral izquierdo */}
      <RoundedTrim
        position={[
          -HALF_WIDTH + 0.22,
          y,
          0,
        ]}
        args={[
          0.18,
          trimHeight,
          WING_DEPTH,
        ]}
        color={COLORS.roofTrim}
      />

      {/* lateral derecho */}
      <RoundedTrim
        position={[
          HALF_WIDTH - 0.22,
          y,
          0,
        ]}
        args={[
          0.18,
          trimHeight,
          WING_DEPTH,
        ]}
        color={COLORS.roofTrim}
      />

      {/* fondo */}
      <RoundedTrim
        position={[
          0,
          y,
          -HALF_DEPTH + 0.22,
        ]}
        args={[
          WING_WIDTH,
          trimHeight,
          0.18,
        ]}
        color={COLORS.roofTrim}
      />

      {/* frente izquierdo */}
      <RoundedTrim
        position={[
          -sideFrontX,
          y,
          frontZ + 0.02,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          trimHeight,
          0.18,
        ]}
        color={COLORS.roofTrim}
      />

      {/* frente derecho */}
      <RoundedTrim
        position={[
          sideFrontX,
          y,
          frontZ + 0.02,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          trimHeight,
          0.18,
        ]}
        color={COLORS.roofTrim}
      />
    </group>
  );
}

/* =========================================================
   ZÓCALO
========================================================= */

function LowerTrim({
  frontZ,
  sideFrontX,
}) {
  const height = 0.82;
  const y = height / 2;

  return (
    <group>
      {/* lateral izquierdo */}
      <RoundedTrim
        position={[
          -HALF_WIDTH + 0.2,
          y,
          0,
        ]}
        args={[
          0.22,
          height,
          WING_DEPTH,
        ]}
        color={COLORS.wallLower}
        radius={0.07}
        roughness={0.9}
        metalness={0.02}
      />

      {/* lateral derecho */}
      <RoundedTrim
        position={[
          HALF_WIDTH - 0.2,
          y,
          0,
        ]}
        args={[
          0.22,
          height,
          WING_DEPTH,
        ]}
        color={COLORS.wallLower}
        radius={0.07}
        roughness={0.9}
        metalness={0.02}
      />

      {/* fondo */}
      <RoundedTrim
        position={[
          0,
          y,
          -HALF_DEPTH + 0.2,
        ]}
        args={[
          WING_WIDTH,
          height,
          0.22,
        ]}
        color={COLORS.wallLower}
        radius={0.07}
        roughness={0.9}
        metalness={0.02}
      />

      {/* frente izquierdo */}
      <RoundedTrim
        position={[
          -sideFrontX,
          y,
          frontZ + 0.03,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          height,
          0.22,
        ]}
        color={COLORS.wallLower}
        radius={0.07}
        roughness={0.9}
        metalness={0.02}
      />

      {/* frente derecho */}
      <RoundedTrim
        position={[
          sideFrontX,
          y,
          frontZ + 0.03,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          height,
          0.22,
        ]}
        color={COLORS.wallLower}
        radius={0.07}
        roughness={0.9}
        metalness={0.02}
      />
    </group>
  );
}

/* =========================================================
   ENTRADA
========================================================= */

function Entrance({
  frontZ,
}) {
  return (
    <group>
      {/* hueco oscuro */}
      <mesh
        position={[
          0,
          DOOR_HEIGHT / 2,
          frontZ - 0.16,
        ]}
      >
        <boxGeometry
          args={[
            DOOR_WIDTH - 0.4,
            DOOR_HEIGHT - 0.15,
            0.09,
          ]}
        />
        <meshStandardMaterial
          color={COLORS.entranceInner}
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* pilar izquierdo */}
      <RoundedBox
        position={[
          -DOOR_WIDTH / 2 - 0.22,
          DOOR_HEIGHT / 2,
          frontZ + 0.22,
        ]}
        args={[
          0.45,
          DOOR_HEIGHT + 0.18,
          0.45,
        ]}
        radius={0.14}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.entranceFrame}
          roughness={0.48}
          metalness={0.28}
        />
      </RoundedBox>

      {/* pilar derecho */}
      <RoundedBox
        position={[
          DOOR_WIDTH / 2 + 0.22,
          DOOR_HEIGHT / 2,
          frontZ + 0.22,
        ]}
        args={[
          0.45,
          DOOR_HEIGHT + 0.18,
          0.45,
        ]}
        radius={0.14}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.entranceFrame}
          roughness={0.48}
          metalness={0.28}
        />
      </RoundedBox>

      {/* travesaño */}
      <RoundedBox
        position={[
          0,
          DOOR_HEIGHT + 0.26,
          frontZ + 0.22,
        ]}
        args={[
          DOOR_WIDTH + 0.9,
          0.48,
          0.45,
        ]}
        radius={0.14}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.entranceFrame}
          roughness={0.48}
          metalness={0.28}
        />
      </RoundedBox>

      {/* marquesina */}
      <RoundedBox
        position={[
          0,
          DOOR_HEIGHT + 0.7,
          frontZ + 0.78,
        ]}
        args={[
          DOOR_WIDTH + 2.8,
          0.22,
          1.65,
        ]}
        radius={0.1}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial
          color={COLORS.metalDark}
          roughness={0.5}
          metalness={0.3}
        />
      </RoundedBox>
    </group>
  );
}

/* =========================================================
   TECHO SÓLIDO

   Importante:
   - quitamos el recurso visual que te estaba generando
     lecturas raras dentro del ala
   - nada de cruceta interna ni líneas violetas
========================================================= */

function SolidRoof() {
  return (
    <mesh
      position={[
        0,
        WING_HEIGHT +
          ROOF_THICKNESS / 2,
        0,
      ]}
      castShadow
      receiveShadow
    >
      <boxGeometry
        args={[
          WING_WIDTH,
          ROOF_THICKNESS,
          WING_DEPTH,
        ]}
      />
      <meshStandardMaterial
        color={COLORS.roof}
        roughness={0.68}
        metalness={0.12}
      />
    </mesh>
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  children = null,
}) {
  const frontZ =
    HALF_DEPTH -
    WALL_THICKNESS / 2;

  const sideFrontX =
    DOOR_WIDTH / 2 +
    SIDE_FRONT_WIDTH / 2;

  const lintelHeight =
    WING_HEIGHT - DOOR_HEIGHT;

  const lintelY =
    DOOR_HEIGHT +
    lintelHeight / 2;

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* contenido */}
      {children}

      {/* ===================================================
          SUELO BASE
      =================================================== */}

      <mesh
        position={[
          0,
          FLOOR_THICKNESS / 2,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            WING_WIDTH -
              WALL_THICKNESS * 2,
            FLOOR_THICKNESS,
            WING_DEPTH -
              WALL_THICKNESS * 2,
          ]}
        />
        <meshStandardMaterial
          color={COLORS.floorBorder}
          roughness={0.93}
          metalness={0.01}
        />
      </mesh>

      {/* superficie interior */}
      <mesh
        position={[
          0,
          FLOOR_THICKNESS + 0.018,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            WING_WIDTH - 2.1,
            0.035,
            WING_DEPTH - 2.1,
          ]}
        />
        <meshStandardMaterial
          color={COLORS.floor}
          roughness={0.76}
          metalness={0.06}
        />
      </mesh>

      {/* camino sutil */}
      <mesh
        position={[
          0,
          FLOOR_THICKNESS + 0.041,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            11,
            0.018,
            WING_DEPTH - 3.4,
          ]}
        />
        <meshStandardMaterial
          color={COLORS.floorInset}
          roughness={0.67}
          metalness={0.08}
        />
      </mesh>

      {/* ===================================================
          PAREDES PRINCIPALES

          Acá está la corrección importante:
          usamos paredes rectas, no redondeadas,
          para que la esquina exterior termine bien
          en ángulo de 90°.
      =================================================== */}

      {/* pared izquierda */}
      <SharpWall
        position={[
          -HALF_WIDTH +
            WALL_THICKNESS / 2,
          WING_HEIGHT / 2,
          0,
        ]}
        args={[
          WALL_THICKNESS,
          WING_HEIGHT,
          WING_DEPTH,
        ]}
        color={COLORS.sideWall}
      />

      {/* pared derecha */}
      <SharpWall
        position={[
          HALF_WIDTH -
            WALL_THICKNESS / 2,
          WING_HEIGHT / 2,
          0,
        ]}
        args={[
          WALL_THICKNESS,
          WING_HEIGHT,
          WING_DEPTH,
        ]}
        color={COLORS.sideWall}
      />

      {/* fondo */}
      <SharpWall
        position={[
          0,
          WING_HEIGHT / 2,
          -HALF_DEPTH +
            WALL_THICKNESS / 2,
        ]}
        args={[
          WING_WIDTH,
          WING_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wall}
      />

      {/* fachada izquierda */}
      <SharpWall
        position={[
          -sideFrontX,
          WING_HEIGHT / 2,
          frontZ,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          WING_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wall}
      />

      {/* fachada derecha */}
      <SharpWall
        position={[
          sideFrontX,
          WING_HEIGHT / 2,
          frontZ,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          WING_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={COLORS.wall}
      />

      {/* dintel */}
      <SharpWall
        position={[
          0,
          lintelY,
          frontZ,
        ]}
        args={[
          DOOR_WIDTH,
          lintelHeight,
          WALL_THICKNESS,
        ]}
        color={COLORS.wall}
      />

      {/* trims */}
      <LowerTrim
        frontZ={frontZ}
        sideFrontX={sideFrontX}
      />

      <RoofTrim
        frontZ={frontZ}
        sideFrontX={sideFrontX}
      />

      {/* entrada */}
      <Entrance frontZ={frontZ} />

      {/* techo */}
      <SolidRoof />

      {/* ===================================================
          COLISIONES

          Se mantienen muy parecidas para no romper
          la física ni la cámara.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {/* suelo */}
        <CuboidCollider
          args={[
            (
              WING_WIDTH -
              WALL_THICKNESS * 2
            ) / 2,
            FLOOR_THICKNESS / 2,
            (
              WING_DEPTH -
              WALL_THICKNESS * 2
            ) / 2,
          ]}
          position={[
            0,
            FLOOR_THICKNESS / 2,
            0,
          ]}
        />

        {/* lateral izquierdo */}
        <CuboidCollider
          args={[
            WALL_THICKNESS / 2,
            WING_HEIGHT / 2,
            (
              WING_DEPTH - 0.7
            ) / 2,
          ]}
          position={[
            -HALF_WIDTH +
              WALL_THICKNESS / 2,
            WING_HEIGHT / 2,
            0,
          ]}
        />

        {/* lateral derecho */}
        <CuboidCollider
          args={[
            WALL_THICKNESS / 2,
            WING_HEIGHT / 2,
            (
              WING_DEPTH - 0.7
            ) / 2,
          ]}
          position={[
            HALF_WIDTH -
              WALL_THICKNESS / 2,
            WING_HEIGHT / 2,
            0,
          ]}
        />

        {/* fondo */}
        <CuboidCollider
          args={[
            (
              WING_WIDTH - 0.7
            ) / 2,
            WING_HEIGHT / 2,
            WALL_THICKNESS / 2,
          ]}
          position={[
            0,
            WING_HEIGHT / 2,
            -HALF_DEPTH +
              WALL_THICKNESS / 2,
          ]}
        />

        {/* fachada izquierda */}
        <CuboidCollider
          args={[
            SIDE_FRONT_WIDTH / 2,
            WING_HEIGHT / 2,
            WALL_THICKNESS / 2,
          ]}
          position={[
            -sideFrontX,
            WING_HEIGHT / 2,
            frontZ,
          ]}
        />

        {/* fachada derecha */}
        <CuboidCollider
          args={[
            SIDE_FRONT_WIDTH / 2,
            WING_HEIGHT / 2,
            WALL_THICKNESS / 2,
          ]}
          position={[
            sideFrontX,
            WING_HEIGHT / 2,
            frontZ,
          ]}
        />

        {/* dintel */}
        <CuboidCollider
          args={[
            DOOR_WIDTH / 2,
            lintelHeight / 2,
            WALL_THICKNESS / 2,
          ]}
          position={[
            0,
            lintelY,
            frontZ,
          ]}
        />

        {/* techo */}
        <CuboidCollider
          args={[
            WING_WIDTH / 2,
            ROOF_THICKNESS / 2,
            WING_DEPTH / 2,
          ]}
          position={[
            0,
            WING_HEIGHT +
              ROOF_THICKNESS / 2,
            0,
          ]}
        />
      </RigidBody>
    </group>
  );
}
