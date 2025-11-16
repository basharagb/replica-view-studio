import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Clock, Calendar, Settings, Plus, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { 
  DailyScheduleConfig, 
  MultipleSchedulesConfig,
  formatScheduleTime, 
  getScheduleDescription, 
  NextScheduleInfo,
  getAllSchedulesDescription 
} from '../services/dailyScheduler';

interface MultipleScheduleControlsProps {
  schedulesConfig: MultipleSchedulesConfig;
  nextScheduleInfo: NextScheduleInfo;
  isScheduleActive: boolean;
  
  // Global controls
  onToggleGlobal: () => void;
  
  // Schedule management
  onAddSchedule: (schedule: Omit<DailyScheduleConfig, 'id' | 'createdAt'>) => void;
  onUpdateSchedule: (id: string, updates: Partial<DailyScheduleConfig>) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleSchedule: (id: string) => void;
  
  // Validation
  onValidateSchedule: (config: Partial<DailyScheduleConfig>) => string[];
  onCheckConflicts: (excludeId?: string) => string[];
  
  // Testing
  onForceCheck: () => boolean;
}

interface EditingSchedule extends Omit<DailyScheduleConfig, 'id' | 'createdAt'> {
  id?: string;
}

export const MultipleScheduleControls: React.FC<MultipleScheduleControlsProps> = ({
  schedulesConfig,
  nextScheduleInfo,
  isScheduleActive,
  onToggleGlobal,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
  onToggleSchedule,
  onValidateSchedule,
  onCheckConflicts,
  onForceCheck
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<EditingSchedule | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const formatTimeUntilNext = (minutes: number): string => {
    if (minutes < 0) return 'Disabled';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStartAddNew = () => {
    setEditingSchedule({
      name: '',
      enabled: true,
      startHour: 17, // 5:00 PM
      startMinute: 0,
      endHour: 18,   // 6:00 PM
      endMinute: 0,
      timezone: 'UTC+03:00'
    });
    setIsAddingNew(true);
    setValidationErrors([]);
  };

  const handleStartEdit = (schedule: DailyScheduleConfig) => {
    setEditingSchedule({ ...schedule });
    setIsAddingNew(false);
    setValidationErrors([]);
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    setIsAddingNew(false);
    setValidationErrors([]);
  };

  const handleSaveSchedule = () => {
    if (!editingSchedule) return;

    // Validate the schedule
    const errors = onValidateSchedule(editingSchedule);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Check for conflicts
    const conflicts = onCheckConflicts(editingSchedule.id);
    if (conflicts.length > 0) {
      setValidationErrors(conflicts);
      return;
    }

    if (isAddingNew) {
      // Add new schedule
      const { id, ...scheduleData } = editingSchedule;
      onAddSchedule(scheduleData);
    } else if (editingSchedule.id) {
      // Update existing schedule
      const { id, ...updates } = editingSchedule;
      onUpdateSchedule(id, updates);
    }

    handleCancelEdit();
  };

  const handleFieldChange = (field: keyof EditingSchedule, value: string | number | boolean) => {
    if (!editingSchedule) return;
    
    setEditingSchedule(prev => prev ? { ...prev, [field]: value } : null);
    setValidationErrors([]); // Clear errors when user makes changes
  };

  const handleDeleteSchedule = (scheduleId: string, scheduleName: string) => {
    if (confirm(`Are you sure you want to delete "${scheduleName}"?`)) {
      onDeleteSchedule(scheduleId);
    }
  };

  const enabledSchedules = schedulesConfig.schedules.filter(s => s.enabled);
  const totalSchedules = schedulesConfig.schedules.length;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <CardTitle className="text-sm">Daily Auto Schedules</CardTitle>
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
          {getAllSchedulesDescription(schedulesConfig)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Global Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isScheduleActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <Label className="text-sm">
              {isScheduleActive ? 'Active' : 'Inactive'} ({enabledSchedules.length}/{totalSchedules})
            </Label>
          </div>
          <Switch
            checked={schedulesConfig.globalEnabled}
            onCheckedChange={onToggleGlobal}
          />
        </div>

        {/* Next Event Info */}
        {schedulesConfig.globalEnabled && enabledSchedules.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              Next {nextScheduleInfo.nextEventType}: {nextScheduleInfo.nextEventTime}
              {nextScheduleInfo.scheduleName && (
                <span className="ml-1">({nextScheduleInfo.scheduleName})</span>
              )}
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
            {/* Schedule List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Schedules</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStartAddNew}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>

              {schedulesConfig.schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={() => onToggleSchedule(schedule.id)}
                    className="scale-75"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{schedule.name}</div>
                    <div className="text-muted-foreground">
                      {formatScheduleTime(schedule.startHour, schedule.startMinute)} - {formatScheduleTime(schedule.endHour, schedule.endMinute)}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStartEdit(schedule)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSchedule(schedule.id, schedule.name)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {schedulesConfig.schedules.length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No schedules configured
                </div>
              )}
            </div>

            {/* Add/Edit Schedule Form */}
            {editingSchedule && (
              <div className="space-y-3 p-3 bg-blue-50 rounded border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">
                    {isAddingNew ? 'Add New Schedule' : 'Edit Schedule'}
                  </Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>

                {/* Schedule Name */}
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={editingSchedule.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="text-xs h-7 mt-1"
                    placeholder="e.g., Evening Reading"
                  />
                </div>

                {/* Time Configuration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Start Time</Label>
                    <div className="flex gap-1 mt-1">
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={editingSchedule.startHour}
                        onChange={(e) => handleFieldChange('startHour', parseInt(e.target.value) || 0)}
                        className="text-xs h-7"
                        placeholder="HH"
                      />
                      <span className="text-xs self-center">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={editingSchedule.startMinute}
                        onChange={(e) => handleFieldChange('startMinute', parseInt(e.target.value) || 0)}
                        className="text-xs h-7"
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
                        value={editingSchedule.endHour}
                        onChange={(e) => handleFieldChange('endHour', parseInt(e.target.value) || 0)}
                        className="text-xs h-7"
                        placeholder="HH"
                      />
                      <span className="text-xs self-center">:</span>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={editingSchedule.endMinute}
                        onChange={(e) => handleFieldChange('endMinute', parseInt(e.target.value) || 0)}
                        className="text-xs h-7"
                        placeholder="MM"
                      />
                    </div>
                  </div>
                </div>

                {/* Enabled Toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingSchedule.enabled}
                    onCheckedChange={(checked) => handleFieldChange('enabled', checked)}
                    className="scale-75"
                  />
                  <Label className="text-xs">Enable this schedule</Label>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                {/* Save/Cancel Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveSchedule}
                    className="flex-1 text-xs h-7"
                  >
                    {isAddingNew ? 'Add Schedule' : 'Save Changes'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1 text-xs h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Test Button */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const shouldStart = onForceCheck();
                alert(shouldStart ? 'Schedules are active - would start auto readings' : 'No active schedules');
              }}
              className="w-full text-xs h-7"
            >
              Test Schedules
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
