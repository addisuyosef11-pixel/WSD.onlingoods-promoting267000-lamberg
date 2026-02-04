import React, { useState, useEffect } from 'react';
import { Check, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskProcessingSteps } from './TaskProcessingSteps';
import dswLogo from '@/assets/dsw-logo.png';

interface Task {
  id: string;
  title: string;
  price: number;
  profit: number;
  task_order: number;
}

interface TaskCardProps {
  task: Task;
  isCompleted: boolean;
  isActive: boolean;
  canAfford: boolean;
  onComplete: (profit: number) => void;
  onDepositRequest: () => void;
  autoStart?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isCompleted,
  isActive,
  canAfford,
  onComplete,
  onDepositRequest,
  autoStart = false,
}) => {
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const processingSteps = [
    { label: 'Asking Merchant...', completed: currentStep > 0, active: currentStep === 0 },
    { label: 'Check Status...', completed: currentStep > 1, active: currentStep === 1 },
    { label: 'Network Connection...', completed: currentStep > 2, active: currentStep === 2 },
  ];

  // Auto-start when autoStart prop is true and can afford
  useEffect(() => {
    if (autoStart && isActive && canAfford && !isCompleted && !hasAutoStarted && !processing) {
      setHasAutoStarted(true);
      setProcessing(true);
      setCurrentStep(0);
    }
  }, [autoStart, isActive, canAfford, isCompleted, hasAutoStarted, processing]);

  useEffect(() => {
    if (processing && currentStep < 3) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (processing && currentStep === 3) {
      setProcessing(false);
      onComplete(task.profit);
    }
  }, [processing, currentStep, task.profit, onComplete]);

  const handleStart = () => {
    if (!canAfford) {
      onDepositRequest();
      return;
    }
    setProcessing(true);
    setCurrentStep(0);
  };

  if (isCompleted) {
    return (
      <div className="p-4 rounded-2xl bg-green-50 border border-green-200 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img src={dswLogo} alt="Product" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">Task #{task.task_order}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-green-600">+{task.profit.toLocaleString()} ETB</span>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isActive) {
    return null; // Don't show inactive tasks
  }

  if (!canAfford && !processing) {
    return (
      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
            <img src={dswLogo} alt="Product" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
            </div>
            <p className="text-sm text-orange-600">Requires {task.price.toLocaleString()} ETB</p>
          </div>
        </div>
        <Button
          onClick={onDepositRequest}
          className="w-full primary-gradient text-primary-foreground font-semibold"
        >
          Deposit Now
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-card border border-primary/30 shadow-sm animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
          <img src={dswLogo} alt="Product" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{task.title}</h4>
          <p className="text-sm text-muted-foreground">Task #{task.task_order}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-primary">+{task.profit.toLocaleString()} ETB</span>
          <p className="text-xs text-muted-foreground">{task.price.toLocaleString()} ETB</p>
        </div>
      </div>

      {processing ? (
        <TaskProcessingSteps steps={processingSteps} />
      ) : (
        <div className="text-center text-sm text-muted-foreground">
          Processing will start automatically...
        </div>
      )}
    </div>
  );
};
