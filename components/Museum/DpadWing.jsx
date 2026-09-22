import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";
import * as THREE from "three";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  /* =====================================================
     MEDIDAS PRINCIPALES
  ===================================================== */

  const stairWidth = 8;
  const stairSteps = 14;
  const stairStepDepth = 1.1;
  const stairHeight = 7.2;

  const stairStartZ = 1.4;
  const stairRun = stairSteps * stairStepDepth;

  const stairRampLength = Math.sqrt(
    stairRun * stairRun + stairHeight * stairHeight
  );

  const stairRampAngle = Math.atan2(
    stairHeight,
    stairRun
  );

  /* =====================================================
     PERFIL LATERAL SUPERIOR
  ===================================================== */

  const sideShape = new THREE.Shape();

  sideShape.moveTo(-35, 6.98);
  sideShape.lineTo(-35, 15);

  sideShape.lineTo(0, 15);

  sideShape.lineTo(18, 7);

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
          SUELO INTERIOR
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
          PAREDES LATERALES
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
          FACHADA
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

      <mesh position={[-20, 3.7, 35.13]}>
        <boxGeometry args={[15.6, 5.6, 0.12]} />

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

      <mesh position={[20, 3.7, 35.13]}>
        <boxGeometry args={[15.6, 5.6, 0.12]} />

        <meshStandardMaterial
          color="#30343a"
          wireframe
        />
      </mesh>

      {/* =================================================
          CARTEL
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
          Z 18 → 35
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

      {[-28, -21, -14, -7, 0, 7, 14, 21, 28].map(
        (x) => (
          <mesh
            key={`front-post-${x}`}
            position={[x, 7.6, 34.25]}
            castShadow
          >
            <boxGeometry args={[0.14, 1.1, 0.14]} />
            <meshStandardMaterial color="#303030" />
          </mesh>
        )
      )}

      {/* =================================================
          BARANDILLAS LATERALES
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
          PERFILES SUPERIORES
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
          SOLO GEOMETRÍA VISUAL
      ================================================= */}

      {steps.map((_, i) => {
        const topHeight =
          ((i + 1) * stairHeight) / stairSteps;

        const z =
          stairStartZ +
          i * stairStepDepth +
          stairStepDepth / 2;

        return (
          <mesh
            key={`left-step-${i}`}
            position={[
              -14,
              topHeight / 2,
              z,
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                stairWidth,
                topHeight,
                stairStepDepth,
              ]}
            />

            <meshStandardMaterial color="#888888" />
          </mesh>
        );
      })}

      {/* =================================================
          ESCALERA DERECHA
      ================================================= */}

      {steps.map((_, i) => {
        const topHeight =
          ((i + 1) * stairHeight) / stairSteps;

        const z =
          stairStartZ +
          i * stairStepDepth +
          stairStepDepth / 2;

        return (
          <mesh
            key={`right-step-${i}`}
            position={[
              14,
              topHeight / 2,
              z,
            ]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                stairWidth,
                topHeight,
                stairStepDepth,
              ]}
            />

            <meshStandardMaterial color="#888888" />
          </mesh>
        );
      })}

      {/* =================================================
          RAMPAS FÍSICAS INVISIBLES

          El personaje colisiona contra una pendiente
          continua, no contra cada escalón.
      ================================================= */}

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[
            stairWidth / 2,
            0.12,
            stairRampLength / 2,
          ]}
          position={[-14, 3.55, 9.1]}
          rotation={[-stairRampAngle, 0, 0]}
        />

        <CuboidCollider
          args={[
            stairWidth / 2,
            0.12,
            stairRampLength / 2,
          ]}
          position={[14, 3.55, 9.1]}
          rotation={[-stairRampAngle, 0, 0]}
        />
      </RigidBody>

      {/* =================================================
          DESEMBARCOS

          Conectan exactamente las escaleras
          con la terraza.
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-14, 7, 17.4]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[8, 0.4, 1.2]} />

          <meshStandardMaterial
            color="#707070"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[14, 7, 17.4]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[8, 0.4, 1.2]} />

          <meshStandardMaterial
            color="#707070"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          PASAMANOS ESCALERA IZQUIERDA
      ================================================= */}

      <mesh
        position={[-18.1, 4.45, 9.1]}
        rotation={[-stairRampAngle, 0, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.12, 0.12, stairRampLength]}
        />

        <meshStandardMaterial color="#303030" />
      </mesh>

      <mesh
        position={[-9.9, 4.45, 9.1]}
        rotation={[-stairRampAngle, 0, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.12, 0.12, stairRampLength]}
        />

        <meshStandardMaterial color="#303030" />
      </mesh>

      {/* =================================================
          PASAMANOS ESCALERA DERECHA
      ================================================= */}

      <mesh
        position={[9.9, 4.45, 9.1]}
        rotation={[-stairRampAngle, 0, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.12, 0.12, stairRampLength]}
        />

        <meshStandardMaterial color="#303030" />
      </mesh>

      <mesh
        position={[18.1, 4.45, 9.1]}
        rotation={[-stairRampAngle, 0, 0]}
        castShadow
      >
        <boxGeometry
          args={[0.12, 0.12, stairRampLength]}
        />

        <meshStandardMaterial color="#303030" />
      </mesh>

    </group>
  );
}
