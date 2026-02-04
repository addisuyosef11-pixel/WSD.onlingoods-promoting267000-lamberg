import React from 'react';
import { Spinner } from './Spinner';
import { Check } from 'lucide-react';

interface Step {
  label: string;
  completed: boolean;
  active: boolean;
}

interface TaskProcessingStepsProps {
  steps: Step[];
}

export const TaskProcessingSteps: React.FC<TaskProcessingStepsProps> = ({ steps }) => {
  return (
    <div className="flex flex-col gap-3 py-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
            step.active ? 'bg-blue-50' : step.completed ? 'bg-green-50' : 'bg-muted/30'
          }`}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            {step.active ? (
              <Spinner size="sm" />
            ) : step.completed ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            )}
          </div>
          <span
            className={`text-sm font-medium ${
              step.active
                ? 'text-foreground'
                : step.completed
                ? 'text-green-600'
                : 'text-muted-foreground'
            }`}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};
