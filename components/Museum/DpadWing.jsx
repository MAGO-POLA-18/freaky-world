import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  /* =============================================
     PERFIL SUPERIOR DE LOS LATERALES

     -Z = exterior
     +Z = patio
  ============================================= */

  const sideShape = new THREE.Shape();

  sideShape.moveTo(-35, 7);

  // Fondo alto
  sideShape.lineTo(-35, 15);

  // Techo horizontal
  sideShape.lineTo(5, 15);

  // Diagonal descendente hacia el patio
  sideShape.lineTo(21, 8);

  // Borde sobre la terraza
  sideShape.lineTo(35, 8);

  // Baja hasta la terraza
  sideShape.lineTo(35, 7);

  // Cierra el perfil
  sideShape.lineTo(-35, 7);

  const sideExtrudeSettings = {
    depth: 0.4,
    bevelEnabled: false,
  };

  return (
    <group position={position} rotation={rotation}>
      <RigidBody type="fixed" colliders="cuboid">

        {/* =============================================
            SUELO
        ============================================= */}

        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial
            color="#555555"
            roughness={1}
          />
        </mesh>

        {/* =============================================
            PLANTA BAJA - LATERALES
        ============================================= */}

        <mesh
          position={[-29.8, 3.5, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        <mesh
          position={[29.8, 3.5, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>

        {/* =============================================
            FONDO EXTERIOR
        ============================================= */}

        <mesh
          position={[0, 7, -34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>

        {/* =============================================
            FACHADA HACIA EL PATIO (+Z)
            GRAN ENTRADA CENTRAL
        ============================================= */}

        <mesh
          position={[-20, 3.5, 34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        <mesh
          position={[20, 3.5, 34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* =============================================
            TERRAZA HACIA EL PATIO
            Z +21 → +35
        ============================================= */}

        <mesh
          position={[0, 7, 28]}
          receiveShadow
        >
          <boxGeometry args={[59.2, 0.4, 14]} />
          <meshStandardMaterial
            color="#777777"
            roughness={0.9}
          />
        </mesh>

        {/* =============================================
            BARANDILLA FRONTAL
        ============================================= */}

        <mesh
          position={[0, 7.7, 34.4]}
          castShadow
        >
          <boxGeometry args={[59, 1.4, 0.22]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        {/* =============================================
            BARANDILLAS LATERALES TERRAZA
        ============================================= */}

        <mesh
          position={[-29.3, 7.7, 28]}
          castShadow
        >
          <boxGeometry args={[0.22, 1.4, 13]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        <mesh
          position={[29.3, 7.7, 28]}
          castShadow
        >
          <boxGeometry args={[0.22, 1.4, 13]} />
          <meshStandardMaterial color="#454545" />
        </mesh>

        {/* =============================================
            PERFIL SUPERIOR IZQUIERDO
        ============================================= */}

        <mesh
          position={[-30, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
          receiveShadow
        >
          <extrudeGeometry
            args={[
              sideShape,
              sideExtrudeSettings,
            ]}
          />

          <meshStandardMaterial
            color="#cfcfcf"
            roughness={0.9}
          />
        </mesh>

        {/* =============================================
            PERFIL SUPERIOR DERECHO
        ============================================= */}

        <mesh
          position={[30, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          castShadow
          receiveShadow
        >
          <extrudeGeometry
            args={[
              sideShape,
              sideExtrudeSettings,
            ]}
          />

          <meshStandardMaterial
            color="#cfcfcf"
            roughness={0.9}
          />
        </mesh>

        {/* =============================================
            TECHO ALTO

            Termina en Z +5.
            La terraza queda abierta al cielo.
        ============================================= */}

        <mesh
          position={[0, 15, -15]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[59.6, 0.4, 40]} />
          <meshStandardMaterial
            color="#bcbcbc"
            roughness={0.9}
          />
        </mesh>

        {/* =============================================
            ESCALERA IZQUIERDA
        ============================================= */}

        {steps.map((_, i) => {
          const height =
            ((i + 1) * 6.8) / 14;

          const z =
            13 - i * 1.15;

          return (
            <mesh
              key={`left-${i}`}
              position={[
                -14,
                height / 2,
                z,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[8, height, 1.2]}
              />

              <meshStandardMaterial
                color="#888888"
              />
            </mesh>
          );
        })}

        {/* =============================================
            ESCALERA DERECHA
        ============================================= */}

        {steps.map((_, i) => {
          const height =
            ((i + 1) * 6.8) / 14;

          const z =
            13 - i * 1.15;

          return (
            <mesh
              key={`right-${i}`}
              position={[
                14,
                height / 2,
                z,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[8, height, 1.2]}
              />

              <meshStandardMaterial
                color="#888888"
              />
            </mesh>
          );
        })}

      </RigidBody>
    </group>
  );
}
