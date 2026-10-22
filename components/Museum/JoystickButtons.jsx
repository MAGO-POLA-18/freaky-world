"use client";

import {
  RigidBody,
  CylinderCollider,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   TIERRA VICIO — BOTONES FÍSICOS DEL JOYSTICK

   IMPORTANTE:
   Este archivo NO modifica Museum.jsx,
   DpadWing.jsx ni PlayerController.jsx.

   Sólo crea:
   - 4 botones principales
   - SELECT
   - PAUSE / START

   Todos:
   - tienen volumen
   - son sólidos
   - tienen collider
   - no pueden atravesarse
   - pueden ser detectados por la cámara
========================================================= */

/* =========================================================
   ESCALA

   Referencia:
   Las alas/cruceta actuales alcanzan aprox.
   14-15 unidades en sus zonas más altas.

   Los botones quedan algo más bajos para
   mantener proporción de mando real.
========================================================= */

const MAIN_RADIUS = 8.5;
const MAIN_HEIGHT = 8;

const SMALL_WIDTH = 11;
const SMALL_DEPTH = 4.5;
const SMALL_HEIGHT = 3.6;

/* =========================================================
   BOTÓN PRINCIPAL
========================================================= */

function MainButton({
  position,
  bodyColor,
  topColor,
}) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      colliders={false}
      friction={0.95}
      restitution={0}
    >
      {/* COLLIDER FÍSICO */}

      <CylinderCollider
        args={[
          MAIN_HEIGHT / 2,
          MAIN_RADIUS,
        ]}
        position={[
          0,
          MAIN_HEIGHT / 2,
          0,
        ]}
        friction={0.95}
        restitution={0}
      />

      {/* =====================================================
          BASE NEGRA
      ===================================================== */}

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
            MAIN_RADIUS * 1.06,
            MAIN_RADIUS * 1.08,
            0.9,
            48,
          ]}
        />

        <meshStandardMaterial
          color="#17171c"
          roughness={0.72}
          metalness={0.02}
        />
      </mesh>

      {/* =====================================================
          CUERPO PRINCIPAL
      ===================================================== */}

      <mesh
        position={[
          0,
          MAIN_HEIGHT / 2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            MAIN_RADIUS,
            MAIN_RADIUS * 1.01,
            MAIN_HEIGHT,
            48,
          ]}
        />

        <meshStandardMaterial
          color={bodyColor}
          roughness={0.48}
          metalness={0.04}
        />
      </mesh>

      {/* =====================================================
          PARTE SUPERIOR

          Un poco más chica para que tenga
          aspecto de botón físico y no de cilindro.
      ===================================================== */}

      <mesh
        position={[
          0,
          MAIN_HEIGHT + 0.10,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            MAIN_RADIUS * 0.9,
            MAIN_RADIUS * 0.97,
            0.22,
            48,
          ]}
        />

        <meshStandardMaterial
          color={topColor}
          roughness={0.36}
          metalness={0.03}
        />
      </mesh>
    </RigidBody>
  );
}

/* =========================================================
   SELECT / PAUSE
========================================================= */

function SmallButton({
  position,
  rotation = [0, 0, 0],
}) {
  return (
    <RigidBody
      type="fixed"
      position={position}
      rotation={rotation}
      colliders={false}
      friction={0.95}
      restitution={0}
    >
      {/* COLLIDER */}

      <CuboidCollider
        args={[
          SMALL_WIDTH / 2,
          SMALL_HEIGHT / 2,
          SMALL_DEPTH / 2,
        ]}
        position={[
          0,
          SMALL_HEIGHT / 2,
          0,
        ]}
        friction={0.95}
        restitution={0}
      />

      {/* BASE */}

      <mesh
        position={[
          0,
          0.35,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            SMALL_WIDTH * 1.04,
            0.7,
            SMALL_DEPTH * 1.08,
          ]}
        />

        <meshStandardMaterial
          color="#18181d"
          roughness={0.75}
        />
      </mesh>

      {/* CUERPO */}

      <mesh
        position={[
          0,
          SMALL_HEIGHT / 2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            SMALL_WIDTH,
            SMALL_HEIGHT,
            SMALL_DEPTH,
          ]}
        />

        <meshStandardMaterial
          color="#323238"
          roughness={0.52}
          metalness={0.04}
        />
      </mesh>

      {/* SUPERFICIE */}

      <mesh
        position={[
          0,
          SMALL_HEIGHT + 0.08,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            SMALL_WIDTH * 0.88,
            0.16,
            SMALL_DEPTH * 0.76,
          ]}
        />

        <meshStandardMaterial
          color="#56565f"
          roughness={0.4}
        />
      </mesh>
    </RigidBody>
  );
}

/* =========================================================
   GRUPO DE 4 BOTONES

           ARRIBA

      IZQ         DER

           ABAJO

   Lo mantenemos compacto y proporcionado.
========================================================= */

function MainButtons() {
  const gap = 13;

  return (
    <group>
      {/* ARRIBA */}

      <MainButton
        position={[
          0,
          0,
          -gap,
        ]}
        bodyColor="#d6a72f"
        topColor="#efc95c"
      />

      {/* DERECHA */}

      <MainButton
        position={[
          gap,
          0,
          0,
        ]}
        bodyColor="#3e975c"
        topColor="#5cbb79"
      />

      {/* ABAJO */}

      <MainButton
        position={[
          0,
          0,
          gap,
        ]}
        bodyColor="#b5404a"
        topColor="#d25c66"
      />

      {/* IZQUIERDA */}

      <MainButton
        position={[
          -gap,
          0,
          0,
        ]}
        bodyColor="#356fc4"
        topColor="#5390e4"
      />
    </group>
  );
}

/* =========================================================
   COMPONENTE FINAL

   position y rotation permiten colocarlo
   en Museum.jsx SIN rehacer Museum.jsx.

   Ejemplo futuro:

   <JoystickButtons
      position={[55, 0, 15]}
   />

========================================================= */

export default function JoystickButtons({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) {
  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* =====================================================
          BOTONES PRINCIPALES

          Los desplazamos dentro del componente,
          pero NO definimos aquí su posición
          definitiva dentro del mundo.
      ===================================================== */}

      <group
        position={[
          0,
          0,
          0,
        ]}
      >
        <MainButtons />
      </group>

      {/* =====================================================
          SELECT
      ===================================================== */}

      <SmallButton
        position={[
          -9,
          0,
          30,
        ]}
        rotation={[
          0,
          -0.12,
          0,
        ]}
      />

      {/* =====================================================
          PAUSE / START
      ===================================================== */}

      <SmallButton
        position={[
          9,
          0,
          30,
        ]}
        rotation={[
          0,
          0.12,
          0,
        ]}
      />
    </group>
  );
}
