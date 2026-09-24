"use client";

import {
  RigidBody,
} from "@react-three/rapier";

import Museum from "../Museum/Museum";
import CentralMonument from "./CentralMonument";

export default function WorldEnvironment() {
  return (
    <group>
      {/* ===================================================
          TERRENO GENERAL
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            -0.3,
            0,
          ]}
          receiveShadow
        >
          <boxGeometry
            args={[
              280,
              0.5,
              280,
            ]}
          />

          <meshStandardMaterial
            color="#3f493e"
            roughness={1}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          AGUA EXTERIOR
      =================================================== */}

      {[
        [-88, -88],
        [88, -88],
        [-88, 88],
        [88, 88],
      ].map(
        (
          [
            x,
            z,
          ],
          index
        ) => (
          <mesh
            key={`water-${index}`}
            position={[
              x,
              -0.01,
              z,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                72,
                0.08,
                72,
              ]}
            />

            <meshStandardMaterial
              color="#315d65"
              roughness={0.28}
              metalness={0.05}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          BASE OSCURA DE LA GRAN CRUZ
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <group>
          <mesh
            position={[
              0,
              0.01,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                94,
                0.32,
                244,
              ]}
            />

            <meshStandardMaterial
              color="#596253"
              roughness={1}
            />
          </mesh>

          <mesh
            position={[
              0,
              0.01,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                244,
                0.32,
                94,
              ]}
            />

            <meshStandardMaterial
              color="#596253"
              roughness={1}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* ===================================================
          GRAN CRUZ VERDE
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <group>
          <mesh
            position={[
              0,
              0.18,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                88,
                0.18,
                238,
              ]}
            />

            <meshStandardMaterial
              color="#63745b"
              roughness={1}
            />
          </mesh>

          <mesh
            position={[
              0,
              0.18,
              0,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                238,
                0.18,
                88,
              ]}
            />

            <meshStandardMaterial
              color="#63745b"
              roughness={1}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* ===================================================
          FRANJAS VERDES
      =================================================== */}

      {[
        [-32, 0.3, -76, 12, 0.12, 96],
        [32, 0.3, -76, 12, 0.12, 96],

        [-32, 0.3, 76, 12, 0.12, 96],
        [32, 0.3, 76, 12, 0.12, 96],

        [76, 0.3, -32, 96, 0.12, 12],
        [76, 0.3, 32, 96, 0.12, 12],

        [-76, 0.3, -32, 96, 0.12, 12],
        [-76, 0.3, 32, 96, 0.12, 12],
      ].map(
        (
          [
            x,
            y,
            z,
            width,
            height,
            depth,
          ],
          index
        ) => (
          <mesh
            key={`garden-strip-${index}`}
            position={[
              x,
              y,
              z,
            ]}
            receiveShadow
          >
            <boxGeometry
              args={[
                width,
                height,
                depth,
              ]}
            />

            <meshStandardMaterial
              color="#43583e"
              roughness={1}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          CAMINO NORTE
      =================================================== */}

      <mesh
        position={[
          0,
          0.36,
          -52,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            12,
            0.09,
            78,
          ]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* ===================================================
          CAMINO SUR
      =================================================== */}

      <mesh
        position={[
          0,
          0.36,
          52,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            12,
            0.09,
            78,
          ]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* ===================================================
          CAMINO ESTE
      =================================================== */}

      <mesh
        position={[
          52,
          0.36,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            78,
            0.09,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* ===================================================
          CAMINO OESTE
      =================================================== */}

      <mesh
        position={[
          -52,
          0.36,
          0,
        ]}
        receiveShadow
      >
        <boxGeometry
          args={[
            78,
            0.09,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* ===================================================
          PLAZA CENTRAL
      =================================================== */}

      <group
        position={[
          0,
          0.4,
          0,
        ]}
      >
        <mesh receiveShadow>
          <boxGeometry
            args={[
              18,
              0.12,
              46,
            ]}
          />

          <meshStandardMaterial
            color="#c7bfad"
            roughness={0.9}
          />
        </mesh>

        <mesh receiveShadow>
          <boxGeometry
            args={[
              46,
              0.12,
              18,
            ]}
          />

          <meshStandardMaterial
            color="#c7bfad"
            roughness={0.9}
          />
        </mesh>
      </group>

      {/* ===================================================
          PLATAFORMA DEL MONUMENTO
      =================================================== */}

      <mesh
        position={[
          0,
          0.53,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            7.3,
            7.8,
            0.16,
            48,
          ]}
        />

        <meshStandardMaterial
          color="#3c453d"
          roughness={0.82}
        />
      </mesh>

      {/* ===================================================
          ANILLO INTERIOR
      =================================================== */}

      <mesh
        position={[
          0,
          0.63,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            4.8,
            5.2,
            0.16,
            48,
          ]}
        />

        <meshStandardMaterial
          color="#24292d"
          roughness={0.6}
          metalness={0.12}
        />
      </mesh>

      {/* ===================================================
          MONUMENTO
      =================================================== */}

      <CentralMonument />

      {/* ===================================================
          ILUMINACIÓN GENERAL DEL PATIO
      =================================================== */}

      <pointLight
        position={[
          0,
          18,
          0,
        ]}
        intensity={230}
        distance={135}
        decay={2}
        color="#fff1d8"
      />

      {/* ===================================================
          ILUMINACIÓN DE ACCESOS
      =================================================== */}

      <pointLight
        position={[
          0,
          8,
          -55,
        ]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[
          0,
          8,
          55,
        ]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[
          55,
          8,
          0,
        ]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[
          -55,
          8,
          0,
        ]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      {/* ===================================================
          EDIFICIOS
      =================================================== */}

      <Museum />
    </group>
  );
}
