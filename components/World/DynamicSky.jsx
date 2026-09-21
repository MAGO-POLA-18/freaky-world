"use client";

import { Sky, Stars } from "@react-three/drei";
import { useEffect, useState } from "react";
import * as THREE from "three";

export default function DynamicSky() {
  const [hour, setHour] = useState(12);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setHour(
        now.getHours() +
        now.getMinutes() / 60 +
        now.getSeconds() / 3600
      );
    };

    updateTime();

    const timer = setInterval(updateTime, 30000);

    return () => clearInterval(timer);
  }, []);

  // RECORRIDO DEL SOL
  const sunAngle = ((hour - 6) / 12) * Math.PI;
  const sunHeight = Math.sin(sunAngle);

  const daylight = THREE.MathUtils.clamp(
    sunHeight,
    0,
    1
  );

  const sunPosition = [
    Math.cos(sunAngle) * 100,
    sunHeight * 100,
    30,
  ];

  // NOCHE
  const isNight = hour < 6 || hour >= 18;

  // RECORRIDO DE LA LUNA
  // Aproximadamente opuesto al recorrido del sol
  const moonAngle = ((hour - 18) / 12) * Math.PI;

  const moonPosition = [
    Math.cos(moonAngle) * 90,
    Math.max(Math.sin(moonAngle) * 75, 10),
    -35,
  ];

  return (
    <>
      {/* CIELO DIURNO */}
      {!isNight && (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          turbidity={8}
          rayleigh={2}
        />
      )}

      {/* CIELO NOCTURNO */}
      {isNight && (
        <>
          <color
            attach="background"
            args={["#02040a"]}
          />

          {/* ESTRELLAS */}
          <Stars
            radius={180}
            depth={80}
            count={2500}
            factor={3}
            saturation={0}
            fade
            speed={0.15}
          />

          {/* LUNA */}
          <mesh position={moonPosition}>
            <sphereGeometry args={[5, 32, 32]} />
            <meshStandardMaterial
              color="#f2f0df"
              emissive="#d8d6c8"
              emissiveIntensity={0.7}
              roughness={1}
            />
          </mesh>

          {/* LUZ DE LUNA */}
          <directionalLight
            position={moonPosition}
            intensity={0.22}
            color="#b8c7e8"
          />
        </>
      )}

      {/* LUZ SOLAR */}
      {!isNight && (
        <directionalLight
          position={sunPosition}
          intensity={0.2 + daylight * 2.2}
        />
      )}

      {/* LUZ AMBIENTAL GLOBAL */}
      <ambientLight
        intensity={
          isNight
            ? 0.1
            : 0.35 + daylight * 0.35
        }
      />
    </>
  );
}
