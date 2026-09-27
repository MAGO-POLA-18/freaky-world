"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import * as THREE from "three";

/* =========================================================
   FREAKY WORLD
   CARGADOR DE PORTADAS REALES

   Recibe una URL de portada procedente de nuestra API.
   La imagen se carga directamente como textura Three.js.

   Si la imagen falla, devuelve null para que la sala pueda
   mostrar un fallback sin romper el mundo 3D.
========================================================= */

export function useGameCoverTexture(
  imageUrl
) {
  const [
    texture,
    setTexture,
  ] = useState(null);

  const loader =
    useMemo(
      () =>
        new THREE.TextureLoader(),
      []
    );

  useEffect(() => {
    let active = true;

    /*
      Si no tenemos URL, no intentamos cargar nada.
    */

    if (!imageUrl) {
      setTexture(null);

      return () => {
        active = false;
      };
    }

    let loadedTexture = null;

    loader.load(
      imageUrl,

      /* ===================================================
         CARGA CORRECTA
      =================================================== */

      (newTexture) => {
        if (!active) {
          newTexture.dispose();
          return;
        }

        loadedTexture =
          newTexture;

        newTexture.colorSpace =
          THREE.SRGBColorSpace;

        newTexture.minFilter =
          THREE.LinearMipmapLinearFilter;

        newTexture.magFilter =
          THREE.LinearFilter;

        newTexture.generateMipmaps =
          true;

        newTexture.anisotropy = 4;

        newTexture.needsUpdate =
          true;

        setTexture(
          newTexture
        );
      },

      undefined,

      /* ===================================================
         ERROR

         Una portada que falle nunca debe tumbar la sala.
      =================================================== */

      () => {
        if (!active) {
          return;
        }

        setTexture(null);
      }
    );

    return () => {
      active = false;

      if (loadedTexture) {
        loadedTexture.dispose();
      }
    };
  }, [
    imageUrl,
    loader,
  ]);

  return texture;
}

/* =========================================================
   MATERIAL DE PORTADA

   Este componente nos permite usarlo directamente dentro
   de un <mesh>.

   Ejemplo:

   <mesh>
     <planeGeometry args={[4.9, 9.45]} />
     <GameCoverMaterial
       imageUrl={game.cover?.large}
     />
   </mesh>
========================================================= */

export default function GameCoverMaterial({
  imageUrl,
  fallbackColor = "#11151a",
}) {
  const texture =
    useGameCoverTexture(
      imageUrl
    );

  if (!texture) {
    return (
      <meshStandardMaterial
        color={
          fallbackColor
        }
        roughness={0.42}
        metalness={0.12}
      />
    );
  }

  return (
    <meshBasicMaterial
      map={texture}
      toneMapped={false}
      side={THREE.FrontSide}
    />
  );
}
