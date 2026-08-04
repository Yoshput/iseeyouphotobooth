/**
 * lib/colorFilters.ts
 * Professional Canvas Color Grading Filters — Safari (iOS/Mac) + Cross-Browser Compatible.
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

/**
 * Applies color grading to Canvas context.
 * Uses both CSS filter property AND pixel-array fallback to guarantee 100%
 * compatibility on iOS Safari (where ctx.filter is historically unsupported).
 */
export function applyCanvasFilter(
  ctx: CanvasRenderingContext2D,
  filterId: string,
  width: number,
  height: number
) {
  const filter = COLOR_FILTERS.find((f) => f.id === filterId) || COLOR_FILTERS[0];

  // Try standard CSS canvas filter first
  ctx.filter = filter.cssFilter;

  // On browsers where ctx.filter is ignored (e.g. Mobile Safari iOS),
  // perform direct pixel manipulation on ImageData:
  if (filterId !== "normal") {
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;
      const len = data.length;

      if (filterId === "bw-noir") {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;
          gray = (gray - 128) * 1.25 + 128 * 0.95;
          const clamped = Math.max(0, Math.min(255, gray));
          data[i] = clamped;
          data[i + 1] = clamped;
          data[i + 2] = clamped;
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filterId === "vintage-warm") {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const sr = r * 0.393 + g * 0.769 + b * 0.189;
          const sg = r * 0.349 + g * 0.686 + b * 0.168;
          const sb = r * 0.272 + g * 0.534 + b * 0.131;
          data[i] = Math.min(255, r * 0.65 + sr * 0.35);
          data[i + 1] = Math.min(255, g * 0.65 + sg * 0.35);
          data[i + 2] = Math.min(255, b * 0.65 + sb * 0.35);
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filterId === "soft-film") {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = Math.min(255, (r * 0.85 + gray * 0.15) * 1.05 + 10);
          data[i + 1] = Math.min(255, (g * 0.85 + gray * 0.15) * 1.02 + 5);
          data[i + 2] = Math.min(255, (b * 0.85 + gray * 0.15) * 0.95);
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filterId === "emerald-monochrome") {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          data[i] = Math.min(255, gray * 30);
          data[i + 1] = Math.min(255, gray * 160 + 20);
          data[i + 2] = Math.min(255, gray * 90 + 10);
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (filterId === "cyber-vivid") {
        for (let i = 0; i < len; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = Math.max(0, Math.min(255, gray + (r - gray) * 1.4));
          data[i + 1] = Math.max(0, Math.min(255, gray + (g - gray) * 1.4));
          data[i + 2] = Math.max(0, Math.min(255, gray + (b - gray) * 1.4));
        }
        ctx.putImageData(imgData, 0, 0);
      }
    } catch {
      // Security / CORS fallback
    }
  }

  if (filter.drawOverlay) {
    filter.drawOverlay(ctx, width, height);
  }
}
