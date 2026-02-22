import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import WelcomeHeader from './components/WelcomeHeader';
import SignUpForm from './components/SignUpForm';

const GlitterCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#4ade80' : '#6ee7b7',
    }));
    let animId; let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      dots.forEach((dot) => {
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * dot.speed * 60 + dot.phase));
        ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = dot.color;
        ctx.shadowColor = dot.color; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
};

const NAVBAR_HEIGHT = 60;

const SignUp = () => {
  return (
    <>
      <Helmet>
        <title>Create Your Account - FoodNutritionAI</title>
        <meta name="description" content="Join FoodNutritionAI to start analyzing your food images." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`* { font-family: 'DM Sans', sans-serif !important; }`}</style>
      </Helmet>

      <div style={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden', background: 'linear-gradient(135deg, #0a1628 0%, #0d1f2d 40%, #0a1a1a 100%)', fontFamily: "'DM Sans', sans-serif" }}>
        <GlitterCanvas />
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,231,183,0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* ── FIXED NAVBAR ── */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', padding: '0 20px', height: `${NAVBAR_HEIGHT}px`, background: '#0d1f2d', borderBottom: '1px solid rgba(255,255,255,0.08)', fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 3.5C12 3.5 12.5 2 14 2C14 3.5 12.8 4.2 12 3.5Z" fill="white" opacity="0.9"/>
                <path d="M8.5 6C6.5 6 4 8 4 11.5C4 15.5 6.5 20 8.5 20C9.5 20 10 19.5 12 19.5C14 19.5 14.5 20 15.5 20C17.5 20 20 15.5 20 11.5C20 8 17.5 6 15.5 6C14.5 6 13.5 6.5 12 6.5C10.5 6.5 9.5 6 8.5 6Z" fill="white"/>
                <circle cx="9.5" cy="10.5" r="1.2" fill="rgba(22,163,74,0.5)"/>
              </svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px', fontFamily: "'DM Sans', sans-serif" }}>FoodNutritionAI</span>
          </div>
        </div>

        {/* Card */}
        <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', paddingTop: `${NAVBAR_HEIGHT + 32}px` }}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', maxWidth: '560px' }}
          >
            <div
              className="transition-all duration-500 ease-out"
              style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '3rem', padding: 'clamp(32px, 5vw, 48px)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', fontFamily: "'DM Sans', sans-serif" }}
            >
              <WelcomeHeader />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="mt-8">
                <SignUpForm />
              </motion.div>
            </div>
            <div className="text-center mt-8">
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
                &copy; {new Date()?.getFullYear()} FoodNutritionAI. Secure Registration.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default SignUp;