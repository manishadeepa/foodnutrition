import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import Icon from '../../components/AppIcon';

/* ── Data ─────────────────────────────────────────────────────── */
const FOOD_PAIRS = [
  { a: { name:"Brown Rice",        cal:216, protein:5,  carbs:45, fat:2,  score:82, emoji:"🍚" },
    b: { name:"White Rice",         cal:206, protein:4,  carbs:45, fat:0,  score:58, emoji:"🍙" } },
  { a: { name:"Greek Yogurt",       cal:100, protein:17, carbs:6,  fat:1,  score:91, emoji:"🥛" },
    b: { name:"Flavored Yogurt",    cal:170, protein:6,  carbs:31, fat:2,  score:45, emoji:"🍦" } },
  { a: { name:"Almonds (30g)",      cal:173, protein:6,  carbs:6,  fat:15, score:88, emoji:"🌰" },
    b: { name:"Potato Chips (30g)", cal:152, protein:2,  carbs:15, fat:10, score:22, emoji:"🥔" } },
  { a: { name:"Grilled Chicken",   cal:165, protein:31, carbs:0,  fat:4,  score:95, emoji:"🍗" },
    b: { name:"Fried Chicken",      cal:320, protein:22, carbs:18, fat:19, score:38, emoji:"🍖" } },
  { a: { name:"Sweet Potato",      cal:86,  protein:2,  carbs:20, fat:0,  score:87, emoji:"🍠" },
    b: { name:"French Fries",       cal:312, protein:4,  carbs:41, fat:15, score:25, emoji:"🍟" } },
  { a: { name:"Avocado Toast",     cal:290, protein:8,  carbs:28, fat:17, score:79, emoji:"🥑" },
    b: { name:"Buttered Toast",     cal:315, protein:7,  carbs:36, fat:16, score:42, emoji:"🍞" } },
  { a: { name:"Oat Porridge",      cal:150, protein:5,  carbs:27, fat:3,  score:84, emoji:"🌾" },
    b: { name:"Frosted Flakes",     cal:148, protein:2,  carbs:36, fat:0,  score:28, emoji:"🥣" } },
  { a: { name:"Salmon Fillet",     cal:208, protein:29, carbs:0,  fat:10, score:93, emoji:"🐟" },
    b: { name:"Fish & Chips",       cal:520, protein:25, carbs:52, fat:24, score:31, emoji:"🍽️" } },
  { a: { name:"Dark Chocolate",    cal:170, protein:2,  carbs:13, fat:12, score:71, emoji:"🍫" },
    b: { name:"Milk Chocolate",     cal:210, protein:3,  carbs:25, fat:12, score:44, emoji:"🍬" } },
  { a: { name:"Sparkling Water",   cal:0,   protein:0,  carbs:0,  fat:0,  score:100, emoji:"💧" },
    b: { name:"Cola (330ml)",       cal:139, protein:0,  carbs:35, fat:0,  score:10,  emoji:"🥤" } },
];

const scoreColor = (s) => {
  if (s >= 80) return { main:"#22d87a", glow:"rgba(34,216,122,0.4)", bg:"rgba(34,216,122,0.12)" };
  if (s >= 55) return { main:"#f5c842", glow:"rgba(245,200,66,0.4)", bg:"rgba(245,200,66,0.12)" };
  if (s >= 35) return { main:"#fb923c", glow:"rgba(251,146,60,0.4)", bg:"rgba(251,146,60,0.12)" };
  return { main:"#f87171", glow:"rgba(248,113,113,0.4)", bg:"rgba(248,113,113,0.12)" };
};
const scoreLabel = (s) => s >= 80 ? "Excellent" : s >= 55 ? "Good" : s >= 35 ? "Fair" : "Poor";

/* ── Particle Canvas ─────────────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5, o: Math.random() * 0.5 + 0.1,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34,216,122,${p.o})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(34,216,122,${0.06 * (1 - dist/100)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }} />;
}

/* ── Confetti ────────────────────────────────────────────────── */
function Confetti({ active }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const colors = ["#22d87a","#f5c842","#60a5fa","#f472b6","#fb923c","#a78bfa"];
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.3 - 50,
      vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4 + 2,
      r: Math.random() * 8 + 4, color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, rotV: (Math.random() - 0.5) * 8,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rotation += p.rotV;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.shape === "rect") ctx.fillRect(-p.r/2, -p.r/4, p.r, p.r/2);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r/2, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
      });
      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 20);
      if (particlesRef.current.length > 0) rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
  return <canvas ref={canvasRef} style={{ position:"fixed", inset:0, zIndex:999, pointerEvents:"none", display: active ? "block" : "none" }} />;
}

/* ── Food Card ───────────────────────────────────────────────── */
function FoodCard({ food, side, onPick, disabled, revealed, winner }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const isWinner = revealed && winner === side;
  const isLoser  = revealed && winner !== null && winner !== side;
  const col = scoreColor(food.score);
  return (
    <div
      style={{
        flex:1, position:"relative", borderRadius:24, padding:"2rem 1.5rem 1.75rem",
        cursor:disabled?"default":"pointer", display:"flex", flexDirection:"column",
        alignItems:"center", textAlign:"center", gap:14, overflow:"hidden",
        userSelect:"none", minHeight:320, justifyContent:"center",
        transition:"transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s, box-shadow 0.3s",
        transform: pressed?"scale(0.96)":isWinner?"scale(1.04) translateY(-6px)":isLoser?"scale(0.95)":hovered&&!disabled?"scale(1.025) translateY(-4px)":"scale(1)",
        opacity: isLoser?0.45:1,
        background: isWinner?`linear-gradient(145deg, ${col.bg}, rgba(10,14,23,0.9))`:"linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
        border:`1.5px solid ${isWinner?col.main:hovered&&!disabled?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.08)"}`,
        backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
        boxShadow: isWinner?`0 0 40px ${col.glow}, 0 20px 60px rgba(0,0,0,0.5)`:hovered&&!disabled?"0 20px 60px rgba(0,0,0,0.4)":"0 8px 32px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>{setHovered(false);setPressed(false);}}
      onMouseDown={()=>!disabled&&setPressed(true)}
      onMouseUp={()=>{setPressed(false);if(!disabled)onPick(side);}}
      onTouchStart={()=>!disabled&&setPressed(true)}
      onTouchEnd={()=>{setPressed(false);if(!disabled)onPick(side);}}
    >
      {isWinner&&(<div style={{position:"absolute",top:18,right:-32,background:`linear-gradient(90deg,${col.main},#16a34a)`,color:"#fff",fontSize:"0.62rem",fontWeight:900,padding:"5px 48px",transform:"rotate(35deg)",letterSpacing:"0.12em",fontFamily:"'Barlow Condensed',sans-serif"}}>WINNER</div>)}
      <div style={{width:88,height:88,borderRadius:"50%",background:isWinner?col.bg:"rgba(255,255,255,0.06)",border:`2px solid ${isWinner?col.main:"rgba(255,255,255,0.1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.8rem",transition:"transform 0.4s",transform:isWinner?"scale(1.15)":hovered&&!disabled?"scale(1.08)":"scale(1)",boxShadow:isWinner?`0 0 24px ${col.glow}`:"none"}}>{food.emoji}</div>
      <h3 style={{fontSize:"1.15rem",fontWeight:800,color:"#fff",lineHeight:1.3,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.02em",textTransform:"uppercase"}}>{food.name}</h3>
      <div style={{background:"rgba(248,113,113,0.15)",border:"1px solid rgba(248,113,113,0.3)",borderRadius:10,padding:"0.3rem 0.8rem"}}>
        <span style={{color:"#f87171",fontWeight:800,fontSize:"1rem",fontFamily:"'Barlow Condensed',sans-serif"}}>{food.cal}</span>
        <span style={{color:"#f87171",fontSize:"0.72rem",marginLeft:3}}>kcal</span>
      </div>
      {revealed&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,width:"100%",animation:"fadeInUp 0.4s ease forwards"}}>
          {[{label:"Protein",value:food.protein,c:"#60a5fa"},{label:"Carbs",value:food.carbs,c:"#f5c842"},{label:"Fat",value:food.fat,c:"#fb923c"}].map(s=>(
            <div key={s.label} style={{background:`${s.c}18`,border:`1px solid ${s.c}30`,borderRadius:10,padding:"0.45rem 0.3rem"}}>
              <div style={{fontWeight:800,fontSize:"0.9rem",color:s.c,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.value}g</div>
              <div style={{fontSize:"0.62rem",color:"rgba(255,255,255,0.45)",marginTop:1}}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {revealed&&(
        <div style={{width:"100%",animation:"fadeInUp 0.5s ease forwards"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",marginBottom:6}}>
            <span style={{color:"rgba(255,255,255,0.4)"}}>Health Score</span>
            <span style={{fontWeight:800,color:col.main,fontFamily:"'Barlow Condensed',sans-serif"}}>{food.score}/100 · {scoreLabel(food.score)}</span>
          </div>
          <div style={{height:6,borderRadius:999,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:999,background:`linear-gradient(90deg,${col.main},${col.glow.replace("0.4","1")})`,width:`${food.score}%`,transition:"width 1s cubic-bezier(0.34,1.56,0.64,1)",boxShadow:`0 0 8px ${col.glow}`}}/>
          </div>
        </div>
      )}
      {!revealed&&!disabled&&(
        <div style={{position:"absolute",bottom:16,fontSize:"0.7rem",color:"rgba(255,255,255,0.3)",display:"flex",alignItems:"center",gap:5,animation:"pulse 2s ease-in-out infinite"}}>
          <span>👆</span> Tap to pick
        </div>
      )}
    </div>
  );
}

function VSBadge() {
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,flexShrink:0,padding:"0 0.5rem"}}>
      <div style={{width:1,height:40,background:"linear-gradient(to bottom,transparent,rgba(34,216,122,0.4))"}}/>
      <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#22d87a,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow Condensed',sans-serif",fontWeight:900,fontSize:"1.1rem",color:"#fff",boxShadow:"0 0 24px rgba(34,216,122,0.5),0 0 60px rgba(34,216,122,0.2)",animation:"vsPulse 2s ease-in-out infinite"}}>VS</div>
      <div style={{width:1,height:40,background:"linear-gradient(to bottom,rgba(34,216,122,0.4),transparent)"}}/>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────── */
export default function FoodBattle() {
  const navigate = useNavigate();
  const [index,      setIndex]      = useState(0);
  const [score,      setScore]      = useState(0);
  const [picked,     setPicked]     = useState(null);
  const [revealed,   setRevealed]   = useState(false);
  const [done,       setDone]       = useState(false);
  const [history,    setHistory]    = useState([]);
  const [streak,     setStreak]     = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [aiExplain,  setAiExplain]  = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const [confetti,   setConfetti]   = useState(false);
  const [shaking,    setShaking]    = useState(false);
  const [cardEnter,  setCardEnter]  = useState(true);
  const timerRef = useRef(null);

  const total  = FOOD_PAIRS.length;
  const pair   = FOOD_PAIRS[index];
  const winner = pair ? (pair.a.score >= pair.b.score ? "a" : "b") : null;

  const fetchExplanation = async (pair, pickedSide, winnerSide) => {
    setAiLoading(true); setAiExplain("");
    const correct = pickedSide === winnerSide;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{role:"user",content:`The user ${correct?"correctly":"incorrectly"} chose "${pair[pickedSide].name}" over "${pair[winnerSide].name}" in a food health battle. In exactly 2 short sentences, explain why "${pair[winnerSide].name}" is the healthier choice. Be specific and mention one key nutritional fact. No emojis.`}]
        }),
      });
      const data = await res.json();
      setAiExplain(data.content?.map(b=>b.text||"").join("")||"");
    } catch { setAiExplain(""); }
    setAiLoading(false);
  };

  const handlePick = (side) => {
    if (revealed) return;
    setPicked(side); setRevealed(true);
    const correct = side === winner;
    const newStreak = correct ? streak+1 : 0;
    setStreak(newStreak); setBestStreak(s=>Math.max(s,newStreak));
    if (correct) { setScore(s=>s+1); setConfetti(true); setTimeout(()=>setConfetti(false),3000); }
    else { setShaking(true); setTimeout(()=>setShaking(false),500); }
    setHistory(h=>[...h,{pair,picked:side,winner,correct}]);
    fetchExplanation(pair,side,winner);
    timerRef.current = setTimeout(()=>handleNext(),4200);
  };

  const handleNext = () => {
    clearTimeout(timerRef.current); setCardEnter(false);
    setTimeout(()=>{
      if (index+1>=total){setDone(true);return;}
      setIndex(i=>i+1); setPicked(null); setRevealed(false); setAiExplain(""); setAiLoading(false); setCardEnter(true);
    },250);
  };

  const handleRestart = () => {
    setIndex(0);setScore(0);setPicked(null);setRevealed(false);setDone(false);
    setHistory([]);setStreak(0);setBestStreak(0);setAiExplain("");setAiLoading(false);setCardEnter(true);
    clearTimeout(timerRef.current);
  };

  useEffect(()=>()=>clearTimeout(timerRef.current),[]);

  const pct   = Math.round((score/total)*100);
  const grade = pct>=80?{g:"A",label:"Nutrition Expert!",c:"#22d87a"}:pct>=60?{g:"B",label:"Health Savvy!",c:"#60a5fa"}:pct>=40?{g:"C",label:"Getting There!",c:"#f5c842"}:{g:"D",label:"Keep Learning!",c:"#fb923c"};

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{--bg:#0a0e17;--text:#f0f4ff;--muted:rgba(255,255,255,0.38);--green:#22d87a;--font-display:'Barlow Condensed',sans-serif;--font-body:'DM Sans',sans-serif;}
        html,body{height:100%;}
        @keyframes spinRing{to{transform:rotate(360deg);}}
        @keyframes vsPulse{0%,100%{box-shadow:0 0 24px rgba(34,216,122,0.5),0 0 60px rgba(34,216,122,0.2);}50%{box-shadow:0 0 36px rgba(34,216,122,0.8),0 0 80px rgba(34,216,122,0.35);}}
        @keyframes pulse{0%,100%{opacity:0.35;}50%{opacity:0.7;}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        @keyframes shake{0%,100%{transform:translateX(0);}20%{transform:translateX(-12px);}40%{transform:translateX(12px);}60%{transform:translateX(-8px);}80%{transform:translateX(8px);}}
        @keyframes shimmer{0%{background-position:-200% center;}100%{background-position:200% center;}}
        @keyframes cardIn{from{opacity:0;transform:scale(0.92) translateY(20px);}to{opacity:1;transform:scale(1) translateY(0);}}
        @keyframes cardOut{from{opacity:1;transform:scale(1);}to{opacity:0;transform:scale(0.92) translateY(-20px);}}
        @keyframes resultIn{from{opacity:0;transform:translateY(16px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
        @keyframes feedbackIn{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        @keyframes orbFloat1{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(60px,-80px) scale(1.1);}}
        @keyframes orbFloat2{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-40px,60px) scale(0.9);}}
        @keyframes orbFloat3{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(30px,40px) scale(1.05);}}
        @keyframes glowPulse{0%,100%{opacity:0.6;}50%{opacity:1;}}
        button{font-family:var(--font-body);}
      `}</style>

      {/* Background */}
      <div style={{position:"fixed",inset:0,zIndex:0,background:"radial-gradient(ellipse 80% 60% at 20% 20%, rgba(34,216,122,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(96,165,250,0.06) 0%, transparent 60%), #0a0e17"}}/>
      {[
        {top:"10%",left:"5%",size:300,color:"rgba(34,216,122,0.07)",anim:"orbFloat1 12s ease-in-out infinite"},
        {top:"60%",right:"8%",size:250,color:"rgba(96,165,250,0.06)",anim:"orbFloat2 15s ease-in-out infinite"},
        {top:"35%",left:"55%",size:200,color:"rgba(245,200,66,0.05)",anim:"orbFloat3 10s ease-in-out infinite"},
      ].map((orb,i)=>(
        <div key={i} style={{position:"fixed",zIndex:0,pointerEvents:"none",width:orb.size,height:orb.size,borderRadius:"50%",background:orb.color,filter:"blur(60px)",top:orb.top,left:orb.left,right:orb.right,animation:orb.anim}}/>
      ))}

      <ParticleCanvas />
      <Confetti active={confetti} />

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

      {/* Content */}
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",fontFamily:"var(--font-body)",color:"var(--text)",paddingTop:"60px",paddingBottom:"3rem"}}>
        <div style={{maxWidth:880,margin:"0 auto",padding:"2rem 1.5rem"}}>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"2rem"}}>
            <div>
              <h1 style={{fontFamily:"var(--font-display)",fontWeight:900,fontSize:"clamp(2rem,5vw,3rem)",lineHeight:1,letterSpacing:"0.03em",textTransform:"uppercase",background:"linear-gradient(90deg, #fff 0%, #22d87a 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Food Battle ⚔️</h1>
              <p style={{color:"var(--muted)",fontSize:"0.85rem",marginTop:4}}>Pick the healthier option to earn points</p>
            </div>
            {!done&&(
              <div style={{display:"flex",gap:10}}>
                {[{label:"Score",value:`${score}/${total}`,c:"#f5c842"},{label:"Streak",value:`🔥 ${streak}`,c:"#fb923c"}].map(s=>(
                  <div key={s.label} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",backdropFilter:"blur(12px)",borderRadius:16,padding:"0.6rem 1.1rem",textAlign:"center",minWidth:72}}>
                    <div style={{fontFamily:"var(--font-display)",fontWeight:900,fontSize:"1.2rem",color:s.c,letterSpacing:"0.02em"}}>{s.value}</div>
                    <div style={{fontSize:"0.65rem",color:"var(--muted)",marginTop:1}}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!done?(
            <>
              <div style={{marginBottom:"1.75rem"}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.72rem",color:"var(--muted)",marginBottom:8}}>
                  <span>Round {index+1} of {total}</span>
                  <span>{Math.round((index/total)*100)}% complete</span>
                </div>
                <div style={{height:5,borderRadius:999,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:999,background:"linear-gradient(90deg,#22d87a,#16a34a)",width:`${(index/total)*100}%`,transition:"width 0.5s ease",boxShadow:"0 0 8px rgba(34,216,122,0.5)"}}/>
                </div>
              </div>

              <div style={{display:"flex",gap:"0.75rem",alignItems:"stretch",marginBottom:"1.25rem",animation:cardEnter?"cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards":"cardOut 0.25s ease forwards",...(shaking?{animation:"shake 0.5s ease"}:{})}}>
                <FoodCard food={pair.a} side="a" onPick={handlePick} disabled={revealed} revealed={revealed} winner={revealed?winner:null}/>
                <VSBadge/>
                <FoodCard food={pair.b} side="b" onPick={handlePick} disabled={revealed} revealed={revealed} winner={revealed?winner:null}/>
              </div>

              {revealed&&(
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem 1.5rem",display:"flex",flexDirection:"column",gap:14,animation:"feedbackIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:"50%",flexShrink:0,background:picked===winner?"rgba(34,216,122,0.2)":"rgba(248,113,113,0.2)",border:`1.5px solid ${picked===winner?"#22d87a":"#f87171"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.2rem",boxShadow:picked===winner?"0 0 16px rgba(34,216,122,0.4)":"0 0 16px rgba(248,113,113,0.4)"}}>
                      {picked===winner?"✓":"✗"}
                    </div>
                    <div style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1rem",letterSpacing:"0.02em",color:picked===winner?"#22d87a":"#f87171"}}>
                      {picked===winner?`Correct! +1 point${streak>1?` · 🔥 ${streak} streak!`:""}`:`Wrong! The healthier choice was ${pair[winner].name}`}
                    </div>
                  </div>
                  {(aiLoading||aiExplain)&&(
                    <div style={{background:"rgba(34,216,122,0.07)",border:"1px solid rgba(34,216,122,0.2)",borderLeft:"3px solid #22d87a",borderRadius:12,padding:"0.8rem 1rem"}}>
                      {aiLoading?(
                        <div style={{display:"flex",alignItems:"center",gap:10,color:"var(--muted)",fontSize:"0.85rem"}}>
                          <div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(34,216,122,0.3)",borderTopColor:"#22d87a",animation:"spinRing 0.7s linear infinite"}}/>
                          AI is analysing nutritional data…
                        </div>
                      ):(
                        <p style={{fontSize:"0.875rem",color:"#d1fae5",lineHeight:1.65,margin:0}}>💡 {aiExplain}</p>
                      )}
                    </div>
                  )}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span style={{fontSize:"0.73rem",color:"var(--muted)"}}>Auto-advancing…</span>
                    <button onClick={handleNext} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"0.6rem 1.4rem",borderRadius:50,background:"linear-gradient(135deg,#22d87a,#16a34a)",color:"#fff",border:"none",fontFamily:"var(--font-display)",fontWeight:800,fontSize:"0.9rem",letterSpacing:"0.04em",cursor:"pointer",textTransform:"uppercase",boxShadow:"0 4px 16px rgba(34,216,122,0.4)",transition:"transform 0.2s"}}
                      onMouseEnter={e=>e.target.style.transform="scale(1.04)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}>
                      {index+1>=total?"See Results →":"Next Round →"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ):(
            <div style={{animation:"resultIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards"}}>
              <h2 style={{fontFamily:"var(--font-display)",fontWeight:900,fontSize:"clamp(1.8rem,4vw,2.8rem)",letterSpacing:"0.04em",textTransform:"uppercase",marginBottom:6,background:`linear-gradient(90deg,#fff,${grade.c})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Battle Complete! ⚔️</h2>
              <p style={{color:"var(--muted)",fontSize:"0.875rem",marginBottom:"2rem"}}>Here's how you did across all {total} rounds</p>
              <div style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:`1px solid ${grade.c}40`,borderTop:`3px solid ${grade.c}`,borderRadius:24,padding:"2.5rem 2rem",textAlign:"center",marginBottom:"1.5rem",boxShadow:`0 0 40px ${grade.c}20`}}>
                <div style={{width:100,height:100,borderRadius:"50%",background:`${grade.c}18`,border:`3px solid ${grade.c}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.25rem",fontFamily:"var(--font-display)",fontWeight:900,fontSize:"3rem",color:grade.c,boxShadow:`0 0 32px ${grade.c}50`,animation:"glowPulse 2s ease-in-out infinite"}}>{grade.g}</div>
                <h3 style={{fontFamily:"var(--font-display)",fontWeight:900,fontSize:"1.5rem",color:grade.c,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8}}>{grade.label}</h3>
                <p style={{color:"var(--muted)",fontSize:"0.875rem",marginBottom:"1.75rem"}}>You got <strong style={{color:"#fff"}}>{score} out of {total}</strong> correct ({pct}%)</p>
                <div style={{maxWidth:300,margin:"0 auto 2rem"}}>
                  <div style={{height:8,borderRadius:999,background:"rgba(255,255,255,0.08)",overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:999,background:`linear-gradient(90deg,${grade.c},${grade.c}aa)`,width:`${pct}%`,transition:"width 1.2s cubic-bezier(0.34,1.56,0.64,1)"}}/>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:"2.5rem"}}>
                  {[{label:"Correct",value:score,c:"#22d87a"},{label:"Wrong",value:total-score,c:"#f87171"},{label:"Best Streak",value:`🔥 ${bestStreak}`,c:"#fb923c"}].map(s=>(
                    <div key={s.label}>
                      <div style={{fontFamily:"var(--font-display)",fontWeight:900,fontSize:"2rem",color:s.c}}>{s.value}</div>
                      <div style={{fontSize:"0.72rem",color:"var(--muted)",marginTop:2}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <h3 style={{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"1.1rem",letterSpacing:"0.06em",textTransform:"uppercase",color:"rgba(255,255,255,0.6)",marginBottom:"0.75rem"}}>Round Recap</h3>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:"1.75rem"}}>
                {history.map((h,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${h.correct?"rgba(34,216,122,0.15)":"rgba(248,113,113,0.12)"}`,backdropFilter:"blur(10px)",borderRadius:14,padding:"0.7rem 1rem",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:28,height:28,borderRadius:"50%",flexShrink:0,background:h.correct?"rgba(34,216,122,0.2)":"rgba(248,113,113,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",color:h.correct?"#22d87a":"#f87171"}}>{h.correct?"✓":"✗"}</div>
                    <div style={{flex:1,fontSize:"0.875rem"}}>
                      <span style={{fontWeight:700,color:"#fff"}}>{h.pair[h.winner].name}</span>
                      <span style={{color:"var(--muted)"}}> beat </span>
                      <span style={{color:"rgba(255,255,255,0.6)"}}>{h.pair[h.winner==="a"?"b":"a"].name}</span>
                    </div>
                    <div style={{fontSize:"0.75rem",display:"flex",gap:8,alignItems:"center"}}>
                      <span style={{color:scoreColor(h.pair[h.winner].score).main,fontWeight:800,fontFamily:"var(--font-display)"}}>{h.pair[h.winner].score}</span>
                      <span style={{color:"var(--muted)"}}>vs</span>
                      <span style={{color:"var(--muted)"}}>{h.pair[h.winner==="a"?"b":"a"].score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:12}}>
                <button onClick={handleRestart} style={{flex:1,padding:"1rem",borderRadius:16,border:"none",background:"linear-gradient(135deg,#22d87a,#16a34a)",color:"#fff",fontWeight:700,fontSize:"1rem",cursor:"pointer",fontFamily:"var(--font-display)",letterSpacing:"0.06em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 20px rgba(34,216,122,0.4)",transition:"transform 0.2s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
                  ↺ Play Again
                </button>
                <button onClick={() => navigate('/body-goals')} style={{flex:1,padding:"1rem",borderRadius:16,border:"1.5px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.04)",backdropFilter:"blur(12px)",color:"rgba(255,255,255,0.6)",fontWeight:600,fontSize:"0.9rem",cursor:"pointer",fontFamily:"var(--font-display)",letterSpacing:"0.04em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"border-color 0.2s,color 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.3)";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.6)";}}>
                  ⊙ My Body Goals
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}