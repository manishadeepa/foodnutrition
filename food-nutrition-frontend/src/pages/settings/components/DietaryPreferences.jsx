import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const styles = `
  @keyframes shimmer-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes text-gradient-anim { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
  @keyframes card-in { 0% { opacity:0; transform:translateY(14px) scale(0.96); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes banner-in { 0% { opacity:0; transform:translateY(-8px); } 100% { opacity:1; transform:translateY(0); } }
  @keyframes pill-pop { 0% { opacity:0; transform:scale(0.6); } 100% { opacity:1; transform:scale(1); } }
  @keyframes check-pop { 0% { opacity:0; transform:scale(0.3); } 70% { transform:scale(1.2); } 100% { opacity:1; transform:scale(1); } }
  @keyframes spin-slow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

  .dp-gradient-text { background:linear-gradient(135deg, #22d87a, #4ade80); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:text-gradient-anim 4s linear infinite; }
  .dp-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent); animation:shimmer-slide 3s ease-in-out infinite; pointer-events:none; }
  .dp-spin-slow { animation:spin-slow 22s linear infinite; }

  /* ── Card base — dark glass ── */
  .dp-diet-card {
    position:relative; display:flex; flex-direction:column; padding:1.1rem 1rem 1.2rem;
    border-radius:1rem;
    background:rgba(255,255,255,0.05);
    border:1.5px solid rgba(255,255,255,0.09);
    cursor:pointer; text-align:left; min-height:168px; user-select:none;
    transition:border-color 0.22s, box-shadow 0.28s, transform 0.22s, background 0.22s;
    overflow:hidden;
  }
  .dp-diet-card:not(.checked):hover { border-color:rgba(34,216,122,0.28); box-shadow:0 4px 18px rgba(34,216,122,0.09); transform:translateY(-2px); }
  .dp-diet-card.checked { transform:translateY(-2px); }
  .dp-card-top { display:flex; align-items:flex-start; justify-content:space-between; }
  .dp-card-icon { display:flex; align-items:center; justify-content:center; width:52px; height:52px; border-radius:50%; flex-shrink:0; transition:background 0.25s, box-shadow 0.25s; }
  .dp-radio { width:26px; height:26px; border-radius:50%; border:1.5px solid rgba(255,255,255,0.18); background:rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  .dp-diet-card.checked .dp-radio { border-color:#22d87a; background:linear-gradient(135deg, #22d87a, #16a34a); box-shadow:0 2px 8px rgba(34,216,122,0.4); animation:check-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }
  .dp-radio-check { opacity:0; transform:scale(0.3); transition:opacity 0.2s, transform 0.2s; }
  .dp-diet-card.checked .dp-radio-check { opacity:1; transform:scale(1); }
  .dp-card-bottom { margin-top:auto; padding-top:0.9rem; }
  .dp-card-label { font-size:0.9375rem; font-weight:700; color:#f0f4ff; margin-bottom:0.2rem; font-family:var(--font-heading); line-height:1.3; }
  .dp-card-desc  { font-size:0.8125rem; color:rgba(255,255,255,0.4); line-height:1.4; }
  .dp-card-accent { position:absolute; bottom:0; left:0; right:0; height:3.5px; border-radius:0 0 1rem 1rem; opacity:0; transform:scaleX(0.6); transition:opacity 0.28s, transform 0.28s cubic-bezier(0.16,1,0.3,1); }
  .dp-diet-card.checked .dp-card-accent { opacity:1; transform:scaleX(1); }
  .dp-cards-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
  @media (max-width:960px) { .dp-cards-grid { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:540px) { .dp-cards-grid { grid-template-columns:1fr; } }

  .dp-textarea { width:100%; height:6rem; padding:0.75rem 1rem; border-radius:0.625rem; border:1.5px solid rgba(34,216,122,0.2); background:rgba(255,255,255,0.06); font-size:0.875rem; color:#f0f4ff; resize:none; outline:none; transition:border-color 0.25s, box-shadow 0.25s; font-family:var(--font-body); }
  .dp-textarea::placeholder { color:rgba(255,255,255,0.25); }
  .dp-textarea:focus { border-color:#22d87a; box-shadow:0 0 0 4px rgba(34,216,122,0.09); }

  .dp-save-btn { position:relative; display:inline-flex; align-items:center; gap:0.5rem; padding:0.9rem 2rem; border-radius:0.75rem; font-size:0.875rem; font-weight:700; color:#0a0e17; border:none; cursor:pointer; overflow:hidden; background:linear-gradient(135deg, #22d87a, #16a34a); box-shadow:0 10px 28px rgba(34,216,122,0.3); transition:transform 0.25s, box-shadow 0.25s; }
  .dp-save-btn:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 16px 36px rgba(34,216,122,0.42); }
  .dp-save-btn:disabled { opacity:0.6; cursor:not-allowed; }
`;

function ProgressRing({ selected, total }) {
  const r = 28, circ = 2 * Math.PI * r;
  const offset = circ - (total > 0 ? selected / total : 0) * circ;
  return (
    <div className="relative flex h-16 w-16 items-center justify-center flex-shrink-0">
      <svg className="h-16 w-16" style={{ transform:'rotate(-90deg)' }} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} stroke="rgba(34,216,122,0.12)" strokeWidth="4" fill="none" />
        <circle cx="32" cy="32" r={r} stroke="url(#dp-grad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 0.65s cubic-bezier(0.16,1,0.3,1)' }} />
        <defs><linearGradient id="dp-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#22d87a"/><stop offset="100%" stopColor="#16a34a"/></linearGradient></defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color:'#f0f4ff' }}>{selected}</span>
        <span className="text-[10px] -mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>/{total}</span>
      </div>
    </div>
  );
}

const dietOptions = [
  { id:'vegetarian', label:'Vegetarian', description:'No meat or fish',             icon:'Leaf',         color:'#22d87a', iconBg:'rgba(34,216,122,0.12)',  checkedIconBg:'#22d87a', cardBg:'rgba(34,216,122,0.06)',  border:'rgba(34,216,122,0.35)'  },
  { id:'vegan',      label:'Vegan',      description:'No animal products',          icon:'Apple',        color:'#4ade80', iconBg:'rgba(74,222,128,0.12)',  checkedIconBg:'#4ade80', cardBg:'rgba(74,222,128,0.06)',  border:'rgba(74,222,128,0.4)'   },
  { id:'glutenFree', label:'Gluten-Free',description:'No wheat, barley, or rye',   icon:'WheatOff',     color:'#f5c842', iconBg:'rgba(245,200,66,0.12)',  checkedIconBg:'#f5c842', cardBg:'rgba(245,200,66,0.06)',  border:'rgba(245,200,66,0.4)'   },
  { id:'keto',       label:'Keto',       description:'Low-carb, high-fat diet',     icon:'Flame',        color:'#ef4444', iconBg:'rgba(239,68,68,0.12)',   checkedIconBg:'#ef4444', cardBg:'rgba(239,68,68,0.06)',   border:'rgba(239,68,68,0.4)'    },
  { id:'paleo',      label:'Paleo',      description:'Whole foods, no processed',   icon:'Drumstick',    color:'#f43f5e', iconBg:'rgba(244,63,94,0.12)',   checkedIconBg:'#f43f5e', cardBg:'rgba(244,63,94,0.06)',   border:'rgba(244,63,94,0.35)'   },
  { id:'dairyFree',  label:'Dairy-Free', description:'No milk products',            icon:'MilkOff',      color:'#60a5fa', iconBg:'rgba(96,165,250,0.12)',  checkedIconBg:'#60a5fa', cardBg:'rgba(96,165,250,0.06)',  border:'rgba(96,165,250,0.35)'  },
  { id:'nutFree',    label:'Nut-Free',   description:'No tree nuts or peanuts',     icon:'Nut',          color:'#f5c842', iconBg:'rgba(245,200,66,0.12)',  checkedIconBg:'#f5c842', cardBg:'rgba(245,200,66,0.06)',  border:'rgba(245,200,66,0.4)'   },
  { id:'lowCarb',    label:'Low-Carb',   description:'Reduced carbohydrate intake', icon:'TrendingDown', color:'#14b8a6', iconBg:'rgba(20,184,166,0.12)',  checkedIconBg:'#14b8a6', cardBg:'rgba(20,184,166,0.06)',  border:'rgba(20,184,166,0.35)'  },
];

const DietaryPreferences = () => {
  const [preferences, setPreferences] = useState({ vegetarian:false, vegan:false, glutenFree:false, keto:false, paleo:false, dairyFree:false, nutFree:false, lowCarb:false });
  const [customRestrictions, setCustomRestrictions] = useState('');
  const [isSaving, setIsSaving]       = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError]     = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user')||'{}');
    if (!user?.id) { setIsLoading(false); return; }
    fetch(`http://localhost:5000/api/preferences/${user.id}`).then(r=>r.json()).then(res => {
      if (res.success && res.data) {
        const prefs = typeof res.data.preferences==='string' ? JSON.parse(res.data.preferences) : res.data.preferences;
        setPreferences(prev => ({ ...prev, ...prefs }));
        setCustomRestrictions(res.data.custom_restrictions||'');
        localStorage.setItem('nutriscan_preferences', JSON.stringify({ preferences:prefs, custom_restrictions:res.data.custom_restrictions||'' }));
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleCheckboxChange = (id) => { setPreferences(prev => ({ ...prev, [id]:!prev?.[id] })); setSaveSuccess(false); setSaveError(''); };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user')||'{}');
    if (!user?.id) { setSaveError('Please log in again.'); return; }
    setIsSaving(true); setSaveSuccess(false); setSaveError('');
    try {
      const res = await fetch('http://localhost:5000/api/preferences', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ user_id:user.id, preferences, custom_restrictions:customRestrictions }) });
      const data = await res.json();
      if (data.success) { localStorage.setItem('nutriscan_preferences', JSON.stringify({ preferences, custom_restrictions:customRestrictions })); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
      else { setSaveError('Failed to save. Please try again.'); }
    } catch { setSaveError('Could not connect to server.'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor:'rgba(34,216,122,0.2)', borderTopColor:'#22d87a' }} />
        <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>Loading preferences...</p>
      </div>
    </div>
  );

  const selectedPrefs = dietOptions.filter(o => preferences[o.id]);

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0 dp-spin-slow" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 8px 22px rgba(34,216,122,0.28)' }}>
              <Icon name="Salad" size={24} color="#0a0e17" />
            </div>
            <div>
              <h2 className="text-h3 font-heading mb-0.5 dp-gradient-text">Dietary Preferences</h2>
              <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>Personalize your AI nutrition analysis</p>
            </div>
          </div>
          <ProgressRing selected={selectedPrefs.length} total={dietOptions.length} />
        </div>

        {/* Active preferences banner */}
        {selectedPrefs.length > 0 && (
          <div className="rounded-2xl p-4 relative overflow-hidden dp-shimmer" style={{ background:'rgba(34,216,122,0.08)', border:'1px solid rgba(34,216,122,0.18)', animation:'banner-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <div className="relative z-10 flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)' }}>
                <Icon name="Shield" size={13} color="#0a0e17" />
              </div>
              <span className="text-sm font-bold dp-gradient-text">{selectedPrefs.length} Active Preference{selectedPrefs.length>1?'s':''}</span>
            </div>
            <p className="relative z-10 text-xs mb-3" style={{ color:'rgba(255,255,255,0.4)' }}>AI analysis will be personalized based on:</p>
            <div className="relative z-10 flex flex-wrap gap-2">
              {selectedPrefs.map((o, idx) => (
                <span key={o.id} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background:`linear-gradient(135deg, ${o.checkedIconBg}, ${o.checkedIconBg}cc)`, boxShadow:`0 3px 10px ${o.checkedIconBg}44`, animation:`pill-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) ${idx*0.05}s both` }}>
                  <Icon name={o.icon} size={11} color="white" />{o.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status banners */}
        {saveSuccess && (
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ background:'rgba(34,216,122,0.08)', border:'1px solid rgba(34,216,122,0.25)', animation:'banner-in 0.35s ease both' }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)' }}><Icon name="CheckCircle" size={16} color="#0a0e17" /></div>
            <p className="text-sm font-semibold" style={{ color:'#22d87a' }}>Dietary preferences saved successfully!</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', animation:'banner-in 0.35s ease both' }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background:'rgba(239,68,68,0.15)' }}><Icon name="AlertCircle" size={16} color="#f87171" /></div>
            <p className="text-sm font-medium" style={{ color:'#f87171' }}>{saveError}</p>
          </div>
        )}

        {/* Card grid */}
        <div className="dp-cards-grid">
          {dietOptions.map((option, idx) => {
            const isChecked = !!preferences[option.id];
            return (
              <button key={option.id} type="button" onClick={() => handleCheckboxChange(option.id)}
                className={`dp-diet-card${isChecked?' checked':''}`}
                style={{ animation:`card-in 0.45s cubic-bezier(0.16,1,0.3,1) ${idx*0.05}s both`, ...(isChecked?{ background:option.cardBg, border:`1.5px solid ${option.border}`, boxShadow:`0 6px 22px ${option.checkedIconBg}18` }:{}) }}
              >
                <div className="dp-card-top">
                  <div className="dp-card-icon" style={{ background:isChecked?`linear-gradient(135deg, ${option.checkedIconBg}, ${option.checkedIconBg}cc)`:option.iconBg, boxShadow:isChecked?`0 4px 14px ${option.checkedIconBg}44`:'none' }}>
                    <Icon name={option.icon} size={22} color={isChecked?'white':option.color} />
                  </div>
                  <div className="dp-radio">
                    <svg className="dp-radio-check" width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2.5 6.5L5.5 9.5L10.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="dp-card-bottom">
                  <p className="dp-card-label">{option.label}</p>
                  <p className="dp-card-desc">{option.description}</p>
                </div>
                <div className="dp-card-accent" style={{ background:`linear-gradient(90deg, ${option.checkedIconBg}, ${option.checkedIconBg}88)` }} />
              </button>
            );
          })}
        </div>

        {/* Custom Restrictions */}
        <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(10px)' }}>
          <label htmlFor="customRestrictions" className="text-sm font-bold block mb-0.5" style={{ color:'#f0f4ff' }}>Custom Dietary Restrictions</label>
          <p className="text-xs mb-3" style={{ color:'rgba(255,255,255,0.35)' }}>Add any specific allergies or dietary needs not listed above</p>
          <textarea id="customRestrictions" value={customRestrictions} onChange={e => { setCustomRestrictions(e?.target?.value); setSaveSuccess(false); }} placeholder="Enter any additional dietary restrictions or allergies..." className="dp-textarea" />
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={isSaving} className="dp-save-btn">
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', animation:'shimmer-slide 2.5s ease-in-out infinite', pointerEvents:'none' }} />
            <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'0.5rem' }}>
              <Icon name={isSaving?'Loader2':'Save'} size={16} color="#0a0e17" />
              {isSaving?'Saving...':'Save Preferences'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default DietaryPreferences;