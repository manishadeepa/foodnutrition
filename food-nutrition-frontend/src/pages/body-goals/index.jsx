import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import Icon from '../../components/AppIcon';

// ── Glitter / sparkle layer ──────────────────────────────────────────────────
const GLITTER_DOTS = Array.from({ length: 55 }, (_, i) => ({
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
      {GLITTER_DOTS.map(d => (
        <span key={d.id} style={{
          position:'absolute', top:d.top, left:d.left,
          width:d.size, height:d.size, borderRadius:'50%',
          background:'#34d399',
          boxShadow:`0 0 ${d.size+3}px ${d.size}px rgba(52,211,153,0.5)`,
          animation:`glitter-blink ${d.duration} ${d.delay} ease-in-out infinite`,
        }} />
      ))}
    </div>
  </>
);
// ─────────────────────────────────────────────────────────────────────────────

const calcBMI = (kg, cm) => kg / ((cm / 100) ** 2);
const bmiCategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
  if (bmi < 25)   return { label: 'Healthy',     color: '#22d87a' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#f97316' };
  return             { label: 'Obese',          color: '#ef4444' };
};
const calcTDEE = (kg, cm, age, sex, activity) => {
  const bmr = sex === 'male'
    ? 10 * kg + 6.25 * cm - 5 * age + 5
    : 10 * kg + 6.25 * cm - 5 * age - 161;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very: 1.9 };
  return Math.round(bmr * (mult[activity] || 1.2));
};
const goalCalories = (tdee, goal) => {
  if (goal === 'lose') return tdee - 500;
  if (goal === 'gain') return tdee + 300;
  return tdee;
};

const useAnimatedNumber = (target, duration = 1200, delay = 0) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let startTime = null;
    let rafId;
    const timeout = setTimeout(() => {
      const step = (ts) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }, delay);
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafId); };
  }, [target, duration, delay]);
  return value;
};

const useInView = (threshold = 0.1) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isInView };
};

const FloatingParticles = () => {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.15 + 0.04,
    }))
  ).current;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} aria-hidden="true">
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: '#22d87a', opacity: p.opacity,
          animation: `bgFloat ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
        }} />
      ))}
    </div>
  );
};

const AnimatedRing = ({ pct, color, size = 120, stroke = 10, delay = 0, glowing = false, children }) => {
  const [animPct, setAnimPct] = useState(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  const dash = circ * Math.min(animPct / 100, 1);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {glowing && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, filter: 'blur(18px)', opacity: 0.28, animation: 'bgPulse 2.5s ease-in-out infinite' }} />
      )}
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)', filter: glowing ? `drop-shadow(0 0 6px ${color}99)` : undefined }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
};

const BMIGauge = ({ bmi, delay = 0 }) => {
  const [animPct, setAnimPct] = useState(0);
  const clamped = Math.min(Math.max(bmi || 0, 10), 40);
  const targetPct = ((clamped - 10) / 30) * 100;
  const { color, label } = bmiCategory(bmi || 0);
  useEffect(() => {
    const t = setTimeout(() => setAnimPct(targetPct), delay);
    return () => clearTimeout(t);
  }, [targetPct, delay]);
  const categories = [
    { label: 'Underweight', color: '#3b82f6' },
    { label: 'Healthy',     color: '#22d87a' },
    { label: 'Overweight',  color: '#f97316' },
    { label: 'Obese',       color: '#ef4444' },
  ];
  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', height: 12, borderRadius: 999, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #3b82f6 0%, #22d87a 35%, #f97316 65%, #ef4444 100%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: `${animPct}%`, transform: 'translate(-50%, -50%)', width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: `3px solid ${color}`, boxShadow: `0 0 0 3px ${color}44, 0 2px 8px rgba(0,0,0,0.3)`, transition: 'left 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {categories.map(cat => (
          <span key={cat.label} style={{ fontSize: '0.68rem', fontWeight: label === cat.label ? 700 : 500, color: label === cat.label ? cat.color : 'rgba(255,255,255,0.35)', transition: 'color 0.3s' }}>{cat.label}</span>
        ))}
      </div>
    </div>
  );
};

const AnimatedValue = ({ value, color, suffix = '', size = '1.5rem', delay = 0 }) => {
  const animated = useAnimatedNumber(value, 1200, delay);
  return (
    <span style={{ fontSize: size, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
      {animated.toLocaleString()}
      {suffix && <span style={{ fontSize: '0.7em', fontWeight: 400, opacity: 0.7, marginLeft: 2 }}>{suffix}</span>}
    </span>
  );
};

const AnimatedCard = ({ children, delay = 0, glowColor, style = {} }) => {
  const { ref, isInView } = useInView(0.1);
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  return (
    <div ref={ref} style={{ opacity: isInView ? 1 : 0, transform: isInView ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)', transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms` }}>
      <div ref={cardRef} onMouseMove={handleMouseMove} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: hovered ? '1.5px solid rgba(34,216,122,0.35)' : '1.5px solid rgba(255,255,255,0.09)',
          boxShadow: hovered ? '0 12px 40px rgba(34,216,122,0.12), 0 2px 8px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.3)',
          padding: '1.5rem',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'border-color 0.3s, box-shadow 0.3s, transform 0.3s',
          ...style,
        }}
      >
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor || 'rgba(34,216,122,0.07)'}, transparent 60%)` }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

const SectionHeader = ({ iconName, title }) => (
  <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1rem', color: '#f0f4ff', marginBottom: '1.25rem' }}>
    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(34,216,122,0.15)', border: '1px solid rgba(34,216,122,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={iconName} size={16} color="#22d87a" />
    </div>
    {title}
  </h2>
);

const BodyGoals = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ weight: '55', height: '165', age: '20', sex: 'female', activity: 'moderate', goal: 'maintain', weightUnit: 'kg', heightUnit: 'cm' });
  const [results, setResults] = useState(null);
  const [saved, setSaved] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setHeaderVisible(true); }, { threshold: 0.1 });
    if (headerRef.current) obs.observe(headerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('bodyGoals');
    if (stored) { try { const d = JSON.parse(stored); if (d.form) setForm(d.form); if (d.results) setResults(d.results); } catch {} }
  }, []);

  const set = useCallback((k) => (e) => setForm(p => ({ ...p, [k]: e.target.value })), []);

  const calculate = useCallback(() => {
    let kg = parseFloat(form.weight); let cm = parseFloat(form.height);
    if (form.weightUnit === 'lbs') kg = kg * 0.453592;
    if (form.heightUnit === 'in')  cm = cm * 2.54;
    if (!kg || !cm || !form.age) return;
    setIsCalculating(true); setResults(null);
    setTimeout(() => {
      const bmi = calcBMI(kg, cm);
      const tdee = calcTDEE(kg, cm, parseInt(form.age), form.sex, form.activity);
      const kcal = goalCalories(tdee, form.goal);
      const protein = Math.round(kg * 1.8);
      const fat = Math.round((kcal * 0.25) / 9);
      const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
      setResults({ bmi: Math.round(bmi * 10) / 10, bmiCat: bmiCategory(bmi), bmiPct: Math.min(((bmi - 10) / 30) * 100, 100), tdee, kcal, protein, fat, carbs });
      setSaved(false); setIsCalculating(false);
    }, 650);
  }, [form]);

  const saveGoals = useCallback(() => {
    localStorage.setItem('bodyGoals', JSON.stringify({ form, results }));
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }, [form, results]);

  const ACTIVITIES = [
    { value: 'sedentary', label: 'Sedentary',      sub: 'Little or no exercise' },
    { value: 'light',     label: 'Lightly Active', sub: '1–3 days/week' },
    { value: 'moderate',  label: 'Moderate',       sub: '3–5 days/week' },
    { value: 'active',    label: 'Very Active',    sub: '6–7 days/week' },
    { value: 'very',      label: 'Extra Active',   sub: 'Physical job + training' },
  ];
  const GOALS = [
    { value: 'lose',     label: 'Lose Weight', iconName: 'TrendingDown', color: '#3b82f6' },
    { value: 'maintain', label: 'Maintain',    iconName: 'Minus',        color: '#22d87a' },
    { value: 'gain',     label: 'Gain Muscle', iconName: 'TrendingUp',   color: '#f97316' },
  ];

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    border: '1.5px solid rgba(255,255,255,0.09)',
    borderRadius: 12, padding: '10px 14px', fontSize: '0.875rem',
    background: 'rgba(255,255,255,0.06)',
    color: '#f0f4ff', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    fontFamily: 'inherit',
  };
  const selectStyle = {
    border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 12, padding: '10px 8px',
    fontSize: '0.875rem', background: 'rgba(255,255,255,0.06)',
    color: '#f0f4ff', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
  };

  return (
    <>
      <style>{`
        @keyframes bgFloat { 0% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-40px) scale(1.2); } 66% { transform:translate(-20px,20px) scale(0.8); } 100% { transform:translate(15px,-30px) scale(1.1); } }
        @keyframes bgPulse { 0%,100% { opacity:0.28; transform:scale(1); } 50% { opacity:0.45; transform:scale(1.06); } }
        @keyframes shimmer { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
        @keyframes shine { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes bgPing { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(1.8); opacity:0; } }
        .calc-btn:hover .shine-layer { opacity:1; }
        .calc-btn:active { transform:scale(0.98); }
        .input-focus:focus { border-color:rgba(34,216,122,0.55) !important; box-shadow:0 0 0 3px rgba(34,216,122,0.1) !important; }
        .activity-btn:hover { border-color:rgba(34,216,122,0.35) !important; background:rgba(34,216,122,0.08) !important; }
        .goal-btn:hover { transform:translateY(-2px); }
        @media (max-width:768px) { .body-grid { grid-template-columns:1fr !important; } }
      `}</style>

      <GlitterLayer />
      <FloatingParticles />
      <Navbar isAuthenticated={true} />

      {/* ── Fixed Back Button ── */}
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
        onMouseEnter={e => { e.currentTarget.style.background='rgba(34,216,122,0.15)'; e.currentTarget.style.borderColor='rgba(34,216,122,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; }}
        aria-label="Back"
      >
        <Icon name="ArrowLeft" size={17} color="rgba(255,255,255,0.7)" />
      </button>

      <div style={{ minHeight: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden', paddingBottom: '4rem' }}>
        {/* ── ONLY LINE CHANGED: was "maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem'" ── */}
        <div style={{ position: 'relative', zIndex: 10, padding: '2rem 4%' }}>

          {/* Header */}
          <div ref={headerRef}>
            <div style={{ marginBottom: '2.5rem', textAlign: 'center', opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s 0.1s, transform 0.7s 0.1s' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(34,216,122,0.15)', border: '1.5px solid rgba(34,216,122,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 28px rgba(34,216,122,0.25)' }}>
                    <Icon name="Target" size={26} color="#22d87a" />
                  </div>
                  <div style={{ position: 'absolute', inset: -5, borderRadius: 20, border: '2px solid transparent', borderTopColor: 'rgba(34,216,122,0.7)', animation: 'spin 4s linear infinite' }} />
                  <div style={{ position: 'absolute', inset: -9, borderRadius: 22, border: '1px dashed rgba(34,216,122,0.18)', animation: 'spin 10s linear infinite reverse' }} />
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 900, color: '#f0f4ff', letterSpacing: -1.5, margin: 0, lineHeight: 1.1 }}>
                  Body{' '}
                  <span style={{ background: 'linear-gradient(135deg, #22d87a, #4ade80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Goals</span>
                </h1>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0 }}>Calculate your BMI, daily calorie needs, and macro targets.</p>
            </div>
          </div>

          {/* Grid */}
          <div className="body-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* LEFT: Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AnimatedCard delay={100} glowColor="rgba(34,216,122,0.08)">
                <SectionHeader iconName="Ruler" title="Measurements" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weight</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input type="number" placeholder="70" value={form.weight} onChange={set('weight')} className="input-focus" style={{ ...inputStyle, flex: 1 }} />
                      <select value={form.weightUnit} onChange={set('weightUnit')} style={selectStyle}>
                        <option value="kg">kg</option><option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Height</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input type="number" placeholder="170" value={form.height} onChange={set('height')} className="input-focus" style={{ ...inputStyle, flex: 1 }} />
                      <select value={form.heightUnit} onChange={set('heightUnit')} style={selectStyle}>
                        <option value="cm">cm</option><option value="in">in</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</label>
                    <input type="number" placeholder="25" value={form.age} onChange={set('age')} className="input-focus" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biological sex</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {['female', 'male'].map(s => (
                        <button key={s} onClick={() => setForm(p => ({ ...p, sex: s }))} style={{ flex: 1, padding: '10px 6px', borderRadius: 12, border: `2px solid ${form.sex === s ? '#22d87a' : 'rgba(255,255,255,0.09)'}`, background: form.sex === s ? 'rgba(34,216,122,0.12)' : 'rgba(255,255,255,0.04)', color: form.sex === s ? '#22d87a' : 'rgba(255,255,255,0.45)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.25s', boxShadow: form.sex === s ? '0 2px 12px rgba(34,216,122,0.2)' : 'none' }}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard delay={200} glowColor="rgba(34,216,122,0.06)">
                <SectionHeader iconName="Zap" title="Activity Level" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ACTIVITIES.map(a => (
                    <button key={a.value} onClick={() => setForm(p => ({ ...p, activity: a.value }))} className="activity-btn"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${form.activity === a.value ? '#22d87a' : 'rgba(255,255,255,0.09)'}`, background: form.activity === a.value ? 'rgba(34,216,122,0.1)' : 'transparent', transition: 'all 0.22s', boxShadow: form.activity === a.value ? '0 2px 12px rgba(34,216,122,0.15)' : 'none' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: form.activity === a.value ? '#22d87a' : '#f0f4ff' }}>{a.label}</span>
                      <span style={{ fontSize: '0.75rem', color: form.activity === a.value ? 'rgba(34,216,122,0.75)' : 'rgba(255,255,255,0.35)' }}>{a.sub}</span>
                    </button>
                  ))}
                </div>
              </AnimatedCard>

              <AnimatedCard delay={300} glowColor="rgba(34,216,122,0.06)">
                <SectionHeader iconName="Target" title="My Goal" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {GOALS.map(g => {
                    const active = form.goal === g.value;
                    return (
                      <button key={g.value} onClick={() => setForm(p => ({ ...p, goal: g.value }))} className="goal-btn"
                        style={{ position: 'relative', padding: '14px 8px', borderRadius: 14, cursor: 'pointer', border: `2px solid ${active ? `${g.color}55` : 'rgba(255,255,255,0.09)'}`, background: active ? `rgba(${g.color === '#22d87a' ? '34,216,122' : g.color === '#3b82f6' ? '59,130,246' : '249,115,22'},0.12)` : 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, boxShadow: active ? `0 6px 22px ${g.color}22` : 'none', transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)' }}>
                        {active && <div style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, borderRadius: '50%', background: g.color, animation: 'bgPing 1.5s ease-out infinite' }} />}
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: active ? `${g.color}22` : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s' }}>
                          <Icon name={g.iconName} size={20} color={active ? g.color : 'rgba(255,255,255,0.35)'} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: active ? g.color : 'rgba(255,255,255,0.35)' }}>{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </AnimatedCard>

              <AnimatedCard delay={400} style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
                <button onClick={calculate} disabled={isCalculating} className="calc-btn"
                  style={{ position: 'relative', width: '100%', padding: '1rem', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #15803d, #22d87a, #15803d)', backgroundSize: '200% 200%', animation: 'shimmer 3s ease-in-out infinite', color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 28px rgba(34,216,122,0.35)', overflow: 'hidden', fontFamily: 'inherit', opacity: isCalculating ? 0.75 : 1, transition: 'opacity 0.2s, transform 0.15s' }}>
                  <div className="shine-layer" style={{ position: 'absolute', inset: 0, opacity: 0, background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shine 1.8s ease-in-out infinite', transition: 'opacity 0.3s' }} />
                  <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {isCalculating ? (<><div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.75s linear infinite' }} />Calculating...</>) : (<><Icon name="Sparkles" size={18} color="#fff" />Calculate My Goals</>)}
                  </span>
                </button>
              </AnimatedCard>
            </div>

            {/* RIGHT: Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {results ? (
                <>
                  <AnimatedCard delay={100} glowColor={results.bmiCat.color + '22'}>
                    <SectionHeader iconName="Activity" title="BMI" />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                      <AnimatedRing pct={results.bmiPct} color={results.bmiCat.color} size={110} stroke={10} delay={300} glowing>
                        <div style={{ textAlign: 'center' }}>
                          <AnimatedValue value={results.bmi * 10} color={results.bmiCat.color} size="1.4rem" delay={500} />
                          <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>BMI</div>
                        </div>
                      </AnimatedRing>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: results.bmiCat.color }}>{results.bmiCat.label}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, background: `${results.bmiCat.color}18`, color: results.bmiCat.color }}>
                            <Icon name="Sparkles" size={10} color={results.bmiCat.color} />Score
                          </span>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.55, margin: 0 }}>
                          A BMI of <strong style={{ color: '#f0f4ff' }}>{results.bmi}</strong> falls in the <strong style={{ color: results.bmiCat.color }}>{results.bmiCat.label.toLowerCase()}</strong> range.
                        </p>
                      </div>
                    </div>
                    <BMIGauge bmi={results.bmi} delay={600} />
                  </AnimatedCard>

                  <AnimatedCard delay={250} glowColor="rgba(34,216,122,0.08)">
                    <SectionHeader iconName="Flame" title="Daily Calories" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[
                        { label: 'Maintenance', value: results.tdee, color: 'rgba(255,255,255,0.5)', iconName: 'Minus',  highlight: false },
                        { label: 'Your Goal',   value: results.kcal, color: '#22d87a',               iconName: 'Target', highlight: true },
                      ].map((item, i) => (
                        <div key={item.label} style={{ borderRadius: 16, padding: '1.1rem', textAlign: 'center', background: item.highlight ? 'rgba(34,216,122,0.1)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${item.highlight ? 'rgba(34,216,122,0.25)' : 'rgba(255,255,255,0.07)'}`, transition: 'transform 0.25s', cursor: 'default' }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: `${item.highlight ? 'rgba(34,216,122,0.18)' : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                            <Icon name={item.iconName} size={16} color={item.highlight ? '#22d87a' : 'rgba(255,255,255,0.4)'} />
                          </div>
                          <AnimatedValue value={item.value} color={item.color} size="1.7rem" delay={250 + i * 150} />
                          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 4, fontWeight: 600 }}>{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={400} glowColor="rgba(34,216,122,0.06)">
                    <SectionHeader iconName="PieChart" title="Daily Macros" />
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
                      {[
                        { label: 'Protein', value: results.protein, unit: 'g', color: '#3b82f6', pct: Math.round((results.protein * 4 / results.kcal) * 100) },
                        { label: 'Carbs',   value: results.carbs,   unit: 'g', color: '#f5c842', pct: Math.round((results.carbs * 4 / results.kcal) * 100) },
                        { label: 'Fat',     value: results.fat,     unit: 'g', color: '#f97316', pct: Math.round((results.fat * 9 / results.kcal) * 100) },
                      ].map((m, i) => (
                        <div key={m.label} style={{ textAlign: 'center', cursor: 'default' }}
                          onMouseEnter={e => e.currentTarget.querySelector('.ring-wrap').style.transform = 'scale(1.08)'}
                          onMouseLeave={e => e.currentTarget.querySelector('.ring-wrap').style.transform = 'scale(1)'}
                        >
                          <div className="ring-wrap" style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', display: 'inline-block' }}>
                            <AnimatedRing pct={m.pct} color={m.color} size={90} stroke={8} delay={400 + i * 150} glowing>
                              <div style={{ textAlign: 'center' }}>
                                <AnimatedValue value={m.value} color={m.color} size="1.05rem" delay={600 + i * 150} />
                                <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>{m.unit}</div>
                              </div>
                            </AnimatedRing>
                          </div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: m.color, marginTop: 6 }}>{m.label}</div>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{m.pct}%</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,0.06)' }}>
                      {[
                        { color: '#3b82f6', pct: Math.round((results.protein * 4 / results.kcal) * 100) },
                        { color: '#f5c842', pct: Math.round((results.carbs * 4 / results.kcal) * 100) },
                        { color: '#f97316', pct: null },
                      ].map((bar, i) => (
                        <div key={i} style={{ width: bar.pct ? `${bar.pct}%` : undefined, flex: bar.pct ? undefined : 1, background: `linear-gradient(90deg, ${bar.color}, ${bar.color}cc)`, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      {[{ label: 'Protein', color: '#3b82f6' }, { label: 'Carbs', color: '#f5c842' }, { label: 'Fat', color: '#f97316' }].map(m => (
                        <span key={m.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.72rem', fontWeight: 600, color: m.color }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, display: 'inline-block' }} />{m.label}
                        </span>
                      ))}
                    </div>
                  </AnimatedCard>

                  <AnimatedCard delay={550} style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
                    <button onClick={saveGoals} style={{ width: '100%', padding: '14px', borderRadius: 16, cursor: 'pointer', border: `2px solid ${saved ? 'rgba(34,216,122,0.4)' : 'rgba(255,255,255,0.09)'}`, background: saved ? 'rgba(34,216,122,0.1)' : 'rgba(255,255,255,0.04)', color: saved ? '#22d87a' : 'rgba(255,255,255,0.45)', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.35s' }}
                      onMouseEnter={e => { if (!saved) { e.currentTarget.style.borderColor = 'rgba(34,216,122,0.35)'; e.currentTarget.style.color = '#f0f4ff'; } }}
                      onMouseLeave={e => { if (!saved) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; } }}
                    >
                      <Icon name={saved ? 'CheckCircle' : 'Save'} size={16} color={saved ? '#22d87a' : undefined} />
                      {saved ? 'Goals Saved!' : 'Save My Goals'}
                    </button>
                  </AnimatedCard>
                </>
              ) : (
                <AnimatedCard delay={200} style={{ minHeight: 520 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 460, textAlign: 'center' }}>
                    <div style={{ position: 'relative', marginBottom: 24 }}>
                      <div style={{ width: 96, height: 96, borderRadius: 24, background: 'rgba(34,216,122,0.1)', border: '1.5px solid rgba(34,216,122,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="Target" size={40} color="#22d87a" />
                      </div>
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 24, background: 'rgba(34,216,122,0.08)', animation: 'bgPing 2s ease-out infinite' }} />
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f0f4ff', marginBottom: 8 }}>Your results appear here</h3>
                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)', maxWidth: 280, lineHeight: 1.6 }}>
                      Fill in your measurements and click <strong style={{ color: '#22d87a' }}>Calculate My Goals</strong> to see your BMI, calorie needs, and macro targets.
                    </p>
                    {isCalculating && (
                      <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, border: '3px solid rgba(34,216,122,0.18)', borderTopColor: '#22d87a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>Crunching numbers…</span>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BodyGoals;