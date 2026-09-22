"use client";

import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const SKY_RADIUS = 220;

// Fallback si el usuario no permite ubicación.
// La hora seguirá siendo la hora real del dispositivo.
const FALLBACK_LATITUDE = 39.57;
const FALLBACK_LONGITUDE = 2.65;

const RAD = Math.PI / 180;
const DAY_MS = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;

/* =========================================================
   UTILIDADES ASTRONÓMICAS
   Sistema ligero inspirado en fórmulas astronómicas
   estándar. No requiere librerías externas.
========================================================= */

function toJulian(date) {
  return date.valueOf() / DAY_MS - 0.5 + J1970;
}

function toDays(date) {
  return toJulian(date) - J2000;
}

function rightAscension(l, b) {
  const e = RAD * 23.4397;

  return Math.atan2(
    Math.sin(l) * Math.cos(e) -
      Math.tan(b) * Math.sin(e),
    Math.cos(l)
  );
}

function declination(l, b) {
  const e = RAD * 23.4397;

  return Math.asin(
    Math.sin(b) * Math.cos(e) +
      Math.cos(b) * Math.sin(e) * Math.sin(l)
  );
}

function azimuth(H, phi, dec) {
  return Math.atan2(
    Math.sin(H),
    Math.cos(H) * Math.sin(phi) -
      Math.tan(dec) * Math.cos(phi)
  );
}

function altitude(H, phi, dec) {
  return Math.asin(
    Math.sin(phi) * Math.sin(dec) +
      Math.cos(phi) *
        Math.cos(dec) *
        Math.cos(H)
  );
}

function siderealTime(d, lw) {
  return RAD * (280.16 + 360.9856235 * d) - lw;
}

/* =========================================================
   SOL
========================================================= */

function solarMeanAnomaly(d) {
  return RAD * (357.5291 + 0.98560028 * d);
}

function eclipticLongitude(M) {
  const C =
    RAD *
    (1.9148 * Math.sin(M) +
      0.02 * Math.sin(2 * M) +
      0.0003 * Math.sin(3 * M));

  const P = RAD * 102.9372;

  return M + C + P + Math.PI;
}

function getSunPosition(date, latitude, longitude) {
  const lw = RAD * -longitude;
  const phi = RAD * latitude;
  const d = toDays(date);

  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);

  const dec = declination(L, 0);
  const ra = rightAscension(L, 0);

  const H = siderealTime(d, lw) - ra;

  return {
    azimuth: azimuth(H, phi, dec),
    altitude: altitude(H, phi, dec),
  };
}

/* =========================================================
   LUNA
========================================================= */

function moonCoords(d) {
  const L = RAD * (218.316 + 13.176396 * d);
  const M = RAD * (134.963 + 13.064993 * d);
  const F = RAD * (93.272 + 13.22935 * d);

  const l =
    L + RAD * 6.289 * Math.sin(M);

  const b =
    RAD * 5.128 * Math.sin(F);

  return {
    ra: rightAscension(l, b),
    dec: declination(l, b),
  };
}

function getMoonPosition(date, latitude, longitude) {
  const lw = RAD * -longitude;
  const phi = RAD * latitude;
  const d = toDays(date);

  const coords = moonCoords(d);

  const H =
    siderealTime(d, lw) - coords.ra;

  return {
    azimuth: azimuth(H, phi, coords.dec),
    altitude: altitude(H, phi, coords.dec),
  };
}

/* =========================================================
   CONVERTIR POSICIÓN ASTRONÓMICA A THREE.JS
========================================================= */

function celestialToVector(
  astronomicalPosition,
  radius = SKY_RADIUS
) {
  const altitude =
    astronomicalPosition.altitude;

  const azimuth =
    astronomicalPosition.azimuth;

  const horizontal =
    Math.cos(altitude) * radius;

  /*
    Convención de la escena:
    Y = arriba
    X/Z = horizonte
  */

  return [
    Math.sin(azimuth) * horizontal,
    Math.sin(altitude) * radius,
    -Math.cos(azimuth) * horizontal,
  ];
}

/* =========================================================
   NUBES
========================================================= */

function CloudBank({
  position,
  scale = 1,
  speed = 0.45,
  opacity = 0.82,
}) {
  const group = useRef();

  useFrame((_, delta) => {
    if (!group.current) return;

    group.current.position.x +=
      speed * delta;

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
    <group
      ref={group}
      position={position}
      scale={scale}
    >
      {pieces.map(
        ([x, y, z, radius], index) => (
          <mesh
            key={index}
            position={[x, y, z]}
          >
            <sphereGeometry
              args={[radius, 18, 18]}
            />

            <meshStandardMaterial
              color="#ffffff"
              roughness={1}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   CÚPULA DEL CIELO
========================================================= */

function SkyDome({
  topColor,
  horizonColor,
}) {
  const material = useRef();

  const uniforms = useMemo(
    () => ({
      topColor: {
        value: new THREE.Color(topColor),
      },
      horizonColor: {
        value: new THREE.Color(horizonColor),
      },
    }),
    []
  );

  useEffect(() => {
    if (!material.current) return;

    material.current.uniforms.topColor.value.set(
      topColor
    );

    material.current.uniforms.horizonColor.value.set(
      horizonColor
    );
  }, [topColor, horizonColor]);

  return (
    <mesh scale={280}>
      <sphereGeometry args={[1, 48, 32]} />

      <shaderMaterial
        ref={material}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vWorldPosition;

          void main() {
            vec4 worldPosition =
              modelMatrix *
              vec4(position, 1.0);

            vWorldPosition =
              worldPosition.xyz;

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
            float h =
              normalize(vWorldPosition).y;

            float mixValue =
              smoothstep(
                -0.10,
                0.70,
                h
              );

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

/* =========================================================
   CIELO DINÁMICO
========================================================= */

export default function DynamicSky() {
  const [now, setNow] =
    useState(() => new Date());

  const [location, setLocation] =
    useState({
      latitude: FALLBACK_LATITUDE,
      longitude: FALLBACK_LONGITUDE,
      precise: false,
    });

  /* =======================================================
     HORA REAL
  ======================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
     UBICACIÓN DEL DISPOSITIVO
  ======================================================= */

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,

          precise: true,
        });
      },

      () => {
        /*
          Si rechaza ubicación simplemente
          conservamos el fallback.
        */
      },

      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 60,
      }
    );
  }, []);

  /* =======================================================
     POSICIONES REALES
  ======================================================= */

  const sunAstronomical =
    getSunPosition(
      now,
      location.latitude,
      location.longitude
    );

  const moonAstronomical =
    getMoonPosition(
      now,
      location.latitude,
      location.longitude
    );

  const sunAltitude =
    sunAstronomical.altitude;

  const moonAltitude =
    moonAstronomical.altitude;

  const sunPosition =
    celestialToVector(
      sunAstronomical,
      190
    );

  const moonPosition =
    celestialToVector(
      moonAstronomical,
      185
    );

  /* =======================================================
     ESTADO DEL DÍA
  ======================================================= */

  const sunDegrees =
    sunAltitude / RAD;

  const moonDegrees =
    moonAltitude / RAD;

  const sunVisible =
    sunDegrees > -1;

  const moonVisible =
    moonDegrees > 0;

  /*
    Día civil:
    por debajo de -6° ya consideramos
    que estamos entrando en noche.
  */

  const daylight =
    THREE.MathUtils.clamp(
      (sunDegrees + 6) / 18,
      0,
      1
    );

  const twilight =
    THREE.MathUtils.clamp(
      (sunDegrees + 12) / 12,
      0,
      1
    );

  /* =======================================================
     COLORES DEL CIELO
  ======================================================= */

  const nightTop =
    new THREE.Color("#020611");

  const nightHorizon =
    new THREE.Color("#10182c");

  const dawnTop =
    new THREE.Color("#315d88");

  const dawnHorizon =
    new THREE.Color("#e88962");

  const dayTop =
    new THREE.Color("#168ee0");

  const dayHorizon =
    new THREE.Color("#a9dcf7");

  let topColor;
  let horizonColor;

  if (sunDegrees <= -6) {
    topColor =
      nightTop.clone().lerp(
        dawnTop,
        twilight
      );

    horizonColor =
      nightHorizon.clone().lerp(
        dawnHorizon,
        twilight
      );
  } else {
    topColor =
      dawnTop.clone().lerp(
        dayTop,
        daylight
      );

    horizonColor =
      dawnHorizon.clone().lerp(
        dayHorizon,
        daylight
      );
  }

  /* =======================================================
     INTENSIDAD SOLAR
  ======================================================= */

  const sunIntensity =
    THREE.MathUtils.clamp(
      daylight * 2.1,
      0,
      2.1
    );

  const hemisphereIntensity =
    THREE.MathUtils.lerp(
      0.12,
      1,
      daylight
    );

  const ambientIntensity =
    THREE.MathUtils.lerp(
      0.06,
      0.35,
      daylight
    );

  /* =======================================================
     ESTRELLAS
  ======================================================= */

  const showStars =
    sunDegrees < -4;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <color
        attach="background"
        args={[
          `#${topColor.getHexString()}`,
        ]}
      />

      <SkyDome
        topColor={`#${topColor.getHexString()}`}
        horizonColor={`#${horizonColor.getHexString()}`}
      />

      <fog
        attach="fog"
        args={[
          `#${horizonColor.getHexString()}`,
          170,
          360,
        ]}
      />

      {/* ===============================================
          ESTRELLAS
      =============================================== */}

      {showStars && (
        <Stars
          radius={190}
          depth={90}
          count={3000}
          factor={3}
          saturation={0}
          fade
          speed={0.12}
        />
      )}

      {/* ===============================================
          SOL REAL
      =============================================== */}

      {sunVisible && (
        <mesh position={sunPosition}>
          <sphereGeometry
            args={[5, 32, 32]}
          />

          <meshBasicMaterial
            color="#fff4b8"
            toneMapped={false}
          />
        </mesh>
      )}

      {/* ===============================================
          LUNA REAL
          Puede aparecer durante el día.
      =============================================== */}

      {moonVisible && (
        <mesh position={moonPosition}>
          <sphereGeometry
            args={[4.5, 32, 32]}
          />

          <meshStandardMaterial
            color="#f4f1df"
            emissive="#d8dff5"
            emissiveIntensity={
              daylight > 0.5
                ? 0.35
                : 1.2
            }
          />
        </mesh>
      )}

      {/* ===============================================
          NUBES
      =============================================== */}

      <CloudBank
        position={[-105, 44, -85]}
        scale={1.3}
        speed={0.5}
        opacity={
          0.55 + daylight * 0.27
        }
      />

      <CloudBank
        position={[-15, 55, -120]}
        scale={0.95}
        speed={0.32}
        opacity={
          0.5 + daylight * 0.3
        }
      />

      <CloudBank
        position={[75, 39, -75]}
        scale={1.15}
        speed={0.42}
        opacity={
          0.55 + daylight * 0.27
        }
      />

      <CloudBank
        position={[120, 60, -145]}
        scale={0.75}
        speed={0.25}
        opacity={
          0.48 + daylight * 0.3
        }
      />

      {/* ===============================================
          LUZ SOLAR
      =============================================== */}

      {sunDegrees > -5 && (
        <directionalLight
          position={sunPosition}
          intensity={sunIntensity}
          color={
            sunDegrees < 10
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
      )}

      {/* ===============================================
          LUZ LUNAR
      =============================================== */}

      {moonVisible &&
        sunDegrees < -2 && (
          <directionalLight
            position={moonPosition}
            intensity={0.22}
            color="#b7c9ef"
          />
        )}

      {/* ===============================================
          LUZ AMBIENTAL
      =============================================== */}

      <hemisphereLight
        intensity={
          hemisphereIntensity
        }
        color={
          daylight > 0.3
            ? "#9bd9ff"
            : "#52668a"
        }
        groundColor={
          daylight > 0.3
            ? "#53614c"
            : "#090b10"
        }
      />

      <ambientLight
        intensity={ambientIntensity}
      />
    </>
  );
}
