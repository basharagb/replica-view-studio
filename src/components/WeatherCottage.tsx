import React from 'react';
import { useCottageTemperature } from '../hooks/useCottageTemperature';

interface WeatherCottageProps {
  className?: string;
}

const WeatherCottage: React.FC<WeatherCottageProps> = ({ className = '' }) => {
  // Live cottage temperatures from API
  const { data, isLoading } = useCottageTemperature({ autoRefresh: true, refreshInterval: 30000 });

  const formatTemp = (temp: number, status: 'normal' | 'warning' | 'error' | 'disconnected') => {
    if (status === 'disconnected') return 'Disconnected';
    return `${temp.toFixed(1)}°C`;
  };

  const insideDisplay = data.inside
    ? formatTemp(data.inside.temperature, data.inside.status)
    : isLoading ? 'Loading…' : '--°C';

  const outsideDisplay = data.outside
    ? formatTemp(data.outside.temperature, data.outside.status)
    : isLoading ? 'Loading…' : '--°C';

  return (
    <div className={`flex justify-center items-center py-8 ${className}`}>
      <div className="relative">
        {/* Beautiful Animated Cottage Structure */}
        <div className="bg-gradient-to-b from-amber-50 to-amber-100 border-4 border-amber-800 rounded-2xl shadow-2xl p-8 min-w-[450px] relative overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-105">
          
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-6 w-1 h-1 bg-amber-500 rounded-full animate-ping"></div>
            <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse delay-300"></div>
          </div>

          {/* Beautiful Cottage Roof with Gradient */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              {/* Main Roof */}
              <div className="w-0 h-0 border-l-[80px] border-r-[80px] border-b-[50px] border-l-transparent border-r-transparent border-b-gradient-to-r from-red-800 via-red-700 to-red-600 filter drop-shadow-lg"></div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[75px] border-r-[75px] border-b-[45px] border-l-transparent border-r-transparent border-b-gradient-to-r from-red-700 via-red-600 to-red-500"></div>
              
              {/* Animated Chimney with Smoke */}
              <div className="absolute -top-8 right-4 w-6 h-12 bg-gradient-to-t from-red-900 to-red-700 border-2 border-red-950 rounded-t-sm shadow-lg">
                {/* Animated Smoke */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-3 bg-gray-400 rounded-full opacity-60 animate-bounce"></div>
                  <div className="w-1 h-2 bg-gray-300 rounded-full opacity-40 animate-bounce delay-150 absolute -top-1 left-0.5"></div>
                  <div className="w-0.5 h-1 bg-gray-200 rounded-full opacity-30 animate-bounce delay-300 absolute -top-2 left-1"></div>
                </div>
              </div>
              
              {/* Roof Tiles Effect */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                <div className="w-2 h-1 bg-red-900 rounded-full opacity-50"></div>
                <div className="w-2 h-1 bg-red-800 rounded-full opacity-50"></div>
                <div className="w-2 h-1 bg-red-900 rounded-full opacity-50"></div>
              </div>
            </div>
          </div>

          {/* Elegant Door with Details */}
          <div className="absolute -left-14 top-6 w-10 h-20 bg-gradient-to-b from-amber-800 to-amber-900 border-3 border-amber-950 rounded-r-xl shadow-xl">
            {/* Door Handle */}
            <div className="w-2 h-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full absolute right-2 top-10 shadow-sm animate-pulse"></div>
            {/* Door Panels */}
            <div className="absolute inset-2 border border-amber-700 rounded-r-lg">
              <div className="w-full h-6 border-b border-amber-700 mt-2"></div>
              <div className="w-full h-6 border-b border-amber-700 mt-2"></div>
            </div>
          </div>

          {/* Main Content Area with Enhanced Styling */}
          <div className="flex items-center justify-between gap-10 pt-4">
            {/* Inside Temperature Display with Glow Effect */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-emerald-300 font-mono text-lg px-6 py-3 rounded-xl border-2 border-emerald-600 mb-3 min-w-[140px] text-center shadow-lg shadow-emerald-900/50 animate-pulse">
                INSIDE
              </div>
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-emerald-200 font-mono text-3xl font-bold px-6 py-4 rounded-xl border-2 border-emerald-600 min-w-[140px] text-center shadow-xl shadow-emerald-900/50 glow-emerald">
                {insideDisplay}
              </div>
            </div>

            {/* Beautiful Animated Window */}
            <div className="w-20 h-20 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 border-4 border-amber-800 rounded-2xl relative shadow-inner transform hover:scale-110 transition-all duration-300">
              {/* Window Frame */}
              <div className="absolute inset-1 border-2 border-amber-700 rounded-xl">
                {/* Window Cross with Shadow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-1 bg-amber-800 shadow-sm"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-full bg-amber-800 shadow-sm"></div>
                </div>
                {/* Window Reflection Effect */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-white opacity-30 rounded-full blur-sm"></div>
                <div className="absolute bottom-1 right-1 w-2 h-2 bg-white opacity-20 rounded-full blur-sm"></div>
              </div>
            </div>

            {/* Outside Temperature Display with Glow Effect */}
            <div className="flex flex-col items-center transform hover:scale-105 transition-transform duration-200">
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-emerald-300 font-mono text-lg px-6 py-3 rounded-xl border-2 border-emerald-600 mb-3 min-w-[140px] text-center shadow-lg shadow-emerald-900/50 animate-pulse">
                OUTSIDE
              </div>
              <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-emerald-200 font-mono text-3xl font-bold px-6 py-4 rounded-xl border-2 border-emerald-600 min-w-[140px] text-center shadow-xl shadow-emerald-900/50 glow-emerald">
                {outsideDisplay}
              </div>
            </div>
          </div>

          {/* Enhanced Weather Station Label */}
          <div className="mt-6 text-center">
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white font-bold text-base px-6 py-2 rounded-full inline-block shadow-lg border border-slate-600 transform hover:scale-105 transition-all duration-200">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                WEATHER STATION
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default WeatherCottage;
