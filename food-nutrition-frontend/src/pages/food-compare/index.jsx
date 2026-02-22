import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import Icon from '../../components/AppIcon';

/* ═══════════════════════════════════════════
   GLITTER / SPARKLE LAYER
═══════════════════════════════════════════ */
const DOTS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top:      `${(Math.sin(i * 137.5) * 0.5 + 0.5) * 100}%`,
  left:     `${(Math.cos(i * 97.3)  * 0.5 + 0.5) * 100}%`,
  size:     i % 3 === 0 ? 3 : 2,
  duration: `${2.5 + (i % 7) * 0.6}s`,
  delay:    `${(i % 11) * 0.45}s`,
}));

const glitterCSS = `
  @keyframes glitter-blink {
    0%,100% { opacity:0; transform:scale(0.3); }
    50%      { opacity:1; transform:scale(1);   }
  }
`;

const GlitterLayer = () => (
  <>
    <style>{glitterCSS}</style>
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {DOTS.map(d => (
        <span key={d.id} style={{
          position: 'absolute',
          top: d.top, left: d.left,
          width: d.size, height: d.size,
          borderRadius: '50%',
          background: '#34d399',
          boxShadow: `0 0 ${d.size + 3}px ${d.size}px rgba(52,211,153,0.5)`,
          animation: `glitter-blink ${d.duration} ${d.delay} ease-in-out infinite`,
        }} />
      ))}
    </div>
  </>
);

/* ═══════════════════════════════════════════
   ANIMATED BACKGROUND CANVAS
═══════════════════════════════════════════ */
const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 25000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.18 + 0.04,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${p.opacity})`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.05 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    const handleResize = () => { resize(); createParticles(); };

    resize();
    createParticles();
    animate();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}
      aria-hidden="true"
    />
  );
};

/* ═══════════════════════════════════════════
   VS BADGE
═══════════════════════════════════════════ */
const VsBadge = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, flexShrink: 0 }}>
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: -6, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 70%)',
        animation: 'vsPulse 2s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #22c55e, transparent, #22c55e)',
        animation: 'vsSpin 3s linear infinite',
        padding: 2,
      }} />
      <div style={{
        position: 'absolute', inset: -1, borderRadius: '50%',
        background: '#0d1117',
      }} />
      <div style={{
        position: 'relative',
        width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.08))',
        border: '1.5px solid rgba(34,197,94,0.35)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 24px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
      }}>
        <Icon name="Zap" size={12} color="#22c55e" />
        <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>VS</span>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   SLOT COLOR THEMES  (dark-mode aware)
═══════════════════════════════════════════ */
const SLOT_THEME = {
  1: {
    primary:      '#22c55e',
    dark:         '#16a34a',
    rgb:          '34,197,94',
    iconBg:       'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.1))',
    iconBorder:   'rgba(34,197,94,0.22)',
    cardBg:       'rgba(22,27,34,0.85)',
    glowTop:      'rgba(34,197,94,0.07)',
    sparkle:      'rgba(34,197,94,0.22)',
    shimmer:      '#22c55e',
    label:        'Food 1',
    accentLabel:  '#34d399',
  },
  2: {
    primary:      '#3b82f6',
    dark:         '#2563eb',
    rgb:          '59,130,246',
    iconBg:       'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(99,102,241,0.1))',
    iconBorder:   'rgba(59,130,246,0.22)',
    cardBg:       'rgba(22,27,34,0.85)',
    glowTop:      'rgba(59,130,246,0.07)',
    sparkle:      'rgba(59,130,246,0.22)',
    shimmer:      '#3b82f6',
    label:        'Food 2',
    accentLabel:  '#60a5fa',
  },
};

/* ═══════════════════════════════════════════
   UPLOAD SLOT
═══════════════════════════════════════════ */
const UploadSlot = ({ slot, food, loading, error, onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const inputRef = useRef(null);
  const t = SLOT_THEME[slot] || SLOT_THEME[1];

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && inputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      onFileSelect({ target: inputRef.current }, slot);
    }
  };

  const borderStyle = food
    ? `1.5px solid rgba(${t.rgb},0.4)`
    : isDragging
    ? `2px solid rgba(${t.rgb},0.7)`
    : `1.5px solid rgba(${t.rgb},0.2)`;

  const cardScale = isPressed ? 'scale(0.97)' : isDragging ? 'scale(1.02)' : 'scale(1)';

  return (
    <div style={{ flex: 1, animation: `slideUp 0.5s ${slot === 1 ? '0.2s' : '0.4s'} both` }}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => { setIsPressed(false); setIsDragging(false); }}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        style={{
          position: 'relative', borderRadius: 22, overflow: 'hidden',
          border: borderStyle,
          background: t.cardBg,
          backdropFilter: 'blur(20px)',
          boxShadow: isPressed
            ? `0 2px 12px rgba(${t.rgb},0.08), inset 0 1px 0 rgba(255,255,255,0.04)`
            : isDragging
            ? `0 12px 48px rgba(${t.rgb},0.2), inset 0 1px 0 rgba(255,255,255,0.06)`
            : `0 4px 32px rgba(${t.rgb},0.1), 0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
          transform: cardScale,
          transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease',
          cursor: 'pointer',
        }}
      >
        {!food && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at 50% 0%, ${t.glowTop} 0%, transparent 65%)`,
            borderRadius: 22,
          }} />
        )}

        {!food && !loading && !error && (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', cursor: 'pointer', gap: 12 }}>
            <div style={{ position: 'relative', marginBottom: 4 }}>
              <div style={{
                width: 68, height: 68, borderRadius: 18,
                background: t.iconBg,
                border: `1px solid ${t.iconBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s',
              }}>
                <Icon name="Upload" size={28} color={t.primary} />
              </div>
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 20, height: 20, borderRadius: '50%',
                background: t.sparkle,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'vsPulse 2s ease-in-out infinite',
              }}>
                <Icon name="Sparkles" size={10} color={t.primary} />
              </div>
            </div>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: t.accentLabel, margin: 0 }}>{t.label}</p>
            <p style={{ fontSize: '0.875rem', color: '#8b949e', textAlign: 'center', margin: 0 }}>
              Drop image here or click to upload
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
              <Icon name="Image" size={12} />
              <span>JPG, PNG, WebP</span>
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFileSelect(e, slot)} />
          </label>
        )}

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: `3px solid rgba(${t.rgb},0.15)`, borderTopColor: t.primary, animation: 'vsSpin 0.9s linear infinite' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="Sparkles" size={20} color={t.primary} />
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#8b949e', animation: 'vsPulse 1.5s ease-in-out infinite' }}>
              AI is analyzing your food...
            </p>
            <div style={{ width: 120, height: 6, borderRadius: 999, background: `rgba(${t.rgb},0.1)`, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, transparent, ${t.primary}, transparent)`, animation: 'shimmer 1.5s ease-in-out infinite', backgroundSize: '200% 100%' }} />
            </div>
          </div>
        )}

        {food && !loading && (
          <div style={{ padding: '1rem', animation: 'scaleIn 0.35s ease' }}>
            <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
              <img src={food.preview} alt={food.foodName} style={{ width: '100%', height: 176, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                <h3 style={{ fontWeight: 800, color: '#fff', fontSize: '1rem', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  {food.foodName}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px',
                borderRadius: 999, fontSize: '0.8rem', fontWeight: 700,
                background: food.healthScore >= 7 ? 'rgba(34,197,94,0.1)' : food.healthScore >= 5 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                color: food.healthScore >= 7 ? '#34d399' : food.healthScore >= 5 ? '#fbbf24' : '#f87171',
                border: `1px solid ${food.healthScore >= 7 ? 'rgba(34,197,94,0.3)' : food.healthScore >= 5 ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Score</span>
                <span style={{ fontSize: '1rem' }}>{food.healthScore}/10</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
              {[
                { label: 'Protein', value: food.macros.protein, color: '#34d399' },
                { label: 'Carbs',   value: food.macros.carbohydrates, color: '#38bdf8' },
                { label: 'Fat',     value: food.macros.fat, color: '#fbbf24' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 800, color: m.color, margin: 0 }}>{m.value}g</p>
                  <p style={{ fontSize: '0.65rem', color: '#8b949e', margin: 0 }}>{m.label}</p>
                </div>
              ))}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.75rem', color: '#34d399', cursor: 'pointer', padding: '6px', borderRadius: 8 }}>
              <Icon name="RefreshCw" size={12} color="#34d399" />
              Change image
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFileSelect(e, slot)} />
            </label>
          </div>
        )}

        {error && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Icon name="AlertCircle" size={22} color="#f87171" />
            </div>
            <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: '#34d399', cursor: 'pointer', padding: '8px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.08)' }}>
              <Icon name="RefreshCw" size={13} color="#34d399" /> Try again
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFileSelect(e, slot)} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   NUTRIENT BAR  ← FIXED
═══════════════════════════════════════════ */
const NutrientBar = ({ value, maxValue, isWinner, side, delay }) => {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPct(maxValue > 0 ? (value / maxValue) * 100 : 0), delay);
    return () => clearTimeout(t);
  }, [value, maxValue, delay]);

  return (
    <div style={{
      height: 6, borderRadius: 999,
      background: 'rgba(255,255,255,0.07)',
      overflow: 'hidden', width: '100%',
      direction: side === 'left' ? 'rtl' : 'ltr',
    }}>
      <div style={{
        height: '100%',
        borderRadius: 999,
        width: `${pct}%`,
        background: isWinner ? 'linear-gradient(90deg, #16a34a, #22c55e)' : 'rgba(255,255,255,0.12)',
        boxShadow: isWinner ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
        transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)',
      }} />
    </div>
  );
};

/* ═══════════════════════════════════════════
   COMPARISON TABLE
═══════════════════════════════════════════ */
const metrics = [
  { key: 'calories',      label: 'Calories', unit: 'kcal', lowerIsBetter: true  },
  { key: 'protein',       label: 'Protein',  unit: 'g',    lowerIsBetter: false },
  { key: 'carbohydrates', label: 'Carbs',    unit: 'g',    lowerIsBetter: false },
  { key: 'fat',           label: 'Fat',      unit: 'g',    lowerIsBetter: true  },
  { key: 'fiber',         label: 'Fiber',    unit: 'g',    lowerIsBetter: false },
  { key: 'sugar',         label: 'Sugar',    unit: 'g',    lowerIsBetter: true  },
];

const getWinner = (food1, food2, key) => {
  const v1 = key === 'calories' ? food1.calories : food1.macros[key];
  const v2 = key === 'calories' ? food2.calories : food2.macros[key];
  if (key === 'calories' || key === 'fat' || key === 'sugar') return v1 < v2 ? 1 : v1 > v2 ? 2 : 0;
  return v1 > v2 ? 1 : v1 < v2 ? 2 : 0;
};

const getHealthWinner = (food1, food2) => {
  if (food1.healthScore > food2.healthScore) return 1;
  if (food2.healthScore > food1.healthScore) return 2;
  return 0;
};

const ComparisonTable = ({ food1, food2 }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  const healthWin = getHealthWinner(food1, food2);
  const maxValues = metrics.reduce((acc, m) => {
    const v1 = m.key === 'calories' ? food1.calories : food1.macros[m.key];
    const v2 = m.key === 'calories' ? food2.calories : food2.macros[m.key];
    acc[m.key] = Math.max(v1, v2);
    return acc;
  }, {});

  return (
    <div style={{
      background: 'rgba(22,27,34,0.85)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24, overflow: 'hidden',
      border: '1px solid rgba(48,54,61,0.8)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
    }}>
      {healthWin !== 0 && (
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05), rgba(34,197,94,0.1))',
          borderBottom: '1px solid rgba(34,197,94,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 20px' }}>
            <Icon name="Trophy" size={20} color="#f59e0b" />
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#e6edf3' }}>
              {healthWin === 1 ? food1.foodName : food2.foodName} is the Healthier Choice!
            </span>
            <Icon name="Trophy" size={20} color="#f59e0b" />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: '1px solid rgba(48,54,61,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          {food1.preview && <img src={food1.preview} alt={food1.foodName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />}
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e6edf3' }}>{food1.foodName}</span>
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.12em' }}>vs</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e6edf3' }}>{food2.foodName}</span>
          {food2.preview && <img src={food2.preview} alt={food2.foodName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} />}
        </div>
      </div>

      {/* ── Color Legend ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20,
        padding: '10px 20px',
        background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(48,54,61,0.4)',
        flexWrap: 'wrap',
      }}>
        {[
          { color: '#22c55e', shadow: 'rgba(34,197,94,0.5)',  label: 'Winner' },
          { color: '#60a5fa', shadow: 'rgba(96,165,250,0.4)', label: 'Tie' },
          { color: 'rgba(255,255,255,0.15)', shadow: 'none',  label: 'Loser' },
        ].map(({ color, shadow, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 28, height: 6, borderRadius: 999,
              background: color,
              boxShadow: shadow !== 'none' ? `0 0 8px ${shadow}` : 'none',
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#8b949e' }}>{label}</span>
          </div>
        ))}
      </div>

      {metrics.map((metric, i) => {
        const winner = getWinner(food1, food2, metric.key);
        const v1 = metric.key === 'calories' ? food1.calories : food1.macros[metric.key];
        const v2 = metric.key === 'calories' ? food2.calories : food2.macros[metric.key];
        const isTie = winner === 0;
        return (
          <div key={metric.key} style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 1fr', alignItems: 'center', gap: 12,
            padding: '12px 20px',
            background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            borderBottom: '1px solid rgba(48,54,61,0.4)',
          }}>
            {/* LEFT — value right-aligned, bar grows right→left */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {winner === 1 && (
                  <>
                    <Icon name="Check" size={12} color="#34d399" />
                    <Icon name={metric.lowerIsBetter ? 'TrendingDown' : 'TrendingUp'} size={11} color="#34d399" />
                  </>
                )}
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: winner === 1 ? '#34d399' : isTie ? '#60a5fa' : '#e6edf3' }}>
                  {v1}<span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#8b949e', marginLeft: 2 }}>{metric.unit}</span>
                </span>
              </div>
              <div style={{
                height: 6, borderRadius: 999,
                background: 'rgba(255,255,255,0.07)',
                overflow: 'hidden', width: '100%',
                direction: 'rtl',
              }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${maxValues[metric.key] > 0 ? (v1 / maxValues[metric.key]) * 100 : 0}%`,
                  background: winner === 1
                    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                    : isTie
                    ? 'linear-gradient(90deg, #2563eb, #60a5fa)'
                    : 'rgba(255,255,255,0.15)',
                  boxShadow: winner === 1 ? '0 0 8px rgba(34,197,94,0.5)' : isTie ? '0 0 8px rgba(96,165,250,0.4)' : 'none',
                  transition: `width 1s ${200 + i * 120}ms cubic-bezier(0.34,1.56,0.64,1)`,
                }} />
              </div>
            </div>

            {/* CENTER label */}
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap', textAlign: 'center' }}>
              {metric.label}
            </span>

            {/* RIGHT — value left-aligned, bar grows left→right */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: winner === 2 ? '#34d399' : isTie ? '#60a5fa' : '#e6edf3' }}>
                  {v2}<span style={{ fontSize: '0.72rem', fontWeight: 400, color: '#8b949e', marginLeft: 2 }}>{metric.unit}</span>
                </span>
                {winner === 2 && (
                  <>
                    <Icon name={metric.lowerIsBetter ? 'TrendingDown' : 'TrendingUp'} size={11} color="#34d399" />
                    <Icon name="Check" size={12} color="#34d399" />
                  </>
                )}
              </div>
              <div style={{
                height: 6, borderRadius: 999,
                background: 'rgba(255,255,255,0.07)',
                overflow: 'hidden', width: '100%',
                direction: 'ltr',
              }}>
                <div style={{
                  height: '100%', borderRadius: 999,
                  width: `${maxValues[metric.key] > 0 ? (v2 / maxValues[metric.key]) * 100 : 0}%`,
                  background: winner === 2
                    ? 'linear-gradient(90deg, #16a34a, #22c55e)'
                    : isTie
                    ? 'linear-gradient(90deg, #2563eb, #60a5fa)'
                    : 'rgba(255,255,255,0.15)',
                  boxShadow: winner === 2 ? '0 0 8px rgba(34,197,94,0.5)' : isTie ? '0 0 8px rgba(96,165,250,0.4)' : 'none',
                  transition: `width 1s ${200 + i * 120}ms cubic-bezier(0.34,1.56,0.64,1)`,
                }} />
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16, padding: '20px', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: healthWin === 1 ? '#34d399' : '#e6edf3', display: 'flex', alignItems: 'center', gap: 4 }}>
            {healthWin === 1 && <Icon name="Trophy" size={18} color="#f59e0b" />}
            {food1.healthScore}/10
          </div>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999,
            background: food1.healthScore >= 7 ? 'rgba(34,197,94,0.12)' : food1.healthScore >= 5 ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)',
            color: food1.healthScore >= 7 ? '#34d399' : food1.healthScore >= 5 ? '#fbbf24' : '#f87171',
          }}>{food1.healthLabel}</span>
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center' }}>Health Score</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: healthWin === 2 ? '#34d399' : '#e6edf3', display: 'flex', alignItems: 'center', gap: 4 }}>
            {healthWin === 2 && <Icon name="Trophy" size={18} color="#f59e0b" />}
            {food2.healthScore}/10
          </div>
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 999,
            background: food2.healthScore >= 7 ? 'rgba(34,197,94,0.12)' : food2.healthScore >= 5 ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)',
            color: food2.healthScore >= 7 ? '#34d399' : food2.healthScore >= 5 ? '#fbbf24' : '#f87171',
          }}>{food2.healthLabel}</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const FoodCompare = () => {
  const navigate = useNavigate();
  const [food1, setFood1] = useState(null);
  const [food2, setFood2] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState('');
  const [error2, setError2] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const analyzeFood = async (imageFile, setFood, setLoading, setError) => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('nutriscan_token');
      if (!token) { navigate('/login'); return; }
      const formData = new FormData();
      formData.append('image', imageFile);
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await response.json();
      if (!response.ok || json.error) throw new Error(json.error || 'Failed');
      setFood({
        foodName:    json.data.foodName,
        calories:    json.data.calories,
        healthScore: json.data.healthScore,
        healthLabel: json.data.healthLabel,
        tips:        json.data.tips,
        preview:     URL.createObjectURL(imageFile),
        macros: {
          protein:       json.data.macros.protein.amount,
          carbohydrates: json.data.macros.carbohydrates.amount,
          fat:           json.data.macros.fat.amount,
          fiber:         json.data.macros.fiber.amount,
          sugar:         json.data.macros.sugar.amount,
        },
      });
    } catch { setError('Failed to analyze. Try again.'); }
    setLoading(false);
  };

  const handleFileSelect = (e, slot) => {
    const file = e.target.files[0];
    if (!file) return;
    if (slot === 1) analyzeFood(file, setFood1, setLoading1, setError1);
    else            analyzeFood(file, setFood2, setLoading2, setError2);
  };

  const bothReady = food1 && food2 && !loading1 && !loading2;

  return (
    <>
      <style>{`
        @keyframes vsSpin  { to { transform: rotate(360deg); } }
        @keyframes vsPulse { 0%,100% { opacity:0.7; transform:scale(1); } 50% { opacity:1; transform:scale(1.08); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
      `}</style>

      <div style={{ background: '#0d1117', minHeight: '100vh', position: 'relative' }}>
        <GlitterLayer />
        <AnimatedBackground />
        <Navbar isAuthenticated={true} />

        {/* ── Fixed Corner Back Button ── */}
        <button
          onClick={() => navigate('/image-upload')}
          style={{
            position: 'fixed',
            top: '74px',
            left: '18px',
            zIndex: 50,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,216,122,0.15)'; e.currentTarget.style.borderColor = 'rgba(34,216,122,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          aria-label="Back"
        >
          <Icon name="ArrowLeft" size={17} color="rgba(255,255,255,0.7)" />
        </button>

        <div style={{ minHeight: 'calc(100vh - 64px)', position: 'relative', zIndex: 2 }}>
          <div style={{
            maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem',
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}>

            {/* Header */}
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10, justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.08))',
                    border: '1.5px solid rgba(34,197,94,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 28px rgba(34,197,94,0.15)',
                  }}>
                    <Icon name="GitCompare" size={26} color="#34d399" />
                  </div>
                  <div style={{ position:'absolute', inset:-5, borderRadius:20, border:'2px solid transparent', borderTopColor:'rgba(34,197,94,0.7)', animation:'vsSpin 4s linear infinite' }} />
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#ffffff', letterSpacing: -1.5, margin: 0, lineHeight: 1.1 }}>
                  Food{' '}
                  <span style={{ background: 'linear-gradient(135deg, #34d399, #22c55e, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Compare
                  </span>
                </h1>
              </div>
              <p style={{ color: '#8b949e', fontSize: '0.95rem', marginBottom: 16 }}>
                Upload 2 food images and compare their nutrition side by side
              </p>

              {/* Feature pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {['AI-Powered Analysis', 'Instant Results', 'Detailed Macros'].map((label) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    fontSize: '0.78rem', fontWeight: 600, color: '#34d399',
                    boxShadow: '0 2px 8px rgba(34,197,94,0.08)',
                  }}>
                    <Icon name="Sparkles" size={11} color="#34d399" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Upload row */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'stretch', marginBottom: '2rem' }}>
              <UploadSlot slot={1} food={food1} loading={loading1} error={error1} onFileSelect={handleFileSelect} />
              <VsBadge />
              <UploadSlot slot={2} food={food2} loading={loading2} error={error2} onFileSelect={handleFileSelect} />
            </div>

            {/* Get started hint */}
            {!bothReady && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 24px', borderRadius: 18,
                background: 'rgba(22,27,34,0.8)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(48,54,61,0.8)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                animation: 'slideUp 0.5s 0.6s both',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="Sparkles" size={20} color="#34d399" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e6edf3', margin: 0 }}>Get Started</p>
                    <p style={{ fontSize: '0.8rem', color: '#8b949e', margin: 0 }}>Upload food images above to begin your comparison</p>
                  </div>
                </div>
                <Icon name="ArrowRight" size={20} color="rgba(52,211,153,0.5)" />
              </div>
            )}

            {/* Comparison table */}
            {bothReady && (
              <div style={{ animation: 'slideUp 0.5s both' }}>
                <ComparisonTable food1={food1} food2={food2} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodCompare;