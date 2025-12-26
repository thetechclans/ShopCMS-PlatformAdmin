export type PlanType = "basic" | "silver" | "gold";

export type AnalyticsLevel = "none" | "standard" | "advanced";

export interface PlanLimits {
  maxProducts: number;
  maxCategories: number;
  maxCarouselSlides: number;
  maxStaticPages: number;
  maxImageSizeMb: number;
}

export interface PlanFeatureFlags {
  hasAnalytics: boolean;
  analyticsLevel: AnalyticsLevel;
  canAccessThemes: boolean;
  canAccessAdvancedFeatures: boolean;
}

export interface PlanDefinition {
  type: PlanType;
  label: string;
  description?: string;
  defaultLimits: PlanLimits;
  features: PlanFeatureFlags;
}

export const PLAN_ORDER: PlanType[] = ["basic", "silver", "gold"];

export const PLAN_DEFINITIONS: Record<PlanType, PlanDefinition> = {
  basic: {
    type: "basic",
    label: "Basic",
    description: "Starter plan with core storefront features.",
    defaultLimits: {
      maxProducts: 10,
      maxCategories: 5,
      maxCarouselSlides: 3,
      maxStaticPages: 5,
      maxImageSizeMb: 2,
    },
    features: {
      hasAnalytics: false,
      analyticsLevel: "none",
      canAccessThemes: false,
      canAccessAdvancedFeatures: false,
    },
  },
  silver: {
    type: "silver",
    label: "Silver",
    description: "Growing shops with more catalog capacity and standard analytics.",
    defaultLimits: {
      maxProducts: 50,
      maxCategories: 15,
      maxCarouselSlides: 10,
      maxStaticPages: 20,
      maxImageSizeMb: 5,
    },
    features: {
      hasAnalytics: true,
      analyticsLevel: "standard",
      canAccessThemes: false,
      canAccessAdvancedFeatures: true,
    },
  },
  gold: {
    type: "gold",
    label: "Gold",
    description: "High-volume shops with advanced customization and analytics.",
    defaultLimits: {
      maxProducts: 200,
      maxCategories: 50,
      maxCarouselSlides: 30,
      maxStaticPages: 100,
      maxImageSizeMb: 10,
    },
    features: {
      hasAnalytics: true,
      analyticsLevel: "advanced",
      canAccessThemes: true,
      canAccessAdvancedFeatures: true,
    },
  },
};

export const normalizePlanType = (planType?: string | null): PlanType => {
  if (planType === "silver" || planType === "gold") {
    return planType;
  }
  return "basic";
};

export const isAtLeastPlan = (currentPlan: PlanType, requiredPlan: PlanType): boolean => {
  return PLAN_ORDER.indexOf(currentPlan) >= PLAN_ORDER.indexOf(requiredPlan);
};

export const planSupportsAnalytics = (planType?: string | null): boolean => {
  const normalized = normalizePlanType(planType);
  return PLAN_DEFINITIONS[normalized].features.hasAnalytics;
};

export const getAnalyticsLevel = (planType?: string | null): AnalyticsLevel => {
  const normalized = normalizePlanType(planType);
  return PLAN_DEFINITIONS[normalized].features.analyticsLevel;
};

