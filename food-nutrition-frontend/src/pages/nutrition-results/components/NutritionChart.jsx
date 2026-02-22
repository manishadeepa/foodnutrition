import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';

const NutritionChart = ({ nutritionData }) => {
  const [chartType, setChartType] = useState('bar');

  const chartData = [
    { name: 'Protein', value: nutritionData?.protein, color: '#34d399' },
    { name: 'Fat', value: nutritionData?.fat, color: '#f472b6' },
    { name: 'Carbs', value: nutritionData?.carbohydrates, color: '#60a5fa' },
    { name: 'Sugar', value: nutritionData?.sugar, color: '#fbbf24' },
    { name: 'Fiber', value: nutritionData?.fiber, color: '#a78bfa' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div style={{
          background: 'rgba(22,27,34,0.95)',
          border: '1px solid rgba(48,54,61,0.9)',
          borderRadius: '10px',
          padding: '0.6rem 0.9rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <p style={{ color: '#8b949e', fontSize: '0.8rem', margin: '0 0 2px 0' }}>{payload?.[0]?.name}</p>
          <p style={{ color: payload?.[0]?.fill, fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>{payload?.[0]?.value}g</p>
        </div>
      );
    }
    return null;
  };

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
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <h3 style={{ color: '#e6edf3', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            Nutrient Distribution
          </h3>
          <p style={{ color: '#8b949e', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
            Visual breakdown of macronutrients
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['bar', 'pie'].map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: chartType === type ? 'none' : '1px solid rgba(48,54,61,0.9)',
                background: chartType === type
                  ? 'linear-gradient(135deg, #22d87a, #16a34a)'
                  : 'rgba(13,17,23,0.6)',
                color: chartType === type ? 'white' : '#8b949e',
                boxShadow: chartType === type ? '0 4px 12px rgba(34,216,122,0.28)' : 'none',
                transition: 'all 0.2s',
                textTransform: 'capitalize',
              }}
            >
              {type === 'bar' ? '▊ Bar' : '◉ Pie'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '1.25rem 1.5rem' }}>
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(48,54,61,0.6)" />
              <XAxis dataKey="name" stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis stroke="#8b949e" tick={{ fill: '#8b949e', fontSize: 12 }} label={{ value: 'Grams (g)', angle: -90, position: 'insideLeft', fill: '#8b949e', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid rgba(48,54,61,0.8)',
        background: 'rgba(13,17,23,0.4)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.65rem' }}>
          {chartData?.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item?.color, flexShrink: 0 }} />
              <span style={{ color: '#8b949e', fontSize: '0.8rem' }}>{item?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionChart;