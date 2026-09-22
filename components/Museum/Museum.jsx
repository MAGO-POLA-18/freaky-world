import DpadWing from "./DpadWing";
import { RigidBody } from "@react-three/rapier";

export default function Museum() {
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

      {/* =================================================
          ILUMINACIÓN AMBIENTAL DEL COMPLEJO
      ================================================= */}

      <ambientLight
        intensity={0.65}
        color="#dce6f2"
      />

      <hemisphereLight
        intensity={1.15}
        color="#e4eeff"
        groundColor="#596051"
      />

      {/* =================================================
          ALAS DEL MUSEO
      ================================================= */}

      <DpadWing
        position={[0, 0, -85]}
        rotation={[0, 0, 0]}
      />

      <DpadWing
        position={[0, 0, 85]}
        rotation={[0, Math.PI, 0]}
      />

      <DpadWing
        position={[85, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      <DpadWing
        position={[-85, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* =================================================
          SUELO FÍSICO GENERAL

          Un único suelo grande para todo el complejo.
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[0, -0.15, 0]}
          receiveShadow
        >
          <boxGeometry args={[260, 0.3, 260]} />

          <meshStandardMaterial
            color="#566154"
            roughness={1}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          PATIO CENTRAL
      ================================================= */}

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

      {/* =================================================
          JARDÍN CENTRAL
      ================================================= */}

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

      {/* =================================================
          GRAN LUZ GENERAL DEL PARQUE
      ================================================= */}

      <pointLight
        position={[0, 17, 0]}
        intensity={260}
        distance={120}
        decay={2}
        color="#fff1d8"
      />

      {/* =================================================
          FAROLAS VISUALES

          Son emisivas pero NO crean 8 pointLights.
      ================================================= */}

      {lampPositions.map(([x, y, z], index) => (
        <group
          key={`park-lamp-${index}`}
          position={[x, y, z]}
        >

          <mesh
            position={[0, 1.65, 0]}
            castShadow
          >
            <cylinderGeometry
              args={[0.09, 0.13, 3.3, 12]}
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
              args={[0.32, 0.24, 0.18, 16]}
            />

            <meshStandardMaterial
              color="#202327"
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 3.2, 0]}>
            <sphereGeometry
              args={[0.21, 16, 16]}
            />

            <meshStandardMaterial
              color="#fff6df"
              emissive="#ffe3ad"
              emissiveIntensity={6}
            />
          </mesh>

        </group>
      ))}

      {/* =================================================
          ILUMINACIÓN DE ACCESOS

          Solo cuatro luces reales.
      ================================================= */}

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

    </group>
  );
}
