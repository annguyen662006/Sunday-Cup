import React from 'react';
import { cn } from '../utils/cn';

type GlassCardProps = React.ComponentPropsWithoutRef<'div'>;

export const GlassCard = ({ children, className, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
