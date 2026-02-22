import React, { useState, useRef, useEffect } from 'react';
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

const QUAGGA_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js';
const loadQuagga = () => new Promise((resolve, reject) => {
  if (window.Quagga) { resolve(window.Quagga); return; }
  const s = document.createElement('script'); s.src = QUAGGA_CDN;
  s.onload = () => resolve(window.Quagga); s.onerror = () => reject();
  document.head.appendChild(s);
});

const Particle = ({ style }) => (
  <div className="absolute rounded-full pointer-events-none" style={{ width:style.size, height:style.size, left:style.left, top:style.top, background:style.color, opacity:0, animation:`bs-float ${style.duration}s ${style.delay}s ease-in-out infinite`, filter:'blur(1px)' }} />
);

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const [barcode, setBarcode]         = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');
  const [product, setProduct]         = useState(null);
  const [scanning, setScanning]       = useState(false);
  const [camError, setCamError]       = useState('');
  const [quaggaReady, setQuaggaReady] = useState(false);
  const [hasMultipleCams, setHasMultipleCams] = useState(false);
  const [facingMode, setFacingMode]   = useState('environment');
  const [visible, setVisible]         = useState(false);
  const [productVisible, setProductVisible] = useState(false);
  const inputRef      = useRef(null);
  const scannerDivRef = useRef(null);
  const detectedRef   = useRef(false);
  const particlesRef  = useRef([]);

  if (particlesRef.current.length === 0) {
    particlesRef.current = Array.from({ length: 24 }, (_, i) => ({
      id: i, size:`${Math.random()*3+2}px`, left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
      color:['#22d87a','#4ade80','#16a34a','#86efac','#34d399'][Math.floor(Math.random()*5)],
      duration:Math.random()*8+6, delay:Math.random()*6,
    }));
  }

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    loadQuagga().then(() => setQuaggaReady(true)).catch(() => setCamError('Scanner library failed to load.'));
    navigator.mediaDevices?.enumerateDevices().then(d => setHasMultipleCams(d.filter(x => x.kind === 'videoinput').length > 1)).catch(() => {});
    return () => stopScanner();
  }, []);

  const startScanner = () => {
    if (!quaggaReady) { setCamError('Scanner not ready yet.'); return; }
    setCamError(''); setError(''); setProduct(null); detectedRef.current = false;
    const Q = window.Quagga;
    Q.init({ inputStream:{ name:'Live', type:'LiveStream', target:scannerDivRef.current, constraints:{ facingMode, width:{ideal:1280}, height:{ideal:720} } }, locator:{ patchSize:'medium', halfSample:true }, numOfWorkers:navigator.hardwareConcurrency||2, frequency:10, decoder:{ readers:['ean_reader','ean_8_reader','upc_reader','upc_e_reader','code_128_reader','code_39_reader'] }, locate:true }, (err) => {
      if (err) { setCamError(err.name==='NotAllowedError' ? 'Camera access denied.' : 'Could not start camera.'); return; }
      Q.start(); setScanning(true);
    });
    Q.onDetected((result) => {
      if (detectedRef.current) return;
      const code = result?.codeResult?.code;
      if (code) { detectedRef.current = true; stopScanner(); setBarcode(code); fetchByBarcode(code); }
    });
  };
  const stopScanner = () => { try { if (window.Quagga) { window.Quagga.offDetected(); window.Quagga.stop(); } } catch {} setScanning(false); };
  const flipCamera  = () => { stopScanner(); setFacingMode(p => p==='environment'?'user':'environment'); setTimeout(startScanner, 300); };

  const fetchByBarcode = async (code) => {
    setIsLoading(true); setError(''); setProduct(null); setProductVisible(false);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status===0||!data.product) { setError('Product not found.'); setIsLoading(false); return; }
      const p = data.product, n = p.nutriments||{};
      setProduct({ foodName:p.product_name||p.generic_name||'Unknown Product', brand:p.brands||'', imageUrl:p.image_url||'', servingSize:p.serving_size||'100g', confidence:99, nutrition:{ calories:Math.round(n['energy-kcal_100g']||n['energy-kcal']||0), protein:Math.round((n.proteins_100g||0)*10)/10, fat:Math.round((n.fat_100g||0)*10)/10, carbohydrates:Math.round((n.carbohydrates_100g||0)*10)/10, sugar:Math.round((n.sugars_100g||0)*10)/10, fiber:Math.round((n.fiber_100g||0)*10)/10 }, imagePreview:p.image_url||'' });
      setTimeout(() => setProductVisible(true), 80);
    } catch { setError('Failed to fetch product.'); }
    setIsLoading(false);
  };

  const handleSearch = () => { if (!barcode.trim()) { setError('Please enter a barcode number'); return; } fetchByBarcode(barcode.trim()); };
  const handleViewNutrition = () => { sessionStorage.setItem('nutritionAnalysis', JSON.stringify(product)); navigate('/nutrition-results'); };
  const handleSaveToHistory = () => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user')||'{}');
    if (!user?.id) return;
    fetch('http://localhost:5000/api/history', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ user_id:user.id, food_name:product.foodName, confidence:product.confidence, calories:product.nutrition.calories, protein:product.nutrition.protein, fat:product.nutrition.fat, carbohydrates:product.nutrition.carbohydrates, sugar:product.nutrition.sugar, fiber:product.nutrition.fiber, image_preview:product.imagePreview||'' }) }).then(() => alert('Saved to history!'));
  };

  const nutrientItems = product ? [
    { label:'Calories', value:product.nutrition.calories,      unit:'kcal', color:'#22d87a' },
    { label:'Protein',  value:product.nutrition.protein,        unit:'g',    color:'#14b8a6' },
    { label:'Carbs',    value:product.nutrition.carbohydrates,  unit:'g',    color:'#84cc16' },
    { label:'Fat',      value:product.nutrition.fat,            unit:'g',    color:'#f59e0b' },
    { label:'Sugar',    value:product.nutrition.sugar,          unit:'g',    color:'#4ade80' },
    { label:'Fiber',    value:product.nutrition.fiber,          unit:'g',    color:'#10b981' },
  ] : [];

  return (
    <>
      <style>{`
        @keyframes bs-float { 0% { opacity:0; transform:translateY(0) scale(1); } 20% { opacity:0.6; } 80% { opacity:0.3; } 100% { opacity:0; transform:translateY(-100px) scale(0.5); } }
        @keyframes bs-orb { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(30px,-22px) scale(1.04); } 66% { transform:translate(-20px,15px) scale(0.96); } }
        @keyframes bs-pulse { 0%,100% { transform:scale(1); opacity:0.7; } 50% { transform:scale(1.08); opacity:1; } }
        @keyframes bs-spin { to { transform:rotate(360deg); } }
        @keyframes bs-laser { 0% { top:6%; opacity:0.7; } 50% { top:90%; opacity:1; } 100% { top:6%; opacity:0.7; } }
        @keyframes bs-shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes bs-slide-up { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bs-border-glow { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
        @keyframes bs-dot-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(.7); } }
        @keyframes bs-sparkle { 0%,100% { opacity:0; transform:scale(0.4); } 50% { opacity:1; transform:scale(1.3); } }
        @keyframes bs-corner-glow { 0%,100% { box-shadow:0 0 6px rgba(34,216,122,0.5); } 50% { box-shadow:0 0 16px rgba(34,216,122,1), 0 0 28px rgba(34,216,122,0.4); } }
      `}</style>

      <GlitterLayer />
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

      <div style={{ minHeight:'calc(100vh - 64px)', position:'relative', overflow:'hidden' }}>

        {/* Ambient orbs */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,216,122,0.08) 0%, transparent 70%)', top:'-18%', left:'-12%', animation:'bs-orb 22s ease-in-out infinite' }} />
          <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)', bottom:'5%', right:'-5%', animation:'bs-orb 26s ease-in-out infinite reverse' }} />
          <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,216,122,0.05) 0%, transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'bs-pulse 8s ease-in-out infinite' }} />
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(34,216,122,0.07) 1px, transparent 1px)', backgroundSize:'36px 36px' }} />
        </div>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          {particlesRef.current.map(p => <Particle key={p.id} style={p} />)}
        </div>

        {/* Main content */}
        <div style={{ position:'relative', zIndex:10, maxWidth:1100, margin:'0 auto', padding:'2rem 1.5rem', opacity:visible?1:0, transform:visible?'translateY(0)':'translateY(16px)', transition:'opacity 0.6s ease, transform 0.6s ease' }}>

          {/* Header */}
          <div style={{ marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:8, justifyContent:'center' }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:52, height:52, borderRadius:16, background:'rgba(34,216,122,0.15)', border:'1px solid rgba(34,216,122,0.28)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 28px rgba(34,216,122,0.22)', overflow:'hidden', position:'relative' }}>
                  <Icon name="ScanLine" size={26} color="#22d87a" />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)', backgroundSize:'200% 100%', animation:'bs-shimmer 3s ease-in-out infinite' }} />
                </div>
                <div style={{ position:'absolute', inset:-6, borderRadius:20, border:'2px solid transparent', borderTopColor:'rgba(34,216,122,0.6)', borderRightColor:'rgba(34,216,122,0.18)', animation:'bs-spin 4s linear infinite' }} />
                <div style={{ position:'absolute', inset:-10, borderRadius:22, border:'1px dashed rgba(34,216,122,0.14)', animation:'bs-spin 10s linear infinite reverse' }} />
              </div>
              <div>
                <h1 style={{ fontSize:'clamp(1.6rem,3vw,2.4rem)', fontWeight:800, color:'#f0f4ff', letterSpacing:-1, margin:0, lineHeight:1.1 }}>
                  Barcode{' '}
                  <span style={{ background:'linear-gradient(135deg, #22d87a, #4ade80)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Scanner</span>
                </h1>
              </div>
            </div>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, textAlign:'center', margin:0 }}>Scan a product barcode with your camera or enter it manually to get instant nutrition info.</p>
          </div>

          {/* Scanner Zone */}
          {!product && (
            <div style={{ position:'relative', borderRadius:28, overflow:'hidden', border:scanning?'2px solid rgba(34,216,122,0.6)':'2px solid rgba(34,216,122,0.14)', background:scanning?'rgba(0,0,0,0.96)':'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)', minHeight:520, display:'flex', flexDirection:'column', boxShadow:scanning?'0 0 80px rgba(34,216,122,0.18), inset 0 0 60px rgba(34,216,122,0.04)':'0 8px 48px rgba(0,0,0,0.4)', transition:'border-color 0.3s, background 0.3s, box-shadow 0.4s' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, rgba(34,216,122,0.9), rgba(34,216,122,1), rgba(34,216,122,0.9), transparent)', animation:'bs-border-glow 3s ease-in-out infinite', pointerEvents:'none', zIndex:2 }} />
              <div style={{ position:'absolute', bottom:0, left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, rgba(34,216,122,0.3), transparent)', animation:'bs-border-glow 3s ease-in-out infinite 1.5s', pointerEvents:'none' }} />

              {!scanning && (<>
                {[{ top:18, left:18, bt:'2px', bl:'2px', br1:'8px 0 0 0' }, { top:18, right:18, bt:'2px', br:'2px', br1:'0 8px 0 0' }, { bottom:18, left:18, bb:'2px', bl:'2px', br1:'0 0 0 8px' }, { bottom:18, right:18, bb:'2px', br:'2px', br1:'0 0 8px 0' }].map((c, i) => (
                  <div key={i} style={{ position:'absolute', width:32, height:32, top:c.top, left:c.left, right:c.right, bottom:c.bottom, borderTop:c.bt?`${c.bt} solid rgba(34,216,122,0.5)`:'none', borderBottom:c.bb?`${c.bb} solid rgba(34,216,122,0.5)`:'none', borderLeft:c.bl?`${c.bl} solid rgba(34,216,122,0.5)`:'none', borderRight:c.br?`${c.br} solid rgba(34,216,122,0.5)`:'none', borderRadius:c.br1 }} />
                ))}
                {[{ top:18, left:18 }, { top:18, right:18 }, { bottom:18, left:18 }, { bottom:18, right:18 }].map((pos, i) => (
                  <div key={i} style={{ position:'absolute', width:8, height:8, borderRadius:'50%', background:'#22d87a', animation:`bs-corner-glow 2s ${i*0.45}s ease-in-out infinite`, ...pos }} />
                ))}
              </>)}

              <div ref={scannerDivRef} style={{ display:scanning?'block':'none', width:'100%', flex:1 }} />

              {scanning && (<>
                <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.30)', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
                  <div style={{ position:'relative', width:'52%', maxWidth:420, aspectRatio:'3/1' }}>
                    {[{ top:0, left:0, borderWidth:'3px 0 0 3px', borderRadius:'8px 0 0 0' }, { top:0, right:0, borderWidth:'3px 3px 0 0', borderRadius:'0 8px 0 0' }, { bottom:0, left:0, borderWidth:'0 0 3px 3px', borderRadius:'0 0 0 8px' }, { bottom:0, right:0, borderWidth:'0 3px 3px 0', borderRadius:'0 0 8px 0' }].map((s, i) => (
                      <span key={i} style={{ position:'absolute', width:36, height:36, borderColor:'#22d87a', borderStyle:'solid', boxShadow:'0 0 14px rgba(34,216,122,0.7)', ...s }} />
                    ))}
                    <div style={{ position:'absolute', left:4, right:4, height:2, borderRadius:2, background:'linear-gradient(90deg,transparent,#22d87a,#4ade80,#22d87a,transparent)', boxShadow:'0 0 24px rgba(34,216,122,1), 0 0 48px rgba(34,216,122,0.6)', animation:'bs-laser 1.8s ease-in-out infinite' }} />
                  </div>
                </div>
                <div style={{ position:'absolute', top:16, right:16, display:'flex', gap:8, zIndex:10 }}>
                  {hasMultipleCams && <button onClick={flipCamera} style={overlayBtnStyle} title="Flip camera"><Icon name="RefreshCw" size={16} /></button>}
                  <button onClick={stopScanner} style={{ ...overlayBtnStyle, background:'rgba(239,68,68,0.65)', borderColor:'rgba(239,68,68,0.4)' }} title="Stop"><Icon name="X" size={16} /></button>
                </div>
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'1rem', textAlign:'center', background:'linear-gradient(transparent, rgba(0,0,0,0.72))', color:'rgba(255,255,255,0.8)', fontSize:13 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#22d87a', boxShadow:'0 0 8px rgba(34,216,122,0.9)', animation:'bs-dot-pulse 1.5s ease-in-out infinite' }} />
                    Hold the barcode steady inside the frame
                  </div>
                </div>
              </>)}

              {!scanning && (
                <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:26, padding:'3rem 2rem', textAlign:'center' }}>
                  <div style={{ position:'relative' }}>
                    <div style={{ position:'absolute', inset:-32, borderRadius:'50%', border:'1px solid rgba(34,216,122,0.07)', animation:'bs-spin 28s linear infinite' }} />
                    <div style={{ position:'absolute', inset:-20, borderRadius:'50%', border:'1px dashed rgba(34,216,122,0.13)', animation:'bs-spin 16s linear infinite reverse' }} />
                    <div style={{ position:'absolute', inset:-10, borderRadius:'50%', border:'2px solid transparent', borderTopColor:'rgba(34,216,122,0.6)', borderRightColor:'rgba(34,216,122,0.18)', animation:'bs-spin 4s linear infinite' }} />
                    <div style={{ position:'relative', width:108, height:108, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,216,122,0.15) 0%, rgba(34,216,122,0.04) 70%)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 50px rgba(34,216,122,0.20), 0 0 100px rgba(34,216,122,0.06)', border:'1.5px solid rgba(34,216,122,0.22)', animation:'bs-pulse 4s ease-in-out infinite' }}>
                      <Icon name="ScanLine" size={46} color="#22d87a" />
                    </div>
                    {[{ top:-10, left:54, delay:'0s', size:7 }, { top:54, left:-10, delay:'0.7s', size:5 }, { top:-4, right:18, delay:'1.4s', size:4 }, { bottom:-2, right:-8, delay:'2s', size:6 }, { bottom:-8, left:26, delay:'2.8s', size:5 }].map((s, i) => (
                      <div key={i} style={{ position:'absolute', width:s.size, height:s.size, borderRadius:'50%', background:'#22d87a', boxShadow:'0 0 8px rgba(34,216,122,1)', animation:`bs-sparkle 3.5s ${s.delay} ease-in-out infinite`, top:s.top, left:s.left, right:s.right, bottom:s.bottom }} />
                    ))}
                  </div>

                  <div>
                    <h2 style={{ fontSize:'1.7rem', fontWeight:800, color:'#f0f4ff', marginBottom:8, letterSpacing:-0.5 }}>Scan Barcode</h2>
                    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, maxWidth:380, lineHeight:1.6 }}>Point your camera at a product barcode, or enter it manually below</p>
                  </div>

                  <button onClick={startScanner} style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:10, padding:'0.9rem 2.6rem', background:'linear-gradient(135deg, #15803d, #22d87a, #16a34a)', color:'#0a0e17', border:'none', borderRadius:50, fontSize:'1rem', fontWeight:700, cursor:'pointer', overflow:'hidden', boxShadow:'0 4px 28px rgba(34,216,122,0.38)', transition:'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow='0 10px 40px rgba(34,216,122,0.55)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0) scale(1)'; e.currentTarget.style.boxShadow='0 4px 28px rgba(34,216,122,0.38)'; }}
                  >
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.18) 50%,transparent 100%)', backgroundSize:'200% 100%', animation:'bs-shimmer 2.5s linear infinite' }} />
                    <Icon name="Camera" size={20} /><span style={{ position:'relative', zIndex:1 }}>Start Camera</span>
                  </button>

                  <div style={{ display:'flex', alignItems:'center', gap:14, width:'100%', maxWidth:420 }}>
                    <div style={{ flex:1, height:1, background:'linear-gradient(90deg, transparent, rgba(34,216,122,0.2), transparent)' }} />
                    <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12, whiteSpace:'nowrap', padding:'4px 12px', borderRadius:50, background:'rgba(34,216,122,0.05)', border:'1px solid rgba(34,216,122,0.12)' }}>or enter manually</span>
                    <div style={{ flex:1, height:1, background:'linear-gradient(90deg, transparent, rgba(34,216,122,0.2), transparent)' }} />
                  </div>

                  <div style={{ display:'flex', gap:10, width:'100%', maxWidth:500 }}>
                    <div style={{ flex:1, position:'relative' }}>
                      <input ref={inputRef} type="number" placeholder="e.g. 3017620422003" value={barcode} onChange={e => setBarcode(e.target.value)} onKeyDown={e => e.key==='Enter'&&handleSearch()}
                        style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:50, padding:'12px 22px', fontSize:14, color:'#f0f4ff', outline:'none', boxSizing:'border-box', transition:'border-color 0.2s, box-shadow 0.2s' }}
                        onFocus={e => { e.target.style.borderColor='rgba(34,216,122,0.6)'; e.target.style.boxShadow='0 0 0 3px rgba(34,216,122,0.10)'; }}
                        onBlur={e  => { e.target.style.borderColor='rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
                      />
                    </div>
                    <button onClick={handleSearch} disabled={isLoading} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'0 1.8rem', background:'linear-gradient(135deg,#15803d,#22d87a)', color:'#0a0e17', border:'none', borderRadius:50, fontSize:14, fontWeight:700, cursor:'pointer', opacity:isLoading?0.65:1, whiteSpace:'nowrap', boxShadow:'0 4px 18px rgba(34,216,122,0.28)', transition:'transform 0.2s, box-shadow 0.2s' }}
                      onMouseEnter={e => !isLoading&&(e.currentTarget.style.transform='translateY(-1px)',e.currentTarget.style.boxShadow='0 8px 28px rgba(34,216,122,0.4)')}
                      onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)',e.currentTarget.style.boxShadow='0 4px 18px rgba(34,216,122,0.28)')}
                    >
                      {isLoading ? <div style={{ width:16, height:16, border:'2px solid rgba(10,14,23,0.3)', borderTopColor:'#0a0e17', borderRadius:'50%', animation:'bs-spin 0.7s linear infinite' }} /> : <Icon name="Search" size={16} />}
                      Search
                    </button>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                    <span style={{ color:'rgba(255,255,255,0.35)', fontSize:13 }}>Try:</span>
                    {[{ label:'Nutella', code:'3017620422003' }, { label:'Coca Cola', code:'5449000000996' }, { label:'Oreo', code:'7622210449283' }].map((ex, i) => (
                      <button key={ex.code} onClick={() => { setBarcode(ex.code); fetchByBarcode(ex.code); }}
                        style={{ fontSize:13, border:'1px solid rgba(34,216,122,0.16)', borderRadius:50, padding:'6px 16px', color:'rgba(255,255,255,0.6)', background:'rgba(34,216,122,0.05)', cursor:'pointer', transition:'all 0.2s', animation:`bs-slide-up 0.4s ${0.6+i*0.1}s both` }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(34,216,122,0.5)'; e.currentTarget.style.color='#22d87a'; e.currentTarget.style.background='rgba(34,216,122,0.10)'; e.currentTarget.style.transform='scale(1.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(34,216,122,0.16)'; e.currentTarget.style.color='rgba(255,255,255,0.6)'; e.currentTarget.style.background='rgba(34,216,122,0.05)'; e.currentTarget.style.transform='scale(1)'; }}
                      >{ex.label}</button>
                    ))}
                  </div>

                  {(camError||error) && (
                    <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'12px 16px', borderRadius:14, maxWidth:440, width:'100%', background:'rgba(239,68,68,0.08)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', fontSize:14, animation:'bs-slide-up 0.3s both' }}>
                      <Icon name="AlertCircle" size={16} /><span>{camError||error}</span>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:24, color:'rgba(255,255,255,0.3)', fontSize:12, marginTop:4 }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}><Icon name="ScanLine" size={13} color="#22d87a" /> EAN-13, UPC-A, Code128</span>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}><Icon name="Globe" size={13} color="#22d87a" /> Powered by Open Food Facts</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {isLoading&&!product&&(
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, paddingTop:80, animation:'bs-slide-up 0.4s both' }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:60, height:60, borderRadius:'50%', border:'3px solid rgba(34,216,122,0.10)', borderTopColor:'rgba(34,216,122,0.85)', animation:'bs-spin 0.9s linear infinite' }} />
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:'3px solid transparent', borderBottomColor:'rgba(34,216,122,0.45)', animation:'bs-spin 1.4s linear infinite reverse' }} />
              </div>
              <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, letterSpacing:'0.08em', fontWeight:600 }}>LOOKING UP PRODUCT…</p>
            </div>
          )}

          {/* Product Result */}
          {product&&(
            <div style={{ opacity:productVisible?1:0, transform:productVisible?'translateY(0)':'translateY(20px)', transition:'opacity 0.6s ease, transform 0.6s ease' }}>
              <div style={{ position:'relative', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(34,216,122,0.16)', borderRadius:24, padding:'2rem', overflow:'hidden', boxShadow:'0 8px 48px rgba(0,0,0,0.4)', backdropFilter:'blur(20px)' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, #15803d, #22d87a, #4ade80, #86efac, #22d87a, #4ade80, #15803d)', backgroundSize:'200% 100%', animation:'bs-shimmer 4s linear infinite' }} />
                <div style={{ display:'flex', alignItems:'flex-start', gap:24, marginBottom:32, marginTop:8 }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.foodName} style={{ width:112, height:112, borderRadius:16, objectFit:'contain', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(34,216,122,0.16)', boxShadow:'0 4px 18px rgba(34,216,122,0.12)', flexShrink:0 }} />
                  ) : (
                    <div style={{ width:112, height:112, borderRadius:16, background:'rgba(34,216,122,0.07)', border:'1px solid rgba(34,216,122,0.16)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name="Package" size={36} color="#22d87a" />
                    </div>
                  )}
                  <div>
                    <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'#f0f4ff', marginBottom:4 }}>{product.foodName}</h2>
                    {product.brand&&<p style={{ color:'rgba(255,255,255,0.4)', marginBottom:10, fontSize:14 }}>{product.brand}</p>}
                    <span style={{ fontSize:12, background:'rgba(34,216,122,0.07)', padding:'4px 12px', borderRadius:50, color:'rgba(255,255,255,0.4)', border:'1px solid rgba(34,216,122,0.16)' }}>Per {product.servingSize}</span>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
                  {nutrientItems.map((item, i) => <NutrientCard key={i} item={item} index={i} />)}
                </div>

                <div style={{ display:'flex', gap:12 }}>
                  <button onClick={handleViewNutrition} style={{ position:'relative', flex:1, padding:'1rem', borderRadius:14, background:'linear-gradient(135deg,#15803d,#22d87a)', color:'#0a0e17', border:'none', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, overflow:'hidden', transition:'transform 0.2s, box-shadow 0.2s', boxShadow:'0 4px 18px rgba(34,216,122,0.28)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 30px rgba(34,216,122,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 18px rgba(34,216,122,0.28)'; }}
                  >
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)', backgroundSize:'200% 100%', animation:'bs-shimmer 2.5s linear infinite' }} />
                    <Icon name="Eye" size={16} /><span style={{ position:'relative', zIndex:1 }}>View Full Details</span>
                  </button>
                  <button onClick={handleSaveToHistory} style={{ flex:1, padding:'1rem', borderRadius:14, background:'rgba(34,216,122,0.06)', color:'rgba(255,255,255,0.7)', border:'1px solid rgba(34,216,122,0.16)', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(34,216,122,0.12)'; e.currentTarget.style.borderColor='rgba(34,216,122,0.38)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(34,216,122,0.06)'; e.currentTarget.style.borderColor='rgba(34,216,122,0.16)'; }}
                  >
                    <Icon name="BookmarkPlus" size={16} />Save to History
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const NutrientCard = ({ item, index }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ position:'relative', background:`${item.color}10`, border:`1px solid ${hovered?item.color+'55':item.color+'22'}`, borderRadius:16, padding:'1rem', textAlign:'center', overflow:'hidden', transform:hovered?'translateY(-3px) scale(1.04)':'translateY(0) scale(1)', boxShadow:hovered?`0 10px 28px ${item.color}28`:'none', transition:'all 0.28s ease', animation:`bs-slide-up 0.4s ${index*0.07}s both`, cursor:'default' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${item.color}55, transparent)`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at center, ${item.color}18 0%, transparent 70%)`, opacity:hovered?1:0, transition:'opacity 0.28s', pointerEvents:'none' }} />
      <div style={{ position:'relative', fontSize:'1.3rem', fontWeight:800, color:item.color }}>{item.value}<span style={{ fontSize:'0.75rem', marginLeft:2, fontWeight:500, opacity:0.75 }}>{item.unit}</span></div>
      <div style={{ position:'relative', fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{item.label}</div>
    </div>
  );
};

const overlayBtnStyle = { display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.16)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.22)', color:'#fff', cursor:'pointer', transition:'transform 0.2s' };

export default BarcodeScanner;