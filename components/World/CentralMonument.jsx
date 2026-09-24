"use client";

import {
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

export default function CentralMonument() {
  const crossGroup =
    useRef(null);

  const ringOne =
    useRef(null);

  const ringTwo =
    useRef(null);

  const ringThree =
    useRef(null);

  /* =======================================================
     ANIMACIÓN
  ======================================================= */

  useFrame(
    (_, delta) => {
      if (
        crossGroup.current
      ) {
        crossGroup.current
          .rotation.y +=
          delta * 0.22;

        crossGroup.current
          .rotation.z +=
          delta * 0.045;
      }

      if (
        ringOne.current
      ) {
        ringOne.current
          .rotation.z +=
          delta * 0.18;
      }

      if (
        ringTwo.current
      ) {
        ringTwo.current
          .rotation.x -=
          delta * 0.14;

        ringTwo.current
          .rotation.y +=
          delta * 0.08;
      }

      if (
        ringThree.current
      ) {
        ringThree.current
          .rotation.y -=
          delta * 0.12;

        ringThree.current
          .rotation.z +=
          delta * 0.06;
      }
    }
  );

  return (
    <group
      position={[
        0,
        0.58,
        0,
      ]}
    >
      {/* ===================================================
          BASE INFERIOR
      =================================================== */}

      <mesh
        position={[
          0,
          0.18,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            3.4,
            3.8,
            0.36,
            48,
          ]}
        />

        <meshStandardMaterial
          color="#181b1e"
          roughness={0.5}
          metalness={0.35}
        />
      </mesh>

      {/* ===================================================
          SEGUNDA BASE
      =================================================== */}

      <mesh
        position={[
          0,
          0.42,
          0,
        ]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            2.8,
            3.2,
            0.18,
            48,
          ]}
        />

        <meshStandardMaterial
          color="#2a2f34"
          roughness={0.42}
          metalness={0.42}
        />
      </mesh>

      {/* ===================================================
          SEMIPILAR
      =================================================== */}

      <mesh
        position={[
          0,
          1.7,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry
          args={[
            1.0,
            1.45,
            2.5,
            32,
          ]}
        />

        <meshStandardMaterial
          color="#20252a"
          roughness={0.38}
          metalness={0.5}
        />
      </mesh>

      {/* ===================================================
          NÚCLEO SUPERIOR
      =================================================== */}

      <mesh
        position={[
          0,
          3.05,
          0,
        ]}
        castShadow
      >
        <sphereGeometry
          args={[
            0.72,
            32,
            32,
          ]}
        />

        <meshStandardMaterial
          color="#111315"
          roughness={0.25}
          metalness={0.65}
        />
      </mesh>

      {/* ===================================================
          HALO CENTRAL
      =================================================== */}

      <mesh
        position={[
          0,
          3.2,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            2.4,
            28,
            28,
          ]}
        />

        <meshBasicMaterial
          color="#9fd8ff"
          transparent
          opacity={0.035}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* ===================================================
          CRUCETA
      =================================================== */}

      <group
        ref={
          crossGroup
        }
        position={[
          0,
          3.35,
          0,
        ]}
        rotation={[
          0.42,
          0,
          Math.PI / 4,
        ]}
      >
        {/* CENTRO */}

        <mesh
          castShadow
        >
          <boxGeometry
            args={[
              1.25,
              1.25,
              0.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.28}
            metalness={0.55}
          />
        </mesh>

        {/* ARRIBA */}

        <mesh
          position={[
            0,
            1.18,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              1.25,
              1.25,
              0.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.28}
            metalness={0.55}
          />
        </mesh>

        {/* ABAJO */}

        <mesh
          position={[
            0,
            -1.18,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              1.25,
              1.25,
              0.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.28}
            metalness={0.55}
          />
        </mesh>

        {/* IZQUIERDA */}

        <mesh
          position={[
            -1.18,
            0,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              1.25,
              1.25,
              0.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.28}
            metalness={0.55}
          />
        </mesh>

        {/* DERECHA */}

        <mesh
          position={[
            1.18,
            0,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              1.25,
              1.25,
              0.55,
            ]}
          />

          <meshStandardMaterial
            color="#050607"
            roughness={0.28}
            metalness={0.55}
          />
        </mesh>
      </group>

      {/* ===================================================
          ANILLO 1
      =================================================== */}

      <group
        ref={
          ringOne
        }
        position={[
          0,
          3.35,
          0,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <mesh>
          <torusGeometry
            args={[
              3.3,
              0.055,
              10,
              80,
            ]}
          />

          <meshBasicMaterial
            color="#b7e5ff"
            transparent
            opacity={0.62}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ===================================================
          ANILLO 2
      =================================================== */}

      <group
        ref={
          ringTwo
        }
        position={[
          0,
          3.35,
          0,
        ]}
        rotation={[
          0.55,
          0.7,
          0.2,
        ]}
      >
        <mesh>
          <torusGeometry
            args={[
              3.85,
              0.045,
              10,
              80,
            ]}
          />

          <meshBasicMaterial
            color="#91cfff"
            transparent
            opacity={0.42}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ===================================================
          ANILLO 3
      =================================================== */}

      <group
        ref={
          ringThree
        }
        position={[
          0,
          3.35,
          0,
        ]}
        rotation={[
          1.0,
          -0.4,
          0.8,
        ]}
      >
        <mesh>
          <torusGeometry
            args={[
              4.35,
              0.035,
              8,
              72,
            ]}
          />

          <meshBasicMaterial
            color="#d8efff"
            transparent
            opacity={0.26}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ===================================================
          LUZ SUAVE DEL MONUMENTO
      =================================================== */}

      <pointLight
        position={[
          0,
          3.6,
          0,
        ]}
        intensity={28}
        distance={18}
        decay={2}
        color="#a8ddff"
      />
    </group>
  );
}
