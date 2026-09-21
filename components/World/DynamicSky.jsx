"use client";

import { Sky } from "@react-three/drei";
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

  // Sol entre aproximadamente 06:00 y 18:00
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

  const isNight = hour < 6 || hour >= 18;

  return (
    <>
      {!isNight && (
        <Sky
          distance={450000}
          sunPosition={sunPosition}
          turbidity={8}
          rayleigh={2}
        />
      )}

      {isNight && (
        <color
          attach="background"
          args={["#030712"]}
        />
      )}

      <directionalLight
        position={sunPosition}
        intensity={0.1 + daylight * 2.2}
      />

      <ambientLight
        intensity={isNight ? 0.08 : 0.35 + daylight * 0.35}
      />
    </>
  );
}
