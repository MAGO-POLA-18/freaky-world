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
   RANDOM DETERMINISTA

   Así el jardín NO cambia de posición cada vez que carga.
========================================================= */

function seededRandom(seed) {
  let value =
    Math.sin(seed * 9999.91) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );
}

/* =========================================================
   INSTANCED MESH GENÉRICO
========================================================= */

function Instances({
  items,
  geometry,
  material,
  castShadow = false,
  receiveShadow = false,
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
          item.position[0],
          item.position[1],
          item.position[2]
        );

        dummy.rotation.set(
          item.rotation?.[0] ??
            0,

          item.rotation?.[1] ??
            0,

          item.rotation?.[2] ??
            0
        );

        dummy.scale.set(
          item.scale?.[0] ??
            1,

          item.scale?.[1] ??
            1,

          item.scale?.[2] ??
            1
        );

        dummy.updateMatrix();

        ref.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );

    ref.current.instanceMatrix.needsUpdate =
      true;

    ref.current.computeBoundingSphere();
  }, [
    items,
    dummy,
  ]);

  return (
    <instancedMesh
      ref={ref}
      args={[
        geometry,
        material,
        items.length,
      ]}
      castShadow={
        castShadow
      }
      receiveShadow={
        receiveShadow
      }
    />
  );
}

/* =========================================================
   ZONAS DE CÉSPED

   Coinciden aproximadamente con las franjas verdes
   que ya existen en WorldEnvironment.

   x, z, ancho, profundidad
========================================================= */

const GRASS_PATCHES = [
  [
    -32,
    -76,
    11,
    94,
  ],

  [
    32,
    -76,
    11,
    94,
  ],

  [
    -32,
    76,
    11,
    94,
  ],

  [
    32,
    76,
    11,
    94,
  ],

  [
    76,
    -32,
    94,
    11,
  ],

  [
    76,
    32,
    94,
    11,
  ],

  [
    -76,
    -32,
    94,
    11,
  ],

  [
    -76,
    32,
    94,
    11,
  ],
];

/* =========================================================
   POSICIONES DE LOS ÁRBOLES

   Distribución irregular deliberadamente.
========================================================= */

const TREE_DATA = [
  [
    -31,
    -31,
    1.08,
  ],

  [
    -35,
    -47,
    0.92,
  ],

  [
    -29,
    -67,
    1.13,
  ],

  [
    -34,
    -91,
    1.04,
  ],

  [
    31,
    -31,
    1.02,
  ],

  [
    35,
    -48,
    1.14,
  ],

  [
    29,
    -69,
    0.91,
  ],

  [
    34,
    -91,
    1.08,
  ],

  [
    -31,
    31,
    1.13,
  ],

  [
    -35,
    49,
    0.95,
  ],

  [
    -29,
    68,
    1.07,
  ],

  [
    -34,
    92,
    1.12,
  ],

  [
    31,
    31,
    1.05,
  ],

  [
    35,
    49,
    1.12,
  ],

  [
    29,
    69,
    0.94,
  ],

  [
    34,
    92,
    1.09,
  ],

  [
    -49,
    -31,
    1.06,
  ],

  [
    -69,
    -34,
    0.93,
  ],

  [
    -92,
    -29,
    1.11,
  ],

  [
    -49,
    31,
    1.13,
  ],

  [
    -70,
    34,
    1.02,
  ],

  [
    -92,
    29,
    0.96,
  ],

  [
    49,
    -31,
    1.08,
  ],

  [
    69,
    -34,
    1.12,
  ],

  [
    92,
    -29,
    0.95,
  ],

  [
    49,
    31,
    1.03,
  ],

  [
    70,
    34,
    1.09,
  ],

  [
    92,
    29,
    1.14,
  ],
];

/* =========================================================
   COMPONENTE
========================================================= */

export default function CentralGarden() {
  /* =======================================================
     GEOMETRÍA DE UNA BRIZNA

     Plano estrecho con varios segmentos verticales.

     No es una textura verde:
     ES geometría real.
  ======================================================= */

  const grassGeometry =
    useMemo(() => {
      const geometry =
        new THREE.PlaneGeometry(
          0.065,
          0.72,
          1,
          3
        );

      geometry.translate(
        0,
        0.36,
        0
      );

      return geometry;
    }, []);

  const grassMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#496f35",

          roughness:
            0.95,

          metalness:
            0,

          side:
            THREE.DoubleSide,
        }),
      []
    );

  /* =======================================================
     GENERAR PASTO

     Aproximadamente 2800 briznas.

     Una sola draw call.
  ======================================================= */

  const grassItems =
    useMemo(() => {
      const result = [];

      let seed = 1;

      GRASS_PATCHES.forEach(
        (
          [
            cx,
            cz,
            width,
            depth,
          ]
        ) => {
          const area =
            width * depth;

          const amount =
            Math.floor(
              area * 0.36
            );

          for (
            let i = 0;
            i < amount;
            i++
          ) {
            const rx =
              seededRandom(
                seed++
              );

            const rz =
              seededRandom(
                seed++
              );

            const rs =
              seededRandom(
                seed++
              );

            const rr =
              seededRandom(
                seed++
              );

            result.push({
              position: [
                cx +
                  (rx -
                    0.5) *
                    width,

                0.38,

                cz +
                  (rz -
                    0.5) *
                    depth,
              ],

              rotation: [
                -0.05 +
                  rs *
                    0.1,

                rr *
                  Math.PI *
                  2,

                -0.08 +
                  rs *
                    0.16,
              ],

              scale: [
                0.75 +
                  rs *
                    0.65,

                0.7 +
                  rs *
                    0.8,

                1,
              ],
            });
          }
        }
      );

      return result;
    }, []);

  /* =======================================================
     TRONCOS
  ======================================================= */

  const trunkGeometry =
    useMemo(
      () =>
        new THREE.CylinderGeometry(
          0.5,
          0.72,
          1,
          12
        ),
      []
    );

  const trunkMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#5c4635",

          roughness:
            0.96,

          metalness:
            0,
        }),
      []
    );

  const trunks =
    useMemo(
      () =>
        TREE_DATA.map(
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
              2.5 *
                scale,
              z,
            ],

            rotation: [
              0,
              index *
                0.72,
              0,
            ],

            scale: [
              0.58 *
                scale,

              5 *
                scale,

              0.58 *
                scale,
            ],
          })
        ),
      []
    );

  /* =======================================================
     COPAS

     Usamos varias masas superpuestas por árbol,
     evitando el aspecto de "bola".
  ======================================================= */

  const foliageGeometry =
    useMemo(
      () =>
        new THREE.IcosahedronGeometry(
          1,
          2
        ),
      []
    );

  const foliageMaterialDark =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#25492b",

          roughness:
            0.9,
        }),
      []
    );

  const foliageMaterialMid =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#376139",

          roughness:
            0.9,
        }),
      []
    );

  const foliageMaterialLight =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#4f7845",

          roughness:
            0.9,
        }),
      []
    );

  const foliageDark =
    useMemo(() => {
      const result = [];

      TREE_DATA.forEach(
        (
          [
            x,
            z,
            scale,
          ],
          index
        ) => {
          result.push({
            position: [
              x - 1.25 * scale,
              5.1 * scale,
              z,
            ],

            scale: [
              2.6 * scale,
              2.25 * scale,
              2.5 * scale,
            ],

            rotation: [
              0,
              index * 0.41,
              0,
            ],
          });

          result.push({
            position: [
              x + 1.2 * scale,
              5.4 * scale,
              z + 0.6 * scale,
            ],

            scale: [
              2.5 * scale,
              2.15 * scale,
              2.45 * scale,
            ],

            rotation: [
              0,
              index * 0.67,
              0,
            ],
          });
        }
      );

      return result;
    }, []);

  const foliageMid =
    useMemo(() => {
      const result = [];

      TREE_DATA.forEach(
        (
          [
            x,
            z,
            scale,
          ],
          index
        ) => {
          result.push({
            position: [
              x,
              6.45 * scale,
              z - 0.9 * scale,
            ],

            scale: [
              2.75 * scale,
              2.45 * scale,
              2.7 * scale,
            ],

            rotation: [
              0,
              index * 0.84,
              0,
            ],
          });

          result.push({
            position: [
              x + 0.6 * scale,
              7.6 * scale,
              z + 0.85 * scale,
            ],

            scale: [
              2.15 * scale,
              2.05 * scale,
              2.1 * scale,
            ],

            rotation: [
              0,
              index * 1.1,
              0,
            ],
          });
        }
      );

      return result;
    }, []);

  const foliageLight =
    useMemo(
      () =>
        TREE_DATA.map(
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
                0.6 *
                  scale,

              8.35 *
                scale,

              z -
                0.25 *
                  scale,
            ],

            scale: [
              1.65 *
                scale,

              1.65 *
                scale,

              1.65 *
                scale,
            ],

            rotation: [
              0,
              index *
                1.33,
              0,
            ],
          })
        ),
      []
    );

  /* =======================================================
     ARBUSTOS

     Cada arbusto está compuesto visualmente por varias
     masas vegetales, pero todas las masas usan la misma
     geometría instanciada.
  ======================================================= */

  const bushGeometry =
    useMemo(
      () =>
        new THREE.IcosahedronGeometry(
          1,
          2
        ),
      []
    );

  const bushMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#315b35",

          roughness:
            0.94,
        }),
      []
    );

  const bushMaterialLight =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#477444",

          roughness:
            0.94,
        }),
      []
    );

  const bushes =
    useMemo(() => {
      const result = [];

      let seed = 4000;

      TREE_DATA.forEach(
        (
          [
            x,
            z,
          ],
          treeIndex
        ) => {
          const groups =
            4 +
            (treeIndex %
              3);

          for (
            let i = 0;
            i < groups;
            i++
          ) {
            const angle =
              seededRandom(
                seed++
              ) *
              Math.PI *
              2;

            const distance =
              3.6 +
              seededRandom(
                seed++
              ) *
                2.4;

            const size =
              0.75 +
              seededRandom(
                seed++
              ) *
                0.7;

            const bx =
              x +
              Math.cos(
                angle
              ) *
                distance;

            const bz =
              z +
              Math.sin(
                angle
              ) *
                distance;

            result.push({
              position: [
                bx,
                0.9,
                bz,
              ],

              rotation: [
                0,
                angle,
                0,
              ],

              scale: [
                1.5 *
                  size,

                1.05 *
                  size,

                1.35 *
                  size,
              ],
            });

            result.push({
              position: [
                bx +
                  0.7,

                1.15,

                bz -
                  0.45,
              ],

              rotation: [
                0,
                angle +
                  0.8,
                0,
              ],

              scale: [
                1.1 *
                  size,

                0.85 *
                  size,

                1.15 *
                  size,
              ],
            });
          }
        }
      );

      return result;
    }, []);

  /* =======================================================
     ARBUSTOS MÁS CLAROS

     Segunda capa para dar volumen cromático.
  ======================================================= */

  const bushHighlights =
    useMemo(
      () =>
        bushes
          .filter(
            (
              _,
              index
            ) =>
              index %
                3 ===
              0
          )
          .map(
            (
              item,
              index
            ) => ({
              position: [
                item
                  .position[0] +
                  0.15,

                item
                  .position[1] +
                  0.35,

                item
                  .position[2] -
                  0.12,
              ],

              rotation: [
                0,
                index *
                  0.8,
                0,
              ],

              scale: [
                item
                  .scale[0] *
                  0.65,

                item
                  .scale[1] *
                  0.65,

                item
                  .scale[2] *
                  0.65,
              ],
            })
          ),
      [bushes]
    );

  return (
    <group>
      {/* ===================================================
          PASTO REAL 3D
      =================================================== */}

      <Instances
        items={
          grassItems
        }
        geometry={
          grassGeometry
        }
        material={
          grassMaterial
        }
        castShadow={
          false
        }
      />

      {/* ===================================================
          TRONCOS
      =================================================== */}

      <Instances
        items={
          trunks
        }
        geometry={
          trunkGeometry
        }
        material={
          trunkMaterial
        }
        castShadow
        receiveShadow
      />

      {/* ===================================================
          FOLLAJE OSCURO
      =================================================== */}

      <Instances
        items={
          foliageDark
        }
        geometry={
          foliageGeometry
        }
        material={
          foliageMaterialDark
        }
        castShadow
        receiveShadow
      />

      {/* ===================================================
          FOLLAJE MEDIO
      =================================================== */}

      <Instances
        items={
          foliageMid
        }
        geometry={
          foliageGeometry
        }
        material={
          foliageMaterialMid
        }
        castShadow
        receiveShadow
      />

      {/* ===================================================
          COPA ILUMINADA
      =================================================== */}

      <Instances
        items={
          foliageLight
        }
        geometry={
          foliageGeometry
        }
        material={
          foliageMaterialLight
        }
        castShadow={
          false
        }
        receiveShadow
      />

      {/* ===================================================
          ARBUSTOS
      =================================================== */}

      <Instances
        items={
          bushes
        }
        geometry={
          bushGeometry
        }
        material={
          bushMaterial
        }
        receiveShadow
      />

      <Instances
        items={
          bushHighlights
        }
        geometry={
          bushGeometry
        }
        material={
          bushMaterialLight
        }
        receiveShadow
      />

      {/* ===================================================
          COLISIONES

          Solo los troncos generan colisión.
          Follaje, césped y arbustos no gastan física.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={
          false
        }
      >
        {TREE_DATA.map(
          (
            [
              x,
              z,
              scale,
            ],
            index
          ) => (
            <CylinderCollider
              key={
                index
              }
              args={[
                2.5 *
                  scale,

                0.72 *
                  scale,
              ]}
              position={[
                x,
                2.5 *
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
