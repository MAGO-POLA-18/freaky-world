import DpadWing from "./DpadWing";
import { RigidBody } from "@react-three/rapier";

export default function Museum() {
  const gardenLights = [
    [28, 2.2, 28],
    [-28, 2.2, 28],
    [28, 2.2, -28],
    [-28, 2.2, -28],

    [0, 2.2, 42],
    [0, 2.2, -42],
    [42, 2.2, 0],
    [-42, 2.2, 0],
  ];

  return (
    <group>

      {/* NORTE */}
      <DpadWing
        position={[0, 0, -85]}
        rotation={[0, 0, 0]}
      />

      {/* SUR */}
      <DpadWing
        position={[0, 0, 85]}
        rotation={[0, Math.PI, 0]}
      />

      {/* ESTE */}
      <DpadWing
        position={[85, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* OESTE */}
      <DpadWing
        position={[-85, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* =================================================
          SUELO GENERAL
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, -0.15, 0]}
          receiveShadow
        >
          <boxGeometry args={[220, 0.3, 220]} />

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
          args={[38, 38, 0.2, 64]}
        />

        <meshStandardMaterial
          color="#71806b"
          roughness={1}
        />
      </mesh>

      {/* =================================================
          CENTRO DEL JARDÍN
      ================================================= */}

      <mesh
        position={[0, 0.15, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[18, 18, 0.3, 64]}
        />

        <meshStandardMaterial
          color="#4f6049"
          roughness={1}
        />
      </mesh>

      {/* =================================================
          ILUMINACIÓN GENERAL DEL PARQUE
      ================================================= */}

      <pointLight
        position={[0, 12, 0]}
        intensity={28}
        distance={75}
        decay={2}
        color="#ffe6bd"
      />

      {/* =================================================
          FAROLAS DEL PARQUE
      ================================================= */}

      {gardenLights.map(([x, y, z], index) => (
        <group
          key={`garden-light-${index}`}
          position={[x, 0, z]}
        >
          {/* POSTE */}
          <mesh
            position={[0, 1.3, 0]}
            castShadow
          >
            <cylinderGeometry
              args={[0.08, 0.1, 2.6, 10]}
            />

            <meshStandardMaterial
              color="#202327"
              roughness={0.7}
            />
          </mesh>

          {/* LÁMPARA */}
          <mesh position={[0, y, 0]}>
            <sphereGeometry
              args={[0.18, 16, 16]}
            />

            <meshStandardMaterial
              color="#fff0cf"
              emissive="#ffd89c"
              emissiveIntensity={4}
            />
          </mesh>

          {/* LUZ REAL */}
          <pointLight
            position={[0, y, 0]}
            intensity={12}
            distance={22}
            decay={2}
            color="#ffd89c"
          />
        </group>
      ))}

      {/* =================================================
          ILUMINACIÓN DE FACHADAS

          Cuatro luces suaves hacia las entradas.
      ================================================= */}

      <spotLight
        position={[0, 12, -42]}
        target-position={[0, 3, -85]}
        intensity={20}
        distance={70}
        angle={0.7}
        penumbra={0.65}
        color="#dceaff"
      />

      <spotLight
        position={[0, 12, 42]}
        target-position={[0, 3, 85]}
        intensity={20}
        distance={70}
        angle={0.7}
        penumbra={0.65}
        color="#dceaff"
      />

      <spotLight
        position={[42, 12, 0]}
        target-position={[85, 3, 0]}
        intensity={20}
        distance={70}
        angle={0.7}
        penumbra={0.65}
        color="#dceaff"
      />

      <spotLight
        position={[-42, 12, 0]}
        target-position={[-85, 3, 0]}
        intensity={20}
        distance={70}
        angle={0.7}
        penumbra={0.65}
        color="#dceaff"
      />

    </group>
  );
}
