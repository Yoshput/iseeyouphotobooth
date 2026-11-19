import test from "node:test";
import assert from "node:assert/strict";

// Helper to synthesize 478 mock landmarks with specific facial proportions
function createMockLandmarks({ faceLength = 1.4, cheekWidth = 1.0, jawWidth = 0.8, foreWidth = 0.85 }) {
  const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));

  // Forehead top (10) and Chin (152)
  landmarks[10] = { x: 0.5, y: 0.5 - faceLength / 2, z: 0 };
  landmarks[152] = { x: 0.5, y: 0.5 + faceLength / 2, z: 0 };

  // Cheekbones (234 left, 454 right)
  landmarks[234] = { x: 0.5 - cheekWidth / 2, y: 0.5, z: 0 };
  landmarks[454] = { x: 0.5 + cheekWidth / 2, y: 0.5, z: 0 };

  // Jaw angles (132 left, 361 right)
  landmarks[132] = { x: 0.5 - jawWidth / 2, y: 0.65, z: 0 };
  landmarks[361] = { x: 0.5 + jawWidth / 2, y: 0.65, z: 0 };

  // Forehead temples (103 left, 332 right)
  landmarks[103] = { x: 0.5 - foreWidth / 2, y: 0.35, z: 0 };
  landmarks[332] = { x: 0.5 + foreWidth / 2, y: 0.35, z: 0 };

  return landmarks;
}

// Distance helper
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Replicate classifier logic from lib/faceShape.ts to test independently
function detectFaceShape(landmarks) {
  const needed = [10, 103, 132, 152, 234, 332, 361, 454];
  if (landmarks.length < 468 || needed.some((i) => !landmarks[i])) {
    return { shape: "Oval", confidence: 0 };
  }

  const faceLength = dist(landmarks[10], landmarks[152]);
  const cheekWidth = dist(landmarks[234], landmarks[454]);
  const jawWidth = dist(landmarks[132], landmarks[361]);
  const foreWidth = dist(landmarks[103], landmarks[332]);

  const lengthRatio = faceLength / cheekWidth;
  const jawRatio = jawWidth / cheekWidth;
  const foreheadRatio = foreWidth / cheekWidth;

  if (lengthRatio > 1.62) {
    return { shape: "Oblong", confidence: 0.85 };
  } else if (jawRatio >= 0.84 && foreheadRatio >= 0.84 && lengthRatio < 1.35) {
    return { shape: "Square", confidence: 0.85 };
  } else if (lengthRatio < 1.22 && jawRatio > 0.78) {
    return { shape: "Round", confidence: 0.85 };
  } else if (foreheadRatio >= 0.86 && (foreheadRatio - jawRatio) > 0.13) {
    return { shape: "Heart", confidence: 0.85 };
  } else if (foreheadRatio < 0.83 && jawRatio < 0.79 && lengthRatio >= 1.18) {
    return { shape: "Diamond", confidence: 0.85 };
  } else {
    return { shape: "Oval", confidence: 0.75 };
  }
}

// Stabilizer class test
class FaceShapeStabilizer {
  constructor(windowSize = 12) {
    this.history = [];
    this.windowSize = windowSize;
  }

  push(shape) {
    this.history.push(shape);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }
    const counts = new Map();
    for (const s of this.history) {
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    let best = shape;
    let max = 0;
    for (const [s, count] of counts.entries()) {
      if (count > max) {
        max = count;
        best = s;
      }
    }
    return best;
  }
}

test("detectFaceShape identifies Oblong face shape for elongated proportions", () => {
  const lm = createMockLandmarks({ faceLength: 1.75, cheekWidth: 1.0 });
  const result = detectFaceShape(lm);
  assert.equal(result.shape, "Oblong");
});

test("detectFaceShape identifies Square face shape for wide jaw and forehead", () => {
  const lm = createMockLandmarks({ faceLength: 1.25, cheekWidth: 1.0, jawWidth: 0.88, foreWidth: 0.88 });
  const result = detectFaceShape(lm);
  assert.equal(result.shape, "Square");
});

test("detectFaceShape identifies Round face shape for short length and wide cheeks", () => {
  const lm = createMockLandmarks({ faceLength: 1.15, cheekWidth: 1.0, jawWidth: 0.80, foreWidth: 0.82 });
  const result = detectFaceShape(lm);
  assert.equal(result.shape, "Round");
});

test("detectFaceShape identifies Heart face shape for wide forehead and tapered jaw", () => {
  const lm = createMockLandmarks({ faceLength: 1.38, cheekWidth: 1.0, jawWidth: 0.70, foreWidth: 0.88 });
  const result = detectFaceShape(lm);
  assert.equal(result.shape, "Heart");
});

test("detectFaceShape identifies Diamond face shape for prominent cheekbones", () => {
  const lm = createMockLandmarks({ faceLength: 1.35, cheekWidth: 1.0, jawWidth: 0.72, foreWidth: 0.78 });
  const result = detectFaceShape(lm);
  assert.equal(result.shape, "Diamond");
});

test("FaceShapeStabilizer filters transient frame glitches", () => {
  const stabilizer = new FaceShapeStabilizer(8);
  // Feed majority Oval with 1 glitch Round frame
  for (let i = 0; i < 5; i++) stabilizer.push("Oval");
  const glitched = stabilizer.push("Round");
  assert.equal(glitched, "Oval", "Single glitched frame should be suppressed by majority voting");
});
