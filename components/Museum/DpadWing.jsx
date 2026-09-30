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
   D-PAD WING — VISUAL PASS 01

   Objetivo:
   - semi-realismo estilizado
   - arquitectura más sólida
   - materiales con más presencia
   - sin texturas pesadas
   - sin luces adicionales
   - conservar rendimiento móvil
========================================================= */

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
   PALETA VISUAL

   Base:
   grafito / acero / cemento oscuro.

   Acentos:
   violeta Tierra Vicio + vidrio frío.

   No buscamos negro absoluto.
   Necesitamos que la luz pueda revelar volúmenes.
========================================================= */

const COLORS = {
  wall:
    "#202327",

  sideWall:
    "#262a2f",

  wallLower:
    "#171a1d",

  wallUpper:
    "#30353a",

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
   FLECHA DEL TECHO
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
   MATERIAL DE PARED
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
   PARED REDONDEADA
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
   TECHO CON FLECHA
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
      {/* ===================================================
          TECHO PRINCIPAL
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
            COLORS.roof
          }
          roughness={0.68}
          metalness={0.12}
        />
      </mesh>

      {/* ===================================================
          VIDRIO DE FLECHA
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
   CORNISA SUPERIOR

   Muy simple:
   añade una línea arquitectónica alrededor del edificio.

   No utiliza luces ni shaders adicionales.
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
      {/* IZQUIERDA */}

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
          WING_DEPTH -
            1,
        ]}
        color={
          COLORS.roofTrim
        }
        radius={0.08}
        roughness={0.56}
        metalness={0.18}
      />

      {/* DERECHA */}

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
          WING_DEPTH -
            1,
        ]}
        color={
          COLORS.roofTrim
        }
        radius={0.08}
        roughness={0.56}
        metalness={0.18}
      />

      {/* FONDO */}

      <RoundedWall
        position={[
          0,
          y,
          -HALF_DEPTH +
            0.27,
        ]}
        args={[
          WING_WIDTH -
            1,
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

      {/* FRENTE IZQUIERDO */}

      <RoundedWall
        position={[
          -sideFrontX,
          y,
          frontZ +
            0.03,
        ]}
        args={[
          SIDE_FRONT_WIDTH -
            0.45,
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

      {/* FRENTE DERECHO */}

      <RoundedWall
        position={[
          sideFrontX,
          y,
          frontZ +
            0.03,
        ]}
        args={[
          SIDE_FRONT_WIDTH -
            0.45,
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

   El zócalo oscuro ayuda muchísimo a dar peso al edificio.

   Es un recurso barato:
   geometría simple + material mate.
========================================================= */

function LowerTrim({
  frontZ,
  sideFrontX,
}) {
  const height = 0.82;
  const y = height / 2;

  return (
    <group>
      {/* LATERAL IZQUIERDO */}

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
          WING_DEPTH -
            1.2,
        ]}
        color={
          COLORS.wallLower
        }
        radius={0.09}
        roughness={0.9}
        metalness={0.02}
      />

      {/* LATERAL DERECHO */}

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
          WING_DEPTH -
            1.2,
        ]}
        color={
          COLORS.wallLower
        }
        radius={0.09}
        roughness={0.9}
        metalness={0.02}
      />

      {/* FONDO */}

      <RoundedWall
        position={[
          0,
          y,
          -HALF_DEPTH +
            0.22,
        ]}
        args={[
          WING_WIDTH -
            1.2,
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

      {/* FACHADA IZQUIERDA */}

      <RoundedWall
        position={[
          -sideFrontX,
          y,
          frontZ +
            0.04,
        ]}
        args={[
          SIDE_FRONT_WIDTH -
            0.5,
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

      {/* FACHADA DERECHA */}

      <RoundedWall
        position={[
          sideFrontX,
          y,
          frontZ +
            0.04,
        ]}
        args={[
          SIDE_FRONT_WIDTH -
            0.5,
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
   ENTRADA ESTILIZADA
========================================================= */

function Entrance({
  frontZ,
}) {
  return (
    <group>
      {/* ===================================================
          RECESO OSCURO

          Da profundidad visual sin modificar la colisión.
      =================================================== */}

      <mesh
        position={[
          0,
          DOOR_HEIGHT /
            2,
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

      {/* ===================================================
          PILAR IZQUIERDO
      =================================================== */}

      <RoundedBox
        position={[
          -DOOR_WIDTH /
            2 -
            0.22,
          DOOR_HEIGHT /
            2,
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

      {/* ===================================================
          PILAR DERECHO
      =================================================== */}

      <RoundedBox
        position={[
          DOOR_WIDTH /
            2 +
            0.22,
          DOOR_HEIGHT /
            2,
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

      {/* ===================================================
          TRAVESAÑO
      =================================================== */}

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

      {/* ===================================================
          MARQUESINA
      =================================================== */}

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

      {/* ===================================================
          LÍNEA VIOLETA

          No es una luz.
          Es simplemente material con un poco de emisividad.
          Coste muy bajo.
      =================================================== */}

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
          CONTENIDO
      =================================================== */}

      {children}

      {/* ===================================================
          SUELO BASE
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
            COLORS.floorBorder
          }
          roughness={0.93}
          metalness={0.01}
        />
      </mesh>

      {/* ===================================================
          SUPERFICIE INTERIOR DEL SUELO

          Levantada apenas para evitar z-fighting.
      =================================================== */}

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

      {/* ===================================================
          CAMINO INTERIOR

          Una franja casi imperceptible rompe la gran
          superficie plana sin usar ninguna textura.
      =================================================== */}

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
          PARED IZQUIERDA
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
          COLORS.sideWall
        }
      />

      {/* ===================================================
          PARED DERECHA
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
          COLORS.sideWall
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
          COLORS.wall
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
          COLORS.wall
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
          COLORS.wall
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
          COLORS.wall
        }
      />

      {/* ===================================================
          ZÓCALOS
      =================================================== */}

      <LowerTrim
        frontZ={frontZ}
        sideFrontX={
          sideFrontX
        }
      />

      {/* ===================================================
          CORNISAS
      =================================================== */}

      <RoofTrim
        frontZ={frontZ}
        sideFrontX={
          sideFrontX
        }
      />

      {/* ===================================================
          ENTRADA
      =================================================== */}

      <Entrance
        frontZ={
          frontZ
        }
      />

      {/* ===================================================
          ESQUINAS ESTRUCTURALES
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
                14,
              ]}
            />

            <meshStandardMaterial
              color={
                COLORS.wallUpper
              }
              roughness={0.66}
              metalness={0.08}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          TECHO
      =================================================== */}

      <ArrowRoof />

      {/* ===================================================
          COLISIONES

          Se mantienen esencialmente iguales.

          Todo lo nuevo:
          - zócalos
          - cornisas
          - marquesina
          - detalles

          es VISUAL.

          No agregamos pequeños colliders innecesarios.
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

        {/* TECHO FÍSICO */}

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
