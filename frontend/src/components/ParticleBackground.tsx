'use client';
import React, { useEffect, useRef } from 'react';

export const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        // Particles
        const particles: { x: number; y: number; s: number; vy: number; vx: number; alpha: number }[] = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                s: Math.random() * 2 + 0.5,
                vy: -Math.random() * 0.5 - 0.2,
                vx: (Math.random() - 0.5) * 0.2,
                alpha: Math.random() * 0.5 + 0.2
            });
        }

        let animationFrameId: number;

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw particles
            particles.forEach(p => {
                p.y += p.vy;
                p.x += p.vx;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 230, 255, ${p.alpha})`; // Cyan/Whiteish particles
                ctx.fill();
            });

            // "Signal" lines - random horizontal glitch lines
            if (Math.random() > 0.95) {
                const y = Math.random() * height;
                const w = Math.random() * width * 0.5;
                const x = Math.random() * (width - w);
                ctx.fillStyle = `rgba(45, 212, 191, 0.05)`; // Very faint teal
                ctx.fillRect(x, y, w, 1);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        />
    );
};
