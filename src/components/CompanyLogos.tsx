import React from 'react';




const CompanyLogos: React.FC = () => {
  return (
    <div className="w-full mb-0 flex justify-center items-center bg-[#F1F1F3] py-4">
      <div className="flex flex-row items-center justify-center gap-8 md:gap-12 max-w-4xl mx-auto transform -translate-x-6 sm:-translate-x-10 md:-translate-x-24 lg:-translate-x-40 xl:-translate-x-56">
        {/* Jordanian Company Logo */}
        <div className="flex justify-center items-center text-center flex-shrink-0">
          <img
            src="/silos logo.png"
            alt="الشركة العامة الأردنية للصوامع والتموين"
            className="h-16 md:h-20 lg:h-24 w-auto object-contain mx-auto transform hover:scale-105 transition-all duration-300 filter drop-shadow"
          />
        </div>

        {/* iDEALCHiP Logo */}
        <div className="flex justify-center items-center text-center flex-shrink-0">
          <img
            src="/ideal chip logo.png"
            alt="iDEALCHiP"
            className="h-16 md:h-20 lg:h-24 w-auto object-contain mx-auto transform hover:scale-105 transition-all duration-300 filter drop-shadow"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyLogos;


