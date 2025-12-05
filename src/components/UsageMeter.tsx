import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface UsageMeterProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
}

export const UsageMeter = ({ label, current, max, unit = '' }: UsageMeterProps) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={`${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
          {current} / {max} {unit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={`h-2 ${isAtLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
      />
      {isAtLimit && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          <span>Limit reached. Consider upgrading your plan.</span>
        </div>
      )}
    </div>
  );
};
