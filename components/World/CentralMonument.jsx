"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";

/* =========================================================
   MONUMENTO CENTRAL — CRUCETA RETRO
========================================================= */

export default function CentralMonument({
  position = [0, 0, 0],
}) {
  const dpadRef = useRef(null);

  useFrame((state, delta) => {
    if (!dpadRef.current) return;

    dpadRef.current.rotation.y += delta * 0.2;
  });

  const black = "#07090b";
  const blackSoft = "#11161a";
  const platformDark = "#20272d";
  const platformMid = "#303942";
  const glow = "#8fd8ff";

  return (
    <group position={position}>
      {/* ===================================================
          PLATAFORMA
      =================================================== */}

      <mesh
        position={[0, 0.1, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            9,
            9,
            0.2,
            64,
          ]}
        />

        <meshStandardMaterial
          color={blackSoft}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <mesh
        position={[0, 0.24, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            7.4,
            7.4,
            0.18,
            64,
          ]}
        />

        <meshStandardMaterial
          color={platformDark}
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>

      <mesh
        position={[0, 0.38, 0]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            5.6,
            5.6,
            0.16,
            64,
          ]}
        />

        <meshStandardMaterial
          color={platformMid}
          roughness={0.78}
          metalness={0.1}
        />
      </mesh>

      {/* ===================================================
          ARO DE LUZ INTEGRADO
      =================================================== */}

      <mesh
        position={[
          0,
          0.48,
          0,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <torusGeometry
          args={[
            4.7,
            0.055,
            10,
            96,
          ]}
        />

        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={1.15}
          toneMapped={false}
        />
      </mesh>

      {/* ===================================================
          CRUCETA SUSPENDIDA

          - diagonal
          - extremos redondeados
          - centro hundido
      =================================================== */}

      <group
        ref={dpadRef}
        position={[
          0,
          6.4,
          0,
        ]}
        rotation={[
          -0.12,
          0,
          Math.PI / 4,
        ]}
      >
        {/* =================================================
            BRAZO VERTICAL
        ================================================= */}

        <RoundedBox
          args={[
            3.2,
            8.2,
            1.45,
          ]}
          radius={0.42}
          smoothness={5}
          castShadow
        >
          <meshStandardMaterial
            color={black}
            roughness={0.48}
            metalness={0.16}
          />
        </RoundedBox>

        {/* =================================================
            BRAZO HORIZONTAL
        ================================================= */}

        <RoundedBox
          args={[
            8.2,
            3.2,
            1.45,
          ]}
          radius={0.42}
          smoothness={5}
          castShadow
        >
          <meshStandardMaterial
            color={black}
            roughness={0.48}
            metalness={0.16}
          />
        </RoundedBox>

        {/* =================================================
            CENTRO HUNDIDO

            Semiesfera oscura ligeramente metida
            dentro de la cruceta.
        ================================================= */}

        <mesh
          position={[
            0,
            0,
            0.63,
          ]}
          rotation={[
            Math.PI,
            0,
            0,
          ]}
        >
          <sphereGeometry
            args={[
              1.15,
              32,
              20,
              0,
              Math.PI * 2,
              0,
              Math.PI / 2,
            ]}
          />

          <meshStandardMaterial
            color="#020303"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* =================================================
            ANILLO MUY SUTIL ALREDEDOR DEL HUNDIMIENTO
        ================================================= */}

        <mesh
          position={[
            0,
            0,
            0.74,
          ]}
          rotation={[
            Math.PI / 2,
            0,
            0,
          ]}
        >
          <torusGeometry
            args={[
              1.18,
              0.06,
              10,
              48,
            ]}
          />

          <meshStandardMaterial
            color="#15191d"
            roughness={0.72}
            metalness={0.12}
          />
        </mesh>
      </group>

      {/* ===================================================
          LUZ BAJO LA CRUCETA
      =================================================== */}

      <pointLight
        position={[
          0,
          2.4,
          0,
        ]}
        intensity={4}
        distance={12}
        decay={2}
        color={glow}
      />
    </group>
  );
}
