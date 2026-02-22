import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import DietaryPreferences from './components/DietaryPreferences';
import NotificationControls from './components/NotificationControls';
import ProfileUpdate from './components/ProfileUpdate';
import AccountManagement from './components/AccountManagement';
import DietChatbot from './components/DietChatbot';
import Icon from '../../components/AppIcon';
import StatsBar from './components/StatsBar';

const styles = `
  @keyframes glitter-blink { 0%,100%{opacity:0;transform:scale(0.3);} 50%{opacity:1;transform:scale(1);} }
  @keyframes shimmer-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes fade-down { 0% { opacity:0; transform:translateY(-12px); } 100% { opacity:1; transform:translateY(0); } }
  @keyframes fade-up { 0% { opacity:0; transform:translateY(14px); } 100% { opacity:1; transform:translateY(0); } }
  @keyframes tab-content-in { 0% { opacity:0; transform:translateY(10px) scale(0.99); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes text-gradient-anim { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }

  /* ── Dark navy + teal-green radial glow — matches NutritionHistory ── */
  .settings-bg {
    min-height: 100vh;
    background: #0d1117;
  }

  .settings-heading {
    background: linear-gradient(135deg, #22d87a, #4ade80, #22d87a);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: text-gradient-anim 5s linear infinite;
  }

  .settings-tabs-wrap { background:rgba(255,255,255,0.05); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.09); border-radius:1.25rem; padding:0.35rem; box-shadow:0 4px 20px rgba(0,0,0,0.3); animation:fade-down 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both; }

  .settings-tab { position:relative; display:flex; flex:1; align-items:center; justify-content:center; gap:0.5rem; padding:0.6rem 0.75rem; border-radius:0.875rem; font-size:0.875rem; font-weight:500; border:none; cursor:pointer; background:transparent; color:rgba(255,255,255,0.4); transition:color 0.22s, background 0.22s; white-space:nowrap; flex-shrink:0; min-width:90px; font-family:var(--font-body); }
  .settings-tab:hover:not(.active) { color:#f0f4ff; background:rgba(255,255,255,0.06); }
  .settings-tab.active { color:white; background:var(--tab-gradient, linear-gradient(135deg, #22d87a, #16a34a)); box-shadow:var(--tab-shadow, 0 4px 16px rgba(34,216,122,0.32)); }
  .settings-tab.active::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); animation:shimmer-slide 3s ease-in-out infinite; border-radius:inherit; pointer-events:none; }

  .settings-tab-icon { display:flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:0.4rem; transition:background 0.22s; flex-shrink:0; }
  .settings-tab.active .settings-tab-icon { background:rgba(255,255,255,0.22); }
  .settings-tab:not(.active) .settings-tab-icon { background:rgba(255,255,255,0.06); }
  .settings-tab:hover:not(.active) .settings-tab-icon { background:rgba(34,216,122,0.1); }

  .settings-content { background:rgba(22,27,34,0.8); backdrop-filter:blur(14px); border:1px solid rgba(48,54,61,0.8); border-radius:1.5rem; box-shadow:0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04); padding:2rem 2.25rem; animation:tab-content-in 0.4s cubic-bezier(0.16,1,0.3,1) both; }
  .settings-stats-wrap { animation:fade-up 0.5s cubic-bezier(0.16,1,0.3,1) 0.18s both; }
  .settings-tabs-row { display:flex; gap:0.25rem; overflow-x:auto; scrollbar-width:none; }
  .settings-tabs-row::-webkit-scrollbar { display:none; }
  @media (max-width:640px) { .settings-content { padding:1.25rem 1rem; } }
`;

// ── Glitter / sparkle layer ──────────────────────────────────────────────────
const GLITTER_DOTS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top:      `${(Math.sin(i * 137.5) * 0.5 + 0.5) * 100}%`,
  left:     `${(Math.cos(i * 97.3)  * 0.5 + 0.5) * 100}%`,
  size:     i % 3 === 0 ? 3 : 2,
  duration: `${2.5 + (i % 7) * 0.6}s`,
  delay:    `${(i % 11) * 0.45}s`,
}));

const GlitterLayer = () => (
  <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
    {GLITTER_DOTS.map(d => (
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
);
// ─────────────────────────────────────────────────────────────────────────────

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dietary');
  const [contentKey, setContentKey] = useState(0);

  const tabs = [
    { id:'dietary',       label:'Dietary',      shortLabel:'Dietary',   icon:'Salad',    gradient:'linear-gradient(135deg, #22d87a, #16a34a)',  shadow:'0 4px 18px rgba(34,216,122,0.38)'  },
    { id:'chatbot',       label:'AI Assistant', shortLabel:'Assistant', icon:'Bot',      gradient:'linear-gradient(135deg, #2dd4bf, #0d9488)',  shadow:'0 4px 18px rgba(13,148,136,0.38)'  },
    { id:'notifications', label:'Alerts',       shortLabel:'Alerts',    icon:'Bell',     gradient:'linear-gradient(135deg, #fb923c, #ea580c)',  shadow:'0 4px 18px rgba(234,88,12,0.35)'   },
    { id:'profile',       label:'Profile',      shortLabel:'Profile',   icon:'User',     gradient:'linear-gradient(135deg, #818cf8, #4f46e5)',  shadow:'0 4px 18px rgba(79,70,229,0.35)'   },
    { id:'account',       label:'Account',      shortLabel:'Account',   icon:'Settings', gradient:'linear-gradient(135deg, #f472b6, #db2777)',  shadow:'0 4px 18px rgba(219,39,119,0.35)'  },
  ];

  const handleTabChange = (id) => { setActiveTab(id); setContentKey(k => k + 1); };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dietary':       return <DietaryPreferences />;
      case 'chatbot':       return <DietChatbot />;
      case 'notifications': return <NotificationControls />;
      case 'profile':       return <ProfileUpdate />;
      case 'account':       return <AccountManagement />;
      default:              return <DietaryPreferences />;
    }
  };

  return (
    <>
      <style>{styles}</style>
      <Helmet>
        <title>Settings - FoodNutritionAI</title>
        <meta name="description" content="Manage your account settings, dietary preferences, and notification preferences" />
      </Helmet>
      <Navbar isAuthenticated={true} />

      {/* ── CHANGED: removed maxWidth:1000, now py-8 px-4% equal sides — matches all other pages ── */}
      <div className="settings-bg" style={{ paddingTop: '2rem', paddingBottom: '2rem', paddingLeft: '4%', paddingRight: '4%', position: 'relative' }}>
        <GlitterLayer />
        <div style={{ position:'relative', zIndex:1 }}>

          {/* ── Back Button ── */}
          <button
            onClick={() => navigate('/image-upload')}
            style={{
              position: 'fixed', top: '72px', left: '16px', zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              cursor: 'pointer', padding: 0,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.15)'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <Icon name="ArrowLeft" size={16} color="rgba(255,255,255,0.8)" />
          </button>

          <div className="mb-8" style={{ animation:'fade-down 0.5s cubic-bezier(0.16,1,0.3,1) both' }}>
            <div className="text-center">
              <h1 className="font-heading font-bold settings-heading" style={{ fontSize:'clamp(1.75rem, 4vw, 2.5rem)', marginBottom:'0.4rem' }}>Settings</h1>
              <p style={{ fontSize:'0.9375rem', color:'rgba(255,255,255,0.4)' }}>Manage your account preferences and settings</p>
            </div>
          </div>

          <div className="settings-stats-wrap mb-6"><StatsBar /></div>

          <div className="settings-tabs-wrap mb-5">
            <div className="settings-tabs-row">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`settings-tab${isActive ? ' active' : ''}`} style={isActive ? { '--tab-gradient':tab.gradient, '--tab-shadow':tab.shadow } : {}}>
                    <span className="settings-tab-icon"><Icon name={tab.icon} size={14} color={isActive ? 'white' : 'currentColor'} /></span>
                    <span>{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div key={contentKey} className="settings-content">{renderTabContent()}</div>
        </div>
      </div>
    </>
  );
};

export default Settings;