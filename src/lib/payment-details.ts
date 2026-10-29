export type CurrentPaymentSettings = {
  bank?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  amount?: number | string | null;
  instructions?: string | null;
  payment_mode?: string | null;
};

export function currentPaymentReply(pay: CurrentPaymentSettings | null | undefined): string {
  if (pay?.payment_mode === "flutterwave") {
    return `The current RPC price is ₦${Number(pay.amount ?? 0).toLocaleString()}. Complete payment through Flutterwave at https://flutterwave.com/pay/buyrpc. Keep your receipt; payment is not confirmed until support reviews it.`;
  }
  if (pay?.bank && pay.account_name && pay.account_number) {
    return `The current RPC price is ₦${Number(pay.amount ?? 0).toLocaleString()}. Bank: ${pay.bank}. Account name: ${pay.account_name}. Account number: ${pay.account_number}.${pay.instructions ? ` Instructions: ${pay.instructions}` : ""}`;
  }
  return "Payment details are currently unavailable. Please contact customer support.";
}

export function isPaymentDetailsReply(body: string): boolean {
  return /\b(bank|account\s+(?:number|name|details)|transfer\s+to|payment\s+details|flutterwave)\b/i.test(body);
}

export function refreshPaymentHistory<T extends { sender: string; body: string }>(
  messages: T[],
  pay: CurrentPaymentSettings | null | undefined,
) {
  return messages.map((message) =>
    message.sender === "ai" && isPaymentDetailsReply(message.body)
      ? { ...message, body: currentPaymentReply(pay) }
      : message,
  );
}