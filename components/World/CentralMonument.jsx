"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function CentralMonument({
  position = [0, 0, 0],
}) {
  const dpadRef = useRef(null);
  const ringARef = useRef(null);
  const ringBRef = useRef(null);
  const ringCRef = useRef(null);

  useFrame((state, delta) => {
    if (dpadRef.current) {
      dpadRef.current.rotation.y += delta * 0.34;
    }

    if (ringARef.current) {
      ringARef.current.rotation.y += delta * 0.22;
      ringARef.current.rotation.z += delta * 0.08;
    }

    if (ringBRef.current) {
      ringBRef.current.rotation.y -= delta * 0.18;
      ringBRef.current.rotation.x += delta * 0.06;
    }

    if (ringCRef.current) {
      ringCRef.current.rotation.y += delta * 0.12;
    }
  });

  const glow = "#a9ddff";

  return (
    <group position={position}>
      {/* ===================================================
          PLATAFORMA EXTERIOR
      =================================================== */}

      <mesh
        position={[0, 0.12, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[10.2, 10.2, 0.24, 64]}
        />

        <meshStandardMaterial
          color="#15191d"
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      {/* ===================================================
          SEGUNDO NIVEL
      =================================================== */}

      <mesh
        position={[0, 0.28, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[8.6, 8.6, 0.18, 64]}
        />

        <meshStandardMaterial
          color="#22282e"
          roughness={0.78}
          metalness={0.1}
        />
      </mesh>

      {/* ===================================================
          CENTRO DE PLATAFORMA
      =================================================== */}

      <mesh
        position={[0, 0.42, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[6.9, 6.9, 0.16, 64]}
        />

        <meshStandardMaterial
          color="#313a42"
          roughness={0.72}
          metalness={0.12}
        />
      </mesh>

      {/* ===================================================
          ARO LUMINOSO DE LA PLATAFORMA
      =================================================== */}

      <mesh
        position={[0, 0.515, 0]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[
            5.55,
            0.055,
            10,
            96,
          ]}
        />

        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>

      {/* ===================================================
          CRUCETA SUSPENDIDA
      =================================================== */}

      <group
        ref={dpadRef}
        position={[0, 4.3, 0]}
        rotation={[
          0.12,
          0,
          Math.PI / 4,
        ]}
      >
        {/* ARRIBA */}

        <mesh
          position={[0, 2.35, 0]}
          castShadow
        >
          <boxGeometry
            args={[
              3.25,
              3.25,
              1.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.46}
            metalness={0.12}
          />
        </mesh>

        {/* ABAJO */}

        <mesh
          position={[0, -2.35, 0]}
          castShadow
        >
          <boxGeometry
            args={[
              3.25,
              3.25,
              1.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.46}
            metalness={0.12}
          />
        </mesh>

        {/* IZQUIERDA */}

        <mesh
          position={[-2.35, 0, 0]}
          castShadow
        >
          <boxGeometry
            args={[
              3.25,
              3.25,
              1.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.46}
            metalness={0.12}
          />
        </mesh>

        {/* DERECHA */}

        <mesh
          position={[2.35, 0, 0]}
          castShadow
        >
          <boxGeometry
            args={[
              3.25,
              3.25,
              1.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.46}
            metalness={0.12}
          />
        </mesh>
      </group>

      {/* ===================================================
          AROS ORBITALES
          NO HAY PELOTA CENTRAL
      =================================================== */}

      <group
        position={[0, 4.3, 0]}
      >
        {/* ARO 1 */}

        <mesh
          ref={ringARef}
          rotation={[
            Math.PI / 2.8,
            0.1,
            0.25,
          ]}
        >
          <torusGeometry
            args={[
              5.7,
              0.045,
              8,
              96,
            ]}
          />

          <meshStandardMaterial
            color={glow}
            emissive={glow}
            emissiveIntensity={1.65}
            transparent
            opacity={0.72}
            toneMapped={false}
          />
        </mesh>

        {/* ARO 2 */}

        <mesh
          ref={ringBRef}
          rotation={[
            0.35,
            0.25,
            Math.PI / 2.45,
          ]}
        >
          <torusGeometry
            args={[
              5.2,
              0.04,
              8,
              96,
            ]}
          />

          <meshStandardMaterial
            color="#d8f1ff"
            emissive="#d8f1ff"
            emissiveIntensity={1.4}
            transparent
            opacity={0.5}
            toneMapped={false}
          />
        </mesh>

        {/* ARO 3 */}

        <mesh
          ref={ringCRef}
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        >
          <torusGeometry
            args={[
              6.15,
              0.035,
              8,
              96,
            ]}
          />

          <meshStandardMaterial
            color="#7fc7ff"
            emissive="#7fc7ff"
            emissiveIntensity={1.3}
            transparent
            opacity={0.38}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ===================================================
          LUZ DEBAJO
      =================================================== */}

      <pointLight
        position={[0, 2.8, 0]}
        intensity={7}
        distance={15}
        decay={2}
        color={glow}
      />
    </group>
  );
}
