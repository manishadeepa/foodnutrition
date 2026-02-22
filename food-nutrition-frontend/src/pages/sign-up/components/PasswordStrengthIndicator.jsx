import React from 'react';
import { cn } from '../../../utils/cn';

const PasswordStrengthIndicator = ({ strength }) => {
  const getStrengthLabel = () => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      case 5:
        return 'Very Strong';
      default:
        return 'Weak';
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-error';
      case 2:
        return 'bg-warning';
      case 3:
        return 'bg-primary';
      case 4:
      case 5:
        return 'bg-success';
      default:
        return 'bg-error';
    }
  };

  const getTextColor = () => {
    switch (strength) {
      case 0:
      case 1:
        return 'text-error';
      case 2:
        return 'text-warning';
      case 3:
        return 'text-primary';
      case 4:
      case 5:
        return 'text-success';
      default:
        return 'text-error';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5]?.map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              level <= strength ? getStrengthColor() : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', getTextColor())}>
        Password strength: {getStrengthLabel()}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;