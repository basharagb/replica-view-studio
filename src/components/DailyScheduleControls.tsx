import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Clock, Calendar, Settings } from 'lucide-react';
import { DailyScheduleConfig, formatScheduleTime, getScheduleDescription, NextScheduleInfo } from '../services/dailyScheduler';

interface DailyScheduleControlsProps {
  scheduleConfig: DailyScheduleConfig;
  nextScheduleInfo: NextScheduleInfo;
  isScheduleActive: boolean;
  onUpdateConfig: (config: Partial<DailyScheduleConfig>) => void;
  onEnable: () => void;
  onDisable: () => void;
  onForceCheck: () => boolean;
}

export const DailyScheduleControls: React.FC<DailyScheduleControlsProps> = ({
  scheduleConfig,
  nextScheduleInfo,
  isScheduleActive,
  onUpdateConfig,
  onEnable,
  onDisable,
  onForceCheck
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempConfig, setTempConfig] = useState(scheduleConfig);

  const handleToggleSchedule = (enabled: boolean) => {
    if (enabled) {
      onEnable();
    } else {
      onDisable();
    }
  };

  const handleTimeChange = (field: keyof DailyScheduleConfig, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setTempConfig(prev => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSaveConfig = () => {
    // Validate configuration
    if (tempConfig.startHour < 0 || tempConfig.startHour > 23) {
      alert('Start hour must be between 0 and 23');
      return;
    }
    if (tempConfig.startMinute < 0 || tempConfig.startMinute > 59) {
      alert('Start minute must be between 0 and 59');
      return;
    }
    if (tempConfig.endHour < 0 || tempConfig.endHour > 23) {
      alert('End hour must be between 0 and 23');
      return;
    }
    if (tempConfig.endMinute < 0 || tempConfig.endMinute > 59) {
      alert('End minute must be between 0 and 59');
      return;
    }

    onUpdateConfig(tempConfig);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTempConfig(scheduleConfig);
    setIsExpanded(false);
  };

  const formatTimeUntilNext = (minutes: number): string => {
    if (minutes < 0) return 'Disabled';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <CardTitle className="text-sm">Daily Auto Schedule</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs">
          {getScheduleDescription(scheduleConfig)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Schedule Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isScheduleActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <Label className="text-sm">
              {isScheduleActive ? 'Active' : 'Inactive'}
            </Label>
          </div>
          <Switch
            checked={scheduleConfig.enabled}
            onCheckedChange={handleToggleSchedule}
          />
        </div>

        {/* Next Event Info */}
        {scheduleConfig.enabled && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Next {nextScheduleInfo.nextEventType}: {nextScheduleInfo.nextEventTime}
              {nextScheduleInfo.minutesUntilNext > 0 && (
                <span className="ml-1">
                  (in {formatTimeUntilNext(nextScheduleInfo.minutesUntilNext)})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Expanded Configuration */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Start Time</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={tempConfig.startHour}
                    onChange={(e) => handleTimeChange('startHour', e.target.value)}
                    className="text-xs h-8"
                    placeholder="HH"
                  />
                  <span className="text-xs self-center">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={tempConfig.startMinute}
                    onChange={(e) => handleTimeChange('startMinute', e.target.value)}
                    className="text-xs h-8"
                    placeholder="MM"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">End Time</Label>
                <div className="flex gap-1 mt-1">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={tempConfig.endHour}
                    onChange={(e) => handleTimeChange('endHour', e.target.value)}
                    className="text-xs h-8"
                    placeholder="HH"
                  />
                  <span className="text-xs self-center">:</span>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={tempConfig.endMinute}
                    onChange={(e) => handleTimeChange('endMinute', e.target.value)}
                    className="text-xs h-8"
                    placeholder="MM"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveConfig}
                className="flex-1 text-xs h-7"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="flex-1 text-xs h-7"
              >
                Cancel
              </Button>
            </div>

            {/* Test Button */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const shouldStart = onForceCheck();
                alert(shouldStart ? 'Schedule is active - would start auto readings' : 'Schedule is not active');
              }}
              className="w-full text-xs h-7"
            >
              Test Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
