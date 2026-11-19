"use client";

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { getImageFaceLandmarker } from "@/lib/mediapipe";
import { computeGlassesAnchor } from "@/lib/landmarks";

export interface PhotoTryOnHandle {
  captureComposite: () => string | null;
}

interface PhotoTryOnCanvasProps {
  imageSrc: string;
  glassesSrc: string;
  fitWidthRatio: number;
  manualScale?: number;
  manualOffsetX?: number;
  manualOffsetY?: number;
  manualRotation?: number;
  onFaceDetected?: (detected: boolean, count: number) => void;
  onLandmarksDetected?: (landmarks: NormalizedLandmark[]) => void;
  onError?: (msg: string) => void;
  className?: string;
}

const PhotoTryOnCanvas = forwardRef<PhotoTryOnHandle, PhotoTryOnCanvasProps>(
  function PhotoTryOnCanvas(
    {
      imageSrc,
      glassesSrc,
      fitWidthRatio = 1.45,
      manualScale = 1.0,
      manualOffsetX = 0,
      manualOffsetY = 0,
      manualRotation = 0,
      onFaceDetected,
      onLandmarksDetected,
      onError,
      className = "",
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [faceLandmarks, setFaceLandmarks] = useState<NormalizedLandmark[] | null>(null);
    const loadedImageRef = useRef<HTMLImageElement | null>(null);
    const loadedGlassesRef = useRef<HTMLImageElement | null>(null);

    // Expose capture method
    useImperativeHandle(ref, () => ({
      captureComposite: () => {
        if (!canvasRef.current) return null;
        try {
          return canvasRef.current.toDataURL("image/jpeg", 0.95);
        } catch {
          return null;
        }
      },
    }));

    // Detect landmarks when imageSrc changes
    useEffect(() => {
      let cancelled = false;
      setIsLoading(true);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = async () => {
        if (cancelled) return;
        loadedImageRef.current = img;

        try {
          const landmarker = await getImageFaceLandmarker();
          if (cancelled) return;

          const result = landmarker.detect(img);
          const faces = result.faceLandmarks ?? [];

          if (faces.length === 0) {
            setFaceLandmarks(null);
            onFaceDetected?.(false, 0);
            onError?.("Wajah tidak terdeteksi pada foto. Silakan gunakan foto yang menampilkan wajah tampak depan dengan jelas.");
          } else {
            setFaceLandmarks(faces[0]);
            onFaceDetected?.(true, faces.length);
            onLandmarksDetected?.(faces[0]);
          }
        } catch (err) {
          console.error("Gagal mendeteksi wajah pada foto:", err);
          onError?.("Gagal memuat model deteksi wajah. Periksa koneksi internet Anda.");
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      img.onerror = () => {
        if (!cancelled) {
          setIsLoading(false);
          onError?.("Format file gambar tidak valid atau rusak.");
        }
      };

      img.src = imageSrc;

      return () => {
        cancelled = true;
      };
    }, [imageSrc, onFaceDetected, onError]);

    // Load glasses image texture
    useEffect(() => {
      if (!glassesSrc) {
        loadedGlassesRef.current = null;
        draw();
        return;
      }

      const gImg = new Image();
      gImg.crossOrigin = "anonymous";
      gImg.onload = () => {
        loadedGlassesRef.current = gImg;
        draw();
      };
      gImg.src = glassesSrc;
    }, [glassesSrc]);

    // Draw canvas
    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      const userImg = loadedImageRef.current;
      if (!canvas || !userImg) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgW = userImg.naturalWidth;
      const imgH = userImg.naturalHeight;

      // Set canvas to photo natural dimensions for crisp full-res output
      if (canvas.width !== imgW || canvas.height !== imgH) {
        canvas.width = imgW;
        canvas.height = imgH;
      }

      ctx.clearRect(0, 0, imgW, imgH);
      ctx.drawImage(userImg, 0, 0, imgW, imgH);

      // Render glasses if landmarks and glasses image are available
      const glassesImg = loadedGlassesRef.current;
      if (faceLandmarks && glassesImg && glassesImg.complete && glassesImg.naturalWidth > 0) {
        const anchor = computeGlassesAnchor(faceLandmarks, imgW, imgH);

        // Calculate size in pixels
        const templePx = anchor.templeWidthNorm * imgW;
        const ipdPx = anchor.ipdNorm * imgW;
        const targetWidthPx = anchor.templeWidthNorm > 0
          ? templePx * 1.035 * (fitWidthRatio ? fitWidthRatio / 1.72 : 1.0)
          : ipdPx * fitWidthRatio;
        const glassesWidthPx = targetWidthPx * manualScale;
        const aspect = glassesImg.naturalHeight / glassesImg.naturalWidth;
        const glassesHeightPx = glassesWidthPx * aspect;

        // Position coordinates in natural photo space
        // Scale manual offsets proportionally to image resolution
        const scaleFactor = imgW / 600;
        const centerX = anchor.centerNormalized.x * imgW + manualOffsetX * scaleFactor;
        const centerY = anchor.centerNormalized.y * imgH - manualOffsetY * scaleFactor;
        const rotationRad = anchor.roll + manualRotation;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotationRad);

        // 3D-like yaw perspective on 2D photo canvas
        if (Math.abs(anchor.yaw) > 0.02) {
          const cosYaw = Math.cos(anchor.yaw * 0.75);
          const skewY = Math.sin(anchor.yaw * 0.35) * 0.15;
          ctx.transform(cosYaw, skewY, 0, 1, 0, 0);
        }

        ctx.drawImage(
          glassesImg,
          -glassesWidthPx / 2,
          -glassesHeightPx / 2,
          glassesWidthPx,
          glassesHeightPx
        );
        ctx.restore();
      }
    }, [faceLandmarks, fitWidthRatio, manualScale, manualOffsetX, manualOffsetY, manualRotation]);

    // Re-draw whenever adjustments or landmarks change
    useEffect(() => {
      draw();
    }, [draw]);

    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-[#18251F] overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#18251F]/70 backdrop-blur-sm text-white">
            <div className="h-7 w-7 rounded-full border-2 border-white/20 border-t-white animate-spin mb-2.5" />
            <p className="text-xs font-medium text-white/90">Mendeteksi wajah pada foto...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="max-h-full max-w-full object-contain shadow-lg rounded-xl"
        />
      </div>
    );
  }
);

export default PhotoTryOnCanvas;
