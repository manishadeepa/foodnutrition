import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/ui/Navbar';
import ContextualActions from '../../components/ui/ContextualActions';
import ImagePreview from './components/ImagePreview';
import NutritionTable from './components/NutritionTable';
import NutritionChart from './components/NutritionChart';
import ErrorMessage from './components/ErrorMessage';
import ActionButtons from './components/ActionButtons';
import Icon from '../../components/AppIcon';

// ── Glitter / sparkle layer ──────────────────────────────────────────────────
const DOTS = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top:      `${(Math.sin(i * 137.5) * 0.5 + 0.5) * 100}%`,
  left:     `${(Math.cos(i * 97.3)  * 0.5 + 0.5) * 100}%`,
  size:     i % 3 === 0 ? 3 : 2,
  duration: `${2.5 + (i % 7) * 0.6}s`,
  delay:    `${(i % 11) * 0.45}s`,
}));

const glitterCSS = `
  @keyframes glitter-blink {
    0%,100% { opacity:0; transform:scale(0.3); }
    50%      { opacity:1; transform:scale(1);   }
  }
`;

const GlitterLayer = () => (
  <>
    <style>{glitterCSS}</style>
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {DOTS.map(d => (
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
  </>
);
// ─────────────────────────────────────────────────────────────────────────────

// Pure dark navy background
const pageBg = {
  minHeight: '100vh',
  background: '#0d1117',
};

const NutritionResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const mockErrorData = {
    message: "We couldn't identify the food item in your image. This might be due to unclear lighting, unusual angles, or unrecognizable food items.",
    suggestions: [
      "Ensure good lighting conditions when taking the photo",
      "Capture the food from a clear, top-down angle",
      "Make sure the entire food item is visible in the frame",
      "Avoid blurry or out-of-focus images",
      "Try photographing common, recognizable food items"
    ]
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('nutritionAnalysis');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnalysisData({
          imageUrl:    parsed.imagePreview || '',
          imageAlt:    parsed.foodName || 'Food image',
          foodName:    parsed.foodName,
          confidence:  parsed.confidence,
          servingSize: parsed.servingSize,
          healthScore: parsed.healthScore,
          healthLabel: parsed.healthLabel,
          allergens:   parsed.allergens,
          tips:        parsed.tips,
          nutritionData: {
            calories:      parsed.nutrition?.calories      ?? parsed.calories      ?? 0,
            protein:       parsed.nutrition?.protein       ?? parsed.protein       ?? 0,
            fat:           parsed.nutrition?.fat           ?? parsed.fat           ?? 0,
            carbohydrates: parsed.nutrition?.carbohydrates ?? parsed.carbohydrates ?? 0,
            sugar:         parsed.nutrition?.sugar         ?? parsed.sugar         ?? 0,
            fiber:         parsed.nutrition?.fiber         ?? parsed.fiber         ?? 0,
          },
          micros: parsed.micros,
        });
        setHasError(false);
      } catch (err) {
        console.error('Failed to parse analysis data:', err);
        setHasError(true);
      }
    } else {
      navigate('/image-upload');
      return;
    }
    setIsLoading(false);
  }, []);

  const handleSaveResults = async () => {
    if (isSaved || isSaving) return;
    const user = JSON.parse(localStorage.getItem('nutriscan_user') || '{}');
    if (!user?.id) { navigate('/login'); return; }
    setIsSaving(true);
    try {
      const confidenceNum =
        typeof analysisData.confidence === 'number' ? analysisData.confidence
        : analysisData.confidence === 'high' ? 95
        : analysisData.confidence === 'medium' ? 75 : 55;
      const payload = {
        user_id:       user.id,
        food_name:     analysisData.foodName,
        confidence:    confidenceNum,
        calories:      analysisData.nutritionData?.calories      || 0,
        protein:       analysisData.nutritionData?.protein       || 0,
        fat:           analysisData.nutritionData?.fat           || 0,
        carbohydrates: analysisData.nutritionData?.carbohydrates || 0,
        sugar:         analysisData.nutritionData?.sugar         || 0,
        fiber:         analysisData.nutritionData?.fiber         || 0,
        image_preview: analysisData.imageUrl || '',
      };
      const res = await fetch('http://localhost:5000/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        console.log('✅ Saved to history, id:', data.id);
      } else {
        alert('Failed to save results. Please try again.');
      }
    } catch (err) {
      alert('Could not connect to server. Make sure your backend is running.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeAnother = () => {
    sessionStorage.removeItem('nutritionAnalysis');
    setIsLoading(true);
    setAnalysisData(null);
    setHasError(false);
    setIsSaved(false);
    navigate('/image-upload');
  };

  if (isLoading) {
    return (
      <>
        <Navbar isAuthenticated={true} />
        <ContextualActions
          analysisComplete={false}
          imageUploaded={true}
          isProcessing={true}
          onNewAnalysis={handleAnalyzeAnother}
          onAnalyzeAnother={handleAnalyzeAnother}
        />
        <div className="main-content" style={pageBg}>
          <GlitterLayer />
          <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '3px solid rgba(52,211,153,0.15)',
                    borderTop: '3px solid #34d399',
                    animation: 'spin 1s linear infinite',
                  }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="Sparkles" size={28} color="#34d399" />
                  </div>
                </div>
              </div>
              <h2 style={{ color: '#e6edf3', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Analyzing Your Food
              </h2>
              <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
                Our AI is processing your image and calculating nutritional information...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar isAuthenticated={true} />

      <div className="main-content" style={pageBg}>
        <GlitterLayer />

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

        {/* ── CHANGED: removed max-w-7xl, now full width with equal small padding on both sides ── */}
        <div style={{ padding: '1.5rem 4%', position:'relative', zIndex:1 }}>

          {/* ── Page header ── */}
          <div className="mb-6 md:mb-8 text-center">
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              color: '#ffffff',
              margin: '0 0 0.4rem 0',
            }}>
              Analysis{' '}
              <span style={{ color: '#34d399' }}>Results</span>
            </h1>
            <p style={{ color: '#8b949e', fontSize: '0.92rem', margin: '0 0 1.25rem 0' }}>
              {hasError ? 'Unable to complete analysis' : 'AI-powered nutritional breakdown of your food'}
            </p>
            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleAnalyzeAnother}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 1.1rem',
                  background: 'rgba(22,27,34,0.8)',
                  border: '1px solid rgba(48,54,61,0.9)',
                  borderRadius: '10px',
                  color: '#e6edf3',
                  fontSize: '0.875rem', fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.5)'; e.currentTarget.style.background = 'rgba(52,211,153,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(48,54,61,0.9)'; e.currentTarget.style.background = 'rgba(22,27,34,0.8)'; }}
              >
                <Icon name="Camera" size={15} color="#8b949e" />
                Analyze Another Image
              </button>
              <button
                onClick={handleAnalyzeAnother}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.55rem 1.1rem',
                  background: 'linear-gradient(135deg, #22d87a, #16a34a)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(34,216,122,0.28)',
                }}
              >
                <Icon name="Plus" size={15} color="white" />
                New Analysis
              </button>
            </div>
          </div>

          {/* Save status banner */}
          {isSaved && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(34,216,122,0.1)',
              border: '1px solid rgba(34,216,122,0.25)',
              borderRadius: '12px',
              padding: '0.8rem 1.25rem',
              marginBottom: '1.5rem',
            }}>
              <Icon name="CheckCircle" size={18} color="#34d399" />
              <span style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 500, flex: 1 }}>
                Saved to your nutrition history!
              </span>
              <button
                onClick={() => navigate('/nutrition-history')}
                style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                View History →
              </button>
            </div>
          )}

          {hasError ? (
            <ErrorMessage
              message={mockErrorData?.message}
              suggestions={mockErrorData?.suggestions}
            />
          ) : (
            <div className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <ImagePreview
                  imageUrl={analysisData?.imageUrl}
                  imageAlt={analysisData?.imageAlt}
                  foodName={analysisData?.foodName}
                  confidence={analysisData?.confidence}
                />
                <NutritionTable nutritionData={analysisData?.nutritionData} />
              </div>

              <NutritionChart nutritionData={analysisData?.nutritionData} />

              <ActionButtons
                onSaveResults={handleSaveResults}
                onAnalyzeAnother={handleAnalyzeAnother}
                isSaving={isSaving}
                isSaved={isSaved}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NutritionResults;