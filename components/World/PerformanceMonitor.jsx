"use client";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useEffect,
  useRef,
} from "react";

export default function PerformanceMonitor({
  onStats,
  onQualityChange,
  quality = "medium",
  mobile = false,
}) {
  const {
    gl,
  } = useThree();

  const elapsed =
    useRef(0);

  const frames =
    useRef(0);

  const badSamples =
    useRef(0);

  const goodSamples =
    useRef(0);

  const currentQuality =
    useRef(quality);

  useEffect(() => {
    currentQuality.current =
      quality;
  }, [quality]);

  useFrame((_, delta) => {
    elapsed.current +=
      delta;

    frames.current +=
      1;

    /*
      Medimos cada 2 segundos.

      Esto evita reaccionar a pequeñas
      caídas momentáneas.
    */

    if (
      elapsed.current <
      2
    ) {
      return;
    }

    const fps =
      Math.round(
        frames.current /
          elapsed.current
      );

    const calls =
      gl.info.render.calls;

    const triangles =
      gl.info.render.triangles;

    const textures =
      gl.info.memory.textures;

    onStats?.({
      fps,

      frameMs:
        Math.round(
          1000 /
            Math.max(
              fps,
              1
            )
        ),

      calls,
      triangles,
      textures,

      quality:
        currentQuality.current,
    });

    /* =====================================================
       BAJAR CALIDAD
    ===================================================== */

    const badLimit =
      mobile
        ? 27
        : 42;

    if (
      fps <
      badLimit
    ) {
      badSamples.current +=
        1;

      goodSamples.current =
        0;
    } else {
      badSamples.current =
        0;
    }

    if (
      badSamples.current >=
      2
    ) {
      if (
        currentQuality.current ===
        "high"
      ) {
        currentQuality.current =
          "medium";

        onQualityChange?.(
          "medium"
        );
      } else if (
        currentQuality.current ===
        "medium"
      ) {
        currentQuality.current =
          "low";

        onQualityChange?.(
          "low"
        );
      }

      badSamples.current =
        0;
    }

    /* =====================================================
       SUBIR CALIDAD

       Mucho más conservador:
       necesitamos varios segundos buenos.
    ===================================================== */

    const goodLimit =
      mobile
        ? 48
        : 56;

    if (
      fps >
      goodLimit
    ) {
      goodSamples.current +=
        1;
    } else {
      goodSamples.current =
        0;
    }

    if (
      goodSamples.current >=
      4
    ) {
      if (
        currentQuality.current ===
        "low"
      ) {
        currentQuality.current =
          "medium";

        onQualityChange?.(
          "medium"
        );
      } else if (
        currentQuality.current ===
        "medium"
      ) {
        currentQuality.current =
          "high";

        onQualityChange?.(
          "high"
        );
      }

      goodSamples.current =
        0;
    }

    elapsed.current =
      0;

    frames.current =
      0;
  });

  return null;
}
