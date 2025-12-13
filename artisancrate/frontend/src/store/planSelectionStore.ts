import { create } from "zustand";
import type { SubscriptionPlan } from "../types/subscription";

interface PlanSelectionState {
  selectedPlan: SubscriptionPlan | null;
  setSelectedPlan: (plan: SubscriptionPlan) => void;
  clearSelectedPlan: () => void;
}

export const usePlanSelectionStore = create<PlanSelectionState>((set) => ({
  selectedPlan: null,
  setSelectedPlan: (plan) => set({ selectedPlan: plan }),
  clearSelectedPlan: () => set({ selectedPlan: null }),
}));
