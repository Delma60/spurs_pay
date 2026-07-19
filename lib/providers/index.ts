import type { PaymentProvider } from "./types";
import { SandboxProvider } from "./sandbox";
import { FlutterwaveProvider } from "./flutterwave";

// Chosen server-side from config — the customer/merchant never sees this.
export function resolveProvider(): PaymentProvider {
  switch ((process.env.PAY_PROVIDER ?? "sandbox").toLowerCase()) {
    case "flutterwave":
      return new FlutterwaveProvider();
    // case "paystack": return new PaystackProvider();
    default:
      return new SandboxProvider();
  }
}

export * from "./types";
