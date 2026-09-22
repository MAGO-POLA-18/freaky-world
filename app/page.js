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

        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* =========================================
            SEGUNDO PISO

            Dejamos una pequeña separación respecto
            de las paredes exteriores para evitar
            caras superpuestas / z-fighting.
        ========================================== */}

        {/* SEGUNDO PISO IZQUIERDO */}
        <mesh position={[-19.7, 7, 0]} receiveShadow>
          <boxGeometry args={[19.4, 0.35, 69.2]} />
          <meshStandardMaterial color="#707070" />
        </mesh>

        {/* SEGUNDO PISO DERECHO */}
        <mesh position={[19.7, 7, 0]} receiveShadow>
          <boxGeometry args={[19.4, 0.35, 69.2]} />
          <meshStandardMaterial color="#707070" />
        </mesh>

        {/* SEGUNDO PISO AL FONDO:
            conecta ambos laterales */}
        <mesh position={[0, 7, 24.8]} receiveShadow>
          <boxGeometry args={[20, 0.35, 19.2]} />
          <meshStandardMaterial color="#707070" />
        </mesh>

        {/* =========================================
            PAREDES EXTERIORES
        ========================================== */}

        <mesh position={[-29.8, 7, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 14, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        <mesh position={[29.8, 7, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 14, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        <mesh position={[0, 7, 34.8]} castShadow receiveShadow>
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =========================================
            FACHADA HACIA EL PATIO
            Gran acceso central
        ========================================== */}

        <mesh position={[-20, 7, -34.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 14, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        <mesh position={[20, 7, -34.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 14, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* DINTEL SUPERIOR */}
        <mesh position={[0, 12, -34.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 4, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* =========================================
            ESCALERAS MONUMENTALES
        ========================================== */}

        {/* ESCALERA IZQUIERDA */}
        {steps.map((_, i) => {
          const height = ((i + 1) * 6.8) / 14;
          const z = -13 + i * 1.15;

          return (
            <mesh
              key={`left-${i}`}
              position={[-14, height / 2, z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[8, height, 1.2]} />
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
              castShadow
              receiveShadow
            >
              <boxGeometry args={[8, height, 1.2]} />
              <meshStandardMaterial color="#888888" />
            </mesh>
          );
        })}
      </RigidBody>

      {/* =========================================
          TECHO PROVISIONAL
      ========================================== */}

      <mesh position={[0, 14.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[60, 0.4, 70]} />
        <meshStandardMaterial color="#bcbcbc" />
      </mesh>
    </group>
  );
}
