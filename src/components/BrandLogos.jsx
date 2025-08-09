import React from 'react';

// Professional Equipment Tracker Logo
export const ProfessionalLogo = ({ 
  size = 'md',
  className = '',
  variant = 'full', // 'full', 'compact'
  theme = 'default' // 'default', 'light', 'dark'
}) => {
  const sizeConfig = {
    sm: { icon: 'h-5 w-5', text: 'text-sm', gap: 'gap-2' },
    md: { icon: 'h-6 w-6', text: 'text-lg', gap: 'gap-3' },
    lg: { icon: 'h-8 w-8', text: 'text-xl', gap: 'gap-3' },
    xl: { icon: 'h-10 w-10', text: 'text-2xl', gap: 'gap-4' }
  };

  const themeColors = {
    default: {
      icon: 'text-primary',
      text: 'text-gray-900 dark:text-white',
      accent: 'text-primary'
    },
    light: {
      icon: 'text-white',
      text: 'text-white', 
      accent: 'text-blue-200'
    },
    dark: {
      icon: 'text-primary',
      text: 'text-gray-900',
      accent: 'text-primary-dark'
    }
  };

  const config = sizeConfig[size];
  const colors = themeColors[theme];

  const IconComponent = () => (
    <div className={`${config.icon} ${colors.icon} relative`}>
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
        {/* Box/Container */}
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
              fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
        
        {/* Grid sections */}
        <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="10" y1="4" x2="10" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        <line x1="14" y1="4" x2="14" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
        
        {/* Equipment items (small squares) */}
        <rect x="5" y="6" width="2" height="2" fill="currentColor" opacity="0.8"/>
        <rect x="5" y="11" width="2" height="2" fill="currentColor" opacity="0.6"/>
        <rect x="11" y="6" width="2" height="2" fill="currentColor" opacity="0.9"/>
        <rect x="15" y="11" width="2" height="2" fill="currentColor" opacity="0.7"/>
        
        {/* Status indicator */}
        <circle cx="19" cy="7" r="1.5" fill="#2ecc71"/>
      </svg>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${config.gap} ${className}`}>
        <IconComponent />
        <span className={`font-bold ${config.text} ${colors.text}`}>
          EQ<span className={colors.accent}>Track</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      <IconComponent />
      <div>
        <span className={`font-bold ${config.text} ${colors.text}`}>
          Equipment <span className={colors.accent}>Tracker</span>
        </span>
      </div>
    </div>
  );
};

// Tech-focused Logo with modern styling
export const TechLogo = ({ 
  size = 'md',
  className = '',
  animated = false 
}) => {
  const sizeConfig = {
    sm: { container: 'h-5 w-5', text: 'text-sm' },
    md: { container: 'h-6 w-6', text: 'text-lg' },
    lg: { container: 'h-8 w-8', text: 'text-xl' },
    xl: { container: 'h-10 w-10', text: 'text-2xl' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${config.container} relative ${animated ? 'hover:rotate-180 transition-transform duration-700' : ''}`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <defs>
            <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#3498db" />
              <stop offset="100%" stopColor="#764ba2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Hexagonal background */}
          <polygon 
            points="20,2 35,11 35,29 20,38 5,29 5,11" 
            fill="url(#techGradient)"
            filter="url(#glow)"
          />
          
          {/* Inner pattern */}
          <g fill="white" opacity="0.9">
            <rect x="12" y="12" width="16" height="16" rx="2" fill="none" stroke="white" strokeWidth="1.5"/>
            <line x1="12" y1="18" x2="28" y2="18" stroke="white" strokeWidth="1"/>
            <line x1="12" y1="22" x2="28" y2="22" stroke="white" strokeWidth="1"/>
            <line x1="18" y1="12" x2="18" y2="28" stroke="white" strokeWidth="1"/>
            <line x1="22" y1="12" x2="22" y2="28" stroke="white" strokeWidth="1"/>
            <circle cx="20" cy="20" r="1.5" fill="white"/>
          </g>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold ${config.text} text-gray-900 dark:text-white leading-tight`}>
          Equipment
        </span>
        <span className={`${config.text === 'text-sm' ? 'text-xs' : 'text-sm'} text-primary font-medium leading-tight`}>
          TRACKER
        </span>
      </div>
    </div>
  );
};

// Simple text-based logo with clean typography
export const TypeLogo = ({ 
  size = 'md',
  className = '',
  variant = 'full' // 'full', 'abbreviated'
}) => {
  const sizeConfig = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  if (variant === 'abbreviated') {
    return (
      <div className={`${className}`}>
        <span className={`font-black ${sizeConfig[size]} text-gray-900 dark:text-white tracking-tight`}>
          EQ
        </span>
        <span className={`font-light ${sizeConfig[size]} text-primary`}>
          track
        </span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <span className={`font-bold ${sizeConfig[size]} text-gray-900 dark:text-white`}>
        Equipment
      </span>
      <span className={`font-light ${sizeConfig[size]} text-primary ml-2`}>
        Tracker
      </span>
    </div>
  );
};

// Badge/Stamp style logo
export const BadgeLogo = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeConfig = {
    sm: { container: 'h-8 w-8', text: 'text-xs' },
    md: { container: 'h-10 w-10', text: 'text-sm' },
    lg: { container: 'h-12 w-12', text: 'text-base' },
    xl: { container: 'h-16 w-16', text: 'text-lg' }
  };

  const config = sizeConfig[size];

  return (
    <div className={`${config.container} ${className}`}>
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <defs>
          <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2980b9" />
            <stop offset="100%" stopColor="#3498db" />
          </linearGradient>
        </defs>
        
        {/* Badge circle */}
        <circle cx="40" cy="40" r="35" fill="url(#badgeGradient)" stroke="#2980b9" strokeWidth="2"/>
        
        {/* Inner circle */}
        <circle cx="40" cy="40" r="28" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
        
        {/* Equipment icon in center */}
        <g fill="white">
          <rect x="25" y="25" width="30" height="30" rx="3" fill="none" stroke="white" strokeWidth="2"/>
          <line x1="25" y1="35" x2="55" y2="35" stroke="white" strokeWidth="1.5"/>
          <line x1="25" y1="45" x2="55" y2="45" stroke="white" strokeWidth="1.5"/>
          <line x1="35" y1="25" x2="35" y2="55" stroke="white" strokeWidth="1.5"/>
          <line x1="45" y1="25" x2="45" y2="55" stroke="white" strokeWidth="1.5"/>
          <circle cx="40" cy="40" r="3" fill="white"/>
        </g>
        
        {/* Text around the circle */}
        <defs>
          <path id="circle" d="M 40, 40 m -30, 0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"/>
        </defs>
        <text className={`${config.text} font-bold fill-white`}>
          <textPath href="#circle" startOffset="0%">
            EQUIPMENT • TRACKER • 
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default ProfessionalLogo;