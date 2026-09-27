"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { playerRuntime } from "../World/PlayerController";

/* =========================================================
   CONFIGURACIÓN DEL VIDEO

   UNA SOLA URL.
   De aquí salen:
   - la miniatura del 3D
   - el reproductor del overlay 2D
========================================================= */

export const FEATURED_VIDEO_URL =
  "https://www.youtube.com/watch?v=M7lc1UVf-VE";

export const FEATURED_VIDEO = {
  id: "featured-video-screen",

  overlayType: "video",

  sourceType: "youtube",

  title: "VIDEO DESTACADO",

  description:
    "Pantalla multimedia principal de Freaky World.",

  accent: "#58f1ff",

  accent2: "#8b5cff",

  youtubeUrl: FEATURED_VIDEO_URL,
};

/* =========================================================
   YOUTUBE ID
========================================================= */

export function getYouTubeId(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname
        .replace("/", "")
        .split("/")[0];
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      return parsed.pathname
        .split("/shorts/")[1]
        ?.split("/")[0];
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname
        .split("/embed/")[1]
        ?.split("/")[0];
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

/* =========================================================
   MINIATURA
========================================================= */

function useYouTubeThumbnail() {
  const youtubeId = useMemo(
    () => getYouTubeId(FEATURED_VIDEO_URL),
    []
  );

  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!youtubeId) return;

    let cancelled = false;

    const loader = new THREE.TextureLoader();

    loader.setCrossOrigin("anonymous");

    /*
      Primero intentamos maxresdefault.
      Si ese video no tiene miniatura máxima,
      usamos hqdefault.
    */

    const maxResUrl =
      `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`;

    const fallbackUrl =
      `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

    const configureTexture = (loadedTexture) => {
      loadedTexture.colorSpace =
        THREE.SRGBColorSpace;

      loadedTexture.minFilter =
        THREE.LinearFilter;

      loadedTexture.magFilter =
        THREE.LinearFilter;

      loadedTexture.generateMipmaps =
        false;

      loadedTexture.needsUpdate =
        true;

      if (!cancelled) {
        setTexture(loadedTexture);
      }
    };

    loader.load(
      maxResUrl,

      configureTexture,

      undefined,

      () => {
        loader.load(
          fallbackUrl,
          configureTexture
        );
      }
    );

    return () => {
      cancelled = true;
    };
  }, [youtubeId]);

  return texture;
}

/* =========================================================
   TEXTURA TEMPORAL MIENTRAS CARGA YOUTUBE
========================================================= */

function createLoadingTexture() {
  const canvas =
    document.createElement("canvas");

  canvas.width = 1280;
  canvas.height = 720;

  const ctx =
    canvas.getContext("2d");

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      1280,
      720
    );

  gradient.addColorStop(
    0,
    "#05080d"
  );

  gradient.addColorStop(
    0.5,
    "#10182b"
  );

  gradient.addColorStop(
    1,
    "#180b25"
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    1280,
    720
  );

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillStyle =
    "#58f1ff";

  ctx.font =
    "800 34px Arial";

  ctx.fillText(
    "FREAKY WORLD",
    640,
    260
  );

  ctx.fillStyle =
    "#ffffff";

  ctx.font =
    "900 62px Arial";

  ctx.fillText(
    "VIDEO DESTACADO",
    640,
    340
  );

  /*
    Botón play
  */

  ctx.beginPath();

  ctx.fillStyle =
    "rgba(255,255,255,0.95)";

  ctx.arc(
    640,
    455,
    66,
    0,
    Math.PI * 2
  );

  ctx.fill();

  ctx.beginPath();

  ctx.fillStyle =
    "#11151a";

  ctx.moveTo(
    666,
    455
  );

  ctx.lineTo(
    624,
    427
  );

  ctx.lineTo(
    624,
    483
  );

  ctx.closePath();

  ctx.fill();

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return texture;
}

/* =========================================================
   LÍNEA NEÓN
========================================================= */

function NeonLine({
  position,
  size,
  color,
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />

      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.3}
      />
    </mesh>
  );
}

/* =========================================================
   PANTALLA 3D

   IMPORTANTE:
   AQUÍ NO EXISTE NINGÚN REPRODUCTOR.

   Solamente:
   - miniatura
   - proximidad
   - evento para abrir 2D
========================================================= */

export default function FeaturedVideoWall() {
  const groupRef =
    useRef(null);

  const nearRef =
    useRef(false);

  const worldPosition =
    useMemo(
      () => new THREE.Vector3(),
      []
    );

  const [near, setNear] =
    useState(false);

  const youtubeTexture =
    useYouTubeThumbnail();

  const loadingTexture =
    useMemo(
      () => createLoadingTexture(),
      []
    );

  const screenTexture =
    youtubeTexture ||
    loadingTexture;

  useEffect(() => {
    return () => {
      loadingTexture.dispose();
    };
  }, [loadingTexture]);

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
      distance < 12;

    if (
      isNear ===
      nearRef.current
    ) {
      return;
    }

    nearRef.current =
      isNear;

    setNear(isNear);

    window.dispatchEvent(
      new CustomEvent(
        "freaky:game-near",
        {
          detail: {
            near: isNear,

            game: FEATURED_VIDEO,
          },
        }
      )
    );
  });

  /* =======================================================
     PANTALLA
  ======================================================= */

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        -33.72,
      ]}
    >
      {/* MARCO */}

      <RoundedBox
        position={[
          0,
          7.2,
          0,
        ]}
        args={[
          25.5,
          13.2,
          0.5,
        ]}
        radius={0.42}
        smoothness={4}
      >
        <meshStandardMaterial
          color="#070b10"
          emissive={
            near
              ? "#58f1ff"
              : "#8b5cff"
          }
          emissiveIntensity={
            near
              ? 0.18
              : 0.07
          }
        />
      </RoundedBox>

      {/* MINIATURA YOUTUBE */}

      <mesh
        position={[
          0,
          7.2,
          0.28,
        ]}
      >
        <planeGeometry
          args={[
            22.5,
            12.65,
          ]}
        />

        <meshBasicMaterial
          map={screenTexture}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* BORDE SUPERIOR */}

      <NeonLine
        position={[
          0,
          13.58,
          0.34,
        ]}
        size={[
          23,
          0.1,
          0.08,
        ]}
        color="#58f1ff"
      />

      {/* BORDE INFERIOR */}

      <NeonLine
        position={[
          0,
          0.82,
          0.34,
        ]}
        size={[
          23,
          0.1,
          0.08,
        ]}
        color="#ff4f95"
      />

      {/* LUZ DE PROXIMIDAD */}

      {near && (
        <pointLight
          position={[
            0,
            7,
            3,
          ]}
          color="#58f1ff"
          intensity={8}
          distance={18}
          decay={2}
        />
      )}
    </group>
  );
}
