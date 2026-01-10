import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  icon, 
  iconPosition = 'left',
  className, 
  disabled,
  onClick,
  type = 'button',
}, ref) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-[0_0_50px_-10px_hsl(var(--primary)/0.6)] active:scale-[0.98]',
    secondary: 'bg-glass border border-glass-border text-foreground hover:bg-glass-highlight hover:border-glass-highlight',
    ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-glass/50',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };
  
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {variant === 'primary' && (
        <motion.div
          className="absolute inset-0 bg-gradient-primary-hover opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {icon && iconPosition === 'left' && icon}
        {children}
        {icon && iconPosition === 'right' && icon}
      </span>
    </motion.button>
  );
});

GradientButton.displayName = 'GradientButton';

export { GradientButton };
