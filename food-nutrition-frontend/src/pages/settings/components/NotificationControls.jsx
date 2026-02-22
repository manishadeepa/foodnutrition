import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const styles = `
  @keyframes shimmer-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes text-gradient-anim { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
  @keyframes float-bell { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
  @keyframes badge-pop  { 0% { transform:scale(0.5) rotate(-15deg); opacity:0; } 100% { transform:scale(1) rotate(0); opacity:1; } }
  @keyframes card-in    { 0% { opacity:0; transform:translateY(22px) scale(0.96); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes banner-in  { 0% { opacity:0; transform:translateY(-8px) scale(0.96); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes row-in     { 0% { opacity:0; transform:translateX(-10px); } 100% { opacity:1; transform:translateX(0); } }

  .nc-gradient-text { background:linear-gradient(135deg, #22d87a, #4ade80); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:text-gradient-anim 4s linear infinite; }
  .nc-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent); animation:shimmer-slide 3s ease-in-out infinite; pointer-events:none; }
  .nc-glow-hover { transition:box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1); }
  .nc-glow-hover:hover { box-shadow:0 0 18px 3px rgba(34,216,122,0.09), 0 16px 40px -10px rgba(34,216,122,0.15); transform:translateY(-3px); }
  .nc-float-bell { animation:float-bell 3s ease-in-out infinite; }
  .nc-badge-pop  { animation:badge-pop  0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
`;

function GlowToggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={onChange}
      className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent focus-visible:outline-none"
      style={{ background:checked?'linear-gradient(135deg, #22d87a, #16a34a)':'rgba(255,255,255,0.12)', boxShadow:checked?'0 0 12px 2px rgba(34,216,122,0.32)':'none', transition:'background 0.35s, box-shadow 0.35s' }}
    >
      <span className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg" style={{ transform:checked?'translateX(20px)':'translateX(0)', transition:'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </button>
  );
}

const NotificationControls = () => {
  const [notifications, setNotifications] = useState({ pushAnalysisComplete:true, pushNewFeatures:false, emailWeeklySummary:true, emailPromotional:false, emailSecurityAlerts:true });
  const [emailFrequency, setEmailFrequency] = useState('weekly');
  const [isSaving, setIsSaving]       = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError]     = useState('');

  const frequencyOptions = [{ value:'daily', label:'Daily' }, { value:'weekly', label:'Weekly' }, { value:'monthly', label:'Monthly' }, { value:'never', label:'Never' }];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user')||'{}');
    if (!user?.id) { setIsLoading(false); return; }
    fetch(`http://localhost:5000/api/notifications/${user.id}`).then(r=>r.json()).then(res => {
      if (res.success && res.data) {
        const notifs = typeof res.data.notifications==='string' ? JSON.parse(res.data.notifications) : res.data.notifications;
        setNotifications(prev => ({ ...prev, ...notifs })); setEmailFrequency(res.data.email_frequency||'weekly');
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleCheckboxChange = (id) => { setNotifications(prev => ({ ...prev, [id]:!prev?.[id] })); setSaveSuccess(false); setSaveError(''); };

  const handleSave = async () => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user')||'{}');
    if (!user?.id) { setSaveError('Please log in again.'); return; }
    setIsSaving(true); setSaveSuccess(false); setSaveError('');
    try {
      const res = await fetch('http://localhost:5000/api/notifications', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ user_id:user.id, notifications, email_frequency:emailFrequency }) });
      const data = await res.json();
      if (data.success) { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
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

  const activeCount = Object.values(notifications).filter(Boolean).length;

  const renderSection = (title, iconName, gradient, rows, delay) => (
    <div className="rounded-2xl overflow-hidden nc-glow-hover" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', animation:`card-in 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}s both` }}>
      <div className="flex items-center gap-3 px-5 py-4 relative overflow-hidden nc-shimmer" style={{ background:gradient }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background:'rgba(10,14,23,0.25)', backdropFilter:'blur(4px)' }}>
          <Icon name={iconName} size={18} color="white" />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <div className="p-5 space-y-1">
        {rows.map((row, idx) => (
          <div key={row.id} className="flex items-center justify-between gap-4 rounded-xl px-4 py-4 transition-all duration-300"
            style={{ background:notifications[row.id]?'rgba(34,216,122,0.06)':'transparent', border:notifications[row.id]?'1px solid rgba(34,216,122,0.12)':'1px solid transparent', animation:`row-in 0.4s ease ${delay+idx*0.07}s both` }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color:'#f0f4ff' }}>{row.label}</p>
              <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>{row.description}</p>
            </div>
            <GlowToggle checked={notifications[row.id]} onChange={() => handleCheckboxChange(row.id)} />
          </div>
        ))}
      </div>
    </div>
  );

  const pushRows  = [{ id:'pushAnalysisComplete', label:'Analysis Complete', description:'Get notified when your food analysis is ready' }, { id:'pushNewFeatures', label:'New Features', description:'Stay updated on new app features and improvements' }];
  const emailRows = [{ id:'emailWeeklySummary', label:'Weekly Summary', description:'Receive a summary of your nutrition analysis' }, { id:'emailPromotional', label:'Promotional Emails', description:'Get updates about special offers and promotions' }, { id:'emailSecurityAlerts', label:'Security Alerts', description:'Important notifications about your account security' }];

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 nc-float-bell" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 8px 20px rgba(34,216,122,0.28)' }}>
            <Icon name="BellRing" size={22} color="#0a0e17" />
          </div>
          <div className="flex-1">
            <h2 className="text-h3 font-heading mb-0.5 nc-gradient-text">Notification Controls</h2>
            <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>Manage how you receive updates and alerts</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-bold nc-badge-pop" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 4px 12px rgba(34,216,122,0.32)' }}>
            <Icon name="Zap" size={11} color="#0a0e17" />{activeCount} Active
          </div>
        </div>

        {/* Banners */}
        {saveSuccess && (
          <div className="flex items-center gap-3 rounded-xl p-4 relative overflow-hidden nc-shimmer" style={{ background:'rgba(34,216,122,0.08)', border:'1px solid rgba(34,216,122,0.25)', animation:'banner-in 0.35s ease both' }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)' }}><Icon name="CheckCircle" size={16} color="#0a0e17" /></div>
            <p className="text-sm font-semibold" style={{ color:'#22d87a' }}>Notification preferences saved successfully!</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', animation:'banner-in 0.35s ease both' }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background:'rgba(239,68,68,0.15)' }}><Icon name="AlertCircle" size={16} color="#f87171" /></div>
            <p className="text-sm font-medium" style={{ color:'#f87171' }}>{saveError}</p>
          </div>
        )}

        {renderSection('Push Notifications',  'Smartphone', 'linear-gradient(135deg, #22d87a, #16a34a)', pushRows,  0.1)}
        {renderSection('Email Notifications', 'Mail',       'linear-gradient(135deg, #16a34a, #22d87a)', emailRows, 0.22)}

        {/* Email Frequency */}
        <div className="rounded-2xl overflow-hidden nc-glow-hover" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', animation:'card-in 0.55s cubic-bezier(0.16,1,0.3,1) 0.34s both' }}>
          <div className="flex items-center gap-3 px-5 py-4 relative overflow-hidden nc-shimmer" style={{ background:'linear-gradient(135deg, #16a34a, #22d87a)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background:'rgba(10,14,23,0.25)' }}>
              <Icon name="Bell" size={18} color="white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Email Summary Frequency</h3>
              <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.7)' }}>How often would you like email summaries?</p>
            </div>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {frequencyOptions.map(opt => (
                <button key={opt.value} type="button" onClick={() => { setEmailFrequency(opt.value); setSaveSuccess(false); }}
                  className="relative px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden"
                  style={{ background:emailFrequency===opt.value?'linear-gradient(135deg, #22d87a, #16a34a)':'rgba(255,255,255,0.06)', color:emailFrequency===opt.value?'#0a0e17':'rgba(255,255,255,0.45)', border:emailFrequency===opt.value?'2px solid transparent':'2px solid rgba(255,255,255,0.09)', boxShadow:emailFrequency===opt.value?'0 4px 14px rgba(34,216,122,0.32)':'none', transform:emailFrequency===opt.value?'translateY(-2px)':'' }}
                  onMouseEnter={e => { if (emailFrequency!==opt.value) e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { if (emailFrequency!==opt.value) e.currentTarget.style.transform=''; }}
                >
                  {emailFrequency===opt.value && <div className="absolute inset-0" style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)', animation:'shimmer-slide 2.5s ease-in-out infinite' }} />}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={isSaving}
            className="relative inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-sm font-bold overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
            style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 10px 28px rgba(34,216,122,0.3)', color:'#0a0e17' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 36px rgba(34,216,122,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 10px 28px rgba(34,216,122,0.3)'; }}
          >
            <div className="absolute inset-0" style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)', animation:'shimmer-slide 2.5s ease-in-out infinite' }} />
            <span className="relative z-10 flex items-center gap-2"><Icon name={isSaving?'Loader2':'Save'} size={16} color="#0a0e17" />{isSaving?'Saving...':'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationControls;