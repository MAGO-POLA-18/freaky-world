"use client";

import {
  RigidBody,
  CylinderCollider,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   MEDIDAS GENERALES

   La cruceta/alas actuales llegan aproximadamente
   a 14-15 unidades de altura en sus partes altas.

   Por eso:
   - botones grandes: 10 de altura
   - pause/select: 4.5 de altura

   Así tienen presencia sin competir con las salas.
========================================================= */

const MAIN_BUTTON_RADIUS = 11;
const MAIN_BUTTON_HEIGHT = 10;

const SMALL_BUTTON_WIDTH = 14;
const SMALL_BUTTON_DEPTH = 5;
const SMALL_BUTTON_HEIGHT = 4.5;

/* =========================================================
   BOTÓN PRINCIPAL
========================================================= */

function MainButton({
  position = [0, 0, 0],
  color = "#8f46ff",
  topColor = "#a96cff",
}) {
  const [x, y, z] = position;

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[x, y, z]}
      friction={0.9}
    >
      {/* COLLIDER REAL */}
      <CylinderCollider
        args={[
          MAIN_BUTTON_HEIGHT / 2,
          MAIN_BUTTON_RADIUS,
        ]}
        position={[
          0,
          MAIN_BUTTON_HEIGHT / 2,
          0,
        ]}
      />

      {/* CUERPO */}
      <mesh
        position={[
          0,
          MAIN_BUTTON_HEIGHT / 2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            MAIN_BUTTON_RADIUS,
            MAIN_BUTTON_RADIUS,
            MAIN_BUTTON_HEIGHT,
            64,
          ]}
        />

        <meshStandardMaterial
          color={color}
          roughness={0.48}
          metalness={0.08}
        />
      </mesh>

      {/* TAPA SUPERIOR */}
      <mesh
        position={[
          0,
          MAIN_BUTTON_HEIGHT + 0.08,
          0,
        ]}
        castShadow
      >
        <cylinderGeometry
          args={[
            MAIN_BUTTON_RADIUS * 0.92,
            MAIN_BUTTON_RADIUS * 0.97,
            0.18,
            64,
          ]}
        />

        <meshStandardMaterial
          color={topColor}
          roughness={0.4}
          metalness={0.05}
        />
      </mesh>

      {/* ARO INFERIOR */}
      <mesh
        position={[
          0,
          0.45,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            MAIN_BUTTON_RADIUS * 1.03,
            MAIN_BUTTON_RADIUS * 1.03,
            0.9,
            64,
          ]}
        />

        <meshStandardMaterial
          color="#17171b"
          roughness={0.72}
        />
      </mesh>
    </RigidBody>
  );
}

/* =========================================================
   PAUSE / SELECT
========================================================= */

function SmallButton({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={position}
      rotation={rotation}
      friction={0.9}
    >
      <CuboidCollider
        args={[
          SMALL_BUTTON_WIDTH / 2,
          SMALL_BUTTON_HEIGHT / 2,
          SMALL_BUTTON_DEPTH / 2,
        ]}
        position={[
          0,
          SMALL_BUTTON_HEIGHT / 2,
          0,
        ]}
      />

      {/* BASE */}
      <mesh
        position={[
          0,
          SMALL_BUTTON_HEIGHT / 2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            SMALL_BUTTON_WIDTH,
            SMALL_BUTTON_HEIGHT,
            SMALL_BUTTON_DEPTH,
          ]}
        />

        <meshStandardMaterial
          color="#222228"
          roughness={0.55}
          metalness={0.06}
        />
      </mesh>

      {/* CARA SUPERIOR */}
      <mesh
        position={[
          0,
          SMALL_BUTTON_HEIGHT + 0.06,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            SMALL_BUTTON_WIDTH * 0.91,
            0.12,
            SMALL_BUTTON_DEPTH * 0.82,
          ]}
        />

        <meshStandardMaterial
          color="#45454d"
          roughness={0.42}
        />
      </mesh>
    </RigidBody>
  );
}

/* =========================================================
   CONJUNTO COMPLETO

   DISTRIBUCIÓN TIPO JOYSTICK:
                       Y
                 X           A
                       B

   Pause / Select en el centro.
========================================================= */

export default function JoystickButtons() {
  return (
    <group>
      {/* =====================================================
          CUATRO BOTONES PRINCIPALES
      ===================================================== */}

      {/* IZQUIERDA / X */}
      <MainButton
        position={[47, 0, 1]}
        color="#356fc5"
        topColor="#4f8de5"
      />

      {/* ARRIBA / Y */}
      <MainButton
        position={[60, 0, -12]}
        color="#d5a52f"
        topColor="#edc454"
      />

      {/* DERECHA / A */}
      <MainButton
        position={[73, 0, 1]}
        color="#40965a"
        topColor="#58b873"
      />

      {/* ABAJO / B */}
      <MainButton
        position={[60, 0, 14]}
        color="#b64048"
        topColor="#d45b63"
      />

      {/* =====================================================
          SELECT
      ===================================================== */}

      <SmallButton
        position={[
          -8,
          0,
          7,
        ]}
        rotation={[
          0,
          -0.15,
          0,
        ]}
      />

      {/* =====================================================
          PAUSE / START
      ===================================================== */}

      <SmallButton
        position={[
          10,
          0,
          7,
        ]}
        rotation={[
          0,
          0.15,
          0,
        ]}
      />
    </group>
  );
}
