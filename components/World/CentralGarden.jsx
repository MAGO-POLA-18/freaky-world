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
========================================================= */

function random(seed) {
  const value =
    Math.sin(seed * 9127.431) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );
}

/* =========================================================
   INSTANCIAS GENÉRICAS

   Una geometría repetida muchas veces =
   una sola draw call.
========================================================= */

function Instances({
  items,
  geometry,
  material,
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
    if (
      !ref.current
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

        dummy.rotation.set(
          ...(
            item.rotation ??
            [0, 0, 0]
          )
        );

        const scale =
          item.scale ?? 1;

        if (
          Array.isArray(scale)
        ) {
          dummy.scale.set(
            ...scale
          );
        } else {
          dummy.scale.setScalar(
            scale
          );
        }

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
   ÁRBOLES

   Solo 10.

   Posicionados para:
   - enmarcar la plaza
   - no tapar monumento
   - no invadir edificios
   - dejar libres los cuatro caminos
========================================================= */

const TREES = [
  [-34, -34, 1.0],
  [-23, -38, 0.86],

  [34, -34, 1.04],
  [23, -39, 0.88],

  [-34, 34, 1.03],
  [-23, 39, 0.9],

  [34, 34, 0.98],
  [23, 39, 0.88],

  [-40, 23, 0.86],
  [40, -23, 0.9],
];

/* =========================================================
   CENTRAL GARDEN
========================================================= */

export default function CentralGarden() {
  /* =======================================================
     GEOMETRÍAS
  ======================================================= */

  const trunkGeometry =
    useMemo(
      () =>
        new THREE.CylinderGeometry(
          0.42,
          0.68,
          1,
          9
        ),
      []
    );

  const branchGeometry =
    useMemo(
      () =>
        new THREE.CylinderGeometry(
          0.16,
          0.28,
          1,
          7
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

  const grassGeometry =
    useMemo(
      () => {
        const geometry =
          new THREE.ConeGeometry(
            0.16,
            0.75,
            4
          );

        geometry.translate(
          0,
          0.375,
          0
        );

        return geometry;
      },
      []
    );

  const flowerStemGeometry =
    useMemo(
      () => {
        const geometry =
          new THREE.CylinderGeometry(
            0.025,
            0.035,
            0.48,
            5
          );

        geometry.translate(
          0,
          0.24,
          0
        );

        return geometry;
      },
      []
    );

  const flowerGeometry =
    useMemo(
      () =>
        new THREE.IcosahedronGeometry(
          0.13,
          1
        ),
      []
    );

  const rockGeometry =
    useMemo(
      () =>
        new THREE.DodecahedronGeometry(
          1,
          0
        ),
      []
    );

  /* =======================================================
     MATERIALES
  ======================================================= */

  const trunkMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#594534",

          roughness:
            0.96,

          metalness:
            0,
        }),
      []
    );

  const branchMaterial =
    trunkMaterial;

  const crownDarkMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#315c38",

          roughness:
            0.9,

          metalness:
            0,
        }),
      []
    );

  const crownMidMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#477549",

          roughness:
            0.9,

          metalness:
            0,
        }),
      []
    );

  const crownLightMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#608a55",

          roughness:
            0.92,

          metalness:
            0,
        }),
      []
    );

  const bushDarkMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#365c39",

          roughness:
            0.95,
        }),
      []
    );

  const bushLightMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#527a4d",

          roughness:
            0.95,
        }),
      []
    );

  const grassMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#628654",

          roughness:
            1,
        }),
      []
    );

  const stemMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#477341",

          roughness:
            1,
        }),
      []
    );

  const pinkFlowerMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#dc83a1",

          roughness:
            0.82,
        }),
      []
    );

  const yellowFlowerMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#e5bd55",

          roughness:
            0.82,
        }),
      []
    );

  const purpleFlowerMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#9d86d4",

          roughness:
            0.82,
        }),
      []
    );

  const whiteFlowerMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#e6e3d8",

          roughness:
            0.85,
        }),
      []
    );

  const rockMaterial =
    useMemo(
      () =>
        new THREE.MeshStandardMaterial({
          color:
            "#777b70",

          roughness:
            0.95,
        }),
      []
    );

  /* =======================================================
     TRONCOS
  ======================================================= */

  const trunks =
    useMemo(
      () =>
        TREES.map(
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
              2.25 *
                scale,
              z,
            ],

            rotation: [
              0,
              index *
                0.63,
              0,
            ],

            scale: [
              0.85 *
                scale,

              4.5 *
                scale,

              0.85 *
                scale,
            ],
          })
        ),
      []
    );

  /* =======================================================
     RAMAS PRINCIPALES

     Muy pocas para mejorar silueta.
  ======================================================= */

  const branches =
    useMemo(() => {
      const result = [];

      TREES.forEach(
        (
          [
            x,
            z,
            scale,
          ],
          index
        ) => {
          const angle =
            index *
            0.73;

          result.push({
            position: [
              x +
                Math.cos(
                  angle
                ) *
                  0.65 *
                  scale,

              4.5 *
                scale,

              z +
                Math.sin(
                  angle
                ) *
                  0.65 *
                  scale,
            ],

            rotation: [
              0.55,
              -angle,
              0.45,
            ],

            scale: [
              scale,
              2.6 *
                scale,
              scale,
            ],
          });

          result.push({
            position: [
              x -
                Math.cos(
                  angle
                ) *
                  0.6 *
                  scale,

              4.7 *
                scale,

              z -
                Math.sin(
                  angle
                ) *
                  0.6 *
                  scale,
            ],

            rotation: [
              -0.45,
              angle,
              -0.5,
            ],

            scale: [
              0.85 *
                scale,

              2.2 *
                scale,

              0.85 *
                scale,
            ],
          });
        }
      );

      return result;
    }, []);

  /* =======================================================
     COPAS

     Cada árbol usa varias masas irregulares.
     Nada de una única bola gigante.
  ======================================================= */

  const crownsDark =
    useMemo(() => {
      const result = [];

      TREES.forEach(
        (
          [
            x,
            z,
            scale,
          ],
          index
        ) => {
          const offset =
            index % 2 === 0
              ? 1
              : -1;

          result.push({
            position: [
              x -
                1.25 *
                  scale,

              5.1 *
                scale,

              z +
                0.4 *
                  scale,
            ],

            scale: [
              2.15 *
                scale,

              1.75 *
                scale,

              2 *
                scale,
            ],
          });

          result.push({
            position: [
              x +
                1.2 *
                  scale,

              5.4 *
                scale,

              z -
                0.7 *
                  scale,
            ],

            scale: [
              2.25 *
                scale,

              1.9 *
                scale,

              2.05 *
                scale,
            ],
          });

          result.push({
            position: [
              x +
                0.3 *
                  offset *
                  scale,

              6.3 *
                scale,

              z +
                1.1 *
                  scale,
            ],

            scale: [
              2.1 *
                scale,

              1.85 *
                scale,

              1.95 *
                scale,
            ],
          });
        }
      );

      return result;
    }, []);

  const crownsMid =
    useMemo(() => {
      const result = [];

      TREES.forEach(
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
              x +
                0.5 *
                  scale,

              6.8 *
                scale,

              z -
                0.2 *
                  scale,
            ],

            scale: [
              2.25 *
                scale,

              2 *
                scale,

              2.2 *
                scale,
            ],

            rotation: [
              0,
              index *
                0.42,
              0,
            ],
          });

          result.push({
            position: [
              x -
                0.8 *
                  scale,

              7.35 *
                scale,

              z -
                0.5 *
                  scale,
            ],

            scale: [
              1.8 *
                scale,

              1.7 *
                scale,

              1.85 *
                scale,
            ],
          });
        }
      );

      return result;
    }, []);

  const crownsLight =
    useMemo(
      () =>
        TREES.map(
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
                  index
                ) *
                  0.45,

              8 *
                scale,

              z +
                Math.cos(
                  index
                ) *
                  0.4,
            ],

            scale: [
              1.45 *
                scale,

              1.55 *
                scale,

              1.4 *
                scale,
            ],

            rotation: [
              0,
              index *
                0.77,
              0,
            ],
          })
        ),
      []
    );

  /* =======================================================
     ARBUSTOS

     Agrupados alrededor de árboles,
     sin invadir caminos ni centro.
  ======================================================= */

  const bushes =
    useMemo(() => {
      const result = [];

      let seed =
        2000;

      TREES.forEach(
        (
          [
            x,
            z,
          ],
          treeIndex
        ) => {
          const count =
            treeIndex %
              2 ===
            0
              ? 4
              : 3;

          for (
            let i = 0;
            i < count;
            i++
          ) {
            const angle =
              random(
                seed++
              ) *
              Math.PI *
              2;

            const distance =
              3.2 +
              random(
                seed++
              ) *
                2.2;

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

            if (
              Math.abs(bx) >
                43 ||
              Math.abs(bz) >
                43
            ) {
              continue;
            }

            if (
              Math.abs(bx) <
                14 ||
              Math.abs(bz) <
                14
            ) {
              continue;
            }

            const size =
              0.6 +
              random(
                seed++
              ) *
                0.55;

            result.push({
              position: [
                bx,
                0.72 *
                  size,
                bz,
              ],

              rotation: [
                0,
                angle,
                0,
              ],

              scale: [
                1.4 *
                  size,

                0.85 *
                  size,

                1.25 *
                  size,
              ],
            });
          }
        }
      );

      return result;
    }, []);

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
                2 ===
              0
          )
          .map(
            (
              bush,
              index
            ) => ({
              position: [
                bush
                  .position[0] +
                  0.35,

                bush
                  .position[1] +
                  0.28,

                bush
                  .position[2] -
                  0.2,
              ],

              rotation: [
                0,
                index *
                  0.45,
                0,
              ],

              scale: [
                bush
                  .scale[0] *
                  0.63,

                bush
                  .scale[1] *
                  0.68,

                bush
                  .scale[2] *
                  0.63,
              ],
            })
          ),
      [
        bushes,
      ]
    );

  /* =======================================================
     MATAS PEQUEÑAS DE PASTO

     Muy pocas.
     No pretendemos cubrir toda la superficie.
  ======================================================= */

  const grassTufts =
    useMemo(() => {
      const result = [];

      let seed =
        5000;

      for (
        let i = 0;
        i < 115;
        i++
      ) {
        const quadrant =
          i % 4;

        const negativeX =
          quadrant === 0 ||
          quadrant === 2;

        const negativeZ =
          quadrant < 2;

        const x =
          (
            17 +
            random(
              seed++
            ) *
              25
          ) *
          (
            negativeX
              ? -1
              : 1
          );

        const z =
          (
            17 +
            random(
              seed++
            ) *
              25
          ) *
          (
            negativeZ
              ? -1
              : 1
          );

        result.push({
          position: [
            x,
            0.38,
            z,
          ],

          rotation: [
            0,
            random(
              seed++
            ) *
              Math.PI *
              2,
            0,
          ],

          scale: [
            0.65 +
              random(
                seed++
              ) *
                0.45,

            0.7 +
              random(
                seed++
              ) *
                0.55,

            0.65 +
              random(
                seed++
              ) *
                0.45,
          ],
        });
      }

      return result;
    }, []);

  /* =======================================================
     FLORES

     Pequeños grupos de color.

     Distribución deliberada.
  ======================================================= */

  const flowerCenters =
    [
      [-26, -25],
      [-37, -28],
      [26, -25],
      [37, -29],

      [-26, 25],
      [-37, 29],
      [26, 25],
      [37, 29],

      [-28, -39],
      [28, -39],
      [-28, 39],
      [28, 39],
    ];

  const flowerStems =
    useMemo(() => {
      const result = [];

      let seed =
        8500;

      flowerCenters.forEach(
        (
          [
            cx,
            cz,
          ],
          groupIndex
        ) => {
          const count =
            5 +
            (
              groupIndex %
                3
            );

          for (
            let i = 0;
            i < count;
            i++
          ) {
            const angle =
              random(
                seed++
              ) *
              Math.PI *
              2;

            const radius =
              random(
                seed++
              ) *
              1.7;

            const height =
              0.7 +
              random(
                seed++
              ) *
                0.45;

            result.push({
              position: [
                cx +
                  Math.cos(
                    angle
                  ) *
                    radius,

                0.38,

                cz +
                  Math.sin(
                    angle
                  ) *
                    radius,
              ],

              scale: [
                1,
                height,
                1,
              ],
            });
          }
        }
      );

      return result;
    }, []);

  const flowerHeads =
    useMemo(
      () =>
        flowerStems.map(
          (
            stem,
            index
          ) => ({
            position: [
              stem
                .position[0],

              0.38 +
                0.48 *
                  stem
                    .scale[1],

              stem
                .position[2],
            ],

            scale:
              0.9 +
              (
                index %
                  4
              ) *
                0.07,
          })
        ),
      [
        flowerStems,
      ]
    );

  const pinkFlowers =
    useMemo(
      () =>
        flowerHeads.filter(
          (
            _,
            index
          ) =>
            index %
              4 ===
            0
        ),
      [
        flowerHeads,
      ]
    );

  const yellowFlowers =
    useMemo(
      () =>
        flowerHeads.filter(
          (
            _,
            index
          ) =>
            index %
              4 ===
            1
        ),
      [
        flowerHeads,
      ]
    );

  const purpleFlowers =
    useMemo(
      () =>
        flowerHeads.filter(
          (
            _,
            index
          ) =>
            index %
              4 ===
            2
        ),
      [
        flowerHeads,
      ]
    );

  const whiteFlowers =
    useMemo(
      () =>
        flowerHeads.filter(
          (
            _,
            index
          ) =>
            index %
              4 ===
            3
        ),
      [
        flowerHeads,
      ]
    );

  /* =======================================================
     PIEDRAS DECORATIVAS
  ======================================================= */

  const rocks =
    useMemo(
      () => [
        {
          position: [
            -42,
            0.48,
            -31,
          ],
          rotation: [
            0.1,
            0.6,
            0.15,
          ],
          scale: [
            0.8,
            0.42,
            0.65,
          ],
        },

        {
          position: [
            -31,
            0.42,
            42,
          ],
          rotation: [
            -0.1,
            1.2,
            0,
          ],
          scale: [
            0.58,
            0.35,
            0.72,
          ],
        },

        {
          position: [
            42,
            0.45,
            31,
          ],
          rotation: [
            0,
            2.1,
            -0.08,
          ],
          scale: [
            0.72,
            0.4,
            0.58,
          ],
        },

        {
          position: [
            31,
            0.43,
            -42,
          ],
          rotation: [
            0.08,
            0.3,
            0.12,
          ],
          scale: [
            0.62,
            0.34,
            0.52,
          ],
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          PASTO DECORATIVO
      =================================================== */}

      <Instances
        items={
          grassTufts
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
        receiveShadow
      />

      {/* ===================================================
          ÁRBOLES
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

      <Instances
        items={
          branches
        }
        geometry={
          branchGeometry
        }
        material={
          branchMaterial
        }
        castShadow
        receiveShadow
      />

      <Instances
        items={
          crownsDark
        }
        geometry={
          crownGeometry
        }
        material={
          crownDarkMaterial
        }
        castShadow
        receiveShadow
      />

      <Instances
        items={
          crownsMid
        }
        geometry={
          crownGeometry
        }
        material={
          crownMidMaterial
        }
        castShadow
        receiveShadow
      />

      <Instances
        items={
          crownsLight
        }
        geometry={
          crownGeometry
        }
        material={
          crownLightMaterial
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
          bushDarkMaterial
        }
        castShadow={
          false
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
          bushLightMaterial
        }
        castShadow={
          false
        }
        receiveShadow
      />

      {/* ===================================================
          FLORES
      =================================================== */}

      <Instances
        items={
          flowerStems
        }
        geometry={
          flowerStemGeometry
        }
        material={
          stemMaterial
        }
        castShadow={
          false
        }
        receiveShadow
      />

      <Instances
        items={
          pinkFlowers
        }
        geometry={
          flowerGeometry
        }
        material={
          pinkFlowerMaterial
        }
      />

      <Instances
        items={
          yellowFlowers
        }
        geometry={
          flowerGeometry
        }
        material={
          yellowFlowerMaterial
        }
      />

      <Instances
        items={
          purpleFlowers
        }
        geometry={
          flowerGeometry
        }
        material={
          purpleFlowerMaterial
        }
      />

      <Instances
        items={
          whiteFlowers
        }
        geometry={
          flowerGeometry
        }
        material={
          whiteFlowerMaterial
        }
      />

      {/* ===================================================
          PIEDRAS
      =================================================== */}

      <Instances
        items={
          rocks
        }
        geometry={
          rockGeometry
        }
        material={
          rockMaterial
        }
        castShadow
        receiveShadow
      />

      {/* ===================================================
          COLISIONES

          Solo troncos.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={
          false
        }
      >
        {TREES.map(
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
                2.2 *
                  scale,

                0.58 *
                  scale,
              ]}
              position={[
                x,
                2.2 *
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
