"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  RigidBody,
  CylinderCollider,
} from "@react-three/rapier";

import * as THREE from "three";

/* =========================================================
   INSTANCIAS GENÉRICAS
========================================================= */

function InstancedVegetation({
  items,
  geometry,
  material,
  castShadow = true,
  receiveShadow = true,
}) {
  const ref = useRef(null);

  const dummy = useMemo(
    () => new THREE.Object3D(),
    []
  );

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach((item, index) => {
      dummy.position.set(
        item.position[0],
        item.position[1],
        item.position[2]
      );

      dummy.rotation.set(
        item.rotation?.[0] ?? 0,
        item.rotation?.[1] ?? 0,
        item.rotation?.[2] ?? 0
      );

      dummy.scale.set(
        item.scale?.[0] ?? 1,
        item.scale?.[1] ?? 1,
        item.scale?.[2] ?? 1
      );

      dummy.updateMatrix();

      ref.current.setMatrixAt(
        index,
        dummy.matrix
      );
    });

    ref.current.instanceMatrix.needsUpdate =
      true;

    ref.current.computeBoundingSphere();
  }, [items, dummy]);

  return (
    <instancedMesh
      ref={ref}
      args={[
        geometry,
        material,
        items.length,
      ]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

/* =========================================================
   JARDÍN CENTRAL
========================================================= */

export default function CentralGarden() {
  /* =======================================================
     ÁRBOLES

     Están colocados deliberadamente fuera de los
     cuatro caminos principales.

     Centro libre:
     X / Z aproximadamente ±15 metros.
  ======================================================= */

  const trees = useMemo(
    () => [
      [-25, -26, 1.05],
      [-35, -31, 0.9],
      [-25, -43, 1.18],
      [-37, -50, 1.08],

      [25, -26, 1.08],
      [35, -32, 0.94],
      [26, -43, 1.17],
      [38, -51, 1.04],

      [-25, 26, 1.12],
      [-35, 32, 0.94],
      [-26, 44, 1.2],
      [-38, 51, 1.02],

      [25, 26, 1.08],
      [36, 32, 0.96],
      [26, 44, 1.18],
      [38, 52, 1.04],

      [-51, -25, 1.05],
      [-52, 25, 1.08],

      [51, -25, 1.1],
      [52, 25, 1.03],
    ],
    []
  );

  /* =======================================================
     TRONCOS
  ======================================================= */

  const trunks = useMemo(
    () =>
      trees.map(
        (
          [
            x,
            z,
            scale,
          ],
          index
        ) => ({
          position: [
            x,
            2.15 * scale,
            z,
          ],

          scale: [
            0.48 * scale,
            4.3 * scale,
            0.48 * scale,
          ],

          rotation: [
            0,
            index * 0.37,
            0,
          ],
        })
      ),
    [trees]
  );

  /* =======================================================
     COPA BAJA
  ======================================================= */

  const crownLower =
    useMemo(
      () =>
        trees.map(
          (
            [
              x,
              z,
              scale,
            ],
            index
          ) => ({
            position: [
              x +
                Math.sin(
                  index * 1.7
                ) *
                  0.3,

              5.15 * scale,

              z +
                Math.cos(
                  index * 1.3
                ) *
                  0.25,
            ],

            scale: [
              3.3 * scale,
              2.15 * scale,
              3.3 * scale,
            ],

            rotation: [
              0,
              index * 0.55,
              0,
            ],
          })
        ),
      [trees]
    );

  /* =======================================================
     COPA ALTA
  ======================================================= */

  const crownUpper =
    useMemo(
      () =>
        trees.map(
          (
            [
              x,
              z,
              scale,
            ],
            index
          ) => ({
            position: [
              x -
                Math.cos(
                  index
                ) *
                  0.25,

              7.25 * scale,

              z +
                Math.sin(
                  index * 0.8
                ) *
                  0.3,
            ],

            scale: [
              2.55 * scale,
              2.2 * scale,
              2.55 * scale,
            ],

            rotation: [
              0,
              index * 0.73,
              0,
            ],
          })
        ),
      [trees]
    );

  /* =======================================================
     ARBUSTOS

     Forman grupos alrededor de los árboles,
     sin crear una pared vegetal continua.
  ======================================================= */

  const bushes = useMemo(() => {
    const result = [];

    trees.forEach(
      (
        [
          x,
          z,
          treeScale,
        ],
        index
      ) => {
        const amount =
          index % 3 === 0
            ? 4
            : 3;

        for (
          let i = 0;
          i < amount;
          i++
        ) {
          const angle =
            (Math.PI * 2 * i) /
              amount +
            index * 0.67;

          const distance =
            3.3 +
            ((index + i) % 3) *
              0.65;

          const scale =
            0.75 +
            ((index * 5 + i) %
              6) *
              0.055;

          result.push({
            position: [
              x +
                Math.cos(
                  angle
                ) *
                  distance,

              0.78,

              z +
                Math.sin(
                  angle
                ) *
                  distance,
            ],

            scale: [
              1.65 * scale,
              1.15 * scale,
              1.65 * scale,
            ],

            rotation: [
              0,
              angle,
              0,
            ],
          });
        }
      }
    );

    return result;
  }, [trees]);

  /* =======================================================
     SETOS BAJOS

     Definen algunas zonas sin bloquear visualmente
     la arquitectura.
  ======================================================= */

  const hedges = useMemo(
    () => [
      {
        position: [
          -30,
          0.75,
          -17,
        ],
        scale: [
          16,
          1.25,
          1.5,
        ],
      },

      {
        position: [
          30,
          0.75,
          -17,
        ],
        scale: [
          16,
          1.25,
          1.5,
        ],
      },

      {
        position: [
          -30,
          0.75,
          17,
        ],
        scale: [
          16,
          1.25,
          1.5,
        ],
      },

      {
        position: [
          30,
          0.75,
          17,
        ],
        scale: [
          16,
          1.25,
          1.5,
        ],
      },

      {
        position: [
          -17,
          0.75,
          -30,
        ],
        scale: [
          1.5,
          1.25,
          16,
        ],
      },

      {
        position: [
          17,
          0.75,
          -30,
        ],
        scale: [
          1.5,
          1.25,
          16,
        ],
      },

      {
        position: [
          -17,
          0.75,
          30,
        ],
        scale: [
          1.5,
          1.25,
          16,
        ],
      },

      {
        position: [
          17,
          0.75,
          30,
        ],
        scale: [
          1.5,
          1.25,
          16,
        ],
      },
    ],
    []
  );

  /* =======================================================
     GEOMETRÍAS COMPARTIDAS
  ======================================================= */

  const trunkGeometry =
    useMemo(
      () =>
        new THREE.CylinderGeometry(
          0.5,
          0.68,
          1,
          8
        ),
      []
    );

  const crownGeometry =
    useMemo(
      () =>
        new THREE.IcosahedronGeometry(
          1,
          2
        ),
      []
    );

  const bushGeometry =
    useMemo(
      () =>
        new THREE.IcosahedronGeometry(
          1,
          1
        ),
      []
    );

  const hedgeGeometry =
    useMemo(
      () =>
        new THREE.BoxGeometry(
          1,
          1,
          1
        ),
      []
    );

  /* =======================================================
     MATERIALES COMPARTIDOS
  ======================================================= */

  const trunkMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: "#594233",
          roughness: 0.98,
        }),
      []
    );

  const crownLowerMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: "#345635",
          roughness: 0.94,
        }),
      []
    );

  const crownUpperMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: "#426b3d",
          roughness: 0.93,
        }),
      []
    );

  const bushMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: "#304f32",
          roughness: 0.97,
        }),
      []
    );

  const hedgeMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color: "#29462e",
          roughness: 0.98,
        }),
      []
    );

  return (
    <group>
      {/* ===================================================
          TRONCOS
      =================================================== */}

      <InstancedVegetation
        items={trunks}
        geometry={
          trunkGeometry
        }
        material={
          trunkMaterial
        }
      />

      {/* ===================================================
          COPAS
      =================================================== */}

      <InstancedVegetation
        items={
          crownLower
        }
        geometry={
          crownGeometry
        }
        material={
          crownLowerMaterial
        }
      />

      <InstancedVegetation
        items={
          crownUpper
        }
        geometry={
          crownGeometry
        }
        material={
          crownUpperMaterial
        }
      />

      {/* ===================================================
          ARBUSTOS
      =================================================== */}

      <InstancedVegetation
        items={bushes}
        geometry={
          bushGeometry
        }
        material={
          bushMaterial
        }
        castShadow={false}
      />

      {/* ===================================================
          SETOS
      =================================================== */}

      <InstancedVegetation
        items={hedges}
        geometry={
          hedgeGeometry
        }
        material={
          hedgeMaterial
        }
        castShadow={false}
      />

      {/* ===================================================
          COLISIONES DE LOS ÁRBOLES

          Un único RigidBody fijo,
          varios colliders baratos.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {trees.map(
          (
            [
              x,
              z,
              scale,
            ],
            index
          ) => (
            <CylinderCollider
              key={index}
              args={[
                2.15 *
                  scale,
                0.62 *
                  scale,
              ]}
              position={[
                x,
                2.15 *
                  scale,
                z,
              ]}
            />
          )
        )}
      </RigidBody>
    </group>
  );
}
