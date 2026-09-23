import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

/* =========================================================
   SALA RETRO
   ARQUITECTURA BASE

   RECORRIDO:

   ENTRADA
      ↓
   VESTÍBULO
      ↓
   GRAN NAVE
      ↓
   ESCALERA DERECHA
      ↓
   GALERÍA DERECHA
      ↓
   PUENTE TRASERO
      ↓
   GALERÍA IZQUIERDA
      ↓
   PASO SUPERIOR
      ↓
   TERRAZA

   Todavía NO agregamos:
   - máquinas
   - vitrinas
   - decoración
   - pantallas
   - temática semanal
========================================================= */

export default function RetroWingInterior() {
  /* =======================================================
     COLORES
  ======================================================= */

  const floorColor =
    "#24292d";

  const mainFloorColor =
    "#2d3338";

  const wallColor =
    "#d8dcdf";

  const darkWallColor =
    "#181c20";

  const upperFloorColor =
    "#292f34";

  const railColor =
    "#101316";

  const stairColor =
    "#32383d";

  /* =======================================================
     ESCALERA PRINCIPAL
  ======================================================= */

  const stairSteps = 16;

  const stairHeight = 6.8;

  const stairRun = 15.5;

  const stairWidth = 6.5;

  const stepDepth =
    stairRun /
    stairSteps;

  const stairStartZ = 11;

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
          SUELO GENERAL
      =================================================== */}

      <mesh
        position={[
          0,
          0.018,
          0,
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
          color={
            floorColor
          }
          roughness={0.84}
        />
      </mesh>

      {/* ===================================================
          VESTÍBULO DE ENTRADA

          La terraza funciona como techo
          de este primer espacio.

          Se entra por la fachada y se
          atraviesa un pasillo corto antes
          de llegar a la gran nave.
      =================================================== */}

      <mesh
        position={[
          0,
          0.035,
          26,
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
            17,
            17,
          ]}
        />

        <meshStandardMaterial
          color="#3c4349"
          roughness={0.72}
        />
      </mesh>

      {/* MURO IZQUIERDO VESTÍBULO */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -9,
            2.6,
            26,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              15,
            ]}
          />

          <meshStandardMaterial
            color={
              darkWallColor
            }
            roughness={0.84}
          />
        </mesh>
      </RigidBody>

      {/* MURO DERECHO VESTÍBULO */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            9,
            2.6,
            26,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              15,
            ]}
          />

          <meshStandardMaterial
            color={
              darkWallColor
            }
            roughness={0.84}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          SEGUNDO MARCO DE ENTRADA

          Marca el momento en que termina
          el vestíbulo y aparece la nave.
      =================================================== */}

      <mesh
        position={[
          -9,
          3.5,
          18.4,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.7,
            7,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#111417"
          roughness={0.75}
        />
      </mesh>

      <mesh
        position={[
          9,
          3.5,
          18.4,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            0.7,
            7,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#111417"
          roughness={0.75}
        />
      </mesh>

      <mesh
        position={[
          0,
          6.65,
          18.4,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            18.7,
            0.7,
            0.7,
          ]}
        />

        <meshStandardMaterial
          color="#111417"
          roughness={0.75}
        />
      </mesh>

      {/* ===================================================
          GRAN NAVE CENTRAL

          Este será el espacio que después
          cambia según la temática Retro.

          Sega
          Nintendo
          80s
          90s
          Arcade
          PlayStation
          etc.
      =================================================== */}

      <mesh
        position={[
          0,
          0.038,
          -5,
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
            43,
            45,
          ]}
        />

        <meshStandardMaterial
          color={
            mainFloorColor
          }
          roughness={0.77}
        />
      </mesh>

      {/* ===================================================
          PARED DE FONDO

          Gran superficie libre.
          Más adelante puede alojar contenido
          temático sin cambiar arquitectura.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            5,
            -33.7,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              52,
              10,
              0.5,
            ]}
          />

          <meshStandardMaterial
            color={
              darkWallColor
            }
            roughness={0.86}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          MURO BAJO IZQUIERDO

          Delimita arquitectura inferior
          sin cerrar visualmente la nave.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -23.2,
            2.6,
            -5,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              30,
            ]}
          />

          <meshStandardMaterial
            color={
              wallColor
            }
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          MURO DE ESCALERA

          Queda debajo de la galería.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            21,
            2.6,
            -8,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              0.35,
              5.2,
              19,
            ]}
          />

          <meshStandardMaterial
            color={
              wallColor
            }
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          ESCALERA DERECHA

          Empieza delante.

          Sube hacia el fondo.

          Arriba conecta directamente
          con un descanso real.
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
            stairStartZ -
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
                color={
                  stairColor
                }
                roughness={0.76}
              />
            </mesh>
          );
        }
      )}

      {/* ===================================================
          RAMPA INVISIBLE

          El personaje realmente camina
          por esta rampa.
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
            stairHeight /
              2 +
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
          DESCANSO SUPERIOR

          CORRECCIÓN IMPORTANTE:

          Ahora la escalera termina
          físicamente sobre una plataforma.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            25,
            6.85,
            -6.5,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              7.5,
              0.35,
              6,
            ]}
          />

          <meshStandardMaterial
            color={
              upperFloorColor
            }
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          GALERÍA DERECHA

          Primera sección del recorrido
          superior.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            18.5,
            6.85,
            -19,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              13,
              0.35,
              28,
            ]}
          />

          <meshStandardMaterial
            color={
              upperFloorColor
            }
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          PUENTE TRASERO

          Une ambas galerías.

          Acá se completa la base de la U.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            6.85,
            -29,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              38,
              0.35,
              8,
            ]}
          />

          <meshStandardMaterial
            color={
              upperFloorColor
            }
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          GALERÍA IZQUIERDA

          Regresa desde el fondo hacia
          la parte delantera.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -18.5,
            6.85,
            -8,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              13,
              0.35,
              42,
            ]}
          />

          <meshStandardMaterial
            color={
              upperFloorColor
            }
            roughness={0.78}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          SALIDA SUPERIOR HACIA TERRAZA

          Este corredor coincide con uno
          de los antiguos huecos del techo.

          Ahora ese hueco tiene una función
          arquitectónica real.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -14,
            6.95,
            15.5,
          ]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              7.5,
              0.3,
              7,
            ]}
          />

          <meshStandardMaterial
            color="#30363b"
            roughness={0.76}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          PEQUEÑA RAMPA DE TRANSICIÓN

          Compensa la diferencia mínima
          entre entreplanta y terraza.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            3.55,
            0.1,
            3.6,
          ]}
          position={[
            -14,
            7.03,
            16.2,
          ]}
          rotation={[
            -0.025,
            0,
            0,
          ]}
          friction={1}
        />
      </RigidBody>

      {/* ===================================================
          BARANDILLA INTERIOR
          GALERÍA DERECHA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            11.85,
            7.65,
            -18,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.18,
              1.6,
              26,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          BARANDILLA INTERIOR
          GALERÍA IZQUIERDA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -11.85,
            7.65,
            -7,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.18,
              1.6,
              39,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          BARANDILLA DEL PUENTE

          Solo en el borde que mira
          hacia la nave.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            0,
            7.65,
            -24.9,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              23.5,
              1.6,
              0.18,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          BARANDILLAS SALIDA A TERRAZA
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -17.7,
            7.65,
            15.5,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.16,
              1.5,
              7,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[
            -10.3,
            7.65,
            15.5,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              0.16,
              1.5,
              7,
            ]}
          />

          <meshStandardMaterial
            color={
              railColor
            }
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          PILARES ESTRUCTURALES

          Todavía simples.
      =================================================== */}

      {[
        [
          -26,
          3.4,
          27,
        ],

        [
          26,
          3.4,
          27,
        ],

        [
          -26,
          3.4,
          -26,
        ],

        [
          26,
          3.4,
          -26,
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
              color="#282e33"
              roughness={0.74}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          ILUMINACIÓN PROVISIONAL

          Sigue siendo temporal.

          Más adelante se conectará
          al sistema día/noche.
      =================================================== */}

      <pointLight
        position={[
          0,
          11,
          -7,
        ]}
        intensity={135}
        distance={48}
        decay={1.8}
        color="#edf6ff"
      />

      <pointLight
        position={[
          0,
          6,
          25,
        ]}
        intensity={65}
        distance={28}
        decay={1.8}
        color="#fff0dc"
      />
    </group>
  );
}
