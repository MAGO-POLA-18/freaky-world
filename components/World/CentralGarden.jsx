"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";

import {
  useGLTF,
} from "@react-three/drei";

import {
  RigidBody,
  CylinderCollider,
} from "@react-three/rapier";

import * as THREE from "three";

/* =========================================================
   RUTAS
========================================================= */

const BASE =
  "/models/vegetation";

const COMMON_TREE_URL =
  `${BASE}/CommonTree_1.gltf`;

const TWISTED_TREE_URL =
  `${BASE}/TwistedTree_2.gltf`;

const BUSH_URL =
  `${BASE}/Bush_Common.gltf`;

const GRASS_SHORT_URL =
  `${BASE}/Grass_Common_Short.gltf`;

const GRASS_TALL_URL =
  `${BASE}/Grass_Wispy_Tall.gltf`;

/* =========================================================
   RANDOM DETERMINISTA
========================================================= */

function seededRandom(seed) {
  const value =
    Math.sin(
      seed * 9283.17
    ) *
    43758.5453;

  return (
    value -
    Math.floor(value)
  );
}

/* =========================================================
   EXTRAER MESHES DE UN GLTF
========================================================= */

function collectMeshes(scene) {
  const result = [];

  scene.traverse(
    (object) => {
      if (
        !object.isMesh
      ) {
        return;
      }

      result.push({
        geometry:
          object.geometry,

        material:
          object.material,
      });
    }
  );

  return result;
}

/* =========================================================
   INSTANCIAS
========================================================= */

function InstancedModel({
  geometry,
  material,
  items,
  castShadow = false,
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
      !meshRef.current ||
      !geometry ||
      !material
    ) {
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

        const scale =
          item.scale ?? 1;

        if (
          Array.isArray(scale)
        ) {
          dummy.scale.set(
            scale[0],
            scale[1],
            scale[2]
          );
        } else {
          dummy.scale.setScalar(
            scale
          );
        }

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
    geometry,
    material,
    items,
    dummy,
  ]);

  if (
    !geometry ||
    !material ||
    items.length === 0
  ) {
    return null;
  }

  return (
    <instancedMesh
      ref={meshRef}
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
      frustumCulled
    />
  );
}

/* =========================================================
   ÁRBOLES

   IMPORTANTE:

   Nos quedamos dentro de ±40 aproximadamente.

   Así ningún árbol entra en los edificios,
   que comienzan bastante más afuera.
========================================================= */

const TREES = [
  {
    type: "common",
    position: [
      -31,
      0.4,
      -31,
    ],
    scale: 1.05,
    rotation: 0.2,
  },

  {
    type: "twisted",
    position: [
      -21,
      0.4,
      -37,
    ],
    scale: 0.34,
    rotation: 1.2,
  },

  {
    type: "common",
    position: [
      -38,
      0.4,
      -20,
    ],
    scale: 0.98,
    rotation: 2.1,
  },

  {
    type: "common",
    position: [
      31,
      0.4,
      -31,
    ],
    scale: 1.03,
    rotation: 0.8,
  },

  {
    type: "twisted",
    position: [
      21,
      0.4,
      -37,
    ],
    scale: 0.33,
    rotation: 2.3,
  },

  {
    type: "common",
    position: [
      38,
      0.4,
      -20,
    ],
    scale: 1,
    rotation: 1.6,
  },

  {
    type: "common",
    position: [
      -31,
      0.4,
      31,
    ],
    scale: 1.06,
    rotation: 2.5,
  },

  {
    type: "twisted",
    position: [
      -21,
      0.4,
      37,
    ],
    scale: 0.34,
    rotation: 0.4,
  },

  {
    type: "common",
    position: [
      -38,
      0.4,
      20,
    ],
    scale: 0.97,
    rotation: 1.4,
  },

  {
    type: "common",
    position: [
      31,
      0.4,
      31,
    ],
    scale: 1.04,
    rotation: 0.15,
  },

  {
    type: "twisted",
    position: [
      21,
      0.4,
      37,
    ],
    scale: 0.33,
    rotation: 1.5,
  },

  {
    type: "common",
    position: [
      38,
      0.4,
      20,
    ],
    scale: 1,
    rotation: 2.4,
  },
];

/* =========================================================
   ZONAS DE JARDÍN

   Cuatro cuadrados alrededor de la plaza.

   Se evita:
   - centro
   - caminos
   - edificios
========================================================= */

const LAWN_AREAS = [
  {
    minX: -44,
    maxX: -15,
    minZ: -44,
    maxZ: -15,
  },

  {
    minX: 15,
    maxX: 44,
    minZ: -44,
    maxZ: -15,
  },

  {
    minX: -44,
    maxX: -15,
    minZ: 15,
    maxZ: 44,
  },

  {
    minX: 15,
    maxX: 44,
    minZ: 15,
    maxZ: 44,
  },
];

/* =========================================================
   GENERADOR DE PASTO
========================================================= */

function createGrassItems(
  count,
  seedStart,
  tall = false
) {
  const result = [];

  let seed =
    seedStart;

  for (
    let i = 0;
    i < count;
    i++
  ) {
    const area =
      LAWN_AREAS[
        i %
          LAWN_AREAS.length
      ];

    const rx =
      seededRandom(
        seed++
      );

    const rz =
      seededRandom(
        seed++
      );

    const rr =
      seededRandom(
        seed++
      );

    const rs =
      seededRandom(
        seed++
      );

    const x =
      THREE.MathUtils.lerp(
        area.minX,
        area.maxX,
        rx
      );

    const z =
      THREE.MathUtils.lerp(
        area.minZ,
        area.maxZ,
        rz
      );

    /* =====================================================
       EVITAR PASTO EN EL TRONCO
    ===================================================== */

    const nearTree =
      TREES.some(
        (tree) => {
          const dx =
            x -
            tree.position[0];

          const dz =
            z -
            tree.position[2];

          return (
            dx * dx +
              dz * dz <
            2.2 * 2.2
          );
        }
      );

    if (
      nearTree
    ) {
      continue;
    }

    result.push({
      position: [
        x,
        0.42,
        z,
      ],

      rotation: [
        0,
        rr *
          Math.PI *
          2,
        0,
      ],

      scale:
        tall
          ? 0.28 +
            rs * 0.16
          : 0.34 +
            rs * 0.22,
    });
  }

  return result;
}

/* =========================================================
   GENERADOR DE ARBUSTOS
========================================================= */

function createBushItems() {
  const result = [];

  let seed =
    7200;

  TREES.forEach(
    (
      tree,
      treeIndex
    ) => {
      const amount =
        treeIndex % 2 === 0
          ? 4
          : 3;

      for (
        let i = 0;
        i < amount;
        i++
      ) {
        const angle =
          seededRandom(
            seed++
          ) *
          Math.PI *
          2;

        const distance =
          3 +
          seededRandom(
            seed++
          ) *
            2;

        const randomScale =
          0.75 +
          seededRandom(
            seed++
          ) *
            0.4;

        const x =
          tree.position[0] +
          Math.cos(
            angle
          ) *
            distance;

        const z =
          tree.position[2] +
          Math.sin(
            angle
          ) *
            distance;

        /* =================================================
           NO SALIR DEL PARQUE
        ================================================= */

        if (
          Math.abs(x) >
            43 ||
          Math.abs(z) >
            43
        ) {
          continue;
        }

        /* =================================================
           NO INVADIR LOS CAMINOS
        ================================================= */

        if (
          Math.abs(x) <
            13 ||
          Math.abs(z) <
            13
        ) {
          continue;
        }

        result.push({
          position: [
            x,
            0.42,
            z,
          ],

          rotation: [
            0,
            angle,
            0,
          ],

          scale:
            0.78 *
            randomScale,
        });
      }
    }
  );

  return result;
}

/* =========================================================
   CENTRAL GARDEN
========================================================= */

export default function CentralGarden() {
  /* =======================================================
     CARGA DE MODELOS
  ======================================================= */

  const commonTree =
    useGLTF(
      COMMON_TREE_URL
    );

  const twistedTree =
    useGLTF(
      TWISTED_TREE_URL
    );

  const bush =
    useGLTF(
      BUSH_URL
    );

  const grassShort =
    useGLTF(
      GRASS_SHORT_URL
    );

  const grassTall =
    useGLTF(
      GRASS_TALL_URL
    );

  /* =======================================================
     EXTRAER GEOMETRÍAS
  ======================================================= */

  const commonMeshes =
    useMemo(
      () =>
        collectMeshes(
          commonTree.scene
        ),
      [
        commonTree.scene,
      ]
    );

  const twistedMeshes =
    useMemo(
      () =>
        collectMeshes(
          twistedTree.scene
        ),
      [
        twistedTree.scene,
      ]
    );

  const bushMeshes =
    useMemo(
      () =>
        collectMeshes(
          bush.scene
        ),
      [
        bush.scene,
      ]
    );

  const shortGrassMeshes =
    useMemo(
      () =>
        collectMeshes(
          grassShort.scene
        ),
      [
        grassShort.scene,
      ]
    );

  const tallGrassMeshes =
    useMemo(
      () =>
        collectMeshes(
          grassTall.scene
        ),
      [
        grassTall.scene,
      ]
    );

  /* =======================================================
     AJUSTE GENERAL DE MATERIALES
  ======================================================= */

  useEffect(() => {
    const meshes = [
      ...commonMeshes,
      ...twistedMeshes,
      ...bushMeshes,
      ...shortGrassMeshes,
      ...tallGrassMeshes,
    ];

    meshes.forEach(
      ({
        material,
      }) => {
        if (
          !material
        ) {
          return;
        }

        material.side =
          THREE.DoubleSide;

        material.metalness =
          0;

        material.roughness =
          Math.max(
            material.roughness ??
              0.85,
            0.75
          );

        if (
          material.map
        ) {
          material.map.colorSpace =
            THREE.SRGBColorSpace;

          material.map.anisotropy =
            4;

          material.map.needsUpdate =
            true;
        }

        material.needsUpdate =
          true;
      }
    );
  }, [
    commonMeshes,
    twistedMeshes,
    bushMeshes,
    shortGrassMeshes,
    tallGrassMeshes,
  ]);

  /* =======================================================
     INSTANCIAS DE ÁRBOLES
  ======================================================= */

  const commonTreeItems =
    useMemo(
      () =>
        TREES
          .filter(
            (tree) =>
              tree.type ===
              "common"
          )
          .map(
            (tree) => ({
              position:
                tree.position,

              scale:
                tree.scale,

              rotation: [
                0,
                tree.rotation,
                0,
              ],
            })
          ),
      []
    );

  const twistedTreeItems =
    useMemo(
      () =>
        TREES
          .filter(
            (tree) =>
              tree.type ===
              "twisted"
          )
          .map(
            (tree) => ({
              position:
                tree.position,

              scale:
                tree.scale,

              rotation: [
                0,
                tree.rotation,
                0,
              ],
            })
          ),
      []
    );

  /* =======================================================
     ARBUSTOS
  ======================================================= */

  const bushItems =
    useMemo(
      () =>
        createBushItems(),
      []
    );

  /* =======================================================
     PASTO
  ======================================================= */

  const shortGrassItems =
    useMemo(
      () =>
        createGrassItems(
          1000,
          1200,
          false
        ),
      []
    );

  const tallGrassItems =
    useMemo(
      () =>
        createGrassItems(
          180,
          5200,
          true
        ),
      []
    );

  return (
    <group>
      {/* ===================================================
          ÁRBOLES COMUNES
      =================================================== */}

      {commonMeshes.map(
        (
          mesh,
          index
        ) => (
          <InstancedModel
            key={`common-tree-${index}`}
            geometry={
              mesh.geometry
            }
            material={
              mesh.material
            }
            items={
              commonTreeItems
            }
            castShadow
            receiveShadow
          />
        )
      )}

      {/* ===================================================
          ÁRBOLES RETORCIDOS
      =================================================== */}

      {twistedMeshes.map(
        (
          mesh,
          index
        ) => (
          <InstancedModel
            key={`twisted-tree-${index}`}
            geometry={
              mesh.geometry
            }
            material={
              mesh.material
            }
            items={
              twistedTreeItems
            }
            castShadow
            receiveShadow
          />
        )
      )}

      {/* ===================================================
          ARBUSTOS
      =================================================== */}

      {bushMeshes.map(
        (
          mesh,
          index
        ) => (
          <InstancedModel
            key={`bush-${index}`}
            geometry={
              mesh.geometry
            }
            material={
              mesh.material
            }
            items={
              bushItems
            }
            castShadow={
              false
            }
            receiveShadow
          />
        )
      )}

      {/* ===================================================
          PASTO CORTO
      =================================================== */}

      {shortGrassMeshes.map(
        (
          mesh,
          index
        ) => (
          <InstancedModel
            key={`grass-short-${index}`}
            geometry={
              mesh.geometry
            }
            material={
              mesh.material
            }
            items={
              shortGrassItems
            }
            castShadow={
              false
            }
            receiveShadow={
              false
            }
          />
        )
      )}

      {/* ===================================================
          PASTO ALTO
      =================================================== */}

      {tallGrassMeshes.map(
        (
          mesh,
          index
        ) => (
          <InstancedModel
            key={`grass-tall-${index}`}
            geometry={
              mesh.geometry
            }
            material={
              mesh.material
            }
            items={
              tallGrassItems
            }
            castShadow={
              false
            }
            receiveShadow={
              false
            }
          />
        )
      )}

      {/* ===================================================
          COLISIONES DE ÁRBOLES
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={
          false
        }
      >
        {TREES.map(
          (
            tree,
            index
          ) => {
            const twisted =
              tree.type ===
              "twisted";

            const halfHeight =
              twisted
                ? 3.3 *
                  tree.scale
                : 2 *
                  tree.scale;

            const radius =
              twisted
                ? 0.65 *
                  tree.scale
                : 0.48 *
                  tree.scale;

            return (
              <CylinderCollider
                key={`tree-collider-${index}`}
                args={[
                  halfHeight,
                  radius,
                ]}
                position={[
                  tree
                    .position[0],

                  tree
                    .position[1] +
                    halfHeight,

                  tree
                    .position[2],
                ]}
              />
            );
          }
        )}
      </RigidBody>
    </group>
  );
}

/* =========================================================
   PRELOAD
========================================================= */

useGLTF.preload(
  COMMON_TREE_URL
);

useGLTF.preload(
  TWISTED_TREE_URL
);

useGLTF.preload(
  BUSH_URL
);

useGLTF.preload(
  GRASS_SHORT_URL
);

useGLTF.preload(
  GRASS_TALL_URL
);
