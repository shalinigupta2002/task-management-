import crypto from "crypto";
import config from "../config/index.js";
import ApiError from "../utils/ApiError.js";

/**
 * Payment provider adapter.
 * - INTERNAL: HMAC-signed checkout for local/dev and automated tests (server-verified).
 * - RAZORPAY: optional real provider when keys are configured.
 *
 * Frontend never decides amount/plan — those are locked on the onboarding record.
 */
class PaymentProvider {
  get mode() {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      return "RAZORPAY";
    }
    return "INTERNAL";
  }

  get secret() {
    return (
      process.env.PAYMENT_HMAC_SECRET
      || process.env.RAZORPAY_KEY_SECRET
      || config.jwt.secret
    );
  }

  createOrder({ orderId, amountInPaise, currency = "INR", notes = {} }) {
    if (this.mode === "RAZORPAY") {
      // Placeholder for real Razorpay Orders API integration.
      // Keys are present; still create a deterministic order handle for this scaffold.
      return {
        provider: "RAZORPAY",
        orderId,
        amountInPaise,
        currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        notes,
      };
    }

    const payload = `${orderId}|${amountInPaise}|${currency}`;
    const signature = crypto.createHmac("sha256", this.secret).update(payload).digest("hex");
    return {
      provider: "INTERNAL",
      orderId,
      amountInPaise,
      currency,
      checkoutToken: signature,
      notes,
    };
  }

  /**
   * Server-side payment verification.
   * INTERNAL: requires checkoutToken matching HMAC(orderId|amount|currency)
   * and paymentId starting with pay_
   */
  verifyPayment({
    orderId,
    amountInPaise,
    currency = "INR",
    paymentId,
    signature,
    checkoutToken,
  }) {
    if (!orderId || !paymentId) {
      throw ApiError.badRequest("Payment identifiers are required");
    }

    if (this.mode === "RAZORPAY") {
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
      if (!signature || signature !== expected) {
        throw ApiError.forbidden("Payment signature verification failed");
      }
      return { verified: true, provider: "RAZORPAY", paymentId, orderId };
    }

    const payload = `${orderId}|${amountInPaise}|${currency}`;
    const expected = crypto.createHmac("sha256", this.secret).update(payload).digest("hex");
    const token = checkoutToken || signature;
    if (!token || token !== expected) {
      throw ApiError.forbidden("Payment verification failed");
    }
    if (!String(paymentId).startsWith("pay_")) {
      throw ApiError.badRequest("Invalid payment id");
    }
    return { verified: true, provider: "INTERNAL", paymentId, orderId };
  }

  /** Simulate a successful INTERNAL payment for checkout UI (token still verified server-side). */
  simulateSuccessPayment({ orderId, amountInPaise, currency = "INR" }) {
    const order = this.createOrder({ orderId, amountInPaise, currency });
    return {
      paymentId: `pay_${crypto.randomBytes(8).toString("hex")}`,
      checkoutToken: order.checkoutToken,
      orderId,
    };
  }
}

export default new PaymentProvider();
