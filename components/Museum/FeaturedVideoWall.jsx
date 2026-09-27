"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Html, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { playerRuntime } from "../World/PlayerController";
import {
  FEATURED_VIDEO,
  FEATURED_VIDEO_URL,
  getYouTubeEmbedUrl,
  getYouTubeId,
} from "../World/featuredVideoConfig";

const PLAYER_WIDTH = 1280;
const PLAYER_HEIGHT = 720;

const SCREEN_WIDTH = 22.5;
const SCREEN_HEIGHT = 12.65;

const HTML_SCALE =
  SCREEN_WIDTH / PLAYER_WIDTH;

function useYouTubeThumbnail() {
  const youtubeId = useMemo(
    () =>
      getYouTubeId(
        FEATURED_VIDEO_URL
      ),
    []
  );

  const [texture, setTexture] =
    useState(null);

  useEffect(() => {
    if (!youtubeId) {
      return undefined;
    }

    let cancelled = false;
    let loadedTexture = null;

    const loader =
      new THREE.TextureLoader();

    loader.setCrossOrigin("anonymous");

    const configureTexture = (
      nextTexture
    ) => {
      loadedTexture = nextTexture;

      nextTexture.colorSpace =
        THREE.SRGBColorSpace;

      nextTexture.minFilter =
        THREE.LinearFilter;

      nextTexture.magFilter =
        THREE.LinearFilter;

      nextTexture.generateMipmaps =
        false;

      nextTexture.needsUpdate = true;

      if (!cancelled) {
        setTexture(nextTexture);
      }
    };

    loader.load(
      `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`,
      configureTexture,
      undefined,
      () => {
        loader.load(
          `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
          configureTexture
        );
      }
    );

    return () => {
      cancelled = true;

      loadedTexture?.dispose?.();
    };
  }, [youtubeId]);

  return texture;
}

function createLoadingTexture() {
  const canvas =
    document.createElement("canvas");

  canvas.width = PLAYER_WIDTH;
  canvas.height = PLAYER_HEIGHT;

  const ctx =
    canvas.getContext("2d");

  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      PLAYER_WIDTH,
      PLAYER_HEIGHT
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

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    PLAYER_WIDTH,
    PLAYER_HEIGHT
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#58f1ff";
  ctx.font = "800 34px Arial";

  ctx.fillText(
    "FREAKY WORLD",
    640,
    260
  );

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 62px Arial";

  ctx.fillText(
    "VIDEO DESTACADO",
    640,
    340
  );

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

  ctx.fillStyle = "#11151a";

  ctx.moveTo(666, 455);
  ctx.lineTo(624, 427);
  ctx.lineTo(624, 483);
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

export default function FeaturedVideoWall() {
  const groupRef = useRef(null);

  const nearRef =
    useRef(false);

  const worldPosition =
    useMemo(
      () =>
        new THREE.Vector3(),
      []
    );

  const [near, setNear] =
    useState(false);

  const youtubeTexture =
    useYouTubeThumbnail();

  const loadingTexture =
    useMemo(
      () =>
        createLoadingTexture(),
      []
    );

  const embedUrl =
    useMemo(
      () =>
        getYouTubeEmbedUrl(
          FEATURED_VIDEO_URL
        ),
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
            game:
              FEATURED_VIDEO,
          },
        }
      )
    );
  });

  return (
    <group
      ref={groupRef}
      position={[
        0,
        0,
        -33.72,
      ]}
    >
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

      <mesh
        position={[
          0,
          7.2,
          0.275,
        ]}
      >
        <planeGeometry
          args={[
            SCREEN_WIDTH,
            SCREEN_HEIGHT,
          ]}
        />

        <meshBasicMaterial
          map={
            screenTexture
          }
          toneMapped={false}
          side={
            THREE.DoubleSide
          }
        />
      </mesh>

      {embedUrl && (
        <Html
          transform
          position={[
            0,
            7.2,
            0.34,
          ]}
          scale={
            HTML_SCALE
          }
          zIndexRange={[
            20,
            0,
          ]}
          style={{
            width: `${PLAYER_WIDTH}px`,
            height: `${PLAYER_HEIGHT}px`,
            pointerEvents:
              near
                ? "auto"
                : "none",
          }}
        >
          <div
            onPointerDown={(
              event
            ) => {
              event.stopPropagation();
            }}
            onClick={(
              event
            ) => {
              event.stopPropagation();
            }}
            style={{
              width: `${PLAYER_WIDTH}px`,
              height: `${PLAYER_HEIGHT}px`,
              overflow:
                "hidden",
              background:
                "#000",
              borderRadius:
                "8px",
              pointerEvents:
                near
                  ? "auto"
                  : "none",
            }}
          >
            <iframe
              src={embedUrl}
              title="Freaky World YouTube 3D"
              width={
                PLAYER_WIDTH
              }
              height={
                PLAYER_HEIGHT
              }
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                display:
                  "block",
                width: `${PLAYER_WIDTH}px`,
                height: `${PLAYER_HEIGHT}px`,
                margin: 0,
                padding: 0,
                border: 0,
                background:
                  "#000",
                pointerEvents:
                  near
                    ? "auto"
                    : "none",
              }}
            />
          </div>
        </Html>
      )}

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
