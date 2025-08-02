interface LabNumberSquareProps {
  number: number;
}

export const LabNumberSquare = ({ number }: LabNumberSquareProps) => {
  return (
    <div className="w-6 h-6 bg-white border border-gray-300 flex items-center justify-center text-xs font-medium text-lab-text">
      {number}
    </div>
  );
};