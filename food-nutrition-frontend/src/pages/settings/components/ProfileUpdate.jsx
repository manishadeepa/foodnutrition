import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const styles = `
  @keyframes shimmer-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes text-gradient-anim { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
  @keyframes card-in  { 0% { opacity:0; transform:translateY(16px) scale(0.97); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes banner-in { 0% { opacity:0; transform:translateY(-8px); } 100% { opacity:1; transform:translateY(0); } }
  @keyframes online-pulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.35); opacity:0.55; } }

  .pu-gradient-text { background:linear-gradient(135deg, #22d87a, #4ade80); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:text-gradient-anim 4s linear infinite; }
  .pu-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent); animation:shimmer-slide 3s ease-in-out infinite; pointer-events:none; }
  .pu-card { animation:card-in 0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .pu-glow-hover { transition:box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1); }
  .pu-glow-hover:hover { box-shadow:0 0 20px 4px rgba(34,216,122,0.09), 0 18px 42px -10px rgba(34,216,122,0.15); transform:translateY(-2px); }
  .pu-online-dot { animation:online-pulse 2s ease-in-out infinite; }

  .pu-field-label { display:block; font-size:0.7rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:0.5rem; }
  .pu-field-label .pu-required { color:#f87171; margin-left:2px; }

  .pu-input { width:100%; padding:0.85rem 1rem; border-radius:0.625rem; border:1.5px solid rgba(34,216,122,0.2); background:rgba(255,255,255,0.06); font-size:0.875rem; color:#f0f4ff; outline:none; transition:border-color 0.25s, box-shadow 0.25s; font-family:var(--font-body); }
  .pu-input::placeholder { color:rgba(255,255,255,0.25); }
  .pu-input:focus { border-color:#22d87a; box-shadow:0 0 0 4px rgba(34,216,122,0.09); }
  .pu-input:disabled { opacity:0.5; cursor:not-allowed; }
`;

const ProfileUpdate = () => {
  const [profileData, setProfileData] = useState({ fullName:'', email:'', phone:'', dateOfBirth:'', gender:'', height:'', weight:'', goal:'' });
  const [errors, setErrors]               = useState({});
  const [isSaving, setIsSaving]           = useState(false);
  const [isLoading, setIsLoading]         = useState(true);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [saveError, setSaveError]         = useState('');

  const genderOptions = ['Male','Female','Non-binary','Prefer not to say'];
  const goalOptions   = ['Lose weight','Gain weight','Maintain weight','Build muscle','Eat healthier'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('nutriscan_user')||'{}');
    if (!user?.id) { setIsLoading(false); return; }
    setProfileData(prev => ({ ...prev, fullName:user.name||'', email:user.email||'' }));
    fetch(`http://localhost:5000/api/profile/${user.id}`).then(r=>r.json()).then(res => {
      if (res.success && res.data) {
        setProfileData(prev => ({ ...prev, fullName:res.data.full_name||prev.fullName, email:res.data.email||prev.email, phone:res.data.phone||'', dateOfBirth:res.data.date_of_birth?res.data.date_of_birth.split('T')[0]:'', gender:res.data.gender||'', height:res.data.height||'', weight:res.data.weight||'', goal:res.data.goal||'' }));
      }
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setProfileData(prev => ({ ...prev, [name]:value }));
    if (errors?.[name]) setErrors(prev => ({ ...prev, [name]:'' }));
    setProfileSuccess(false); setSaveError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!profileData.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!profileData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) newErrors.email = 'Please enter a valid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validate()) return;
    const user = JSON.parse(localStorage.getItem('nutriscan_user')||'{}');
    if (!user?.id) { setSaveError('Please log in again.'); return; }
    setIsSaving(true); setProfileSuccess(false); setSaveError('');
    try {
      const res = await fetch('http://localhost:5000/api/profile', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ user_id:user.id, full_name:profileData.fullName, email:profileData.email, phone:profileData.phone, date_of_birth:profileData.dateOfBirth, gender:profileData.gender, height:profileData.height, weight:profileData.weight, goal:profileData.goal }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('nutriscan_user', JSON.stringify({ ...user, name:profileData.fullName, email:profileData.email }));
        setProfileSuccess(true); setTimeout(() => setProfileSuccess(false), 3000);
      } else { setSaveError('Failed to save. Please try again.'); }
    } catch { setSaveError('Could not connect to server.'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor:'rgba(34,216,122,0.2)', borderTopColor:'#22d87a' }} />
        <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>Loading profile...</p>
      </div>
    </div>
  );

  /* Dark button selector helper */
  const selectorBtn = (value, selectedValue, label, gradient) => (
    <button type="button" onClick={() => { setProfileData(prev => ({ ...prev, [selectedValue===profileData.gender?'gender':'goal']:value })); setProfileSuccess(false); }} disabled={isSaving}
      className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250"
      style={{ background:value===profileData.gender||value===profileData.goal?gradient:'rgba(255,255,255,0.06)', color:value===profileData.gender||value===profileData.goal?'#0a0e17':'rgba(255,255,255,0.45)', border:value===profileData.gender||value===profileData.goal?'2px solid transparent':'2px solid rgba(255,255,255,0.09)', boxShadow:value===profileData.gender||value===profileData.goal?'0 4px 14px rgba(34,216,122,0.32)':'none', transform:value===profileData.gender||value===profileData.goal?'translateY(-2px)':'' }}
      onMouseEnter={e => { if (value!==profileData.gender&&value!==profileData.goal) { e.currentTarget.style.borderColor='rgba(34,216,122,0.3)'; e.currentTarget.style.transform='translateY(-1px)'; } }}
      onMouseLeave={e => { if (value!==profileData.gender&&value!==profileData.goal) { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.transform=''; } }}
    >{label}</button>
  );

  const cardStyle = { background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', backdropFilter:'blur(10px)' };
  const sectionIconStyle = { background:'rgba(34,216,122,0.1)' };

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex items-center gap-4 pu-card" style={{ animationDelay:'0s' }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0" style={{ background:'linear-gradient(135deg, #14b8a6, #22d87a)', boxShadow:'0 8px 22px rgba(34,216,122,0.32)' }}>
            <Icon name="User" size={26} color="#0a0e17" />
          </div>
          <div>
            <h2 className="text-h3 font-heading mb-0.5 pu-gradient-text">Profile Information</h2>
            <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>Update your personal details</p>
          </div>
        </div>

        {/* Avatar / Identity card */}
        <div className="flex items-center gap-5 rounded-2xl p-5 relative overflow-hidden pu-card pu-glow-hover" style={{ ...cardStyle, animationDelay:'0.07s' }}>
          <div className="absolute top-0 right-0 w-36 h-36 rounded-full pointer-events-none" style={{ background:'radial-gradient(circle, rgba(34,216,122,0.08), transparent 70%)', transform:'translate(30%,-30%)' }} />
          <div className="relative flex-shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 8px 22px rgba(34,216,122,0.32)' }}>
              <Icon name="User" size={34} color="#0a0e17" />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full ring-2" style={{ background:'#22d87a', ringColor:'rgba(10,14,23,1)' }}>
              <div className="h-2.5 w-2.5 rounded-full bg-white pu-online-dot" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-0.5">
              <p className="text-lg font-bold" style={{ color:'#f0f4ff' }}>{profileData.fullName||'Your Name'}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ background:'linear-gradient(135deg, #f97316, #ea580c)' }}>🏆 PRO</span>
            </div>
            <p className="text-sm mb-1.5" style={{ color:'rgba(255,255,255,0.4)' }}>{profileData.email||'your@email.com'}</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} style={{ color:'#f5c842', fontSize:'0.85rem' }}>★</span>)}</div>
              <span className="text-xs font-semibold" style={{ color:'rgba(255,255,255,0.35)' }}>Health Score: 92</span>
            </div>
            {profileData.goal && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background:'rgba(34,216,122,0.1)', color:'#22d87a' }}>
                <Icon name="Target" size={10} color="#22d87a" />{profileData.goal}
              </span>
            )}
          </div>
        </div>

        {/* Banners */}
        {profileSuccess && (
          <div className="flex items-center gap-3 rounded-xl p-4 relative overflow-hidden pu-shimmer" style={{ background:'rgba(34,216,122,0.08)', border:'1px solid rgba(34,216,122,0.25)', animation:'banner-in 0.35s ease both' }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)' }}><Icon name="CheckCircle" size={16} color="#0a0e17" /></div>
            <p className="text-sm font-semibold" style={{ color:'#22d87a' }}>Profile updated successfully!</p>
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-3 rounded-xl p-4" style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.2)', animation:'banner-in 0.35s ease both' }}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background:'rgba(239,68,68,0.15)' }}><Icon name="AlertCircle" size={16} color="#f87171" /></div>
            <p className="text-sm font-medium" style={{ color:'#f87171' }}>{saveError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Information */}
          <div className="rounded-2xl p-6 space-y-5 pu-card pu-glow-hover" style={{ ...cardStyle, animationDelay:'0.12s' }}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={sectionIconStyle}><Icon name="User" size={14} color="#22d87a" /></div>
              <h3 className="text-sm font-bold" style={{ color:'#f0f4ff' }}>Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="pu-field-label">Full Name <span className="pu-required">*</span></label>
                <input type="text" name="fullName" placeholder="Enter your full name" value={profileData.fullName} onChange={handleChange} disabled={isSaving} className="pu-input" />
                {errors.fullName && <p className="text-xs mt-1" style={{ color:'#f87171' }}>{errors.fullName}</p>}
              </div>
              <div>
                <label className="pu-field-label">Email Address <span className="pu-required">*</span></label>
                <input type="email" name="email" placeholder="Enter your email" value={profileData.email} onChange={handleChange} disabled={isSaving} className="pu-input" />
                {errors.email && <p className="text-xs mt-1" style={{ color:'#f87171' }}>{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="pu-field-label">Phone Number</label>
                <input type="tel" name="phone" placeholder="Enter your phone" value={profileData.phone} onChange={handleChange} disabled={isSaving} className="pu-input" />
              </div>
              <div>
                <label className="pu-field-label">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleChange} disabled={isSaving} className="pu-input" />
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="rounded-2xl p-6 pu-card pu-glow-hover" style={{ ...cardStyle, animationDelay:'0.18s' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={sectionIconStyle}><Icon name="Heart" size={14} color="#22d87a" /></div>
              <h3 className="text-sm font-bold" style={{ color:'#f0f4ff' }}>Gender</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {genderOptions.map(g => (
                <button key={g} type="button" onClick={() => { setProfileData(prev => ({ ...prev, gender:g })); setProfileSuccess(false); }} disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250"
                  style={{ background:profileData.gender===g?'linear-gradient(135deg, #22d87a, #16a34a)':'rgba(255,255,255,0.06)', color:profileData.gender===g?'#0a0e17':'rgba(255,255,255,0.45)', border:profileData.gender===g?'2px solid transparent':'2px solid rgba(255,255,255,0.09)', boxShadow:profileData.gender===g?'0 4px 14px rgba(34,216,122,0.32)':'none', transform:profileData.gender===g?'translateY(-2px)':'' }}
                  onMouseEnter={e => { if (profileData.gender!==g) { e.currentTarget.style.borderColor='rgba(34,216,122,0.3)'; e.currentTarget.style.transform='translateY(-1px)'; } }}
                  onMouseLeave={e => { if (profileData.gender!==g) { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.transform=''; } }}
                >{g}</button>
              ))}
            </div>
          </div>

          {/* Body Metrics */}
          <div className="rounded-2xl p-6 space-y-5 pu-card pu-glow-hover" style={{ ...cardStyle, animationDelay:'0.24s' }}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={sectionIconStyle}><Icon name="Ruler" size={14} color="#22d87a" /></div>
              <h3 className="text-sm font-bold" style={{ color:'#f0f4ff' }}>Body Metrics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="pu-field-label">Height (cm)</label>
                <input type="number" name="height" placeholder="e.g. 170" value={profileData.height} onChange={handleChange} disabled={isSaving} className="pu-input" />
              </div>
              <div>
                <label className="pu-field-label">Weight (kg)</label>
                <input type="number" name="weight" placeholder="e.g. 65" value={profileData.weight} onChange={handleChange} disabled={isSaving} className="pu-input" />
              </div>
            </div>
          </div>

          {/* Health Goal */}
          <div className="rounded-2xl p-6 pu-card pu-glow-hover" style={{ ...cardStyle, animationDelay:'0.30s' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={sectionIconStyle}><Icon name="Target" size={14} color="#22d87a" /></div>
              <h3 className="text-sm font-bold" style={{ color:'#f0f4ff' }}>Health Goal</h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {goalOptions.map(g => (
                <button key={g} type="button" onClick={() => { setProfileData(prev => ({ ...prev, goal:g })); setProfileSuccess(false); }} disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-250"
                  style={{ background:profileData.goal===g?'linear-gradient(135deg, #22d87a, #16a34a)':'rgba(255,255,255,0.06)', color:profileData.goal===g?'#0a0e17':'rgba(255,255,255,0.45)', border:profileData.goal===g?'2px solid transparent':'2px solid rgba(255,255,255,0.09)', boxShadow:profileData.goal===g?'0 4px 14px rgba(34,216,122,0.32)':'none', transform:profileData.goal===g?'translateY(-2px)':'' }}
                  onMouseEnter={e => { if (profileData.goal!==g) { e.currentTarget.style.borderColor='rgba(34,216,122,0.3)'; e.currentTarget.style.transform='translateY(-1px)'; } }}
                  onMouseLeave={e => { if (profileData.goal!==g) { e.currentTarget.style.borderColor='rgba(255,255,255,0.09)'; e.currentTarget.style.transform=''; } }}
                >{g}</button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSaving}
              className="relative inline-flex items-center gap-2.5 rounded-xl px-8 py-4 text-sm font-bold overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
              style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 10px 28px rgba(34,216,122,0.32)', color:'#0a0e17' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 36px rgba(34,216,122,0.42)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 10px 28px rgba(34,216,122,0.32)'; }}
            >
              <div className="absolute inset-0" style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)', animation:'shimmer-slide 2.5s ease-in-out infinite' }} />
              <span className="relative z-10 flex items-center gap-2"><Icon name={isSaving?'Loader2':'Save'} size={16} color="#0a0e17" />{isSaving?'Saving...':'Update Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfileUpdate;