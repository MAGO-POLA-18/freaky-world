import DpadWing from "./DpadWing";
import { RigidBody } from "@react-three/rapier";

export default function Museum() {
  return (
    <group>

    {/* NORTE */}
<DpadWing
  position={[0, 0, -48]}
  rotation={[0, 0, 0]}
/>

{/* SUR */}
<DpadWing
  position={[0, 0, 48]}
  rotation={[0, Math.PI, 0]}
/>

{/* ESTE */}
<DpadWing
  position={[48, 0, 0]}
  rotation={[0, -Math.PI / 2, 0]}
/>

{/* OESTE */}
<DpadWing
  position={[-48, 0, 0]}
  rotation={[0, Math.PI / 2, 0]}
/>

      {/* SUELO FÍSICO GENERAL PROVISIONAL */}
<RigidBody type="fixed" colliders="cuboid">
  <mesh position={[0, -0.15, 0]}>
    <boxGeometry args={[150, 0.3, 150]} />
    <meshStandardMaterial color="#454545" />
  </mesh>
</RigidBody>

{/* PATIO CENTRAL */}
<mesh position={[0, 0.02, 0]}>
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
