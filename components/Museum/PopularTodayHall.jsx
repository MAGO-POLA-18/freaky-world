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
  RigidBody,
  CuboidCollider,
} from "@react-three/rapier";

import * as THREE from "three";

import {
  playerInput,
} from "../World/PlayerController";

/* =========================================================
   POPULARES HOY

   PRIMERA PRUEBA REAL:

   3D
        ↓
   estación
        ↓
   ficha 2D
        ↓
   video
        ↓
   cerrar
        ↓
   continuar caminando
========================================================= */

/* =========================================================
   JUEGO DE PRUEBA

   Después esto vendrá de Freaky Ranking.
========================================================= */

const FEATURED_GAME = {
  id: "gta-vi",

  rank: 1,

  title:
    "Grand Theft Auto VI",

  subtitle:
    "Rockstar Games",

  year:
    "2026",

  platform:
    "PlayStation 5 · Xbox Series",

  score:
    "—",

  community:
    "Próximamente",

  description:
    "Primera prueba de una ficha de juego integrada dentro de Freaky World. Esta información será reemplazada después por los datos reales de Freaky Ranking.",

  video:
    "https://www.youtube.com/embed/QiIebY4wmWg?rel=0",

  accent:
    "#e5b84e",
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
    if (
      !ref.current
    ) {
      return;
    }

    items.forEach(
      (
        item,
        index
      ) => {
        dummy.position.set(
          ...(
            item.position ??
            [0, 0, 0]
          )
        );

        dummy.rotation.set(
          ...(
            item.rotation ??
            [0, 0, 0]
          )
        );

        dummy.scale.set(
          ...(
            item.scale ??
            [1, 1, 1]
          )
        );

        dummy.updateMatrix();

        ref.current
          .setMatrixAt(
            index,
            dummy.matrix
          );
      }
    );

    ref.current
      .instanceMatrix
      .needsUpdate =
      true;

    ref.current
      .computeBoundingSphere?.();
  }, [
    items,
    dummy,
  ]);

  if (
    !items.length
  ) {
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
   FICHA 2D

   Se renderiza encima del Canvas.

   El mundo sigue detrás.
========================================================= */

function GameDetailOverlay({
  game,
  onClose,
}) {
  /* =======================================================
     BLOQUEAR PERSONAJE

     Mientras está abierta la ficha:
     - no camina
     - no hace dash
     - seguimos dentro de Freaky World
  ======================================================= */

  useEffect(() => {
    playerInput.uiLocked =
      true;

    return () => {
      playerInput.uiLocked =
        false;
    };
  }, []);

  /* =======================================================
     ESC PARA CERRAR
  ======================================================= */

  useEffect(() => {
    const onKeyDown =
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
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        onKeyDown
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
      {/* ===================================================
          FONDO
      =================================================== */}

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

          padding:
            "18px",

          background:
            "rgba(3, 7, 10, 0.78)",

          backdropFilter:
            "blur(10px)",

          WebkitBackdropFilter:
            "blur(10px)",

          boxSizing:
            "border-box",
        }}
      >
        {/* =================================================
            FICHA
        ================================================= */}

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
              "min(960px, 96vw)",

            maxHeight:
              "92vh",

            overflowY:
              "auto",

            borderRadius:
              "22px",

            background:
              "linear-gradient(145deg, #171c21 0%, #0c1014 100%)",

            border:
              "1px solid rgba(255,255,255,0.13)",

            boxShadow:
              "0 30px 100px rgba(0,0,0,0.6)",

            color:
              "#f4f5f6",

            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",

            boxSizing:
              "border-box",
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
            aria-label="Cerrar ficha"
            style={{
              position:
                "absolute",

              top:
                "14px",

              right:
                "14px",

              zIndex:
                20,

              width:
                "42px",

              height:
                "42px",

              borderRadius:
                "50%",

              border:
                "1px solid rgba(255,255,255,0.18)",

              background:
                "rgba(8,12,15,0.82)",

              color:
                "white",

              fontSize:
                "23px",

              cursor:
                "pointer",
            }}
          >
            ×
          </button>

          {/* ===============================================
              VIDEO
          =============================================== */}

          <div
            style={{
              width:
                "100%",

              aspectRatio:
                "16 / 9",

              background:
                "#000",

              borderRadius:
                "22px 22px 0 0",

              overflow:
                "hidden",
            }}
          >
            <iframe
              src={
                game.video
              }
              title={
                `${game.title} trailer`
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                width:
                  "100%",

                height:
                  "100%",

                border:
                  "none",

                display:
                  "block",
              }}
            />
          </div>

          {/* ===============================================
              INFORMACIÓN
          =============================================== */}

          <div
            style={{
              padding:
                "22px",
            }}
          >
            {/* =============================================
                CABECERA
            ============================================= */}

            <div
              style={{
                display:
                  "flex",

                gap:
                  "18px",

                justifyContent:
                  "space-between",

                alignItems:
                  "flex-start",

                flexWrap:
                  "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize:
                      "12px",

                    fontWeight:
                      800,

                    letterSpacing:
                      "0.14em",

                    textTransform:
                      "uppercase",

                    color:
                      game.accent,

                    marginBottom:
                      "7px",
                  }}
                >
                  Popular hoy · Nº {game.rank}
                </div>

                <h1
                  style={{
                    margin:
                      0,

                    fontSize:
                      "clamp(26px, 5vw, 44px)",

                    lineHeight:
                      1.04,
                  }}
                >
                  {game.title}
                </h1>

                <div
                  style={{
                    marginTop:
                      "8px",

                    color:
                      "#aeb7bf",

                    fontSize:
                      "15px",
                  }}
                >
                  {game.subtitle}
                </div>
              </div>

              {/* ===========================================
                  PUNTUACIÓN
              =========================================== */}

              <div
                style={{
                  minWidth:
                    "94px",

                  padding:
                    "13px 16px",

                  borderRadius:
                    "16px",

                  textAlign:
                    "center",

                  background:
                    "rgba(255,255,255,0.06)",

                  border:
                    "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "11px",

                    color:
                      "#8e99a3",

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      "0.08em",
                  }}
                >
                  Puntuación
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",

                    fontSize:
                      "30px",

                    fontWeight:
                      800,

                    color:
                      game.accent,
                  }}
                >
                  {game.score}
                </div>
              </div>
            </div>

            {/* =============================================
                DATOS RÁPIDOS
            ============================================= */}

            <div
              style={{
                display:
                  "flex",

                flexWrap:
                  "wrap",

                gap:
                  "8px",

                marginTop:
                  "20px",
              }}
            >
              {[
                game.year,
                game.platform,
                `Comunidad: ${game.community}`,
              ].map(
                (
                  value
                ) => (
                  <div
                    key={
                      value
                    }
                    style={{
                      padding:
                        "8px 11px",

                      borderRadius:
                        "999px",

                      background:
                        "#252b30",

                      border:
                        "1px solid rgba(255,255,255,0.08)",

                      fontSize:
                        "13px",

                      color:
                        "#d1d6da",
                    }}
                  >
                    {value}
                  </div>
                )
              )}
            </div>

            {/* =============================================
                DESCRIPCIÓN
            ============================================= */}

            <p
              style={{
                margin:
                  "20px 0 0",

                maxWidth:
                  "760px",

                color:
                  "#b8c0c6",

                lineHeight:
                  1.6,

                fontSize:
                  "15px",
              }}
            >
              {game.description}
            </p>

            {/* =============================================
                ACCIONES FUTURAS

                Todavía visuales.
            ============================================= */}

            <div
              style={{
                display:
                  "flex",

                gap:
                  "10px",

                flexWrap:
                  "wrap",

                marginTop:
                  "22px",
              }}
            >
              <button
                type="button"
                style={{
                  padding:
                    "11px 17px",

                  borderRadius:
                    "12px",

                  border:
                    "none",

                  background:
                    game.accent,

                  color:
                    "#101214",

                  fontWeight:
                    800,

                  cursor:
                    "pointer",
                }}
              >
                Ver ficha completa
              </button>

              <button
                type="button"
                style={{
                  padding:
                    "11px 17px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid rgba(255,255,255,0.15)",

                  background:
                    "rgba(255,255,255,0.05)",

                  color:
                    "#f1f3f4",

                  cursor:
                    "pointer",
                }}
              >
                Calificar
              </button>

              <button
                type="button"
                onClick={
                  onClose
                }
                style={{
                  padding:
                    "11px 17px",

                  borderRadius:
                    "12px",

                  border:
                    "1px solid rgba(255,255,255,0.15)",

                  background:
                    "transparent",

                  color:
                    "#c4cbd0",

                  cursor:
                    "pointer",
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
   ESTACIÓN NORMAL
========================================================= */

function GameStation({
  position,
  rotation = 0,
  rank,
}) {
  const hero =
    rank <= 3;

  const colors = [
    "#e5b84e",
    "#bbc4cd",
    "#b97f54",
    "#6d9fca",
    "#6f9872",
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
      <RoundedBox
        position={[
          0,
          0.45,
          0,
        ]}
        args={[
          hero
            ? 5.1
            : 4.6,

          0.7,

          hero
            ? 3
            : 2.7,
        ]}
        radius={0.2}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#252a2e"
          roughness={0.75}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          2.35,
          0,
        ]}
        args={[
          hero
            ? 4.1
            : 3.7,

          3.25,

          0.5,
        ]}
        radius={0.2}
        smoothness={3}
        castShadow
      >
        <meshStandardMaterial
          color="#353a3f"
          roughness={0.7}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          5,
          0.07,
        ]}
        args={[
          hero
            ? 4.6
            : 4.1,

          hero
            ? 3.5
            : 3.2,

          0.22,
        ]}
        radius={0.23}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#11161a"
          emissive="#142631"
          emissiveIntensity={
            hero
              ? 0.45
              : 0.28
          }
          roughness={0.3}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          3.22,
          0.2,
        ]}
        args={[
          3.6,
          0.11,
          0.12,
        ]}
        radius={0.04}
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
========================================================= */

function FeaturedStation({
  onOpen,
}) {
  const [
    hovered,
    setHovered,
  ] =
    useState(false);

  useEffect(() => {
    if (!hovered) {
      return;
    }

    document.body.style.cursor =
      "pointer";

    return () => {
      document.body.style.cursor =
        "";
    };
  }, [
    hovered,
  ]);

  return (
    <group
      position={[
        0,
        0.4,
        -28,
      ]}
    >
      {/* ===============================================
          PEDESTAL
      =============================================== */}

      <RoundedBox
        position={[
          0,
          0.5,
          0,
        ]}
        args={[
          7,
          0.8,
          3.8,
        ]}
        radius={0.25}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#20252a"
          roughness={0.68}
          metalness={0.08}
        />
      </RoundedBox>

      {/* ===============================================
          CUERPO
      =============================================== */}

      <RoundedBox
        position={[
          0,
          2.8,
          0,
        ]}
        args={[
          5.3,
          4.2,
          0.65,
        ]}
        radius={0.3}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#32383d"
          roughness={0.62}
        />
      </RoundedBox>

      {/* ===============================================
          PANTALLA INTERACTIVA

          ESTA ES LA ZONA CLICKEABLE.
      =============================================== */}

      <RoundedBox
        position={[
          0,
          6,
          0.08,
        ]}
        args={[
          6.2,
          4.5,
          0.25,
        ]}
        radius={0.3}
        smoothness={4}

        onPointerEnter={(
          event
        ) => {
          event.stopPropagation();

          setHovered(
            true
          );
        }}

        onPointerLeave={(
          event
        ) => {
          event.stopPropagation();

          setHovered(
            false
          );
        }}

        onClick={(
          event
        ) => {
          event.stopPropagation();

          onOpen();
        }}
      >
        <meshStandardMaterial
          color={
            hovered
              ? "#18354a"
              : "#11191f"
          }
          emissive="#1c4965"
          emissiveIntensity={
            hovered
              ? 0.9
              : 0.4
          }
          roughness={0.24}
          metalness={0.14}
        />
      </RoundedBox>

      {/* ===============================================
          ACENTO ORO
      =============================================== */}

      <RoundedBox
        position={[
          0,
          3.72,
          0.28,
        ]}
        args={[
          4.8,
          0.16,
          0.16,
        ]}
        radius={0.05}
        smoothness={2}
      >
        <meshStandardMaterial
          color={
            FEATURED_GAME
              .accent
          }
          emissive={
            FEATURED_GAME
              .accent
          }
          emissiveIntensity={
            1
          }
        />
      </RoundedBox>

      {/* ===============================================
          HALO AL ACERCARSE / HOVER
      =============================================== */}

      {hovered && (
        <pointLight
          position={[
            0,
            5,
            2,
          ]}
          color="#62b7ec"
          intensity={10}
          distance={8}
          decay={2}
        />
      )}
    </group>
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
     REVESTIMIENTO INTERIOR
  ======================================================= */

  const innerWallItems =
    useMemo(
      () => [
        {
          position: [
            -29.42,
            6.4,
            -2,
          ],

          scale: [
            0.16,
            12,
            61,
          ],
        },

        {
          position: [
            29.42,
            6.4,
            -2,
          ],

          scale: [
            0.16,
            12,
            61,
          ],
        },

        {
          position: [
            0,
            6.4,
            -34.4,
          ],

          scale: [
            58.4,
            12,
            0.16,
          ],
        },
      ],
      []
    );

  /* =======================================================
     PANELES LATERALES
  ======================================================= */

  const wallPanels =
    useMemo(
      () => [
        {
          position: [
            -29.25,
            5,
            16,
          ],

          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            -29.25,
            5,
            0,
          ],

          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            -29.25,
            5,
            -16,
          ],

          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            29.25,
            5,
            16,
          ],

          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            29.25,
            5,
            0,
          ],

          scale: [
            0.14,
            7,
            7,
          ],
        },

        {
          position: [
            29.25,
            5,
            -16,
          ],

          scale: [
            0.14,
            7,
            7,
          ],
        },
      ],
      []
    );

  /* =======================================================
     PASILLO
  ======================================================= */

  const centralPath =
    useMemo(
      () => [
        {
          position: [
            0,
            0.34,
            -1,
          ],

          scale: [
            8,
            0.055,
            61,
          ],
        },
      ],
      []
    );

  /* =======================================================
     RIELES DE LUZ
  ======================================================= */

  const lightRails =
    useMemo(
      () => [
        {
          position: [
            -11,
            11.6,
            16,
          ],

          scale: [
            0.16,
            0.12,
            21,
          ],
        },

        {
          position: [
            11,
            11.6,
            16,
          ],

          scale: [
            0.16,
            0.12,
            21,
          ],
        },

        {
          position: [
            -11,
            11.6,
            -14,
          ],

          scale: [
            0.16,
            0.12,
            31,
          ],
        },

        {
          position: [
            11,
            11.6,
            -14,
          ],

          scale: [
            0.16,
            0.12,
            31,
          ],
        },
      ],
      []
    );

  /* =======================================================
     9 ESTACIONES NORMALES

     El décimo lugar es el TOP 1 interactivo.
  ======================================================= */

  const stations =
    useMemo(
      () => [
        {
          rank: 10,
          position: [
            -15,
            0.4,
            17,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 9,
          position: [
            15,
            0.4,
            17,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 8,
          position: [
            -15,
            0.4,
            6,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 7,
          position: [
            15,
            0.4,
            6,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 6,
          position: [
            -15,
            0.4,
            -6,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 5,
          position: [
            15,
            0.4,
            -6,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 4,
          position: [
            -15,
            0.4,
            -18,
          ],
          rotation:
            Math.PI / 2,
        },

        {
          rank: 3,
          position: [
            15,
            0.4,
            -18,
          ],
          rotation:
            -Math.PI / 2,
        },

        {
          rank: 2,
          position: [
            -14,
            0.4,
            -29,
          ],
          rotation:
            Math.PI / 2,
        },
      ],
      []
    );

  return (
    <group>
      {/* ===================================================
          REVESTIMIENTO CLARO
      =================================================== */}

      <InstancedBoxes
        items={
          innerWallItems
        }
        color="#d8d6d0"
        roughness={0.92}
      />

      {/* ===================================================
          CONTRASTE
      =================================================== */}

      <InstancedBoxes
        items={
          wallPanels
        }
        color="#343a3f"
        roughness={0.8}
      />

      {/* ===================================================
          PASILLO CENTRAL
      =================================================== */}

      <InstancedBoxes
        items={
          centralPath
        }
        color="#34393d"
        roughness={0.72}
      />

      {/* ===================================================
          PORTAL DE ENTRADA
      =================================================== */}

      <RoundedBox
        position={[
          -6,
          3.5,
          27.5,
        ]}
        args={[
          1,
          6.5,
          0.8,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#262b2f"
          roughness={0.72}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          6,
          3.5,
          27.5,
        ]}
        args={[
          1,
          6.5,
          0.8,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#262b2f"
          roughness={0.72}
        />
      </RoundedBox>

      <RoundedBox
        position={[
          0,
          6.55,
          27.5,
        ]}
        args={[
          13,
          0.55,
          0.8,
        ]}
        radius={0.22}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial
          color="#262b2f"
          roughness={0.72}
        />
      </RoundedBox>

      {/* ===================================================
          RIELES LUMINOSOS
      =================================================== */}

      <InstancedBoxes
        items={
          lightRails
        }
        color="#eaf4ff"
        roughness={0.25}
        emissive="#dcecff"
        emissiveIntensity={1.1}
        receiveShadow={false}
      />

      {/* ===================================================
          ILUMINACIÓN
      =================================================== */}

      <pointLight
        position={[
          0,
          10,
          22,
        ]}
        color="#fff1dd"
        intensity={28}
        distance={30}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10,
          7,
        ]}
        color="#edf5ff"
        intensity={30}
        distance={28}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10,
          -9,
        ]}
        color="#edf5ff"
        intensity={30}
        distance={28}
        decay={2}
      />

      <pointLight
        position={[
          0,
          10,
          -25,
        ]}
        color="#deefff"
        intensity={28}
        distance={27}
        decay={2}
      />

      {/* ===================================================
          9 PUESTOS NORMALES
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

          TOCAR / CLICK EN SU PANTALLA.
      =================================================== */}

      <FeaturedStation
        onOpen={() => {
          setSelectedGame(
            FEATURED_GAME
          );
        }}
      />

      {/* ===================================================
          PANEL DE FONDO
      =================================================== */}

      <RoundedBox
        position={[
          0,
          7,
          -34.15,
        ]}
        args={[
          18,
          9,
          0.28,
        ]}
        radius={0.32}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#151a1e"
          emissive="#182c3a"
          emissiveIntensity={0.45}
          roughness={0.45}
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
                2.4,
                0.4,
                1.4,
              ]}
              position={[
                station
                  .position[0],

                0.8,

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

        {/* TOP 1 */}

        <CuboidCollider
          args={[
            3.5,
            0.45,
            1.9,
          ]}
          position={[
            0,
            0.9,
            -28,
          ]}
        />
      </RigidBody>

      {/* ===================================================
          FICHA 2D

          Solo existe mientras está abierta.
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
