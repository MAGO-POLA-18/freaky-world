import DpadWing from "./DpadWing";

export default function Museum() {
  return (
    <group>

      {/* NORTE */}
      <DpadWing
        position={[0, 0, -20]}
        rotation={[0, 0, 0]}
      />

      {/* SUR */}
      <DpadWing
        position={[0, 0, 20]}
        rotation={[0, Math.PI, 0]}
      />

      {/* ESTE */}
      <DpadWing
        position={[20, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* OESTE */}
      <DpadWing
        position={[-20, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* PATIO CENTRAL PROVISIONAL */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[8, 8, 0.2, 48]} />
        <meshStandardMaterial color="#71806b" />
      </mesh>

      {/* CENTRO DEL JARDÍN */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.3, 48]} />
        <meshStandardMaterial color="#4f6049" />
      </mesh>

      {/* ILUMINACIÓN PROVISIONAL */}
      <ambientLight intensity={1.3} />

      <directionalLight
        position={[15, 20, 10]}
        intensity={2}
      />

    </group>
  );
}
