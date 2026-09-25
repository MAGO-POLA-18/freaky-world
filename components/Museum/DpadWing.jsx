"use client";

import {
  useMemo,
} from "react";

import {
  RoundedBox,
  Edges,
} from "@react-three/drei";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

/* =========================================================
   MEDIDAS MAESTRAS
========================================================= */

const WING_WIDTH = 60;
const WING_DEPTH = 70;
const WING_HEIGHT = 15;

const HALF_WIDTH =
  WING_WIDTH / 2;

const HALF_DEPTH =
  WING_DEPTH / 2;

const WALL_THICKNESS = 0.5;
const FLOOR_THICKNESS = 0.3;
const ROOF_THICKNESS = 0.35;

/* =========================================================
   ENTRADA
========================================================= */

const DOOR_WIDTH = 10;
const DOOR_HEIGHT = 6;

const SIDE_FRONT_WIDTH =
  (
    WING_WIDTH -
    DOOR_WIDTH
  ) / 2;

/* =========================================================
   FLECHA DEL TECHO

   En coordenadas locales apunta hacia -Z.

   Al rotarse cada edificio:
   norte / sur / este / oeste
   obtiene automáticamente su dirección.
========================================================= */

function createArrowPath() {
  const path =
    new THREE.Path();

  path.moveTo(
    0,
    12
  );

  path.lineTo(
    8,
    3
  );

  path.lineTo(
    3.2,
    3
  );

  path.lineTo(
    3.2,
    -11
  );

  path.lineTo(
    -3.2,
    -11
  );

  path.lineTo(
    -3.2,
    3
  );

  path.lineTo(
    -8,
    3
  );

  path.lineTo(
    0,
    12
  );

  path.closePath();

  return path;
}

/* =========================================================
   TECHO CON HUECO REAL DE FLECHA
========================================================= */

function ArrowRoof({
  roofColor,
  glassColor,
}) {
  const roofGeometry =
    useMemo(() => {
      const shape =
        new THREE.Shape();

      shape.moveTo(
        -HALF_WIDTH,
        -HALF_DEPTH
      );

      shape.lineTo(
        HALF_WIDTH,
        -HALF_DEPTH
      );

      shape.lineTo(
        HALF_WIDTH,
        HALF_DEPTH
      );

      shape.lineTo(
        -HALF_WIDTH,
        HALF_DEPTH
      );

      shape.closePath();

      const arrow =
        createArrowPath();

      shape.holes.push(
        arrow
      );

      const geometry =
        new THREE.ExtrudeGeometry(
          shape,
          {
            depth:
              ROOF_THICKNESS,

            bevelEnabled:
              false,

            curveSegments:
              1,
          }
        );

      geometry.computeVertexNormals();

      return geometry;
    }, []);

  const glassGeometry =
    useMemo(() => {
      const shape =
        new THREE.Shape();

      shape.moveTo(
        0,
        12
      );

      shape.lineTo(
        8,
        3
      );

      shape.lineTo(
        3.2,
        3
      );

      shape.lineTo(
        3.2,
        -11
      );

      shape.lineTo(
        -3.2,
        -11
      );

      shape.lineTo(
        -3.2,
        3
      );

      shape.lineTo(
        -8,
        3
      );

      shape.closePath();

      return new THREE.ShapeGeometry(
        shape
      );
    }, []);

  return (
    <group>
      {/* ===================================================
          TECHO
      =================================================== */}

      <mesh
        geometry={
          roofGeometry
        }
        position={[
          0,
          WING_HEIGHT,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={
            roofColor
          }
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* ===================================================
          VIDRIO CONTINUO EN FORMA DE FLECHA
      =================================================== */}

      <mesh
        geometry={
          glassGeometry
        }
        position={[
          0,
          WING_HEIGHT +
            0.055,
          0,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
      >
        <meshPhysicalMaterial
          color={
            glassColor
          }
          transparent
          opacity={0.43}
          transmission={0.55}
          roughness={0.08}
          metalness={0.02}
          side={
            THREE.DoubleSide
          }
        />

        <Edges
          threshold={15}
          scale={1.004}
          color="#182329"
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   PARED REDONDEADA
========================================================= */

function RoundedWall({
  position,
  args,
  color,
  radius = 0.2,
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
        roughness={0.86}
        metalness={0.02}
      />
    </RoundedBox>
  );
}

/* =========================================================
   ALA

   children permite meter contenido distinto dentro
   de cada ala sin duplicar la carcasa.

   Ejemplo:

   <DpadWing>
     <PopularTodayHall />
   </DpadWing>
========================================================= */

export default function DpadWing({
  position = [
    0,
    0,
    0,
  ],

  rotation = [
    0,
    0,
    0,
  ],

  children = null,
}) {
  /* =======================================================
     COLORES
  ======================================================= */

  const wallColor =
    "#1a1d20";

  const sideColor =
    "#22272b";

  const roofColor =
    "#121416";

  const floorColor =
    "#24292b";

  const glassColor =
    "#76b8dc";

  const entranceFrameColor =
    "#343a40";

  /* =======================================================
     ENTRADA
  ======================================================= */

  const frontZ =
    HALF_DEPTH -
    WALL_THICKNESS /
      2;

  const sideFrontX =
    DOOR_WIDTH /
      2 +
    SIDE_FRONT_WIDTH /
      2;

  const lintelHeight =
    WING_HEIGHT -
    DOOR_HEIGHT;

  const lintelY =
    DOOR_HEIGHT +
    lintelHeight /
      2;

  /* =======================================================
     ESQUINAS
  ======================================================= */

  const corners = [
    [
      -HALF_WIDTH +
        0.35,

      WING_HEIGHT /
        2,

      -HALF_DEPTH +
        0.35,
    ],

    [
      HALF_WIDTH -
        0.35,

      WING_HEIGHT /
        2,

      -HALF_DEPTH +
        0.35,
    ],

    [
      -HALF_WIDTH +
        0.35,

      WING_HEIGHT /
        2,

      HALF_DEPTH -
        0.35,
    ],

    [
      HALF_WIDTH -
        0.35,

      WING_HEIGHT /
        2,

      HALF_DEPTH -
        0.35,
    ],
  ];

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* ===================================================
          CONTENIDO DEL ALA

          Acá aparecerá PopularTodayHall en el norte.

          Las demás alas pueden quedar vacías.
      =================================================== */}

      {children}

      {/* ===================================================
          SUELO LIMPIO
      =================================================== */}

      <mesh
        position={[
          0,

          FLOOR_THICKNESS /
            2,

          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            WING_WIDTH -
              WALL_THICKNESS *
                2,

            FLOOR_THICKNESS,

            WING_DEPTH -
              WALL_THICKNESS *
                2,
          ]}
        />

        <meshStandardMaterial
          color={
            floorColor
          }
          roughness={0.94}
        />
      </mesh>

      {/* ===================================================
          LATERAL IZQUIERDO
      =================================================== */}

      <RoundedWall
        position={[
          -HALF_WIDTH +
            WALL_THICKNESS /
              2,

          WING_HEIGHT /
            2,

          0,
        ]}
        args={[
          WALL_THICKNESS,
          WING_HEIGHT,
          WING_DEPTH -
            0.7,
        ]}
        color={
          sideColor
        }
      />

      {/* ===================================================
          LATERAL DERECHO
      =================================================== */}

      <RoundedWall
        position={[
          HALF_WIDTH -
            WALL_THICKNESS /
              2,

          WING_HEIGHT /
            2,

          0,
        ]}
        args={[
          WALL_THICKNESS,
          WING_HEIGHT,
          WING_DEPTH -
            0.7,
        ]}
        color={
          sideColor
        }
      />

      {/* ===================================================
          FONDO
      =================================================== */}

      <RoundedWall
        position={[
          0,

          WING_HEIGHT /
            2,

          -HALF_DEPTH +
            WALL_THICKNESS /
              2,
        ]}
        args={[
          WING_WIDTH -
            0.7,

          WING_HEIGHT,

          WALL_THICKNESS,
        ]}
        color={
          wallColor
        }
      />

      {/* ===================================================
          FACHADA IZQUIERDA
      =================================================== */}

      <RoundedWall
        position={[
          -sideFrontX,

          WING_HEIGHT /
            2,

          frontZ,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          WING_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={
          wallColor
        }
      />

      {/* ===================================================
          FACHADA DERECHA
      =================================================== */}

      <RoundedWall
        position={[
          sideFrontX,

          WING_HEIGHT /
            2,

          frontZ,
        ]}
        args={[
          SIDE_FRONT_WIDTH,
          WING_HEIGHT,
          WALL_THICKNESS,
        ]}
        color={
          wallColor
        }
      />

      {/* ===================================================
          DINTEL
      =================================================== */}

      <RoundedWall
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
        color={
          wallColor
        }
      />

      {/* ===================================================
          MARCO DE ENTRADA
      =================================================== */}

      <RoundedBox
        position={[
          -DOOR_WIDTH /
            2 -
            0.18,

          DOOR_HEIGHT /
            2,

          frontZ +
            0.18,
        ]}
        args={[
          0.35,
          DOOR_HEIGHT,
          0.35,
        ]}
        radius={0.14}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            entranceFrameColor
          }
          roughness={0.65}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          DOOR_WIDTH /
            2 +
            0.18,

          DOOR_HEIGHT /
            2,

          frontZ +
            0.18,
        ]}
        args={[
          0.35,
          DOOR_HEIGHT,
          0.35,
        ]}
        radius={0.14}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            entranceFrameColor
          }
          roughness={0.65}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,

          DOOR_HEIGHT +
            0.18,

          frontZ +
            0.18,
        ]}
        args={[
          DOOR_WIDTH +
            0.7,

          0.35,

          0.35,
        ]}
        radius={0.14}
        smoothness={3}
      >
        <meshStandardMaterial
          color={
            entranceFrameColor
          }
          roughness={0.65}
        />
      </RoundedBox>

      {/* ===================================================
          ESQUINAS SUAVES
      =================================================== */}

      {corners.map(
        (
          corner,
          index
        ) => (
          <mesh
            key={
              `corner-${index}`
            }
            position={
              corner
            }
            castShadow
            receiveShadow
          >
            <cylinderGeometry
              args={[
                0.72,
                0.72,
                WING_HEIGHT,
                18,
              ]}
            />

            <meshStandardMaterial
              color={
                sideColor
              }
              roughness={0.84}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          TECHO + FLECHA
      =================================================== */}

      <ArrowRoof
        roofColor={
          roofColor
        }
        glassColor={
          glassColor
        }
      />

      {/* ===================================================
          COLISIONES
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {/* SUELO */}

        <CuboidCollider
          args={[
            (
              WING_WIDTH -
              WALL_THICKNESS *
                2
            ) /
              2,

            FLOOR_THICKNESS /
              2,

            (
              WING_DEPTH -
              WALL_THICKNESS *
                2
            ) /
              2,
          ]}
          position={[
            0,

            FLOOR_THICKNESS /
              2,

            0,
          ]}
        />

        {/* LATERAL IZQUIERDO */}

        <CuboidCollider
          args={[
            WALL_THICKNESS /
              2,

            WING_HEIGHT /
              2,

            (
              WING_DEPTH -
              0.7
            ) /
              2,
          ]}
          position={[
            -HALF_WIDTH +
              WALL_THICKNESS /
                2,

            WING_HEIGHT /
              2,

            0,
          ]}
        />

        {/* LATERAL DERECHO */}

        <CuboidCollider
          args={[
            WALL_THICKNESS /
              2,

            WING_HEIGHT /
              2,

            (
              WING_DEPTH -
              0.7
            ) /
              2,
          ]}
          position={[
            HALF_WIDTH -
              WALL_THICKNESS /
                2,

            WING_HEIGHT /
              2,

            0,
          ]}
        />

        {/* FONDO */}

        <CuboidCollider
          args={[
            (
              WING_WIDTH -
              0.7
            ) /
              2,

            WING_HEIGHT /
              2,

            WALL_THICKNESS /
              2,
          ]}
          position={[
            0,

            WING_HEIGHT /
              2,

            -HALF_DEPTH +
              WALL_THICKNESS /
                2,
          ]}
        />

        {/* FACHADA IZQUIERDA */}

        <CuboidCollider
          args={[
            SIDE_FRONT_WIDTH /
              2,

            WING_HEIGHT /
              2,

            WALL_THICKNESS /
              2,
          ]}
          position={[
            -sideFrontX,

            WING_HEIGHT /
              2,

            frontZ,
          ]}
        />

        {/* FACHADA DERECHA */}

        <CuboidCollider
          args={[
            SIDE_FRONT_WIDTH /
              2,

            WING_HEIGHT /
              2,

            WALL_THICKNESS /
              2,
          ]}
          position={[
            sideFrontX,

            WING_HEIGHT /
              2,

            frontZ,
          ]}
        />

        {/* DINTEL */}

        <CuboidCollider
          args={[
            DOOR_WIDTH /
              2,

            lintelHeight /
              2,

            WALL_THICKNESS /
              2,
          ]}
          position={[
            0,
            lintelY,
            frontZ,
          ]}
        />

        {/* =================================================
            TECHO FÍSICO

            Una placa física completa.

            La flecha es visual/transparente,
            pero no dejamos que el jugador salga
            atravesando el techo.
        ================================================= */}

        <CuboidCollider
          args={[
            WING_WIDTH /
              2,

            ROOF_THICKNESS /
              2,

            WING_DEPTH /
              2,
          ]}
          position={[
            0,

            WING_HEIGHT +
              ROOF_THICKNESS /
                2,

            0,
          ]}
        />
      </RigidBody>
    </group>
  );
}
