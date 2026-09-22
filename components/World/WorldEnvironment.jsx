"use client";

import { RigidBody } from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   WORLD ENVIRONMENT

   Raíz del contenido físico de Freaky World.

   Acá se ensamblan las grandes zonas del mundo.

   Actualmente:
   - terreno
   - patio central
   - jardín
   - iluminación exterior
   - farolas
   - museo

   En el futuro podrá incorporar otras zonas sin modificar
   WorldScene.
========================================================= */

export default function WorldEnvironment() {
  const lampPositions = [
    [30, 0, 30],
    [-30, 0, 30],
    [30, 0, -30],
    [-30, 0, -30],

    [0, 0, 48],
    [0, 0, -48],
    [48, 0, 0],
    [-48, 0, 0],
  ];

  return (
    <group>

      {/* ===================================================
          TERRENO GENERAL DEL MUNDO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[0, -0.15, 0]}
          receiveShadow
        >
          <boxGeometry
            args={[260, 0.3, 260]}
          />

          <meshStandardMaterial
            color="#566154"
            roughness={1}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          PATIO CENTRAL
      =================================================== */}

      <mesh
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[38, 38, 0.08, 64]}
        />

        <meshStandardMaterial
          color="#71806b"
          roughness={1}
        />
      </mesh>

      {/* ===================================================
          JARDÍN CENTRAL
      =================================================== */}

      <mesh
        position={[0, 0.08, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[18, 18, 0.1, 64]}
        />

        <meshStandardMaterial
          color="#4f6049"
          roughness={1}
        />
      </mesh>

      {/* ===================================================
          ILUMINACIÓN EXTERIOR
      =================================================== */}

      <pointLight
        position={[0, 17, 0]}
        intensity={260}
        distance={120}
        decay={2}
        color="#fff1d8"
      />

      {/* ===================================================
          FAROLAS
      =================================================== */}

      {lampPositions.map(
        ([x, y, z], index) => (
          <group
            key={`park-lamp-${index}`}
            position={[x, y, z]}
          >
            <mesh
              position={[0, 1.65, 0]}
              castShadow
            >
              <cylinderGeometry
                args={[
                  0.09,
                  0.13,
                  3.3,
                  12,
                ]}
              />

              <meshStandardMaterial
                color="#181b1e"
                roughness={0.65}
              />
            </mesh>

            <mesh
              position={[0, 3.35, 0]}
              castShadow
            >
              <cylinderGeometry
                args={[
                  0.32,
                  0.24,
                  0.18,
                  16,
                ]}
              />

              <meshStandardMaterial
                color="#202327"
                roughness={0.5}
              />
            </mesh>

            <mesh
              position={[0, 3.2, 0]}
            >
              <sphereGeometry
                args={[
                  0.21,
                  16,
                  16,
                ]}
              />

              <meshStandardMaterial
                color="#fff6df"
                emissive="#ffe3ad"
                emissiveIntensity={6}
              />
            </mesh>
          </group>
        )
      )}

      {/* ===================================================
          ILUMINACIÓN DE LOS ACCESOS
      =================================================== */}

      <pointLight
        position={[0, 8, -55]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[0, 8, 55]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[55, 8, 0]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[-55, 8, 0]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      {/* ===================================================
          MUSEO / EDIFICIO PRINCIPAL
      =================================================== */}

      <Museum />

    </group>
  );
}
