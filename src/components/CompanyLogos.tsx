import React from 'react';




const CompanyLogos: React.FC = () => {
  return (
    <div className="w-full mb-6 flex justify-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Jordanian Company Logo */}
        <img 
          src="/silos logo.png" 
          alt="الشركة العامة الأردنية للصوامع والتموين"
          className="h-20 w-auto object-contain"
        />

        {/* iDEALCHiP Logo */}
        <img 
          src="/ideal chip logo.png" 
          alt="iDEALCHiP"
          className="h-20 w-auto object-contain"
        />
      </div>
    </div>
  );
};




export default CompanyLogos;
