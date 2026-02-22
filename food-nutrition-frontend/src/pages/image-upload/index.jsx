import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Camera, Target, Zap } from 'lucide-react';
import Navbar from '../../components/ui/Navbar';
import ContextualActions from '../../components/ui/ContextualActions';
import ImageUploader from './components/ImageUploader';
import LoadingOverlay from './components/LoadingOverlay';
import AnalysisButton from './components/AnalysisButton';
import ErrorMessage from './components/ErrorMessage';
import Icon from '../../components/AppIcon';

/* ═══════════════════════════════════════════
   GLITTER / SPARKLE LAYER
═══════════════════════════════════════════ */
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
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
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

/* ═══════════════════════════════════════════
   IMAGE UPLOAD PAGE
═══════════════════════════════════════════ */
const ImageUpload = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // --- LOGIC REMAINS UNTOUCHED ---
  const handleImageSelect = (imageData) => {
    setSelectedImage(imageData);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    setIsProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('nutriscan_token');
      if (!token) {
        setError('You must be logged in to analyze food.');
        setIsProcessing(false);
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('image', selectedImage.file);

      const savedPrefs = JSON.parse(localStorage.getItem('nutriscan_preferences') || '{}');
      if (savedPrefs.preferences) {
        formData.append('preferences', JSON.stringify(savedPrefs.preferences));
        formData.append('custom_restrictions', savedPrefs.custom_restrictions || '');
      }

      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || json.error) throw new Error(json.error || 'Failed to analyze image.');

      const analysisResult = {
        foodName:    json.data.foodName,
        confidence:  json.data.confidence === 'high' ? 95 : json.data.confidence === 'medium' ? 75 : 55,
        servingSize: json.data.servingSize,
        healthScore: json.data.healthScore,
        healthLabel: json.data.healthLabel,
        allergens:   json.data.allergens,
        tips:        json.data.tips,
        nutrition: {
          calories:      json.data.calories,
          protein:       json.data.macros.protein.amount,
          fat:           json.data.macros.fat.amount,
          carbohydrates: json.data.macros.carbohydrates.amount,
          sugar:         json.data.macros.sugar.amount,
          fiber:         json.data.macros.fiber.amount,
        },
        micros: {
          sodium:    json.data.micros.sodium,
          calcium:   json.data.micros.calcium,
          iron:      json.data.micros.iron,
          vitaminC:  json.data.micros.vitaminC,
          potassium: json.data.micros.potassium,
        },
        imagePreview: selectedImage?.preview,
      };

      sessionStorage.setItem('nutritionAnalysis', JSON.stringify(analysisResult));
      navigate('/nutrition-results');

      const user = JSON.parse(localStorage.getItem('nutriscan_user') || '{}');
      if (user?.id) {
        fetch('http://localhost:5000/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id:       user.id,
            food_name:     analysisResult.foodName,
            confidence:    analysisResult.confidence,
            calories:      analysisResult.nutrition?.calories,
            protein:       analysisResult.nutrition?.protein,
            fat:           analysisResult.nutrition?.fat,
            carbohydrates: analysisResult.nutrition?.carbohydrates,
            sugar:         analysisResult.nutrition?.sugar,
            fiber:         analysisResult.nutrition?.fiber,
            image_preview: analysisResult.imagePreview || '',
          }),
        });
      }
    } catch (err) {
      setError(err.message || 'Unable to analyze the image.');
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setSelectedImage(null);
  };

  return (
    <>
      <Navbar isAuthenticated={true} />

      {/* ── Pure dark navy background ── */}
      <div
        className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden"
        style={{ background: '#0d1117' }}
      >
        <GlitterLayer />

        {/* ── CHANGED: px-6 → padding 4% equal sides, no max-width cap ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full flex flex-col items-center pt-16 md:pt-24 pb-20 will-change-transform"
          style={{ zIndex: 1, paddingLeft: '4%', paddingRight: '4%' }}
        >
          {/* ── HEADER ── */}
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              <span style={{ color: '#ffffff' }}>Food Nutrition </span>
              <span style={{
                background: 'linear-gradient(135deg, #34d399, #22c55e, #4ade80)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Analysis</span>
            </h1>
            <p style={{ color: '#8b949e', fontSize: '1.1rem', maxWidth: '38rem', margin: '0 auto', lineHeight: 1.7, fontWeight: 500 }}>
              Upload a photo of your food and get instant AI-powered nutritional insights.
            </p>
            <div className="pt-4 flex justify-center">
              <ContextualActions
                imageUploaded={!!selectedImage}
                isProcessing={isProcessing}
                onNewAnalysis={handleRetry}
                onAnalyzeAnother={handleRetry}
              />
            </div>
          </div>

          {/* ── BOX 1: UPLOAD AREA ── */}
          <div className="w-full relative group max-w-4xl mb-12 transition-all duration-500 hover:scale-[1.01]">
            {/* Glow ring */}
            <div style={{
              position: 'absolute', inset: -1.5, borderRadius: '3rem',
              background: 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(34,197,94,0.15), rgba(52,211,153,0.3))',
              filter: 'blur(8px)',
              opacity: 0.5,
              transition: 'opacity 0.5s',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'relative',
              background: 'rgba(22,27,34,0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(48,54,61,0.8)',
              borderRadius: '3rem',
              padding: '2rem 3rem 3rem',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <ImageUploader
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                isProcessing={isProcessing}
              />

              <AnimatePresence mode="wait">
                {selectedImage && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 flex justify-center"
                  >
                    <AnalysisButton
                      onClick={handleAnalyze}
                      disabled={!selectedImage}
                      isProcessing={isProcessing}
                    />
                  </motion.div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8"
                  >
                    <ErrorMessage message={error} onRetry={handleRetry} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── BOX 2: TIPS ── */}
          {!selectedImage && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                width: '100%', maxWidth: '56rem', marginBottom: '3rem',
                background: 'rgba(22,27,34,0.8)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(48,54,61,0.8)',
                borderRadius: '2.5rem',
                padding: '2rem 3rem 3rem',
                boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 1rem' }}>
                <div style={{
                  padding: '0.6rem', borderRadius: '0.75rem',
                  background: 'rgba(251,191,36,0.12)',
                  border: '1px solid rgba(251,191,36,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Lightbulb size={22} color="#fbbf24" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e6edf3', letterSpacing: '-0.02em', margin: 0 }}>
                  Tips for Best Results
                </h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', padding: '0 0.5rem' }}>
                <TipCard icon={<Camera size={26} color="#34d399" />} title="Take a Clear Photo"    desc="Ensure good lighting for higher accuracy." />
                <TipCard icon={<Target size={26} color="#34d399" />} title="Focus on the Food"    desc="Keep food centered and avoid busy backgrounds." />
                <TipCard icon={<Zap    size={26} color="#34d399" />} title="Instant Results"      desc="Get nutritional data in seconds, not minutes." />
              </div>
            </motion.div>
          )}

          {/* ── BOX 3: FEATURE GRID ── */}
          {!selectedImage && !isProcessing && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', width: '100%', maxWidth: '56rem' }}>
              <FeatureCard icon="Brain"      title="AI-Powered"      desc="Advanced machine learning." />
              <FeatureCard icon="Gauge"      title="Instant Results" desc="Data in seconds."           />
              <FeatureCard icon="Shield"     title="Privacy First"   desc="Securely processed."        />
              <FeatureCard icon="TrendingUp" title="Detailed Insights" desc="Nutritional breakdowns."  />
            </div>
          )}
        </motion.div>
      </div>

      <LoadingOverlay isVisible={isProcessing} />
    </>
  );
};

/* ── TipCard — dark themed ── */
const TipCard = ({ icon, title, desc }) => (
  <div style={{
    background: 'rgba(13,17,23,0.6)',
    border: '1px solid rgba(48,54,61,0.8)',
    borderRadius: '1.5rem',
    padding: '1.75rem',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.875rem',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(52,211,153,0.35)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(52,211,153,0.08)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: '0.875rem',
      background: 'rgba(52,211,153,0.1)',
      border: '1px solid rgba(52,211,153,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {icon}
    </div>
    <h4 style={{ fontWeight: 700, color: '#e6edf3', fontSize: '1rem', margin: 0 }}>{title}</h4>
    <p style={{ fontSize: '0.85rem', color: '#8b949e', lineHeight: 1.6, margin: 0 }}>{desc}</p>
  </div>
);

/* ── FeatureCard — dark themed ── */
const FeatureCard = ({ icon, title, desc }) => (
  <div style={{
    background: 'rgba(22,27,34,0.8)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(48,54,61,0.8)',
    borderRadius: '1.5rem',
    padding: '1.75rem',
    transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
      e.currentTarget.style.background = 'rgba(22,27,34,0.95)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.background = 'rgba(22,27,34,0.8)';
    }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: '0.875rem',
      background: 'rgba(52,211,153,0.1)',
      border: '1px solid rgba(52,211,153,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '1.25rem',
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <Icon name={icon} size={26} color="#34d399" />
    </div>
    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#e6edf3', marginBottom: '0.5rem' }}>{title}</h4>
    <p style={{ color: '#8b949e', lineHeight: 1.6, fontSize: '0.85rem', margin: 0 }}>{desc}</p>
  </div>
);

export default ImageUpload;