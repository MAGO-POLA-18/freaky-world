import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  /* =====================================================
     PERFIL SUPERIOR LATERAL
     -Z = exterior
     +Z = patio
  ===================================================== */

  const sideShape = new THREE.Shape();

  sideShape.moveTo(-35, 7);
  sideShape.lineTo(-35, 15);

  // Parte alta horizontal
  sideShape.lineTo(0, 15);

  // Diagonal más visible hacia la terraza
  sideShape.lineTo(18, 7);

  // Base del perfil
  sideShape.lineTo(-35, 7);

  const sideExtrudeSettings = {
    depth: 0.4,
    bevelEnabled: false,
  };

  return (
    <group position={position} rotation={rotation}>

      {/* =================================================
          SUELO INTERIOR
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial
            color="#555555"
            roughness={1}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          PARED IZQUIERDA PLANTA BAJA
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-29.8, 3.5, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      </RigidBody>

      {/* =================================================
          PARED DERECHA PLANTA BAJA
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[29.8, 3.5, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.4, 7, 70]} />
          <meshStandardMaterial color="#d8d8d8" />
        </mesh>
      </RigidBody>

      {/* =================================================
          PARED DEL FONDO
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 7, -34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[60, 14, 0.4]} />
          <meshStandardMaterial color="#d0d0d0" />
        </mesh>
      </RigidBody>

      {/* =================================================
          FACHADA HACIA EL PATIO

          Dos paredes independientes.
          El centro queda REALMENTE abierto.
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-20, 3.5, 34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[20, 3.5, 34.8]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[20, 7, 0.4]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>
      </RigidBody>

      {/* =================================================
          TERRAZA
          Abierta hacia el patio
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 7, 27]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[59.2, 0.4, 16]} />
          <meshStandardMaterial
            color="#707070"
            roughness={0.9}
          />
        </mesh>
      </RigidBody>

      {/* =================================================
          BARANDILLA DE TERRAZA

          Pasamanos fino
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 8.15, 34.25]}
          castShadow
        >
          <boxGeometry args={[59, 0.18, 0.18]} />
          <meshStandardMaterial color="#303030" />
        </mesh>
      </RigidBody>

      {/* POSTES FRONTALES */}

      {[-28, -21, -14, -7, 0, 7, 14, 21, 28].map(
        (x) => (
          <RigidBody
            key={`front-post-${x}`}
            type="fixed"
            colliders="cuboid"
          >
            <mesh
              position={[x, 7.6, 34.25]}
              castShadow
            >
              <boxGeometry args={[0.16, 1.1, 0.16]} />
              <meshStandardMaterial color="#303030" />
            </mesh>
          </RigidBody>
        )
      )}

      {/* BARANDILLA LATERAL IZQUIERDA */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[-29.25, 8.15, 27]}
          castShadow
        >
          <boxGeometry args={[0.18, 0.18, 14]} />
          <meshStandardMaterial color="#303030" />
        </mesh>
      </RigidBody>

      {/* BARANDILLA LATERAL DERECHA */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[29.25, 8.15, 27]}
          castShadow
        >
          <boxGeometry args={[0.18, 0.18, 14]} />
          <meshStandardMaterial color="#303030" />
        </mesh>
      </RigidBody>

      {/* =================================================
          PERFIL SUPERIOR IZQUIERDO

          Posición ajustada para quedar sobre la pared
          inferior y no flotando por fuera.
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
      ================================================= */}

      <mesh
        position={[29.6, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
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
          TECHO POSTERIOR

          Termina antes de la diagonal.
          No invade la terraza.
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
          ESCALERA IZQUIERDA
      ================================================= */}

      {steps.map((_, i) => {
        const height =
          ((i + 1) * 6.8) / 14;

        const z =
          13 - i * 1.15;

        return (
          <RigidBody
            key={`left-step-${i}`}
            type="fixed"
            colliders="cuboid"
          >
            <mesh
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
              <meshStandardMaterial color="#888888" />
            </mesh>
          </RigidBody>
        );
      })}

      {/* =================================================
          ESCALERA DERECHA
      ================================================= */}

      {steps.map((_, i) => {
        const height =
          ((i + 1) * 6.8) / 14;

        const z =
          13 - i * 1.15;

        return (
          <RigidBody
            key={`right-step-${i}`}
            type="fixed"
            colliders="cuboid"
          >
            <mesh
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
              <meshStandardMaterial color="#888888" />
            </mesh>
          </RigidBody>
        );
      })}

    </group>
  );
}
