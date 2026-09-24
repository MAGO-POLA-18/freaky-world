import * as THREE from "three";

export default function WingInterior() {
  return (
    <group>
      {/* =================================================
          SUELO
      ================================================= */}

      <mesh
        position={[
          0,
          0.012,
          -0.3,
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
          color="#34383d"
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>

      {/* =================================================
          PASILLO CENTRAL
      ================================================= */}

      <mesh
        position={[
          0,
          0.018,
          -4,
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
            8,
            57,
          ]}
        />

        <meshStandardMaterial
          color="#464b51"
          roughness={0.68}
        />
      </mesh>

      {/* =================================================
          PARED DEL FONDO
      ================================================= */}

      <mesh
        position={[
          0,
          7.3,
          -34.55,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            58.6,
            14.4,
          ]}
        />

        <meshStandardMaterial
          color="#e5e7e9"
          roughness={0.88}
          side={
            THREE.DoubleSide
          }
        />
      </mesh>

      {/* =================================================
          PARED IZQUIERDA
      ================================================= */}

      <mesh
        position={[
          -29.55,
          3.6,
          0,
        ]}
        rotation={[
          0,
          Math.PI / 2,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            68.8,
            7,
          ]}
        />

        <meshStandardMaterial
          color="#dde0e2"
          roughness={0.88}
          side={
            THREE.DoubleSide
          }
        />
      </mesh>

      {/* =================================================
          PARED DERECHA
      ================================================= */}

      <mesh
        position={[
          29.55,
          3.6,
          0,
        ]}
        rotation={[
          0,
          -Math.PI / 2,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            68.8,
            7,
          ]}
        />

        <meshStandardMaterial
          color="#dde0e2"
          roughness={0.88}
          side={
            THREE.DoubleSide
          }
        />
      </mesh>

      {/* =================================================
          ZÓCALO IZQUIERDO
      ================================================= */}

      <mesh
        position={[
          -29.48,
          0.18,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.12,
            0.32,
            68,
          ]}
        />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      {/* =================================================
          ZÓCALO DERECHO
      ================================================= */}

      <mesh
        position={[
          29.48,
          0.18,
          0,
        ]}
      >
        <boxGeometry
          args={[
            0.12,
            0.32,
            68,
          ]}
        />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      {/* =================================================
          ZÓCALO FONDO
      ================================================= */}

      <mesh
        position={[
          0,
          0.18,
          -34.45,
        ]}
      >
        <boxGeometry
          args={[
            58.8,
            0.32,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      {/* =================================================
          ILUMINACIÓN FUNCIONAL INTERIOR

          No existen luminarias visibles.

          Estas luces mantienen el edificio
          completamente recorrible de noche.
      ================================================= */}

      <pointLight
        position={[
          0,
          10,
          -18,
        ]}
        intensity={185}
        distance={55}
        decay={1.7}
        color="#fff8ea"
      />

      <pointLight
        position={[
          0,
          7,
          18,
        ]}
        intensity={165}
        distance={45}
        decay={1.7}
        color="#f1f6ff"
      />

      {/* =================================================
          PILAR IZQUIERDO
      ================================================= */}

      <mesh
        position={[
          -25.5,
          3.4,
          29,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            0.7,
            6.8,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#272b30"
          roughness={0.7}
        />
      </mesh>

      {/* =================================================
          PILAR DERECHO
      ================================================= */}

      <mesh
        position={[
          25.5,
          3.4,
          29,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            0.7,
            6.8,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#272b30"
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}
