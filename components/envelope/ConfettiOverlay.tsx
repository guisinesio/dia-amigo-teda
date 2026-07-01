"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiOverlay() {
  useEffect(() => {
    const fire = (particleRatio: number, opts: confetti.Options) =>
      confetti({
        origin: { y: 0.6 },
        ...opts,
        particleCount: Math.floor(120 * particleRatio),
      });

    setTimeout(() => {
      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#3b6dd8", "#e5484d", "#ffd700"] });
      fire(0.2, { spread: 60, colors: ["#3b6dd8", "#e5484d"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#ffffff", "#f4f5f7"] });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }, 200);
  }, []);

  return null;
}
