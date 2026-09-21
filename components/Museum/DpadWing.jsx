import { RigidBody } from "@react-three/rapier";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders="cuboid">

        {/* =========================================
            ALA MAESTRA
            60 m ancho
            70 m profundidad
            14 m fachada
        ========================================== */}

        {/* SUELO PLANTA BAJA */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* FORJADO SEGUNDO PISO */}
        <mesh position={[0, 7, 0]}>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#707070" />
        </mesh>

        {/* =========================================
            LATERALES EXTERIORES
        ========================================== */}

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

        {/* FONDO DEL EDIFICIO */}
        <mesh position={[0, 7, 35]}>
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =========================================
            FACHADA HACIA EL PATIO

            Entrada central de 20 m.
            La fachada ya NO es una pared continua.
        ========================================== */}

        {/* FACHADA IZQUIERDA */}
        <mesh position={[-20, 7, -35]}>
          <boxGeometry args={[20, 14, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* FACHADA DERECHA */}
        <mesh position={[20, 7, -35]}>
          <boxGeometry args={[20, 14, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* FRANJA SUPERIOR SOBRE LA ENTRADA
            empieza a 10 m de altura */}
        <mesh position={[0, 12, -35]}>
          <boxGeometry args={[20, 4, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

      </RigidBody>

      {/* CUBIERTA PROVISIONAL */}
      <mesh position={[0, 14.2, 0]}>
        <boxGeometry args={[60.5, 0.4, 70.5]} />
        <meshStandardMaterial color="#bcbcbc" />
      </mesh>

    </group>
  );
}
