export type ProductType = "coffee" | "tea";

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  type: ProductType;
  variant?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
