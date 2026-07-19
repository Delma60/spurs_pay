import { db, issuedCards } from "@/lib/db";
import { and, desc, eq } from "drizzle-orm";
import { randomInt } from "node:crypto";

export async function listCards(merchantId: string) {
  return db.select().from(issuedCards).where(eq(issuedCards.merchantId, merchantId)).orderBy(desc(issuedCards.createdAt));
}

/** Issue a virtual card. Only the last 4 digits are ever stored. */
export async function issueCard(merchantId: string, label: string, initialBalance = 0) {
  const now = new Date();
  const [card] = await db
    .insert(issuedCards)
    .values({
      merchantId,
      label: label || "Virtual card",
      brand: "Spurs",
      last4: String(randomInt(0, 10000)).padStart(4, "0"),
      expMonth: String(now.getMonth() + 1).padStart(2, "0"),
      expYear: String((now.getFullYear() + 3) % 100),
      balance: initialBalance,
    })
    .returning();
  return card;
}

export async function setCardFrozen(merchantId: string, id: string, frozen: boolean) {
  await db.update(issuedCards).set({ frozen }).where(and(eq(issuedCards.id, id), eq(issuedCards.merchantId, merchantId)));
}
