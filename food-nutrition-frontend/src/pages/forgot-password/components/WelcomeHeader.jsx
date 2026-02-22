import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeHeader = () => {
  return (
    <div className="text-center mb-8 md:mb-10">
      <div className="flex justify-center mb-4">
        <div className="bg-primary/10 p-4 rounded-full">
          <Icon name="KeyRound" size={40} color="var(--color-primary)" />
        </div>
      </div>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
        Forgot Password?
      </h1>
      <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
        No worries! Enter your email address and we'll send you instructions to reset your password.
      </p>
    </div>
  );
};

export default WelcomeHeader;