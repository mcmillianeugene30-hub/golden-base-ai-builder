import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'bordered';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl backdrop-blur-sm';
    
    const variants = {
      default: 'bg-white/5 border border-white/10',
      gradient: 'bg-gradient-to-br from-yellow-400/10 to-orange-500/10 border border-yellow-400/30',
      bordered: 'bg-transparent border border-white/20',
    };

    const hoverStyles = hover ? 'hover:border-yellow-400/50 transition-all hover:translate-y-[-4px] hover:shadow-xl' : '';

    return (
      <div
        ref={ref}
        className={clsx(baseStyles, variants[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
