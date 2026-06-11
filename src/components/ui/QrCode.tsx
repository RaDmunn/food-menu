"use client";

import { useMemo } from "react";
import { createQrMatrix } from "@/lib/utils/qrCode";

interface QrCodeProps {
  value: string;
  size?: number;
  quietZone?: number;
  className?: string;
}

export default function QrCode({
  value,
  size = 160,
  quietZone = 4,
  className,
}: QrCodeProps) {
  const matrix = useMemo(() => {
    try {
      return createQrMatrix(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!matrix) {
    return (
      <div className={className} style={{ width: size, height: size }}>
        QR unavailable
      </div>
    );
  }

  const moduleCount = matrix.length;
  const viewBoxSize = moduleCount + quietZone * 2;
  const path = matrix
    .flatMap((row, rowIndex) =>
      row.map((isDark, colIndex) =>
        isDark
          ? `M${colIndex + quietZone} ${rowIndex + quietZone}h1v1h-1z`
          : ""
      )
    )
    .filter(Boolean)
    .join("");

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      role="img"
      aria-label="QR code for public menu link"
      shapeRendering="crispEdges"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill="#fff" />
      <path d={path} fill="#111" />
    </svg>
  );
}
