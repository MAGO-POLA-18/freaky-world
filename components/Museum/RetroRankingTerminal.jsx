"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import {
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   TERMINAL RANKING

   Está físicamente dentro de la Sala Retro.

   Cuando el jugador se acerca:
   avisa a la interfaz 2D.

   Todavía NO abre nada directamente desde el objeto.
   Esto evita problemas con los controles táctiles móviles.
========================================================= */

const INTERACTION_DISTANCE = 5.5;

export default function RetroRankingTerminal({
  position = [
    0,
    0,
    0,
  ],
}) {
  const screenMaterial =
    useRef(null);

  const lastNear =
    useRef(false);

  /* =======================================================
     AL SALIR / DESMONTAR
  ======================================================= */

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent(
          "freaky:retro-terminal-near",
          {
            detail: {
              near: false,
            },
          }
        )
      );
    };
  }, []);

  /* =======================================================
     DISTANCIA AL JUGADOR
  ======================================================= */

  useFrame((state) => {
    const body =
      playerRuntime.body;

    if (!body) {
      return;
    }

    const player =
      body.translation();

    const dx =
      player.x -
      position[0];

    const dz =
      player.z -
      position[2];

    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    const near =
      distance <=
      INTERACTION_DISTANCE;

    /* =====================================================
       SOLO EMITIMOS EVENTO SI CAMBIÓ EL ESTADO
    ===================================================== */

    if (
      near !==
      lastNear.current
    ) {
      lastNear.current =
        near;

      window.dispatchEvent(
        new CustomEvent(
          "freaky:retro-terminal-near",
          {
            detail: {
              near,
            },
          }
        )
      );
    }

    /* =====================================================
       PULSO VISUAL
    ===================================================== */

    if (
      screenMaterial.current
    ) {
      const pulse =
        1.6 +
        Math.sin(
          state.clock
            .elapsedTime *
            2.5
        ) *
          0.35;

      screenMaterial.current
        .emissiveIntensity =
        near
          ? pulse + 1
          : pulse;
    }
  });

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={position}
    >
      {/* =================================================
          COLISIÓN
      ================================================= */}

      <CuboidCollider
        args={[
          1.8,
          1.6,
          0.55,
        ]}
        position={[
          0,
          1.6,
          0,
        ]}
      />

      {/* =================================================
          BASE
      ================================================= */}

      <mesh
        position={[
          0,
          0.2,
          0,
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            4.2,
            0.4,
            2.2,
          ]}
        />

        <meshStandardMaterial
          color="#11151a"
          roughness={0.72}
          metalness={0.25}
        />
      </mesh>

      {/* =================================================
          CUERPO
      ================================================= */}

      <mesh
        position={[
          0,
          1.55,
          0,
        ]}
        castShadow
      >
        <boxGeometry
          args={[
            3.6,
            2.8,
            0.9,
          ]}
        />

        <meshStandardMaterial
          color="#191f25"
          roughness={0.45}
          metalness={0.5}
        />
      </mesh>

      {/* =================================================
          PANTALLA
          Mira hacia la entrada de Retro.
      ================================================= */}

      <mesh
        position={[
          0,
          1.7,
          0.47,
        ]}
      >
        <planeGeometry
          args={[
            3,
            1.8,
          ]}
        />

        <meshStandardMaterial
          ref={
            screenMaterial
          }
          color="#69d6ff"
          emissive="#1fa8ff"
          emissiveIntensity={1.7}
          roughness={0.18}
        />
      </mesh>

      {/* =================================================
          LÍNEA INFERIOR
      ================================================= */}

      <mesh
        position={[
          0,
          0.52,
          0.52,
        ]}
      >
        <boxGeometry
          args={[
            2.8,
            0.12,
            0.12,
          ]}
        />

        <meshStandardMaterial
          color="#d7f6ff"
          emissive="#8ee8ff"
          emissiveIntensity={2}
        />
      </mesh>

      {/* =================================================
          LUZ SUAVE
      ================================================= */}

      <pointLight
        position={[
          0,
          2,
          2,
        ]}
        intensity={35}
        distance={7}
        decay={2}
        color="#64d8ff"
      />
    </RigidBody>
  );
}
