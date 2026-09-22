import { RigidBody } from "@react-three/rapier";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders="cuboid">

        {/* =================================================
            PLANTA BAJA
        ================================================= */}

        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* =================================================
            PAREDES LATERALES PLANTA BAJA
        ================================================= */}

        <mesh position={[-29.8, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        <mesh position={[29.8, 3.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* PARED DEL FONDO */}

        <mesh position={[0, 7, 34.8]} castShadow receiveShadow>
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =================================================
            FACHADA HACIA EL PATIO
            Mantiene el gran acceso central
        ================================================= */}

        <mesh position={[-20, 3.5, -34.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        <mesh position={[20, 3.5, -34.8]} castShadow receiveShadow>
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* =================================================
            TERRAZA FRONTAL
            Segundo nivel abierto hacia el patio
        ================================================= */}

        <mesh position={[0, 7, -19.5]} receiveShadow>
          <boxGeometry args={[59.2, 0.4, 30]} />
          <meshStandardMaterial color="#777777" roughness={0.9} />
        </mesh>

        {/* BARANDILLA FRONTAL */}

        <mesh position={[0, 7.7, -34.1]} castShadow>
          <boxGeometry args={[59, 1.4, 0.25]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        {/* BARANDILLAS LATERALES DE TERRAZA */}

        <mesh position={[-29.3, 7.7, -19.5]} castShadow>
          <boxGeometry args={[0.25, 1.4, 29]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        <mesh position={[29.3, 7.7, -19.5]} castShadow>
          <boxGeometry args={[0.25, 1.4, 29]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        {/* =================================================
            VOLUMEN POSTERIOR
            Parte alta del edificio
        ================================================= */}

        {/* PARED IZQUIERDA SUPERIOR */}

        <mesh position={[-29.8, 11, 15]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 8, 40]} />
          <meshStandardMaterial color="#cfcfcf" />
        </mesh>

        {/* PARED DERECHA SUPERIOR */}

        <mesh position={[29.8, 11, 15]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 8, 40]} />
          <meshStandardMaterial color="#cfcfcf" />
        </mesh>

        {/* FRENTE DEL VOLUMEN SUPERIOR */}

        <mesh position={[0, 11, -5]} castShadow receiveShadow>
          <boxGeometry args={[60, 8, 0.4]} />
          <meshStandardMaterial color="#d6d6d6" />
        </mesh>

        {/* =================================================
            TECHO POSTERIOR ALTO
        ================================================= */}

        <mesh position={[0, 15.2, 15]} castShadow receiveShadow>
          <boxGeometry args={[60, 0.4, 40]} />
          <meshStandardMaterial color="#bcbcbc" />
        </mesh>

        {/* =================================================
            TRANSICIÓN DIAGONAL
            Marca la silueta ascendente de la cruceta
        ================================================= */}

        <mesh
          position={[-29.9, 11, -10]}
          rotation={[0, 0, -0.52]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.45, 9.2, 10]} />
          <meshStandardMaterial color="#cfcfcf" />
        </mesh>

        <mesh
          position={[29.9, 11, -10]}
          rotation={[0, 0, 0.52]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.45, 9.2, 10]} />
          <meshStandardMaterial color="#cfcfcf" />
        </mesh>

        {/* =================================================
            ESCALERAS MONUMENTALES
        ================================================= */}

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
    </group>
  );
}
