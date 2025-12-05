import { ReactNode } from "react";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureGateProps {
  feature: string;
  requiredPlan: 'silver' | 'gold';
  children: ReactNode;
  description?: string;
}

export const FeatureGate = ({ 
  feature, 
  requiredPlan, 
  children,
  description 
}: FeatureGateProps) => {
  const { features, isLoading } = usePlanFeatures();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const hasAccess = 
    (requiredPlan === 'silver' && (features.planType === 'silver' || features.planType === 'gold')) ||
    (requiredPlan === 'gold' && features.planType === 'gold');

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
