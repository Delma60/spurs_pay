// The contract every payment provider implements. Everything above this line
// (API, checkout, webhooks) is Spurs-branded and provider-agnostic — customers
// and merchants never learn which processor actually moved the money.

export type PaymentMethod = "card" | "bank_transfer" | "ussd";

export interface Card {
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  name?: string;
}

/** Common fields for initializing any payment method. */
export interface MethodInput {
  amount: number; // minor units (kobo/cents)
  currency: string;
  reference: string; // Spurs reference
  customerEmail?: string;
}

export interface ChargeInput extends MethodInput {
  card: Card;
}

export interface ChargeResult {
  status: "successful" | "failed";
  providerReference: string;
  message?: string;
}

/** Bank-transfer instructions shown to the customer (they settle asynchronously). */
export interface TransferInstructions {
  method: "bank_transfer";
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  currency: string;
  expiresAt: string; // ISO
}

/** USSD instructions shown to the customer. */
export interface UssdInstructions {
  method: "ussd";
  code: string; // e.g. *000*1234#
  bankName: string;
}

export type Instructions = TransferInstructions | UssdInstructions;

export interface NormalizedWebhook {
  providerReference?: string;
  reference?: string;
  status: "successful" | "failed";
}

export interface PaymentProvider {
  readonly name: string;
  /** Which methods this provider offers. The checkout only shows these. */
  readonly supportedMethods: PaymentMethod[];
  /** Charge a card synchronously. Runs server-side; provider stays hidden. */
  charge(input: ChargeInput): Promise<ChargeResult>;
  /** Create bank-transfer instructions. Payment settles later via webhook. */
  createTransfer?(input: MethodInput): Promise<TransferInstructions>;
  /** Create USSD instructions. Payment settles later via webhook. */
  createUssd?(input: MethodInput): Promise<UssdInstructions>;
  /** Verify an inbound provider webhook and normalize it to a Spurs event. */
  verifyWebhook(rawBody: string, headers: Headers): { valid: boolean; event?: NormalizedWebhook };
}
