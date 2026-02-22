import React from 'react';
import Icon from '../../../components/AppIcon';

const NutritionTable = ({ nutritionData }) => {
  const nutrients = [
    {
      name: 'Calories',
      value: nutritionData?.calories,
      unit: 'kcal',
      dailyValue: Math.round((nutritionData?.calories / 2000) * 100),
      icon: 'Flame',
      color: '#a78bfa',
    },
    {
      name: 'Protein',
      value: nutritionData?.protein,
      unit: 'g',
      dailyValue: Math.round((nutritionData?.protein / 50) * 100),
      icon: 'Beef',
      color: '#34d399',
    },
    {
      name: 'Fat',
      value: nutritionData?.fat,
      unit: 'g',
      dailyValue: Math.round((nutritionData?.fat / 70) * 100),
      icon: 'Droplet',
      color: '#f472b6',
    },
    {
      name: 'Carbohydrates',
      value: nutritionData?.carbohydrates,
      unit: 'g',
      dailyValue: Math.round((nutritionData?.carbohydrates / 300) * 100),
      icon: 'Wheat',
      color: '#60a5fa',
    },
    {
      name: 'Sugar',
      value: nutritionData?.sugar,
      unit: 'g',
      dailyValue: Math.round((nutritionData?.sugar / 50) * 100),
      icon: 'Candy',
      color: '#fbbf24',
    },
    {
      name: 'Fiber',
      value: nutritionData?.fiber,
      unit: 'g',
      dailyValue: Math.round((nutritionData?.fiber / 25) * 100),
      icon: 'Leaf',
      color: '#a78bfa',
    },
  ];

  return (
    <div style={{
      background: 'rgba(22,27,34,0.8)',
      backdropFilter: 'blur(16px)',
      borderRadius: '16px',
      border: '1px solid rgba(48,54,61,0.8)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid rgba(48,54,61,0.8)',
      }}>
        <h3 style={{ color: '#e6edf3', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
          Nutritional Information
        </h3>
        <p style={{ color: '#8b949e', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
          Per serving analysis
        </p>
      </div>

      {/* Nutrient rows */}
      <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '0.6rem' }}>
        {nutrients?.map((nutrient, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(13,17,23,0.5)',
              border: '1px solid rgba(48,54,61,0.7)',
              borderRadius: '12px',
              padding: '0.8rem 1rem',
              transition: 'border-color 0.2s, background 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${nutrient.color}55`;
              e.currentTarget.style.background = `${nutrient.color}0d`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(48,54,61,0.7)';
              e.currentTarget.style.background = 'rgba(13,17,23,0.5)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '10px',
                  background: `${nutrient.color}18`,
                  border: `1px solid ${nutrient.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name={nutrient.icon} size={18} color={nutrient.color} />
                </div>
                <div>
                  <p style={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                    {nutrient.name}
                  </p>
                  <p style={{ color: '#8b949e', fontSize: '0.7rem', margin: 0 }}>
                    {nutrient.dailyValue}% Daily Value
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ color: nutrient.color, fontWeight: 800, fontSize: '1.5rem', margin: 0, lineHeight: 1 }}>
                  {nutrient.value}
                </p>
                <p style={{ color: '#8b949e', fontSize: '0.7rem', margin: 0 }}>{nutrient.unit}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              marginTop: '0.6rem',
              width: '100%',
              background: 'rgba(48,54,61,0.6)',
              borderRadius: '999px',
              height: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(nutrient.dailyValue, 100)}%`,
                height: '100%',
                borderRadius: '999px',
                background: nutrient.color,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '0.9rem 1.5rem',
        borderTop: '1px solid rgba(48,54,61,0.8)',
        background: 'rgba(13,17,23,0.4)',
        display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
      }}>
        <Icon name="Info" size={13} color="#8b949e" />
        <p style={{ color: '#8b949e', fontSize: '0.7rem', margin: 0, lineHeight: 1.5 }}>
          Daily values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
        </p>
      </div>
    </div>
  );
};

export default NutritionTable;