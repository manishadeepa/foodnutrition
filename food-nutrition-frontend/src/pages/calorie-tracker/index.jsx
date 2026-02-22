import React, { useState, useEffect, useRef } from 'react';
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

const Particle = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={{ width: style.size, height: style.size, left: style.left, top: style.top, background: style.color, opacity: 0, animation: `floatUp ${style.duration}s ${style.delay}s ease-in-out infinite`, filter: 'blur(1px)' }} />
);

const CalorieRing = ({ progress, totalCalories, dailyGoal, isOverGoal }) => {
  const r = 90, circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(progress, 100) / 100);
  const color = isOverGoal ? '#ef4444' : progress > 80 ? '#f59e0b' : '#22d87a';
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`, animation: 'pulseGlow 2.5s ease-in-out infinite' }} />
      <svg width="220" height="220" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={isOverGoal ? '#ff6b6b' : '#4ade80'} />
          </linearGradient>
        </defs>
        <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
        <circle cx="110" cy="110" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} filter="url(#glow)" style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div className="relative text-center z-10">
        <div className="font-black leading-none" style={{ fontSize: 44, color: isOverGoal ? '#ef4444' : '#22d87a', textShadow: `0 0 30px ${color}50` }}>
          {Math.round(totalCalories)}
        </div>
        <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>of {dailyGoal} kcal</div>
      </div>
    </div>
  );
};

const MacroPill = ({ label, value, unit, icon, glowColor, delay }) => (
  <div className="relative overflow-hidden rounded-2xl p-4 text-center flex flex-col items-center gap-2"
    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)', boxShadow: '0 2px 16px rgba(0,0,0,0.2)', animation: `slideUp 0.6s ${delay}s both`, transition: 'transform 0.3s, box-shadow 0.3s' }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; e.currentTarget.style.boxShadow = `0 16px 40px ${glowColor}30`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)'; }}
  >
    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}60, transparent)` }} />
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${glowColor}18`, boxShadow: `0 0 16px ${glowColor}25` }}>
      <Icon name={icon} size={20} style={{ color: glowColor }} />
    </div>
    <div className="font-black text-xl" style={{ color: glowColor }}>{Math.round(value)}<span className="text-sm font-medium opacity-70">{unit}</span></div>
    <div className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 1 }}>{label.toUpperCase()}</div>
  </div>
);

const FoodRow = ({ food, index }) => (
  <div className="flex items-center justify-between p-3 rounded-xl"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', animation: `slideUp 0.4s ${index * 0.07}s both`, transition: 'background 0.2s' }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,216,122,0.08)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
  >
    <div className="flex items-center gap-3">
      {food.image_preview ? (
        <img src={food.image_preview} alt={food.food_name} className="w-10 h-10 rounded-lg object-cover" style={{ boxShadow: '0 0 12px rgba(34,216,122,0.2)' }} />
      ) : (
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(34,216,122,0.1)', boxShadow: '0 0 12px rgba(34,216,122,0.15)' }}>
          <Icon name="Utensils" size={18} style={{ color: '#22d87a' }} />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold" style={{ color: '#f0f4ff' }}>{food.food_name}</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>P: {food.protein}g · C: {food.carbohydrates}g · F: {food.fat}g</p>
      </div>
    </div>
    <span className="text-sm font-black" style={{ color: '#22d87a' }}>{food.calories} <span className="text-xs font-normal opacity-60">kcal</span></span>
  </div>
);

const CalorieTracker = () => {
  const navigate = useNavigate();
  const [goalInput, setGoalInput] = useState('');
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [todaysFoods, setTodaysFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const particlesRef = useRef([]);

  if (particlesRef.current.length === 0) {
    particlesRef.current = Array.from({ length: 28 }, (_, i) => ({
      id: i, size: `${Math.random() * 4 + 2}px`,
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      color: ['#22d87a', '#4ade80', '#16a34a', '#86efac', '#34d399'][Math.floor(Math.random() * 5)],
      duration: Math.random() * 8 + 6, delay: Math.random() * 6,
    }));
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user') || '{}');
    if (!user?.id) { navigate('/login'); return; }
    const savedGoal = localStorage.getItem(`calorie_goal_${user.id}`);
    if (savedGoal) setDailyGoal(parseInt(savedGoal));
    fetch(`http://localhost:5000/api/history/${user.id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          const today = new Date().toISOString().split('T')[0];
          setTodaysFoods(res.data.filter(item => new Date(item.created_at).toISOString().split('T')[0] === today));
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const totalCalories = todaysFoods.reduce((s, f) => s + (f.calories || 0), 0);
  const totalProtein  = todaysFoods.reduce((s, f) => s + (f.protein || 0), 0);
  const totalCarbs    = todaysFoods.reduce((s, f) => s + (f.carbohydrates || 0), 0);
  const totalFat      = todaysFoods.reduce((s, f) => s + (f.fat || 0), 0);
  const remaining     = dailyGoal - totalCalories;
  const progress      = Math.min((totalCalories / dailyGoal) * 100, 100);
  const isOverGoal    = totalCalories > dailyGoal;

  const handleSaveGoal = () => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user') || '{}');
    const val = parseInt(goalInput);
    if (val > 0) { setDailyGoal(val); localStorage.setItem(`calorie_goal_${user.id}`, val); }
    setIsEditingGoal(false); setGoalInput('');
  };

  if (isLoading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <div className="main-content min-h-screen flex items-center justify-center">
          <GlitterLayer />
          <div className="flex flex-col items-center gap-4" style={{ position:'relative', zIndex:1 }}>
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'rgba(34,216,122,0.3)', borderTopColor: '#22d87a' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#22d87a', letterSpacing: 3 }}>LOADING</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes floatUp { 0% { opacity:0; transform:translateY(0) scale(1); } 20% { opacity:0.7; } 80% { opacity:0.4; } 100% { opacity:0; transform:translateY(-120px) scale(0.5); } }
        @keyframes pulseGlow { 0%,100% { transform:scale(1); opacity:0.6; } 50% { transform:scale(1.08); opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes orbDrift { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-20px) scale(1.05); } 66% { transform:translate(-20px,15px) scale(0.95); } }
        @keyframes borderGlow { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        .ct-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); backdrop-filter:blur(24px); border-radius:24px; box-shadow:0 4px 32px rgba(0,0,0,0.3); }
        .ct-input { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px 14px; color:#f0f4ff; font-size:14px; outline:none; width:100%; transition:border-color 0.3s, box-shadow 0.3s; }
        .ct-input:focus { border-color:rgba(34,216,122,0.6); box-shadow:0 0 0 3px rgba(34,216,122,0.12); }
        .ct-input::placeholder { color:rgba(255,255,255,0.25); }
        .ct-btn-primary { background:linear-gradient(135deg, #22d87a, #16a34a); color:#0a0e17; font-weight:700; font-size:13px; padding:10px 20px; border-radius:12px; border:none; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s; white-space:nowrap; }
        .ct-btn-primary:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(34,216,122,0.4); }
        .ct-btn-ghost { background:rgba(255,255,255,0.06); color:rgba(255,255,255,0.5); font-size:13px; padding:10px 20px; border-radius:12px; border:1px solid rgba(255,255,255,0.09); cursor:pointer; transition:background 0.2s; white-space:nowrap; }
        .ct-btn-ghost:hover { background:rgba(255,255,255,0.1); }
      `}</style>

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

      <div className="main-content min-h-screen relative overflow-hidden">
        <GlitterLayer />

        {/* Ambient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,216,122,0.08) 0%, transparent 70%)', top:'-20%', left:'-15%', animation:'orbDrift 18s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)', bottom:'5%', right:'0%', animation:'orbDrift 22s ease-in-out infinite reverse' }} />
          <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,216,122,0.05) 0%, transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'pulseGlow 6s ease-in-out infinite' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(34,216,122,0.07) 1px, transparent 1px)', backgroundSize:'32px 32px' }} />
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particlesRef.current.map(p => <Particle key={p.id} style={p} />)}
        </div>

        {/* ── ONLY LINE CHANGED: was "max-w-4xl mx-auto p-4 md:p-6 lg:p-8" ── */}
        <div className="relative z-10" style={{ padding: '1rem 4%' }}>

          {/* Header */}
          <div className="mb-10" style={{ animation:'slideUp 0.5s both', textAlign:'center' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginBottom:8 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 0 24px rgba(34,216,122,0.4)', flexShrink:0 }}>
                <Icon name="Flame" size={20} color="#0a0e17" />
              </div>
              <h1 className="font-black" style={{ fontSize:32, color:'#f0f4ff', letterSpacing:-1, margin:0 }}>Calorie Tracker</h1>
            </div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, letterSpacing:0.5, margin:0, textAlign:'center' }}>Track your daily calorie intake</p>
          </div>

          {/* Progress Card */}
          <div className="ct-card p-6 mb-6 relative overflow-hidden" style={{ animation:'slideUp 0.5s 0.1s both' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background:'linear-gradient(90deg, transparent, rgba(34,216,122,0.8), transparent)', animation:'borderGlow 3s ease-in-out infinite' }} />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background:'#22d87a', boxShadow:'0 0 8px rgba(34,216,122,0.8)', animation:'pulseGlow 2s infinite' }} />
                <h2 className="font-bold" style={{ fontSize:16, color:'#f0f4ff' }}>Today's Progress</h2>
              </div>
              <button onClick={() => setIsEditingGoal(true)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ color:'rgba(255,255,255,0.4)', background:'rgba(34,216,122,0.08)', border:'1px solid rgba(34,216,122,0.18)', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color='#22d87a'; e.currentTarget.style.borderColor='rgba(34,216,122,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor='rgba(34,216,122,0.18)'; }}
              >
                <Icon name="Settings" size={13} />Set Goal
              </button>
            </div>

            {isEditingGoal && (
              <div className="flex gap-2 mb-6" style={{ animation:'slideUp 0.3s both' }}>
                <input type="number" placeholder="Enter daily calorie goal" value={goalInput} onChange={e => setGoalInput(e.target.value)} className="ct-input" style={{ flex:1 }} />
                <button onClick={handleSaveGoal} className="ct-btn-primary">Save</button>
                <button onClick={() => setIsEditingGoal(false)} className="ct-btn-ghost">Cancel</button>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <CalorieRing progress={progress} totalCalories={totalCalories} dailyGoal={dailyGoal} isOverGoal={isOverGoal} />
              </div>
              <div className="flex-1 w-full space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2" style={{ color:'rgba(255,255,255,0.35)' }}>
                    <span>Progress</span><span>{Math.round(progress)}%</span>
                  </div>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width:`${progress}%`, background: isOverGoal ? 'linear-gradient(90deg, #ef4444, #dc2626)' : progress > 80 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #22d87a, #4ade80)', boxShadow: isOverGoal ? '0 0 12px rgba(239,68,68,0.6)' : '0 0 12px rgba(34,216,122,0.5)', transition:'width 1s cubic-bezier(.4,0,.2,1)' }} />
                    <div className="absolute inset-0 rounded-full" style={{ background:'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)', backgroundSize:'200% 100%', animation:'shimmer 2.5s linear infinite' }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label:'Consumed', value:`${Math.round(totalCalories)} kcal`, color:'#f0f4ff' },
                    { label: isOverGoal ? 'Over Goal' : 'Remaining', value:`${Math.round(Math.abs(remaining))} kcal`, color: isOverGoal ? '#ef4444' : '#22d87a' },
                    { label:'Daily Goal', value:`${dailyGoal} kcal`, color:'rgba(255,255,255,0.5)' },
                    { label:'Progress', value:`${Math.round(progress)}%`, color:'#22d87a' },
                  ].map((s, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background:'rgba(34,216,122,0.07)', border:'1px solid rgba(34,216,122,0.12)' }}>
                      <div className="text-xs mb-1" style={{ color:'rgba(255,255,255,0.35)', letterSpacing:0.5 }}>{s.label}</div>
                      <div className="font-bold text-sm" style={{ color:s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Macro Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label:'Protein', value:totalProtein, unit:'g', icon:'Beef',     glowColor:'#3b82f6', delay:'0.2s' },
              { label:'Carbs',   value:totalCarbs,   unit:'g', icon:'Wheat',    glowColor:'#f5c842', delay:'0.3s' },
              { label:'Fat',     value:totalFat,     unit:'g', icon:'Droplets', glowColor:'#f97316', delay:'0.4s' },
            ].map((m, i) => <MacroPill key={i} {...m} />)}
          </div>

          {/* Foods List */}
          <div className="ct-card p-6 relative overflow-hidden" style={{ animation:'slideUp 0.5s 0.5s both' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background:'linear-gradient(90deg, transparent, rgba(34,216,122,0.5), transparent)', animation:'borderGlow 4s ease-in-out infinite 1s' }} />
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Icon name="Utensils" size={16} style={{ color:'#22d87a' }} />
                <h2 className="font-bold" style={{ fontSize:16, color:'#f0f4ff' }}>Today's Foods</h2>
                {todaysFoods.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background:'rgba(34,216,122,0.15)', color:'#22d87a', border:'1px solid rgba(34,216,122,0.25)' }}>{todaysFoods.length}</span>
                )}
              </div>
              <button onClick={() => navigate('/image-upload')} className="ct-btn-primary flex items-center gap-2">
                <Icon name="Plus" size={15} />Add Food
              </button>
            </div>
            {todaysFoods.length === 0 ? (
              <div className="text-center py-16" style={{ animation:'slideUp 0.5s both' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background:'rgba(34,216,122,0.08)', border:'1px solid rgba(34,216,122,0.12)' }}>
                  <Icon name="UtensilsCrossed" size={36} style={{ color:'rgba(34,216,122,0.4)' }} />
                </div>
                <p className="font-semibold mb-1" style={{ color:'rgba(255,255,255,0.4)' }}>No foods logged today</p>
                <p className="text-xs mb-6" style={{ color:'rgba(255,255,255,0.25)' }}>Scan a meal to get started</p>
                <button onClick={() => navigate('/image-upload')} className="ct-btn-primary">Scan Your First Meal</button>
              </div>
            ) : (
              <div className="space-y-2">{todaysFoods.map((food, i) => <FoodRow key={i} food={food} index={i} />)}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CalorieTracker;