"use client";

import { useMemo } from "react";

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
   TIERRA VICIO — MAIN HALL

   Primera versión estructural.

   - Un único edificio
   - Planta completa en forma de cruceta
   - Interior continuo
   - Un solo nivel de suelo
   - Preparado para repartir contenidos después
   - Materiales estilizados / semi-realistas
========================================================= */

/* =========================================================
   MEDIDAS

             NORTE
              │
              │
       ┌──────┴──────┐
       │             │
 OESTE ├──── CENTRO ─┤ ESTE
       │             │
       └──────┬──────┘
              │
              │
              SUR
========================================================= */

const ARM_WIDTH = 42;
const ARM_LENGTH = 58;

const CENTER_SIZE = 48;

const WALL_HEIGHT = 14;
const WALL_THICKNESS = 0.55;

const ROOF_THICKNESS = 0.35;

/*
  IMPORTANTE:

  La superficie física transitable será Y = 0.

  El suelo visual queda apenas por debajo.

  Esto nos da una referencia universal para:
  - exterior
  - interior
  - avatar
  - futuras salas
*/
const FLOOR_TOP_Y = 0;
const FLOOR_THICKNESS = 0.22;

/* =========================================================
   COLORES
========================================================= */

const COLORS = {
  floor: "#25292d",
  floorCenter: "#2d3237",
  floorLine: "#7656d6",

  wall: "#202428",
  wallSide: "#282d32",
  wallBase: "#15181b",

  roof: "#131619",
  roofTrim: "#353b41",

  glass: "#729db8",
  glassEdge: "#18262e",

  purple: "#7656d6",
  purpleDark: "#493685",

  entrance: "#42484f",

  black: "#0e1013",
};

/* =========================================================
   POSICIONES GENERALES
========================================================= */

const HALF_CENTER =
  CENTER_SIZE / 2;

const HALF_ARM_WIDTH =
  ARM_WIDTH / 2;

const HALF_ARM_LENGTH =
  ARM_LENGTH / 2;

/*
  El brazo empieza donde termina el centro.
*/

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

/* =========================================================
   MATERIAL SIMPLE
========================================================= */

function StandardMaterial({
  color,
  roughness = 0.8,
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
   PANEL DE PARED
========================================================= */

function Wall({
  position,
  size,
  color = COLORS.wall,
  radius = 0.18,
}) {
  return (
    <RoundedBox
      position={position}
      args={size}
      radius={radius}
      smoothness={3}
      castShadow
      receiveShadow
    >
      <StandardMaterial
        color={color}
        roughness={0.76}
        metalness={0.05}
      />
    </RoundedBox>
  );
}

/* =========================================================
   SUELO

   Todos los colliders terminan exactamente en Y = 0.
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
          FLOOR_TOP_Y -
            FLOOR_THICKNESS / 2,
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
        args={[
          size[0] / 2,
          FLOOR_THICKNESS / 2,
          size[2] / 2,
        ]}
        position={[
          position[0],
          FLOOR_TOP_Y -
            FLOOR_THICKNESS / 2,
          position[2],
        ]}
      />
    </>
  );
}

/* =========================================================
   MARCAS DE SUELO

   Muy discretas.

   Ayudan a que el espacio grande no parezca vacío.
========================================================= */

function FloorGuides() {
  return (
    <group>
      {/* NORTE / SUR */}

      <mesh
        position={[
          0,
          0.012,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.12,
            0.018,
            CENTER_SIZE +
              ARM_LENGTH * 2 -
              6,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.purple}
          emissive={
            COLORS.purpleDark
          }
          emissiveIntensity={0.22}
          roughness={0.55}
        />
      </mesh>

      {/* ESTE / OESTE */}

      <mesh
        position={[
          0,
          0.013,
          0,
        ]}
      >
        <boxGeometry
          args={[
            CENTER_SIZE +
              ARM_LENGTH * 2 -
              6,
            0.018,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color={COLORS.purple}
          emissive={
            COLORS.purpleDark
          }
          emissiveIntensity={0.22}
          roughness={0.55}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   TECHO

   Construido también en cinco piezas.

   Esto es mucho más ligero y fácil de controlar
   que una geometría booleana compleja.
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
        roughness={0.65}
        metalness={0.12}
      />
    </mesh>
  );
}

/* =========================================================
   LUCERNARIO CENTRAL

   Referencia visual a la cruceta.

   No usamos luces.
========================================================= */

function CentralSkylight() {
  const geometry =
    useMemo(() => {
      const shape =
        new THREE.Shape();

      const width = 5;
      const length = 17;

      /*
        Cruz simple.
      */

      shape.moveTo(
        -width / 2,
        -length / 2
      );

      shape.lineTo(
        width / 2,
        -length / 2
      );

      shape.lineTo(
        width / 2,
        -width / 2
      );

      shape.lineTo(
        length / 2,
        -width / 2
      );

      shape.lineTo(
        length / 2,
        width / 2
      );

      shape.lineTo(
        width / 2,
        width / 2
      );

      shape.lineTo(
        width / 2,
        length / 2
      );

      shape.lineTo(
        -width / 2,
        length / 2
      );

      shape.lineTo(
        -width / 2,
        width / 2
      );

      shape.lineTo(
        -length / 2,
        width / 2
      );

      shape.lineTo(
        -length / 2,
        -width / 2
      );

      shape.lineTo(
        -width / 2,
        -width / 2
      );

      shape.closePath();

      return new THREE.ShapeGeometry(
        shape
      );
    }, []);

  return (
    <mesh
      geometry={geometry}
      position={[
        0,
        WALL_HEIGHT +
          ROOF_THICKNESS +
          0.025,
        0,
      ]}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
    >
      <meshPhysicalMaterial
        color={COLORS.glass}
        transparent
        opacity={0.5}
        transmission={0.32}
        roughness={0.16}
        clearcoat={0.2}
        side={THREE.DoubleSide}
      />

      <Edges
        threshold={15}
        color={COLORS.glassEdge}
      />
    </mesh>
  );
}

/* =========================================================
   PAREDES EXTERIORES

   La cruceta queda abierta internamente.

   Solo construimos el perímetro.
========================================================= */

function OuterWalls() {
  const y =
    WALL_HEIGHT / 2;

  /*
    Para no crear 20 cálculos dentro del JSX,
    definimos las paredes como datos.
  */

  const walls = [
    /* =====================================================
       NORTE — FONDO
    ===================================================== */

    {
      p: [
        0,
        y,
        -HALF_CENTER -
          ARM_LENGTH,
      ],

      s: [
        ARM_WIDTH,
        WALL_HEIGHT,
        WALL_THICKNESS,
      ],
    },

    /* NORTE — LATERALES */

    {
      p: [
        -HALF_ARM_WIDTH,
        y,
        NORTH_Z,
      ],

      s: [
        WALL_THICKNESS,
        WALL_HEIGHT,
        ARM_LENGTH,
      ],
    },

    {
      p: [
        HALF_ARM_WIDTH,
        y,
        NORTH_Z,
      ],

      s: [
        WALL_THICKNESS,
        WALL_HEIGHT,
        ARM_LENGTH,
      ],
    },

    /* =====================================================
       SUR — FONDO
    ===================================================== */

    {
      p: [
        0,
        y,
        HALF_CENTER +
          ARM_LENGTH,
      ],

      s: [
        ARM_WIDTH,
        WALL_HEIGHT,
        WALL_THICKNESS,
      ],
    },

    /* SUR — LATERALES */

    {
      p: [
        -HALF_ARM_WIDTH,
        y,
        SOUTH_Z,
      ],

      s: [
        WALL_THICKNESS,
        WALL_HEIGHT,
        ARM_LENGTH,
      ],
    },

    {
      p: [
        HALF_ARM_WIDTH,
        y,
        SOUTH_Z,
      ],

      s: [
        WALL_THICKNESS,
        WALL_HEIGHT,
        ARM_LENGTH,
      ],
    },

    /* =====================================================
       ESTE — FONDO
    ===================================================== */

    {
      p: [
        HALF_CENTER +
          ARM_LENGTH,
        y,
        0,
      ],

      s: [
        WALL_THICKNESS,
        WALL_HEIGHT,
        ARM_WIDTH,
      ],
    },

    /* ESTE — LATERALES */

    {
      p: [
        EAST_X,
        y,
        -HALF_ARM_WIDTH,
      ],

      s: [
        ARM_LENGTH,
        WALL_HEIGHT,
        WALL_THICKNESS,
      ],
    },

    {
      p: [
        EAST_X,
        y,
        HALF_ARM_WIDTH,
      ],

      s: [
        ARM_LENGTH,
        WALL_HEIGHT,
        WALL_THICKNESS,
      ],
    },

    /* =====================================================
       OESTE — FONDO
    ===================================================== */

    {
      p: [
        -HALF_CENTER -
          ARM_LENGTH,
        y,
        0,
      ],

      s: [
        WALL_THICKNESS,
        WALL_HEIGHT,
        ARM_WIDTH,
      ],
    },

    /* OESTE — LATERALES */

    {
      p: [
        WEST_X,
        y,
        -HALF_ARM_WIDTH,
      ],

      s: [
        ARM_LENGTH,
        WALL_HEIGHT,
        WALL_THICKNESS,
      ],
    },

    {
      p: [
        WEST_X,
        y,
        HALF_ARM_WIDTH,
      ],

      s: [
        ARM_LENGTH,
        WALL_HEIGHT,
        WALL_THICKNESS,
      ],
    },

    /* =====================================================
       HOMBROS CENTRALES

       Estas piezas cierran las esquinas que quedan entre
       el cuadrado central y cada brazo.
    ===================================================== */

    {
      p: [
        -(
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,

        y,

        -HALF_CENTER,
      ],

      s: [
        HALF_CENTER -
          HALF_ARM_WIDTH,

        WALL_HEIGHT,

        WALL_THICKNESS,
      ],
    },

    {
      p: [
        (
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,

        y,

        -HALF_CENTER,
      ],

      s: [
        HALF_CENTER -
          HALF_ARM_WIDTH,

        WALL_HEIGHT,

        WALL_THICKNESS,
      ],
    },

    {
      p: [
        -(
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,

        y,

        HALF_CENTER,
      ],

      s: [
        HALF_CENTER -
          HALF_ARM_WIDTH,

        WALL_HEIGHT,

        WALL_THICKNESS,
      ],
    },

    {
      p: [
        (
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,

        y,

        HALF_CENTER,
      ],

      s: [
        HALF_CENTER -
          HALF_ARM_WIDTH,

        WALL_HEIGHT,

        WALL_THICKNESS,
      ],
    },

    {
      p: [
        -HALF_CENTER,
        y,

        -(
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,
      ],

      s: [
        WALL_THICKNESS,

        WALL_HEIGHT,

        HALF_CENTER -
          HALF_ARM_WIDTH,
      ],
    },

    {
      p: [
        -HALF_CENTER,
        y,

        (
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,
      ],

      s: [
        WALL_THICKNESS,

        WALL_HEIGHT,

        HALF_CENTER -
          HALF_ARM_WIDTH,
      ],
    },

    {
      p: [
        HALF_CENTER,
        y,

        -(
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,
      ],

      s: [
        WALL_THICKNESS,

        WALL_HEIGHT,

        HALF_CENTER -
          HALF_ARM_WIDTH,
      ],
    },

    {
      p: [
        HALF_CENTER,
        y,

        (
          HALF_CENTER +
          HALF_ARM_WIDTH
        ) /
          2,
      ],

      s: [
        WALL_THICKNESS,

        WALL_HEIGHT,

        HALF_CENTER -
          HALF_ARM_WIDTH,
      ],
    },
  ];

  return (
    <>
      {walls.map(
        (
          wall,
          index
        ) => (
          <Wall
            key={
              `main-wall-${index}`
            }
            position={wall.p}
            size={wall.s}
            color={
              index % 3 === 0
                ? COLORS.wallSide
                : COLORS.wall
            }
          />
        )
      )}
    </>
  );
}

/* =========================================================
   COLISIONES DE PARED
========================================================= */

function WallColliders() {
  const y =
    WALL_HEIGHT / 2;

  const colliders = [
    [
      0,
      y,
      -HALF_CENTER -
        ARM_LENGTH,
      ARM_WIDTH,
      WALL_HEIGHT,
      WALL_THICKNESS,
    ],

    [
      -HALF_ARM_WIDTH,
      y,
      NORTH_Z,
      WALL_THICKNESS,
      WALL_HEIGHT,
      ARM_LENGTH,
    ],

    [
      HALF_ARM_WIDTH,
      y,
      NORTH_Z,
      WALL_THICKNESS,
      WALL_HEIGHT,
      ARM_LENGTH,
    ],

    [
      0,
      y,
      HALF_CENTER +
        ARM_LENGTH,
      ARM_WIDTH,
      WALL_HEIGHT,
      WALL_THICKNESS,
    ],

    [
      -HALF_ARM_WIDTH,
      y,
      SOUTH_Z,
      WALL_THICKNESS,
      WALL_HEIGHT,
      ARM_LENGTH,
    ],

    [
      HALF_ARM_WIDTH,
      y,
      SOUTH_Z,
      WALL_THICKNESS,
      WALL_HEIGHT,
      ARM_LENGTH,
    ],

    [
      HALF_CENTER +
        ARM_LENGTH,
      y,
      0,
      WALL_THICKNESS,
      WALL_HEIGHT,
      ARM_WIDTH,
    ],

    [
      EAST_X,
      y,
      -HALF_ARM_WIDTH,
      ARM_LENGTH,
      WALL_HEIGHT,
      WALL_THICKNESS,
    ],

    [
      EAST_X,
      y,
      HALF_ARM_WIDTH,
      ARM_LENGTH,
      WALL_HEIGHT,
      WALL_THICKNESS,
    ],

    [
      -HALF_CENTER -
        ARM_LENGTH,
      y,
      0,
      WALL_THICKNESS,
      WALL_HEIGHT,
      ARM_WIDTH,
    ],

    [
      WEST_X,
      y,
      -HALF_ARM_WIDTH,
      ARM_LENGTH,
      WALL_HEIGHT,
      WALL_THICKNESS,
    ],

    [
      WEST_X,
      y,
      HALF_ARM_WIDTH,
      ARM_LENGTH,
      WALL_HEIGHT,
      WALL_THICKNESS,
    ],
  ];

  return (
    <>
      {colliders.map(
        (
          [
            x,
            yPos,
            z,
            w,
            h,
            d,
          ],
          index
        ) => (
          <CuboidCollider
            key={
              `wall-collider-${index}`
            }
            position={[
              x,
              yPos,
              z,
            ]}
            args={[
              w / 2,
              h / 2,
              d / 2,
            ]}
          />
        )
      )}
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
          FÍSICA PRINCIPAL
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
          color={
            COLORS.floorCenter
          }
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
          SUELO VISUAL
      =================================================== */}

      <FloorGuides />

      {/* ===================================================
          PAREDES
      =================================================== */}

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

      {/* ===================================================
          LUCERNARIO CENTRAL
      =================================================== */}

      <CentralSkylight />

      {/* ===================================================
          CONTENIDO FUTURO
      =================================================== */}

      {children}
    </group>
  );
}
