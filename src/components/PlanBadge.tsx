import { Badge } from "@/components/ui/badge";
import { Crown, Star, Sparkles } from "lucide-react";
import { PLAN_DEFINITIONS, type PlanType } from "@/lib/plans";

interface PlanBadgeProps {
  planType: PlanType;
  size?: "sm" | "md" | "lg";
}

export const PlanBadge = ({ planType, size = "md" }: PlanBadgeProps) => {
  const sizeClasses: Record<NonNullable<PlanBadgeProps["size"]>, string> = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSize: Record<NonNullable<PlanBadgeProps["size"]>, string> = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const label = PLAN_DEFINITIONS[planType].label;

  const iconConfig: Record<PlanType, { icon: typeof Sparkles; className: string }> = {
    basic: {
      icon: Sparkles,
      className: "bg-slate-100 text-slate-700 border-slate-300",
    },
    silver: {
      icon: Star,
      className: "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 border-slate-400",
    },
    gold: {
      icon: Crown,
      className: "bg-gradient-to-r from-amber-400 to-amber-600 text-white border-amber-700",
    },
  };

  const { icon: Icon, className } = iconConfig[planType];

  return (
    <Badge
      className={`${className} ${sizeClasses[size]} inline-flex items-center gap-1 font-semibold`}
    >
      <Icon className={iconSize[size]} />
      {label}
    </Badge>
  );
};
