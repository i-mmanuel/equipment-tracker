import React from 'react';

// Main Logo Component with multiple variants
const Logo = ({ 
  variant = 'full', // 'full', 'icon', 'text'
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  className = '',
  animated = false,
  color = 'default' // 'default', 'white', 'primary'
}) => {
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const getColors = () => {
    switch (color) {
      case 'white':
        return {
          icon: 'text-white',
          text: 'text-white',
          accent: 'text-blue-300'
        };
      case 'primary':
        return {
          icon: 'text-primary',
          text: 'text-primary',
          accent: 'text-primary-light'
        };
      default:
        return {
          icon: 'text-gray-900 dark:text-white',
          text: 'text-gray-900 dark:text-white',
          accent: 'text-primary'
        };
    }
  };

  const colors = getColors();

  // Equipment-themed icon with gear and clipboard elements
  const LogoIcon = ({ className: iconClassName = '' }) => (
    <svg
      viewBox="0 0 48 48"
      className={`${sizeClasses[size]} ${colors.icon} ${iconClassName} ${animated ? 'transition-all duration-300 hover:scale-110' : ''}`}
      fill="currentColor"
    >
      {/* Background circle */}
      <circle cx="24" cy="24" r="22" fill="currentColor" className="opacity-10" />
      
      {/* Clipboard base */}
      <path 
        d="M14 8h20c1.1 0 2 .9 2 2v28c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z" 
        fill="currentColor" 
        className="opacity-20"
      />
      
      {/* Clipboard clip */}
      <path 
        d="M18 4h12c1.1 0 2 .9 2 2v2H16V6c0-1.1.9-2 2-2z" 
        fill="currentColor"
      />
      
      {/* Gear/Cog element */}
      <g className={animated ? 'origin-center animate-spin [animation-duration:20s]' : ''}>
        <circle cx="30" cy="18" r="8" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-80"/>
        <circle cx="30" cy="18" r="3" fill="currentColor" className="opacity-60"/>
        <path d="M30 10v2M30 24v2M38 18h-2M24 18h2M35.66 12.34l-1.42 1.42M26.76 22.24l-1.42 1.42M35.66 23.66l-1.42-1.42M26.76 15.76l-1.42-1.42" 
              stroke="currentColor" strokeWidth="2" className="opacity-80"/>
      </g>
      
      {/* Checklist lines */}
      <line x1="16" y1="14" x2="26" y2="14" stroke="currentColor" strokeWidth="2" className="opacity-60"/>
      <line x1="16" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="2" className="opacity-60"/>
      <line x1="16" y1="22" x2="24" y2="22" stroke="currentColor" strokeWidth="2" className="opacity-60"/>
      
      {/* Checkmarks */}
      <path d="M18 14l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-80"/>
    </svg>
  );

  const LogoText = ({ className: textClassName = '' }) => (
    <span className={`font-bold ${textSizes[size]} ${colors.text} ${textClassName}`}>
      <span>Equipment</span>
      <span className={colors.accent}> Tracker</span>
    </span>
  );

  const renderLogo = () => {
    switch (variant) {
      case 'icon':
        return <LogoIcon className={className} />;
      case 'text':
        return <LogoText className={className} />;
      case 'full':
      default:
        return (
          <div className={`flex items-center gap-3 ${className}`}>
            <LogoIcon />
            <LogoText />
          </div>
        );
    }
  };

  return renderLogo();
};

// Alternative Modern Logo with geometric design
export const ModernLogo = ({ 
  size = 'md',
  className = '',
  animated = false,
  color = 'default'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12', 
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const getColors = () => {
    switch (color) {
      case 'white':
        return 'text-white';
      case 'primary': 
        return 'text-primary';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative ${animated ? 'hover:scale-110 transition-transform duration-300' : ''}`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          {/* Modern geometric design */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3498db" />
              <stop offset="100%" stopColor="#2980b9" />
            </linearGradient>
          </defs>
          
          {/* Main shape */}
          <rect x="4" y="8" width="32" height="24" rx="2" fill="url(#logoGradient)" />
          
          {/* Grid pattern */}
          <line x1="12" y1="8" x2="12" y2="32" stroke="white" strokeWidth="1" opacity="0.6"/>
          <line x1="20" y1="8" x2="20" y2="32" stroke="white" strokeWidth="1" opacity="0.6"/>
          <line x1="28" y1="8" x2="28" y2="32" stroke="white" strokeWidth="1" opacity="0.6"/>
          <line x1="4" y1="16" x2="36" y2="16" stroke="white" strokeWidth="1" opacity="0.6"/>
          <line x1="4" y1="24" x2="36" y2="24" stroke="white" strokeWidth="1" opacity="0.6"/>
          
          {/* Accent elements */}
          <circle cx="8" cy="12" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="8" cy="20" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="8" cy="28" r="1.5" fill="white" opacity="0.8"/>
        </svg>
      </div>
      <span className={`font-bold ${textSizes[size]} ${getColors()}`}>
        <span>EQ</span>
        <span className="text-primary">Track</span>
      </span>
    </div>
  );
};

// Minimalist Icon-only Logo
export const IconLogo = ({ 
  size = 'md',
  className = '',
  animated = false 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} ${animated ? 'hover:scale-110 transition-transform duration-300' : ''}`}>
      <svg viewBox="0 0 32 32" className="w-full h-full">
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3498db" />
            <stop offset="100%" stopColor="#2980b9" />
          </linearGradient>
        </defs>
        
        {/* Rounded square background */}
        <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#iconGradient)" />
        
        {/* Equipment grid icon */}
        <g fill="white" opacity="0.9">
          <rect x="7" y="7" width="18" height="18" rx="1" fill="none" stroke="white" strokeWidth="1.5"/>
          <line x1="7" y1="13" x2="25" y2="13" stroke="white" strokeWidth="1"/>
          <line x1="7" y1="19" x2="25" y2="19" stroke="white" strokeWidth="1"/>
          <line x1="13" y1="7" x2="13" y2="25" stroke="white" strokeWidth="1"/>
          <line x1="19" y1="7" x2="19" y2="25" stroke="white" strokeWidth="1"/>
          
          {/* Center dot */}
          <circle cx="16" cy="16" r="2" fill="white"/>
        </g>
      </svg>
    </div>
  );
};

export default Logo;