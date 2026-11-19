import test from "node:test";
import assert from "node:assert/strict";

// Replica of calculateFrameMatch from lib/faceShape.ts
function calculateFrameMatch(shape, frame) {
  if (frame.id === "none" || frame.excludeFromAiMatch || frame.lensType === "tinted") {
    return {
      score: 0,
      isRecommended: false,
      reasons: ["Frame netral atau kacamata hitam tidak diikutsertakan dalam kalkulasi AI Match."],
    };
  }

  const isExplicitlyRecommended = frame.recommendedFor.includes(shape);
  const reasons = [];

  // Contrast score
  let contrastScore = 20;
  if (isExplicitlyRecommended) {
    contrastScore = 40;
    reasons.push(`Direkomendasikan secara optimal untuk wajah ${shape}.`);
  } else if (shape === "Oval") {
    contrastScore = 36;
    reasons.push("Struktur wajah oval fleksibel dan serasi dengan siluet frame ini.");
  } else if (frame.recommendedFor.length >= 4) {
    contrastScore = 28;
    reasons.push("Siluet serbaguna yang cukup adaptif.");
  } else {
    contrastScore = 15;
  }

  // Proportion score
  let proportionScore = 25;
  const ratio = frame.fitWidthRatio || 1.45;
  if (ratio >= 1.44 && ratio <= 1.52) {
    proportionScore = 30;
    reasons.push("Lebar frame proporsional membingkai pelipis tanpa menekan sisi samping wajah.");
  }

  // Style score
  let styleScore = 18;
  const lowerStyle = (frame.style || "").toLowerCase();
  if (lowerStyle.includes("browline") || lowerStyle.includes("clubmaster")) {
    styleScore = 20;
  }

  const colorScore = 9;
  const totalScore = Math.min(100, Math.round(contrastScore + proportionScore + styleScore + colorScore));
  const isRecommended = totalScore >= 75 || isExplicitlyRecommended;

  return {
    score: totalScore,
    isRecommended,
    reasons,
  };
}

test("calculateFrameMatch awards high score and reasons for recommended shapes", () => {
  const frame = {
    id: "clubmaster-real",
    name: "Kotak Clubmaster Real",
    style: "Browline",
    fitWidthRatio: 1.50,
    recommendedFor: ["Oval", "Round", "Square", "Oblong"],
  };

  const matchOval = calculateFrameMatch("Oval", frame);
  assert.ok(matchOval.score >= 85, `Score should be >= 85, got ${matchOval.score}`);
  assert.equal(matchOval.isRecommended, true);
  assert.ok(matchOval.reasons.length >= 2, "Must return descriptive reasons in Indonesian");
});

test("calculateFrameMatch excludes tinted sunglasses from recommendation", () => {
  const sunglasses = {
    id: "sunglasses-real",
    name: "Sun Glasses Hitam Real",
    lensType: "tinted",
    excludeFromAiMatch: true,
    recommendedFor: [],
  };

  const match = calculateFrameMatch("Oval", sunglasses);
  assert.equal(match.score, 0);
  assert.equal(match.isRecommended, false);
});
