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

   IMPORTANTE:

   En coordenadas locales la flecha apunta hacia -Z.

   Como cada ala está rotada mirando hacia la plaza,
   automáticamente obtenemos:

   NORTE  -> norte
   SUR    -> sur
   ESTE   -> este
   OESTE  -> oeste

   Forma:

           █
         █ █ █
           █
           █
           █
           █
           █

   Es deliberadamente geométrica porque continúa
   el lenguaje de la cruceta central.
========================================================= */

const SKY_CELL = 3;

const SKY_COLS = 5;
const SKY_ROWS = 7;

const SKY_WIDTH =
  SKY_COLS *
  SKY_CELL;

const SKY_DEPTH =
  SKY_ROWS *
  SKY_CELL;

/* =========================================================
   INSTANCIAS
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

        ref.current
          .setMatrixAt(
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

  if (
    items.length === 0
  ) {
    return null;
  }

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
        args={[
          1,
          1,
          1,
        ]}
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
   VIDRIO DE LA FLECHA
========================================================= */

function ArrowGlass({
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

        ref.current
          .setMatrixAt(
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
      castShadow={false}
      receiveShadow={false}
    >
      <boxGeometry
        args={[
          1,
          1,
          1,
        ]}
      />

      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.42}
        transmission={0.58}
        roughness={0.08}
        metalness={0.02}

        emissive="#274b58"
        emissiveIntensity={0.13}

        side={
          THREE.DoubleSide
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   PARED SUAVIZADA
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
    "#07090b";

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
     TECHO EXTERIOR

     Dejamos en el centro una zona rectangular donde
     construiremos la flecha calada.

  ======================================================= */

  const outerRoofItems =
    useMemo(() => {
      const y =
        WING_HEIGHT +
        ROOF_THICKNESS /
          2;

      const sideWidth =
        (
          WING_WIDTH -
          SKY_WIDTH
        ) / 2;

      const frontDepth =
        (
          WING_DEPTH -
          SKY_DEPTH
        ) / 2;

      return [
        /* POSTERIOR */

        {
          position: [
            0,
            y,

            -(
              SKY_DEPTH /
                2 +
              frontDepth /
                2
            ),
          ],

          scale: [
            WING_WIDTH,
            ROOF_THICKNESS,
            frontDepth,
          ],
        },

        /* DELANTERO */

        {
          position: [
            0,
            y,

            SKY_DEPTH /
              2 +
            frontDepth /
              2,
          ],

          scale: [
            WING_WIDTH,
            ROOF_THICKNESS,
            frontDepth,
          ],
        },

        /* IZQUIERDO */

        {
          position: [
            -(
              SKY_WIDTH /
                2 +
              sideWidth /
                2
            ),

            y,

            0,
          ],

          scale: [
            sideWidth,
            ROOF_THICKNESS,
            SKY_DEPTH,
          ],
        },

        /* DERECHO */

        {
          position: [
            SKY_WIDTH /
              2 +
            sideWidth /
              2,

            y,

            0,
          ],

          scale: [
            sideWidth,
            ROOF_THICKNESS,
            SKY_DEPTH,
          ],
        },
      ];
    }, []);

  /* =======================================================
     CELDAS DE LA FLECHA

     row 0 = extremo exterior (-Z)

     Flecha:

             ■
           ■ ■ ■
             ■
             ■
             ■
             ■
             ■

  ======================================================= */

  const arrowCells =
    useMemo(
      () =>
        new Set([
          "2-0",

          "1-1",
          "2-1",
          "3-1",

          "2-2",
          "2-3",
          "2-4",
          "2-5",
          "2-6",
        ]),
      []
    );

  /* =======================================================
     GENERAMOS LAS PIEZAS DEL RECTÁNGULO CENTRAL

     - las celdas de flecha -> cristal
     - el resto -> techo

     Por eso la flecha está realmente recortada en
     la composición visual del techo.
  ======================================================= */

  const {
    roofFillItems,
    arrowGlassItems,
  } =
    useMemo(() => {
      const roof = [];
      const glass = [];

      const roofY =
        WING_HEIGHT +
        ROOF_THICKNESS /
          2;

      const glassY =
        WING_HEIGHT +
        ROOF_THICKNESS /
          2;

      for (
        let row = 0;
        row <
        SKY_ROWS;
        row++
      ) {
        for (
          let col = 0;
          col <
          SKY_COLS;
          col++
        ) {
          const x =
            (
              col -
              (
                SKY_COLS -
                1
              ) /
                2
            ) *
            SKY_CELL;

          const z =
            (
              row -
              (
                SKY_ROWS -
                1
              ) /
                2
            ) *
            SKY_CELL;

          const key =
            `${col}-${row}`;

          if (
            arrowCells.has(
              key
            )
          ) {
            glass.push({
              position: [
                x,
                glassY,
                z,
              ],

              scale: [
                SKY_CELL -
                  0.12,

                0.12,

                SKY_CELL -
                  0.12,
              ],
            });
          } else {
            roof.push({
              position: [
                x,
                roofY,
                z,
              ],

              scale: [
                SKY_CELL,
                ROOF_THICKNESS,
                SKY_CELL,
              ],
            });
          }
        }
      }

      return {
        roofFillItems:
          roof,

        arrowGlassItems:
          glass,
      };
    }, [
      arrowCells,
    ]);

  /* =======================================================
     MARCO DE LA FLECHA

     Le damos un pequeño borde oscuro a cada cristal
     para que desde arriba la flecha se lea mucho mejor.
  ======================================================= */

  const arrowFrameItems =
    useMemo(() => {
      const result = [];

      const y =
        WING_HEIGHT +
        ROOF_THICKNESS +
        0.045;

      const thickness =
        0.1;

      arrowGlassItems.forEach(
        (
          item,
          index
        ) => {
          const [
            x,
            ,
            z,
          ] =
            item.position;

          const edge =
            SKY_CELL -
            0.08;

          result.push(
            {
              position: [
                x -
                  edge /
                    2,

                y,

                z,
              ],

              scale: [
                thickness,
                0.07,
                edge,
              ],
            },

            {
              position: [
                x +
                  edge /
                    2,

                y,

                z,
              ],

              scale: [
                thickness,
                0.07,
                edge,
              ],
            },

            {
              position: [
                x,
                y,

                z -
                  edge /
                    2,
              ],

              scale: [
                edge,
                0.07,
                thickness,
              ],
            },

            {
              position: [
                x,
                y,

                z +
                  edge /
                    2,
              ],

              scale: [
                edge,
                0.07,
                thickness,
              ],
            }
          );
        }
      );

      return result;
    }, [
      arrowGlassItems,
    ]);

  /* =======================================================
     ESQUINAS
  ======================================================= */

  const cornerPositions =
    [
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
          SUELO
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
          ESQUINAS REDONDEADAS
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
          MARCO DE LA ENTRADA
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
          TECHO EXTERIOR
      =================================================== */}

      <InstancedBoxes
        items={
          outerRoofItems
        }
        color={
          roofColor
        }
        roughness={0.88}
        castShadow
        receiveShadow
      />

      {/* ===================================================
          TECHO DENTRO DE LA ZONA DE LA FLECHA

          Estas son únicamente las celdas que NO
          pertenecen a la flecha.
      =================================================== */}

      <InstancedBoxes
        items={
          roofFillItems
        }
        color={
          roofColor
        }
        roughness={0.88}
        castShadow
        receiveShadow
      />

      {/* ===================================================
          FLECHA / CLARABOYA
      =================================================== */}

      <ArrowGlass
        items={
          arrowGlassItems
        }
        color={
          glassColor
        }
      />

      {/* ===================================================
          MARCO OSCURO DE LA FLECHA
      =================================================== */}

      <InstancedBoxes
        items={
          arrowFrameItems
        }
        color={
          frameColor
        }
        roughness={0.55}
        metalness={0.18}
        castShadow={false}
        receiveShadow={false}
      />

      {/* ===================================================
          FÍSICA
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
            TECHO

            Para física usamos una sola placa.

            Es mucho más barato que meter decenas de
            colliders pequeños.

            La flecha sigue siendo visualmente cristal.
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
