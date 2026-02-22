import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';

/* ─── Inline CSS ─── */
const styles = `
  @keyframes count-up {
    0%   { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes card-in {
    0%   { opacity: 0; transform: translateY(14px) scale(0.96); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bar-grow {
    0%   { transform: scaleY(0); }
    100% { transform: scaleY(1); }
  }

  /* ── Each stat card ── */
  .sb-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 1.25rem 1.4rem 1.35rem;
    border-radius: 1.25rem;
    overflow: hidden;
    transition: transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s cubic-bezier(0.16,1,0.3,1);
    cursor: default;
  }
  .sb-card:hover {
    transform: translateY(-4px);
  }

  /* Mini bar chart (decorative, top-right) */
  .sb-bars {
    position: absolute;
    top: 1rem;
    right: 1.1rem;
    display: flex;
    align-items: flex-end;
    gap: 3px;
    opacity: 0.35;
  }
  .sb-bar {
    width: 4px;
    border-radius: 99px;
    transform-origin: bottom;
    animation: bar-grow 0.6s cubic-bezier(0.16,1,0.3,1) both;
  }

  /* Number */
  .sb-number {
    font-size: 1.75rem;
    font-weight: 800;
    line-height: 1.1;
    font-family: var(--font-heading);
    margin-top: 0.7rem;
    animation: count-up 0.5s ease both;
  }

  /* Label */
  .sb-label {
    font-size: 0.8125rem;
    font-weight: 500;
    margin-top: 0.22rem;
    opacity: 0.72;
    letter-spacing: 0.01em;
  }

  /* Full-width stats bar grid */
  .sb-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
  @media (max-width: 860px) {
    .sb-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .sb-grid { grid-template-columns: 1fr 1fr; gap: 0.625rem; }
  }
`;

/* Bar heights — decorative mini bar chart */
const barHeights = [8, 13, 10, 16, 12, 18, 14];

function MiniBarChart({ color }) {
  return (
    <div className="sb-bars">
      {barHeights.map((h, i) => (
        <div
          key={i}
          className="sb-bar"
          style={{
            height: h,
            background: color,
            animationDelay: `${0.3 + i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

/* Stat data */
const stats = [
  {
    icon: 'Apple',
    value: '247',
    label: 'Foods Analyzed',
    /* mint green */
    bg:        'linear-gradient(135deg, rgba(209,250,229,0.85), rgba(167,243,208,0.7))',
    border:    'rgba(16,185,129,0.2)',
    iconBg:    'rgba(16,185,129,0.18)',
    iconColor: '#059669',
    numColor:  '#065f46',
    barColor:  '#059669',
    shadow:    '0 8px 24px rgba(5,150,105,0.13)',
    hoverShadow: '0 16px 36px rgba(5,150,105,0.2)',
  },
  {
    icon: 'Flame',
    value: '52,400',
    label: 'Calories Tracked',
    /* warm peach/orange */
    bg:        'linear-gradient(135deg, rgba(254,243,199,0.85), rgba(253,230,138,0.65))',
    border:    'rgba(245,158,11,0.22)',
    iconBg:    'rgba(245,158,11,0.18)',
    iconColor: '#d97706',
    numColor:  '#92400e',
    barColor:  '#f59e0b',
    shadow:    '0 8px 24px rgba(245,158,11,0.13)',
    hoverShadow: '0 16px 36px rgba(245,158,11,0.2)',
  },
  {
    icon: 'Activity',
    value: '92%',
    label: 'Health Score',
    /* sky blue / teal */
    bg:        'linear-gradient(135deg, rgba(204,251,241,0.85), rgba(153,246,228,0.65))',
    border:    'rgba(20,184,166,0.22)',
    iconBg:    'rgba(20,184,166,0.18)',
    iconColor: '#0d9488',
    numColor:  '#134e4a',
    barColor:  '#14b8a6',
    shadow:    '0 8px 24px rgba(20,184,166,0.13)',
    hoverShadow: '0 16px 36px rgba(20,184,166,0.2)',
  },
  {
    icon: 'TrendingUp',
    value: '18',
    label: 'Streak Days',
    /* lavender / purple-pink */
    bg:        'linear-gradient(135deg, rgba(237,233,254,0.85), rgba(221,214,254,0.65))',
    border:    'rgba(139,92,246,0.2)',
    iconBg:    'rgba(139,92,246,0.16)',
    iconColor: '#7c3aed',
    numColor:  '#4c1d95',
    barColor:  '#8b5cf6',
    shadow:    '0 8px 24px rgba(139,92,246,0.13)',
    hoverShadow: '0 16px 36px rgba(139,92,246,0.2)',
  },
];

const StatsBar = () => {
  return (
    <>
      <style>{styles}</style>
      <div className="sb-grid">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="sb-card"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              boxShadow: s.shadow,
              animation: `card-in 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 0.08}s both`,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = s.hoverShadow; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = s.shadow; }}
          >
            {/* Decorative mini bar chart */}
            <MiniBarChart color={s.barColor} />

            {/* Icon */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: s.iconBg,
                flexShrink: 0,
              }}
            >
              <Icon name={s.icon} size={20} color={s.iconColor} />
            </div>

            {/* Number */}
            <p
              className="sb-number"
              style={{
                color: s.numColor,
                animationDelay: `${0.1 + idx * 0.08}s`,
              }}
            >
              {s.value}
            </p>

            {/* Label */}
            <p className="sb-label" style={{ color: s.numColor }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default StatsBar;