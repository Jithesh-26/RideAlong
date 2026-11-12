import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  isVerified = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
  };

  const badgeSizes = {
    sm: 'w-3 h-3 -bottom-0.5 -right-0.5',
    md: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    lg: 'w-5 h-5 bottom-0 right-0',
    xl: 'w-6 h-6 bottom-0.5 right-0.5',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeStyles[size]} rounded-full object-cover ring-2 ring-white shadow-xs`}
          onError={e => {
            // fallback if image fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} rounded-full bg-teal-700 text-white font-semibold flex items-center justify-center ring-2 ring-white shadow-xs`}
        >
          {initials}
        </div>
      )}
      {isVerified && (
        <div
          className={`absolute ${badgeSizes[size]} bg-teal-600 text-white rounded-full flex items-center justify-center ring-2 ring-white`}
          title="Identity Verified"
        >
          <ShieldCheck className="w-full h-full p-0.5" />
        </div>
      )}
    </div>
  );
};
