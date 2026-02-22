import React from 'react';
import Icon from '../../../components/AppIcon';

const StatsBar = ({ historyData = [] }) => {
  const total = historyData.length;
  const avgCalories = total > 0
    ? Math.round(historyData.reduce((sum, i) => sum + (i.nutritionData?.calories || 0), 0) / total) : 0;
  const avgConfidence = total > 0
    ? Math.round(historyData.reduce((sum, i) => sum + (i.confidence || 0), 0) / total) : 0;
  const today = new Date().toISOString().split('T')[0];
  const todayScans = historyData.filter(i => i.date === today).length;

  const cards = [
    {
      icon: 'Utensils',  iconColor: '#34d399',
      iconBg: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(52,211,153,0.15))',
      cardBg: 'rgba(52,211,153,0.07)',
      border: 'rgba(52,211,153,0.2)', hoverBorder: 'rgba(52,211,153,0.45)',
      glow: 'rgba(52,211,153,0.15)',
      value: stats(total, avgCalories, avgConfidence, todayScans).total, unit: '',
      label: 'Total Analyses',
    },
    {
      icon: 'Flame',     iconColor: '#f87171',
      iconBg: 'linear-gradient(135deg, rgba(248,113,113,0.3), rgba(248,113,113,0.15))',
      cardBg: 'rgba(248,113,113,0.07)',
      border: 'rgba(248,113,113,0.2)', hoverBorder: 'rgba(248,113,113,0.45)',
      glow: 'rgba(248,113,113,0.15)',
      value: stats(total, avgCalories, avgConfidence, todayScans).avgCalories, unit: 'kcal',
      label: 'Avg. Calories',
    },
    {
      icon: 'Target',    iconColor: '#60a5fa',
      iconBg: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(96,165,250,0.15))',
      cardBg: 'rgba(96,165,250,0.07)',
      border: 'rgba(96,165,250,0.2)', hoverBorder: 'rgba(96,165,250,0.45)',
      glow: 'rgba(96,165,250,0.15)',
      value: `${stats(total, avgCalories, avgConfidence, todayScans).avgConfidence}%`, unit: '',
      label: 'Avg. Confidence',
    },
    {
      icon: 'TrendingUp', iconColor: '#fbbf24',
      iconBg: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(251,191,36,0.15))',
      cardBg: 'rgba(251,191,36,0.07)',
      border: 'rgba(251,191,36,0.2)', hoverBorder: 'rgba(251,191,36,0.45)',
      glow: 'rgba(251,191,36,0.15)',
      value: stats(total, avgCalories, avgConfidence, todayScans).todayScans, unit: 'scans',
      label: 'Today',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
      className="nh-stats-bar">
      {cards.map((card, i) => <StatCard key={i} card={card} />)}
    </div>
  );
};

function stats(total, avgCalories, avgConfidence, todayScans) {
  return { total, avgCalories, avgConfidence, todayScans };
}

const StatCard = ({ card }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? `rgba(255,255,255,0.09)` : card.cardBg,
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: `1px solid ${hovered ? card.hoverBorder : card.border}`,
        boxShadow: hovered
          ? `0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px ${card.glow}`
          : `0 2px 12px rgba(0,0,0,0.25)`,
        padding: '1.25rem 1.4rem',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 70, height: 70,
        borderRadius: '0 16px 0 70px',
        background: card.glow,
        opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.22s ease',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 42, height: 42, borderRadius: '12px',
        background: card.iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '0.85rem',
        boxShadow: `0 4px 12px ${card.glow}`,
        position: 'relative', zIndex: 1,
      }}>
        <Icon name={card.icon} size={20} color={card.iconColor} />
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '0.25rem', position: 'relative', zIndex: 1 }}>
        <span style={{ fontFamily: 'var(--font-heading, "Outfit", sans-serif)', fontSize: '1.7rem', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
          {card.value}
        </span>
        {card.unit && (
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#9ca3af', letterSpacing: '0.02em' }}>
            {card.unit}
          </span>
        )}
      </div>

      {/* Label */}
      <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0, position: 'relative', zIndex: 1 }}>
        {card.label}
      </p>
    </div>
  );
};

export default StatsBar;