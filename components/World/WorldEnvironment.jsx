"use client";

import { RigidBody } from "@react-three/rapier";

import Museum from "../Museum/Museum";

/* =========================================================
   WORLD ENVIRONMENT

   Freaky World

   Estructura actual:

   - terreno general
   - gran plataforma exterior en forma de cruceta
   - zonas de agua en las esquinas
   - plaza central en forma de cruz
   - cuatro caminos
   - jardín
   - iluminación
   - farolas
   - cuatro edificios actuales

========================================================= */

export default function WorldEnvironment() {
  /* =======================================================
     FAROLAS

     Distribuidas alrededor de la plaza y caminos.
  ======================================================= */

  const lampPositions = [
    // Centro
    [14, 0, 14],
    [-14, 0, 14],
    [14, 0, -14],
    [-14, 0, -14],

    // Norte
    [-8, 0, -35],
    [8, 0, -35],
    [-8, 0, -58],
    [8, 0, -58],

    // Sur
    [-8, 0, 35],
    [8, 0, 35],
    [-8, 0, 58],
    [8, 0, 58],

    // Este
    [35, 0, -8],
    [35, 0, 8],
    [58, 0, -8],
    [58, 0, 8],

    // Oeste
    [-35, 0, -8],
    [-35, 0, 8],
    [-58, 0, -8],
    [-58, 0, 8],
  ];

  return (
    <group>
      {/* ===================================================
          TERRENO GENERAL

          Sigue existiendo como base inferior del mundo.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <mesh
          position={[0, -0.3, 0]}
          receiveShadow
        >
          <boxGeometry
            args={[280, 0.5, 280]}
          />

          <meshStandardMaterial
            color="#3f493e"
            roughness={1}
          />
        </mesh>
      </RigidBody>

      {/* ===================================================
          AGUA EXTERIOR

          Los cuatro grandes huecos diagonales ayudan a
          dibujar visualmente la gran cruceta.

                     NORTE

               agua       agua

          OESTE     CRUZ      ESTE

               agua       agua

                      SUR
      =================================================== */}

      {[
        [-88, -88],
        [88, -88],
        [-88, 88],
        [88, 88],
      ].map(([x, z], index) => (
        <mesh
          key={`water-${index}`}
          position={[x, -0.01, z]}
          receiveShadow
        >
          <boxGeometry
            args={[72, 0.08, 72]}
          />

          <meshStandardMaterial
            color="#315d65"
            roughness={0.28}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* ===================================================
          BASE OSCURA DE LA GRAN CRUZ

          Esta capa sobresale ligeramente por debajo de la
          zona verde y funciona como borde / desnivel.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <group>
          {/* brazo vertical */}

          <mesh
            position={[0, 0.01, 0]}
            receiveShadow
          >
            <boxGeometry
              args={[94, 0.32, 244]}
            />

            <meshStandardMaterial
              color="#596253"
              roughness={1}
            />
          </mesh>

          {/* brazo horizontal */}

          <mesh
            position={[0, 0.01, 0]}
            receiveShadow
          >
            <boxGeometry
              args={[244, 0.32, 94]}
            />

            <meshStandardMaterial
              color="#596253"
              roughness={1}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* ===================================================
          GRAN CRUZ VERDE

          Esta es la gran base paisajística.

          Los cuatro edificios actuales quedan alojados
          encima de sus cuatro brazos.
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders="cuboid"
      >
        <group>
          {/* brazo norte-sur */}

          <mesh
            position={[0, 0.18, 0]}
            receiveShadow
          >
            <boxGeometry
              args={[88, 0.18, 238]}
            />

            <meshStandardMaterial
              color="#63745b"
              roughness={1}
            />
          </mesh>

          {/* brazo este-oeste */}

          <mesh
            position={[0, 0.18, 0]}
            receiveShadow
          >
            <boxGeometry
              args={[238, 0.18, 88]}
            />

            <meshStandardMaterial
              color="#63745b"
              roughness={1}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* ===================================================
          FRANJAS DE VEGETACIÓN

          Marcan los bordes interiores de la gran cruz.
      =================================================== */}

      {[
        // Norte
        [-32, 0.3, -76, 12, 0.12, 96],
        [32, 0.3, -76, 12, 0.12, 96],

        // Sur
        [-32, 0.3, 76, 12, 0.12, 96],
        [32, 0.3, 76, 12, 0.12, 96],

        // Este
        [76, 0.3, -32, 96, 0.12, 12],
        [76, 0.3, 32, 96, 0.12, 12],

        // Oeste
        [-76, 0.3, -32, 96, 0.12, 12],
        [-76, 0.3, 32, 96, 0.12, 12],
      ].map(
        (
          [
            x,
            y,
            z,
            width,
            height,
            depth,
          ],
          index
        ) => (
          <mesh
            key={`garden-strip-${index}`}
            position={[x, y, z]}
            receiveShadow
          >
            <boxGeometry
              args={[
                width,
                height,
                depth,
              ]}
            />

            <meshStandardMaterial
              color="#43583e"
              roughness={1}
            />
          </mesh>
        )
      )}

      {/* ===================================================
          CAMINOS PRINCIPALES

          Cuatro caminos totalmente rectos.

          No forman un círculo:
          forman una cruceta.
      =================================================== */}

      {/* Camino norte */}

      <mesh
        position={[0, 0.36, -52]}
        receiveShadow
      >
        <boxGeometry
          args={[12, 0.09, 78]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* Camino sur */}

      <mesh
        position={[0, 0.36, 52]}
        receiveShadow
      >
        <boxGeometry
          args={[12, 0.09, 78]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* Camino este */}

      <mesh
        position={[52, 0.36, 0]}
        receiveShadow
      >
        <boxGeometry
          args={[78, 0.09, 12]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* Camino oeste */}

      <mesh
        position={[-52, 0.36, 0]}
        receiveShadow
      >
        <boxGeometry
          args={[78, 0.09, 12]}
        />

        <meshStandardMaterial
          color="#b9b09d"
          roughness={0.95}
        />
      </mesh>

      {/* ===================================================
          PLAZA CENTRAL

          Ahora también tiene forma de cruz.

          Es claramente más ancha que los caminos.
      =================================================== */}

      <group position={[0, 0.4, 0]}>
        {/* vertical */}

        <mesh receiveShadow>
          <boxGeometry
            args={[18, 0.12, 46]}
          />

          <meshStandardMaterial
            color="#c7bfad"
            roughness={0.9}
          />
        </mesh>

        {/* horizontal */}

        <mesh receiveShadow>
          <boxGeometry
            args={[46, 0.12, 18]}
          />

          <meshStandardMaterial
            color="#c7bfad"
            roughness={0.9}
          />
        </mesh>
      </group>

      {/* ===================================================
          JARDÍN CENTRAL

          Pequeño núcleo verde.

          También utiliza una geometría cuadrada/cruzada,
          no circular.
      =================================================== */}

      <group position={[0, 0.49, 0]}>
        <mesh receiveShadow>
          <boxGeometry
            args={[8, 0.12, 18]}
          />

          <meshStandardMaterial
            color="#496143"
            roughness={1}
          />
        </mesh>

        <mesh receiveShadow>
          <boxGeometry
            args={[18, 0.12, 8]}
          />

          <meshStandardMaterial
            color="#496143"
            roughness={1}
          />
        </mesh>
      </group>

      {/* ===================================================
          CENTRO DE LA PLAZA

          Punto visual central.
      =================================================== */}

      <mesh
        position={[0, 0.59, 0]}
        receiveShadow
      >
        <boxGeometry
          args={[5, 0.16, 5]}
        />

        <meshStandardMaterial
          color="#354832"
          roughness={1}
        />
      </mesh>

      {/* ===================================================
          FAROLAS
      =================================================== */}

      {lampPositions.map(
        ([x, y, z], index) => (
          <group
            key={`park-lamp-${index}`}
            position={[x, y + 0.45, z]}
          >
            {/* poste */}

            <mesh
              position={[0, 1.65, 0]}
              castShadow
            >
              <cylinderGeometry
                args={[
                  0.09,
                  0.13,
                  3.3,
                  12,
                ]}
              />

              <meshStandardMaterial
                color="#181b1e"
                roughness={0.65}
              />
            </mesh>

            {/* tapa */}

            <mesh
              position={[0, 3.35, 0]}
              castShadow
            >
              <cylinderGeometry
                args={[
                  0.32,
                  0.24,
                  0.18,
                  16,
                ]}
              />

              <meshStandardMaterial
                color="#202327"
                roughness={0.5}
              />
            </mesh>

            {/* luz */}

            <mesh
              position={[0, 3.2, 0]}
            >
              <sphereGeometry
                args={[
                  0.21,
                  16,
                  16,
                ]}
              />

              <meshStandardMaterial
                color="#fff6df"
                emissive="#ffe3ad"
                emissiveIntensity={6}
              />
            </mesh>
          </group>
        )
      )}

      {/* ===================================================
          ILUMINACIÓN GENERAL DEL PATIO
      =================================================== */}

      <pointLight
        position={[0, 18, 0]}
        intensity={230}
        distance={135}
        decay={2}
        color="#fff1d8"
      />

      {/* ===================================================
          ILUMINACIÓN DE LOS CUATRO ACCESOS
      =================================================== */}

      <pointLight
        position={[0, 8, -55]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[0, 8, 55]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[55, 8, 0]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      <pointLight
        position={[-55, 8, 0]}
        intensity={160}
        distance={52}
        decay={2}
        color="#f3f7ff"
      />

      {/* ===================================================
          EDIFICIOS

          IMPORTANTE:
          NO CAMBIAMOS NADA.

          Siguen siendo las cuatro crucetas actuales.
      =================================================== */}

      <Museum />
    </group>
  );
}
