import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   RETRO WING

   PROTOTIPO ARQUITECTÓNICO

   Todavía NO agregamos:
   - muebles
   - vitrinas
   - máquinas
   - decoración
   - contenido

   Primero resolvemos circulación y volumen.
========================================================= */

export default function RetroWingInterior() {
  /* =======================================================
     ESCALERA
  ======================================================= */

  const stairSteps = 16;

  const stairHeight = 6.8;

  const stairRun = 15.5;

  const stepDepth =
    stairRun /
    stairSteps;

  const stairWidth = 6.5;

  const stairAngle =
    Math.atan2(
      stairHeight,
      stairRun
    );

  const rampLength =
    Math.sqrt(
      stairRun *
        stairRun +
      stairHeight *
        stairHeight
    );

  return (
    <group>
      {/* ===================================================
          SUELO
      =================================================== */}

      <mesh
        position={[
          0,
          0.018,
          -0.3,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            58.5,
            68,
          ]}
        />

        <meshStandardMaterial
          color="#25292d"
          roughness={0.82}
        />
      </mesh>

      {/* ===================================================
          EJE PRINCIPAL DE ACCESO
      =================================================== */}

      <mesh
        position={[
          0,
          0.028,
          12,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            12,
            44,
          ]}
        />

        <meshStandardMaterial
          color="#41484e"
          roughness={0.72}
        />
      </mesh>

      {/* ===================================================
          GRAN ESPACIO CENTRAL

          Por ahora completamente libre.
      =================================================== */}

      <mesh
        position={[
          0,
          0.035,
          -6,
        ]}
        rotation={[
          -Math.PI / 2,
          0,
          0,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[
            42,
            43,
          ]}
        />

        <meshStandardMaterial
          color="#2d3237"
          roughness={0.76}
        />
      </mesh>

      {/* ===================================================
          MURO LATERAL IZQUIERDO

          Genera una futura zona secundaria.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -22,
            3.35,
            -5,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              6.7,
              29,
            ]}
          />

          <meshStandardMaterial
            color="#dadde0"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          MURO DE ESCALERA DERECHA

          La escalera queda detrás de esta pared.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            21.5,
            3.35,
            -9,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              6.7,
              21,
            ]}
          />

          <meshStandardMaterial
            color="#dadde0"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          PARED PRINCIPAL DEL FONDO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            4.3,
            -33.7,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              50,
              8.6,
              0.5,
            ]}
          />

          <meshStandardMaterial
            color="#171a1e"
            roughness={0.82}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          ESCALERA DERECHA

          BAJA:
          z = 11

          ALTA:
          z ≈ -4
      =================================================== */}

      {Array.from({
        length:
          stairSteps,
      }).map(
        (_, index) => {
          const height =
            ((index + 1) *
              stairHeight) /
            stairSteps;

          const z =
            11 -
            index *
              stepDepth;

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
                  stairWidth,
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
        }
      )}

      {/* ===================================================
          RAMPA FÍSICA INVISIBLE

          El jugador pisa esto,
          no los escalones.

          Así la subida es continua.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            stairWidth /
              2 -
              0.15,

            0.09,

            rampLength /
              2,
          ]}
          position={[
            25,
            stairHeight / 2 +
              0.06,
            3.25,
          ]}
          rotation={[
            stairAngle,
            0,
            0,
          ]}
          friction={1}
        />
      </RigidBody>

      {/* ===================================================
          ENTREPLANTA IZQUIERDA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -15,
            6.85,
            -22,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              20,
              0.35,
              22,
            ]}
          />

          <meshStandardMaterial
            color="#272c31"
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          ENTREPLANTA DERECHA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            15,
            6.85,
            -22,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              20,
              0.35,
              22,
            ]}
          />

          <meshStandardMaterial
            color="#272c31"
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          PUENTE DEL FONDO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            6.85,
            -30,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              12,
              0.35,
              6,
            ]}
          />

          <meshStandardMaterial
            color="#272c31"
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          BARANDILLA IZQUIERDA DEL VACÍO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -5.2,
            7.75,
            -20,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.15,
              1.8,
              18,
            ]}
          />

          <meshStandardMaterial
            color="#111417"
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          BARANDILLA DERECHA DEL VACÍO
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            5.2,
            7.75,
            -20,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.15,
              1.8,
              18,
            ]}
          />

          <meshStandardMaterial
            color="#111417"
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          PASAMANOS
      =================================================== */}

      <mesh
        position={[
          -5.2,
          8.65,
          -20,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.22,
            0.16,
            18,
          ]}
        />

        <meshStandardMaterial
          color="#0d1013"
        />
      </mesh>

      <mesh
        position={[
          5.2,
          8.65,
          -20,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.22,
            0.16,
            18,
          ]}
        />

        <meshStandardMaterial
          color="#0d1013"
        />
      </mesh>

      {/* ===================================================
          PILARES
      =================================================== */}

      {[
        [
          -26,
          3.4,
          28,
        ],
        [
          26,
          3.4,
          28,
        ],
        [
          -26,
          3.4,
          -25,
        ],
        [
          26,
          3.4,
          -25,
        ],
      ].map(
        (
          [
            x,
            y,
            z,
          ],
          index
        ) => (
          <mesh
            key={`retro-column-${index}`}
            position={[
              x,
              y,
              z,
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                0.7,
                6.8,
                0.7,
              ]}
            />

            <meshStandardMaterial
              color="#282d32"
              roughness={0.7}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          ILUMINACIÓN PROVISIONAL
      =================================================== */}

      <pointLight
        position={[
          0,
          10,
          -5,
        ]}
        intensity={150}
        distance={52}
        decay={1.8}
        color="#eff8ff"
      />

      <pointLight
        position={[
          0,
          8,
          23,
        ]}
        intensity={90}
        distance={35}
        decay={1.8}
        color="#fff0dc"
      />
    </group>
  );
}
