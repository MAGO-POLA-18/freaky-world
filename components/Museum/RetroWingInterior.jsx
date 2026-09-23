import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   SALA RETRO
========================================================= */

export default function RetroWingInterior() {
  /* =======================================================
     COLORES
  ======================================================= */

  const floorColor =
    "#24292d";

  const mainFloorColor =
    "#2d3338";

  const wallColor =
    "#d8dcdf";

  const darkWallColor =
    "#181c20";

  const upperFloorColor =
    "#292f34";

  const railColor =
    "#101316";

  const stairColor =
    "#32383d";

  /* =======================================================
     ESCALERA VISUAL
  ======================================================= */

  const stairSteps = 16;

  const stairHeight = 6.8;

  const stairRun = 15.5;

  const stairWidth = 6.5;

  const stepDepth =
    stairRun /
    stairSteps;

  const stairStartZ = 11;

  /* =======================================================
     RAMPA FÍSICA DEFINITIVA

     La escalera visual ocupa aproximadamente:

     Z 11.5  -> Z -3.5

     Su parte superior:

     Y 0     -> Y 7

     La rampa comienza ANTES de los escalones
     para que no exista ningún borde físico
     al comenzar a subir.

     Y termina justo por encima del nivel
     del segundo piso.
  ======================================================= */

  const rampStartZ =
    12.5;

  const rampEndZ =
    -3.5;

  const rampStartY =
    0.03;

  const rampEndY =
    7.08;

  const rampRun =
    rampStartZ -
    rampEndZ;

  const rampRise =
    rampEndY -
    rampStartY;

  const rampLength =
    Math.sqrt(
      rampRun *
        rampRun +
      rampRise *
        rampRise
    );

  const rampAngle =
    Math.atan2(
      rampRise,
      rampRun
    );

  const rampCenterZ =
    (rampStartZ +
      rampEndZ) /
    2;

  /*
    0.075 compensa el espesor del collider.

    De esta manera la CARA SUPERIOR
    de la rampa queda donde queremos,
    no su centro.
  */

  const rampThickness =
    0.08;

  const rampCenterY =
    (rampStartY +
      rampEndY) /
      2 -
    rampThickness *
      Math.cos(
        rampAngle
      );

  return (
    <group>
      {/* ===================================================
          SUELO GENERAL
      =================================================== */}

      <mesh
        position={[
          0,
          0.018,
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
            58.5,
            68,
          ]}
        />

        <meshStandardMaterial
          color={
            floorColor
          }
          roughness={0.84}
        />
      </mesh>

      {/* ===================================================
          VESTÍBULO
      =================================================== */}

      <mesh
        position={[
          0,
          0.035,
          26,
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
            17,
            17,
          ]}
        />

        <meshStandardMaterial
          color="#3c4349"
          roughness={0.72}
        />
      </mesh>

      {/* ===================================================
          MURO IZQUIERDO VESTÍBULO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -9,
            2.6,
            26,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              15,
            ]}
          />

          <meshStandardMaterial
            color={
              darkWallColor
            }
            roughness={0.84}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          MURO DERECHO VESTÍBULO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            9,
            2.6,
            26,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              15,
            ]}
          />

          <meshStandardMaterial
            color={
              darkWallColor
            }
            roughness={0.84}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          MARCO INTERIOR
      =================================================== */}

      <mesh
        position={[
          -9,
          3.5,
          18.4,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.7,
            7,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#111417"
          roughness={0.75}
        />
      </mesh>

      <mesh
        position={[
          9,
          3.5,
          18.4,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.7,
            7,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#111417"
          roughness={0.75}
        />
      </mesh>

      <mesh
        position={[
          0,
          6.65,
          18.4,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            18.7,
            0.7,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#111417"
          roughness={0.75}
        />
      </mesh>

      {/* ===================================================
          GRAN NAVE
      =================================================== */}

      <mesh
        position={[
          0,
          0.038,
          -5,
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
            43,
            45,
          ]}
        />

        <meshStandardMaterial
          color={
            mainFloorColor
          }
          roughness={0.77}
        />
      </mesh>

      {/* ===================================================
          PARED DE FONDO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            5,
            -33.7,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              52,
              10,
              0.5,
            ]}
          />

          <meshStandardMaterial
            color={
              darkWallColor
            }
            roughness={0.86}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          MURO BAJO IZQUIERDO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -23.2,
            2.6,
            -5,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              30,
            ]}
          />

          <meshStandardMaterial
            color={
              wallColor
            }
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          MURO DE ESCALERA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            21,
            2.6,
            -8,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              19,
            ]}
          />

          <meshStandardMaterial
            color={
              wallColor
            }
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          ESCALERA VISUAL

          Los escalones NO tienen collider.

          El personaje camina únicamente
          sobre la rampa invisible.
      =================================================== */}

      {Array.from({
        length:
          stairSteps,
      }).map(
        (_, index) => {
          const height =
            ((index + 1) *
              stairHeight) /
            stairSteps;

          const z =
            stairStartZ -
            index *
              stepDepth;

          return (
            <mesh
              key={`retro-stair-${index}`}
              position={[
                25,
                height / 2,
                z,
              ]}
