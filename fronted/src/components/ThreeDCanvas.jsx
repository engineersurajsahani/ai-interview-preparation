import React, { useEffect, useRef } from 'react';

/**
 * 3D Interactive Cyber Particle & Hologram Canvas
 * Creates dynamic 3D floating nodes, constellation matrix, glowing energy waves,
 * and mouse-driven 3D parallax depth effect.
 */
function ThreeDCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Generate 3D Particle Field
    const particleCount = Math.min(80, Math.floor(width / 20));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 + 100, // 3D depth
        radius: Math.random() * 2 + 1,
        color: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#06b6d4' : '#a855f7',
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.6
      });
    }

    const fov = 350;

    const render = () => {
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const offsetX = (mouseX - width / 2) * 0.25;
      const offsetY = (mouseY - height / 2) * 0.25;

      ctx.clearRect(0, 0, width, height);

      // Projected particles
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap boundaries in 3D
        if (p.z <= 10) p.z = 800;
        if (p.z > 800) p.z = 10;
        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;

        // 3D Perspective Projection
        const scale = fov / (fov + p.z);
        const projX = (p.x - offsetX) * scale + width / 2;
        const projY = (p.y - offsetY) * scale + height / 2;
        const projSize = Math.max(0.5, p.radius * scale * 2.2);

        projected.push({ x: projX, y: projY, size: projSize, z: p.z, color: p.color, scale });
      }

      // Draw Connection Lines in 3D Space
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18 * (p1.scale * p2.scale);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw Particles with Glowing Depth
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) continue;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, Math.max(0.15, p.scale * 1.5));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring for prominent particles
        if (p.size > 2.5) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1.0;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}

export default ThreeDCanvas;
