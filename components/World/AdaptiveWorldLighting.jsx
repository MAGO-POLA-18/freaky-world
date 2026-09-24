"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useFrame,
} from "@react-three/fiber";

import * as THREE from "three";

import {
  playerRuntime,
} from "./PlayerController";

/* =========================================================
   ZONAS DE FREAKY WORLD
========================================================= */

const ZONES = [
  {
    id: "center",
    x: 0,
    z: 0,
  },

  {
    id: "north",
    x: 0,
    z: -72,
  },

  {
    id: "south",
    x: 0,
    z: 72,
  },

  {
    id: "east",
    x: 72,
    z: 0,
  },

  {
    id: "west",
    x: -72,
    z: 0,
  },
];

/* =========================================================
   DISTANCIA
========================================================= */

function distance2D(
  x1,
  z1,
  x2,
  z2
) {
  const dx =
    x1 - x2;

  const dz =
    z1 - z2;

  return Math.sqrt(
    dx * dx +
    dz * dz
  );
}

/* =========================================================
   FACTOR NOCHE

   0 = día
   1 = noche cerrada
========================================================= */

function getNightFactor(
  hour
) {
  /*
    Día completo:
    08:00 → 18:00

    Transición:
    18 → 20
    06 → 08
  */

  if (
    hour >= 20 ||
    hour < 6
  ) {
    return 1;
  }

  if (
    hour >= 18 &&
    hour < 20
  ) {
    return (
      hour - 18
    ) / 2;
  }

  if (
    hour >= 6 &&
    hour < 8
  ) {
    return (
      8 - hour
    ) / 2;
  }

  return 0;
}

/* =========================================================
   LUZ ADAPTATIVA
========================================================= */

export default function AdaptiveWorldLighting({
  quality = "low",
  testHour = null,
}) {
  const localLight =
    useRef(null);

  const shadowLight =
    useRef(null);

  const shadowTarget =
    useRef(null);

  const currentZone =
    useRef("center");

  const frameCounter =
    useRef(0);

  const [
    activeZone,
    setActiveZone,
  ] = useState(
    ZONES[0]
  );

  const [
    currentHour,
    setCurrentHour,
  ] = useState(
    () =>
      new Date()
        .getHours()
  );

  /* =======================================================
     HORA
  ======================================================= */

  useEffect(() => {
    const updateHour =
      () => {
        setCurrentHour(
          new Date()
            .getHours()
        );
      };

    updateHour();

    const timer =
      window.setInterval(
        updateHour,
        30000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, []);

  const effectiveHour =
    testHour ??
    currentHour;

  const nightFactor =
    getNightFactor(
      effectiveHour
    );

  /* =======================================================
     CONFIGURACIÓN SEGÚN CALIDAD
  ======================================================= */

  const settings =
    useMemo(() => {
      if (
        quality === "high"
      ) {
        return {
          localDistance: 52,
          localIntensity: 145,
          shadowSize: 1024,
          shadowRadius: 40,
        };
      }

      if (
        quality === "medium"
      ) {
        return {
          localDistance: 44,
          localIntensity: 120,
          shadowSize: 512,
          shadowRadius: 32,
        };
      }

      return {
        localDistance: 36,
        localIntensity: 95,
        shadowSize: 256,
        shadowRadius: 26,
      };
    }, [
      quality,
    ]);

  /* =======================================================
     DETECTAR ZONA DEL JUGADOR

     No usamos setState cada frame.

     Revisamos aproximadamente
     4 veces por segundo.
  ======================================================= */

  useFrame(() => {
    frameCounter.current +=
      1;

    if (
      frameCounter.current <
      15
    ) {
      return;
    }

    frameCounter.current = 0;

    const body =
      playerRuntime.body;

    if (!body) {
      return;
    }

    const playerPosition =
      body.translation();

    let nearest =
      ZONES[0];

    let nearestDistance =
      Infinity;

    for (
      const zone
      of ZONES
    ) {
      const distance =
        distance2D(
          playerPosition.x,
          playerPosition.z,
          zone.x,
          zone.z
        );

      if (
        distance <
        nearestDistance
      ) {
        nearestDistance =
          distance;

        nearest =
          zone;
      }
    }

    if (
      nearest.id !==
      currentZone.current
    ) {
      currentZone.current =
        nearest.id;

      setActiveZone(
        nearest
      );
    }
  });

  /* =======================================================
     MOVER LUCES A LA ZONA ACTIVA
  ======================================================= */

  useEffect(() => {
    if (
      localLight.current
    ) {
      localLight.current
        .position.set(
          activeZone.x,
          12,
          activeZone.z
        );
    }

    if (
      shadowLight.current
    ) {
      shadowLight.current
        .position.set(
          activeZone.x + 12,
          24,
          activeZone.z + 10
        );
    }

    if (
      shadowTarget.current
    ) {
      shadowTarget.current
        .position.set(
          activeZone.x,
          0,
          activeZone.z
        );

      shadowTarget.current
        .updateMatrixWorld();
    }
  }, [
    activeZone,
  ]);

  /* =======================================================
     ACTUALIZAR TARGET
  ======================================================= */

  useEffect(() => {
    if (
      shadowLight.current &&
      shadowTarget.current
    ) {
      shadowLight.current.target =
        shadowTarget.current;
    }
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          ILUMINACIÓN URBANA GLOBAL

          Esta es la que impide que Freaky World
          se vea apagado de noche.

          Son luces muy baratas.
      =================================================== */}

      <ambientLight
        intensity={
          0.12 +
          nightFactor *
            0.42
        }
        color={
          nightFactor >
          0.2
            ? "#a7b9d2"
            : "#ffffff"
        }
      />

      <hemisphereLight
        intensity={
          0.12 +
          nightFactor *
            0.72
        }
        color={
          nightFactor >
          0.2
            ? "#9fbce2"
            : "#ffffff"
        }
        groundColor={
          nightFactor >
          0.2
            ? "#3b4450"
            : "#596052"
        }
      />

      {/* ===================================================
          RELLENO NOCTURNO GENERAL

          No proyecta sombras.

          Muy barato comparado con tener
          decenas de luces por el mundo.
      =================================================== */}

      {nightFactor >
        0.01 && (
        <directionalLight
          position={[
            35,
            65,
            25,
          ]}
          intensity={
            0.2 +
            nightFactor *
              0.48
          }
          color="#b9ccef"
          castShadow={
            false
          }
        />
      )}

      {/* ===================================================
          LUZ LOCAL

          Solo existe visualmente en la zona activa.

          No genera sombras.
      =================================================== */}

      {nightFactor >
        0.01 && (
        <pointLight
          ref={
            localLight
          }
          position={[
            activeZone.x,
            12,
            activeZone.z,
          ]}
          intensity={
            settings
              .localIntensity *
            nightFactor
          }
          distance={
            settings
              .localDistance
          }
          decay={2}
          color="#ffe3b0"
          castShadow={
            false
          }
        />
      )}

      {/* ===================================================
          SOMBRA LOCAL

          UNA SOLA luz con sombra
          para todo Freaky World.

          Se mueve de zona en zona.
      =================================================== */}

      {nightFactor >
        0.01 && (
        <>
          <object3D
            ref={
              shadowTarget
            }
            position={[
              activeZone.x,
              0,
              activeZone.z,
            ]}
          />

          <directionalLight
            ref={
              shadowLight
            }
            position={[
              activeZone.x +
                12,

              24,

              activeZone.z +
                10,
            ]}
            intensity={
              0.35 *
              nightFactor
            }
            color="#ffe2b5"
            castShadow
            shadow-mapSize-width={
              settings
                .shadowSize
            }
            shadow-mapSize-height={
              settings
                .shadowSize
            }
            shadow-camera-near={
              1
            }
            shadow-camera-far={
              60
            }
            shadow-camera-left={
              -settings
                .shadowRadius
            }
            shadow-camera-right={
              settings
                .shadowRadius
            }
            shadow-camera-top={
              settings
                .shadowRadius
            }
            shadow-camera-bottom={
              -settings
                .shadowRadius
            }
            shadow-bias={
              -0.0005
            }
          />
        </>
      )}
    </>
  );
}
