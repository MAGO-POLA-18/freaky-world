"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import * as THREE from "three";

import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/addons/renderers/CSS3DRenderer.js";

import {
  getYouTubeId,
} from "./featuredVideoConfig";

/* =========================================================
   PANTALLA
========================================================= */

const PLAYER_WIDTH =
  1280;

const PLAYER_HEIGHT =
  720;

/*
  Tamaño físico exacto
  de la pantalla WebGL.
*/

const SCREEN_WIDTH =
  22.5;

const SCREEN_HEIGHT =
  12.65;

/*
  HeroVideoWall:
  group z = -33.72
  pantalla z local = +0.28

  Resultado:
  -33.44

  Dejamos el CSS3D apenas por delante.
*/

const SCREEN_POSITION = [
  0,
  7.2,
  -33.40,
];

/* =========================================================
   CARGAR API YOUTUBE

   Una sola Promise global.
========================================================= */

function loadYouTubeApi() {
  if (
    typeof window ===
    "undefined"
  ) {
    return Promise.reject(
      new Error(
        "YouTube API no disponible."
      )
    );
  }

  if (
    window.YT?.Player
  ) {
    return Promise.resolve(
      window.YT
    );
  }

  if (
    window
      .__freakyYouTubeApiPromise
  ) {
    return window
      .__freakyYouTubeApiPromise;
  }

  window
    .__freakyYouTubeApiPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {
        const previousCallback =
          window
            .onYouTubeIframeAPIReady;

        window
          .onYouTubeIframeAPIReady =
          () => {
            try {
              previousCallback?.();
            } catch {
              // nada
            }

            if (
              window.YT
                ?.Player
            ) {
              resolve(
                window.YT
              );

              return;
            }

            reject(
              new Error(
                "La API de YouTube cargó pero YT.Player no existe."
              )
            );
          };

        const existing =
          document
            .getElementById(
              "youtube-iframe-api"
            );

        if (
          existing
        ) {
          /*
            Ya existe el script.
            Esperamos que llame al callback.
          */

          return;
        }

        const script =
          document
            .createElement(
              "script"
            );

        script.id =
          "youtube-iframe-api";

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async =
          true;

        script.onerror =
          () => {
            reject(
              new Error(
                "No se pudo descargar la API de YouTube."
              )
            );
          };

        document.head
          .appendChild(
            script
          );
      }
    );

  return window
    .__freakyYouTubeApiPromise;
}

/* =========================================================
   COMPONENTE
========================================================= */

const YouTubeScreen3D =
  forwardRef(
    function YouTubeScreen3D(
      {
        url,
        portalRef,
        visible = true,

        onStatusChange,
        onPlayingChange,
        onTimeChange,
        onError,
      },
      ref
    ) {
      const {
        camera,
        size,
      } =
        useThree();

      const rendererRef =
        useRef(null);

      const cssSceneRef =
        useRef(null);

      const cssObjectRef =
        useRef(null);

      const playerRef =
        useRef(null);

      const playerReadyRef =
        useRef(false);

      const intervalRef =
        useRef(null);

      const youtubeId =
        useMemo(
          () =>
            getYouTubeId(
              url
            ),
          [
            url,
          ]
        );

      /* =====================================================
         API PÚBLICA PARA WORLDSCENE
      ===================================================== */

      useImperativeHandle(
        ref,
        () => ({
          isReady() {
            return (
              playerReadyRef
                .current &&
              Boolean(
                playerRef
                  .current
              )
            );
          },

          play() {
            if (
              !playerReadyRef
                .current ||
              !playerRef.current
            ) {
              return false;
            }

            try {
              playerRef.current
                .playVideo();

              return true;
            } catch (
              error
            ) {
              console.error(
                "FREAKY YOUTUBE PLAY:",
                error
              );

              return false;
            }
          },

          pause() {
            if (
              !playerRef.current
            ) {
              return false;
            }

            try {
              playerRef.current
                .pauseVideo();

              return true;
            } catch {
              return false;
            }
          },

          seekBy(
            seconds
          ) {
            const player =
              playerRef.current;

            if (
              !player ||
              !playerReadyRef
                .current
            ) {
              return false;
            }

            try {
              const current =
                player
                  .getCurrentTime() ||
                0;

              const duration =
                player
                  .getDuration() ||
                0;

              const next =
                THREE.MathUtils
                  .clamp(
                    current +
                      Number(
                        seconds
                      ),
                    0,
                    duration >
                      0
                      ? duration
                      : current +
                        Math.abs(
                          seconds
                        )
                  );

              player.seekTo(
                next,
                true
              );

              return true;
            } catch {
              return false;
            }
          },

          seekTo(
            seconds
          ) {
            const player =
              playerRef.current;

            if (
              !player ||
              !playerReadyRef
                .current
            ) {
              return false;
            }

            try {
              const duration =
                player
                  .getDuration() ||
                0;

              const target =
                Math.max(
                  0,
                  Number(
                    seconds
                  ) ||
                    0
                );

              player.seekTo(
                duration >
                  0
                  ? Math.min(
                      duration,
                      target
                    )
                  : target,
                true
              );

              return true;
            } catch {
              return false;
            }
          },
        }),
        []
      );

      /* =====================================================
         CREACIÓN COMPLETA

         IMPORTANTE:

         renderer
            ↓
         CSS3DObject
            ↓
         host
            ↓
         API YouTube
            ↓
         YT.Player

         Todo ocurre dentro del MISMO useEffect.
         No dependemos de hostRef.
      ===================================================== */

      useEffect(() => {
        const portal =
          portalRef
            ?.current;

        if (
          !portal ||
          !youtubeId
        ) {
          return;
        }

        let cancelled =
          false;

        playerReadyRef.current =
          false;

        onStatusChange?.(
          "loading"
        );

        /* ===============================================
           CSS3D RENDERER
        =============================================== */

        const renderer =
          new CSS3DRenderer();

        renderer.setSize(
          size.width,
          size.height
        );

        Object.assign(
          renderer
            .domElement
            .style,
          {
            position:
              "absolute",

            inset:
              "0",

            width:
              "100%",

            height:
              "100%",

            overflow:
              "hidden",

            pointerEvents:
              "none",
          }
        );

        portal.appendChild(
          renderer
            .domElement
        );

        /* ===============================================
           ESCENA CSS3D
        =============================================== */

        const cssScene =
          new THREE.Scene();

        /*
          Contenedor 1280 × 720.
        */

        const screenElement =
          document
            .createElement(
              "div"
            );

        Object.assign(
          screenElement.style,
          {
            width:
              `${PLAYER_WIDTH}px`,

            height:
              `${PLAYER_HEIGHT}px`,

            overflow:
              "hidden",

            background:
              "#000",

            pointerEvents:
              "none",

            backfaceVisibility:
              "hidden",

            WebkitBackfaceVisibility:
              "hidden",

            /*
              Importante para evitar
              bordes raros del iframe.
            */

            lineHeight:
              "0",
          }
        );

        /*
          Host que YouTube sustituirá
          por su iframe.
        */

        const youtubeHost =
          document
            .createElement(
              "div"
            );

        youtubeHost.style.width =
          `${PLAYER_WIDTH}px`;

        youtubeHost.style.height =
          `${PLAYER_HEIGHT}px`;

        screenElement
          .appendChild(
            youtubeHost
          );

        const cssObject =
          new CSS3DObject(
            screenElement
          );

        cssObject.position
          .set(
            ...SCREEN_POSITION
          );

        cssObject.scale
          .set(
            SCREEN_WIDTH /
              PLAYER_WIDTH,

            SCREEN_HEIGHT /
              PLAYER_HEIGHT,

            1
          );

        cssScene.add(
          cssObject
        );

        rendererRef.current =
          renderer;

        cssSceneRef.current =
          cssScene;

        cssObjectRef.current =
          cssObject;

        /* ===============================================
           AHORA YOUTUBE
        =============================================== */

        loadYouTubeApi()
          .then(
            (
              YT
            ) => {
              if (
                cancelled
              ) {
                return;
              }

              onStatusChange?.(
                "creating"
              );

              const player =
                new YT.Player(
                  youtubeHost,
                  {
                    width:
                      PLAYER_WIDTH,

                    height:
                      PLAYER_HEIGHT,

                    videoId:
                      youtubeId,

                    playerVars: {
                      autoplay:
                        0,

                      controls:
                        1,

                      playsinline:
                        1,

                      rel:
                        0,

                      fs:
                        1,

                      disablekb:
                        0,

                      iv_load_policy:
                        3,

                      origin:
                        window
                          .location
                          .origin,
                    },

                    events: {
                      /* =================================
                         LISTO
                      ================================= */

                      onReady(
                        event
                      ) {
                        if (
                          cancelled
                        ) {
                          return;
                        }

                        playerReadyRef
                          .current =
                          true;

                        playerRef.current =
                          event.target;

                        onStatusChange?.(
                          "ready"
                        );

                        onPlayingChange?.(
                          false
                        );

                        try {
                          const iframe =
                            event.target
                              .getIframe();

                          Object.assign(
                            iframe.style,
                            {
                              display:
                                "block",

                              width:
                                `${PLAYER_WIDTH}px`,

                              height:
                                `${PLAYER_HEIGHT}px`,

                              border:
                                "0",

                              margin:
                                "0",

                              padding:
                                "0",

                              pointerEvents:
                                "none",
                            }
                          );
                        } catch {
                          // nada
                        }

                        onTimeChange?.({
                          currentTime:
                            event.target
                              .getCurrentTime?.() ??
                            0,

                          duration:
                            event.target
                              .getDuration?.() ??
                            0,
                        });
                      },

                      /* =================================
                         ESTADO
                      ================================= */

                      onStateChange(
                        event
                      ) {
                        if (
                          cancelled
                        ) {
                          return;
                        }

                        switch (
                          event.data
                        ) {
                          case YT
                            .PlayerState
                            .PLAYING:
                            onStatusChange?.(
                              "playing"
                            );

                            onPlayingChange?.(
                              true
                            );

                            break;

                          case YT
                            .PlayerState
                            .PAUSED:
                            onStatusChange?.(
                              "paused"
                            );

                            onPlayingChange?.(
                              false
                            );

                            break;

                          case YT
                            .PlayerState
                            .BUFFERING:
                            onStatusChange?.(
                              "buffering"
                            );

                            break;

                          case YT
                            .PlayerState
                            .CUED:
                            onStatusChange?.(
                              "ready"
                            );

                            onPlayingChange?.(
                              false
                            );

                            break;

                          case YT
                            .PlayerState
                            .ENDED:
                            try {
                              event.target
                                .seekTo(
                                  0,
                                  true
                                );

                              event.target
                                .pauseVideo();
                            } catch {
                              // nada
                            }

                            onStatusChange?.(
                              "ready"
                            );

                            onPlayingChange?.(
                              false
                            );

                            onTimeChange?.({
                              currentTime:
                                0,

                              duration:
                                event.target
                                  .getDuration?.() ??
                                0,
                            });

                            break;

                          default:
                            break;
                        }
                      },

                      /* =================================
                         ERROR
                      ================================= */

                      onError(
                        event
                      ) {
                        playerReadyRef
                          .current =
                          false;

                        onStatusChange?.(
                          "error"
                        );

                        onPlayingChange?.(
                          false
                        );

                        onError?.(
                          event.data
                        );
                      },

                      /* =================================
                         AUTOPLAY BLOQUEADO
                      ================================= */

                      onAutoplayBlocked() {
                        onStatusChange?.(
                          "ready"
                        );

                        onPlayingChange?.(
                          false
                        );
                      },
                    },
                  }
                );

              playerRef.current =
                player;

              /* =========================================
                 TIEMPO
              ========================================= */

              intervalRef.current =
                window
                  .setInterval(
                    () => {
                      if (
                        cancelled ||
                        !playerReadyRef
                          .current ||
                        !playerRef
                          .current
                      ) {
                        return;
                      }

                      try {
                        onTimeChange?.({
                          currentTime:
                            playerRef
                              .current
                              .getCurrentTime?.() ??
                            0,

                          duration:
                            playerRef
                              .current
                              .getDuration?.() ??
                            0,
                        });
                      } catch {
                        // nada
                      }
                    },
                    300
                  );
            }
          )
          .catch(
            (
              error
            ) => {
              if (
                cancelled
              ) {
                return;
              }

              console.error(
                "FREAKY YOUTUBE LOAD ERROR:",
                error
              );

              playerReadyRef
                .current =
                false;

              onStatusChange?.(
                "error"
              );

              onError?.(
                error
              );
            }
          );

        /* ===============================================
           CLEANUP
        =============================================== */

        return () => {
          cancelled =
            true;

          playerReadyRef.current =
            false;

          if (
            intervalRef.current
          ) {
            window
              .clearInterval(
                intervalRef.current
              );

            intervalRef.current =
              null;
          }

          try {
            playerRef.current
              ?.destroy?.();
          } catch {
            // nada
          }

          playerRef.current =
            null;

          try {
            cssScene.remove(
              cssObject
            );
          } catch {
            // nada
          }

          try {
            screenElement
              .remove();
          } catch {
            // nada
          }

          try {
            renderer
              .domElement
              .remove();
          } catch {
            // nada
          }

          rendererRef.current =
            null;

          cssSceneRef.current =
            null;

          cssObjectRef.current =
            null;
        };
      }, [
        youtubeId,
        portalRef,
        onStatusChange,
        onPlayingChange,
        onTimeChange,
        onError,
      ]);

      /* =====================================================
         RESIZE
      ===================================================== */

      useEffect(() => {
        rendererRef.current
          ?.setSize(
            size.width,
            size.height
          );
      }, [
        size.width,
        size.height,
      ]);

      /* =====================================================
         RENDER

         MISMA cámara que R3F.
      ===================================================== */

      useFrame(() => {
        const renderer =
          rendererRef.current;

        const cssScene =
          cssSceneRef.current;

        const object =
          cssObjectRef.current;

        if (
          !renderer ||
          !cssScene ||
          !object
        ) {
          return;
        }

        /*
          En esta sala la pantalla
          mira hacia +Z.

          Si estamos detrás,
          ocultamos CSS3D.
        */

        const inFront =
          camera.position.z >
          SCREEN_POSITION[2];

        object.visible =
          visible &&
          inFront;

        renderer.render(
          cssScene,
          camera
        );
      });

      return null;
    }
  );

export default YouTubeScreen3D;
