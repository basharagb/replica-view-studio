export const LabCylinder = () => {
  const measurements = [25.0, 26.0, 27.0, 29.0, 32.0, 35.0, 36.0, 38.0];

  return (
    <div className="relative">
      <div className="w-16 h-64 bg-lab-cylinder border-2 border-gray-400 rounded-lg flex flex-col justify-between items-center py-2">
        {measurements.map((measurement, index) => (
          <div key={index} className="bg-lab-cylinder w-12 h-6 flex items-center justify-center text-xs font-semibold text-lab-text border border-gray-300 rounded">
            {measurement}
          </div>
        ))}
      </div>
    </div>
  );
};