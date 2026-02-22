import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = () => {
  return (
    <div className="text-center mb-8 md:mb-10 lg:mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4 md:mb-5 lg:mb-6 shadow-lg">
        <Icon name="Apple" size={32} color="#FFFFFF" strokeWidth={2.5} className="md:w-10 md:h-10 lg:w-12 lg:h-12" />
      </div>
      
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2 md:mb-3">
        Welcome to FoodNutritionAI
      </h1>
      
      <p className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-md mx-auto">
        Sign in to analyze your food images and get instant nutritional insights powered by AI
      </p>
    </div>
  );
};

export default WelcomeHeader;