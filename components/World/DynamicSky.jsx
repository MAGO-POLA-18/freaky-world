"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const SKY_RADIUS = 220;
const FALLBACK_LATITUDE = 39.57;
const FALLBACK_LONGITUDE = 2.65;

const RAD = Math.PI / 180;
const DAY_MS = 1000 * 60 * 60 * 24;
const J1970 = 2440588;
const J2000 = 2451545;

/* =========================================================
   ASTRONOMÍA
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
      Math.cos(b) *
        Math.sin(e) *
        Math.sin(l)
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
  return (
    RAD * (280.16 + 360.9856235 * d) -
    lw
  );
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
    (
      1.9148 * Math.sin(M) +
      0.02 * Math.sin(2 * M) +
      0.0003 * Math.sin(3 * M)
    );

  const P = RAD * 102.9372;

  return M + C + P + Math.PI;
}

function getSunPosition(
  date,
  latitude,
  longitude
) {
  const lw = RAD * -longitude;
  const phi = RAD * latitude;
  const d = toDays(date);

  const M = solarMeanAnomaly(d);
  const L = eclipticLongitude(M);

  const dec = declination(L, 0);
  const ra = rightAscension(L, 0);

  const H =
    siderealTime(d, lw) - ra;

  return {
    azimuth: azimuth(H, phi, dec),
    altitude: altitude(H, phi, dec),
  };
}

/* =========================================================
   LUNA
========================================================= */

function moonCoords(d) {
  const L =
    RAD * (218.316 + 13.176396 * d);

  const M =
    RAD * (134.963 + 13.064993 * d);

  const F =
    RAD * (93.272 + 13.22935 * d);

  const l =
    L + RAD * 6.289 * Math.sin(M);

  const b =
    RAD * 5.128 * Math.sin(F);

  return {
    ra: rightAscension(l, b),
    dec: declination(l, b),
  };
}

function getMoonPosition(
  date,
  latitude,
  longitude
) {
  const lw = RAD * -longitude;
  const phi = RAD * latitude;
  const d = toDays(date);

  const coords = moonCoords(d);

  const H =
    siderealTime(d, lw) - coords.ra;

  return {
    azimuth: azimuth(
      H,
      phi,
      coords.dec
    ),

    altitude: altitude(
      H,
      phi,
      coords.dec
    ),
  };
}

/* =========================================================
   VECTOR CELESTE
========================================================= */

function celestialToVector(
  position,
  radius = SKY_RADIUS
) {
  const horizontal =
    Math.cos(position.altitude) *
    radius;

  return [
    Math.sin(position.azimuth) *
      horizontal,

    Math.sin(position.altitude) *
      radius,

    -Math.cos(position.azimuth) *
      horizontal,
  ];
}

/* =========================================================
   ESTRELLAS
========================================================= */

function StarField({
  count = 4200,
  radius = 245,
}) {
  const group = useRef();
  const material = useRef();

  const { camera } = useThree();

  const geometry = useMemo(() => {
    const positions =
      new Float32Array(count * 3);

    const phases =
      new Float32Array(count);

    const sizes =
      new Float32Array(count);

    const brightness =
      new Float32Array(count);

    let seed = 918273;

    const random = () => {
      seed =
        (seed * 16807) %
        2147483647;

      return (
        (seed - 1) /
        2147483646
      );
    };

    for (
      let i = 0;
      i < count;
      i += 1
    ) {
      const angle =
        random() *
        Math.PI *
        2;

      const y =
        THREE.MathUtils.lerp(
          -0.12,
          1,
          random()
        );

      const horizontal =
        Math.sqrt(
          Math.max(
            0,
            1 - y * y
          )
        );

      const r =
        radius +
        THREE.MathUtils.lerp(
          -2,
          2,
          random()
        );

      positions[i * 3] =
        Math.cos(angle) *
        horizontal *
        r;

      positions[i * 3 + 1] =
        y * r;

      positions[i * 3 + 2] =
        Math.sin(angle) *
        horizontal *
        r;

      phases[i] =
        random() *
        Math.PI *
        2;

      const brightStar =
        random() > 0.97;

      if (brightStar) {
        sizes[i] =
          THREE.MathUtils.lerp(
            2,
            2.5,
            random()
          );

        brightness[i] =
          THREE.MathUtils.lerp(
            0.9,
            1,
            random()
          );
      } else {
        sizes[i] =
          THREE.MathUtils.lerp(
            0.85,
            1.45,
            random()
          );

        brightness[i] =
          THREE.MathUtils.lerp(
            0.48,
            0.86,
            random()
          );
      }
    }

    const geo =
      new THREE.BufferGeometry();

    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geo.setAttribute(
      "aPhase",
      new THREE.BufferAttribute(
        phases,
        1
      )
    );

    geo.setAttribute(
      "aSize",
      new THREE.BufferAttribute(
        sizes,
        1
      )
    );

    geo.setAttribute(
      "aBrightness",
      new THREE.BufferAttribute(
        brightness,
        1
      )
    );

    return geo;
  }, [count, radius]);

  const uniforms = useMemo(
    () => ({
      uTime: {
        value: 0,
      },
    }),
    []
  );

  useFrame((state) => {
    if (group.current) {
      group.current.position.copy(
        camera.position
      );
    }

    if (material.current) {
      material.current.uniforms
        .uTime.value =
        state.clock.elapsedTime;
    }
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <group ref={group}>
      <points
        geometry={geometry}
        frustumCulled={false}
      >
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
          vertexShader={`
            attribute float aPhase;
            attribute float aSize;
            attribute float aBrightness;

            uniform float uTime;

            varying float vBrightness;
            varying float vTwinkle;

            void main() {
              vec4 mvPosition =
                modelViewMatrix *
                vec4(position, 1.0);

              float wave =
                0.5 +
                0.5 *
                sin(
                  uTime * 1.15 +
                  aPhase
                );

              float twinkleMask =
                step(
                  5.15,
                  aPhase
                );

              float twinkle =
                mix(
                  1.0,
                  mix(
                    0.72,
                    1.12,
                    wave
                  ),
                  twinkleMask
                );

              vBrightness =
                aBrightness;

              vTwinkle =
                twinkle;

              gl_PointSize =
                aSize *
                twinkle;

              gl_Position =
                projectionMatrix *
                mvPosition;
            }
          `}
          fragmentShader={`
            varying float vBrightness;
            varying float vTwinkle;

            void main() {
              vec2 p =
                gl_PointCoord -
                vec2(0.5);

              float d =
                length(p);

              if (d > 0.5) {
                discard;
              }

              float core =
                1.0 -
                smoothstep(
                  0.0,
                  0.15,
                  d
                );

              float glow =
                1.0 -
                smoothstep(
                  0.08,
                  0.5,
                  d
                );

              float alpha =
                (
                  core * 0.92 +
                  glow * 0.32
                ) *
                vBrightness *
                vTwinkle;

              vec3 color =
                mix(
                  vec3(
                    0.76,
                    0.86,
                    1.0
                  ),
                  vec3(1.0),
                  core
                );

              gl_FragColor =
                vec4(
                  color,
                  alpha
                );
            }
          `}
        />
      </points>
    </group>
  );
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
    if (!group.current) {
      return;
    }

    group.current.position.x +=
      speed * delta;

    if (
      group.current.position.x >
      160
    ) {
      group.current.position.x =
        -160;
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
        (
          [
            x,
            y,
            z,
            radius,
          ],
          index
        ) => (
          <mesh
            key={index}
            position={[
              x,
              y,
              z,
            ]}
          >
            <sphereGeometry
              args={[
                radius,
                18,
                18,
              ]}
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
   CIELO

   IMPORTANTE:
   - De día: gradiente normal en 360 grados.
   - Amanecer/atardecer: naranja sólo hacia el Sol.
   - Lado contrario: mantiene el color base.
========================================================= */

function SkyDome({
  topColor,
  horizonColor,
  sunDirection,
  twilightStrength,
}) {
  const material = useRef();

  const uniforms = useMemo(
    () => ({
      topColor: {
        value:
          new THREE.Color(
            topColor
          ),
      },

      horizonColor: {
        value:
          new THREE.Color(
            horizonColor
          ),
      },

      sunDirection: {
        value:
          new THREE.Vector3(
            ...sunDirection
          ).normalize(),
      },

      twilightStrength: {
        value:
          twilightStrength,
      },

      sunsetColor: {
        value:
          new THREE.Color(
            "#ff713d"
          ),
      },

      sunsetYellow: {
        value:
          new THREE.Color(
            "#ffd38b"
          ),
      },
    }),
    []
  );

  useEffect(() => {
    if (!material.current) {
      return;
    }

    material.current.uniforms
      .topColor.value
      .set(topColor);

    material.current.uniforms
      .horizonColor.value
      .set(horizonColor);

    material.current.uniforms
      .sunDirection.value
      .set(...sunDirection)
      .normalize();

    material.current.uniforms
      .twilightStrength.value =
      twilightStrength;
  }, [
    topColor,
    horizonColor,
    sunDirection,
    twilightStrength,
  ]);

  return (
    <mesh scale={280}>
      <sphereGeometry
        args={[1, 48, 32]}
      />

      <shaderMaterial
        ref={material}
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vDirection;

          void main() {
            vDirection =
              normalize(position);

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(
                position,
                1.0
              );
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 horizonColor;
          uniform vec3 sunDirection;
          uniform float twilightStrength;

          uniform vec3 sunsetColor;
          uniform vec3 sunsetYellow;

          varying vec3 vDirection;

          void main() {
            vec3 direction =
              normalize(vDirection);

            /*
             * CIELO ORIGINAL:
             * horizonte → parte alta.
             *
             * No hay ningún oscurecimiento
             * direccional aquí.
             */

            float heightMix =
              smoothstep(
                -0.08,
                0.72,
                direction.y
              );

            vec3 finalColor =
              mix(
                horizonColor,
                topColor,
                heightMix
              );

            /*
             * Sólo durante amanecer/atardecer
             * añadimos color cálido.
             */

            if (
              twilightStrength >
              0.001
            ) {
              vec2 viewXZ =
                direction.xz;

              vec2 sunXZ =
                sunDirection.xz;

              float viewLength =
                max(
                  length(viewXZ),
                  0.0001
                );

              float sunLength =
                max(
                  length(sunXZ),
                  0.0001
                );

              viewXZ /=
                viewLength;

              sunXZ /=
                sunLength;

              float facingSun =
                dot(
                  viewXZ,
                  sunXZ
                );

              /*
               * El efecto sólo existe
               * cerca del horizonte.
               */

              float horizonBand =
                1.0 -
                smoothstep(
                  0.02,
                  0.58,
                  abs(direction.y)
                );

              /*
               * Naranja localizado
               * hacia el Sol.
               */

              float warmArea =
                smoothstep(
                  0.18,
                  0.92,
                  facingSun
                );

              warmArea =
                pow(
                  warmArea,
                  1.35
                );

              float warmStrength =
                warmArea *
                horizonBand *
                twilightStrength;

              finalColor =
                mix(
                  finalColor,
                  sunsetColor,
                  warmStrength *
                  0.78
                );

              /*
               * Amarillo sólo muy cerca
               * de la posición solar.
               */

              float solarCore =
                smoothstep(
                  0.80,
                  0.995,
                  facingSun
                );

              solarCore =
                pow(
                  solarCore,
                  2.0
                );

              finalColor =
                mix(
                  finalColor,
                  sunsetYellow,
                  solarCore *
                  horizonBand *
                  twilightStrength *
                  0.72
                );
            }

            gl_FragColor =
              vec4(
                finalColor,
                1.0
              );
          }
        `}
      />
    </mesh>
  );
}

/* =========================================================
   TEXTURA PROCEDURAL DEL SOL
========================================================= */

function createSunTexture(
  type = "glow"
) {
  const size = 128;

  const data =
    new Uint8Array(
      size *
      size *
      4
    );

  for (
    let y = 0;
    y < size;
    y++
  ) {
    for (
      let x = 0;
      x < size;
      x++
    ) {
      const nx =
        ((x + 0.5) /
          size) *
          2 -
        1;

      const ny =
        ((y + 0.5) /
          size) *
          2 -
        1;

      const d =
        Math.sqrt(
          nx * nx +
          ny * ny
        );

      let alpha = 0;

      if (
        type === "glow"
      ) {
        alpha =
          Math.pow(
            Math.max(
              0,
              1 - d
            ),
            3.2
          );
      } else {
        const radial =
          Math.max(
            0,
            1 - d
          );

        const horizontal =
          Math.exp(
            -Math.abs(ny) *
              25
          ) *
          Math.max(
            0,
            1 -
              Math.abs(nx)
          );

        const vertical =
          Math.exp(
            -Math.abs(nx) *
              25
          ) *
          Math.max(
            0,
            1 -
              Math.abs(ny)
          );

        const diagonalA =
          Math.exp(
            -Math.abs(
              nx - ny
            ) *
              18
          ) *
          radial;

        const diagonalB =
          Math.exp(
            -Math.abs(
              nx + ny
            ) *
              18
          ) *
          radial;

        alpha =
          Math.min(
            1,
            Math.pow(
              radial,
              5
            ) *
              0.9 +
              horizontal *
                0.30 +
              vertical *
                0.30 +
              diagonalA *
                0.10 +
              diagonalB *
                0.10
          );
      }

      const index =
        (
          y *
            size +
          x
        ) *
        4;

      data[index] = 255;
      data[index + 1] = 255;
      data[index + 2] = 255;

      data[index + 3] =
        Math.round(
          alpha *
          255
        );
    }
  }

  const texture =
    new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat
    );

  texture.needsUpdate = true;

  texture.magFilter =
    THREE.LinearFilter;

  texture.minFilter =
    THREE.LinearFilter;

  texture.generateMipmaps =
    false;

  return texture;
}

/* =========================================================
   SOL

   IMPORTANTE:
   depthTest está ACTIVADO.
   El Sol NO atraviesa edificios.
========================================================= */

function Sun({
  position,
  altitudeDegrees,
}) {
  const glowMaterial =
    useRef();

  const flareMaterial =
    useRef();

  const { camera } =
    useThree();

  const lowSun =
    altitudeDegrees < 12;

  const glowTexture =
    useMemo(
      () =>
        createSunTexture(
          "glow"
        ),
      []
    );

  const flareTexture =
    useMemo(
      () =>
        createSunTexture(
          "flare"
        ),
      []
    );

  const sunVector =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const cameraDirection =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  useFrame(() => {
    sunVector
      .set(...position)
      .sub(
        camera.position
      )
      .normalize();

    camera.getWorldDirection(
      cameraDirection
    );

    const alignment =
      THREE.MathUtils.clamp(
        cameraDirection.dot(
          sunVector
        ),
        0,
        1
      );

    const flare =
      THREE.MathUtils.smoothstep(
        alignment,
        0.78,
        0.995
      );

    if (
      glowMaterial.current
    ) {
      glowMaterial.current.opacity =
        0.20 +
        flare *
          0.20;
    }

    if (
      flareMaterial.current
    ) {
      flareMaterial.current.opacity =
        flare *
        0.30;
    }
  });

  useEffect(() => {
    return () => {
      glowTexture.dispose();
      flareTexture.dispose();
    };
  }, [
    glowTexture,
    flareTexture,
  ]);

  return (
    <group position={position}>
      {/* CORONA */}

      <sprite
        scale={[
          32,
          32,
          1,
        ]}
      >
        <spriteMaterial
          ref={glowMaterial}
          map={glowTexture}
          color={
            lowSun
              ? "#ffad64"
              : "#fff1ad"
          }
          transparent
          opacity={0.22}
          depthWrite={false}
          depthTest
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />
      </sprite>

      {/* GLARE */}

      <sprite
        scale={[
          48,
          48,
          1,
        ]}
      >
        <spriteMaterial
          ref={flareMaterial}
          map={flareTexture}
          color={
            lowSun
              ? "#ffbe7c"
              : "#fff6cf"
          }
          transparent
          opacity={0}
          depthWrite={false}
          depthTest
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />
      </sprite>

      {/* HALO */}

      <sprite
        scale={[
          15,
          15,
          1,
        ]}
      >
        <spriteMaterial
          map={glowTexture}
          color={
            lowSun
              ? "#ffc177"
              : "#fff7cf"
          }
          transparent
          opacity={0.50}
          depthWrite={false}
          depthTest
          blending={
            THREE.AdditiveBlending
          }
          toneMapped={false}
        />
      </sprite>

      {/* DISCO */}

      <mesh>
        <sphereGeometry
          args={[
            3.6,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color={
            lowSun
              ? "#ffd09a"
              : "#fffce8"
          }
          toneMapped={false}
          depthTest
          depthWrite
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   LUNA
========================================================= */

function Moon({
  position,
  sunPosition,
  daylight,
}) {
  const material =
    useRef();

  const moonVector =
    useMemo(
      () =>
        new THREE.Vector3(
          ...position
        ),
      [position]
    );

  const sunVector =
    useMemo(
      () =>
        new THREE.Vector3(
          ...sunPosition
        ),
      [sunPosition]
    );

  const lightDirection =
    useMemo(
      () =>
        sunVector
          .clone()
          .sub(
            moonVector
          )
          .normalize(),
      [
        moonVector,
        sunVector,
      ]
    );

  const uniforms =
    useMemo(
      () => ({
        lightDirection: {
          value:
            lightDirection.clone(),
        },

        daylight: {
          value:
            daylight,
        },
      }),
      []
    );

  useEffect(() => {
    if (!material.current) {
      return;
    }

    material.current.uniforms
      .lightDirection.value
      .copy(
        lightDirection
      );

    material.current.uniforms
      .daylight.value =
      daylight;
  }, [
    lightDirection,
    daylight,
  ]);

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry
          args={[
            6,
            24,
            24,
          ]}
        />

        <meshBasicMaterial
          color="#b9ccf2"
          transparent
          opacity={
            daylight > 0.5
              ? 0.018
              : 0.055
          }
          depthWrite={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            4.1,
            48,
            48,
          ]}
        />

        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={`
            varying vec3 vNormalWorld;
            varying vec3 vPosition;

            void main() {
              vNormalWorld =
                normalize(
                  mat3(modelMatrix) *
                  normal
                );

              vPosition =
                position;

              gl_Position =
                projectionMatrix *
                modelViewMatrix *
                vec4(
                  position,
                  1.0
                );
            }
          `}
          fragmentShader={`
            uniform vec3 lightDirection;
            uniform float daylight;

            varying vec3 vNormalWorld;
            varying vec3 vPosition;

            void main() {
              vec3 normal =
                normalize(
                  vNormalWorld
                );

              float sunlight =
                dot(
                  normal,
                  normalize(
                    lightDirection
                  )
                );

              float lit =
                smoothstep(
                  -0.035,
                  0.045,
                  sunlight
                );

              float craterA =
                sin(
                  vPosition.x *
                    4.1 +
                  vPosition.y *
                    2.7
                );

              float craterB =
                sin(
                  vPosition.z *
                    5.3 -
                  vPosition.y *
                    3.4
                );

              float surface =
                0.92 +
                (
                  craterA *
                  craterB
                ) *
                0.055;

              vec3 darkSide =
                vec3(
                  0.065,
                  0.075,
                  0.095
                );

              vec3 lightSide =
                vec3(
                  0.82,
                  0.84,
                  0.80
                ) *
                surface;

              darkSide =
                mix(
                  darkSide,
                  vec3(
                    0.18,
                    0.20,
                    0.22
                  ),
                  daylight *
                    0.45
                );

              vec3 finalColor =
                mix(
                  darkSide,
                  lightSide,
                  lit
                );

              gl_FragColor =
                vec4(
                  finalColor,
                  1.0
                );
            }
          `}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   CIELO DINÁMICO
========================================================= */

export default function DynamicSky({
  testHour = null,
}) {
  const [now, setNow] =
    useState(
      () => new Date()
    );

  const [
    location,
    setLocation,
  ] = useState({
    latitude:
      FALLBACK_LATITUDE,

    longitude:
      FALLBACK_LONGITUDE,

    precise: false,
  });

  /* =======================================================
     RELOJ
  ======================================================= */

  useEffect(() => {
    const timer =
      setInterval(
        () => {
          setNow(
            new Date()
          );
        },
        15000
      );

    return () =>
      clearInterval(
        timer
      );
  }, []);

  /* =======================================================
     UBICACIÓN
  ======================================================= */

  useEffect(() => {
    if (
      !navigator.geolocation
    ) {
      return;
    }

    navigator.geolocation
      .getCurrentPosition(
        (position) => {
          setLocation({
            latitude:
              position.coords
                .latitude,

            longitude:
              position.coords
                .longitude,

            precise: true,
          });
        },

        () => {},

        {
          enableHighAccuracy:
            false,

          timeout: 10000,

          maximumAge:
            1000 *
            60 *
            60,
        }
      );
  }, []);

  /* =======================================================
     HORA EFECTIVA
  ======================================================= */

  const effectiveNow =
    useMemo(
      () => {
        if (
          testHour === null ||
          testHour === undefined
        ) {
          return now;
        }

        const simulated =
          new Date(now);

        simulated.setHours(
          testHour,
          0,
          0,
          0
        );

        return simulated;
      },
      [
        now,
        testHour,
      ]
    );

  /* =======================================================
     SOL Y LUNA
  ======================================================= */

  const sunAstronomical =
    getSunPosition(
      effectiveNow,
      location.latitude,
      location.longitude
    );

  const moonAstronomical =
    getMoonPosition(
      effectiveNow,
      location.latitude,
      location.longitude
    );

  const sunDegrees =
    sunAstronomical.altitude /
    RAD;

  const moonDegrees =
    moonAstronomical.altitude /
    RAD;

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

  const sunDirection =
    new THREE.Vector3(
      ...sunPosition
    )
      .normalize()
      .toArray();

  const sunVisible =
    sunDegrees > -1.5;

  const moonVisible =
    moonDegrees > -1;

  /* =======================================================
     DÍA / CREPÚSCULO

     Recuperamos la progresión original.
  ======================================================= */

  const daylight =
    THREE.MathUtils.clamp(
      (sunDegrees + 6) /
        18,
      0,
      1
    );

  const twilight =
    THREE.MathUtils.clamp(
      (sunDegrees + 12) /
        12,
      0,
      1
    );

  /*
   * ÚNICO CAMBIO DE COMPORTAMIENTO:
   *
   * El efecto direccional sólo vive
   * cerca del amanecer/atardecer.
   *
   * A +6 grados desaparece completamente.
   */

  let twilightDirectionalStrength =
    0;

  if (
    sunDegrees >= -10 &&
    sunDegrees <= 0
  ) {
    twilightDirectionalStrength =
      THREE.MathUtils.smoothstep(
        sunDegrees,
        -10,
        0
      );
  } else if (
    sunDegrees > 0 &&
    sunDegrees < 6
  ) {
    twilightDirectionalStrength =
      1 -
      THREE.MathUtils.smoothstep(
        sunDegrees,
        0,
        6
      );
  }

  twilightDirectionalStrength =
    THREE.MathUtils.clamp(
      twilightDirectionalStrength,
      0,
      1
    );

  /* =======================================================
     COLORES ORIGINALES
  ======================================================= */

  const nightTop =
    new THREE.Color(
      "#01040d"
    );

  const nightHorizon =
    new THREE.Color(
      "#0b1429"
    );

  const dawnTop =
    new THREE.Color(
      "#315d88"
    );

  /*
   * IMPORTANTE:
   *
   * El horizonte base NO es naranja.
   *
   * Si usáramos naranja aquí,
   * aparecería naranja en los 360 grados.
   *
   * El naranja lo añade SkyDome
   * solamente mirando hacia el Sol.
   */

  const dawnHorizon =
    new THREE.Color(
      "#728da6"
    );

  const dayTop =
    new THREE.Color(
      "#168ee0"
    );

  const dayHorizon =
    new THREE.Color(
      "#a9dcf7"
    );

  let topColor;
  let horizonColor;

  /* =======================================================
     NOCHE → AMANECER
  ======================================================= */

  if (
    sunDegrees <= -6
  ) {
    topColor =
      nightTop
        .clone()
        .lerp(
          dawnTop,
          twilight
        );

    horizonColor =
      nightHorizon
        .clone()
        .lerp(
          dawnHorizon,
          twilight
        );
  }

  /* =======================================================
     AMANECER → DÍA
  ======================================================= */

  else {
    topColor =
      dawnTop
        .clone()
        .lerp(
          dayTop,
          daylight
        );

    horizonColor =
      dawnHorizon
        .clone()
        .lerp(
          dayHorizon,
          daylight
        );
  }

  /* =======================================================
     ILUMINACIÓN ORIGINAL
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
     LUNA / FASE
  ======================================================= */

  const sunDirectionVector =
    new THREE.Vector3(
      ...sunPosition
    ).normalize();

  const moonDirectionVector =
    new THREE.Vector3(
      ...moonPosition
    ).normalize();

  const elongation =
    Math.acos(
      THREE.MathUtils.clamp(
        sunDirectionVector.dot(
          moonDirectionVector
        ),
        -1,
        1
      )
    );

  const moonIllumination =
    (
      1 -
      Math.cos(
        elongation
      )
    ) /
    2;

  const moonLightIntensity =
    THREE.MathUtils.lerp(
      0.015,
      0.26,
      moonIllumination
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* FONDO */}

      <color
        attach="background"
        args={[
          `#${topColor.getHexString()}`,
        ]}
      />

      {/* CIELO */}

      <SkyDome
        topColor={
          `#${topColor.getHexString()}`
        }
        horizonColor={
          `#${horizonColor.getHexString()}`
        }
        sunDirection={
          sunDirection
        }
        twilightStrength={
          twilightDirectionalStrength
        }
      />

      {/* NIEBLA */}

      <fog
        attach="fog"
        args={[
          `#${horizonColor.getHexString()}`,
          170,
          360,
        ]}
      />

      {/* ESTRELLAS */}

      {showStars && (
        <StarField
          count={4200}
          radius={245}
        />
      )}

      {/* SOL */}

      {sunVisible && (
        <Sun
          position={
            sunPosition
          }
          altitudeDegrees={
            sunDegrees
          }
        />
      )}

      {/* LUNA */}

      {moonVisible && (
        <Moon
          position={
            moonPosition
          }
          sunPosition={
            sunPosition
          }
          daylight={
            daylight
          }
        />
      )}

      {/* NUBES */}

      <CloudBank
        position={[
          -105,
          44,
          -85,
        ]}
        scale={1.3}
        speed={0.5}
        opacity={
          0.55 +
          daylight *
            0.27
        }
      />

      <CloudBank
        position={[
          -15,
          55,
          -120,
        ]}
        scale={0.95}
        speed={0.32}
        opacity={
          0.5 +
          daylight *
            0.3
        }
      />

      <CloudBank
        position={[
          75,
          39,
          -75,
        ]}
        scale={1.15}
        speed={0.42}
        opacity={
          0.55 +
          daylight *
            0.27
        }
      />

      <CloudBank
        position={[
          120,
          60,
          -145,
        ]}
        scale={0.75}
        speed={0.25}
        opacity={
          0.48 +
          daylight *
            0.3
        }
      />

      {/* LUZ SOLAR */}

      {sunDegrees > -5 && (
        <directionalLight
          position={
            sunPosition
          }
          intensity={
            sunIntensity
          }
          color={
            sunDegrees < 10
              ? "#ffd09b"
              : "#fff6e2"
          }
          castShadow
          shadow-mapSize-width={
            1024
          }
          shadow-mapSize-height={
            1024
          }
          shadow-camera-near={1}
          shadow-camera-far={260}
          shadow-camera-left={-120}
          shadow-camera-right={120}
          shadow-camera-top={120}
          shadow-camera-bottom={-120}
        />
      )}

      {/* LUZ LUNAR */}

      {moonVisible &&
        sunDegrees < -2 && (
          <directionalLight
            position={
              moonPosition
            }
            intensity={
              moonLightIntensity
            }
            color="#9ebbe8"
          />
        )}

      {/* LUZ GENERAL ORIGINAL */}

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
        intensity={
          ambientIntensity
        }
      />
    </>
  );
}
