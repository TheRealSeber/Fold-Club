/**
 * Tracking Platform Interface
 * Every ad platform adapter (Meta, Google, TikTok) implements this contract.
 */

export interface UserData {
  email?: string;
  ip?: string | null;
  userAgent?: string | null;
  fbc?: string | null;
  fbp?: string | null;
  fbclid?: string | null;
}

export interface ViewContentParams {
  eventId: string;
  productId: string;
  productName: string;
  value: number;
  currency: string;
  sourceUrl: string;
  userData: UserData;
}

export interface AddToCartParams {
  eventId: string;
  productId: string;
  productName: string;
  value: number;
  currency: string;
  sourceUrl: string;
  userData: UserData;
}

export interface CheckoutParams {
  eventId: string;
  productIds: string[];
  value: number;
  currency: string;
  numItems: number;
  sourceUrl: string;
  userData: UserData;
}

export interface PurchaseParams {
  eventId: string;
  productIds: string[];
  value: number;
  currency: string;
  numItems: number;
  sourceUrl: string;
  userData: UserData;
}

export interface TrackingPlatform {
  name: string;
  sendViewContent(params: ViewContentParams): Promise<void>;
  sendAddToCart(params: AddToCartParams): Promise<void>;
  sendInitiateCheckout(params: CheckoutParams): Promise<void>;
  sendPurchase(params: PurchaseParams): Promise<void>;
}
