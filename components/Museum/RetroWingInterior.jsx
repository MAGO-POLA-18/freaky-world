import { RigidBody } from "@react-three/rapier";

/* =========================================================
   RETRO WING INTERIOR

   Primer prototipo arquitectónico real de Freaky World.

   Concepto:
   - entrada central despejada
   - vestíbulo
   - gran sala de doble altura
   - exposiciones laterales
   - una sola escalera lateral
   - entreplanta
   - gran pared temática al fondo
========================================================= */

export default function RetroWingInterior() {
  const stairSteps = 16;
  const stairHeight = 6.8;
  const stairRun = 15.5;
  const stepDepth = stairRun / stairSteps;

  return (
    <group>
      {/* ===================================================
          SUELO GENERAL
      =================================================== */}

      <mesh
        position={[0, 0.018, -0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[58.5, 68]} />

        <meshStandardMaterial
          color="#25292d"
          roughness={0.82}
        />
      </mesh>

      {/* ===================================================
          ENTRADA / EJE PRINCIPAL
      =================================================== */}

      <mesh
        position={[0, 0.028, 17]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 34]} />

        <meshStandardMaterial
          color="#41484e"
          roughness={0.72}
        />
      </mesh>

      {/* ===================================================
          VESTÍBULO
      =================================================== */}

      <mesh
        position={[0, 0.09, 25]}
        receiveShadow
      >
        <boxGeometry args={[30, 0.12, 12]} />

        <meshStandardMaterial
          color="#30363b"
          roughness={0.78}
        />
      </mesh>

      {/* recepción */}

      <mesh
        position={[0, 1.05, 21]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[9, 2.1, 2.6]} />

        <meshStandardMaterial
          color="#15191d"
          roughness={0.58}
        />
      </mesh>

      <mesh position={[0, 2.16, 21]}>
        <boxGeometry args={[7.5, 0.12, 0.12]} />

        <meshStandardMaterial
          color="#63c7d8"
          emissive="#63c7d8"
          emissiveIntensity={2}
        />
      </mesh>

      {/* ===================================================
          SALA PRINCIPAL

          Espacio abierto y modificable según temática.
      =================================================== */}

      <mesh
        position={[0, 0.035, -3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[41, 39]} />

        <meshStandardMaterial
          color="#2d3237"
          roughness={0.76}
        />
      </mesh>

      {/* bases provisionales de exposición */}

      {[
        [-12, 0.45, 5],
        [12, 0.45, 5],

        [-12, 0.45, -9],
        [12, 0.45, -9],
      ].map(([x, y, z], index) => (
        <mesh
          key={`retro-display-${index}`}
          position={[x, y, z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[7, 0.9, 5]} />

          <meshStandardMaterial
            color="#202428"
            roughness={0.66}
          />
        </mesh>
      ))}

      {/* ===================================================
          ZONA LATERAL IZQUIERDA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[-21.5, 3.35, -2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.35, 6.7, 35]} />

          <meshStandardMaterial
            color="#dadde0"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          ZONA LATERAL DERECHA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[21.5, 3.35, -9]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.35, 6.7, 21]} />

          <meshStandardMaterial
            color="#dadde0"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* detalles luminosos */}

      <mesh position={[-21.25, 3.4, 8]}>
        <boxGeometry args={[0.08, 4.5, 8]} />

        <meshStandardMaterial
          color="#63c7d8"
          emissive="#63c7d8"
          emissiveIntensity={1.6}
        />
      </mesh>

      <mesh position={[21.25, 3.4, -5]}>
        <boxGeometry args={[0.08, 4.5, 8]} />

        <meshStandardMaterial
          color="#d36ac8"
          emissive="#d36ac8"
          emissiveIntensity={1.6}
        />
      </mesh>

      {/* ===================================================
          GRAN PARED TEMÁTICA

          Esto cambiará según el evento retro:
          Sega / Nintendo / 80s / 90s / PlayStation...
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[0, 4.3, -33.7]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[50, 8.6, 0.5]} />

          <meshStandardMaterial
            color="#15191d"
            roughness={0.82}
          />
        </mesh>
      </RigidBody>

      <mesh position={[0, 5.6, -33.4]}>
        <boxGeometry args={[36, 0.18, 0.08]} />

        <meshStandardMaterial
          color="#d36ac8"
          emissive="#d36ac8"
          emissiveIntensity={2.4}
        />
      </mesh>

      {/* futura pantalla principal */}

      <mesh position={[0, 2.7, -33.38]}>
        <boxGeometry args={[24, 4.2, 0.08]} />

        <meshStandardMaterial
          color="#101316"
          emissive="#233b45"
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* ===================================================
          ESCALERA

          UNA sola.
          Pegada al lateral derecho.
          El centro queda completamente libre.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <group>
          {Array.from({
            length: stairSteps,
          }).map((_, index) => {
            const height =
              ((index + 1) *
                stairHeight) /
              stairSteps;

            const z =
              11 -
              index * stepDepth;

            return (
              <mesh
                key={`retro-stair-${index}`}
                position={[
                  25,
                  height / 2,
                  z,
                ]}
                castShadow
                receiveShadow
              >
                <boxGeometry
                  args={[
                    6.5,
                    height,
                    stepDepth,
                  ]}
                />

                <meshStandardMaterial
                  color="#30363b"
                  roughness={0.75}
                />
              </mesh>
            );
          })}
        </group>
      </RigidBody>

      {/* ===================================================
          ENTREPLANTA

          El centro queda en doble altura.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[-15, 6.85, -22]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[20, 0.35, 22]} />

          <meshStandardMaterial
            color="#272c31"
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[15, 6.85, -22]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[20, 0.35, 22]} />

          <meshStandardMaterial
            color="#272c31"
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[0, 6.85, -30]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[12, 0.35, 6]} />

          <meshStandardMaterial
            color="#272c31"
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          BARANDILLAS ENTREPLANTA
      =================================================== */}

      {[-6.2, 6.2].map((x) => (
        <group key={`retro-railing-${x}`}>
          <mesh
            position={[
              x,
              7.7,
              -20,
            ]}
            castShadow
          >
            <boxGeometry
              args={[
                0.15,
                1.7,
                18,
              ]}
            />

            <meshStandardMaterial
              color="#111417"
              roughness={0.55}
            />
          </mesh>

          <mesh
            position={[
              x,
              8.55,
              -20,
            ]}
            castShadow
          >
            <boxGeometry
              args={[
                0.22,
                0.15,
                18,
              ]}
            />

            <meshStandardMaterial
              color="#111417"
            />
          </mesh>
        </group>
      ))}

      {/* ===================================================
          PILARES
      =================================================== */}

      {[
        [-26, 3.4, 28],
        [26, 3.4, 28],

        [-26, 3.4, -25],
        [26, 3.4, -25],
      ].map(([x, y, z], index) => (
        <mesh
          key={`retro-column-${index}`}
          position={[x, y, z]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[0.7, 6.8, 0.7]}
          />

          <meshStandardMaterial
            color="#282d32"
            roughness={0.7}
          />
        </mesh>
      ))}

      {/* ===================================================
          LUCES PROVISIONALES

          Luego se conectarán al día/noche.
      =================================================== */}

      <pointLight
        position={[0, 10, -5]}
        intensity={150}
        distance={52}
        decay={1.8}
        color="#eff8ff"
      />

      <pointLight
        position={[0, 8, 23]}
        intensity={110}
        distance={35}
        decay={1.8}
        color="#fff0dc"
      />
    </group>
  );
}
