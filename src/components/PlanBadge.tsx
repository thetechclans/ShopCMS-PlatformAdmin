import { Badge } from "@/components/ui/badge";
import { Crown, Star, Sparkles } from "lucide-react";

interface PlanBadgeProps {
  planType: 'basic' | 'silver' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

export const PlanBadge = ({ planType, size = 'md' }: PlanBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const configs = {
    basic: {
      label: 'Basic',
      icon: Sparkles,
      className: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    silver: {
      label: 'Silver',
      icon: Star,
      className: 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 border-slate-400',
    },
    gold: {
      label: 'Gold',
      icon: Crown,
      className: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-700',
    },
  };

  const config = configs[planType];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1 font-semibold`}>
      <Icon className={iconSize[size]} />
      {config.label}
    </Badge>
  );
};
