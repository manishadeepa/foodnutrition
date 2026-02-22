import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import DeleteAccountModal from './DeleteAccountModal';

const styles = `
  @keyframes shimmer-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes glow-pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.9; } }
  @keyframes danger-wobble { 0%,100% { transform:rotate(0deg); } 25% { transform:rotate(-4deg); } 75% { transform:rotate(4deg); } }
  .acct-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent); animation:shimmer-slide 3s ease-in-out infinite; pointer-events:none; }
  .acct-glow-hover { transition:box-shadow 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1); }
  .acct-glow-hover:hover { box-shadow:0 0 20px 4px rgba(34,216,122,0.09), 0 20px 50px -12px rgba(34,216,122,0.16); transform:translateY(-3px); }
  .acct-danger-wobble { animation:danger-wobble 3s ease-in-out infinite; }
`;

const AccountManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDataExport = () => {
    setIsExporting(true); setExportSuccess(false);
    setTimeout(() => {
      const mockData = { profile:{ name:'John Doe', email:'user@foodnutrition.ai', joinDate:'2026-01-15' }, dietaryPreferences:{ vegetarian:false, vegan:false, glutenFree:true }, analysisHistory:[{ date:'2026-02-08', foodItem:'Grilled Chicken Salad', calories:350 },{ date:'2026-02-07', foodItem:'Salmon with Vegetables', calories:420 }] };
      const dataStr  = JSON.stringify(mockData, null, 2);
      const dataBlob = new Blob([dataStr], { type:'application/json' });
      const url  = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url; link.download = `foodnutrition-data-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      document.body?.appendChild(link); link?.click(); document.body?.removeChild(link); URL.revokeObjectURL(url);
      setIsExporting(false); setExportSuccess(true); setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 8px 20px rgba(34,216,122,0.28)' }}>
            <Icon name="Lock" size={22} color="#0a0e17" />
          </div>
          <div>
            <h2 className="text-h3 font-heading mb-0.5" style={{ background:'linear-gradient(135deg, #22d87a, #4ade80)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Account Management</h2>
            <p className="text-sm" style={{ color:'rgba(255,255,255,0.4)' }}>Manage your account data and security</p>
          </div>
        </div>

        {/* Export Data */}
        <div className="rounded-2xl overflow-hidden acct-glow-hover" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)' }}>
          <div className="flex items-center gap-3 px-5 py-4 relative overflow-hidden acct-shimmer" style={{ background:'linear-gradient(135deg, #16a34a, #22d87a)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background:'rgba(10,14,23,0.25)', backdropFilter:'blur(4px)' }}>
              <Icon name="Download" size={20} color="white" />
            </div>
            <h3 className="text-base font-bold text-white">Export Your Data</h3>
          </div>
          <div className="p-5">
            <p className="text-sm mb-4" style={{ color:'rgba(255,255,255,0.4)' }}>Download a copy of your personal data including profile, dietary preferences, and nutrition analysis history.</p>
            {exportSuccess && (
              <div className="mb-4 flex items-center gap-3 rounded-xl p-3 relative overflow-hidden" style={{ background:'rgba(34,216,122,0.08)', border:'1px solid rgba(34,216,122,0.25)' }}>
                <div className="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)' }}>
                  <Icon name="CheckCircle" size={14} color="#0a0e17" />
                </div>
                <p className="text-sm font-semibold" style={{ color:'#22d87a' }}>Data exported successfully!</p>
              </div>
            )}
            <button onClick={handleDataExport} disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 disabled:opacity-60"
              style={{ border:'2px solid rgba(34,216,122,0.25)', background:'rgba(34,216,122,0.06)', color:'#f0f4ff' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(34,216,122,0.12)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(34,216,122,0.06)'; e.currentTarget.style.transform=''; }}
            >
              <Icon name={isExporting?'Loader2':'Download'} size={16} color="#22d87a" />
              {isExporting?'Exporting...':'Export Data'}
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="rounded-2xl overflow-hidden acct-glow-hover" style={{ background:'rgba(255,255,255,0.05)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)' }}>
          <div className="flex items-center gap-3 px-5 py-4 relative overflow-hidden acct-shimmer" style={{ background:'linear-gradient(135deg, #16a34a, #22d87a)' }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0" style={{ background:'rgba(10,14,23,0.25)', backdropFilter:'blur(4px)' }}>
              <Icon name="Shield" size={20} color="white" />
            </div>
            <h3 className="text-base font-bold text-white">Privacy &amp; Security</h3>
          </div>
          <div className="p-5">
            <p className="text-sm mb-5" style={{ color:'rgba(255,255,255,0.4)' }}>Your data is encrypted and stored securely. We never share personal information with third parties.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { icon:'Shield', label:'End-to-end encryption',    from:'#22d87a', to:'#16a34a' },
                { icon:'Key',    label:'Two-factor auth available', from:'#14b8a6', to:'#22d87a' },
                { icon:'Lock',   label:'GDPR compliant',           from:'#22d87a', to:'#16a34a' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-4" style={{ background:'rgba(34,216,122,0.05)', border:'1px solid rgba(34,216,122,0.12)' }}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0" style={{ background:`linear-gradient(135deg, ${item.from}, ${item.to})` }}>
                    <Icon name={item.icon} size={14} color="#0a0e17" />
                  </div>
                  <span className="text-xs font-semibold" style={{ color:'#f0f4ff' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl overflow-hidden" style={{ border:'2px solid rgba(220,38,38,0.22)', background:'rgba(220,38,38,0.03)' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor:'rgba(220,38,38,0.12)', background:'rgba(220,38,38,0.05)' }}>
            <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color:'#f87171' }}>
              <span className="acct-danger-wobble inline-flex"><Icon name="AlertTriangle" size={13} color="#f87171" /></span>
              Danger Zone
            </p>
          </div>
          <div className="p-5 flex items-start gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl acct-danger-wobble" style={{ background:'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow:'0 8px 20px rgba(220,38,38,0.28)' }}>
              <Icon name="AlertTriangle" size={26} color="white" />
            </div>
            <div>
              <h3 className="text-h5 font-heading mb-1" style={{ color:'#f87171' }}>Delete Account</h3>
              <p className="text-sm mb-4" style={{ color:'rgba(255,255,255,0.4)' }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white relative overflow-hidden transition-all duration-300"
                style={{ background:'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow:'0 6px 18px rgba(220,38,38,0.28)' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 28px rgba(220,38,38,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 6px 18px rgba(220,38,38,0.28)'; }}
              >
                <div className="absolute inset-0" style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)', animation:'shimmer-slide 3s ease-in-out infinite' }} />
                <span className="relative z-10 flex items-center gap-2"><Icon name="Trash2" size={16} color="white" />Delete Account</span>
              </button>
            </div>
          </div>
        </div>

        {showDeleteModal && <DeleteAccountModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} />}
      </div>
    </>
  );
};

export default AccountManagement;