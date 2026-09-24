"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/* =========================================================
   MONUMENTO CENTRAL — FREAKY WORLD

   IDEA:
   - Cruceta retro simple
   - 4 brazos negros
   - Suspendida claramente en el aire
   - Giro lento y limpio
   - Sin aros flotantes
   - Plataforma circular sobria
========================================================= */

export default function CentralMonument({
  position = [0, 0, 0],
}) {
  const dpadRef = useRef(null);

  /* =======================================================
     ANIMACIÓN
  ======================================================= */

  useFrame((state, delta) => {
    if (!dpadRef.current) return;

    // Giro lento y constante.
    // Solo sobre el eje vertical.
    dpadRef.current.rotation.y +=
      delta * 0.22;
  });

  /* =======================================================
     COLORES
  ======================================================= */

  const black = "#07090b";
  const blackSoft = "#11161a";
  const platformDark = "#20272d";
  const platformMid = "#303942";
  const glow = "#8fd8ff";

  return (
    <group position={position}>
      {/* ===================================================
          PLATAFORMA — NIVEL INFERIOR
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

      {/* ===================================================
          PLATAFORMA — SEGUNDO NIVEL
      =================================================== */}

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

      {/* ===================================================
          PLATAFORMA — CENTRO
      =================================================== */}

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
          ÚNICO ARO LUMINOSO
          Integrado en la plataforma
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
          emissiveIntensity={1.25}
          toneMapped={false}
        />
      </mesh>

      {/* ===================================================
          CRUCETA

          IMPORTANTE:
          Ahora está a 6.2 unidades de altura.

          Esto la separa claramente del suelo.
      =================================================== */}

      <group
        ref={dpadRef}
        position={[
          0,
          6.2,
          0,
        ]}
      >
        {/* =================================================
            BRAZO SUPERIOR
        ================================================= */}

        <mesh
          position={[
            0,
            2.15,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              3,
              3.6,
              1.4,
            ]}
          />

          <meshStandardMaterial
            color={black}
            roughness={0.48}
            metalness={0.18}
          />
        </mesh>

        {/* =================================================
            BRAZO INFERIOR
        ================================================= */}

        <mesh
          position={[
            0,
            -2.15,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              3,
              3.6,
              1.4,
            ]}
          />

          <meshStandardMaterial
            color={black}
            roughness={0.48}
            metalness={0.18}
          />
        </mesh>

        {/* =================================================
            BRAZO IZQUIERDO
        ================================================= */}

        <mesh
          position={[
            -2.15,
            0,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              3.6,
              3,
              1.4,
            ]}
          />

          <meshStandardMaterial
            color={black}
            roughness={0.48}
            metalness={0.18}
          />
        </mesh>

        {/* =================================================
            BRAZO DERECHO
        ================================================= */}

        <mesh
          position={[
            2.15,
            0,
            0,
          ]}
          castShadow
        >
          <boxGeometry
            args={[
              3.6,
              3,
              1.4,
            ]}
          />

          <meshStandardMaterial
            color={black}
            roughness={0.48}
            metalness={0.18}
          />
        </mesh>
      </group>

      {/* ===================================================
          RESPLANDOR INFERIOR

          Da sensación de suspensión,
          sin poner efectos alrededor.
      =================================================== */}

      <pointLight
        position={[
          0,
          2.2,
          0,
        ]}
        intensity={5}
        distance={12}
        decay={2}
        color={glow}
      />

      {/* ===================================================
          PEQUEÑO PUNTO DE LUZ SOBRE LA BASE
      =================================================== */}

      <pointLight
        position={[
          0,
          0.8,
          0,
        ]}
        intensity={2}
        distance={7}
        decay={2}
        color={glow}
      />
    </group>
  );
}
