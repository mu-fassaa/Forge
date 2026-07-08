import React from 'react';
import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const LucideIcon: React.FC<LucideIconProps> = ({ name, className = '', size = 20, style }) => {
  // Safe lookup for dynamic icon rendering
  const IconComponent = (Icons as Record<string, any>)[name];

  if (!IconComponent) {
    // Fallback icon if not found
    return <Icons.HelpCircle className={className} size={size} style={style} />;
  }

  return <IconComponent className={className} size={size} style={style} />;
};
