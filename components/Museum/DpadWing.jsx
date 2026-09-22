import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

import WingInterior from "./WingInterior";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const stairSteps = 14;

  const stairWidth = 8;
  const stairHeight = 7.2;
  const stairStepDepth = 1.1;
  const stairStartZ = 0.6;

  const stairRun =
    stairSteps * stairStepDepth;

  const stairRampLength = Math.sqrt(
    stairRun * stairRun +
      stairHeight * stairHeight
  );

  const stairRampAngle = Math.atan2(
    stairHeight,
    stairRun
  );

  /* =====================================================
     PERFIL LATERAL
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

  const roofDepth = 18;
  const roofDrop = 8;

  const roofLength = Math.sqrt(
    roofDepth * roofDepth +
      roofDrop * roofDrop
  );

  const roofAngle = Math.atan2(
    roofDrop,
    roofDepth
  );

  const railColor = "#303030";

  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* =================================================
          INTERIOR
      ================================================= */}

      <WingInterior />

      {/* =================================================
          SUELO VISUAL
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
          PAREDES
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-29.8, 3.49, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7.02, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[29.8, 3.49, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7.02, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      </RigidBody>

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
          MARCO ENTRADA
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
          VIDRIOS
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

      <mesh position={[-20, 3.7, 35.15]}>
        <boxGeometry args={[15.6, 5.6, 0.08]} />

        <meshStandardMaterial
          color="#30343a"
          wireframe
        />
      </mesh>

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

      <mesh position={[20, 3.7, 35.15]}>
        <boxGeometry args={[15.6, 5.6, 0.08]} />

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
          LUMINARIAS VISUALES DE TERRAZA
      ================================================= */}

      {[-22, -11, 0, 11, 22].map((x) => (
        <group
          key={`terrace-lamp-${x}`}
          position={[x, 7, 30]}
        >
          <mesh
            position={[0, 0.75, 0]}
            castShadow
          >
            <cylinderGeometry
              args={[0.055, 0.075, 1.5, 10]}
            />

            <meshStandardMaterial
              color="#202327"
              roughness={0.6}
            />
          </mesh>

          <mesh
            position={[0, 1.52, 0]}
            castShadow
          >
            <cylinderGeometry
              args={[0.18, 0.14, 0.14, 12]}
            />

            <meshStandardMaterial
              color="#202327"
              roughness={0.5}
            />
          </mesh>

          <mesh position={[0, 1.44, 0]}>
            <sphereGeometry
              args={[0.12, 12, 12]}
            />

            <meshStandardMaterial
              color="#ffffff"
              emissive="#fff0d4"
              emissiveIntensity={6}
            />
          </mesh>
        </group>
      ))}

      {/* =================================================
          TERRAZA
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

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 8.15, 34.25]}
          castShadow
        >
          <boxGeometry args={[59, 0.18, 0.18]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>

      {[-28, -21, -14, -7, 0, 7, 14, 21, 28].map(
        (x) => (
          <mesh
            key={`front-post-${x}`}
            position={[x, 7.6, 34.25]}
            castShadow
          >
            <boxGeometry args={[0.14, 1.1, 0.14]} />
            <meshStandardMaterial color={railColor} />
          </mesh>
        )
      )}

      {/* =================================================
          BARANDILLAS LATERALES
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-29.25, 8.15, 26.5]}
          castShadow
        >
          <boxGeometry args={[0.18, 0.18, 17]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[29.25, 8.15, 26.5]}
          castShadow
        >
          <boxGeometry args={[0.18, 0.18, 17]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>

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
          TECHO INCLINADO - TRES PAÑOS
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-23.8, 11, 9]}
          rotation={[roofAngle, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[11.6, 0.4, roofLength]}
          />

          <meshStandardMaterial
            color="#bcbcbc"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 11, 9]}
          rotation={[roofAngle, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[20, 0.4, roofLength]}
          />

          <meshStandardMaterial
            color="#bcbcbc"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[23.8, 11, 9]}
          rotation={[roofAngle, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[11.6, 0.4, roofLength]}
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

      {Array.from({ length: stairSteps }).map(
        (_, i) => {
          const stepHeight =
            ((i + 1) * stairHeight) /
            stairSteps;

          const z =
            stairStartZ +
            i * stairStepDepth +
            stairStepDepth / 2;

          return (
            <mesh
              key={`left-step-${i}`}
              position={[
                -14,
                stepHeight / 2,
                z,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[
                  stairWidth,
                  stepHeight,
                  stairStepDepth,
                ]}
              />

              <meshStandardMaterial
                color="#888888"
              />
            </mesh>
          );
        }
      )}

      {/* =================================================
          ESCALERA DERECHA
      ================================================= */}

      {Array.from({ length: stairSteps }).map(
        (_, i) => {
          const stepHeight =
            ((i + 1) * stairHeight) /
            stairSteps;

          const z =
            stairStartZ +
            i * stairStepDepth +
            stairStepDepth / 2;

          return (
            <mesh
              key={`right-step-${i}`}
              position={[
                14,
                stepHeight / 2,
                z,
              ]}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[
                  stairWidth,
                  stepHeight,
                  stairStepDepth,
                ]}
              />

              <meshStandardMaterial
                color="#888888"
              />
            </mesh>
          );
        }
      )}

      {/* =================================================
          RAMPAS FÍSICAS INVISIBLES
      ================================================= */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        <CuboidCollider
          args={[
            3.8,
            0.08,
            stairRampLength / 2,
          ]}
          position={[-14, 3.55, 8.3]}
          rotation={[-stairRampAngle, 0, 0]}
          friction={1}
        />

        <CuboidCollider
          args={[
            3.8,
            0.08,
            stairRampLength / 2,
          ]}
          position={[14, 3.55, 8.3]}
          rotation={[-stairRampAngle, 0, 0]}
          friction={1}
        />
      </RigidBody>

      {/* =================================================
          DESEMBARCOS
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-14, 7, 17]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[8, 0.4, 2]} />
          <meshStandardMaterial color="#707070" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[14, 7, 17]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[8, 0.4, 2]} />
          <meshStandardMaterial color="#707070" />
        </mesh>
      </RigidBody>

      {/* =================================================
          BARANDILLA INTERIOR
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-23.75, 8.15, 18.1]}
          castShadow
        >
          <boxGeometry args={[10.5, 0.18, 0.18]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 8.15, 18.1]}
          castShadow
        >
          <boxGeometry args={[20, 0.18, 0.18]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[23.75, 8.15, 18.1]}
          castShadow
        >
          <boxGeometry args={[10.5, 0.18, 0.18]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>

      {/* =================================================
          POSTES INTERIORES
      ================================================= */}

      {[-29, -18.5, -9.8, 9.8, 18.5, 29].map(
        (x) => (
          <mesh
            key={`inner-post-${x}`}
            position={[x, 7.6, 18.1]}
            castShadow
          >
            <boxGeometry args={[0.14, 1.1, 0.14]} />
            <meshStandardMaterial color={railColor} />
          </mesh>
        )
      )}

      {/* =================================================
          PASAMANOS
      ================================================= */}

      {[-18.1, -9.9, 9.9, 18.1].map(
        (x) => (
          <mesh
            key={`stair-rail-${x}`}
            position={[x, 4.5, 8.3]}
            rotation={[
              -stairRampAngle,
              0,
              0,
            ]}
            castShadow
          >
            <boxGeometry
              args={[
                0.12,
                0.12,
                stairRampLength,
              ]}
            />

            <meshStandardMaterial
              color={railColor}
            />
          </mesh>
        )
      )}
    </group>
  );
}
