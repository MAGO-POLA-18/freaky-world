export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  /*
    Ala maestra de Freaky World.

    Vista desde arriba:
    - parte ancha orientada hacia el patio
    - parte más estrecha hacia el exterior

    Después reutilizaremos esta misma pieza
    cuatro veces, rotándola.
  */

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* SUELO PRINCIPAL */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[14, 0.3, 18]} />
        <meshStandardMaterial color="#606060" />
      </mesh>

      {/* EXTENSIÓN CENTRAL */}
      <mesh position={[0, 0, -11]}>
        <boxGeometry args={[8, 0.3, 4]} />
        <meshStandardMaterial color="#606060" />
      </mesh>

      {/* PARED IZQUIERDA */}
      <mesh position={[-7, 3, 0]}>
        <boxGeometry args={[0.3, 6, 18]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      {/* PARED DERECHA */}
      <mesh position={[7, 3, 0]}>
        <boxGeometry args={[0.3, 6, 18]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      {/* PARED EXTERIOR */}
      <mesh position={[0, 3, 9]}>
        <boxGeometry args={[14, 6, 0.3]} />
        <meshStandardMaterial color="#d5d5d5" />
      </mesh>

      {/* PAREDES DE LA EXTENSIÓN */}
      <mesh position={[-4, 3, -11]}>
        <boxGeometry args={[0.3, 6, 4]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>

      <mesh position={[4, 3, -11]}>
        <boxGeometry args={[0.3, 6, 4]} />
        <meshStandardMaterial color="#dddddd" />
      </mesh>
    </group>
  );
}
