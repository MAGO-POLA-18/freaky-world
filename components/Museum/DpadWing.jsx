import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export default function DpadWing({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const steps = Array.from({ length: 14 });

  /* =====================================================
     PERFIL LATERAL SUPERIOR
     X del Shape = profundidad del edificio
     Y del Shape = altura
  ===================================================== */

  const sideShape = new THREE.Shape();

  sideShape.moveTo(-35, 7);
  sideShape.lineTo(-35, 15);

  // Parte alta
  sideShape.lineTo(0, 15);

  // Diagonal hacia la terraza
  sideShape.lineTo(18, 7);

  // Cierre inferior
  sideShape.lineTo(-35, 7);

  const sideExtrudeSettings = {
    depth: 0.4,
    bevelEnabled: false,
  };

  return (
    <group position={position} rotation={rotation}>

      {/* =================================================
          SUELO
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[60, 0.4, 70]} />
          <meshStandardMaterial color="#555555" roughness={1} />
        </mesh>
      </RigidBody>

      {/* =================================================
          PAREDES LATERALES INFERIORES
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

          IMPORTANTE:
          Son dos bloques separados.
          Entre X -10 y +10 no existe geometría
          ni collider.
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
      ================================================= */}

      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[0, 7, 27]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[59.2, 0.4, 16]} />
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
      ================================================= */}

      <mesh position={[-29.25, 8.15, 27]} castShadow>
        <boxGeometry args={[0.15, 0.15, 14]} />
        <meshStandardMaterial color="#303030" />
      </mesh>

      <mesh position={[29.25, 8.15, 27]} castShadow>
        <boxGeometry args={[0.15, 0.15, 14]} />
        <meshStandardMaterial color="#303030" />
      </mesh>

      {/* =================================================
          PERFIL SUPERIOR IZQUIERDO

          El ExtrudeGeometry se genera en XY.
          Rotamos para convertir X local en Z.
      ================================================= */}

      <mesh
        position={[-30, 0, 0]}
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

          MISMA rotación.
          No lo espejamos rotando al lado contrario.
          Eso era lo que generaba la aleta.
      ================================================= */}

      <mesh
        position={[29.6, 0, 0]}
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
          TECHO POSTERIOR
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
          ESCALERAS

          Sin cambiar todavía su diseño.
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
