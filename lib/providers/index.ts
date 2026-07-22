import type { PaymentProvider } from "./types";
import { SandboxProvider } from "./sandbox";
import { FlutterwaveProvider } from "./flutterwave";

/**
 * Pick the processor for a payment. **Mode decides, not global config:**
 *   - test  → always the sandbox (no real money can ever move)
 *   - live  → the configured real processor, falling back to sandbox until one
 *             is set up, so nothing breaks before go-live
 * The customer/merchant never learns which processor was used.
 */
export function resolveProvider(mode: "test" | "live" = "test"): PaymentProvider {
  if (mode === "test") return new SandboxProvider();

  switch ((process.env.PAY_PROVIDER ?? "").toLowerCase()) {
    case "flutterwave":
      return new FlutterwaveProvider();
    // case "paystack": return new PaystackProvider();
    default:
      return new SandboxProvider(); // no live processor configured yet
  }
}

export * from "./types";
