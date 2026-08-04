/**
 * lib/colorFilters.ts
 * Professional Canvas Color Grading Filters for Photobooth Studio.
 */

export interface ColorFilter {
  id: string;
  name: string;
  emoji: string;
  cssFilter: string;
  drawOverlay?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export const COLOR_FILTERS: ColorFilter[] = [
  {
    id: "normal",
    name: "Original",
    emoji: "🌈",
    cssFilter: "none",
  },
  {
    id: "bw-noir",
    name: "B&W Noir",
    emoji: "⬛",
    cssFilter: "grayscale(100%) contrast(125%) brightness(95%)",
  },
  {
    id: "vintage-warm",
    name: "Vintage 90s",
    emoji: "📜",
    cssFilter: "sepia(35%) contrast(110%) brightness(102%) saturate(115%)",
    drawOverlay: (ctx, width, height) => {
      ctx.save();
      ctx.fillStyle = "rgba(255, 220, 180, 0.08)";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    },
  },
  {
    id: "soft-film",
    name: "Soft Film",
    emoji: "🌸",
    cssFilter: "contrast(95%) brightness(108%) saturate(85%) hue-rotate(-5deg)",
    drawOverlay: (ctx, width, height) => {
      ctx.save();
      ctx.fillStyle = "rgba(255, 230, 240, 0.07)";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    },
  },
  {
    id: "emerald-monochrome",
    name: "ISY Emerald",
    emoji: "💚",
    cssFilter: "grayscale(100%) contrast(115%) brightness(98%)",
    drawOverlay: (ctx, width, height) => {
      ctx.save();
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = "rgba(17, 107, 60, 0.45)";
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    },
  },
  {
    id: "cyber-vivid",
    name: "Cyber Pop",
    emoji: "⚡",
    cssFilter: "saturate(140%) contrast(115%) brightness(102%)",
  },
];

export function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  filterId: string,
  width: number,
  height: number
) {
  const filter = COLOR_FILTERS.find((f) => f.id === filterId) || COLOR_FILTERS[0];
  ctx.filter = filter.cssFilter;

  if (filter.drawOverlay) {
    filter.drawOverlay(ctx, width, height);
  }
}
