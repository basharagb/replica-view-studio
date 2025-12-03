import { FastLabInterface } from "../components/FastLabInterface";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";

/**
 * Fast Live Reading Page - IT Team Testing Tool
 * 
 * This page is accessible only from Settings and is not shown in the sidebar.
 * It provides a fast 2-second interval testing mode for IT team to quickly
 * verify all silos without waiting for the standard 24-second interval.
 */
const FastLiveReading = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            Go to Live Readings
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
      
      {/* Fast Lab Interface */}
      <div style={{ border: '2px solid #eab308', padding: '10px', margin: '10px 0', borderRadius: '8px' }}>
        <FastLabInterface />
      </div>
    </div>
  );
};

export default FastLiveReading;
