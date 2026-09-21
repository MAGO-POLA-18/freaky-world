import { RigidBody } from "@react-three/rapier";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  return (
    <group position={position} rotation={rotation}>

      <RigidBody type="fixed" colliders="cuboid">

        {/* =========================
            EDIFICIO PRINCIPAL
            40 m ancho
            46 m profundidad
            14 m altura
        ========================== */}

        {/* SUELO */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[40, 0.4, 46]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>

        {/* PARED IZQUIERDA */}
        <mesh position={[-20, 7, 0]}>
          <boxGeometry args={[0.4, 14, 46]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* PARED DERECHA */}
        <mesh position={[20, 7, 0]}>
          <boxGeometry args={[0.4, 14, 46]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* PARED EXTERIOR */}
        <mesh position={[0, 7, 23]}>
          <boxGeometry args={[40, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =========================
            CUELLO HACIA EL PATIO
        ========================== */}

        {/* SUELO DEL CUELLO */}
        <mesh position={[0, 0, -28]}>
          <boxGeometry args={[18, 0.4, 10]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>

        {/* PARED IZQUIERDA CUELLO */}
        <mesh position={[-9, 7, -28]}>
          <boxGeometry args={[0.4, 14, 10]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* PARED DERECHA CUELLO */}
        <mesh position={[9, 7, -28]}>
          <boxGeometry args={[0.4, 14, 10]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* =========================
            FACHADA HACIA EL PATIO

            Dejamos una entrada enorme:
            12 m ancho x 8 m alto
        ========================== */}

        {/* IZQUIERDA DE ENTRADA */}
        <mesh position={[-14.5, 7, -23]}>
          <boxGeometry args={[11, 14, 0.4]} />
          <meshStandardMaterial color="#e2e2e2" />
        </mesh>

        {/* DERECHA DE ENTRADA */}
        <mesh position={[14.5, 7, -23]}>
          <boxGeometry args={[11, 14, 0.4]} />
          <meshStandardMaterial color="#e2e2e2" />
        </mesh>

        {/* SOBRE ENTRADA */}
        <mesh position={[0, 11, -23]}>
          <boxGeometry args={[18, 6, 0.4]} />
          <meshStandardMaterial color="#e2e2e2" />
        </mesh>

      </RigidBody>

      {/* =========================
          TECHO VISUAL PROVISIONAL
      ========================== */}

      <mesh position={[0, 14.2, 0]}>
        <boxGeometry args={[40.5, 0.4, 46.5]} />
        <meshStandardMaterial color="#bcbcbc" />
      </mesh>

    </group>
  );
}
