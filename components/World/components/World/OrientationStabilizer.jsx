"use client";

import {
  useEffect,
} from "react";

import {
  playerInput,
} from "./PlayerController";

/* =========================================================
   FREAKY WORLD
   ORIENTATION STABILIZER

   Corrige cambios repetidos:
   vertical → horizontal → vertical

   Especialmente pensado para Safari/iPhone.
========================================================= */

export default function OrientationStabilizer() {
  useEffect(() => {
    let timer1 = null;
    let timer2 = null;
    let timer3 = null;

    /* =====================================================
       PARAR MOVIMIENTO
    ===================================================== */

    function stopPlayer() {
      playerInput.x = 0;
      playerInput.y = 0;

      playerInput.dashRequested =
        false;
    }

    /* =====================================================
       BLUR

       Evita que iOS conserve zoom de un input después
       de girar la pantalla.
    ===================================================== */

    function blurActiveElement() {
      const active =
        document.activeElement;

      if (
        active &&
        typeof active.blur ===
          "function"
      ) {
        active.blur();
      }
    }

    /* =====================================================
       VIEWPORT REAL
    ===================================================== */

    function updateViewport() {
      const viewport =
        window.visualViewport;

      const width =
        viewport?.width ||
        window.innerWidth;

      const height =
        viewport?.height ||
        window.innerHeight;

      document.documentElement
        .style.setProperty(
          "--freaky-vw",
          `${width}px`
        );

      document.documentElement
        .style.setProperty(
          "--freaky-vh",
          `${height}px`
        );

      document.documentElement
        .style.setProperty(
          "--freaky-height",
          `${height}px`
        );
    }

    /* =====================================================
       REAJUSTE
    ===================================================== */

    function stabilize() {
      stopPlayer();

      blurActiveElement();

      updateViewport();

      /*
        Safari suele tardar varias fases
        en terminar un cambio de orientación.

        Hacemos tres ajustes muy livianos.
      */

      window.clearTimeout(
        timer1
      );

      window.clearTimeout(
        timer2
      );

      window.clearTimeout(
        timer3
      );

      timer1 =
        window.setTimeout(
          () => {
            updateViewport();

            window.scrollTo(
              0,
              0
            );
          },
          60
        );

      timer2 =
        window.setTimeout(
          () => {
            updateViewport();

            window.scrollTo(
              0,
              0
            );

            window.dispatchEvent(
              new Event(
                "resize"
              )
            );
          },
          220
        );

      timer3 =
        window.setTimeout(
          () => {
            updateViewport();

            window.scrollTo(
              0,
              0
            );
          },
          500
        );
    }

    /* =====================================================
       BLOQUEAR GESTO DE ZOOM SOBRE EL MUNDO

       No bloqueamos el scroll normal de overlays.
    ===================================================== */

    function preventGesture(
      event
    ) {
      event.preventDefault();
    }

    /* =====================================================
       INIT
    ===================================================== */

    updateViewport();

    window.addEventListener(
      "orientationchange",
      stabilize
    );

    window.addEventListener(
      "resize",
      updateViewport
    );

    window.visualViewport
      ?.addEventListener(
        "resize",
        updateViewport
      );

    /*
      Safari iOS.
    */

    document.addEventListener(
      "gesturestart",
      preventGesture,
      {
        passive: false,
      }
    );

    document.addEventListener(
      "gesturechange",
      preventGesture,
      {
        passive: false,
      }
    );

    document.addEventListener(
      "gestureend",
      preventGesture,
      {
        passive: false,
      }
    );

    return () => {
      window.clearTimeout(
        timer1
      );

      window.clearTimeout(
        timer2
      );

      window.clearTimeout(
        timer3
      );

      window.removeEventListener(
        "orientationchange",
        stabilize
      );

      window.removeEventListener(
        "resize",
        updateViewport
      );

      window.visualViewport
        ?.removeEventListener(
          "resize",
          updateViewport
        );

      document.removeEventListener(
        "gesturestart",
        preventGesture
      );

      document.removeEventListener(
        "gesturechange",
        preventGesture
      );

      document.removeEventListener(
        "gestureend",
        preventGesture
      );
    };
  }, []);

  return null;
}
