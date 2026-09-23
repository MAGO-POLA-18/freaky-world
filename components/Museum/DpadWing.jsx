import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

import WingInterior from "./WingInterior";
import RetroWingInterior from "./RetroWingInterior";

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

  const stairSteps = 14;

  const stairWidth = 8;

  const stairHeight = 7.2;

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
     PERFIL DEL EDIFICIO
  ======================================================= */

  const sideShape =
    new THREE.Shape();

  sideShape.moveTo(
    -35,
    6.98
  );

  sideShape.lineTo(
    -35,
    15
  );

  sideShape.lineTo(
    0,
    15
  );

  sideShape.lineTo(
    18,
    7
  );

  sideShape.lineTo(
    18,
    6.98
  );

  sideShape.lineTo(
    -35,
    6.98
  );

  const sideExtrudeSettings = {
    depth: 0.4,
    bevelEnabled: false,
  };

  /* =======================================================
     TECHO
  ======================================================= */

  const roofDepth = 18;
  const roofDrop = 8;

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
      position={position}
      rotation={rotation}
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
          -Math.PI / 2,
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
          PAREDES LATERALES
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
            roughness={0.88}
          />
        </mesh>
      </RigidBody>

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
            roughness={0.88}
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
            color={shellColor}
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          FACHADA
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
            color={shellColor}
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

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
            color={shellColor}
            roughness={0.9}
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
          color="#24272b"
          roughness={0.7}
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
          color="#24272b"
          roughness={0.7}
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
          color="#24272b"
          roughness={0.7}
        />
      </mesh>

      {/* =================================================
          VIDRIOS
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
          color={glassColor}
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
          color={glassColor}
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
            roughness={0.9}
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
            color={railColor}
          />
        </mesh>
      </RigidBody>

      {[
        -28,
        -21,
        -14,
        -7,
        0,
        7,
        14,
        21,
        28,
      ].map((x) => (
        <mesh
          key={`front-post-${x}`}
          position={[
            x,
            7.6,
            34.25,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.14,
              1.1,
              0.14,
            ]}
          />

          <meshStandardMaterial
            color={railColor}
          />
        </mesh>
      ))}

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
            color={railColor}
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
            color={railColor}
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
          -Math.PI / 2,
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
          roughness={0.9}
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
          -Math.PI / 2,
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
          roughness={0.9}
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
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          TECHO INCLINADO ORIGINAL

          Tres piezas:
          izquierda / centro / derecha
      ================================================= */}

      {[
        -23.8,
        0,
        23.8,
      ].map((x) => (
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
              roughness={0.9}
            />
          </mesh>
        </RigidBody>
      ))}

      {/* =================================================
          RETRO — CERRAR HUECOS DE ESCALERAS ANTIGUAS

          El techo original dejaba dos franjas abiertas
          exactamente donde estaban las dos escaleras.

          Como Retro ya no usa esas escaleras,
          cerramos ambas.
      ================================================= */}

      {isRetro &&
        [
          -14,
          14,
        ].map((x) => (
          <RigidBody
            key={`retro-roof-fill-${x}`}
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
                  8,
                  0.4,
                  roofLength,
                ]}
              />

              <meshStandardMaterial
                color={
                  shellTopColor
                }
                roughness={0.9}
              />
            </mesh>
          </RigidBody>
        ))}

      {/* =================================================
          ESCALERAS ORIGINAL

          SOLO STANDARD
      ================================================= */}

      {!isRetro && (
        <>
          {Array.from({
            length:
              stairSteps,
          }).map(
            (_, i) => {
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

              return (
                <mesh
                  key={`left-step-${i}`}
                  position={[
                    -14,
                    stepHeight /
                      2,
                    z,
                  ]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry
                    args={[
                      stairWidth,
                      stepHeight,
                      stairStepDepth,
                    ]}
                  />

                  <meshStandardMaterial
                    color={
                      stairColor
                    }
                  />
                </mesh>
              );
            }
          )}

          {Array.from({
            length:
              stairSteps,
          }).map(
            (_, i) => {
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

              return (
                <mesh
                  key={`right-step-${i}`}
                  position={[
                    14,
                    stepHeight /
                      2,
                    z,
                  ]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry
                    args={[
                      stairWidth,
                      stepHeight,
                      stairStepDepth,
                    ]}
                  />

                  <meshStandardMaterial
                    color={
                      stairColor
                    }
                  />
                </mesh>
              );
            }
          )}

          {/* RAMPAS */}

          <RigidBody
            type="fixed"
            colliders={false}
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
              friction={1}
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
              friction={1}
            />
          </RigidBody>

          {/* DESCANSOS */}

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

          {/* BARANDILLAS */}

          {[
            -23.75,
            0,
            23.75,
          ].map((x) => (
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
          ))}

          {[
            -18.1,
            -9.9,
            9.9,
            18.1,
          ].map((x) => (
            <mesh
              key={`stair-rail-${x}`}
              position={[
                x,
                4.5,
                8.3,
              ]}
              rotation={[
                -stairRampAngle,
                0,
                0,
              ]}
            >
              <boxGeometry
                args={[
                  0.12,
                  0.12,
                  stairRampLength,
                ]}
              />

              <meshStandardMaterial
                color={
                  railColor
                }
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
