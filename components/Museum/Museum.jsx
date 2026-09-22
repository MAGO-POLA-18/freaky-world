import DpadWing from "./DpadWing";
import { RigidBody } from "@react-three/rapier";

export default function Museum() {
  return (
    <group>
      {/* NORTE */}
      <DpadWing
        position={[0, 0, -85]}
        rotation={[0, 0, 0]}
      />

      {/* SUR */}
      <DpadWing
        position={[0, 0, 85]}
        rotation={[0, Math.PI, 0]}
      />

      {/* ESTE */}
      <DpadWing
        position={[85, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />

      {/* OESTE */}
      <DpadWing
        position={[-85, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* SUELO FÍSICO GENERAL */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, -0.15, 0]}
          receiveShadow
        >
          <boxGeometry args={[220, 0.3, 220]} />

          <meshStandardMaterial
            color="#566154"
            roughness={1}
          />
        </mesh>
      </RigidBody>

      {/* PATIO CENTRAL */}
      <mesh
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[38, 38, 0.2, 64]}
        />

        <meshStandardMaterial
          color="#71806b"
          roughness={1}
        />
      </mesh>

      {/* CENTRO DEL JARDÍN */}
      <mesh
        position={[0, 0.15, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[18, 18, 0.3, 64]}
        />

        <meshStandardMaterial
          color="#4f6049"
          roughness={1}
        />
      </mesh>
    </group>
  );
}
