"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export default function DynamicSky() {
  const sun = useRef();
  const { scene } = useThree();

  useFrame(() => {
    const now = new Date();

    const hour =
      now.getHours() +
      now.getMinutes() / 60 +
      now.getSeconds() / 3600;

    // Intensidad de día:
    // amanecer aproximadamente 06:00
    // mediodía 12:00
    // anochecer aproximadamente 18:00
    const daylight = Math.max(
      0,
      Math.sin(((hour - 6) / 12) * Math.PI)
    );

    // Movimiento del sol
    const angle = ((hour - 6) / 12) * Math.PI;

    const sunPosition = new THREE.Vector3(
      Math.cos(angle) * 100,
      Math.sin(angle) * 100,
      30
    );

    if (sun.current) {
      sun.current.position.copy(sunPosition);
      sun.current.intensity = 0.05 + daylight * 2.2;
    }

    // Color general del fondo según la hora
    const dayColor = new THREE.Color("#87b8e6");
    const nightColor = new THREE.Color("#050811");

    scene.background = nightColor
      .clone()
      .lerp(dayColor, daylight);
  });

  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[100, 20, 30]}
        turbidity={8}
        rayleigh={2}
      />

      <directionalLight
        ref={sun}
        position={[100, 100, 30]}
        intensity={2}
      />

      <ambientLight intensity={0.35} />
    </>
  );
}
