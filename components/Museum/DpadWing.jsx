import { RigidBody } from "@react-three/rapier";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  return (
    <group position={position} rotation={rotation}>

      <RigidBody type="fixed" colliders="cuboid">

        {/* =========================
            BLOQUE PRINCIPAL
            60 m ancho
            70 m profundidad
            14 m altura
        ========================== */}

        {/* SUELO */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>

        {/* PARED IZQUIERDA */}
        <mesh position={[-30, 7, 0]}>
          <boxGeometry args={[0.4, 14, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* PARED DERECHA */}
        <mesh position={[30, 7, 0]}>
          <boxGeometry args={[0.4, 14, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* PARED EXTERIOR */}
        <mesh position={[0, 7, 35]}>
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =========================
            ENTRADA HACIA EL PATIO
        ========================== */}

        {/* IZQUIERDA */}
        <mesh position={[-21, 7, -35]}>
          <boxGeometry args={[18, 14, 0.4]} />
          <meshStandardMaterial color="#e2e2e2" />
        </mesh>

        {/* DERECHA */}
        <mesh position={[21, 7, -35]}>
          <boxGeometry args={[18, 14, 0.4]} />
          <meshStandardMaterial color="#e2e2e2" />
        </mesh>

        {/* SOBRE LA ENTRADA */}
        <mesh position={[0, 11, -35]}>
          <boxGeometry args={[24, 6, 0.4]} />
          <meshStandardMaterial color="#e2e2e2" />
        </mesh>

      </RigidBody>

      {/* TECHO PROVISIONAL */}
      <mesh position={[0, 14.2, 0]}>
        <boxGeometry args={[60.5, 0.4, 70.5]} />
        <meshStandardMaterial color="#bcbcbc" />
      </mesh>

    </group>
  );
}
