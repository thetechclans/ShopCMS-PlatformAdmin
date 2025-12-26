import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import { PlanBadge } from "./PlanBadge";
import { PLAN_DEFINITIONS, type PlanType } from "@/lib/plans";

interface UpgradePromptProps {
  feature: string;
  requiredPlan: Exclude<PlanType, "basic">;
  currentPlan: PlanType;
  description?: string;
}

export const UpgradePrompt = ({
  feature,
  requiredPlan,
  currentPlan,
  description,
}: UpgradePromptProps) => {
  const requiredPlanLabel = PLAN_DEFINITIONS[requiredPlan].label;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-lg">{feature}</CardTitle>
          <PlanBadge planType={requiredPlan} size="sm" />
        </div>
        <CardDescription>
          {description ||
            `This feature requires a ${requiredPlanLabel} plan or higher.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Your current plan:</span>
            <PlanBadge planType={currentPlan} size="sm" />
          </div>
          <Button className="w-full" variant="default">
            <Crown className="w-4 h-4 mr-2" />
            Contact Admin to Upgrade
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
