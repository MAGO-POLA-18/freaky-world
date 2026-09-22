import { RigidBody } from "@react-three/rapier";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders="cuboid">

        {/* SUELO */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* =============================================
            PLANTA BAJA
        ============================================= */}

        <mesh position={[-29.8, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        <mesh position={[29.8, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* FONDO EXTERIOR */}
        <mesh position={[0, 7, -34.8]} castShadow receiveShadow>
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =============================================
            FACHADA HACIA EL PATIO (+Z)
            Entrada central
        ============================================= */}

        <mesh position={[-20, 3.5, 34.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        <mesh position={[20, 3.5, 34.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* =============================================
            TERRAZA HACIA EL PATIO
            Z +21 hasta +35
        ============================================= */}

        <mesh position={[0, 7, 28]} receiveShadow>
          <boxGeometry args={[59.2, 0.4, 14]} />
          <meshStandardMaterial color="#777777" roughness={0.9} />
        </mesh>

        {/* BARANDILLA FRENTE */}
        <mesh position={[0, 7.7, 34.4]} castShadow>
          <boxGeometry args={[59, 1.4, 0.22]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        {/* BARANDILLAS LATERALES */}
        <mesh position={[-29.3, 7.7, 28]} castShadow>
          <boxGeometry args={[0.22, 1.4, 13]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        <mesh position={[29.3, 7.7, 28]} castShadow>
          <boxGeometry args={[0.22, 1.4, 13]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        {/* =============================================
            VOLUMEN POSTERIOR ALTO
            Hacia el exterior (-Z)
        ============================================= */}

        <mesh position={[-29.8, 11, -8.5]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 8, 53]} />
          <meshStandardMaterial color="#cfcfcf" />
        </mesh>

        <mesh position={[29.8, 11, -8.5]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 8, 53]} />
          <meshStandardMaterial color="#cfcfcf" />
        </mesh>

        {/* TECHO ALTO */}
        <mesh position={[0, 15, -8.5]} castShadow receiveShadow>
          <boxGeometry args={[60, 0.4, 53]} />
          <meshStandardMaterial color="#bcbcbc" />
        </mesh>

        {/* =============================================
            ESCALERAS
            Ahora ascienden HACIA el patio/terraza
        ============================================= */}

        {steps.map((_, i) => {
          const height = ((i + 1) * 6.8) / 14;

          // Invertimos también la dirección original
          const z = 13 - i * 1.15;

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

        {steps.map((_, i) => {
          const height = ((i + 1) * 6.8) / 14;
          const z = 13 - i * 1.15;

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
    </group>
  );
}
