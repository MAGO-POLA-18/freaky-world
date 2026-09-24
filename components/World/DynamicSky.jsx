"use client";

import {
  Stars,
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const SKY_RADIUS =
  220;

const FALLBACK_LATITUDE =
  39.57;

const FALLBACK_LONGITUDE =
  2.65;

const RAD =
  Math.PI /
  180;

const DAY_MS =
  1000 *
  60 *
  60 *
  24;

const J1970 =
  2440588;

const J2000 =
  2451545;

/* =========================================================
   ASTRONOMÍA
========================================================= */

function toJulian(
  date
) {
  return (
    date.valueOf() /
      DAY_MS -
    0.5 +
    J1970
  );
}

function toDays(
  date
) {
  return (
    toJulian(
      date
    ) -
    J2000
  );
}

function rightAscension(
  l,
  b
) {
  const e =
    RAD *
    23.4397;

  return Math.atan2(
    Math.sin(
      l
    ) *
      Math.cos(
        e
      ) -
      Math.tan(
        b
      ) *
        Math.sin(
          e
        ),

    Math.cos(
      l
    )
  );
}

function declination(
  l,
  b
) {
  const e =
    RAD *
    23.4397;

  return Math.asin(
    Math.sin(
      b
    ) *
      Math.cos(
        e
      ) +
      Math.cos(
        b
      ) *
        Math.sin(
          e
        ) *
        Math.sin(
          l
        )
  );
}

function azimuth(
  H,
  phi,
  dec
) {
  return Math.atan2(
    Math.sin(
      H
    ),

    Math.cos(
      H
    ) *
      Math.sin(
        phi
      ) -
      Math.tan(
        dec
      ) *
        Math.cos(
          phi
        )
  );
}

function altitude(
  H,
  phi,
  dec
) {
  return Math.asin(
    Math.sin(
      phi
    ) *
      Math.sin(
        dec
      ) +
      Math.cos(
        phi
      ) *
        Math.cos(
          dec
        ) *
        Math.cos(
          H
        )
  );
}

function siderealTime(
  d,
  lw
) {
  return (
    RAD *
      (
        280.16 +
        360.9856235 *
          d
      ) -
    lw
  );
}

/* =========================================================
   SOL
========================================================= */

function solarMeanAnomaly(
  d
) {
  return (
    RAD *
    (
      357.5291 +
      0.98560028 *
        d
    )
  );
}

function eclipticLongitude(
  M
) {
  const C =
    RAD *
    (
      1.9148 *
        Math.sin(
          M
        ) +
      0.02 *
        Math.sin(
          2 *
            M
        ) +
      0.0003 *
        Math.sin(
          3 *
            M
        )
    );

  const P =
    RAD *
    102.9372;

  return (
    M +
    C +
    P +
    Math.PI
  );
}

function getSunPosition(
  date,
  latitude,
  longitude
) {
  const lw =
    RAD *
    -longitude;

  const phi =
    RAD *
    latitude;

  const d =
    toDays(
      date
    );

  const M =
    solarMeanAnomaly(
      d
    );

  const L =
    eclipticLongitude(
      M
    );

  const dec =
    declination(
      L,
      0
    );

  const ra =
    rightAscension(
      L,
      0
    );

  const H =
    siderealTime(
      d,
      lw
    ) -
    ra;

  return {
    azimuth:
      azimuth(
        H,
        phi,
        dec
      ),

    altitude:
      altitude(
        H,
        phi,
        dec
      ),
  };
}

/* =========================================================
   LUNA
========================================================= */

function moonCoords(
  d
) {
  const L =
    RAD *
    (
      218.316 +
      13.176396 *
        d
    );

  const M =
    RAD *
    (
      134.963 +
      13.064993 *
        d
    );

  const F =
    RAD *
    (
      93.272 +
      13.22935 *
        d
    );

  const l =
    L +
    RAD *
      6.289 *
      Math.sin(
        M
      );

  const b =
    RAD *
    5.128 *
    Math.sin(
      F
    );

  return {
    ra:
      rightAscension(
        l,
        b
      ),

    dec:
      declination(
        l,
        b
      ),
  };
}

function getMoonPosition(
  date,
  latitude,
  longitude
) {
  const lw =
    RAD *
    -longitude;

  const phi =
    RAD *
    latitude;

  const d =
    toDays(
      date
    );

  const coords =
    moonCoords(
      d
    );

  const H =
    siderealTime(
      d,
      lw
    ) -
    coords.ra;

  return {
    azimuth:
      azimuth(
        H,
        phi,
        coords.dec
      ),

    altitude:
      altitude(
        H,
        phi,
        coords.dec
      ),
  };
}

/* =========================================================
   VECTOR 3D
========================================================= */

function celestialToVector(
  position,
  radius = SKY_RADIUS
) {
  const horizontal =
    Math.cos(
      position.altitude
    ) *
    radius;

  return [
    Math.sin(
      position.azimuth
    ) *
      horizontal,

    Math.sin(
      position.altitude
    ) *
      radius,

    -Math.cos(
      position.azimuth
    ) *
      horizontal,
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
  const group =
    useRef();

  useFrame(
    (
      _,
      delta
    ) => {
      if (
        !group.current
      ) {
        return;
      }

      group.current
        .position.x +=
        speed *
        delta;

      if (
        group.current
          .position.x >
        160
      ) {
        group.current
          .position.x =
          -160;
      }
    }
  );

  const pieces =
    useMemo(
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
      position={
        position
      }
      scale={
        scale
      }
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
            key={
              index
            }
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
              opacity={
                opacity
              }
              depthWrite={
                false
              }
            />
          </mesh>
        )
      )}
    </group>
  );
}

/* =========================================================
   CIELO DIRECCIONAL
========================================================= */

function SkyDome({
  topColor,
  horizonColor,
  sunDirection,
  twilightStrength,
}) {
  const material =
    useRef();

  const uniforms =
    useMemo(
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
    if (
      !material.current
    ) {
      return;
    }

    material.current
      .uniforms
      .topColor
      .value
      .set(
        topColor
      );

    material.current
      .uniforms
      .horizonColor
      .value
      .set(
        horizonColor
      );

    material.current
      .uniforms
      .sunDirection
      .value
      .set(
        ...sunDirection
      )
      .normalize();

    material.current
      .uniforms
      .twilightStrength
      .value =
      twilightStrength;
  }, [
    topColor,
    horizonColor,
    sunDirection,
    twilightStrength,
  ]);

  return (
    <mesh
      scale={
        280
      }
    >
      <sphereGeometry
        args={[
          1,
          64,
          40,
        ]}
      />

      <shaderMaterial
        ref={
          material
        }
        side={
          THREE.BackSide
        }
        depthWrite={
          false
        }
        uniforms={
          uniforms
        }
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

          uniform vec3 sunDirection;

          uniform float twilightStrength;

          uniform vec3 sunsetColor;
          uniform vec3 sunsetYellow;

          varying vec3 vWorldPosition;

          void main() {
            vec3 direction =
              normalize(
                vWorldPosition
              );

            float heightMix =
              smoothstep(
                -0.08,
                0.72,
                direction.y
              );

            vec3 baseColor =
              mix(
                horizonColor,
                topColor,
                heightMix
              );

            vec3 horizontalView =
              normalize(
                vec3(
                  direction.x,
                  0.0,
                  direction.z
                )
              );

            vec3 horizontalSun =
              normalize(
                vec3(
                  sunDirection.x,
                  0.0,
                  sunDirection.z
                )
              );

            float facingSun =
              dot(
                horizontalView,
                horizontalSun
              );

            float sunSide =
              smoothstep(
                -0.25,
                0.95,
                facingSun
              );

            float horizonBand =
              1.0 -
              smoothstep(
                0.02,
                0.58,
                abs(
                  direction.y
                )
              );

            float solarGlow =
              pow(
                max(
                  facingSun,
                  0.0
                ),
                5.0
              ) *
              horizonBand *
              twilightStrength;

            float warmArea =
              sunSide *
              horizonBand *
              twilightStrength;

            vec3 finalColor =
              baseColor;

            finalColor =
              mix(
                finalColor,
                sunsetColor,
                warmArea *
                0.72
              );

            finalColor =
              mix(
                finalColor,
                sunsetYellow,
                solarGlow *
                0.88
              );

            float oppositeSide =
              (
                1.0 -
                sunSide
              ) *
              horizonBand *
              twilightStrength;

            vec3 darkOpposite =
              mix(
                finalColor,
                vec3(
                  0.015,
                  0.025,
                  0.055
                ),
                oppositeSide *
                0.58
              );

            finalColor =
              mix(
                finalColor,
                darkOpposite,
                oppositeSide
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
  );
}

/* =========================================================
   SOL
========================================================= */

function Sun({
  position,
  altitudeDegrees,
}) {
  const lowSun =
    altitudeDegrees <
    12;

  return (
    <group
      position={
        position
      }
    >
      <mesh>
        <sphereGeometry
          args={[
            9,
            24,
            24,
          ]}
        />

        <meshBasicMaterial
          color={
            lowSun
              ? "#ffb76a"
              : "#fff1a8"
          }
          transparent
          opacity={
            0.055
          }
          depthWrite={
            false
          }
          toneMapped={
            false
          }
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            6.5,
            24,
            24,
          ]}
        />

        <meshBasicMaterial
          color={
            lowSun
              ? "#ffc47c"
              : "#fff4b8"
          }
          transparent
          opacity={
            0.13
          }
          depthWrite={
            false
          }
          toneMapped={
            false
          }
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            3.9,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color={
            lowSun
              ? "#ffd09a"
              : "#fff9df"
          }
          toneMapped={
            false
          }
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
    if (
      !material.current
    ) {
      return;
    }

    material.current
      .uniforms
      .lightDirection
      .value
      .copy(
        lightDirection
      );

    material.current
      .uniforms
      .daylight
      .value =
      daylight;
  }, [
    lightDirection,
    daylight,
  ]);

  return (
    <group
      position={
        position
      }
    >
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
            daylight >
            0.5
              ? 0.018
              : 0.055
          }
          depthWrite={
            false
          }
          toneMapped={
            false
          }
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
          ref={
            material
          }
          uniforms={
            uniforms
          }
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

export default function DynamicSky() {
  const [
    now,
    setNow,
  ] =
    useState(
      () =>
        new Date()
    );

  const [
    location,
    setLocation,
  ] =
    useState({
      latitude:
        FALLBACK_LATITUDE,

      longitude:
        FALLBACK_LONGITUDE,

      precise:
        false,
    });

  /* =======================================================
     HORA REAL
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
     UBICACIÓN REAL
  ======================================================= */

  useEffect(() => {
    if (
      !navigator.geolocation
    ) {
      return;
    }

    navigator.geolocation
      .getCurrentPosition(
        (
          position
        ) => {
          setLocation({
            latitude:
              position.coords
                .latitude,

            longitude:
              position.coords
                .longitude,

            precise:
              true,
          });
        },

        () => {},

        {
          enableHighAccuracy:
            false,

          timeout:
            10000,

          maximumAge:
            1000 *
            60 *
            60,
        }
      );
  }, []);

  /* =======================================================
     SOL Y LUNA
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

  const sunDegrees =
    sunAstronomical
      .altitude /
    RAD;

  const moonDegrees =
    moonAstronomical
      .altitude /
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
    sunDegrees >
    -1.5;

  const moonVisible =
    moonDegrees >
    -1;

  /* =======================================================
     DÍA / CREPÚSCULO
  ======================================================= */

  const daylight =
    THREE.MathUtils.clamp(
      (
        sunDegrees +
        6
      ) /
        18,
      0,
      1
    );

  const twilight =
    THREE.MathUtils.clamp(
      (
        sunDegrees +
        12
      ) /
        12,
      0,
      1
    );

  const twilightDirectionalStrength =
    THREE.MathUtils.clamp(
      1 -
        Math.abs(
          sunDegrees
        ) /
          16,
      0,
      1
    );

  /* =======================================================
     COLORES
  ======================================================= */

  const nightTop =
    new THREE.Color(
      "#020611"
    );

  const nightHorizon =
    new THREE.Color(
      "#10182c"
    );

  const dawnTop =
    new THREE.Color(
      "#315d88"
    );

  const dawnHorizon =
    new THREE.Color(
      "#e88962"
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

  if (
    sunDegrees <=
    -6
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
  } else {
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
     ILUMINACIÓN
  ======================================================= */

  const sunIntensity =
    THREE.MathUtils.clamp(
      daylight *
        2.1,
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

  const showStars =
    sunDegrees <
    -4;

  /* =======================================================
     BRILLO LUNAR SEGÚN FASE
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
      <color
        attach="background"
        args={[
          `#${topColor.getHexString()}`,
        ]}
      />

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
        <Stars
          radius={
            190
          }
          depth={
            90
          }
          count={
            3200
          }
          factor={
            2.8
          }
          saturation={
            0.08
          }
          fade
          speed={
            0.08
          }
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
        scale={
          1.3
        }
        speed={
          0.5
        }
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
        scale={
          0.95
        }
        speed={
          0.32
        }
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
        scale={
          1.15
        }
        speed={
          0.42
        }
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
        scale={
          0.75
        }
        speed={
          0.25
        }
        opacity={
          0.48 +
          daylight *
            0.3
        }
      />

      {/* SOLAR */}

      {sunDegrees >
        -5 && (
        <directionalLight
          position={
            sunPosition
          }
          intensity={
            sunIntensity
          }
          color={
            sunDegrees <
            10
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
          shadow-camera-near={
            1
          }
          shadow-camera-far={
            260
          }
          shadow-camera-left={
            -120
          }
          shadow-camera-right={
            120
          }
          shadow-camera-top={
            120
          }
          shadow-camera-bottom={
            -120
          }
        />
      )}

      {/* LUNA */}

      {moonVisible &&
        sunDegrees <
          -2 && (
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

      {/* AMBIENTAL */}

      <hemisphereLight
        intensity={
          hemisphereIntensity
        }
        color={
          daylight >
          0.3
            ? "#9bd9ff"
            : "#52668a"
        }
        groundColor={
          daylight >
          0.3
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
