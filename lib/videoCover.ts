/**
 * Maps coordinates from a video's native pixel space into the space it's
 * actually displayed in when shown with CSS `object-cover` inside a
 * differently-shaped container.
 *
 * This matters a lot for a responsive booth: a laptop webcam is usually
 * 16:9, a tablet's front camera is often taller (closer to 3:4 or 4:3), and
 * the container itself changes shape between phone/tablet portrait and the
 * centered kiosk card on a laptop. Without this correction, glasses drift
 * off-face any time video aspect ratio != container aspect ratio — which,
 * across "laptop + tablet + phone", is most of the time, not an edge case.
 */
export interface CoverTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function computeCoverTransform(
  videoW: number,
  videoH: number,
  containerW: number,
  containerH: number
): CoverTransform {
  if (!videoW || !videoH || !containerW || !containerH) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.max(containerW / videoW, containerH / videoH);
  const offsetX = (containerW - videoW * scale) / 2;
  const offsetY = (containerH - videoH * scale) / 2;
  return { scale, offsetX, offsetY };
}

/** video pixel coords -> container (CSS pixel) coords */
export function videoPxToContainerPx(
  point: { x: number; y: number },
  t: CoverTransform
) {
  return {
    x: point.x * t.scale + t.offsetX,
    y: point.y * t.scale + t.offsetY,
  };
}
