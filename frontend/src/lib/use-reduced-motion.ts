import { useEffect, useState } from "react";

/** Reflects the user's OS-level "reduce motion" preference, live. Gate any
 * continuous/ambient animation (pulsing, looping, parallax) behind this —
 * one-shot entrance transitions are generally fine to keep either way. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}