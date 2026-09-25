"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

/* =========================================================
   MEDIDAS MAESTRAS DEL ALA

   Sistema local de cada ala:

   ancho:       60 m
   profundidad: 70 m
   altura:      15 m

   +Z = fachada orientada hacia la plaza
   -Z = fondo del edificio

   Esta será nuestra referencia estructural a partir
   de ahora.
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
   CLARABOYA / CRUCETA

   Cruz total:
   18 x 18 m

   Grosor de cada brazo:
   6 m

             ███
             ███
         █████████
         █████████
             ███
             ███
========================================================= */

const CROSS_TOTAL = 18;
const CROSS_ARM = 6;

const CROSS_HALF =
  CROSS_TOTAL / 2;

const ARM_HALF =
  CROSS_ARM / 2;

/* =========================================================
   INSTANCIAS DE CAJAS

   Nos permite dibujar varias piezas estructurales
   iguales con pocas draw calls.
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  metalness = 0,
  castShadow = true,
  receiveShadow = true,
}) {
  const meshRef =
    useRef(null);

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  useLayoutEffect(() => {
    if (
      !meshRef.current
    ) {
      return;
    }

    items.forEach(
      (
        item,
        index
      ) => {
        const position =
          item.position ??
          [0, 0, 0];

        const scale =
          item.scale ??
          [1, 1, 1];

        const rotation =
          item.rotation ??
          [0, 0, 0];

        dummy.position.set(
          position[0],
          position[1],
          position[2]
        );

        dummy.rotation.set(
          rotation[0],
          rotation[1],
          rotation[2]
        );

        dummy.scale.set(
          scale[0],
          scale[1],
          scale[2]
        );

        dummy.updateMatrix();

        meshRef.current
          .setMatrixAt(
            index,
            dummy.matrix
          );
      }
    );

    meshRef.current
      .instanceMatrix
      .needsUpdate =
      true;

    meshRef.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  return (
    <instancedMesh
      ref={meshRef}
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
   ALA
========================================================= */

export default function DpadWing({
  position = [0, 0, 0],

  rotation = [0, 0, 0],
}) {
  /* =======================================================
     MATERIALES / COLORES

     Por ahora mantenemos todo sobrio.
     Después cada ala podrá adquirir identidad propia.
  ======================================================= */

  const wallColor =
    "#171a1d";

  const sideColor =
    "#202428";

  const roofColor =
    "#111315";

  const floorColor =
    "#202426";

  const glassColor =
    "#91c9dc";

  const frameColor =
    "#080a0c";

  /* =======================================================
     PAREDES

     Toda la caja queda completamente cerrada.
  ======================================================= */

  const wallItems =
    useMemo(
      () => [
        /* IZQUIERDA */
        {
          position: [
            -HALF_WIDTH +
              WALL_THICKNESS /
                2,

            WING_HEIGHT /
              2,

            0,
          ],

          scale: [
            WALL_THICKNESS,
            WING_HEIGHT,
            WING_DEPTH,
          ],
        },

        /* DERECHA */
        {
          position: [
            HALF_WIDTH -
              WALL_THICKNESS /
                2,

            WING_HEIGHT /
              2,

            0,
          ],

          scale: [
            WALL_THICKNESS,
            WING_HEIGHT,
            WING_DEPTH,
          ],
        },

        /* FACHADA */
        {
          position: [
            0,

            WING_HEIGHT /
              2,

            HALF_DEPTH -
              WALL_THICKNESS /
                2,
          ],

          scale: [
            WING_WIDTH -
              WALL_THICKNESS *
                2,

            WING_HEIGHT,

            WALL_THICKNESS,
          ],
        },

        /* FONDO */
        {
          position: [
            0,

            WING_HEIGHT /
              2,

            -HALF_DEPTH +
              WALL_THICKNESS /
                2,
          ],

          scale: [
            WING_WIDTH -
              WALL_THICKNESS *
                2,

            WING_HEIGHT,

            WALL_THICKNESS,
          ],
        },
      ],
      []
    );

  /* =======================================================
     TECHO

     No existe una gran placa atravesando la claraboya.

     El techo está compuesto alrededor de la cruz,
     así que el hueco tiene forma de cruceta real.
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
        /* ===============================================
           FRANJA POSTERIOR
           z = -35 → -9
        =============================================== */

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

        /* ===============================================
           FRANJA DELANTERA
           z = 9 → 35
        =============================================== */

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

        /* ===============================================
           LATERAL IZQUIERDO CENTRAL
        =============================================== */

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

        /* ===============================================
           LATERAL DERECHO CENTRAL
        =============================================== */

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

        /* ===============================================
           CUADRANTE INTERIOR
           SUPERIOR IZQUIERDO
        =============================================== */

        {
          position: [
            -(
              CROSS_HALF +
              ARM_HALF
            ) /
              2,

            y,

            (
              CROSS_HALF +
              ARM_HALF
            ) /
              2,
          ],

          scale: [
            middleCornerSize,
            ROOF_THICKNESS,
            middleCornerSize,
          ],
        },

        /* SUPERIOR DERECHO */

        {
          position: [
            (
              CROSS_HALF +
              ARM_HALF
            ) /
              2,

            y,

            (
              CROSS_HALF +
              ARM_HALF
            ) /
              2,
          ],

          scale: [
            middleCornerSize,
            ROOF_THICKNESS,
            middleCornerSize,
          ],
        },

        /* INFERIOR IZQUIERDO */

        {
          position: [
            -(
              CROSS_HALF +
              ARM_HALF
            ) /
              2,

            y,

            -(
              CROSS_HALF +
              ARM_HALF
            ) /
              2,
          ],

          scale: [
            middleCornerSize,
            ROOF_THICKNESS,
            middleCornerSize,
          ],
        },

        /* INFERIOR DERECHO */

        {
          position: [
            (
              CROSS_HALF +
              ARM_HALF
            ) /
              2,

            y,

            -(
              CROSS_HALF +
              ARM_HALF
            ) /
              2,
          ],

          scale: [
            middleCornerSize,
            ROOF_THICKNESS,
            middleCornerSize,
          ],
        },
      ];
    }, []);

  /* =======================================================
     CRISTAL DE LA CRUCETA

     5 piezas SIN superposición.

     Esto evita z-fighting.
  ======================================================= */

  const skylightGlassItems =
    useMemo(() => {
      const y =
        WING_HEIGHT +
        0.03;

      return [
        /* CENTRO */
        {
          position: [
            0,
            y,
            0,
          ],

          scale: [
            CROSS_ARM,
            0.08,
            CROSS_ARM,
          ],
        },

        /* NORTE */
        {
          position: [
            0,
            y,
            -6,
          ],

          scale: [
            CROSS_ARM,
            0.08,
            CROSS_ARM,
          ],
        },

        /* SUR */
        {
          position: [
            0,
            y,
            6,
          ],

          scale: [
            CROSS_ARM,
            0.08,
            CROSS_ARM,
          ],
        },

        /* OESTE */
        {
          position: [
            -6,
            y,
            0,
          ],

          scale: [
            CROSS_ARM,
            0.08,
            CROSS_ARM,
          ],
        },

        /* ESTE */
        {
          position: [
            6,
            y,
            0,
          ],

          scale: [
            CROSS_ARM,
            0.08,
            CROSS_ARM,
          ],
        },
      ];
    }, []);

  /* =======================================================
     MARCO DE LA CLARABOYA

     Líneas negras muy finas alrededor de la cruceta.

     Refuerza la forma sin complicar la geometría.
  ======================================================= */

  const skylightFrameItems =
    useMemo(() => {
      const y =
        WING_HEIGHT +
        0.11;

      const thickness =
        0.18;

      return [
        /* BRAZO VERTICAL - laterales */

        {
          position: [
            -ARM_HALF,
            y,
            0,
          ],

          scale: [
            thickness,
            0.12,
            CROSS_TOTAL,
          ],
        },

        {
          position: [
            ARM_HALF,
            y,
            0,
          ],

          scale: [
            thickness,
            0.12,
            CROSS_TOTAL,
          ],
        },

        /* BRAZO HORIZONTAL - superior/inferior */

        {
          position: [
            0,
            y,
            -ARM_HALF,
          ],

          scale: [
            CROSS_TOTAL,
            0.12,
            thickness,
          ],
        },

        {
          position: [
            0,
            y,
            ARM_HALF,
          ],

          scale: [
            CROSS_TOTAL,
            0.12,
            thickness,
          ],
        },

        /* EXTREMOS VERTICALES */

        {
          position: [
            0,
            y,
            -CROSS_HALF,
          ],

          scale: [
            CROSS_ARM,
            0.12,
            thickness,
          ],
        },

        {
          position: [
            0,
            y,
            CROSS_HALF,
          ],

          scale: [
            CROSS_ARM,
            0.12,
            thickness,
          ],
        },

        /* EXTREMOS HORIZONTALES */

        {
          position: [
            -CROSS_HALF,
            y,
            0,
          ],

          scale: [
            thickness,
            0.12,
            CROSS_ARM,
          ],
        },

        {
          position: [
            CROSS_HALF,
            y,
            0,
          ],

          scale: [
            thickness,
            0.12,
            CROSS_ARM,
          ],
        },
      ];
    }, []);

  return (
    <group
      position={
        position
      }
      rotation={
        rotation
      }
    >
      {/* ===================================================
          SUELO

          Una única placa.
          Nada más existe en el interior.
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
          roughness={0.95}
        />
      </mesh>

      {/* ===================================================
          PAREDES EXTERIORES
      =================================================== */}

      <InstancedBoxes
        items={
          wallItems
        }
        color={
          wallColor
        }
        roughness={0.88}
        castShadow
        receiveShadow
      />

      {/* ===================================================
          TECHO ALTO
      =================================================== */}

      <InstancedBoxes
        items={
          roofItems
        }
        color={
          roofColor
        }
        roughness={0.9}
        castShadow
        receiveShadow
      />

      {/* ===================================================
          CRISTAL DE LA CRUCETA
      =================================================== */}

      <instancedMesh
        args={[
          null,
          null,
          skylightGlassItems.length,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            1,
            1,
            1,
          ]}
        />

        <meshPhysicalMaterial
          color={
            glassColor
          }
          transparent
          opacity={0.38}
          transmission={0.4}
          roughness={0.12}
          metalness={0.04}
          side={
            THREE.DoubleSide
          }
        />
      </instancedMesh>

      {/* ===================================================
          INSTANCIAS REALES DEL CRISTAL

          Necesitamos matrices porque el bloque anterior
          define solo la geometría/material.
      =================================================== */}

      <SkylightGlass
        items={
          skylightGlassItems
        }
        color={
          glassColor
        }
      />

      {/* ===================================================
          MARCO DE LA CRUCETA
      =================================================== */}

      <InstancedBoxes
        items={
          skylightFrameItems
        }
        color={
          frameColor
        }
        roughness={0.62}
        metalness={0.16}
        castShadow
      />

      {/* ===================================================
          FÍSICA COMPLETA DE LA CARCASA

          Un solo rigid body.
          Sin interiores.
          Sin escalera.
          Sin terraza.
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

        {/* PARED IZQUIERDA */}

        <CuboidCollider
          args={[
            WALL_THICKNESS /
              2,

            WING_HEIGHT /
              2,

            WING_DEPTH /
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

        {/* PARED DERECHA */}

        <CuboidCollider
          args={[
            WALL_THICKNESS /
              2,

            WING_HEIGHT /
              2,

            WING_DEPTH /
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

        {/* FACHADA */}

        <CuboidCollider
          args={[
            (
              WING_WIDTH -
              WALL_THICKNESS *
                2
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

            HALF_DEPTH -
              WALL_THICKNESS /
                2,
          ]}
        />

        {/* FONDO */}

        <CuboidCollider
          args={[
            (
              WING_WIDTH -
              WALL_THICKNESS *
                2
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

        {/* ===============================================
            COLISIONES DEL TECHO
        =============================================== */}

        {roofItems.map(
          (
            item,
            index
          ) => (
            <CuboidCollider
              key={`roof-collider-${index}`}
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

        {/* ===============================================
            CRISTAL DE LA CLARABOYA

            Aunque visualmente sea vidrio,
            sigue cerrando el edificio físicamente.
        =============================================== */}

        {skylightGlassItems.map(
          (
            item,
            index
          ) => (
            <CuboidCollider
              key={`glass-collider-${index}`}
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

/* =========================================================
   CRISTAL INSTANCIADO

   Separado porque necesita material físico transparente.
========================================================= */

function SkylightGlass({
  items,
  color,
}) {
  const meshRef =
    useRef(null);

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  useLayoutEffect(() => {
    if (
      !meshRef.current
    ) {
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

        meshRef.current
          .setMatrixAt(
            index,
            dummy.matrix
          );
      }
    );

    meshRef.current
      .instanceMatrix
      .needsUpdate =
      true;

    meshRef.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        null,
        null,
        items.length,
      ]}
      receiveShadow
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
        opacity={0.36}
        transmission={0.42}
        roughness={0.1}
        metalness={0.02}
        side={
          THREE.DoubleSide
        }
      />
    </instancedMesh>
  );
}
