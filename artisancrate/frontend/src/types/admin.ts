import type { User } from "./auth";
import type { UserSubscription } from "./subscription";
import type { Invoice } from "./invoice";
import type { Order } from "./order";

export interface AdminSubscription extends UserSubscription {
  user?: User;
}

export interface AdminInvoice extends Invoice {
  user?: User;
}

export interface AdminOrder extends Order {
  user?: User;
}
