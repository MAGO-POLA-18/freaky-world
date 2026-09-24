"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/* =========================================================
   MONUMENTO CENTRAL — CRUCETA RETRO
========================================================= */

function TriangleMark({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const shape = new THREE.Shape();

  shape.moveTo(0, 0.75);
  shape.lineTo(-0.6, -0.5);
  shape.lineTo(0.6, -0.5);
  shape.closePath();

  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <shapeGeometry args={[shape]} />

      <meshStandardMaterial
        color="#010203"
        roughness={0.95}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export default function CentralMonument({
  position = [0, 0, 0],
}) {
  const dpadRef = useRef(null);

  useFrame((state, delta) => {
    if (!dpadRef.current) return;

    dpadRef.current.rotation.y +=
      delta * 0.18;
  });

  const black = "#07090b";
  const blackSoft = "#11161a";

  const platformDark =
    "#20272d";

  const platformMid =
    "#303942";

  const glow =
    "#8fd8ff";

  return (
    <group position={position}>
      {/* ===================================================
          PLATAFORMA
      =================================================== */}

      <mesh
        position={[
          0,
          0.1,
          0,
        ]}
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
        position={[
          0,
          0.24,
          0,
        ]}
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
        position={[
          0,
          0.38,
          0,
        ]}
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
          ARO LUMINOSO INTEGRADO
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
          emissiveIntensity={1}
          toneMapped={false}
        />
      </mesh>

      {/* ===================================================
          CRUCETA
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
            roughness={0.5}
            metalness={0.14}
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
            roughness={0.5}
            metalness={0.14}
          />
        </RoundedBox>

        {/* =================================================
            CENTRO HUNDIDO

            No sobresale.
            Queda metido dentro de la cara frontal.
        ================================================= */}

        <mesh
          position={[
            0,
            0,
            0.68,
          ]}
        >
          <cylinderGeometry
            args={[
              1.2,
              1.0,
              0.22,
              48,
            ]}
          />

          <meshStandardMaterial
            color="#020304"
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* =================================================
            FONDO DEL HUNDIMIENTO
        ================================================= */}

        <mesh
          position={[
            0,
            0,
            0.55,
          ]}
        >
          <cylinderGeometry
            args={[
              0.95,
              0.95,
              0.08,
              48,
            ]}
          />

          <meshStandardMaterial
            color="#000102"
            roughness={1}
          />
        </mesh>

        {/* =================================================
            FLECHA ARRIBA
        ================================================= */}

        <TriangleMark
          position={[
            0,
            2.75,
            0.735,
          ]}
        />

        {/* =================================================
            FLECHA ABAJO
        ================================================= */}

        <TriangleMark
          position={[
            0,
            -2.75,
            0.735,
          ]}
          rotation={[
            0,
            0,
            Math.PI,
          ]}
        />

        {/* =================================================
            FLECHA IZQUIERDA
        ================================================= */}

        <TriangleMark
          position={[
            -2.75,
            0,
            0.735,
          ]}
          rotation={[
            0,
            0,
            Math.PI / 2,
          ]}
        />

        {/* =================================================
            FLECHA DERECHA
        ================================================= */}

        <TriangleMark
          position={[
            2.75,
            0,
            0.735,
          ]}
          rotation={[
            0,
            0,
            -Math.PI / 2,
          ]}
        />
      </group>

      {/* ===================================================
          LUZ SUAVE INFERIOR
      =================================================== */}

      <pointLight
        position={[
          0,
          2.3,
          0,
        ]}
        intensity={3.5}
        distance={12}
        decay={2}
        color={glow}
      />
    </group>
  );
}
