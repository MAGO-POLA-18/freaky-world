"use client";

import { Sky, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function CloudBank({ position, scale = 1, speed = 0.45 }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current) return;

    group.current.position.x += speed * delta;

    if (group.current.position.x > 150) {
      group.current.position.x = -150;
    }
  });

  const pieces = useMemo(
    () => [
      [-5.5, 0.2, 0, 4.5],
      [-1.8, 1.1, 0.4, 5.2],
      [2.3, 0.8, -0.2, 4.8],
      [5.6, 0.1, 0.3, 3.8],
      [0.2, -0.5, 0.8, 5.4],
    ],
    []
  );

  return (
    <group ref={group} position={position} scale={scale}>
      {pieces.map(([x, y, z, radius], index) => (
        <mesh key={index} position={[x, y, z]}>
          <sphereGeometry args={[radius, 18, 18]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={1}
            transparent
            opacity={0.8}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

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

    const timer = setInterval(updateTime, 15000);

    return () => clearInterval(timer);
  }, []);

  const dayStart = 6;
  const dayEnd = 20;

  const isDay = hour >= dayStart && hour < dayEnd;

  const dayProgress = THREE.MathUtils.clamp(
    (hour - dayStart) / (dayEnd - dayStart),
    0,
    1
  );

  const sunAngle = dayProgress * Math.PI;
  const sunHeight = Math.max(Math.sin(sunAngle), 0);

  const sunPosition = [
    Math.cos(sunAngle) * 120,
    18 + sunHeight * 105,
    -45,
  ];

  const dawn = new THREE.Color("#f3a96d");
  const noon = new THREE.Color("#56b8f5");
  const dusk = new THREE.Color("#e98a5f");
  const night = new THREE.Color("#040714");

  let skyColor;

  if (!isDay) {
    skyColor = night;
  } else if (dayProgress < 0.5) {
    skyColor = dawn.clone().lerp(noon, dayProgress / 0.5);
  } else {
    skyColor = noon
      .clone()
      .lerp(dusk, (dayProgress - 0.5) / 0.5);
  }

  const moonProgress =
    hour >= dayEnd
      ? (hour - dayEnd) / (24 - dayEnd + dayStart)
      : (hour + 24 - dayEnd) / (24 - dayEnd + dayStart);

  const moonAngle =
    THREE.MathUtils.clamp(moonProgress, 0, 1) * Math.PI;

  const moonPosition = [
    Math.cos(moonAngle) * 105,
    22 + Math.max(Math.sin(moonAngle), 0) * 78,
    35,
  ];

  return (
    <>
      <color attach="background" args={[skyColor]} />

      <fog
        attach="fog"
        args={[isDay ? "#8fd0f8" : "#08101f", 170, 360]}
      />

      {isDay ? (
        <>
          <Sky
            distance={450000}
            sunPosition={sunPosition}
            turbidity={2.2}
            rayleigh={5.5}
            mieCoefficient={0.002}
            mieDirectionalG={0.75}
          />

          <mesh position={sunPosition}>
            <sphereGeometry args={[5.5, 32, 32]} />

            <meshBasicMaterial
              color="#fff3b8"
              toneMapped={false}
            />
          </mesh>

          <CloudBank
            position={[-105, 42, -85]}
            scale={1.3}
            speed={0.5}
          />

          <CloudBank
            position={[-20, 53, -120]}
            scale={0.95}
            speed={0.32}
          />

          <CloudBank
            position={[65, 37, -72]}
            scale={1.15}
            speed={0.42}
          />

          <directionalLight
            position={sunPosition}
            intensity={0.95 + sunHeight * 1.2}
            color={
              dayProgress < 0.18 || dayProgress > 0.82
                ? "#ffd6a3"
                : "#fff8ea"
            }
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={260}
            shadow-camera-left={-120}
            shadow-camera-right={120}
            shadow-camera-top={120}
            shadow-camera-bottom={-120}
          />

          <hemisphereLight
            intensity={0.9 + sunHeight * 0.3}
            color="#9fd8ff"
            groundColor="#66745f"
          />

          <ambientLight intensity={0.35 + sunHeight * 0.2} />
        </>
      ) : (
        <>
          <Stars
            radius={190}
            depth={90}
            count={2800}
            factor={3}
            saturation={0}
            fade
            speed={0.12}
          />

          <mesh position={moonPosition}>
            <sphereGeometry args={[4.5, 32, 32]} />

            <meshStandardMaterial
              color="#f1f0df"
              emissive="#d9def0"
              emissiveIntensity={1.1}
              roughness={1}
            />
          </mesh>

          <directionalLight
            position={moonPosition}
            intensity={0.32}
            color="#b7c9ef"
          />

          <hemisphereLight
            intensity={0.18}
            color="#516587"
            groundColor="#0b0d12"
          />

          <ambientLight intensity={0.09} />
        </>
      )}
    </>
  );
}
