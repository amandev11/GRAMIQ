import { useEffect, useRef } from "react";

/**
 * Interactive aurora-mesh background — DARK PREMIUM.
 * - Drifting color fields on one canvas (cheap: 4 radial gradients).
 * - Fields lean gently toward the pointer.
 * - Clicking anywhere emits a soft ripple and pushes nearby fields.
 * - Static frame under reduced-motion; paused when the tab is hidden.
 * Colors: deep indigo, electric blue, restrained violet, cyan accent.
 */

interface Blob {
  bx: number; // base position (fraction of viewport)
  by: number;
  r: number; // radius as fraction of min(viewport)
  color: [number, number, number];
  alpha: number;
  phase: number;
  speed: number;
  ox: number; // current offset from base (px)
  oy: number;
}

const BLOBS: Blob[] = [
  { bx: 0.14, by: 0.16, r: 0.52, color: [79, 70, 229], alpha: 0.10, phase: 0.0, speed: 0.00016, ox: 0, oy: 0 },   // indigo
  { bx: 0.86, by: 0.10, r: 0.44, color: [59, 130, 246], alpha: 0.08, phase: 1.7, speed: 0.00013, ox: 0, oy: 0 },   // blue
  { bx: 0.72, by: 0.76, r: 0.50, color: [139, 92, 246], alpha: 0.07, phase: 3.1, speed: 0.00011, ox: 0, oy: 0 },   // violet
  { bx: 0.22, by: 0.84, r: 0.42, color: [34, 211, 238], alpha: 0.06, phase: 4.6, speed: 0.00015, ox: 0, oy: 0 },   // cyan
];

interface Ripple {
  x: number;
  y: number;
  start: number;
}

export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let raf = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pointer + interaction state
    const pointer = { x: -9999, y: -9999 };
    const target = { x: -9999, y: -9999 };
    let hasPointer = false;
    const ripples: Ripple[] = [];

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!hasPointer) {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        hasPointer = true;
      }
    };

    const onClick = (e: PointerEvent) => {
      const now = performance.now();
      ripples.push({ x: e.clientX, y: e.clientY, start: now });
      if (ripples.length > 6) ripples.shift();
      // Push nearby fields away from the click
      for (const b of BLOBS) {
        const bx = b.bx * w + b.ox;
        const by = b.by * h + b.oy;
        const dx = bx - e.clientX;
        const dy = by - e.clientY;
        const dist = Math.hypot(dx, dy) || 1;
        const push = Math.max(0, 90 - dist) * 1.6;
        b.ox += (dx / dist) * push;
        b.oy += (dy / dist) * push;
      }
    };

    const drawFrame = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      // Ease offsets back toward drift path
      for (const b of BLOBS) {
        b.ox *= 0.94;
        b.oy *= 0.94;
      }

      // Pointer easing (used for field lean)
      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      const minDim = Math.min(w, h);
      for (const b of BLOBS) {
        // Slow organic drift around the base position
        const driftX = Math.sin(t * b.speed + b.phase) * minDim * 0.06;
        const driftY = Math.cos(t * b.speed * 1.3 + b.phase) * minDim * 0.05;

        // Gentle lean toward the pointer (max ~70px)
        let leanX = 0;
        let leanY = 0;
        if (hasPointer && pointer.x > 0) {
          const bx = b.bx * w;
          const by = b.by * h;
          const dx = pointer.x - bx;
          const dy = pointer.y - by;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = Math.max(0, 1 - dist / (minDim * 0.9)) * 70;
          leanX = (dx / dist) * pull;
          leanY = (dy / dist) * pull;
        }

        const x = b.bx * w + driftX + leanX + b.ox;
        const y = b.by * h + driftY + leanY + b.oy;
        const radius = b.r * minDim;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const [r, g, bl] = b.color;
        grad.addColorStop(0, `rgba(${r},${g},${bl},${b.alpha})`);
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      // Click ripples
      const now = performance.now();
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        const p = (now - rp.start) / 900;
        if (p >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        const ease = 1 - (1 - p) ** 3;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, ease * 260, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(99,102,241,${(1 - p) * 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, ease * 150, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,211,238,${(1 - p) * 0.04})`;
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      drawFrame(t);
      raf = requestAnimationFrame(loop);
    };

    if (reduced) {
      drawFrame(12000); // single static frame
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onClick);
    }

    let hidden = false;
    const onVisibility = () => {
      if (document.hidden && !reduced) {
        hidden = true;
        cancelAnimationFrame(raf);
      } else if (hidden && !reduced) {
        hidden = false;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fx-layer pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
