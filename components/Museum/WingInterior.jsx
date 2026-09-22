import * as THREE from "three";

export default function WingInterior() {
  const ceilingFixtures = [
    [-18, 13.75, -27],
    [0, 13.75, -27],
    [18, 13.75, -27],

    [-18, 13.75, -16],
    [0, 13.75, -16],
    [18, 13.75, -16],

    [-18, 13.75, -5],
    [0, 13.75, -5],
    [18, 13.75, -5],
  ];

  const lowerFixtures = [
    [-20, 6.68, 23],
    [0, 6.68, 23],
    [20, 6.68, 23],
  ];

  return (
    <group>

      {/* =================================================
          SUELO
      ================================================= */}

      <mesh
        position={[0, 0.012, -0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[58.5, 68]} />

        <meshStandardMaterial
          color="#34383d"
          roughness={0.78}
          metalness={0.04}
        />
      </mesh>

      {/* =================================================
          PASILLO CENTRAL
      ================================================= */}

      <mesh
        position={[0, 0.018, -4]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 57]} />

        <meshStandardMaterial
          color="#464b51"
          roughness={0.68}
        />
      </mesh>

      {/* =================================================
          PARED DEL FONDO
      ================================================= */}

      <mesh
        position={[0, 7.3, -34.55]}
        receiveShadow
      >
        <planeGeometry args={[58.6, 14.4]} />

        <meshStandardMaterial
          color="#e5e7e9"
          roughness={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =================================================
          PARED IZQUIERDA
      ================================================= */}

      <mesh
        position={[-29.55, 3.6, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[68.8, 7]} />

        <meshStandardMaterial
          color="#dde0e2"
          roughness={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =================================================
          PARED DERECHA
      ================================================= */}

      <mesh
        position={[29.55, 3.6, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[68.8, 7]} />

        <meshStandardMaterial
          color="#dde0e2"
          roughness={0.88}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =================================================
          ZÓCALOS
      ================================================= */}

      <mesh position={[-29.48, 0.18, 0]}>
        <boxGeometry args={[0.12, 0.32, 68]} />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      <mesh position={[29.48, 0.18, 0]}>
        <boxGeometry args={[0.12, 0.32, 68]} />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      <mesh position={[0, 0.18, -34.45]}>
        <boxGeometry args={[58.8, 0.32, 0.12]} />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      {/* =================================================
          LUMINARIAS DEL TECHO
      ================================================= */}

      {ceilingFixtures.map(([x, y, z], index) => (
        <group
          key={`ceiling-fixture-${index}`}
          position={[x, y, z]}
        >
          <mesh>
            <boxGeometry args={[9, 0.14, 0.65]} />

            <meshStandardMaterial
              color="#202327"
              roughness={0.45}
            />
          </mesh>

          <mesh position={[0, -0.08, 0]}>
            <boxGeometry args={[8.5, 0.06, 0.45]} />

            <meshStandardMaterial
              color="#ffffff"
              emissive="#fff8e8"
              emissiveIntensity={5}
            />
          </mesh>
        </group>
      ))}

      {/* =================================================
          LUMINARIAS BAJO TERRAZA
      ================================================= */}

      {lowerFixtures.map(([x, y, z], index) => (
        <group
          key={`lower-fixture-${index}`}
          position={[x, y, z]}
        >
          <mesh>
            <boxGeometry args={[9, 0.12, 0.55]} />

            <meshStandardMaterial
              color="#202327"
              roughness={0.45}
            />
          </mesh>

          <mesh position={[0, -0.07, 0]}>
            <boxGeometry args={[8.5, 0.05, 0.38]} />

            <meshStandardMaterial
              color="#ffffff"
              emissive="#eef5ff"
              emissiveIntensity={5}
            />
          </mesh>
        </group>
      ))}

      {/* =================================================
          SOLO DOS LUCES REALES POR INTERIOR
      ================================================= */}

      <pointLight
        position={[0, 10, -18]}
        intensity={185}
        distance={55}
        decay={1.7}
        color="#fff8ea"
      />

      <pointLight
        position={[0, 7, 18]}
        intensity={165}
        distance={45}
        decay={1.7}
        color="#f1f6ff"
      />

      {/* =================================================
          PILARES
      ================================================= */}

      <mesh
        position={[-25.5, 3.4, 29]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.7, 6.8, 0.7]} />

        <meshStandardMaterial
          color="#272b30"
          roughness={0.7}
        />
      </mesh>

      <mesh
        position={[25.5, 3.4, 29]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.7, 6.8, 0.7]} />

        <meshStandardMaterial
          color="#272b30"
          roughness={0.7}
        />
      </mesh>

      {/* =================================================
          LUZ DECORATIVA DEL FONDO
      ================================================= */}

      <mesh
        position={[0, 4.6, -34.48]}
      >
        <boxGeometry args={[46, 0.1, 0.05]} />

        <meshStandardMaterial
          color="#8cc4dc"
          emissive="#4d91ad"
          emissiveIntensity={3}
        />
      </mesh>

    </group>
  );
}
