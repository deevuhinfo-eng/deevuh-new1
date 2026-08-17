'use client';

import { useEffect, useRef, useState } from 'react';

export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    setVisible(true);
    document.documentElement.classList.add('cursor-glow-active');

    let mouseX = -500;
    let mouseY = -500;
    let ringX = -500;
    let ringY = -500;

    const ease = 0.1;

    function animate() {
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }

      rafRef.current = requestAnimationFrame(animate);
    }

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const enter = () => setVisible(true);
    const leave = () => setVisible(false);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.btn-lux') ||
        target.closest('[data-cursor-hover]')
      ) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };

    const down = () => setClicking(true);
    const up = () => setClicking(false);

    rafRef.current = requestAnimationFrame(animate);

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseenter', enter);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mousedown', down);
    document.addEventListener('mouseup', up);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseenter', enter);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mousedown', down);
      document.removeEventListener('mouseup', up);
      document.documentElement.classList.remove('cursor-glow-active');
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        ref={glowRef}
        className="cursor-glow-bg"
        style={{
          opacity: hovering ? 0.9 : 0.5,
          transform: 'translate(-50%, -50%)',
        }}
        aria-hidden
      />
      <div
        ref={ringRef}
        className="cursor-glow-ring"
        style={{
          transform: 'translate(-50%, -50%)',
          width: hovering ? 52 : 36,
          height: hovering ? 52 : 36,
          borderColor: clicking ? 'hsl(var(--foreground))' : hovering ? 'hsl(var(--foreground) / 0.7)' : 'hsl(var(--foreground) / 0.25)',
          backgroundColor: clicking ? 'hsl(var(--foreground) / 0.1)' : 'transparent',
        }}
        aria-hidden
      />
      <div
        ref={dotRef}
        className="cursor-glow-dot"
        style={{
          transform: 'translate(-50%, -50%) scale(' + (clicking ? 0.6 : hovering ? 0 : 1) + ')',
          opacity: hovering ? 0 : 1,
        }}
        aria-hidden
      />
    </>
  );
}
