import test from "node:test";
import assert from "node:assert/strict";
import {
  computeGlassesAnchor,
  Y_OFFSET_FACTOR,
  LANDMARK,
  applyEMA,
  emaAlpha,
} from "../lib/landmarks.ts";

// Helper to construct mock 478 MediaPipe landmarks
function createMockLandmarks(overrides = {}) {
  const lm = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));

  // Default frontal face setup
  lm[LANDMARK.LEFT_EYE_OUTER]  = { x: 0.39, y: 0.45, z: -0.02 }; // lm 33
  lm[LANDMARK.RIGHT_EYE_OUTER] = { x: 0.61, y: 0.45, z: -0.02 }; // lm 263
  lm[LANDMARK.NOSE_BRIDGE]     = { x: 0.50, y: 0.44, z: 0.00 };  // lm 168 (nasion)
  lm[LANDMARK.NOSE_SADDLE]     = { x: 0.50, y: 0.45, z: 0.01 };  // lm 6
  lm[LANDMARK.LEFT_CHEEK]      = { x: 0.31, y: 0.52, z: -0.04 }; // lm 234
  lm[LANDMARK.RIGHT_CHEEK]     = { x: 0.69, y: 0.52, z: -0.04 }; // lm 454
  lm[LANDMARK.FOREHEAD]        = { x: 0.50, y: 0.28, z: 0.00 };  // lm 10
  lm[LANDMARK.CHIN]            = { x: 0.50, y: 0.82, z: 0.00 };  // lm 152

  Object.entries(overrides).forEach(([idx, val]) => {
    lm[Number(idx)] = { ...lm[Number(idx)], ...val };
  });

  return lm;
}

test("computeGlassesAnchor anchors horizontal center strictly to nose bridge", () => {
  const lm = createMockLandmarks({
    [LANDMARK.NOSE_BRIDGE]: { x: 0.52, y: 0.44, z: 0 },
  });
  const anchor = computeGlassesAnchor(lm, 640, 480);
  assert.equal(anchor.centerNormalized.x, 0.52);
});

test("computeGlassesAnchor shifts vertical center down to seat bridge under eyebrows", () => {
  const lm = createMockLandmarks();
  const anchor = computeGlassesAnchor(lm, 640, 480);

  // In normalized coordinates (y=0 top, y=1 bottom), a positive Y_OFFSET_FACTOR
  // must place centerY strictly BELOW (greater than) the nasion/eyebrow level.
  assert.ok(Y_OFFSET_FACTOR > 0, "Y_OFFSET_FACTOR must be positive");
  assert.ok(
    anchor.centerNormalized.y > lm[LANDMARK.NOSE_BRIDGE].y,
    "Anchor centerY must sit below nasion"
  );

  const ipd = Math.abs(lm[LANDMARK.RIGHT_EYE_OUTER].x - lm[LANDMARK.LEFT_EYE_OUTER].x);
  const expectedY = lm[LANDMARK.NOSE_BRIDGE].y + ipd * Y_OFFSET_FACTOR;
  assert.ok(Math.abs(anchor.centerNormalized.y - expectedY) < 1e-6);
});

test("computeGlassesAnchor calculates outer temple width from landmarks 234 and 454", () => {
  const lm = createMockLandmarks();
  const anchor = computeGlassesAnchor(lm, 640, 480);

  const expectedTempleWidth = Math.abs(lm[LANDMARK.RIGHT_CHEEK].x - lm[LANDMARK.LEFT_CHEEK].x);
  assert.ok(anchor.templeWidthNorm > 0);
  assert.ok(Math.abs(anchor.templeWidthNorm - expectedTempleWidth) < 1e-6);
  assert.ok(anchor.templeWidthNorm > anchor.ipdNorm, "Temple width must be wider than outer eye span");
});

test("computeGlassesAnchor estimates yaw angle accurately for head turns", () => {
  // 1. Facing straight forward -> yaw near 0
  const frontalLm = createMockLandmarks();
  const frontalAnchor = computeGlassesAnchor(frontalLm, 640, 480);
  assert.ok(Math.abs(frontalAnchor.yaw) < 0.05, "Frontal view should have near-zero yaw");

  // 2. Turning head to the right (nose moves towards left cheek in video space, right cheek deeper)
  const turnRightLm = createMockLandmarks({
    [LANDMARK.NOSE_BRIDGE]: { x: 0.45, y: 0.44, z: 0.02 },
    [LANDMARK.RIGHT_CHEEK]: { x: 0.65, y: 0.52, z: 0.08 },
    [LANDMARK.LEFT_CHEEK]:  { x: 0.32, y: 0.52, z: -0.06 },
  });
  const turnRightAnchor = computeGlassesAnchor(turnRightLm, 640, 480);
  assert.ok(turnRightAnchor.yaw > 0.1, "Turning right must yield positive yaw angle");

  // 3. Turning head to the left (nose moves towards right cheek in video space, left cheek deeper)
  const turnLeftLm = createMockLandmarks({
    [LANDMARK.NOSE_BRIDGE]: { x: 0.55, y: 0.44, z: 0.02 },
    [LANDMARK.RIGHT_CHEEK]: { x: 0.68, y: 0.52, z: -0.06 },
    [LANDMARK.LEFT_CHEEK]:  { x: 0.35, y: 0.52, z: 0.08 },
  });
  const turnLeftAnchor = computeGlassesAnchor(turnLeftLm, 640, 480);
  assert.ok(turnLeftAnchor.yaw < -0.1, "Turning left must yield negative yaw angle");
});

test("applyEMA and emaAlpha smooth values without cold-start drift", () => {
  const alpha = emaAlpha(16.67, 80);
  assert.ok(alpha > 0 && alpha < 1, "Alpha must be in (0, 1)");

  const slot = { value: 0, initialized: false };
  const first = applyEMA(slot, 100, alpha);
  assert.equal(first, 100, "First value should be seeded immediately");
  assert.equal(slot.initialized, true);

  const second = applyEMA(slot, 120, alpha);
  assert.ok(second > 100 && second < 120, "Subsequent values must be smoothed");
});
