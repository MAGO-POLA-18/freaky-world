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
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

import {
  playerInput,
  playerRuntime,
} from "../World/PlayerController";

/* =========================================================
   CONFIGURACIÓN GENERAL

   Dejamos de usar los 60 x 70 m como una única exposición.

   Dentro de la gran carcasa creamos una sala más humana:

   ancho aproximado: 37 m
   largo aproximado: 52 m
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
    "Esta es la primera prueba de una ficha 2D integrada dentro de Freaky World. Después esta información llegará directamente desde Freaky Ranking.",

  video:
    "https://www.youtube.com/embed/QiIebY4wmWg?rel=0",

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

    ref.current.instanceMatrix.needsUpdate =
      true;

    ref.current.computeBoundingSphere?.();
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
      castShadow={castShadow}
      receiveShadow={receiveShadow}
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
        roughness={roughness}
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={
          emissiveIntensity
        }
      />
    </instancedMesh>
  );
}

/* =========================================================
   ESTACIÓN NORMAL

   Escala humana.

   Altura total aproximada:
   3,2 m

   Ya no son torres gigantes.
========================================================= */

function GameStation({
  position,
  rotation = 0,
  rank,
}) {
  const colors = [
    "#e6b84c",
    "#bbc3ca",
    "#b87b50",
    "#659fc8",
    "#789c73",
  ];

  const accent =
    colors[
      Math.min(
        rank - 1,
        colors.length - 1
      )
    ];

  return (
    <group
      position={position}
      rotation={[
        0,
        rotation,
        0,
      ]}
    >
      {/* BASE */}

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

      {/* SOPORTE */}

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

      {/* PANTALLA */}

      <RoundedBox
        position={[
          0,
          2.45,
          0.04,
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
          color="#11171b"
          emissive="#183044"
          emissiveIntensity={0.32}
          roughness={0.26}
        />
      </RoundedBox>

      {/* ACENTO */}

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
   TOP 1 INTERACTIVO

   YA NO DEPENDE DE HOVER.

   Detectamos físicamente si el jugador está cerca.
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
     DETECCIÓN DE PROXIMIDAD
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

    /*
      Aproximadamente 4,5 metros.

      Suficiente para que aparezca antes
      de chocarnos con la estación.
    */

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

      {/* PANTALLA */}

      <RoundedBox
        position={[
          0,
          2.9,
          0.05,
        ]}
        args={[
          3,
          1.8,
          0.18,
        ]}
        radius={0.18}
        smoothness={4}
      >
        <meshStandardMaterial
          color={
            near
              ? "#193d55"
              : "#11191f"
          }
          emissive="#24658b"
          emissiveIntensity={
            near
              ? 0.95
              : 0.35
          }
          roughness={0.24}
        />
      </RoundedBox>

      {/* LÍNEA ORO */}

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

      {/* ===================================================
          BOTÓN DE PROXIMIDAD

          Esto funciona mucho mejor en móvil.
      =================================================== */}

      {near && (
        <Html
          position={[
            0,
            4.35,
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

            onClick={(
              event
            ) => {
              event.stopPropagation();

              onOpen();
            }}

            style={{
              border:
                "1px solid rgba(255,255,255,0.24)",

              borderRadius:
                "999px",

              padding:
                "11px 17px",

              background:
                "rgba(10,15,19,0.94)",

              color:
                "#ffffff",

              fontSize:
                "13px",

              fontWeight:
                800,

              letterSpacing:
                "0.06em",

              whiteSpace:
                "nowrap",

              boxShadow:
                "0 8px 30px rgba(0,0,0,0.4)",

              cursor:
                "pointer",

              touchAction:
                "manipulation",
            }}
          >
            ABRIR FICHA
          </button>
        </Html>
      )}

      {/* HALO */}

      {near && (
        <pointLight
          position={[
            0,
            2.4,
            1.4,
          ]}
          color="#63b9ec"
          intensity={9}
          distance={7}
          decay={2}
        />
      )}
    </group>
  );
}

/* =========================================================
   FICHA 2D
========================================================= */

function GameDetailOverlay({
  game,
  onClose,
}) {
  useEffect(() => {
    playerInput.uiLocked =
      true;

    return () => {
      playerInput.uiLocked =
        false;
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

  return (
    <Html
      fullscreen
      zIndexRange={[
        1000,
        1000,
      ]}
    >
      <div
        onPointerDown={
          onClose
        }
        style={{
          position:
            "fixed",

          inset:
            0,

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          boxSizing:
            "border-box",

          padding:
            "14px",

          background:
            "rgba(3,7,10,0.82)",

          backdropFilter:
            "blur(9px)",

          WebkitBackdropFilter:
            "blur(9px)",
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
              "92vh",

            overflow:
              "auto",

            borderRadius:
              "20px",

            background:
              "#101519",

            border:
              "1px solid rgba(255,255,255,0.13)",

            color:
              "#ffffff",

            boxShadow:
              "0 30px 100px rgba(0,0,0,0.65)",

            fontFamily:
              "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* CERRAR */}

          <button
            type="button"
            onClick={
              onClose
            }
            style={{
              position:
                "absolute",

              right:
                "12px",

              top:
                "12px",

              zIndex:
                10,

              width:
                "40px",

              height:
                "40px",

              border:
                "1px solid rgba(255,255,255,0.18)",

              borderRadius:
                "50%",

              background:
                "rgba(7,10,12,0.9)",

              color:
                "#fff",

              fontSize:
                "23px",
            }}
          >
            ×
          </button>

          {/* VIDEO */}

          <div
            style={{
              width:
                "100%",

              aspectRatio:
                "16 / 9",

              overflow:
                "hidden",

              background:
                "#000",

              borderRadius:
                "20px 20px 0 0",
            }}
          >
            <iframe
              src={
                game.video
              }
              title={
                game.title
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                display:
                  "block",

                width:
                  "100%",

                height:
                  "100%",

                border:
                  0,
              }}
            />
          </div>

          {/* INFORMACIÓN */}

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

                fontWeight:
                  800,

                fontSize:
                  "12px",

                letterSpacing:
                  "0.1em",

                marginBottom:
                  "7px",
              }}
            >
              POPULARES HOY · Nº 1
            </div>

            <h1
              style={{
                margin:
                  0,

                fontSize:
                  "clamp(25px, 5vw, 42px)",
              }}
            >
              {game.title}
            </h1>

            <div
              style={{
                marginTop:
                  "7px",

                color:
                  "#aeb8bf",
              }}
            >
              {game.developer}
            </div>

            <div
              style={{
                display:
                  "flex",

                flexWrap:
                  "wrap",

                gap:
                  "7px",

                marginTop:
                  "17px",
              }}
            >
              {[
                game.year,
                game.platform,
              ].map(
                (
                  text
                ) => (
                  <span
                    key={text}
                    style={{
                      padding:
                        "7px 10px",

                      borderRadius:
                        "999px",

                      background:
                        "#242b30",

                      color:
                        "#d7dbde",

                      fontSize:
                        "13px",
                    }}
                  >
                    {text}
                  </span>
                )
              )}
            </div>

            <p
              style={{
                color:
                  "#b9c1c7",

                lineHeight:
                  1.55,

                margin:
                  "18px 0 0",
              }}
            >
              {game.description}
            </p>

            <div
              style={{
                display:
                  "flex",

                gap:
                  "9px",

                flexWrap:
                  "wrap",

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
                    "11px 15px",

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
                    "1px solid rgba(255,255,255,.16)",

                  borderRadius:
                    "11px",

                  padding:
                    "11px 15px",

                  background:
                    "transparent",

                  color:
                    "#fff",
                }}
              >
                Volver al mundo
              </button>
            </div>
          </div>
        </div>
      </div>
    </Html>
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

     Creamos una sala más pequeña dentro del ala.
  ======================================================= */

  const interiorWalls =
    useMemo(
      () => [
        /* IZQUIERDA */

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

        /* DERECHA */

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

        /* FONDO */

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
     FRANJAS DECORATIVAS
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
     PISTA CENTRAL
  ======================================================= */

  const centralPath =
    useMemo(
      () => [
        {
          position: [
            0,
            0.34,
            1,
          ],

          scale: [
            5.5,
            0.05,
            48,
          ],
        },
      ],
      []
    );

  /* =======================================================
     ESTACIONES

     Mucho más cerca unas de otras.
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
     LUCES VISUALES
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
          SALA CLARA
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
          PISTA CENTRAL
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

          Dos pilares y dintel.
          Centro completamente libre.
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
          LUCES DE TECHO VISUALES
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
          ILUMINACIÓN REAL

          Tres luces bastan para esta sala más pequeña.
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
          ESTACIONES NORMALES
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
          TOP 1 INTERACTIVO
      =================================================== */}

      <FeaturedStation
        onOpen={() => {
          setSelectedGame(
            FEATURED_GAME
          );
        }}
      />

      {/* ===================================================
          PANEL DEL FONDO
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
          COLISIONES MOBILIARIO
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
          FICHA
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
