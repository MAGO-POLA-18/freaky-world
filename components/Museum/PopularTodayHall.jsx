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

   Primera sala funcional de Freaky World.

   Coordenadas locales:
   +Z = entrada
   -Z = fondo

   Ala disponible:
   60 m x 70 m x 15 m
========================================================= */

/* =========================================================
   INSTANCIAS
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  metalness = 0,
  emissive = "#000000",
  emissiveIntensity = 0,
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
      castShadow={castShadow}
      receiveShadow={
        receiveShadow
      }
    >
      <boxGeometry
        args={[1, 1, 1]}
      />

      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={
          emissiveIntensity
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   ESTACIÓN DE JUEGO

   Placeholder.

   Después contendrá:
   - portada real
   - título
   - posición
   - puntuación
   - comunidad
   - tráiler
   - acceso a ficha 2D
========================================================= */

function GameStation({
  position,
  rotation = 0,
  rank,
}) {
  const accentColors = [
    "#e6b94e",
    "#b8c3cf",
    "#ba8055",
    "#67a3cf",
    "#6f9871",
    "#7b8fa3",
    "#7b8fa3",
    "#7b8fa3",
    "#7b8fa3",
    "#7b8fa3",
  ];

  const accent =
    accentColors[
      rank - 1
    ] ?? "#7b8fa3";

  const hero =
    rank <= 3;

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
          hero
            ? 5.4
            : 4.6,

          0.65,

          hero
            ? 3.1
            : 2.7,
        ]}
        radius={0.2}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#24292d"
          roughness={0.72}
          metalness={0.08}
        />
      </RoundedBox>

      {/* ===============================================
          CUERPO
      =============================================== */}

      <RoundedBox
        position={[
          0,
          2.45,
          0,
        ]}
        args={[
          hero
            ? 4.2
            : 3.7,

          3.4,

          0.5,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#343a3f"
          roughness={0.68}
          metalness={0.06}
        />
      </RoundedBox>

      {/* ===============================================
          PANTALLA / PORTADA
      =============================================== */}

      <RoundedBox
        position={[
          0,
          hero
            ? 5.25
            : 4.95,

          0.08,
        ]}
        args={[
          hero
            ? 4.7
            : 4.1,

          hero
            ? 3.7
            : 3.3,

          0.22,
        ]}
        radius={0.25}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#10151a"
          emissive="#152c3c"
          emissiveIntensity={
            hero
              ? 0.5
              : 0.3
          }
          roughness={0.26}
          metalness={0.12}
        />
      </RoundedBox>

      {/* ===============================================
          ACENTO DE COLOR
      =============================================== */}

      <RoundedBox
        position={[
          0,
          3.28,
          0.2,
        ]}
        args={[
          hero
            ? 4.1
            : 3.55,

          0.12,
          0.12,
        ]}
        radius={0.04}
        smoothness={2}
      >
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={
            hero
              ? 0.8
              : 0.45
          }
        />
      </RoundedBox>

      {/* ===============================================
          IDENTIFICADOR VISUAL DEL PUESTO

          Después será texto real.
      =============================================== */}

      <mesh
        position={[
          -1.45,
          hero
            ? 6.85
            : 6.45,

          0.22,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            hero
              ? 0.4
              : 0.3,

            hero
              ? 0.4
              : 0.3,

            0.12,
            20,
          ]}
        />

        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={
            hero
              ? 0.9
              : 0.35
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
     REVESTIMIENTO INTERIOR

     Exterior negro.
     Interior claro.

     Deja de sentirse como una cueva sin modificar
     la estructura exterior.
  ======================================================= */

  const innerWallItems =
    useMemo(
      () => [
        {
          position: [
            -29.42,
            6.4,
            -2,
          ],

          scale: [
            0.16,
            12,
            61,
          ],
        },

        {
          position: [
            29.42,
            6.4,
            -2,
          ],

          scale: [
            0.16,
            12,
            61,
          ],
        },

        {
          position: [
            0,
            6.4,
            -34.4,
          ],

          scale: [
            58.4,
            12,
            0.16,
          ],
        },
      ],
      []
    );

  /* =======================================================
     PANELES OSCUROS LATERALES
  ======================================================= */

  const wallPanels =
    useMemo(
      () => [
        {
          position: [
            -29.25,
            5,
            16,
          ],
          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            -29.25,
            5,
            0,
          ],
          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            -29.25,
            5,
            -16,
          ],
          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            29.25,
            5,
            16,
          ],
          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            29.25,
            5,
            0,
          ],
          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            29.25,
            5,
            -16,
          ],
          scale: [
            0.14,
            7,
            7,
          ],
        },
      ],
      []
    );

  /* =======================================================
     CAMINO VISUAL

     Una única alfombra/pista central.
     Está suficientemente elevada para no pelear
     visualmente con el suelo.
  ======================================================= */

  const centralPath =
    useMemo(
      () => [
        {
          position: [
            0,
            0.34,
            -1,
          ],

          scale: [
            8,
            0.055,
            61,
          ],
        },
      ],
      []
    );

  /* =======================================================
     LUCES DE TECHO VISUALES

     Las luminarias no generan sombras.
  ======================================================= */

  const lightRails =
    useMemo(
      () => [
        {
          position: [
            -11,
            11.6,
            17,
          ],
          scale: [
            0.16,
            0.12,
            20,
          ],
        },

        {
          position: [
            11,
            11.6,
            17,
          ],
          scale: [
            0.16,
            0.12,
            20,
          ],
        },

        {
          position: [
            -11,
            11.6,
            -13,
          ],
          scale: [
            0.16,
            0.12,
            31,
          ],
        },

        {
          position: [
            11,
            11.6,
            -13,
          ],
          scale: [
            0.16,
            0.12,
            31,
          ],
        },
      ],
      []
    );

  /* =======================================================
     ESTACIONES

     La entrada queda despejada.

     El visitante entra por +Z y avanza hacia -Z.

     Izquierda y derecha:
     4 estaciones por lado.

     TOP 2 y TOP 3 más cerca del fondo.

     TOP 1 frontal al final.
  ======================================================= */

  const stations =
    useMemo(
      () => [
        {
          rank: 10,
          position: [
            -15,
            0.4,
            17,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 9,
          position: [
            15,
            0.4,
            17,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 8,
          position: [
            -15,
            0.4,
            6,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 7,
          position: [
            15,
            0.4,
            6,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 6,
          position: [
            -15,
            0.4,
            -6,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 5,
          position: [
            15,
            0.4,
            -6,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 4,
          position: [
            -15,
            0.4,
            -18,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 3,
          position: [
            15,
            0.4,
            -18,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 2,
          position: [
            -14,
            0.4,
            -29,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 1,
          position: [
            0,
            0.4,
            -28,
          ],
          rotation: 0,
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          INTERIOR CLARO
      =================================================== */}

      <InstancedBoxes
        items={innerWallItems}
        color="#d7d5cf"
        roughness={0.92}
        castShadow={false}
        receiveShadow
      />

      {/* ===================================================
          PANELES OSCUROS
      =================================================== */}

      <InstancedBoxes
        items={wallPanels}
        color="#343a3f"
        roughness={0.8}
        castShadow={false}
        receiveShadow
      />

      {/* ===================================================
          PASILLO CENTRAL
      =================================================== */}

      <InstancedBoxes
        items={centralPath}
        color="#34393d"
        roughness={0.72}
        castShadow={false}
        receiveShadow
      />

      {/* ===================================================
          VESTÍBULO / PORTAL DE ENTRADA

          Esta vez es un arco REAL:
          dos columnas + travesaño.

          El centro queda físicamente abierto.
      =================================================== */}

      <RoundedBox
        position={[
          -6,
          3.5,
          27.5,
        ]}
        args={[
          1,
          6.5,
          0.8,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#262b2f"
          roughness={0.72}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          6,
          3.5,
          27.5,
        ]}
        args={[
          1,
          6.5,
          0.8,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#262b2f"
          roughness={0.72}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          6.55,
          27.5,
        ]}
        args={[
          13,
          0.55,
          0.8,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#262b2f"
          roughness={0.72}
        />
      </RoundedBox>

      {/* ===================================================
          LUZ AZUL DEL PORTAL
      =================================================== */}

      <RoundedBox
        position={[
          0,
          6.24,
          27.05,
        ]}
        args={[
          10.5,
          0.1,
          0.12,
        ]}
        radius={0.03}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#75b8df"
          emissive="#75b8df"
          emissiveIntensity={1}
        />
      </RoundedBox>

      {/* ===================================================
          RIELES DE LUZ
      =================================================== */}

      <InstancedBoxes
        items={lightRails}
        color="#eaf4ff"
        roughness={0.25}
        emissive="#dcecff"
        emissiveIntensity={1.1}
        castShadow={false}
        receiveShadow={false}
      />

      {/* ===================================================
          ILUMINACIÓN REAL

          Sin castShadow.
          Mucho más económica.

          Repartida para evitar una única luz enorme.
      =================================================== */}

      <pointLight
        position={[
          0,
          10,
          22,
        ]}
        color="#fff1dd"
        intensity={28}
        distance={30}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10,
          7,
        ]}
        color="#edf5ff"
        intensity={30}
        distance={28}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10,
          -9,
        ]}
        color="#edf5ff"
        intensity={30}
        distance={28}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10,
          -25,
        ]}
        color="#deefff"
        intensity={28}
        distance={27}
        decay={2}
      />

      {/* ===================================================
          ESTACIONES
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
          PARED HERO TOP 1

          Punto de fuga al entrar.
      =================================================== */}

      <RoundedBox
        position={[
          0,
          7,
          -34.15,
        ]}
        args={[
          18,
          9,
          0.28,
        ]}
        radius={0.32}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#151a1e"
          emissive="#182c3a"
          emissiveIntensity={0.45}
          roughness={0.45}
        />
      </RoundedBox>

      {/* ===================================================
          ACENTO DEL Nº1
      =================================================== */}

      <RoundedBox
        position={[
          0,
          2,
          -33.94,
        ]}
        args={[
          10,
          0.16,
          0.12,
        ]}
        radius={0.05}
        smoothness={2}
      >
        <meshStandardMaterial
          color="#e5b84e"
          emissive="#e5b84e"
          emissiveIntensity={1}
        />
      </RoundedBox>

      {/* ===================================================
          COLISIONES

          Solo mobiliario importante.

          No ponemos física en paredes internas porque
          ya existe la carcasa estructural.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {/* PORTAL */}

        <CuboidCollider
          args={[
            0.5,
            3.25,
            0.4,
          ]}
          position={[
            -6,
            3.5,
            27.5,
          ]}
        />

        <CuboidCollider
          args={[
            0.5,
            3.25,
            0.4,
          ]}
          position={[
            6,
            3.5,
            27.5,
          ]}
        />

        {/* ESTACIONES */}

        {stations.map(
          (
            station
          ) => (
            <CuboidCollider
              key={
                `station-${station.rank}`
              }
              args={[
                station.rank <=
                3
                  ? 2.7
                  : 2.3,

                0.4,

                station.rank <=
                3
                  ? 1.55
                  : 1.35,
              ]}
              position={[
                station
                  .position[0],

                0.8,

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
