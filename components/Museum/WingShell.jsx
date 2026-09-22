import * as THREE from "three";
import { useMemo } from "react";

export default function WingShell({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const geometry = useMemo(() => {
    /*
      =====================================================
      FORMA MAESTRA DPAD — V3

      +Y = extremo exterior
      -Y = extremo hacia el centro de la cruceta

      Objetivo:
      - cuerpo compacto
      - extremo exterior ancho
      - esquinas exteriores redondeadas
      - laterales rectos muy cortos
      - cierre temprano hacia el centro
      - cuello interior estrecho
      =====================================================
    */

    const shape = new THREE.Shape();

    // -----------------------------------------------------
    // EXTREMO INTERIOR
    // -----------------------------------------------------

    shape.moveTo(-6.5, -27);

    shape.quadraticCurveTo(
      -10.5,
      -27,
      -14,
      -23.5
    );

    // -----------------------------------------------------
    // DIAGONAL IZQUIERDA
    // Empieza antes que en V2
    // -----------------------------------------------------

    shape.lineTo(-25.5, -10);

    // -----------------------------------------------------
    // TRANSICIÓN AL LATERAL
    // -----------------------------------------------------

    shape.quadraticCurveTo(
      -28.5,
      -6,
      -28.5,
      -1
    );

    // -----------------------------------------------------
    // LATERAL IZQUIERDO
    // Mucho más corto
    // -----------------------------------------------------

    shape.lineTo(-28.5, 11);

    // -----------------------------------------------------
    // GRAN ESQUINA EXTERIOR IZQUIERDA
    // -----------------------------------------------------

    shape.quadraticCurveTo(
      -28.5,
      20,
      -22,
      24.5
    );

    shape.quadraticCurveTo(
      -17,
      28,
      -9,
      28.5
    );

    // -----------------------------------------------------
    // BORDE EXTERIOR SUPERIOR
    // -----------------------------------------------------

    shape.quadraticCurveTo(
      0,
      29,
      9,
      28.5
    );

    shape.quadraticCurveTo(
      17,
      28,
      22,
      24.5
    );

    // -----------------------------------------------------
    // GRAN ESQUINA EXTERIOR DERECHA
    // -----------------------------------------------------

    shape.quadraticCurveTo(
      28.5,
      20,
      28.5,
      11
    );

    // -----------------------------------------------------
    // LATERAL DERECHO
    // -----------------------------------------------------

    shape.lineTo(28.5, -1);

    // -----------------------------------------------------
    // TRANSICIÓN A DIAGONAL
    // -----------------------------------------------------

    shape.quadraticCurveTo(
      28.5,
      -6,
      25.5,
      -10
    );

    // -----------------------------------------------------
    // DIAGONAL DERECHA
    // -----------------------------------------------------

    shape.lineTo(14, -23.5);

    // -----------------------------------------------------
    // EXTREMO INTERIOR DERECHO
    // -----------------------------------------------------

    shape.quadraticCurveTo(
      10.5,
      -27,
      6.5,
      -27
    );

    // -----------------------------------------------------
    // PEQUEÑO BORDE INTERIOR
    // -----------------------------------------------------

    shape.lineTo(-6.5, -27);

    /*
      =====================================================
      GEOMETRÍA PLANA DE PRUEBA
      =====================================================
    */

    const geo = new THREE.ShapeGeometry(
      shape,
      48
    );

    geo.rotateX(-Math.PI / 2);

    return geo;
  }, []);

  return (
    <group
      position={position}
      rotation={rotation}
    >
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#d7dbe2"
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[geometry]} />

        <lineBasicMaterial
          color="#151922"
          depthTest={false}
        />
      </lineSegments>
    </group>
  );
}
