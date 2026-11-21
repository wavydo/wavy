// Rounded Image Card - Inspired by YukoHealth design
// Clean, minimal cards with large rounded images

import { useState } from 'react';

export interface RoundedImageCardProps {
  image: string;
  imageAlt?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'wide';
  size?: 'small' | 'medium' | 'large';
}

export function RoundedImageCard({
  image,
  imageAlt = '',
  title,
  subtitle,
  badge,
  onClick,
  className = '',
  aspectRatio = 'square',
  size = 'medium',
}: RoundedImageCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const aspectRatios = {
    square: '1/1',
    portrait: '3/4',
    landscape: '4/3',
    wide: '16/9',
  };

  const sizes = {
    small: 'max-w-[280px]',
    medium: 'max-w-[380px]',
    large: 'max-w-[520px]',
  };

  return (
    <div 
      className={`group cursor-pointer ${sizes[size]} ${className}`}
      onClick={onClick}
      style={{
        width: '100%',
      }}
    >
      <div 
        className="relative overflow-hidden bg-gray-100"
        style={{
          aspectRatio: aspectRatios[aspectRatio],
          borderRadius: size === 'small' ? '20px' : size === 'medium' ? '28px' : '32px',
          transition: 'transform 0.5s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <img
          src={image}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            transform: imageLoaded ? 'scale(1)' : 'scale(1.1)',
          }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {!imageLoaded && (
          <div 
            className="absolute inset-0 animate-pulse"
            style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}

        {badge && (
          <div 
            className="absolute top-4 left-4 px-3 py-1.5 text-xs font-semibold text-white rounded-full"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              textTransform: 'lowercase',
              letterSpacing: '0.3px',
            }}
          >
            {badge}
          </div>
        )}

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.05) 100%)',
          }}
        />
      </div>

      {(title || subtitle) && (
        <div 
          className="mt-4"
          style={{
            paddingLeft: size === 'small' ? '4px' : '8px',
          }}
        >
          {title && (
            <h3 
              className="font-medium text-lg transition-colors duration-200"
              style={{
                color: 'var(--ink, #0a0a0a)',
                fontSize: size === 'small' ? '16px' : size === 'medium' ? '18px' : '22px',
                marginBottom: subtitle ? '4px' : '0',
              }}
            >
              {title}
            </h3>
          )}
          {subtitle && (
            <p 
              className="text-sm"
              style={{
                color: 'var(--muted, #64748b)',
                fontSize: size === 'small' ? '13px' : '14px',
                lineHeight: '1.5',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export default RoundedImageCard;
