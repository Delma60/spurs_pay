import { db, invoices, merchants, type Invoice } from "@/lib/db";
import { and, desc, eq, count } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { createPayment, getPayment } from "@/lib/payments";

async function nextNumber(merchantId: string): Promise<string> {
  const [row] = await db.select({ n: count() }).from(invoices).where(eq(invoices.merchantId, merchantId));
  const [m] = await db
    .select({ prefix: merchants.invoicePrefix, suffix: merchants.invoiceSuffix })
    .from(merchants).where(eq(merchants.id, merchantId)).limit(1);
  return (m?.prefix ?? "INV-") + String(Number(row?.n ?? 0) + 1).padStart(4, "0") + (m?.suffix ?? "");
}

export async function listInvoices(merchantId: string) {
  return db.select().from(invoices).where(eq(invoices.merchantId, merchantId)).orderBy(desc(invoices.createdAt)).limit(200);
}

export async function getInvoice(merchantId: string, id: string) {
  const [i] = await db.select().from(invoices).where(and(eq(invoices.id, id), eq(invoices.merchantId, merchantId))).limit(1);
  return i ?? null;
}

export async function createInvoice(merchantId: string, input: {
  customerEmail: string; amount: number; currency?: string; description?: string; dueDate?: Date | null;
}) {
  const [i] = await db
    .insert(invoices)
    .values({
      merchantId,
      number: await nextNumber(merchantId),
      customerEmail: input.customerEmail,
      amount: input.amount,
      currency: input.currency ?? "NGN",
      description: input.description ?? null,
      dueDate: input.dueDate ?? null,
    })
    .returning();
  return i;
}

/** Get (or create) the hosted checkout URL for an invoice. */
export async function invoicePayLink(invoice: Invoice): Promise<string> {
  let ref = invoice.payReference;
  if (!ref) {
    const payment = await createPayment(invoice.merchantId, {
      amount: invoice.amount,
      currency: invoice.currency,
      customerEmail: invoice.customerEmail,
      description: `Invoice ${invoice.number}`,
      reference: "inv_" + randomBytes(10).toString("hex"),
      metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
    });
    ref = payment.reference;
    await db.update(invoices).set({ payReference: ref }).where(eq(invoices.id, invoice.id));
  }
  return `${process.env.APP_URL}/pay/${ref}`;
}

/** Reconcile: if the linked payment succeeded, mark the invoice paid. */
export async function syncInvoice(invoice: Invoice): Promise<Invoice> {
  if (invoice.status !== "open" || !invoice.payReference) return invoice;
  const payment = await getPayment(invoice.payReference);
  if (payment?.status === "successful") {
    const [u] = await db.update(invoices).set({ status: "paid", paidAt: new Date() }).where(eq(invoices.id, invoice.id)).returning();
    return u ?? invoice;
  }
  return invoice;
}

export async function voidInvoice(merchantId: string, id: string) {
  await db.update(invoices).set({ status: "void" }).where(and(eq(invoices.id, id), eq(invoices.merchantId, merchantId), eq(invoices.status, "open")));
}
