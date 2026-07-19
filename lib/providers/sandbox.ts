import { randomBytes, randomInt } from "node:crypto";
import type {
  PaymentProvider, PaymentMethod, ChargeInput, ChargeResult, MethodInput,
  TransferInstructions, UssdInstructions, NormalizedWebhook,
} from "./types";

// Works with zero credentials — simulates a processor so the whole Spurs Pay
// flow runs end-to-end. Test rules:
//   • card number ending 0000 is declined, otherwise approved
//   • bank_transfer / ussd stay pending until "confirmed" on the checkout
export class SandboxProvider implements PaymentProvider {
  readonly name = "sandbox";
  readonly supportedMethods: PaymentMethod[] = ["card", "bank_transfer", "ussd"];

  async charge(input: ChargeInput): Promise<ChargeResult> {
    await new Promise((r) => setTimeout(r, 300)); // pretend network latency
    const digits = input.card.number.replace(/\s+/g, "");
    const declined = digits.endsWith("0000");
    return {
      status: declined ? "failed" : "successful",
      providerReference: "sbx_" + randomBytes(8).toString("hex"),
      message: declined ? "Card declined (test)" : "Approved",
    };
  }

  async createTransfer(input: MethodInput): Promise<TransferInstructions> {
    const accountNumber = String(randomInt(1_000_000_000, 9_999_999_999)); // 10-digit NUBAN-like
    return {
      method: "bank_transfer",
      bankName: "Spurs Test Bank",
      accountNumber,
      accountName: "SPURS PAY / COLLECTIONS",
      amount: input.amount,
      currency: input.currency,
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(), // 30 min
    };
  }

  async createUssd(): Promise<UssdInstructions> {
    return { method: "ussd", code: `*000*${randomInt(1000, 9999)}#`, bankName: "Spurs Test Bank" };
  }

  verifyWebhook(): { valid: boolean; event?: NormalizedWebhook } {
    // Sandbox has no real processor callbacks; transfers/USSD are confirmed on-page.
    return { valid: false };
  }
}
