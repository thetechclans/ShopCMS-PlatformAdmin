import { ReactNode } from "react";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { UpgradePrompt } from "./UpgradePrompt";
import { isAtLeastPlan, type PlanType } from "@/lib/plans";

interface FeatureGateProps {
  feature: string;
  requiredPlan: Exclude<PlanType, "basic">;
  children: ReactNode;
  description?: string;
}

export const FeatureGate = ({
  feature,
  requiredPlan,
  children,
  description,
}: FeatureGateProps) => {
  const { features, isLoading } = usePlanFeatures();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const hasAccess = isAtLeastPlan(features.planType, requiredPlan);

  if (!hasAccess) {
    return (
      <UpgradePrompt
        feature={feature}
        requiredPlan={requiredPlan}
        currentPlan={features.planType}
        description={description}
      />
    );
  }

  return <>{children}</>;
};
