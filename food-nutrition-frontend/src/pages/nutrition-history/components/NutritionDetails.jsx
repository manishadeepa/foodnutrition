import React from 'react';
import Icon from '../../../components/AppIcon';

const NutritionDetails = ({ nutritionData }) => {
  const nutrients = [
    { name: 'Calories',      value: nutritionData?.calories,      unit: 'kcal', dailyValue: Math.round((nutritionData?.calories      / 2000) * 100), icon: 'Flame',   accent: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', bar: '#f87171' },
    { name: 'Protein',       value: nutritionData?.protein,       unit: 'g',    dailyValue: Math.round((nutritionData?.protein        / 50)   * 100), icon: 'Beef',    accent: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)',  bar: '#60a5fa' },
    { name: 'Fat',           value: nutritionData?.fat,           unit: 'g',    dailyValue: Math.round((nutritionData?.fat            / 70)   * 100), icon: 'Droplet', accent: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)',  bar: '#fbbf24' },
    { name: 'Carbohydrates', value: nutritionData?.carbohydrates, unit: 'g',    dailyValue: Math.round((nutritionData?.carbohydrates  / 300)  * 100), icon: 'Wheat',   accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', bar: '#a78bfa' },
    { name: 'Sugar',         value: nutritionData?.sugar,         unit: 'g',    dailyValue: Math.round((nutritionData?.sugar          / 50)   * 100), icon: 'Candy',   accent: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)', bar: '#f472b6' },
    { name: 'Fiber',         value: nutritionData?.fiber,         unit: 'g',    dailyValue: Math.round((nutritionData?.fiber          / 25)   * 100), icon: 'Leaf',    accent: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  bar: '#34d399' },
  ];

  return (
    <div>
      <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
        Complete Nutritional Breakdown
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {nutrients?.map((nutrient, index) => (
          <div key={index} style={{
            background: nutrient.bg,
            border: `1px solid ${nutrient.border}`,
            borderRadius: '12px',
            padding: '0.85rem',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '10px',
                background: `${nutrient.bg}`,
                border: `1px solid ${nutrient.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={nutrient?.icon} size={16} color={nutrient.accent} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', margin: 0, truncate: true }}>{nutrient?.name}</p>
                <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{nutrient?.dailyValue}% Daily Value</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontFamily: 'var(--font-data, monospace)', fontSize: '1.1rem', fontWeight: 700, color: nutrient.accent, margin: 0, lineHeight: 1 }}>
                  {nutrient?.value}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>{nutrient?.unit}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', height: '5px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '99px',
                background: nutrient.bar,
                width: `${Math.min(nutrient?.dailyValue, 100)}%`,
                boxShadow: `0 0 6px ${nutrient.bar}80`,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionDetails;