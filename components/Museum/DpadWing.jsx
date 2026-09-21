import { RigidBody } from "@react-three/rapier";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders="cuboid">

        {/* =========================================
            PLANTA BAJA
        ========================================== */}

        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* =========================================
            SEGUNDO PISO

            Dos alas laterales.
            El centro queda abierto para formar
            un vestíbulo de doble altura.
        ========================================== */}

        {/* SEGUNDO PISO IZQUIERDO */}
        <mesh position={[-20, 7, 0]}>
          <boxGeometry args={[20, 0.4, 70]} />
          <meshStandardMaterial color="#707070" />
        </mesh>

        {/* SEGUNDO PISO DERECHO */}
        <mesh position={[20, 7, 0]}>
          <boxGeometry args={[20, 0.4, 70]} />
          <meshStandardMaterial color="#707070" />
        </mesh>

        {/* SEGUNDO PISO AL FONDO:
            conecta ambos laterales */}
        <mesh position={[0, 7, 25]}>
          <boxGeometry args={[20, 0.4, 20]} />
          <meshStandardMaterial color="#707070" />
        </mesh>

        {/* =========================================
            PAREDES EXTERIORES
        ========================================== */}

        <mesh position={[-29.8, 7, 0]}>
          <boxGeometry args={[0.4, 14, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        <mesh position={[29.8, 7, 0]}>
          <boxGeometry args={[0.4, 14, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        <mesh position={[0, 7, 34.8]}>
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =========================================
            FACHADA HACIA EL PATIO
            Gran acceso central
        ========================================== */}

        <mesh position={[-20, 7, -34.8]}>
          <boxGeometry args={[20, 14, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        <mesh position={[20, 7, -34.8]}>
          <boxGeometry args={[20, 14, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* DINTEL SUPERIOR */}
        <mesh position={[0, 12, -34.8]}>
          <boxGeometry args={[20, 4, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* =========================================
            ESCALERAS MONUMENTALES

            Dos escaleras simétricas desde
            el vestíbulo hacia el segundo piso.
        ========================================== */}

        {/* ESCALERA IZQUIERDA */}
        {steps.map((_, i) => {
          const height = ((i + 1) * 6.8) / 14;
          const z = -13 + i * 1.15;

          return (
            <mesh
              key={`left-${i}`}
              position={[-14, height / 2, z]}
            >
              <boxGeometry
                args={[8, height, 1.2]}
              />
              <meshStandardMaterial color="#888888" />
            </mesh>
          );
        })}

        {/* ESCALERA DERECHA */}
        {steps.map((_, i) => {
          const height = ((i + 1) * 6.8) / 14;
          const z = -13 + i * 1.15;

          return (
            <mesh
              key={`right-${i}`}
              position={[14, height / 2, z]}
            >
              <boxGeometry
                args={[8, height, 1.2]}
              />
              <meshStandardMaterial color="#888888" />
            </mesh>
          );
        })}

      </RigidBody>

      {/* =========================================
          TECHO PROVISIONAL
      ========================================== */}

      <mesh position={[0, 14.2, 0]}>
        <boxGeometry args={[60, 0.4, 70]} />
        <meshStandardMaterial color="#bcbcbc" />
      </mesh>

    </group>
  );
}
