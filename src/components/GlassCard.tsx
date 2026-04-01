import React from 'react';
import { cn } from '../utils/cn';

type GlassCardProps = React.ComponentPropsWithoutRef<'div'>;

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        'glass-card backdrop-blur-md rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
