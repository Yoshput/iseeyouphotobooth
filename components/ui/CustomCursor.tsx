"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export default function CustomCursor() {
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over clickable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("role") === "button" ||
          target.dataset.cursor === "pointer")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      // Spawn click sparkles
      const canvas = canvasRef.current;
      if (!canvas) return;
      const colors = ["#116B3C", "#2FA84F", "#86EFAC", "#FACC15"];
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
        const speed = 2 + Math.random() * 3;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2.5 + Math.random() * 2,
          alpha: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const onMouseUp = () => setIsMouseDown(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // Smooth Lerp loop for ring follower
    let animId: number;
    const render = () => {
      // Lerp ring towards mouse position
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      // Render particle sparkles
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          particlesRef.current.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.035;
            p.size *= 0.95;

            if (p.alpha <= 0) {
              particlesRef.current.splice(index, 1);
            } else {
              ctx.save();
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          });
        }
      }

      animId = requestAnimationFrame(render);
    };

    // Resize particle canvas
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", updateCanvasSize);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Particle Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9999]"
      />

      {/* Center Micro-Dot */}
      <div
        ref={dotRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-isy-green-bright shadow-[0_0_8px_#2FA84F] transition-transform duration-75 ease-out ${
          isMouseDown ? "scale-150 bg-yellow-400" : isHovered ? "scale-125" : "scale-100"
        }`}
      />

      {/* Smooth Following Ring */}
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ease-out ${
          isHovered
            ? "h-11 w-11 border-isy-green-bright bg-isy-green-bright/15 backdrop-blur-[1px] shadow-[0_0_16px_rgba(47,168,79,0.4)]"
            : isMouseDown
            ? "h-7 w-7 border-yellow-400 bg-yellow-400/20 shadow-[0_0_12px_rgba(250,204,21,0.5)]"
            : "h-8 w-8 border-isy-green-deep/50 bg-white/10 backdrop-blur-[0.5px]"
        }`}
      />
    </>
  );
}
