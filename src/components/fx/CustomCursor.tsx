import { useEffect, useRef } from "react";

/**
 * GRAMIQ cursor system — minimal, precise, premium.
 * - Crisp dot tracks instantly; soft ring lags with interpolation.
 * - Expands subtly over interactive elements (buttons, links, wheel items).
 * - Magnetic attraction toward buttons (gentle, never blocks clicking).
 * - Fades over text inputs (native caret takes over).
 *
 * Disabled on: touch devices, coarse pointers, reduced-motion users.
 * The native cursor is never hidden on unsupported devices.
 */

/** Elements the ring should expand for. */
const INTERACTIVE = 'a, button, [role="button"], [role="option"], [role="switch"], summary, label, input[type="checkbox"]';
/** Elements that trigger magnetic pull. */
const MAGNETIC = "button, a";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-custom-cursor");

    // Raw pointer position
    let mx = -100;
    let my = -100;
    // Interpolated ring position
    let rx = -100;
    let ry = -100;
    // Ring scale + glow intensity
    let scale = 1;
    let targetScale = 1;
    let glow = 0;
    let targetGlow = 0;
    // Magnetic offset applied to dot+ring near buttons
    let magX = 0;
    let magY = 0;
    let opacity = 0;
    let targetOpacity = 0;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      targetOpacity = 1;
    };

    const onOver = (e: Event) => {
      const el = e.target as Element | null;
      if (!el || !(el instanceof Element)) return;

      // Native text caret territory — fade out completely
      if (el.closest("input:not([type='checkbox']), textarea")) {
        targetOpacity = 0;
        targetScale = 1;
        targetGlow = 0;
        return;
      }

      targetOpacity = 1;
      const interactive = el.closest(INTERACTIVE);
      targetScale = interactive ? 1.7 : 1;
      // Subtle glow only for primary interactive elements
      targetGlow = interactive ? 1 : 0;
    };

    const onLeave = () => {
      targetOpacity = 0;
    };

    const loop = () => {
      // Ring follows with smooth interpolation
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      scale += (targetScale - scale) * 0.16;
      glow += (targetGlow - glow) * 0.14;
      opacity += (targetOpacity - opacity) * 0.12;

      // Gentle magnetic attraction toward buttons/links (max ~6px pull)
      let tMagX = 0;
      let tMagY = 0;
      if (targetGlow > 0.5 && typeof document !== "undefined") {
        const hovered = document.elementFromPoint(mx, my);
        if (hovered) {
          const btn = hovered.closest(MAGNETIC);
          if (btn) {
            const r = btn.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = cx - mx;
            const dy = cy - my;
            // Pull proportional to proximity within the button bounds
            const inside = Math.abs(dx) < r.width / 2 + 12 && Math.abs(dy) < r.height / 2 + 12;
            if (inside) {
              tMagX = dx * 0.08;
              tMagY = dy * 0.08;
            }
          }
        }
      }
      magX += (tMagX - magX) * 0.2;
      magY += (tMagY - magY) * 0.2;

      // Dot — instant tracking plus magnetic offset
      dot.style.transform = `translate3d(${mx + magX}px, ${my + magY}px, 0) translate(-50%, -50%)`;
      dot.style.opacity = String(opacity);
      // Ring — lagged follow with expansion and glow
      ring.style.transform = `translate3d(${rx + magX * 0.5}px, ${ry + magY * 0.5}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      ring.style.opacity = String(opacity * 0.85);
      ring.style.boxShadow = `0 0 ${(glow * 14).toFixed(1)}px oklch(0.60 0.14 258 / ${(glow * 0.35).toFixed(3)})`;

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      {/* Precise dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fx-layer pointer-events-none fixed left-0 top-0 z-[100] hidden size-[7px] rounded-full bg-indigo-300 md:block"
        style={{ opacity: 0 }}
      />
      {/* Lagging ring — expands on interactive elements, glows subtly on buttons */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fx-layer pointer-events-none fixed left-0 top-0 z-[100] hidden size-8 rounded-full border border-indigo-400/50 bg-indigo-400/[0.06] backdrop-blur-[1px] transition-shadow md:block"
        style={{ opacity: 0 }}
      />
    </>
  );
}
