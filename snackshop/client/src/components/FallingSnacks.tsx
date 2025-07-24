import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

interface FallingSnacksProps {
  count?: number;
}

export default function FallingSnacks({ count = 60 }: FallingSnacksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const snackIcons = ["🍿", "🍫", "🍬", "🍪", "🍩"];

  const iconsRef = useRef<string[]>(
    Array.from({ length: count }).map(
      () => snackIcons[Math.floor(Math.random() * snackIcons.length)]
    )
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    gsap.set(container, { visibility: "visible" });

    const nodes = Array.from(container.children) as HTMLElement[];
    nodes.forEach((node) => {
      const startX = Math.random() * window.innerWidth;
      const fallDuration = 5 + Math.random() * 5;
      const delay = Math.random() * 5;
      const initialY = -gsap.utils.random(50, 150);

      gsap.set(node, {
        x: startX,
        y: initialY,
        rotation: Math.random() * 360,
      });
      gsap.to(node, {
        y: window.innerHeight + 50,
        rotation: "+=" + Math.random() * 360,
        duration: fallDuration,
        delay,
        ease: "none",
        repeat: -1,
      });
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 invisible"
    >
      {iconsRef.current.map((Icon, i) => (
        <div key={i} className="absolute text-3xl opacity-20">
          {Icon}
        </div>
      ))}
    </div>
  );
}
