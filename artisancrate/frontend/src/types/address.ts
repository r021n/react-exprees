export interface UserAddress {
  id: number;
  userId: number;
  label: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  province: string;
  postalCode: string;
  county: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
