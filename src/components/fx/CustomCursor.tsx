import { useEffect, useRef } from "react";

/**
 * Premium custom cursor: a crisp dot that tracks instantly plus a lagging
 * ring that expands over interactive elements. Fine-pointer devices only;
 * disabled under reduced motion; fades out over text inputs where the
 * native caret takes over.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("has-custom-cursor");

    let mx = -100;
    let my = -100; // mouse
    let rx = -100;
    let ry = -100; // ring (lerped)
    let scale = 1;
    let targetScale = 1;
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
      if (el.closest("input, textarea, select")) {
        // Native text caret territory — fade the custom cursor back
        targetOpacity = 0;
        targetScale = 1;
        return;
      }
      targetOpacity = 1;
      const interactive = el.closest(
        'a, button, [role="button"], summary, label, [data-cursor="hover"]',
      );
      targetScale = interactive ? 1.9 : 1;
    };

    const onLeave = () => {
      targetOpacity = 0;
    };

    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      scale += (targetScale - scale) * 0.18;
      opacity += (targetOpacity - opacity) * 0.12;

      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      dot.style.opacity = String(opacity);
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      ring.style.opacity = String(opacity * 0.85);

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
      <div
        ref={dotRef}
        aria-hidden="true"
        className="fx-layer pointer-events-none fixed left-0 top-0 z-[100] hidden size-2 rounded-full bg-teal-600 md:block"
        style={{ opacity: 0 }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fx-layer pointer-events-none fixed left-0 top-0 z-[100] hidden size-9 rounded-full border-[1.5px] border-teal-600/45 bg-teal-400/8 backdrop-blur-[2px] md:block"
        style={{ opacity: 0 }}
      />
    </>
  );
}
