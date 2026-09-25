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
   POPULARES HOY
   PRIMERA SALA FUNCIONAL DE FREAKY WORLD

   Coordenadas locales del ala:
   entrada: +Z
   fondo:   -Z

   Ala:
   60 x 70 x 15 m
========================================================= */

/* =========================================================
   INSTANCIAS
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  metalness = 0,
  castShadow = false,
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
      .needsUpdate = true;

    ref.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  if (!items.length) {
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
   ESTACIÓN DE JUEGO

   Todavía no contiene información real.

   Después acá cargaremos:
   - portada
   - posición
   - nombre
   - puntuación
   - interacción
   - abrir ficha 2D
========================================================= */

function GameStation({
  position,
  rotation = 0,
  rank,
}) {
  const accentColors = [
    "#e3b04b",
    "#bcc4cc",
    "#b8784d",
    "#72a4cc",
    "#789b70",
  ];

  const accent =
    accentColors[
      Math.min(
        rank - 1,
        accentColors.length - 1
      )
    ] ?? "#72a4cc";

  return (
    <group
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
    >
      {/* ===============================================
          BASE
      =============================================== */}

      <RoundedBox
        position={[
          0,
          0.45,
          0,
        ]}
        args={[
          4.8,
          0.8,
          2.8,
        ]}
        radius={0.18}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#25292d"
          roughness={0.78}
        />
      </RoundedBox>

      {/* ===============================================
          COLUMNA
      =============================================== */}

      <RoundedBox
        position={[
          0,
          2.2,
          0,
        ]}
        args={[
          3.8,
          3,
          0.55,
        ]}
        radius={0.2}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#30353a"
          roughness={0.72}
        />
      </RoundedBox>

      {/* ===============================================
          PANTALLA VACÍA
      =============================================== */}

      <RoundedBox
        position={[
          0,
          4.6,
          0.05,
        ]}
        args={[
          4.4,
          3.1,
          0.22,
        ]}
        radius={0.22}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#10151a"
          emissive="#172632"
          emissiveIntensity={0.35}
          roughness={0.28}
          metalness={0.12}
        />
      </RoundedBox>

      {/* ===============================================
          LÍNEA DE COLOR
      =============================================== */}

      <RoundedBox
        position={[
          0,
          3.02,
          0.19,
        ]}
        args={[
          3.7,
          0.12,
          0.15,
        ]}
        radius={0.05}
        smoothness={2}
      >
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.65}
        />
      </RoundedBox>

      {/* ===============================================
          MARCADOR DE RANKING

          Por ahora es una forma visual.
          Luego será número/texto real.
      =============================================== */}

      <mesh
        position={[
          -1.55,
          5.72,
          0.2,
        ]}
      >
        <cylinderGeometry
          args={[
            rank <= 3
              ? 0.38
              : 0.28,

            rank <= 3
              ? 0.38
              : 0.28,

            0.12,
            20,
          ]}
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        />

        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={
            rank <= 3
              ? 0.6
              : 0.25
          }
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   SALA
========================================================= */

export default function PopularTodayHall() {
  /* =======================================================
     PANELES INTERIORES CLAROS

     No reemplazan la pared exterior.
     Son un revestimiento interior.

     Separados de la pared para evitar z-fighting.
  ======================================================= */

  const innerWallItems =
    useMemo(
      () => [
        /* IZQUIERDA */

        {
          position: [
            -29.45,
            6.5,
            -3,
          ],

          scale: [
            0.18,
            12.2,
            60,
          ],
        },

        /* DERECHA */

        {
          position: [
            29.45,
            6.5,
            -3,
          ],

          scale: [
            0.18,
            12.2,
            60,
          ],
        },

        /* FONDO */

        {
          position: [
            0,
            6.5,
            -34.45,
          ],

          scale: [
            58,
            12.2,
            0.18,
          ],
        },
      ],
      []
    );

  /* =======================================================
     PANELES DECORATIVOS OSCUROS

     Rompen el blanco sin llenar todo de detalles.
  ======================================================= */

  const darkWallPanels =
    useMemo(
      () => [
        {
          position: [
            -29.3,
            5,
            14,
          ],
          scale: [
            0.12,
            7,
            8,
          ],
        },

        {
          position: [
            -29.3,
            5,
            -5,
          ],
          scale: [
            0.12,
            7,
            8,
          ],
        },

        {
          position: [
            -29.3,
            5,
            -24,
          ],
          scale: [
            0.12,
            7,
            8,
          ],
        },

        {
          position: [
            29.3,
            5,
            14,
          ],
          scale: [
            0.12,
            7,
            8,
          ],
        },

        {
          position: [
            29.3,
            5,
            -5,
          ],
          scale: [
            0.12,
            7,
            8,
          ],
        },

        {
          position: [
            29.3,
            5,
            -24,
          ],
          scale: [
            0.12,
            7,
            8,
          ],
        },
      ],
      []
    );

  /* =======================================================
     GUÍA CENTRAL DEL RECORRIDO
  ======================================================= */

  const floorGuideItems =
    useMemo(
      () => [
        {
          position: [
            0,
            0.34,
            19,
          ],
          scale: [
            7.5,
            0.045,
            20,
          ],
        },

        {
          position: [
            0,
            0.34,
            -9,
          ],
          scale: [
            7.5,
            0.045,
            32,
          ],
        },
      ],
      []
    );

  /* =======================================================
     LUCES VISUALES DEL TECHO
  ======================================================= */

  const ceilingStrips =
    useMemo(
      () => [
        {
          position: [
            -10,
            11.8,
            19,
          ],
          scale: [
            0.16,
            0.12,
            18,
          ],
        },

        {
          position: [
            10,
            11.8,
            19,
          ],
          scale: [
            0.16,
            0.12,
            18,
          ],
        },

        {
          position: [
            -10,
            11.8,
            -9,
          ],
          scale: [
            0.16,
            0.12,
            28,
          ],
        },

        {
          position: [
            10,
            11.8,
            -9,
          ],
          scale: [
            0.16,
            0.12,
            28,
          ],
        },
      ],
      []
    );

  /* =======================================================
     10 POSICIONES DE JUEGOS

     5 izquierda
     5 derecha

     Dejamos un pasillo central ancho.
  ======================================================= */

  const stations =
    useMemo(
      () => [
        {
          rank: 6,
          position: [
            -15,
            0.4,
            18,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 7,
          position: [
            15,
            0.4,
            18,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 4,
          position: [
            -15,
            0.4,
            7,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 5,
          position: [
            15,
            0.4,
            7,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 2,
          position: [
            -15,
            0.4,
            -5,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 3,
          position: [
            15,
            0.4,
            -5,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 8,
          position: [
            -15,
            0.4,
            -17,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 9,
          position: [
            15,
            0.4,
            -17,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 10,
          position: [
            -15,
            0.4,
            -28,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 1,
          position: [
            0,
            0.4,
            -29,
          ],
          rotation: 0,
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          REVESTIMIENTO INTERIOR
      =================================================== */}

      <InstancedBoxes
        items={
          innerWallItems
        }
        color="#d9d7d0"
        roughness={0.92}
        castShadow={false}
        receiveShadow
      />

      <InstancedBoxes
        items={
          darkWallPanels
        }
        color="#343a3f"
        roughness={0.8}
        castShadow={false}
        receiveShadow
      />

      {/* ===================================================
          PASILLO CENTRAL

          No es collider.
          Es una guía visual.
      =================================================== */}

      <InstancedBoxes
        items={
          floorGuideItems
        }
        color="#31373c"
        roughness={0.74}
        castShadow={false}
        receiveShadow
      />

      {/* ===================================================
          ZONA DE ENTRADA

          Un pequeño portal interior que marca
          la transición exterior -> sala.
      =================================================== */}

      <RoundedBox
        position={[
          0,
          4,
          27.5,
        ]}
        args={[
          14,
          7,
          0.6,
        ]}
        radius={0.35}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#292e32"
          roughness={0.76}
        />
      </RoundedBox>

      {/* HUECO visual del portal */}

      <RoundedBox
        position={[
          0,
          3.4,
          27.15,
        ]}
        args={[
          9,
          5.3,
          0.25,
        ]}
        radius={0.28}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#111518"
          emissive="#152633"
          emissiveIntensity={0.25}
        />
      </RoundedBox>

      {/* ===================================================
          LÍNEAS DE LUZ
      =================================================== */}

      <InstancedBoxes
        items={
          ceilingStrips
        }
        color="#dcecff"
        roughness={0.3}
        castShadow={false}
        receiveShadow={false}
      />

      {/* ===================================================
          ILUMINACIÓN REAL

          Sin sombras.
          Es mucho más barato para móvil.
      =================================================== */}

      <pointLight
        position={[
          0,
          10.5,
          21,
        ]}
        color="#fff3df"
        intensity={22}
        distance={30}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10.5,
          4,
        ]}
        color="#eef5ff"
        intensity={24}
        distance={32}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10.5,
          -14,
        ]}
        color="#eef5ff"
        intensity={24}
        distance={32}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10,
          -29,
        ]}
        color="#d8ecff"
        intensity={20}
        distance={26}
        decay={2}
      />

      {/* ===================================================
          LAS 10 ESTACIONES
      =================================================== */}

      {stations.map(
        (
          station
        ) => (
          <GameStation
            key={
              station.rank
            }
            rank={
              station.rank
            }
            position={
              station.position
            }
            rotation={
              station.rotation
            }
          />
        )
      )}

      {/* ===================================================
          TOP 1

          Fondo de la sala.
          Punto visual de destino.
      =================================================== */}

      <RoundedBox
        position={[
          0,
          7,
          -34.1,
        ]}
        args={[
          17,
          8,
          0.3,
        ]}
        radius={0.35}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#151a1e"
          emissive="#1b3444"
          emissiveIntensity={0.36}
          roughness={0.48}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          2.1,
          -33.8,
        ]}
        args={[
          10,
          0.18,
          0.18,
        ]}
        radius={0.07}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#e0b34f"
          emissive="#e0b34f"
          emissiveIntensity={0.9}
        />
      </RoundedBox>

      {/* ===================================================
          FÍSICA DE LAS ESTACIONES

          Para no atravesarlas.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {stations.map(
          (
            station
          ) => (
            <CuboidCollider
              key={
                `station-${station.rank}`
              }
              args={[
                2.4,
                0.4,
                1.4,
              ]}
              position={[
                station
                  .position[0],

                0.85,

                station
                  .position[2],
              ]}
              rotation={[
                0,
                station.rotation,
                0,
              ]}
            />
          )
        )}
      </RigidBody>
    </group>
  );
}
