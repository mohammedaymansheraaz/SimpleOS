import React from 'react';
import * as Icons from 'lucide-react';

interface OSIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const OSIcon: React.FC<OSIconProps> = ({ name, className = 'w-5 h-5', size }) => {
  // If it's a URL or image path
  if (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('data:image/')) {
    return (
      <img
        src={name}
        alt=""
        className={`${className} object-contain rounded`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Dynamic Lucide icon lookup
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.Box;

  return <IconComponent className={className} size={size} />;
};
