import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import DeleteConfirmModal from './DeleteConfirmModal';
import NutritionDetails from './NutritionDetails';

const STYLES = `
@keyframes hc-slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hc-expanded-panel { animation: hc-slide-down 0.28s cubic-bezier(0.4,0,0.2,1) both; }
.hc-img-wrap img { transition: transform 0.35s cubic-bezier(0.4,0,0.2,1); }
.hc-img-wrap:hover img { transform: scale(1.06); }
`;
let styleInjected = false;
function injectStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  styleInjected = true;
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getConfidenceMeta = (c) => {
  if (c >= 90) return { color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'High', ring: 'rgba(52,211,153,0.3)' };
  if (c >= 70) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  label: 'Med',  ring: 'rgba(251,191,36,0.3)'  };
  return         { color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'Low',  ring: 'rgba(248,113,113,0.3)'  };
};

const STATS = (nd) => [
  { label: 'Calories', value: nd?.calories,      unit: 'kcal', icon: 'Flame',   accent: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
  { label: 'Protein',  value: nd?.protein,       unit: 'g',    icon: 'Beef',    accent: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)'  },
  { label: 'Carbs',    value: nd?.carbohydrates, unit: 'g',    icon: 'Wheat',   accent: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)'  },
  { label: 'Fat',      value: nd?.fat,           unit: 'g',    icon: 'Droplet', accent: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)'  },
];

const HistoryCard = ({ item, onDelete, onViewDetails }) => {
  injectStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hovered, setHovered] = useState(false);

  const cm = getConfidenceMeta(item?.confidence);
  const stats = STATS(item?.nutritionData);

  const handleDelete = () => { onDelete(item?.id); setShowDeleteModal(false); };

  return (
    <>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? 'rgba(255,255,255,0.09)'
            : 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          borderRadius: '18px',
          border: `1px solid ${hovered ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
          boxShadow: hovered
            ? '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(52,211,153,0.1)'
            : '0 2px 16px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          transition: 'all 0.25s ease',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          position: 'relative',
        }}
      >
        {/* Left accent bar */}
        <div style={{
          position: 'absolute', left: 0, top: '12px', bottom: '12px',
          width: '3px', borderRadius: '0 3px 3px 0',
          background: `linear-gradient(180deg, ${cm.color} 0%, ${cm.color}60 100%)`,
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.25s ease',
        }} />

        <div style={{ padding: '1.4rem 1.6rem 1.4rem 1.9rem' }}>
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Image */}
            <div className="hc-img-wrap" style={{
              flexShrink: 0, width: 88, height: 88,
              borderRadius: '14px', overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
            }}>
              <img src={item?.imageUrl} alt={item?.imageAlt}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>

            {/* Main content */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Row 1 — title + confidence */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.45rem' }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading, "Outfit", sans-serif)',
                  fontSize: '1.05rem', fontWeight: 700,
                  color: '#ffffff', margin: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {item?.foodName}
                </h3>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  background: cm.bg,
                  border: `1px solid ${cm.ring}`,
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: '0.78rem', fontWeight: 700,
                  color: cm.color,
                  flexShrink: 0,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cm.color, display: 'inline-block' }} />
                  {item?.confidence}% {cm.label}
                </span>
              </div>

              {/* Row 2 — date/time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: '#6b7280', fontSize: '0.78rem' }}>
                <Icon name="Calendar" size={12} color="#6b7280" />
                <span>{formatDate(item?.date)}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <Icon name="Clock" size={12} color="#6b7280" />
                <span>{item?.time}</span>
              </div>

              {/* Row 3 — stat pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.1rem' }}>
                {stats.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px',
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: '12px',
                    padding: '0.6rem 0.75rem',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Icon name={s.icon} size={18} color={s.accent} />
                    <div>
                      <p style={{ fontSize: '0.68rem', color: s.accent, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {s.label}
                      </p>
                      <p style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                        {s.value}
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#9ca3af', marginLeft: 2 }}>{s.unit}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 4 — actions */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '0.5rem', flexWrap: 'wrap',
                paddingTop: '0.9rem', marginTop: '0.9rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}>
                {/* Toggle details */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    background: 'transparent',
                    border: '1px solid rgba(52,211,153,0.3)',
                    borderRadius: '8px',
                    padding: '5px 13px',
                    fontSize: '0.8rem', fontWeight: 600,
                    color: '#34d399', cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,211,153,0.1)'; e.currentTarget.style.borderColor = '#34d399'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)'; }}
                >
                  <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={14} color="#34d399" />
                  {isExpanded ? 'Collapse' : 'Details'}
                </button>

                {/* View Full + Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => onViewDetails(item)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'linear-gradient(135deg, #059669, #34d399)',
                      border: 'none', borderRadius: '999px',
                      padding: '6px 16px',
                      fontSize: '0.82rem', fontWeight: 700,
                      color: '#fff', cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(52,211,153,0.25)',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(52,211,153,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(52,211,153,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <Icon name="Eye" size={14} color="#fff" />
                    View Full
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'transparent',
                      border: '1px solid rgba(248,113,113,0.3)',
                      borderRadius: '999px',
                      padding: '6px 16px',
                      fontSize: '0.82rem', fontWeight: 700,
                      color: '#f87171', cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
                  >
                    <Icon name="Trash2" size={14} color="#f87171" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expanded panel */}
          {isExpanded && (
            <div className="hc-expanded-panel" style={{
              marginTop: '1.2rem', paddingTop: '1.2rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
              <NutritionDetails nutritionData={item?.nutritionData} />
            </div>
          )}
        </div>
      </article>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        foodName={item?.foodName}
      />
    </>
  );
};

export default HistoryCard;