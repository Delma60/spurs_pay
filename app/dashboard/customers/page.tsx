import { requireMerchant } from "@/lib/auth";
import { listPayments } from "@/lib/payments";
import { formatAmount } from "@/lib/format";
import { Card, PageHeader } from "@/components/pay-ui";

interface Row { email: string; count: number; collected: number; last: number }

export default async function CustomersPage() {
  const user = await requireMerchant();
  const payments = await listPayments(user.sub, { limit: 500 });

  const map = new Map<string, Row>();
  for (const p of payments) {
    if (!p.customerEmail) continue;
    const r = map.get(p.customerEmail) ?? { email: p.customerEmail, count: 0, collected: 0, last: 0 };
    r.count++;
    if (p.status === "successful") r.collected += p.amount;
    r.last = Math.max(r.last, new Date(p.createdAt).getTime());
    map.set(p.customerEmail, r);
  }
  const customers = [...map.values()].sort((a, b) => b.collected - a.collected);

  return (
    <div>
      <PageHeader title="Customers" subtitle="Everyone who has paid you, and how much." />
      <Card>
        {customers.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-neutral-500">No customers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Payments</th>
                  <th className="px-5 py-3 font-medium">Collected</th>
                  <th className="px-5 py-3 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {customers.map((c) => (
                  <tr key={c.email}>
                    <td className="px-5 py-3 font-medium">{c.email}</td>
                    <td className="px-5 py-3 text-neutral-500">{c.count}</td>
                    <td className="px-5 py-3 font-semibold">{formatAmount(c.collected, "NGN")}</td>
                    <td className="px-5 py-3 text-neutral-500">{new Date(c.last).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
