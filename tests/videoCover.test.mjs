import test from "node:test";
import assert from "node:assert/strict";

function computeCoverTransform(videoW, videoH, containerW, containerH) {
  if (!videoW || !videoH || !containerW || !containerH) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }
  const scale = Math.max(containerW / videoW, containerH / videoH);
  const offsetX = (containerW - videoW * scale) / 2;
  const offsetY = (containerH - videoH * scale) / 2;
  return { scale, offsetX, offsetY };
}

function videoPxToContainerPx(point, t) {
  return {
    x: point.x * t.scale + t.offsetX,
    y: point.y * t.scale + t.offsetY,
  };
}

test("computeCoverTransform centers video with landscape container", () => {
  // 1920x1080 (16:9) video into 1200x900 (4:3) container
  // Scale will be driven by height: 900 / 1080 = 0.8333
  // Scaled width = 1920 * 0.8333 = 1600. OffsetX = (1200 - 1600) / 2 = -200
  const transform = computeCoverTransform(1920, 1080, 1200, 900);
  assert.equal(transform.scale, 900 / 1080);
  assert.equal(transform.offsetX, (1200 - 1920 * (900 / 1080)) / 2);
  assert.equal(transform.offsetY, 0);

  // Center of video (960, 540) maps to center of container (600, 450)
  const mappedCenter = videoPxToContainerPx({ x: 960, y: 540 }, transform);
  assert.equal(Math.round(mappedCenter.x), 600);
  assert.equal(Math.round(mappedCenter.y), 450);
});

test("computeCoverTransform handles portrait mobile container", () => {
  // 1920x1080 (16:9) video into 400x800 (1:2) mobile container
  // Scale driven by height: 800 / 1080 = 0.7407
  const transform = computeCoverTransform(1920, 1080, 400, 800);
  assert.equal(transform.scale, 800 / 1080);
  assert.ok(transform.offsetX < 0, "Video sides should be cropped to fill height");
  assert.equal(transform.offsetY, 0);
});
