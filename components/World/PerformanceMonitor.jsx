"use client";

import {
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  useRef,
} from "react";

export default function PerformanceMonitor({
  onStats,
  onQualityChange,
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
    useRef("high");

  useFrame(
    (_, delta) => {
      elapsed.current +=
        delta;

      frames.current += 1;

      if (
        elapsed.current <
        1
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

      /* ===============================================
         AUTO QUALITY
      =============================================== */

      if (
        fps <
        38
      ) {
        badSamples.current +=
          1;

        goodSamples.current =
          0;
      } else if (
        fps >
        54
      ) {
        goodSamples.current +=
          1;

        badSamples.current =
          0;
      } else {
        badSamples.current =
          0;

        goodSamples.current =
          0;
      }

      if (
        badSamples.current >=
        3
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

      if (
        goodSamples.current >=
        5
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
    }
  );

  return null;
}
