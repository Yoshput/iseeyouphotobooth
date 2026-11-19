import test from "node:test";
import assert from "node:assert/strict";

const BRANCHES = [
  { id: "purwokerto", name: "Optik I See You - Purwokerto", city: "Purwokerto", waNumber: "62895415614261" },
  { id: "wonosobo", name: "Optik I See You - Wonosobo", city: "Wonosobo", waNumber: "628977129039" },
  { id: "cilacap", name: "Optik I See You - Cilacap", city: "Cilacap", waNumber: "6285135930533" },
  { id: "purbalingga", name: "Optik I See You - Purbalingga", city: "Purbalingga", waNumber: "6282234862322" },
];

function generateWhatsAppUrl(branchId, frameName, faceShape) {
  const branch = BRANCHES.find((b) => b.id === branchId) || BRANCHES[0];
  const shapeNote = faceShape ? ` (Rekomendasi Wajah: ${faceShape})` : "";
  const msg = `Halo ${branch.name}, saya baru saja mencoba frame "${frameName}"${shapeNote} di Virtual Try-On website Optik I See You. Apakah model ini tersedia di cabang ${branch.city}? Terima kasih.`;
  return `https://wa.me/${branch.waNumber}?text=${encodeURIComponent(msg)}`;
}

test("generateWhatsAppUrl routes to Purwokerto branch with pre-filled message", () => {
  const url = generateWhatsAppUrl("purwokerto", "Kotak Clubmaster Real", "Oval");
  assert.ok(url.startsWith("https://wa.me/62895415614261?text="));
  assert.ok(url.includes(encodeURIComponent("Kotak Clubmaster Real")));
  assert.ok(url.includes(encodeURIComponent("Purwokerto")));
});

test("generateWhatsAppUrl routes to Wonosobo branch with verified phone", () => {
  const url = generateWhatsAppUrl("wonosobo", "Cateye Pastel", "Heart");
  assert.ok(url.startsWith("https://wa.me/628977129039?text="));
  assert.ok(url.includes(encodeURIComponent("Wonosobo")));
});

test("generateWhatsAppUrl routes to Cilacap branch with verified phone", () => {
  const url = generateWhatsAppUrl("cilacap", "Hexagonal Rose Gold", "Diamond");
  assert.ok(url.startsWith("https://wa.me/6285135930533?text="));
  assert.ok(url.includes(encodeURIComponent("Cilacap")));
});

test("generateWhatsAppUrl routes to Purbalingga branch with verified phone", () => {
  const url = generateWhatsAppUrl("purbalingga", "Square Plastik Hitam Real", "Round");
  assert.ok(url.startsWith("https://wa.me/6282234862322?text="));
  assert.ok(url.includes(encodeURIComponent("Purbalingga")));
});
