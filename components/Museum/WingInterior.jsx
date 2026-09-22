import * as THREE from "three";

export default function WingInterior() {
  const ceilingLights = [
    [-20, 13.8, -24],
    [0, 13.8, -24],
    [20, 13.8, -24],

    [-20, 13.8, -12],
    [0, 13.8, -12],
    [20, 13.8, -12],
  ];

  const lowerLights = [
    [-22, 6.65, 24],
    [0, 6.65, 24],
    [22, 6.65, 24],
  ];

  return (
    <group>

      {/* =================================================
          SUELO INTERIOR
          Ligeramente elevado sobre el suelo estructural
          para evitar z-fighting.
      ================================================= */}

      <mesh
        position={[0, 0.012, -0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[58.5, 68]} />

        <meshStandardMaterial
          color="#34383d"
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>

      {/* =================================================
          FRANJA CENTRAL DE CIRCULACIÓN

          Marca el eje principal desde la entrada
          hasta el fondo de la sala.
      ================================================= */}

      <mesh
        position={[0, 0.018, -4]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 57]} />

        <meshStandardMaterial
          color="#41464c"
          roughness={0.72}
          metalness={0.03}
        />
      </mesh>

      {/* =================================================
          PARED INTERIOR DEL FONDO

          Revestimiento visual independiente
          de la pared estructural.
      ================================================= */}

      <mesh
        position={[0, 7.3, -34.55]}
        receiveShadow
      >
        <planeGeometry args={[58.6, 14.4]} />

        <meshStandardMaterial
          color="#e3e4e5"
          roughness={0.92}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =================================================
          PARED INTERIOR IZQUIERDA
      ================================================= */}

      <mesh
        position={[-29.55, 3.6, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[68.8, 7]} />

        <meshStandardMaterial
          color="#dadcde"
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =================================================
          PARED INTERIOR DERECHA
      ================================================= */}

      <mesh
        position={[29.55, 3.6, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[68.8, 7]} />

        <meshStandardMaterial
          color="#dadcde"
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* =================================================
          ZÓCALOS LATERALES

          Ayudan a que el suelo y las paredes tengan
          un encuentro visual limpio.
      ================================================= */}

      <mesh
        position={[-29.48, 0.18, 0]}
        castShadow
      >
        <boxGeometry args={[0.12, 0.32, 68]} />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      <mesh
        position={[29.48, 0.18, 0]}
        castShadow
      >
        <boxGeometry args={[0.12, 0.32, 68]} />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      {/* =================================================
          ZÓCALO DEL FONDO
      ================================================= */}

      <mesh
        position={[0, 0.18, -34.45]}
        castShadow
      >
        <boxGeometry args={[58.8, 0.32, 0.12]} />

        <meshStandardMaterial
          color="#202327"
          roughness={0.75}
        />
      </mesh>

      {/* =================================================
          LÍNEAS DE LUZ DEL TECHO ALTO
      ================================================= */}

      {ceilingLights.map(([x, y, z], index) => (
        <group
          key={`ceiling-light-${index}`}
          position={[x, y, z]}
        >
          <mesh>
            <boxGeometry args={[8, 0.08, 0.22]} />

            <meshStandardMaterial
              color="#f2f1ea"
              emissive="#f2f1ea"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {/* =================================================
          ILUMINACIÓN BAJO LA TERRAZA
      ================================================= */}

      {lowerLights.map(([x, y, z], index) => (
        <group
          key={`lower-light-${index}`}
          position={[x, y, z]}
        >
          <mesh>
            <boxGeometry args={[8, 0.08, 0.22]} />

            <meshStandardMaterial
              color="#f1efe7"
              emissive="#f1efe7"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {/* =================================================
          LUZ GENERAL INTERIOR

          Pocas luces reales.
          Las demás tiras son emisivas.
      ================================================= */}

     <pointLight
  position={[0, 10.5, -20]}
  intensity={32}
  distance={42}
  decay={2}
  color="#fff4dd"
/>

<pointLight
  position={[0, 5.5, 22]}
  intensity={24}
  distance={34}
  decay={2}
  color="#e8f2ff"
/>

<pointLight
  position={[-18, 5.5, -5]}
  intensity={16}
  distance={24}
  decay={2}
  color="#eef4ff"
/>

<pointLight
  position={[18, 5.5, -5]}
  intensity={16}
  distance={24}
  decay={2}
  color="#eef4ff"
/>

      {/* =================================================
          PILARES VISUALES CERCA DE LA ENTRADA

          Empiezan a dar lenguaje arquitectónico
          al interior sin ocupar la circulación.
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
          LÍNEA DECORATIVA DE PARED

          Base común para todas las salas.
          Más adelante cada ala tendrá identidad propia.
      ================================================= */}

      <mesh
        position={[0, 4.6, -34.48]}
      >
        <boxGeometry args={[46, 0.08, 0.05]} />

        <meshStandardMaterial
          color="#6f9bab"
          emissive="#36505b"
          emissiveIntensity={1.2}
        />
      </mesh>

    </group>
  );
}
