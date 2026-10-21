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
   FREAKY WORLD
   D-PAD WING

   IMPORTANTE:
   - esquinas visuales limpias a 90º
   - sin pilares/mochetas exteriores
   - colisiones actuales conservadas
   - no afecta CameraRig
========================================================= */

/* =========================================================
   MEDIDAS
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
   COLORES
========================================================= */

const COLORS = {
  wall:
    "#202327",

  sideWall:
    "#262a2f",

  wallLower:
    "#171a1d",

  roof:
    "#14171a",

  roofTrim:
    "#353a40",

  floor:
    "#25292d",

  floorInset:
    "#30353a",

  floorBorder:
    "#181b1e",

  entranceFrame:
    "#454b52",

  entranceInner:
    "#15181b",

  accent:
    "#7656d6",

  accentDark:
    "#493685",

  glass:
    "#6fa9c9",

  glassEdge:
    "#17252d",

  metalDark:
    "#101216",
};

/* =========================================================
   FLECHA
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
   MATERIAL
========================================================= */

function WallMaterial({
  color,
  roughness = 0.78,
  metalness = 0.04,
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
    />
  );
}

/* =========================================================
   PARED
========================================================= */

function RoundedWall({
  position,
  args,
  color,
  radius = 0.2,
  roughness = 0.78,
  metalness = 0.04,
  castShadow = true,
  receiveShadow = true,
}) {
  return (
    <RoundedBox
      position={position}
      args={args}
      radius={radius}
      smoothness={3}
      castShadow={
        castShadow
      }
      receiveShadow={
        receiveShadow
      }
    >
      <WallMaterial
        color={color}
        roughness={
          roughness
        }
        metalness={
          metalness
        }
      />
    </RoundedBox>
  );
}

/* =========================================================
   TECHO
========================================================= */

function ArrowRoof() {
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

      shape.holes.push(
        createArrowPath()
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
            COLORS.roof
          }

          roughness={0.68}
          metalness={0.12}
        />
      </mesh>

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
            COLORS.glass
          }

          transparent
          opacity={0.48}
          transmission={0.34}
          roughness={0.18}
          metalness={0.03}
          clearcoat={0.2}

          clearcoatRoughness={
            0.25
          }

          side={
            THREE.DoubleSide
          }
        />

        <Edges
          threshold={15}
          scale={1.004}

          color={
            COLORS.glassEdge
          }
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   CORNISA

   Ahora llega limpia hasta las esquinas.
========================================================= */

function RoofTrim({
  frontZ,
  sideFrontX,
}) {
  const trimHeight =
    0.42;

  const y =
    WING_HEIGHT -
    trimHeight / 2 -
    0.08;

  return (
    <group>
      <RoundedWall
        position={[
          -HALF_WIDTH +
            0.27,
          y,
          0,
        ]}

        args={[
          0.22,
          trimHeight,
          WING_DEPTH,
        ]}

        color={
          COLORS.roofTrim
        }

        radius={0.08}
        roughness={0.56}
        metalness={0.18}
      />

      <RoundedWall
        position={[
          HALF_WIDTH -
            0.27,
          y,
          0,
        ]}

        args={[
          0.22,
          trimHeight,
          WING_DEPTH,
        ]}

        color={
          COLORS.roofTrim
        }

        radius={0.08}
        roughness={0.56}
        metalness={0.18}
      />

      <RoundedWall
        position={[
          0,
          y,
          -HALF_DEPTH +
            0.27,
        ]}

        args={[
          WING_WIDTH,
          trimHeight,
          0.22,
        ]}

        color={
          COLORS.roofTrim
        }

        radius={0.08}
        roughness={0.56}
        metalness={0.18}
      />

      <RoundedWall
        position={[
          -sideFrontX,
          y,
          frontZ +
            0.03,
        ]}

        args={[
          SIDE_FRONT_WIDTH,
          trimHeight,
          0.22,
        ]}

        color={
          COLORS.roofTrim
        }

        radius={0.08}
        roughness={0.56}
        metalness={0.18}
      />

      <RoundedWall
        position={[
          sideFrontX,
          y,
          frontZ +
            0.03,
        ]}

        args={[
          SIDE_FRONT_WIDTH,
          trimHeight,
          0.22,
        ]}

        color={
          COLORS.roofTrim
        }

        radius={0.08}
        roughness={0.56}
        metalness={0.18}
      />
    </group>
  );
}

/* =========================================================
   ZÓCALO

   También cierra directamente contra la pared contigua.
========================================================= */

function LowerTrim({
  frontZ,
  sideFrontX,
}) {
  const height =
    0.82;

  const y =
    height / 2;

  return (
    <group>
      <RoundedWall
        position={[
          -HALF_WIDTH +
            0.22,
          y,
          0,
        ]}

        args={[
          0.28,
          height,
          WING_DEPTH,
        ]}

        color={
          COLORS.wallLower
        }

        radius={0.09}
        roughness={0.9}
        metalness={0.02}
      />

      <RoundedWall
        position={[
          HALF_WIDTH -
            0.22,
          y,
          0,
        ]}

        args={[
          0.28,
          height,
          WING_DEPTH,
        ]}

        color={
          COLORS.wallLower
        }

        radius={0.09}
        roughness={0.9}
        metalness={0.02}
      />

      <RoundedWall
        position={[
          0,
          y,
          -HALF_DEPTH +
            0.22,
        ]}

        args={[
          WING_WIDTH,
          height,
          0.28,
        ]}

        color={
          COLORS.wallLower
        }

        radius={0.09}
        roughness={0.9}
        metalness={0.02}
      />

      <RoundedWall
        position={[
          -sideFrontX,
          y,
          frontZ +
            0.04,
        ]}

        args={[
          SIDE_FRONT_WIDTH,
          height,
          0.28,
        ]}

        color={
          COLORS.wallLower
        }

        radius={0.09}
        roughness={0.9}
        metalness={0.02}
      />

      <RoundedWall
        position={[
          sideFrontX,
          y,
          frontZ +
            0.04,
        ]}

        args={[
          SIDE_FRONT_WIDTH,
          height,
          0.28,
        ]}

        color={
          COLORS.wallLower
        }

        radius={0.09}
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
      <mesh
        position={[
          0,
          DOOR_HEIGHT / 2,
          frontZ -
            0.16,
        ]}
      >
        <boxGeometry
          args={[
            DOOR_WIDTH -
              0.4,

            DOOR_HEIGHT -
              0.15,

            0.09,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.entranceInner
          }

          roughness={0.95}
          metalness={0}
        />
      </mesh>

      <RoundedBox
        position={[
          -DOOR_WIDTH / 2 -
            0.22,

          DOOR_HEIGHT / 2,

          frontZ +
            0.22,
        ]}

        args={[
          0.45,

          DOOR_HEIGHT +
            0.18,

          0.45,
        ]}

        radius={0.14}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={
            COLORS.entranceFrame
          }

          roughness={0.48}
          metalness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          DOOR_WIDTH / 2 +
            0.22,

          DOOR_HEIGHT / 2,

          frontZ +
            0.22,
        ]}

        args={[
          0.45,

          DOOR_HEIGHT +
            0.18,

          0.45,
        ]}

        radius={0.14}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={
            COLORS.entranceFrame
          }

          roughness={0.48}
          metalness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,

          DOOR_HEIGHT +
            0.26,

          frontZ +
            0.22,
        ]}

        args={[
          DOOR_WIDTH +
            0.9,

          0.48,

          0.45,
        ]}

        radius={0.14}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color={
            COLORS.entranceFrame
          }

          roughness={0.48}
          metalness={0.28}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,

          DOOR_HEIGHT +
            0.7,

          frontZ +
            0.78,
        ]}

        args={[
          DOOR_WIDTH +
            2.8,

          0.22,

          1.65,
        ]}

        radius={0.1}
        smoothness={2}
        castShadow
      >
        <meshStandardMaterial
          color={
            COLORS.metalDark
          }

          roughness={0.5}
          metalness={0.3}
        />
      </RoundedBox>

      <mesh
        position={[
          0,

          DOOR_HEIGHT +
            0.55,

          frontZ +
            1.61,
        ]}
      >
        <boxGeometry
          args={[
            DOOR_WIDTH +
              1.6,

            0.07,

            0.035,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.accent
          }

          emissive={
            COLORS.accentDark
          }

          emissiveIntensity={
            0.55
          }

          roughness={0.45}
          metalness={0.06}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   ALA
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
  const frontZ =
    HALF_DEPTH -
    WALL_THICKNESS / 2;

  const sideFrontX =
    DOOR_WIDTH / 2 +
    SIDE_FRONT_WIDTH / 2;

  const lintelHeight =
    WING_HEIGHT -
    DOOR_HEIGHT;

  const lintelY =
    DOOR_HEIGHT +
    lintelHeight / 2;

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {children}

      {/* ===================================================
          SUELO
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
          color={
            COLORS.floorBorder
          }

          roughness={0.93}
          metalness={0.01}
        />
      </mesh>

      <mesh
        position={[
          0,

          FLOOR_THICKNESS +
            0.018,

          0,
        ]}

        receiveShadow
      >
        <boxGeometry
          args={[
            WING_WIDTH -
              2.1,

            0.035,

            WING_DEPTH -
              2.1,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.floor
          }

          roughness={0.76}
          metalness={0.06}
        />
      </mesh>

      <mesh
        position={[
          0,

          FLOOR_THICKNESS +
            0.041,

          0,
        ]}

        receiveShadow
      >
        <boxGeometry
          args={[
            11,

            0.018,

            WING_DEPTH -
              3.4,
          ]}
        />

        <meshStandardMaterial
          color={
            COLORS.floorInset
          }

          roughness={0.67}
          metalness={0.08}
        />
      </mesh>

      {/* ===================================================
          PAREDES VISUALES

          CAMBIO:
          llegan hasta la esquina exacta.
      =================================================== */}

      <RoundedWall
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

        color={
          COLORS.sideWall
        }
      />

      <RoundedWall
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

        color={
          COLORS.sideWall
        }
      />

      <RoundedWall
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

        color={
          COLORS.wall
        }
      />

      {/* FACHADA IZQUIERDA */}

      <RoundedWall
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

        color={
          COLORS.wall
        }
      />

      {/* FACHADA DERECHA */}

      <RoundedWall
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

        color={
          COLORS.wall
        }
      />

      {/* DINTEL */}

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
          COLORS.wall
        }
      />

      <LowerTrim
        frontZ={
          frontZ
        }

        sideFrontX={
          sideFrontX
        }
      />

      <RoofTrim
        frontZ={
          frontZ
        }

        sideFrontX={
          sideFrontX
        }
      />

      <Entrance
        frontZ={
          frontZ
        }
      />

      {/*
        IMPORTANTE:

        Antes había aquí cuatro cilindros llamados
        "ESQUINAS ESTRUCTURALES".

        Esos cilindros eran la mocheta exterior.

        Se eliminaron completamente.

        Ahora la pared lateral y la pared frontal/fondo
        se encuentran directamente a 90º.
      */}

      <ArrowRoof />

      {/* ===================================================
          COLISIONES

          NO CAMBIAR.
          Son las que ya funcionan correctamente.
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

        {/* LATERAL IZQUIERDO */}

        <CuboidCollider
          args={[
            WALL_THICKNESS / 2,

            WING_HEIGHT / 2,

            (
              WING_DEPTH -
              0.7
            ) / 2,
          ]}

          position={[
            -HALF_WIDTH +
              WALL_THICKNESS / 2,

            WING_HEIGHT / 2,

            0,
          ]}
        />

        {/* LATERAL DERECHO */}

        <CuboidCollider
          args={[
            WALL_THICKNESS / 2,

            WING_HEIGHT / 2,

            (
              WING_DEPTH -
              0.7
            ) / 2,
          ]}

          position={[
            HALF_WIDTH -
              WALL_THICKNESS / 2,

            WING_HEIGHT / 2,

            0,
          ]}
        />

        {/* FONDO */}

        <CuboidCollider
          args={[
            (
              WING_WIDTH -
              0.7
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

        {/* FACHADA IZQUIERDA */}

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

        {/* FACHADA DERECHA */}

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

        {/* DINTEL */}

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

        {/* TECHO */}

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
