import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadges = () => {
  const securityFeatures = [
    {
      id: 1,
      icon: 'Shield',
      label: 'SSL Encrypted',
      description: 'Your data is protected with 256-bit encryption'
    },
    {
      id: 2,
      icon: 'Lock',
      label: 'Secure Authentication',
      description: 'Industry-standard security protocols'
    },
    {
      id: 3,
      icon: 'CheckCircle2',
      label: 'Privacy Protected',
      description: 'Your information is never shared'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-8 md:mt-10 lg:mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {securityFeatures?.map((feature) => (
          <div
            key={feature?.id}
            className="flex flex-col items-center text-center p-4 md:p-5 lg:p-6 bg-surface rounded-lg border border-border transition-all hover:shadow-md"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Icon
                name={feature?.icon}
                size={20}
                color="var(--color-primary)"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-sm md:text-base font-semibold text-foreground mb-1">
              {feature?.label}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              {feature?.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityBadges;