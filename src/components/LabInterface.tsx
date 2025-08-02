import { LabGroup } from './LabGroup';
import { LabCylinder } from './LabCylinder';
import { Input } from './ui/input';

export const LabInterface = () => {
  // Top section groups data
  const topGroups = [
    {
      circles: [
        { number: 55, color: 'green' as const },
        { number: 51, color: 'yellow' as const },
        { number: 47, color: 'green' as const },
        { number: 53, color: 'pink' as const },
        { number: 49, color: 'pink' as const },
        { number: 45, color: 'yellow' as const }
      ],
      squares: [54, 52, 50, 48, 46]
    },
    {
      circles: [
        { number: 44, color: 'yellow' as const },
        { number: 40, color: 'yellow' as const },
        { number: 36, color: 'yellow' as const },
        { number: 42, color: 'pink' as const },
        { number: 38, color: 'yellow' as const },
        { number: 34, color: 'green' as const }
      ],
      squares: [43, 41, 39, 37, 35]
    },
    {
      circles: [
        { number: 33, color: 'pink' as const },
        { number: 29, color: 'yellow' as const },
        { number: 25, color: 'yellow' as const },
        { number: 31, color: 'green' as const },
        { number: 27, color: 'pink' as const },
        { number: 23, color: 'green' as const }
      ],
      squares: [32, 30, 28, 26, 24]
    },
    {
      circles: [
        { number: 22, color: 'pink' as const },
        { number: 18, color: 'yellow' as const },
        { number: 14, color: 'yellow' as const },
        { number: 20, color: 'green' as const },
        { number: 16, color: 'green' as const },
        { number: 12, color: 'green' as const }
      ],
      squares: [21, 19, 17, 15, 13]
    },
    {
      circles: [
        { number: 11, color: 'yellow' as const },
        { number: 7, color: 'yellow' as const },
        { number: 3, color: 'green' as const },
        { number: 9, color: 'yellow' as const },
        { number: 5, color: 'yellow' as const },
        { number: 1, color: 'green' as const }
      ],
      squares: [10, 8, 6, 4, 2]
    }
  ];

  // Bottom section groups data
  const bottomGroups = [
    {
      circles: [
        { number: 195, color: 'beige' as const },
        { number: 188, color: 'beige' as const },
        { number: 181, color: 'beige' as const },
        { number: 193, color: 'beige' as const },
        { number: 186, color: 'beige' as const },
        { number: 179, color: 'beige' as const }
      ],
      squares: [194, 190, 187, 183, 180]
    },
    {
      circles: [
        { number: 176, color: 'beige' as const },
        { number: 169, color: 'beige' as const },
        { number: 162, color: 'beige' as const },
        { number: 174, color: 'beige' as const },
        { number: 167, color: 'beige' as const },
        { number: 160, color: 'beige' as const }
      ],
      squares: [175, 171, 168, 164, 161]
    },
    {
      circles: [
        { number: 157, color: 'beige' as const },
        { number: 150, color: 'beige' as const },
        { number: 143, color: 'beige' as const },
        { number: 155, color: 'beige' as const },
        { number: 148, color: 'beige' as const },
        { number: 141, color: 'beige' as const }
      ],
      squares: [156, 152, 149, 145, 142]
    },
    {
      circles: [
        { number: 138, color: 'beige' as const },
        { number: 131, color: 'beige' as const },
        { number: 124, color: 'beige' as const },
        { number: 136, color: 'beige' as const },
        { number: 129, color: 'beige' as const },
        { number: 122, color: 'beige' as const }
      ],
      squares: [137, 133, 130, 126, 123]
    },
    {
      circles: [
        { number: 119, color: 'beige' as const },
        { number: 112, color: 'yellow' as const },
        { number: 105, color: 'pink' as const },
        { number: 117, color: 'beige' as const },
        { number: 110, color: 'pink' as const },
        { number: 103, color: 'pink' as const }
      ],
      squares: [118, 114, 111, 107, 104]
    }
  ];

  const bottomRowData = [
    {
      circles: [
        { number: 191, color: 'beige' as const },
        { number: 184, color: 'beige' as const },
        { number: 177, color: 'beige' as const },
      ],
      squares: [192, 189, 185, 182, 178]
    },
    {
      circles: [
        { number: 172, color: 'beige' as const },
        { number: 165, color: 'beige' as const },
        { number: 158, color: 'beige' as const },
      ],
      squares: [173, 170, 166, 163, 159]
    },
    {
      circles: [
        { number: 153, color: 'beige' as const },
        { number: 146, color: 'beige' as const },
        { number: 139, color: 'beige' as const },
      ],
      squares: [154, 151, 147, 144, 140]
    },
    {
      circles: [
        { number: 134, color: 'beige' as const },
        { number: 127, color: 'beige' as const },
        { number: 120, color: 'beige' as const },
      ],
      squares: [135, 132, 128, 125, 121]
    },
    {
      circles: [
        { number: 115, color: 'beige' as const },
        { number: 108, color: 'yellow' as const },
        { number: 101, color: 'yellow' as const },
      ],
      squares: [116, 113, 109, 106, 102]
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Main lab area */}
          <div className="flex-1 space-y-24">
            {/* Top section */}
            <div className="flex gap-6 justify-center">
              {topGroups.map((group, index) => (
                <LabGroup key={index} circles={group.circles} squares={group.squares} />
              ))}
            </div>

            {/* Bottom section */}
            <div className="space-y-4">
              <div className="flex gap-6 justify-center">
                {bottomGroups.map((group, index) => (
                  <LabGroup key={index} circles={group.circles} squares={group.squares} />
                ))}
              </div>
              
              {/* Bottom row with fewer circles */}
              <div className="flex gap-6 justify-center">
                {bottomRowData.map((group, index) => (
                  <div key={index} className="relative flex flex-col items-center gap-1">
                    <div className="flex gap-1 px-2">
                      {group.squares.map((num, squareIndex) => (
                        <div key={squareIndex} className="w-6 h-6 bg-white border border-gray-300 flex items-center justify-center text-xs font-medium text-lab-text">
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1">
                      {group.circles.map((circle, circleIndex) => (
                        <div key={circleIndex} className={`
                          w-12 h-12 
                          ${circle.color === 'beige' ? 'bg-lab-beige' : circle.color === 'yellow' ? 'bg-lab-yellow' : 'bg-lab-pink'} 
                          rounded-full 
                          flex 
                          items-center 
                          justify-center 
                          font-semibold 
                          text-lab-text 
                          border-2 
                          border-gray-300
                          shadow-sm
                          text-sm
                        `}>
                          {circle.number}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side with cylinder and input */}
          <div className="flex flex-col items-center gap-4">
            <LabCylinder />
            <div className="w-20">
              <Input 
                defaultValue="112" 
                className="text-center font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};