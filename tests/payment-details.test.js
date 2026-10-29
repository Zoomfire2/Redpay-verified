import { describe, expect, it } from "bun:test";
import { currentPaymentReply, isPaymentDetailsReply, refreshPaymentHistory } from "../src/lib/payment-details";

describe("current payment details", () => {
  it("uses the latest saved account details when composing a reply", () => {
    const accountA = { bank: "Bank A", account_name: "Account A", account_number: "111", amount: 5000 };
    const accountB = { bank: "Bank B", account_name: "Account B", account_number: "222", amount: 6000 };
    const oldReply = currentPaymentReply(accountA);
    const latestReply = currentPaymentReply(accountB);

    expect(latestReply).toContain("Bank B");
    expect(latestReply).toContain("Account B");
    expect(latestReply).toContain("222");
    expect(latestReply).toContain("₦6,000");
    expect(latestReply).not.toContain("Bank A");
    expect(latestReply).not.toContain("111");
    expect(isPaymentDetailsReply(oldReply)).toBe(true);

    const history = refreshPaymentHistory([{ id: "reply-1", sender: "ai", body: oldReply }], accountB);
    expect(history[0]?.body).toBe(latestReply);
    expect(history[0]?.body).not.toContain("Account A");
  });

  it("does not invent payment details when no account is configured", () => {
    expect(currentPaymentReply(null)).toBe("Payment details are currently unavailable. Please contact customer support.");
  });
});