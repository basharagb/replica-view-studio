import { cylinderMeasurements } from '../services/siloData';

export const LabCylinder = () => {
  return (
    <div className="relative">
      <div className="w-16 h-64 bg-lab-cylinder border-2 border-gray-400 rounded-lg flex flex-col justify-between items-center py-2">
        {cylinderMeasurements.map((measurement, index) => (
          <div key={index} className="bg-lab-cylinder w-12 h-6 flex items-center justify-center text-xs font-semibold text-lab-text border border-gray-300 rounded">
            {measurement}
          </div>
        ))}
      </div>
    </div>
  );
};