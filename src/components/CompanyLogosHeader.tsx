import React from 'react';

interface CompanyLogosHeaderProps {
  className?: string;
}

export const CompanyLogosHeader: React.FC<CompanyLogosHeaderProps> = ({ className = "" }) => {
  return (
    <div className={`w-full bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b-2 border-gray-200 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 sm:py-6 gap-4 sm:gap-6">
          
          {/* SILOS COMPANY Logo - Left side */}
          <div className="flex items-center justify-center sm:justify-start flex-shrink-0 group">
            <img 
              src="/assets/logos/silos-company-logo.svg" 
              alt="Jordan Silos & Supply General Company"
              className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[350px] object-contain 
                         transform transition-all duration-500 hover:scale-105 hover:rotate-1 
                         animate-pulse hover:animate-none group-hover:drop-shadow-lg"
            />
          </div>

          {/* Center Title - Hidden on small screens, shown on medium+ */}
          <div className="hidden md:flex flex-col items-center text-center flex-grow">
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 
                           animate-pulse hover:animate-bounce transition-all duration-300">
              Live Readings Dashboard
            </h1>
            <p className="text-sm lg:text-base text-gray-600 animate-fade-in">
              Real-time Silo Monitoring System
            </p>
            {/* Animated decorative elements */}
            <div className="flex gap-2 mt-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* IDEALCHIP Logo - Right side */}
          <div className="flex items-center justify-center sm:justify-end flex-shrink-0 group">
            <img 
              src="/assets/logos/idealchip-logo.svg" 
              alt="IDEALCHIP - Industrial IoT Solutions"
              className="h-10 sm:h-12 md:h-16 lg:h-20 w-auto max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px] object-contain
                         transform transition-all duration-500 hover:scale-105 hover:-rotate-1 
                         animate-pulse hover:animate-none group-hover:drop-shadow-lg"
            />
          </div>
        </div>

        {/* Mobile Title - Shown only on small screens */}
        <div className="md:hidden text-center pb-4 border-t border-gray-100 pt-4">
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 animate-pulse">
            Live Readings Dashboard
          </h1>
          <p className="text-sm text-gray-600 animate-fade-in">
            Real-time Silo Monitoring System
          </p>
          {/* Mobile animated decorative elements */}
          <div className="flex gap-2 mt-2 justify-center">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
      
      {/* Animated bottom border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-pulse"></div>
    </div>
  );
};

export default CompanyLogosHeader;
