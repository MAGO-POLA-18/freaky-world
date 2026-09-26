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

const PLAYER_WIDTH =
  1280;

const PLAYER_HEIGHT =
  720;

const SCREEN_WIDTH =
  22.5;

const SCREEN_HEIGHT =
  12.65;

/*
  Posición REAL de la pantalla
  dentro de Freaky World.
*/
const SCREEN_POSITION = [
  0,
  7.2,
  -33.38,
];

/* =========================================================
   YOUTUBE API
========================================================= */

function loadYouTubeApi() {
  if (
    typeof window ===
    "undefined"
  ) {
    return Promise.reject(
      new Error(
        "YouTube API solo está disponible en el navegador."
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
    window.__freakyYouTubeApiPromise
  ) {
    return window
      .__freakyYouTubeApiPromise;
  }

  window.__freakyYouTubeApiPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {
        const previous =
          window
            .onYouTubeIframeAPIReady;

        window
          .onYouTubeIframeAPIReady =
          () => {
            try {
              previous?.();
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
            } else {
              reject(
                new Error(
                  "La API de YouTube no se inicializó."
                )
              );
            }
          };

        let script =
          document
            .getElementById(
              "youtube-iframe-api"
            );

        if (!script) {
          script =
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
                  "No se pudo cargar la API de YouTube."
                )
              );
            };

          document.head
            .appendChild(
              script
            );
        }
      }
    );

  return window
    .__freakyYouTubeApiPromise;
}

/* =========================================================
   PANTALLA YOUTUBE 3D
========================================================= */

const YouTubeScreen3D =
  forwardRef(
    function YouTubeScreen3D(
      {
        url,
        portalRef,
        visible = true,
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

      const hostRef =
        useRef(null);

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
         API QUE USA WorldScene
      ===================================================== */

      useImperativeHandle(
        ref,
        () => ({
          play() {
            playerRef.current
              ?.playVideo?.();
          },

          pause() {
            playerRef.current
              ?.pauseVideo?.();
          },

          seekBy(
            seconds
          ) {
            const player =
              playerRef.current;

            if (!player) {
              return;
            }

            const current =
              player
                .getCurrentTime?.() ??
              0;

            const duration =
              player
                .getDuration?.() ??
              0;

            const next =
              THREE.MathUtils
                .clamp(
                  current +
                    seconds,
                  0,
                  duration >
                    0
                    ? duration
                    : current +
                      Math.abs(
                        seconds
                      ) +
                      1
                );

            player.seekTo?.(
              next,
              true
            );
          },

          seekTo(
            seconds
          ) {
            const player =
              playerRef.current;

            if (!player) {
              return;
            }

            const duration =
              player
                .getDuration?.() ??
              0;

            const raw =
              Number(
                seconds
              ) ||
              0;

            const next =
              THREE.MathUtils
                .clamp(
                  raw,
                  0,
                  duration >
                    0
                    ? duration
                    : raw
                );

            player.seekTo?.(
              next,
              true
            );
          },
        }),
        []
      );

      /* =====================================================
         CSS3D RENDERER

         Esto es lo importante:
         ya no calculamos manualmente dónde
         debería estar el iframe.

         CSS3DRenderer utiliza la MISMA cámara
         que Three.js.
      ===================================================== */

      useEffect(() => {
        const portal =
          portalRef.current;

        if (!portal) {
          return;
        }

        const renderer =
          new CSS3DRenderer();

        renderer.setSize(
          size.width,
          size.height
        );

        Object.assign(
          renderer.domElement
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

            pointerEvents:
              "none",

            overflow:
              "hidden",
          }
        );

        portal.appendChild(
          renderer.domElement
        );

        const cssScene =
          new THREE.Scene();

        /*
          Este DIV es literalmente
          nuestra pantalla virtual.
        */

        const element =
          document
            .createElement(
              "div"
            );

        Object.assign(
          element.style,
          {
            width:
              `${PLAYER_WIDTH}px`,

            height:
              `${PLAYER_HEIGHT}px`,

            background:
              "#000",

            overflow:
              "hidden",

            pointerEvents:
              "none",

            backfaceVisibility:
              "hidden",

            WebkitBackfaceVisibility:
              "hidden",
          }
        );

        const host =
          document
            .createElement(
              "div"
            );

        host.style.width =
          "100%";

        host.style.height =
          "100%";

        element.appendChild(
          host
        );

        const object =
          new CSS3DObject(
            element
          );

        /*
          Misma posición que la
          pantalla de la pared.
        */

        object.position.set(
          ...SCREEN_POSITION
        );

        /*
          1280x720 píxeles
          convertidos a las dimensiones
          físicas de la pantalla 3D.
        */

        object.scale.set(
          SCREEN_WIDTH /
            PLAYER_WIDTH,

          SCREEN_HEIGHT /
            PLAYER_HEIGHT,

          1
        );

        cssScene.add(
          object
        );

        rendererRef.current =
          renderer;

        cssSceneRef.current =
          cssScene;

        cssObjectRef.current =
          object;

        hostRef.current =
          host;

        return () => {
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

          cssScene.remove(
            object
          );

          element.remove();

          renderer.domElement
            .remove();

          rendererRef.current =
            null;

          cssSceneRef.current =
            null;

          cssObjectRef.current =
            null;

          hostRef.current =
            null;
        };
      }, [
        portalRef,
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
         VISIBILIDAD
      ===================================================== */

      useEffect(() => {
        if (
          cssObjectRef.current
        ) {
          cssObjectRef.current
            .visible =
            visible;
        }
      }, [
        visible,
      ]);

      /* =====================================================
         CREAR PLAYER YOUTUBE
      ===================================================== */

      useEffect(() => {
        if (
          !youtubeId ||
          !hostRef.current
        ) {
          return;
        }

        let cancelled =
          false;

        loadYouTubeApi()
          .then(
            (
              YT
            ) => {
              if (
                cancelled ||
                !hostRef.current
              ) {
                return;
              }

              const player =
                new YT.Player(
                  hostRef.current,
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

                      /*
                        Dejamos los controles
                        oficiales de YouTube
                        directamente en la
                        pantalla 3D.
                      */
                      controls:
                        1,

                      playsinline:
                        1,

                      rel:
                        0,

                      modestbranding:
                        1,

                      fs:
                        1,

                      disablekb:
                        0,

                      iv_load_policy:
                        3,
                    },

                    events: {
                      onReady(
                        event
                      ) {
                        if (
                          cancelled
                        ) {
                          return;
                        }

                        try {
                          const iframe =
                            event.target
                              .getIframe();

                          Object.assign(
                            iframe.style,
                            {
                              width:
                                "100%",

                              height:
                                "100%",

                              display:
                                "block",

                              border:
                                "0",

                              /*
                                Esto permite
                                tocar directamente
                                los controles
                                dentro de la pantalla.
                              */
                              pointerEvents:
                                "auto",
                            }
                          );
                        } catch {
                          // nada
                        }

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
                      },

                      onStateChange(
                        event
                      ) {
                        if (
                          cancelled
                        ) {
                          return;
                        }

                        const playing =
                          event.data ===
                          YT.PlayerState
                            .PLAYING;

                        onPlayingChange?.(
                          playing
                        );

                        /*
                          Cuando termina
                          volvemos a 0.
                        */

                        if (
                          event.data ===
                          YT.PlayerState
                            .ENDED
                        ) {
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
                        }
                      },

                      onError(
                        event
                      ) {
                        onPlayingChange?.(
                          false
                        );

                        onError?.(
                          event.data
                        );
                      },
                    },
                  }
                );

              playerRef.current =
                player;

              /*
                Actualizamos barra y tiempo.
              */

              intervalRef.current =
                window
                  .setInterval(
                    () => {
                      if (
                        cancelled
                      ) {
                        return;
                      }

                      onTimeChange?.({
                        currentTime:
                          player
                            .getCurrentTime?.() ??
                          0,

                        duration:
                          player
                            .getDuration?.() ??
                          0,
                      });
                    },
                    250
                  );
            }
          )
          .catch(
            (
              error
            ) => {
              console.error(
                "FREAKY YOUTUBE API ERROR:",
                error
              );

              onError?.(
                error
              );
            }
          );

        return () => {
          cancelled =
            true;

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
        };
      }, [
        youtubeId,
        onPlayingChange,
        onTimeChange,
        onError,
      ]);

      /* =====================================================
         RENDER CSS3D

         MISMA cámara.
         MISMA perspectiva.
         MISMO movimiento.
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
          La pantalla mira hacia +Z.

          Si por alguna razón
          la cámara pasa detrás,
          ocultamos el iframe.
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
