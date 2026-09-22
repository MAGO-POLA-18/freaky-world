import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  /* =====================================================
     PERFIL LATERAL SUPERIOR

     Profundidad exacta:
     -35  fondo
       0  comienzo pendiente
      18  final pendiente
      35  fachada
  ===================================================== */

  const sideShape = new THREE.Shape();

  // Solapamiento vertical mínimo de 2 cm
  // para eliminar fisuras con la pared inferior.
  sideShape.moveTo(-35, 6.98);
  sideShape.lineTo(-35, 15);

  // Techo alto
  sideShape.lineTo(0, 15);

  // Pendiente
  sideShape.lineTo(18, 7);

  // Base
  sideShape.lineTo(18, 6.98);
  sideShape.lineTo(-35, 6.98);

  const sideExtrudeSettings = {
    depth: 0.4,
    bevelEnabled: false,
  };

  /* =====================================================
     TECHO INCLINADO
  ===================================================== */

  const slopedRoofDepth = 18;
  const slopedRoofDrop = 8;

  const slopedRoofLength = Math.sqrt(
    slopedRoofDepth * slopedRoofDepth +
      slopedRoofDrop * slopedRoofDrop
  );

  const slopedRoofAngle = Math.atan2(
    slopedRoofDrop,
    slopedRoofDepth
  );

  return (
    <group position={position} rotation={rotation}>
      
      {/* =================================================
          SUELO INTERIOR VISUAL

          SIN collider propio.

          El collider del suelo general ya sostiene
          al personaje.

          Lo elevamos solo 6 mm para evitar z-fighting
          con el suelo general.
      ================================================= */}

      <mesh
        position={[0, 0.006, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 70]} />

        <meshStandardMaterial
          color="#555555"
          roughness={1}
        />
      </mesh>

      {/* =================================================
          PARED LATERAL IZQUIERDA

          Z:
          -34.8 → +34.8

          Así no invade las paredes de fondo/fachada.
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-29.8, 3.49, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7.02, 69.6]} />

          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      </RigidBody>

      {/* =================================================
          PARED LATERAL DERECHA
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[29.8, 3.49, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7.02, 69.6]} />

          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      </RigidBody>

      {/* =================================================
          PARED DEL FONDO

          Encaja ENTRE las dos paredes laterales.

          X:
          -29.6 → +29.6
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 7.49, -34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[59.2, 15.02, 0.4]} />

          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
      </RigidBody>

      {/* =================================================
          FACHADA IZQUIERDA

          -29.6 → -10
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-19.8, 3.49, 34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[19.6, 7.02, 0.4]} />

          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </RigidBody>

      {/* =================================================
          FACHADA DERECHA

          +10 → +29.6
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[19.8, 3.49, 34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[19.6, 7.02, 0.4]} />

          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </RigidBody>

      {/* =================================================
          MARCO DE ENTRADA
      ================================================= */}

      <mesh
        position={[-10.6, 3.6, 35.05]}
        castShadow
      >
        <boxGeometry args={[1.2, 7.2, 0.7]} />

        <meshStandardMaterial
          color="#24272b"
          roughness={0.7}
        />
      </mesh>

      <mesh
        position={[10.6, 3.6, 35.05]}
        castShadow
      >
        <boxGeometry args={[1.2, 7.2, 0.7]} />

        <meshStandardMaterial
          color="#24272b"
          roughness={0.7}
        />
      </mesh>

      <mesh
        position={[0, 6.65, 35.05]}
        castShadow
      >
        <boxGeometry args={[22.4, 1.1, 0.7]} />

        <meshStandardMaterial
          color="#24272b"
          roughness={0.7}
        />
      </mesh>

      {/* =================================================
          VIDRIO IZQUIERDO
      ================================================= */}

      <mesh position={[-20, 3.7, 35.08]}>
        <planeGeometry args={[15, 5]} />

        <meshPhysicalMaterial
          color="#6f9bab"
          transparent
          opacity={0.38}
          roughness={0.12}
          metalness={0.05}
          transmission={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[-20, 3.7, 35.12]}>
        <boxGeometry args={[15.6, 5.6, 0.16]} />

        <meshStandardMaterial
          color="#30343a"
          wireframe
        />
      </mesh>

      {/* =================================================
          VIDRIO DERECHO
      ================================================= */}

      <mesh position={[20, 3.7, 35.08]}>
        <planeGeometry args={[15, 5]} />

        <meshPhysicalMaterial
          color="#6f9bab"
          transparent
          opacity={0.38}
          roughness={0.12}
          metalness={0.05}
          transmission={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[20, 3.7, 35.12]}>
        <boxGeometry args={[15.6, 5.6, 0.16]} />

        <meshStandardMaterial
          color="#30343a"
          wireframe
        />
      </mesh>

      {/* =================================================
          CARTEL / NOMBRE DE SALA
      ================================================= */}

      <mesh
        position={[0, 6.2, 35.45]}
        castShadow
      >
        <boxGeometry args={[16, 1.1, 0.22]} />

        <meshStandardMaterial
          color="#17191d"
          roughness={0.55}
        />
      </mesh>

      {/* =================================================
          TERRAZA

          ANTES:
          Z 19 → 35

          AHORA:
          Z 18 → 35

          Por lo tanto se une exactamente al final
          del techo inclinado.
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 7, 26.5]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[59.2, 0.4, 17]} />

          <meshStandardMaterial
            color="#707070"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          BARANDILLA FRONTAL
      ================================================= */}

      <mesh position={[0, 8.15, 34.25]} castShadow>
        <boxGeometry args={[59, 0.15, 0.15]} />

        <meshStandardMaterial color="#303030" />
      </mesh>

      {[-28, -21, -14, -7, 0, 7, 14, 21, 28].map((x) => (
        <mesh
          key={`front-post-${x}`}
          position={[x, 7.6, 34.25]}
          castShadow
        >
          <boxGeometry args={[0.14, 1.1, 0.14]} />

          <meshStandardMaterial color="#303030" />
        </mesh>
      ))}

      {/* =================================================
          BARANDILLAS LATERALES

          Ahora siguen toda la terraza:
          Z 18 → 35
      ================================================= */}

      <mesh position={[-29.25, 8.15, 26.5]} castShadow>
        <boxGeometry args={[0.15, 0.15, 17]} />

        <meshStandardMaterial color="#303030" />
      </mesh>

      <mesh position={[29.25, 8.15, 26.5]} castShadow>
        <boxGeometry args={[0.15, 0.15, 17]} />

        <meshStandardMaterial color="#303030" />
      </mesh>

      {/* =================================================
          PERFIL SUPERIOR IZQUIERDO

          El extrusionado crece 0.4 hacia -X.

          Posición correcta:
          -29.6 → -30
      ================================================= */}

      <mesh
        position={[-29.6, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry
          args={[sideShape, sideExtrudeSettings]}
        />

        <meshStandardMaterial
          color="#cfcfcf"
          roughness={0.9}
        />
      </mesh>

      {/* =================================================
          PERFIL SUPERIOR DERECHO

          Con la misma rotación el extrusionado también
          crece hacia -X.

          Por eso parte de X=30:
          30 → 29.6
      ================================================= */}

      <mesh
        position={[30, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry
          args={[sideShape, sideExtrudeSettings]}
        />

        <meshStandardMaterial
          color="#cfcfcf"
          roughness={0.9}
        />
      </mesh>

      {/* =================================================
          TECHO ALTO

          Z -35 → 0
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 15, -17.5]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[59.2, 0.4, 35]} />

          <meshStandardMaterial
            color="#bcbcbc"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          TECHO INCLINADO

          Z 0 → 18

          Y 15 → 7
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 11, 9]}
          rotation={[slopedRoofAngle, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[59.2, 0.4, slopedRoofLength]}
          />

          <meshStandardMaterial
            color="#bcbcbc"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          ESCALERA IZQUIERDA
      ================================================= */}

      {steps.map((_, i) => {
        const height = ((i + 1) * 6.8) / 14;
        const z = 13 - i * 1.15;

        return (
          <RigidBody
            key={`left-step-${i}`}
            type="fixed"
            colliders="cuboid"
          >
            <mesh
              position={[-14, height / 2, z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[8, height, 1.2]} />

              <meshStandardMaterial color="#888888" />
            </mesh>
          </RigidBody>
        );
      })}

      {/* =================================================
          ESCALERA DERECHA
      ================================================= */}

      {steps.map((_, i) => {
        const height = ((i + 1) * 6.8) / 14;
        const z = 13 - i * 1.15;

        return (
          <RigidBody
            key={`right-step-${i}`}
            type="fixed"
            colliders="cuboid"
          >
            <mesh
              position={[14, height / 2, z]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[8, height, 1.2]} />

              <meshStandardMaterial color="#888888" />
            </mesh>
          </RigidBody>
        );
      })}
    </group>
  );
}
