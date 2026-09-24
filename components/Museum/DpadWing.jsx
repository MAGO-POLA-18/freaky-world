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

import WingInterior from "./WingInterior";
import RetroWingInterior from "./RetroWingInterior";

/* =========================================================
   INSTANCIAS DE CAJAS

   Muchas piezas iguales se dibujan en una sola llamada
   a la GPU.

   Cada item puede tener:
   - position
   - scale
   - rotation
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.7,
  metalness = 0,
  castShadow = false,
  receiveShadow = false,
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
        const {
          position = [
            0,
            0,
            0,
          ],

          scale = [
            1,
            1,
            1,
          ],

          rotation = [
            0,
            0,
            0,
          ],
        } = item;

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

        meshRef.current.setMatrixAt(
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

  variant = "standard",
}) {
  const isRetro =
    variant === "retro";

  /* =======================================================
     COLORES
  ======================================================= */

  const shellColor =
    "#151719";

  const shellSideColor =
    "#202327";

  const shellTopColor =
    "#111315";

  const shellEdgeColor =
    "#2f3439";

  const terraceColor =
    "#23272b";

  const stairColor =
    "#2c3034";

  const glassColor =
    "#7fb6c8";

  const railColor =
    "#0f1113";

  /* =======================================================
     ESCALERAS STANDARD
  ======================================================= */

  const stairSteps =
    14;

  const stairWidth =
    8;

  const stairHeight =
    7.2;

  const stairStepDepth =
    1.1;

  const stairStartZ =
    0.6;

  const stairRun =
    stairSteps *
    stairStepDepth;

  const stairRampLength =
    Math.sqrt(
      stairRun *
        stairRun +
        stairHeight *
          stairHeight
    );

  const stairRampAngle =
    Math.atan2(
      stairHeight,
      stairRun
    );

  /* =======================================================
     ESCALONES INSTANCIADOS

     Antes:
     28 meshes separados.

     Ahora:
     1 instancedMesh.
  ======================================================= */

  const stairInstances =
    useMemo(() => {
      const items = [];

      for (
        let i = 0;
        i <
        stairSteps;
        i++
      ) {
        const stepHeight =
          ((i + 1) *
            stairHeight) /
          stairSteps;

        const z =
          stairStartZ +
          i *
            stairStepDepth +
          stairStepDepth /
            2;

        items.push({
          position: [
            -14,
            stepHeight /
              2,
            z,
          ],

          scale: [
            stairWidth,
            stepHeight,
            stairStepDepth,
          ],
        });

        items.push({
          position: [
            14,
            stepHeight /
              2,
            z,
          ],

          scale: [
            stairWidth,
            stepHeight,
            stairStepDepth,
          ],
        });
      }

      return items;
    }, [
      stairSteps,
      stairHeight,
      stairStartZ,
      stairStepDepth,
      stairWidth,
    ]);

  /* =======================================================
     POSTES FRONTALES INSTANCIADOS
  ======================================================= */

  const frontPostInstances =
    useMemo(
      () =>
        [
          -28,
          -21,
          -14,
          -7,
          0,
          7,
          14,
          21,
          28,
        ].map(
          (x) => ({
            position: [
              x,
              7.6,
              34.25,
            ],

            scale: [
              0.14,
              1.1,
              0.14,
            ],
          })
        ),
      []
    );

  /* =======================================================
     BARANDILLAS DE ESCALERA INSTANCIADAS
  ======================================================= */

  const stairRailInstances =
    useMemo(
      () =>
        [
          -18.1,
          -9.9,
          9.9,
          18.1,
        ].map(
          (x) => ({
            position: [
              x,
              4.5,
              8.3,
            ],

            rotation: [
              -stairRampAngle,
              0,
              0,
            ],

            scale: [
              0.12,
              0.12,
              stairRampLength,
            ],
          })
        ),
      [
        stairRampAngle,
        stairRampLength,
      ]
    );

  /* =======================================================
     PERFIL DEL EDIFICIO
  ======================================================= */

  const sideShape =
    useMemo(() => {
      const shape =
        new THREE.Shape();

      shape.moveTo(
        -35,
        6.98
      );

      shape.lineTo(
        -35,
        15
      );

      shape.lineTo(
        0,
        15
      );

      shape.lineTo(
        18,
        7
      );

      shape.lineTo(
        18,
        6.98
      );

      shape.lineTo(
        -35,
        6.98
      );

      return shape;
    }, []);

  const sideExtrudeSettings =
    useMemo(
      () => ({
        depth: 0.4,
        bevelEnabled:
          false,
      }),
      []
    );

  /* =======================================================
     TECHO
  ======================================================= */

  const roofDepth =
    18;

  const roofDrop =
    8;

  const roofLength =
    Math.sqrt(
      roofDepth *
        roofDepth +
        roofDrop *
          roofDrop
    );

  const roofAngle =
    Math.atan2(
      roofDrop,
      roofDepth
    );

  return (
    <group
      position={
        position
      }
      rotation={
        rotation
      }
    >
      {/* =================================================
          INTERIOR
      ================================================= */}

      {isRetro ? (
        <RetroWingInterior />
      ) : (
        <WingInterior />
      )}

      {/* =================================================
          SUELO BASE
      ================================================= */}

      <mesh
        position={[
          0,
          0.006,
          0,
        ]}
        rotation={[
          -Math.PI /
            2,
          0,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            60,
            70,
          ]}
        />

        <meshStandardMaterial
          color="#101214"
          roughness={1}
        />
      </mesh>

      {/* =================================================
          PARED LATERAL IZQUIERDA
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -29.8,
            3.49,
            0,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.4,
              7.02,
              70,
            ]}
          />

          <meshStandardMaterial
            color={
              shellSideColor
            }
            roughness={
              0.88
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          PARED LATERAL DERECHA
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            29.8,
            3.49,
            0,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.4,
              7.02,
              70,
            ]}
          />

          <meshStandardMaterial
            color={
              shellSideColor
            }
            roughness={
              0.88
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          FONDO
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            7.49,
            -34.8,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              59.2,
              15.02,
              0.4,
            ]}
          />

          <meshStandardMaterial
            color={
              shellColor
            }
            roughness={
              0.9
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          FACHADA IZQUIERDA
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -19.8,
            3.49,
            34.8,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              19.6,
              7.02,
              0.4,
            ]}
          />

          <meshStandardMaterial
            color={
              shellColor
            }
            roughness={
              0.9
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          FACHADA DERECHA
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            19.8,
            3.49,
            34.8,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              19.6,
              7.02,
              0.4,
            ]}
          />

          <meshStandardMaterial
            color={
              shellColor
            }
            roughness={
              0.9
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          ENTRADA
      ================================================= */}

      <mesh
        position={[
          -10.6,
          3.6,
          35.05,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            1.2,
            7.2,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color={
            isRetro
              ? "#101316"
              : "#24272b"
          }
          roughness={
            0.7
          }
        />
      </mesh>

      <mesh
        position={[
          10.6,
          3.6,
          35.05,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            1.2,
            7.2,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color={
            isRetro
              ? "#101316"
              : "#24272b"
          }
          roughness={
            0.7
          }
        />
      </mesh>

      <mesh
        position={[
          0,
          6.65,
          35.05,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            22.4,
            1.1,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color={
            isRetro
              ? "#101316"
              : "#24272b"
          }
          roughness={
            0.7
          }
        />
      </mesh>

      {/* =================================================
          VIDRIO IZQUIERDO
      ================================================= */}

      <mesh
        position={[
          -20,
          3.7,
          35.08,
        ]}
      >
        <planeGeometry
          args={[
            15,
            5,
          ]}
        />

        <meshPhysicalMaterial
          color={
            glassColor
          }
          transparent
          opacity={0.38}
          roughness={0.12}
          metalness={0.05}
          transmission={0.25}
          side={
            THREE.DoubleSide
          }
        />
      </mesh>

      <mesh
        position={[
          -20,
          3.7,
          35.15,
        ]}
      >
        <boxGeometry
          args={[
            15.6,
            5.6,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color={
            shellEdgeColor
          }
          wireframe
        />
      </mesh>

      {/* =================================================
          VIDRIO DERECHO
      ================================================= */}

      <mesh
        position={[
          20,
          3.7,
          35.08,
        ]}
      >
        <planeGeometry
          args={[
            15,
            5,
          ]}
        />

        <meshPhysicalMaterial
          color={
            glassColor
          }
          transparent
          opacity={0.38}
          roughness={0.12}
          metalness={0.05}
          transmission={0.25}
          side={
            THREE.DoubleSide
          }
        />
      </mesh>

      <mesh
        position={[
          20,
          3.7,
          35.15,
        ]}
      >
        <boxGeometry
          args={[
            15.6,
            5.6,
            0.08,
          ]}
        />

        <meshStandardMaterial
          color={
            shellEdgeColor
          }
          wireframe
        />
      </mesh>

      {/* =================================================
          TERRAZA
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            7,
            26.5,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              59.2,
              0.4,
              17,
            ]}
          />

          <meshStandardMaterial
            color={
              terraceColor
            }
            roughness={
              0.9
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          BARANDILLA FRONTAL
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            8.15,
            34.25,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              59,
              0.18,
              0.18,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          POSTES FRONTALES INSTANCIADOS
      ================================================= */}

      <InstancedBoxes
        items={
          frontPostInstances
        }
        color={
          railColor
        }
        roughness={
          0.7
        }
        castShadow
      />

      {/* =================================================
          BARANDILLAS LATERALES
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -29.25,
            8.15,
            26.5,
          ]}
        >
          <boxGeometry
            args={[
              0.18,
              0.18,
              17,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            29.25,
            8.15,
            26.5,
          ]}
        >
          <boxGeometry
            args={[
              0.18,
              0.18,
              17,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          PERFILES LATERALES
      ================================================= */}

      <mesh
        position={[
          -29.6,
          0,
          0,
        ]}
        rotation={[
          0,
          -Math.PI /
            2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry
          args={[
            sideShape,
            sideExtrudeSettings,
          ]}
        />

        <meshStandardMaterial
          color={
            shellSideColor
          }
          roughness={
            0.9
          }
        />
      </mesh>

      <mesh
        position={[
          30,
          0,
          0,
        ]}
        rotation={[
          0,
          -Math.PI /
            2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry
          args={[
            sideShape,
            sideExtrudeSettings,
          ]}
        />

        <meshStandardMaterial
          color={
            shellSideColor
          }
          roughness={
            0.9
          }
        />
      </mesh>

      {/* =================================================
          TECHO POSTERIOR
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            15,
            -17.5,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              59.2,
              0.4,
              35,
            ]}
          />

          <meshStandardMaterial
            color={
              shellTopColor
            }
            roughness={
              0.9
            }
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          TECHO INCLINADO
      ================================================= */}

      {[
        -23.8,
        0,
        23.8,
      ].map(
        (x) => (
          <RigidBody
            key={`roof-main-${x}`}
            type="fixed"
            colliders="cuboid"
          >
            <mesh
              position={[
                x,
                11,
                9,
              ]}
              rotation={[
                roofAngle,
                0,
                0,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[
                  x === 0
                    ? 20
                    : 11.6,

                  0.4,

                  roofLength,
                ]}
              />

              <meshStandardMaterial
                color={
                  shellTopColor
                }
                roughness={
                  0.9
                }
              />
            </mesh>
          </RigidBody>
        )
      )}

      {/* =================================================
          CIERRE EXTRA RETRO
      ================================================= */}

      {isRetro && (
        <RigidBody
          type="fixed"
          colliders="cuboid"
        >
          <mesh
            position={[
              14,
              11,
              9,
            ]}
            rotation={[
              roofAngle,
              0,
              0,
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                8,
                0.4,
                roofLength,
              ]}
            />

            <meshStandardMaterial
              color={
                shellTopColor
              }
              roughness={
                0.9
              }
            />
          </mesh>
        </RigidBody>
      )}

      {/* =================================================
          ESCALERAS STANDARD
      ================================================= */}

      {!isRetro && (
        <>
          {/* ===============================================
              ESCALONES

              28 objetos visuales
              renderizados en 1 draw call.
          =============================================== */}

          <InstancedBoxes
            items={
              stairInstances
            }
            color={
              stairColor
            }
            roughness={
              0.76
            }
            castShadow
            receiveShadow
          />

          {/* ===============================================
              RAMPAS INVISIBLES

              La física sigue exactamente igual.
          =============================================== */}

          <RigidBody
            type="fixed"
            colliders={
              false
            }
          >
            <CuboidCollider
              args={[
                3.8,
                0.08,
                stairRampLength /
                  2,
              ]}
              position={[
                -14,
                3.55,
                8.3,
              ]}
              rotation={[
                -stairRampAngle,
                0,
                0,
              ]}
              friction={
                1
              }
            />

            <CuboidCollider
              args={[
                3.8,
                0.08,
                stairRampLength /
                  2,
              ]}
              position={[
                14,
                3.55,
                8.3,
              ]}
              rotation={[
                -stairRampAngle,
                0,
                0,
              ]}
              friction={
                1
              }
            />
          </RigidBody>

          {/* ===============================================
              DESCANSO IZQUIERDO
          =============================================== */}

          <RigidBody
            type="fixed"
            colliders="cuboid"
          >
            <mesh
              position={[
                -14,
                7,
                17,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[
                  8,
                  0.4,
                  2,
                ]}
              />

              <meshStandardMaterial
                color={
                  terraceColor
                }
              />
            </mesh>
          </RigidBody>

          {/* ===============================================
              DESCANSO DERECHO
          =============================================== */}

          <RigidBody
            type="fixed"
            colliders="cuboid"
          >
            <mesh
              position={[
                14,
                7,
                17,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[
                  8,
                  0.4,
                  2,
                ]}
              />

              <meshStandardMaterial
                color={
                  terraceColor
                }
              />
            </mesh>
          </RigidBody>

          {/* ===============================================
              BARANDILLAS HORIZONTALES
          =============================================== */}

          {[
            -23.75,
            0,
            23.75,
          ].map(
            (x) => (
              <RigidBody
                key={`inner-rail-${x}`}
                type="fixed"
                colliders="cuboid"
              >
                <mesh
                  position={[
                    x,
                    8.15,
                    18.1,
                  ]}
                >
                  <boxGeometry
                    args={[
                      x === 0
                        ? 20
                        : 10.5,

                      0.18,
                      0.18,
                    ]}
                  />

                  <meshStandardMaterial
                    color={
                      railColor
                    }
                  />
                </mesh>
              </RigidBody>
            )
          )}

          {/* ===============================================
              BARANDILLAS INCLINADAS

              4 meshes -> 1 draw call.
          =============================================== */}

          <InstancedBoxes
            items={
              stairRailInstances
            }
            color={
              railColor
            }
            roughness={
              0.7
            }
          />
        </>
      )}
    </group>
  );
}
