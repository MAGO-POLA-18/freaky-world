"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Html,
  RoundedBox,
  useTexture,
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import {
  createPortal,
} from "react-dom";

import * as THREE from "three";

import {
  playerInput,
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const ROOM_HALF_WIDTH = 18.5;

const ROOM_FRONT_Z = 27;
const ROOM_BACK_Z = -25;

/* =========================================================
   JUEGO DE PRUEBA
========================================================= */

const FEATURED_GAME = {
  rank: 1,

  title:
    "Grand Theft Auto VI",

  developer:
    "Rockstar Games",

  platform:
    "PlayStation 5 · Xbox Series",

  year:
    "2026",

  score:
    "—",

  description:
    "Primera prueba de integración entre una exposición 3D y una ficha 2D dentro de Freaky World.",

  video:
    "https://www.youtube.com/embed/QiIebY4wmWg?rel=0",

  thumbnail:
    "https://img.youtube.com/vi/QiIebY4wmWg/maxresdefault.jpg",

  accent:
    "#e6b84c",
};

/* =========================================================
   INSTANCIAS
========================================================= */

function InstancedBoxes({
  items,
  color,
  roughness = 0.8,
  metalness = 0,
  emissive = "#000000",
  emissiveIntensity = 0,
  castShadow = false,
  receiveShadow = true,
}) {
  const ref =
    useRef(null);

  const dummy =
    useMemo(
      () =>
        new THREE.Object3D(),
      []
    );

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    items.forEach(
      (
        item,
        index
      ) => {
        dummy.position.set(
          ...(item.position ??
            [0, 0, 0])
        );

        dummy.rotation.set(
          ...(item.rotation ??
            [0, 0, 0])
        );

        dummy.scale.set(
          ...(item.scale ??
            [1, 1, 1])
        );

        dummy.updateMatrix();

        ref.current.setMatrixAt(
          index,
          dummy.matrix
        );
      }
    );

    ref.current
      .instanceMatrix
      .needsUpdate = true;

    ref.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  if (!items.length) {
    return null;
  }

  return (
    <instancedMesh
      ref={ref}
      args={[
        null,
        null,
        items.length,
      ]}
      castShadow={
        castShadow
      }
      receiveShadow={
        receiveShadow
      }
    >
      <boxGeometry
        args={[
          1,
          1,
          1,
        ]}
      />

      <meshStandardMaterial
        color={color}
        roughness={
          roughness
        }
        metalness={
          metalness
        }
        emissive={
          emissive
        }
        emissiveIntensity={
          emissiveIntensity
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   CARTEL PROCEDURAL PARA ESTACIONES VACÍAS

   Hasta conectar datos reales, evitamos pantallas negras.
========================================================= */

function PlaceholderScreen({
  rank,
}) {
  const accentColors = [
    "#e6b84c",
    "#bbc3ca",
    "#b87b50",
    "#659fc8",
    "#789c73",
  ];

  const accent =
    accentColors[
      Math.min(
        rank - 1,
        accentColors.length - 1
      )
    ];

  return (
    <group>
      {/* fondo */}

      <RoundedBox
        position={[
          0,
          2.45,
          0.05,
        ]}
        args={[
          2.25,
          1.45,
          0.16,
        ]}
        radius={0.15}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#101820"
          emissive={accent}
          emissiveIntensity={0.12}
          roughness={0.3}
        />
      </RoundedBox>

      {/* forma central */}

      <mesh
        position={[
          0,
          2.45,
          0.15,
        ]}
      >
        <planeGeometry
          args={[
            1.65,
            0.92,
          ]}
        />

        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.32}
        />
      </mesh>

      {/* banda */}

      <RoundedBox
        position={[
          0,
          1.62,
          0.13,
        ]}
        args={[
          1.65,
          0.08,
          0.08,
        ]}
        radius={0.03}
        smoothness={2}
      >
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.65}
        />
      </RoundedBox>
    </group>
  );
}

/* =========================================================
   ESTACIÓN NORMAL
========================================================= */

function GameStation({
  position,
  rotation = 0,
  rank,
}) {
  return (
    <group
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
    >
      <RoundedBox
        position={[
          0,
          0.25,
          0,
        ]}
        args={[
          2.6,
          0.35,
          1.35,
        ]}
        radius={0.12}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#262b2f"
          roughness={0.72}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          1.15,
          0,
        ]}
        args={[
          1.75,
          1.55,
          0.32,
        ]}
        radius={0.12}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#363c40"
          roughness={0.68}
        />
      </RoundedBox>

      <PlaceholderScreen
        rank={rank}
      />
    </group>
  );
}

/* =========================================================
   TOP 1
========================================================= */

function FeaturedStation({
  onOpen,
}) {
  const groupRef =
    useRef(null);

  const worldPosition =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const [
    near,
    setNear,
  ] =
    useState(false);

  const nearRef =
    useRef(false);

  /* =======================================================
     THUMBNAIL DE YOUTUBE COMO TEXTURA REAL
  ======================================================= */

  const thumbnail =
    useTexture(
      FEATURED_GAME.thumbnail
    );

  useEffect(() => {
    if (!thumbnail) {
      return;
    }

    thumbnail.colorSpace =
      THREE.SRGBColorSpace;

    thumbnail.anisotropy =
      4;

    thumbnail.needsUpdate =
      true;
  }, [
    thumbnail,
  ]);

  /* =======================================================
     PROXIMIDAD
  ======================================================= */

  useFrame(() => {
    if (
      !groupRef.current ||
      !playerRuntime.body
    ) {
      return;
    }

    groupRef.current.getWorldPosition(
      worldPosition
    );

    const player =
      playerRuntime.body.translation();

    const dx =
      player.x -
      worldPosition.x;

    const dz =
      player.z -
      worldPosition.z;

    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    const isNear =
      distance < 4.5;

    if (
      isNear !==
      nearRef.current
    ) {
      nearRef.current =
        isNear;

      setNear(
        isNear
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0.32,
        -20.5,
      ]}
    >
      {/* BASE */}

      <RoundedBox
        position={[
          0,
          0.3,
          0,
        ]}
        args={[
          3.6,
          0.45,
          1.8,
        ]}
        radius={0.16}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#20262a"
          roughness={0.64}
        />
      </RoundedBox>

      {/* SOPORTE */}

      <RoundedBox
        position={[
          0,
          1.35,
          0,
        ]}
        args={[
          2.4,
          1.75,
          0.4,
        ]}
        radius={0.16}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#343a3f"
          roughness={0.62}
        />
      </RoundedBox>

      {/* ===============================================
          MARCO DE PANTALLA
      =============================================== */}

      <RoundedBox
        position={[
          0,
          2.9,
          0.04,
        ]}
        args={[
          3.15,
          1.95,
          0.17,
        ]}
        radius={0.18}
        smoothness={4}
      >
        <meshStandardMaterial
          color={
            near
              ? "#28566f"
              : "#151b20"
          }
          emissive="#24658b"
          emissiveIntensity={
            near
              ? 0.55
              : 0.12
          }
          roughness={0.28}
        />
      </RoundedBox>

      {/* ===============================================
          IMAGEN REAL
      =============================================== */}

      <mesh
        position={[
          0,
          2.9,
          0.145,
        ]}
      >
        <planeGeometry
          args={[
            2.82,
            1.58,
          ]}
        />

        <meshBasicMaterial
          map={thumbnail}
          toneMapped={false}
        />
      </mesh>

      {/* ===============================================
          OSCURECIDO CUANDO ESTÁ LEJOS
      =============================================== */}

      {!near && (
        <mesh
          position={[
            0,
            2.9,
            0.151,
          ]}
        >
          <planeGeometry
            args={[
              2.82,
              1.58,
            ]}
          />

          <meshBasicMaterial
            color="#000000"
            transparent
            opacity={0.16}
          />
        </mesh>
      )}

      {/* ORO */}

      <RoundedBox
        position={[
          0,
          1.96,
          0.16,
        ]}
        args={[
          2.2,
          0.1,
          0.08,
        ]}
        radius={0.03}
        smoothness={2}
      >
        <meshStandardMaterial
          color={
            FEATURED_GAME.accent
          }
          emissive={
            FEATURED_GAME.accent
          }
          emissiveIntensity={1}
        />
      </RoundedBox>

      {/* ===============================================
          BOTÓN
      =============================================== */}

      {near && (
        <Html
          position={[
            0,
            4.25,
            0.3,
          ]}
          center
          distanceFactor={8}
          zIndexRange={[
            100,
            100,
          ]}
        >
          <button
            type="button"

            onPointerDown={(
              event
            ) => {
              event.stopPropagation();
            }}

            onTouchStart={(
              event
            ) => {
              event.stopPropagation();
            }}

            onClick={(
              event
            ) => {
              event.stopPropagation();

              onOpen();
            }}

            style={{
              border:
                "1px solid rgba(255,255,255,0.28)",

              borderRadius:
                "999px",

              padding:
                "11px 18px",

              background:
                "rgba(8,13,17,0.96)",

              color:
                "#ffffff",

              fontSize:
                "13px",

              fontWeight:
                800,

              letterSpacing:
                "0.05em",

              whiteSpace:
                "nowrap",

              boxShadow:
                "0 8px 30px rgba(0,0,0,0.45)",

              touchAction:
                "manipulation",
            }}
          >
            ABRIR FICHA
          </button>
        </Html>
      )}
    </group>
  );
}

/* =========================================================
   MODAL 2D

   IMPORTANTE:

   YA NO SE RENDERIZA DENTRO DE THREE.JS.

   Se monta directamente en document.body.
========================================================= */

function GameDetailOverlay({
  game,
  onClose,
}) {
  const [
    mounted,
    setMounted,
  ] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    playerInput.uiLocked =
      true;

    playerInput.x = 0;
    playerInput.y = 0;

    playerInput.lookX = 0;
    playerInput.lookY = 0;

    playerInput.dashRequested =
      false;

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      "hidden";

    return () => {
      playerInput.uiLocked =
        false;

      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.lookX = 0;
      playerInput.lookY = 0;

      document.body.style
        .overflow =
        previousOverflow;
    };
  }, []);

  useEffect(() => {
    const keyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      keyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        keyDown
      );
    };
  }, [
    onClose,
  ]);

  if (
    !mounted ||
    typeof document ===
      "undefined"
  ) {
    return null;
  }

  return createPortal(
    <div
      onPointerDown={(
        event
      ) => {
        event.stopPropagation();

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}

      onTouchStart={(
        event
      ) => {
        event.stopPropagation();
      }}

      style={{
        position:
          "fixed",

        inset:
          0,

        zIndex:
          999999,

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        padding:
          "12px",

        boxSizing:
          "border-box",

        background:
          "rgba(2,5,8,0.88)",

        backdropFilter:
          "blur(8px)",

        WebkitBackdropFilter:
          "blur(8px)",

        touchAction:
          "pan-y",
      }}
    >
      <div
        onPointerDown={(
          event
        ) => {
          event.stopPropagation();
        }}

        style={{
          position:
            "relative",

          width:
            "min(880px, 96vw)",

          maxHeight:
            "94vh",

          overflowY:
            "auto",

          WebkitOverflowScrolling:
            "touch",

          borderRadius:
            "20px",

          background:
            "#101519",

          color:
            "#ffffff",

          border:
            "1px solid rgba(255,255,255,0.14)",

          boxShadow:
            "0 30px 100px rgba(0,0,0,0.65)",

          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* ===============================================
            CERRAR
        =============================================== */}

        <button
          type="button"
          onClick={
            onClose
          }
          style={{
            position:
              "absolute",

            top:
              "12px",

            right:
              "12px",

            zIndex:
              20,

            width:
              "42px",

            height:
              "42px",

            border:
              "1px solid rgba(255,255,255,0.22)",

            borderRadius:
              "50%",

            background:
              "rgba(5,8,10,0.9)",

            color:
              "#ffffff",

            fontSize:
              "24px",

            cursor:
              "pointer",
          }}
        >
          ×
        </button>

        {/* ===============================================
            VIDEO

            El propio iframe muestra la miniatura antes
            de que el usuario pulse Play.
        =============================================== */}

        <div
          style={{
            width:
              "100%",

            aspectRatio:
              "16 / 9",

            background:
              "#000",

            overflow:
              "hidden",

            borderRadius:
              "20px 20px 0 0",
          }}
        >
          <iframe
            src={
              game.video
            }
            title={
              `${game.title} trailer`
            }
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              display:
                "block",

              width:
                "100%",

              height:
                "100%",

              border:
                "none",
            }}
          />
        </div>

        {/* ===============================================
            CONTENIDO
        =============================================== */}

        <div
          style={{
            padding:
              "20px",
          }}
        >
          <div
            style={{
              color:
                game.accent,

              fontSize:
                "12px",

              fontWeight:
                800,

              letterSpacing:
                "0.1em",
            }}
          >
            POPULARES HOY · Nº 1
          </div>

          <h1
            style={{
              margin:
                "7px 0 0",

              fontSize:
                "clamp(26px, 5vw, 42px)",

              lineHeight:
                1.05,
            }}
          >
            {game.title}
          </h1>

          <div
            style={{
              marginTop:
                "7px",

              color:
                "#adb7be",

              fontSize:
                "15px",
            }}
          >
            {game.developer}
          </div>

          <div
            style={{
              display:
                "flex",

              gap:
                "7px",

              flexWrap:
                "wrap",

              marginTop:
                "16px",
            }}
          >
            <span
              style={{
                padding:
                  "7px 10px",

                borderRadius:
                  "999px",

                background:
                  "#252c31",

                fontSize:
                  "13px",
              }}
            >
              {game.year}
            </span>

            <span
              style={{
                padding:
                  "7px 10px",

                borderRadius:
                  "999px",

                background:
                  "#252c31",

                fontSize:
                  "13px",
              }}
            >
              {game.platform}
            </span>
          </div>

          <p
            style={{
              margin:
                "17px 0 0",

              color:
                "#bac2c7",

              lineHeight:
                1.55,

              fontSize:
                "15px",
            }}
          >
            {game.description}
          </p>

          <div
            style={{
              display:
                "flex",

              flexWrap:
                "wrap",

              gap:
                "9px",

              marginTop:
                "20px",
            }}
          >
            <button
              type="button"
              style={{
                border:
                  0,

                borderRadius:
                  "11px",

                padding:
                  "11px 16px",

                background:
                  game.accent,

                color:
                  "#111",

                fontWeight:
                  800,
              }}
            >
              Ver ficha completa
            </button>

            <button
              type="button"
              onClick={
                onClose
              }
              style={{
                border:
                  "1px solid rgba(255,255,255,.18)",

                borderRadius:
                  "11px",

                padding:
                  "11px 16px",

                background:
                  "transparent",

                color:
                  "#ffffff",
              }}
            >
              Volver al mundo
            </button>
          </div>
        </div>
      </div>
    </div>,

    document.body
  );
}

/* =========================================================
   SALA
========================================================= */

export default function PopularTodayHall() {
  const [
    selectedGame,
    setSelectedGame,
  ] =
    useState(null);

  /* =======================================================
     PAREDES INTERIORES
  ======================================================= */

  const interiorWalls =
    useMemo(
      () => [
        {
          position: [
            -ROOM_HALF_WIDTH,
            5.5,
            1,
          ],

          scale: [
            0.18,
            10.5,
            ROOM_FRONT_Z -
              ROOM_BACK_Z,
          ],
        },

        {
          position: [
            ROOM_HALF_WIDTH,
            5.5,
            1,
          ],

          scale: [
            0.18,
            10.5,
            ROOM_FRONT_Z -
              ROOM_BACK_Z,
          ],
        },

        {
          position: [
            0,
            5.5,
            ROOM_BACK_Z,
          ],

          scale: [
            ROOM_HALF_WIDTH *
              2,

            10.5,

            0.18,
          ],
        },
      ],
      []
    );

  /* =======================================================
     PANELES
  ======================================================= */

  const darkPanels =
    useMemo(
      () => [
        {
          position: [
            -18.35,
            4.3,
            12,
          ],
          scale: [
            0.12,
            6.2,
            6,
          ],
        },

        {
          position: [
            -18.35,
            4.3,
            -1,
          ],
          scale: [
            0.12,
            6.2,
            6,
          ],
        },

        {
          position: [
            -18.35,
            4.3,
            -14,
          ],
          scale: [
            0.12,
            6.2,
            6,
          ],
        },

        {
          position: [
            18.35,
            4.3,
            12,
          ],
          scale: [
            0.12,
            6.2,
            6,
          ],
        },

        {
          position: [
            18.35,
            4.3,
            -1,
          ],
          scale: [
            0.12,
            6.2,
            6,
          ],
        },

        {
          position: [
            18.35,
            4.3,
            -14,
          ],
          scale: [
            0.12,
            6.2,
            6,
          ],
        },
      ],
      []
    );

  /* =======================================================
     CAMINO
  ======================================================= */

  const centralPath =
    useMemo(
      () => [
        {
          position: [
            0,
            0.36,
            1,
          ],

          scale: [
            5.5,
            0.04,
            48,
          ],
        },
      ],
      []
    );

  /* =======================================================
     ESTACIONES
  ======================================================= */

  const stations =
    useMemo(
      () => [
        {
          rank: 10,
          position: [
            -10.5,
            0.32,
            13,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 9,
          position: [
            10.5,
            0.32,
            13,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 8,
          position: [
            -10.5,
            0.32,
            5,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 7,
          position: [
            10.5,
            0.32,
            5,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 6,
          position: [
            -10.5,
            0.32,
            -3,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 5,
          position: [
            10.5,
            0.32,
            -3,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 4,
          position: [
            -10.5,
            0.32,
            -11,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 3,
          position: [
            10.5,
            0.32,
            -11,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 2,
          position: [
            -10.5,
            0.32,
            -19,
          ],
          rotation:
            Math.PI / 2,
        },
      ],
      []
    );

  /* =======================================================
     LUCES
  ======================================================= */

  const ceilingLights =
    useMemo(
      () => [
        {
          position: [
            -7,
            9.6,
            7,
          ],
          scale: [
            0.12,
            0.1,
            28,
          ],
        },

        {
          position: [
            7,
            9.6,
            7,
          ],
          scale: [
            0.12,
            0.1,
            28,
          ],
        },

        {
          position: [
            -7,
            9.6,
            -16,
          ],
          scale: [
            0.12,
            0.1,
            14,
          ],
        },

        {
          position: [
            7,
            9.6,
            -16,
          ],
          scale: [
            0.12,
            0.1,
            14,
          ],
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          INTERIOR
      =================================================== */}

      <InstancedBoxes
        items={
          interiorWalls
        }
        color="#dedbd3"
        roughness={0.92}
      />

      <InstancedBoxes
        items={
          darkPanels
        }
        color="#343a3e"
        roughness={0.8}
      />

      {/* ===================================================
          PASILLO
      =================================================== */}

      <InstancedBoxes
        items={
          centralPath
        }
        color="#343a3e"
        roughness={0.72}
      />

      {/* ===================================================
          ENTRADA INTERIOR
      =================================================== */}

      <RoundedBox
        position={[
          -4.7,
          3,
          23,
        ]}
        args={[
          0.65,
          5.4,
          0.7,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#292f33"
          roughness={0.7}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          4.7,
          3,
          23,
        ]}
        args={[
          0.65,
          5.4,
          0.7,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#292f33"
          roughness={0.7}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          5.45,
          23,
        ]}
        args={[
          10,
          0.5,
          0.7,
        ]}
        radius={0.18}
        smoothness={3}
      >
        <meshStandardMaterial
          color="#292f33"
          roughness={0.7}
        />
      </RoundedBox>

      {/* ===================================================
          LUCES VISUALES
      =================================================== */}

      <InstancedBoxes
        items={
          ceilingLights
        }
        color="#edf6ff"
        roughness={0.2}
        emissive="#e3f1ff"
        emissiveIntensity={1}
        receiveShadow={false}
      />

      {/* ===================================================
          ILUMINACIÓN
      =================================================== */}

      <pointLight
        position={[
          0,
          8.5,
          15,
        ]}
        color="#fff2df"
        intensity={25}
        distance={23}
        decay={2}
      />

      <pointLight
        position={[
          0,
          8.5,
          -1,
        ]}
        color="#eef6ff"
        intensity={27}
        distance={24}
        decay={2}
      />

      <pointLight
        position={[
          0,
          8.5,
          -18,
        ]}
        color="#e1f0ff"
        intensity={25}
        distance={22}
        decay={2}
      />

      {/* ===================================================
          ESTACIONES
      =================================================== */}

      {stations.map(
        (
          station
        ) => (
          <GameStation
            key={
              station.rank
            }
            {...station}
          />
        )
      )}

      {/* ===================================================
          TOP 1
      =================================================== */}

      <FeaturedStation
        onOpen={() => {
          playerInput.x = 0;
          playerInput.y = 0;

          setSelectedGame(
            FEATURED_GAME
          );
        }}
      />

      {/* ===================================================
          FONDO
      =================================================== */}

      <RoundedBox
        position={[
          0,
          5.5,
          -24.82,
        ]}
        args={[
          11,
          6,
          0.2,
        ]}
        radius={0.28}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#171d21"
          emissive="#193343"
          emissiveIntensity={0.36}
        />
      </RoundedBox>

      {/* ===================================================
          COLISIONES
      =================================================== */}

      <RigidBody
        type="fixed"
        colliders={false}
      >
        {stations.map(
          (
            station
          ) => (
            <CuboidCollider
              key={
                `station-${station.rank}`
              }
              args={[
                1.3,
                0.3,
                0.68,
              ]}
              position={[
                station
                  .position[0],

                0.62,

                station
                  .position[2],
              ]}
              rotation={[
                0,
                station.rotation,
                0,
              ]}
            />
          )
        )}

        <CuboidCollider
          args={[
            1.8,
            0.35,
            0.9,
          ]}
          position={[
            0,
            0.67,
            -20.5,
          ]}
        />
      </RigidBody>

      {/* ===================================================
          MODAL 2D
      =================================================== */}

      {selectedGame && (
        <GameDetailOverlay
          game={
            selectedGame
          }
          onClose={() => {
            setSelectedGame(
              null
            );
          }}
        />
      )}
    </group>
  );
}
