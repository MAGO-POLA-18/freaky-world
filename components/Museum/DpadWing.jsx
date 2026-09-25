"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  RoundedBox,
} from "@react-three/drei";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

/* =========================================================
   MEDIDAS MAESTRAS

   Sistema local del ala:

   ancho:       60 m
   profundidad: 70 m
   altura:      15 m

   +Z = fachada hacia la plaza
   -Z = fondo

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

   Apertura suficientemente grande para recorrer
   cómodamente el edificio.

========================================================= */

const DOOR_WIDTH = 10;
const DOOR_HEIGHT = 6;

const SIDE_FRONT_WIDTH =
  (
    WING_WIDTH -
    DOOR_WIDTH
  ) / 2;

/* =========================================================
   CLARABOYA CRUCETA
========================================================= */

const CROSS_TOTAL = 18;
const CROSS_ARM = 6;

const CROSS_HALF =
  CROSS_TOTAL / 2;

const ARM_HALF =
  CROSS_ARM / 2;

/* =========================================================
   CAJAS INSTANCIADAS
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  metalness = 0,
  castShadow = true,
  receiveShadow = true,
}) {
  const ref =
    useRef(null);

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach(
      (
        item,
        index
      ) => {
        dummy.position.set(
          ...(item.position ??
            [0, 0, 0])
        );

        dummy.rotation.set(
          ...(item.rotation ??
            [0, 0, 0])
        );

        dummy.scale.set(
          ...(item.scale ??
            [1, 1, 1])
        );

        dummy.updateMatrix();

        ref.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );

    ref.current
      .instanceMatrix
      .needsUpdate =
      true;

    ref.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  return (
    <instancedMesh
      ref={ref}
      args={[
        null,
        null,
        items.length,
      ]}
      castShadow={
        castShadow
      }
      receiveShadow={
        receiveShadow
      }
    >
      <boxGeometry
        args={[1, 1, 1]}
      />

      <meshStandardMaterial
        color={color}
        roughness={
          roughness
        }
        metalness={
          metalness
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   CRISTAL DE LA CRUCETA
========================================================= */

function SkylightGlass({
  items,
  color,
}) {
  const ref =
    useRef(null);

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach(
      (
        item,
        index
      ) => {
        dummy.position.set(
          ...item.position
        );

        dummy.scale.set(
          ...item.scale
        );

        dummy.rotation.set(
          0,
          0,
          0
        );

        dummy.updateMatrix();

        ref.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );

    ref.current
      .instanceMatrix
      .needsUpdate =
      true;

    ref.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  return (
    <instancedMesh
      ref={ref}
      args={[
        null,
        null,
        items.length,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[1, 1, 1]}
      />

      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.34}
        transmission={0.48}
        roughness={0.08}
        metalness={0.02}
        side={
          THREE.DoubleSide
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   PANEL REDONDEADO

   Lo usamos en las paredes visibles.

   La física continúa siendo cuboid:
   visual suave + colisión barata.
========================================================= */

function RoundedWall({
  position,
  args,
  color,
  radius = 0.18,
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
========================================================= */

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  /* =======================================================
     PALETA
  ======================================================= */

  const wallColor =
    "#1a1d20";

  const wallSecondary =
    "#22272b";

  const roofColor =
    "#121416";

  const floorColor =
    "#24292b";

  const glassColor =
    "#8fc8da";

  const frameColor =
    "#090b0d";

  /* =======================================================
     FACHADA

     Ahora NO es una pared completa.

        ███████████████████████
        ███████████████████████
        ███████         ███████
        ███████ ENTRADA ███████
        ███████         ███████

  ======================================================= */

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

  /* =======================================================
     TECHO ALREDEDOR DE LA CRUZ
  ======================================================= */

  const roofItems =
    useMemo(() => {
      const y =
        WING_HEIGHT +
        ROOF_THICKNESS /
          2;

      const outerSideWidth =
        HALF_WIDTH -
        CROSS_HALF;

      const middleCornerSize =
        CROSS_HALF -
        ARM_HALF;

      return [
        {
          position: [
            0,
            y,
            -(
              HALF_DEPTH +
              CROSS_HALF
            ) /
              2,
          ],

          scale: [
            WING_WIDTH,
            ROOF_THICKNESS,

            HALF_DEPTH -
              CROSS_HALF,
          ],
        },

        {
          position: [
            0,
            y,
            (
              HALF_DEPTH +
              CROSS_HALF
            ) /
              2,
          ],

          scale: [
            WING_WIDTH,
            ROOF_THICKNESS,

            HALF_DEPTH -
              CROSS_HALF,
          ],
        },

        {
          position: [
            -(
              HALF_WIDTH +
              CROSS_HALF
            ) /
              2,

            y,
            0,
          ],

          scale: [
            outerSideWidth,
            ROOF_THICKNESS,
            CROSS_TOTAL,
          ],
        },

        {
          position: [
            (
              HALF_WIDTH +
              CROSS_HALF
            ) /
              2,

            y,
            0,
          ],

          scale: [
            outerSideWidth,
            ROOF_THICKNESS,
            CROSS_TOTAL,
          ],
        },

        {
          position: [
            -6,
            y,
            6,
          ],

          scale: [
            6,
            ROOF_THICKNESS,
            6,
          ],
        },

        {
          position: [
            6,
            y,
            6,
          ],

          scale: [
            6,
            ROOF_THICKNESS,
            6,
          ],
        },

        {
          position: [
            -6,
            y,
            -6,
          ],

          scale: [
            6,
            ROOF_THICKNESS,
            6,
          ],
        },

        {
          position: [
            6,
            y,
            -6,
          ],

          scale: [
            6,
            ROOF_THICKNESS,
            6,
          ],
        },
      ];
    }, []);

  /* =======================================================
     CRISTAL DE LA CRUZ
  ======================================================= */

  const skylightItems =
    useMemo(() => {
      const y =
        WING_HEIGHT +
        0.03;

      return [
        {
          position: [
            0,
            y,
            0,
          ],
          scale: [
            6,
            0.08,
            6,
          ],
        },

        {
          position: [
            0,
            y,
            -6,
          ],
          scale: [
            6,
            0.08,
            6,
          ],
        },

        {
          position: [
            0,
            y,
            6,
          ],
          scale: [
            6,
            0.08,
            6,
          ],
        },

        {
          position: [
            -6,
            y,
            0,
          ],
          scale: [
            6,
            0.08,
            6,
          ],
        },

        {
          position: [
            6,
            y,
            0,
          ],
          scale: [
            6,
            0.08,
            6,
          ],
        },
      ];
    }, []);

  /* =======================================================
     MARCO DE LA CRUZ
  ======================================================= */

  const skylightFrame =
    useMemo(() => {
      const y =
        WING_HEIGHT +
        0.11;

      const thickness =
        0.18;

      return [
        {
          position: [
            -3,
            y,
            0,
          ],
          scale: [
            thickness,
            0.12,
            18,
          ],
        },

        {
          position: [
            3,
            y,
            0,
          ],
          scale: [
            thickness,
            0.12,
            18,
          ],
        },

        {
          position: [
            0,
            y,
            -3,
          ],
          scale: [
            18,
            0.12,
            thickness,
          ],
        },

        {
          position: [
            0,
            y,
            3,
          ],
          scale: [
            18,
            0.12,
            thickness,
          ],
        },

        {
          position: [
            0,
            y,
            -9,
          ],
          scale: [
            6,
            0.12,
            thickness,
          ],
        },

        {
          position: [
            0,
            y,
            9,
          ],
          scale: [
            6,
            0.12,
            thickness,
          ],
        },

        {
          position: [
            -9,
            y,
            0,
          ],
          scale: [
            thickness,
            0.12,
            6,
          ],
        },

        {
          position: [
            9,
            y,
            0,
          ],
          scale: [
            thickness,
            0.12,
            6,
          ],
        },
      ];
    }, []);

  /* =======================================================
     ESQUINAS REDONDEADAS

     Cuatro columnas cilíndricas integradas en la carcasa.

     Desde lejos suavizan mucho la silueta cuadrada.
  ======================================================= */

  const cornerPositions =
    [
      [
        -HALF_WIDTH +
          0.35,
        WING_HEIGHT / 2,
        -HALF_DEPTH +
          0.35,
      ],

      [
        HALF_WIDTH -
          0.35,
        WING_HEIGHT / 2,
        -HALF_DEPTH +
          0.35,
      ],

      [
        -HALF_WIDTH +
          0.35,
        WING_HEIGHT / 2,
        HALF_DEPTH -
          0.35,
      ],

      [
        HALF_WIDTH -
          0.35,
        WING_HEIGHT / 2,
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
          SUELO INTERIOR
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
          color={floorColor}
          roughness={0.94}
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
          wallSecondary
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
          wallSecondary
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
          DINTEL SOBRE LA ENTRADA
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
        radius={0.18}
      />

      {/* ===================================================
          ESQUINAS CURVAS
      =================================================== */}

      {cornerPositions.map(
        (
          corner,
          index
        ) => (
          <mesh
            key={`corner-${index}`}
            position={corner}
            castShadow
            receiveShadow
          >
            <cylinderGeometry
              args={[
                0.72,
                0.72,
                WING_HEIGHT,
                16,
              ]}
            />

            <meshStandardMaterial
              color={
                wallSecondary
              }
              roughness={0.84}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          MARCO SUAVE DE ENTRADA

          Visual solamente.
          No bloquea el paso.
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
          color="#31373c"
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
          color="#31373c"
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
          color="#31373c"
          roughness={0.65}
        />
      </RoundedBox>

      {/* ===================================================
          TECHO
      =================================================== */}

      <InstancedBoxes
        items={roofItems}
        color={roofColor}
        roughness={0.88}
        castShadow
        receiveShadow
      />

      {/* ===================================================
          CLARABOYA CRUCETA
      =================================================== */}

      <SkylightGlass
        items={skylightItems}
        color={glassColor}
      />

      <InstancedBoxes
        items={skylightFrame}
        color={frameColor}
        roughness={0.6}
        metalness={0.14}
        castShadow
      />

      {/* ===================================================
          FÍSICA

          La entrada central NO tiene collider.
          Por eso ya podemos atravesar la fachada.
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

        {/* TECHO */}

        {roofItems.map(
          (
            item,
            index
          ) => (
            <CuboidCollider
              key={`roof-${index}`}
              args={[
                item.scale[0] /
                  2,

                item.scale[1] /
                  2,

                item.scale[2] /
                  2,
              ]}
              position={
                item.position
              }
            />
          )
        )}

        {/* VIDRIO CRUCETA */}

        {skylightItems.map(
          (
            item,
            index
          ) => (
            <CuboidCollider
              key={`glass-${index}`}
              args={[
                item.scale[0] /
                  2,

                item.scale[1] /
                  2,

                item.scale[2] /
                  2,
              ]}
              position={
                item.position
              }
            />
          )
        )}
      </RigidBody>
    </group>
  );
}
