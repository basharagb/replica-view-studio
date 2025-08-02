interface LabCircleProps {
  number: number;
  color: 'green' | 'yellow' | 'pink' | 'beige';
  size?: 'sm' | 'md' | 'lg';
}

export const LabCircle = ({ number, color, size = 'md' }: LabCircleProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const colorClasses = {
    green: 'bg-lab-green',
    yellow: 'bg-lab-yellow', 
    pink: 'bg-lab-pink',
    beige: 'bg-lab-beige'
  };

  return (
    <div className={`
      ${sizeClasses[size]} 
      ${colorClasses[color]} 
      rounded-full 
      flex 
      items-center 
      justify-center 
      font-semibold 
      text-lab-text 
      border-2 
      border-gray-300
      shadow-sm
    `}>
      {number}
    </div>
  );
};