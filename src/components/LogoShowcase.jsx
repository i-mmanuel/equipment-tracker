import React from 'react';
import Logo from './Logo.jsx';
import { ProfessionalLogo, TechLogo, TypeLogo, BadgeLogo } from './BrandLogos.jsx';

const LogoShowcase = () => {
  return (
    <div className="p-8 space-y-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Equipment Tracker - Logo Variations
        </h1>

        {/* Main Logo Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Main Logo Collection
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Original Logo */}
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                Original Equipment Logo
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded border">
                  <Logo variant="full" size="lg" animated />
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-900 rounded">
                  <Logo variant="full" size="lg" color="white" />
                </div>
                <div className="flex items-center justify-center p-4 bg-primary rounded">
                  <Logo variant="full" size="lg" color="white" />
                </div>
              </div>
            </div>

            {/* Professional Logo */}
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                Professional Logo
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded border">
                  <ProfessionalLogo variant="full" size="lg" />
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-900 rounded">
                  <ProfessionalLogo variant="full" size="lg" theme="light" />
                </div>
                <div className="flex items-center justify-center p-4 bg-primary rounded">
                  <ProfessionalLogo variant="compact" size="lg" theme="light" />
                </div>
              </div>
            </div>

            {/* Tech Logo */}
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                Tech Logo
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded border">
                  <TechLogo size="lg" animated />
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-900 rounded">
                  <TechLogo size="lg" />
                </div>
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded">
                  <TechLogo size="xl" />
                </div>
              </div>
            </div>

            {/* Typography Logo */}
            <div className="card p-6">
              <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">
                Typography Logo
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded border">
                  <TypeLogo variant="full" size="lg" />
                </div>
                <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded border">
                  <TypeLogo variant="abbreviated" size="xl" />
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-900 rounded">
                  <span className="font-black text-xl text-white tracking-tight">
                    EQ<span className="font-light text-blue-400">track</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Icon-Only Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Icon-Only Logos
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card p-6 flex flex-col items-center space-y-3">
              <Logo variant="icon" size="xl" animated />
              <span className="text-sm text-gray-600 dark:text-gray-400">Equipment Icon</span>
            </div>

            <div className="card p-6 flex flex-col items-center space-y-3">
              <div className="h-16 w-16 bg-primary rounded-lg flex items-center justify-center">
                <Logo variant="icon" size="lg" color="white" />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">App Icon Style</span>
            </div>

            <div className="card p-6 flex flex-col items-center space-y-3">
              <BadgeLogo size="xl" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Badge Style</span>
            </div>

            <div className="card p-6 flex flex-col items-center space-y-3 bg-gray-900">
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center">
                <div className="h-10 w-10 text-primary">
                  <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
                          fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1"/>
                    <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1"/>
                    <line x1="10" y1="4" x2="10" y2="20" stroke="currentColor" strokeWidth="1"/>
                    <line x1="14" y1="4" x2="14" y2="20" stroke="currentColor" strokeWidth="1"/>
                    <rect x="5" y="6" width="2" height="2" fill="currentColor"/>
                    <circle cx="19" cy="7" r="1.5" fill="#2ecc71"/>
                  </svg>
                </div>
              </div>
              <span className="text-sm text-gray-400">Circular Icon</span>
            </div>
          </div>
        </section>

        {/* Size Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Size Variations
          </h2>
          
          <div className="card p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Extra Large</span>
                <ProfessionalLogo variant="full" size="xl" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Large</span>
                <ProfessionalLogo variant="full" size="lg" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Medium</span>
                <ProfessionalLogo variant="full" size="md" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Small</span>
                <ProfessionalLogo variant="full" size="sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
            Usage Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* App Header Example */}
            <div className="card p-0 overflow-hidden">
              <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <ProfessionalLogo variant="compact" size="md" />
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">App Header Usage</span>
              </div>
            </div>

            {/* Business Card Example */}
            <div className="card p-0 overflow-hidden bg-gradient-to-br from-primary to-primary-dark text-white">
              <div className="p-6">
                <div className="mb-4">
                  <ProfessionalLogo variant="full" size="lg" theme="light" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm opacity-90">Professional Equipment Management</p>
                  <p className="text-xs opacity-75">contact@equipmenttracker.com</p>
                </div>
              </div>
              <div className="px-6 pb-4">
                <span className="text-xs opacity-75">Business Card Usage</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-12 pb-8">
          <p className="text-gray-600 dark:text-gray-400">
            All logos are scalable SVG format and optimized for both light and dark themes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoShowcase;