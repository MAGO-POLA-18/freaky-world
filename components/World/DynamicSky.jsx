"use client";

import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function CloudBank({ position, scale = 1, speed = 0.45 }) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current) return;

    group.current.position.x += speed * delta;

    if (group.current.position.x > 160) {
      group.current.position.x = -160;
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
            opacity={0.82}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function SkyDome({ topColor, horizonColor }) {
  const uniforms = useMemo(
    () => ({
      topColor: {
        value: new THREE.Color(topColor),
      },
      horizonColor: {
        value: new THREE.Color(horizonColor),
      },
    }),
    [topColor, horizonColor]
  );

  return (
    <mesh scale={280}>
      <sphereGeometry args={[1, 48, 32]} />

      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vWorldPosition;

          void main() {
            vec4 worldPosition =
              modelMatrix * vec4(position, 1.0);

            vWorldPosition = worldPosition.xyz;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 horizonColor;

          varying vec3 vWorldPosition;

          void main() {
            float h = normalize(vWorldPosition).y;

            float mixValue =
              smoothstep(-0.10, 0.65, h);

            vec3 finalColor =
              mix(
                horizonColor,
                topColor,
                mixValue
              );

            gl_FragColor =
              vec4(finalColor, 1.0);
          }
        `}
      />
    </mesh>
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

    const timer = setInterval(
      updateTime,
      15000
    );

    return () => clearInterval(timer);
  }, []);

  const dayStart = 6;
  const dayEnd = 20;

  const isDay =
    hour >= dayStart &&
    hour < dayEnd;

  const dayProgress =
    THREE.MathUtils.clamp(
      (hour - dayStart) /
        (dayEnd - dayStart),
      0,
      1
    );

  const sunAngle =
    dayProgress * Math.PI;

  const sunHeight =
    Math.max(
      Math.sin(sunAngle),
      0
    );

  const sunPosition = [
    Math.cos(sunAngle) * 120,
    20 + sunHeight * 100,
    -80,
  ];

  let topColor;
  let horizonColor;

  if (!isDay) {
    topColor = "#020611";
    horizonColor = "#101a33";
  } else if (dayProgress < 0.15) {
    topColor = "#4d95c9";
    horizonColor = "#f1a36c";
  } else if (dayProgress < 0.8) {
    topColor = "#168ee0";
    horizonColor = "#9bd8ff";
  } else {
    topColor = "#397fb4";
    horizonColor = "#ef9467";
  }

  const moonProgress =
    hour >= dayEnd
      ? (hour - dayEnd) /
        (24 - dayEnd + dayStart)
      : (hour + 24 - dayEnd) /
        (24 - dayEnd + dayStart);

  const moonAngle =
    THREE.MathUtils.clamp(
      moonProgress,
      0,
      1
    ) * Math.PI;

  const moonPosition = [
    Math.cos(moonAngle) * 105,
    25 +
      Math.max(
        Math.sin(moonAngle),
        0
      ) *
        75,
    40,
  ];

  return (
    <>
      <color
        attach="background"
        args={[topColor]}
      />

      <SkyDome
        topColor={topColor}
        horizonColor={horizonColor}
      />

      <fog
        attach="fog"
        args={[
          isDay
            ? horizonColor
            : "#091020",
          170,
          360,
        ]}
      />

      {isDay ? (
        <>
          {/* SOL */}
          <mesh position={sunPosition}>
            <sphereGeometry
              args={[5, 32, 32]}
            />

            <meshBasicMaterial
              color="#fff4b8"
              toneMapped={false}
            />
          </mesh>

          {/* NUBES */}
          <CloudBank
            position={[-105, 44, -85]}
            scale={1.3}
            speed={0.5}
          />

          <CloudBank
            position={[-15, 55, -120]}
            scale={0.95}
            speed={0.32}
          />

          <CloudBank
            position={[75, 39, -75]}
            scale={1.15}
            speed={0.42}
          />

          <CloudBank
            position={[120, 60, -145]}
            scale={0.75}
            speed={0.25}
          />

          {/* LUZ DEL SOL */}
          <directionalLight
            position={sunPosition}
            intensity={
              1 +
              sunHeight * 1.1
            }
            color={
              dayProgress < 0.15 ||
              dayProgress > 0.8
                ? "#ffd09b"
                : "#fff6e2"
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
            intensity={1}
            color="#9bd9ff"
            groundColor="#53614c"
          />

          <ambientLight
            intensity={0.35}
          />
        </>
      ) : (
        <>
          <Stars
            radius={190}
            depth={90}
            count={3000}
            factor={3}
            saturation={0}
            fade
            speed={0.12}
          />

          <mesh position={moonPosition}>
            <sphereGeometry
              args={[4.5, 32, 32]}
            />

            <meshStandardMaterial
              color="#f4f1df"
              emissive="#d8dff5"
              emissiveIntensity={1.2}
            />
          </mesh>

          <directionalLight
            position={moonPosition}
            intensity={0.3}
            color="#b7c9ef"
          />

          <hemisphereLight
            intensity={0.18}
            color="#52668a"
            groundColor="#090b10"
          />

          <ambientLight
            intensity={0.08}
          />
        </>
      )}
    </>
  );
}
