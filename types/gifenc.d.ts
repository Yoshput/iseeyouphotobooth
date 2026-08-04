declare module "gifenc" {
  export interface GIFEncoderOptions {
    auto?: boolean;
  }

  export interface WriteFrameOptions {
    palette?: number[][];
    delay?: number;
    repeat?: number;
    dispose?: number;
    transparent?: boolean;
    transparentIndex?: number;
  }

  export interface GIFEncoderInstance {
    writeFrame: (
      data: Uint8Array | Uint8ClampedArray,
      width: number,
      height: number,
      opts?: WriteFrameOptions
    ) => void;
    finish: () => void;
    bytes: () => Uint8Array;
  }

  export function GIFEncoder(opts?: GIFEncoderOptions): GIFEncoderInstance;
  export function quantize(rgbaData: Uint8Array | Uint8ClampedArray, maxColors?: number): number[][];
  export function applyPalette(rgbaData: Uint8Array | Uint8ClampedArray, palette: number[][]): Uint8Array;
}
