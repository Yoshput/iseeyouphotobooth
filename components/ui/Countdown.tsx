"use client";

/**
 * Countdown.tsx · configurable 3–2–1 (or 5–4–3–2–1 / 10–…–1) countdown
 * Calls onComplete after the last digit fades out.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface CountdownProps {
 /** Duration per digit in seconds (default 1 s) — controls how fast we count */
 duration?: number;
 /** Starting number for the countdown (default 3) */
 from?: number;
 onComplete: () => void;
}

export default function Countdown({
 duration = 1,
 from = 3,
 onComplete,
}: CountdownProps) {
 const digitRef = useRef<HTMLSpanElement>(null);
 const progressRef = useRef<HTMLDivElement>(null);
 const onCompleteRef = useRef(onComplete);
 onCompleteRef.current = onComplete;

 useEffect(() => {
 const el = digitRef.current;
 const ring = progressRef.current;
 if (!el) return;

 const holdTime = Math.max(duration - 0.46, 0.2); // visible hold per digit
 const digits = Array.from({ length: from }, (_, i) => from - i); // [from, from-1, ..., 1]

 const tl = gsap.timeline({ onComplete: () => onCompleteRef.current() });

 // Progress ring animation (full circle over total duration)
 if (ring) {
 gsap.fromTo(ring,
 { "--progress": "0%" },
 { "--progress": "100%", duration: from * duration, ease: "none" }
 );
 }

 digits.forEach((n) => {
 tl
 .call(() => { el.textContent = String(n); })
 .fromTo(el,
 { scale: 1.4, opacity: 0 },
 { scale: 1, opacity: 1, duration: 0.22, ease: "back.out(1.8)" }
 )
 .to(el, {
 opacity: 0,
 duration: 0.18,
 ease: "power1.in",
 delay: holdTime,
 });
 });

 return () => { tl.kill(); };
 }, [duration, from]); // eslint-disable-line react-hooks/exhaustive-deps

 return (
 <div className="absolute inset-0 z-30 flex items-center justify-center">
 {/* Outer glow ring */}
 <div className="relative flex h-36 w-36 items-center justify-center">
 {/* Pulse ring */}
 <div className="absolute inset-0 animate-ping rounded-full bg-isy-green-bright/20" />
 {/* White card */}
 <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-white/95 shadow-2xl ring-4 ring-isy-green-bright/40 backdrop-blur-sm">
 <span
 ref={digitRef}
 aria-live="assertive"
 className="select-none font-sans text-7xl font-black tabular-nums text-isy-green-deep"
 />
 </div>
 {/* Small "foto ke" label at bottom */}
 <div ref={progressRef} className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-isy-green-deep/80 px-3 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
 Bersiap…
 </div>
 </div>
 </div>
 );
}
