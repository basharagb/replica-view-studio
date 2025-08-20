import { useEffect, useState } from 'react';

// Minimal placeholder Weather Station widget
// You can later replace this with a real API-powered component if desired.
export default function WeatherStation() {
  const [now, setNow] = useState<string>(new Date().toLocaleString());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date().toLocaleString()), 1000 * 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-4 rounded-md border border-gray-200 bg-white/70 px-4 py-2 shadow-sm">
      <div className="flex flex-col leading-tight">
        <span className="text-sm text-gray-500">Weather Station</span>
        <span className="text-xs text-gray-400">Local time</span>
      </div>
      <div className="h-6 w-px bg-gray-200" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800">{now}</span>
        <span className="text-xs text-gray-500">Add real weather data here</span>
      </div>
    </div>
  );
}
