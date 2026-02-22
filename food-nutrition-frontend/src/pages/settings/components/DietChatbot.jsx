import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const styles = `
  @keyframes shimmer-slide { 0% { transform:translateX(-100%); } 100% { transform:translateX(100%); } }
  @keyframes text-gradient-anim { 0% { background-position:0% 50%; } 50% { background-position:100% 50%; } 100% { background-position:0% 50%; } }
  @keyframes float-bot { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
  @keyframes online-pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.45; transform:scale(1.35); } }
  @keyframes msg-in { 0% { opacity:0; transform:translateY(14px) scale(0.96); } 100% { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes bounce-dot { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-7px) scale(1.15); } }
  @keyframes pill-pop { 0% { opacity:0; transform:scale(0.75) translateY(6px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes chat-in { 0% { opacity:0; transform:translateY(18px) scale(0.97); } 100% { opacity:1; transform:translateY(0) scale(1); } }

  .dc-gradient-text { background:linear-gradient(135deg, #22d87a, #4ade80); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:text-gradient-anim 4s linear infinite; }
  .dc-shimmer::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent); animation:shimmer-slide 3s ease-in-out infinite; pointer-events:none; }
  .dc-float-bot  { animation:float-bot    3s ease-in-out infinite; }
  .dc-online-dot { animation:online-pulse 1.5s ease-in-out infinite; }
  .dc-chat-in    { animation:chat-in      0.5s cubic-bezier(0.16,1,0.3,1) both; }
  .dc-custom-scroll::-webkit-scrollbar { width:5px; }
  .dc-custom-scroll::-webkit-scrollbar-track { background:transparent; }
  .dc-custom-scroll::-webkit-scrollbar-thumb { background:rgba(34,216,122,0.22); border-radius:999px; }
  .dc-custom-scroll::-webkit-scrollbar-thumb:hover { background:rgba(34,216,122,0.4); }
`;

const FormattedMessage = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-sm leading-relaxed">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) return <strong key={j}>{part.slice(2,-2)}</strong>;
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text.replace(/\*\*/g,'')).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-1 rounded-md transition-all duration-200"
      style={{ color:copied?'#22d87a':'rgba(255,255,255,0.35)', background:copied?'rgba(34,216,122,0.08)':'transparent' }}
      onMouseEnter={e => { if (!copied) { e.currentTarget.style.color='rgba(255,255,255,0.7)'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; } }}
      onMouseLeave={e => { if (!copied) { e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.background='transparent'; } }}
    >
      <Icon name={copied?'Check':'Copy'} size={12} /><span>{copied?'Copied!':'Copy'}</span>
    </button>
  );
};

const DietChatbot = ({ foodName, nutritionData }) => {
  const [messages, setMessages] = useState([{
    role:'assistant',
    text: foodName
      ? `Hi! I'm your personal diet assistant 🥗 I've analyzed **${foodName}** for you. Ask me anything about this food and your dietary preferences!`
      : `Hi! I'm your personal diet assistant 🥗 Ask me anything about nutrition, diet plans, or upload a food image for personalized advice!`
  }]);
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64]   = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  const suggestions = ['Suggest me a diet plan','What foods should I avoid?','How can I get more protein?','Is my diet balanced?'];
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImagePreview(reader.result); setImageBase64(reader.result.split(',')[1]); };
    reader.readAsDataURL(file); e.target.value = '';
  };
  const removeImage = () => { setImagePreview(null); setImageBase64(null); };

  const sendMessage = async (text) => {
    if ((!text.trim() && !imageBase64) || isTyping) return;
    const userMsg = { role:'user', text:text||'📷 Analyzing this image...', image:imagePreview||null };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const sentImage = imageBase64; setImagePreview(null); setImageBase64(null); setIsTyping(true);
    try {
      const savedPrefs = JSON.parse(localStorage.getItem('nutriscan_preferences')||'{}');
      const activePrefs = savedPrefs.preferences ? Object.entries(savedPrefs.preferences).filter(([_,v])=>v).map(([k])=>k) : [];
      const res = await fetch('http://localhost:5000/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message:text||'Please analyze this food image and tell me if it fits my diet.', foodName:foodName||null, nutritionData:nutritionData||null, dietaryPreferences:activePrefs, customRestrictions:savedPrefs.custom_restrictions||'', imageBase64:sentImage||null }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role:'assistant', text:data.reply||'Sorry, I could not process that.' }]);
    } catch { setMessages(prev => [...prev, { role:'assistant', text:'Could not connect to server. Please make sure your backend is running.' }]); }
    finally { setIsTyping(false); }
  };

  const handleKeyDown = (e) => { if (e.key==='Enter'&&!e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  return (
    <>
      <style>{styles}</style>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl flex-shrink-0 dc-float-bot" style={{ background:'linear-gradient(135deg, #14b8a6, #22d87a)', boxShadow:'0 8px 20px rgba(34,216,122,0.28)' }}>
            <Icon name="Sparkles" size={22} color="#0a0e17" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight dc-gradient-text">Diet AI Assistant</h2>
            <p className="text-sm mt-0.5" style={{ color:'rgba(255,255,255,0.4)' }}>Personalized nutrition advice powered by AI</p>
          </div>
        </div>

        {/* Chat container */}
        <div className="rounded-2xl overflow-hidden dc-chat-in" style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.09)', boxShadow:'0 8px 36px rgba(0,0,0,0.3)' }}>

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 relative overflow-hidden dc-shimmer" style={{ background:'linear-gradient(135deg, #16a34a, #22d87a)' }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0" style={{ background:'rgba(10,14,23,0.25)', backdropFilter:'blur(4px)' }}>
              <Icon name="Bot" size={20} color="white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">NutriBot</p>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.7)' }}>Personalized to your dietary preferences</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background:'rgba(10,14,23,0.25)', backdropFilter:'blur(4px)' }}>
              <div className="h-2 w-2 rounded-full dc-online-dot" style={{ background:'#4ade80' }} />
              <span className="text-xs text-white font-semibold">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-5 space-y-5 dc-custom-scroll" style={{ background:'rgba(0,0,0,0.15)' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role==='user'?'justify-end':'justify-start'}`} style={{ animation:`msg-in 0.4s cubic-bezier(0.16,1,0.3,1) ${Math.min(i*0.05,0.3)}s both` }}>
                {msg.role==='assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mr-2.5 mt-1" style={{ background:'rgba(34,216,122,0.1)' }}>
                    <Icon name="Bot" size={14} color="#22d87a" />
                  </div>
                )}
                <div className="max-w-[85%]">
                  <div className="px-4 py-3 text-sm"
                    style={msg.role==='user' ? {
                      borderRadius:'1rem 1rem 0.25rem 1rem',
                      background:'linear-gradient(135deg, #22d87a, #16a34a)',
                      color:'#0a0e17',
                      boxShadow:'0 4px 14px rgba(34,216,122,0.28)',
                    } : {
                      borderRadius:'1rem 1rem 1rem 0.25rem',
                      background:'rgba(255,255,255,0.07)',
                      border:'1px solid rgba(255,255,255,0.09)',
                      color:'#f0f4ff',
                      backdropFilter:'blur(8px)',
                    }}
                  >
                    {msg.image && <img src={msg.image} alt="uploaded" className="w-48 h-36 object-cover rounded-lg mb-2" />}
                    {msg.role==='assistant' ? <FormattedMessage text={msg.text} /> : <p className="text-sm">{msg.text}</p>}
                  </div>
                  {msg.role==='assistant' && <CopyButton text={msg.text} />}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start" style={{ animation:'msg-in 0.35s ease both' }}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mr-2.5" style={{ background:'rgba(34,216,122,0.1)' }}>
                  <Icon name="Bot" size={14} color="#22d87a" />
                </div>
                <div className="px-5 py-4 rounded-2xl flex gap-2 items-center" style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.09)' }}>
                  {[0,1,2].map(dot => (
                    <div key={dot} className="h-2.5 w-2.5 rounded-full" style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', animation:`bounce-dot 0.8s ease-in-out ${dot*0.15}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion pills */}
          {messages.length <= 1 && (
            <div className="px-5 py-3 flex flex-wrap gap-2 border-t" style={{ borderColor:'rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)' }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} className="text-xs px-4 py-2 rounded-full font-semibold transition-all duration-200"
                  style={{ background:'rgba(34,216,122,0.07)', border:'1px solid rgba(34,216,122,0.22)', color:'#22d87a', animation:`pill-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${0.1+i*0.07}s both` }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(34,216,122,0.14)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(34,216,122,0.07)'; e.currentTarget.style.transform=''; }}
                >
                  <Icon name="Zap" size={11} color="#22d87a" style={{ display:'inline', marginRight:4 }} />{s}
                </button>
              ))}
            </div>
          )}

          {/* Image preview */}
          {imagePreview && (
            <div className="px-5 py-3 flex items-center gap-3 border-t" style={{ borderColor:'rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.04)' }}>
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="w-14 h-14 object-cover rounded-lg border" style={{ borderColor:'rgba(34,216,122,0.2)' }} />
                <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-110" style={{ background:'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                  <Icon name="X" size={10} color="white" />
                </button>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color:'#f0f4ff' }}>Image ready to send</p>
                <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.35)' }}>Press send to analyze</p>
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-t" style={{ borderColor:'rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.04)', backdropFilter:'blur(8px)' }}>
            {[{ ref:fileInputRef, icon:'Image', title:'Upload image', capture:undefined }, { ref:cameraInputRef, icon:'Camera', title:'Take photo', capture:'environment' }].map((btn, i) => (
              <button key={i} onClick={() => btn.ref.current?.click()} title={btn.title}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200"
                style={{ borderColor:'rgba(34,216,122,0.2)', color:'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(34,216,122,0.07)'; e.currentTarget.style.borderColor='rgba(34,216,122,0.4)'; e.currentTarget.style.color='#22d87a'; }}
                onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(34,216,122,0.2)'; e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}
              >
                <Icon name={btn.icon} size={16} />
              </button>
            ))}
            <input ref={fileInputRef}   type="file" accept="image/*"                      className="hidden" onChange={handleImageSelect} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />

            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about your diet..." disabled={isTyping}
              className="flex-1 text-sm px-4 py-3 rounded-xl placeholder:opacity-30 focus:outline-none disabled:opacity-50 transition-all duration-300"
              style={{ border:'1.5px solid rgba(34,216,122,0.18)', background:'rgba(255,255,255,0.06)', color:'#f0f4ff' }}
              onFocus={e => { e.currentTarget.style.borderColor='#22d87a'; e.currentTarget.style.boxShadow='0 0 0 4px rgba(34,216,122,0.09)'; }}
              onBlur={e  => { e.currentTarget.style.borderColor='rgba(34,216,122,0.18)'; e.currentTarget.style.boxShadow='none'; }}
            />

            <button onClick={() => sendMessage(input)} disabled={(!input.trim()&&!imageBase64)||isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background:'linear-gradient(135deg, #22d87a, #16a34a)', boxShadow:'0 4px 14px rgba(34,216,122,0.32)' }}
              onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 20px rgba(34,216,122,0.4)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 14px rgba(34,216,122,0.32)'; }}
            >
              <Icon name="Send" size={16} color="#0a0e17" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DietChatbot;