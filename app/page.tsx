import type { ReactNode } from "react";
import {
  CreditCard, Landmark, Hash, ShieldCheck, Zap, Globe, Webhook, Code2, ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <SiteHeader />
      <Hero />
      <Methods />
      <Features />
      <Integration />
      <CtaBand />
      <SiteFooter />
    </div>
  );
}

/* --------------------------------- Header -------------------------------- */

function Brand() {
  return (
    <span className="flex items-center gap-2 font-semibold">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-600 text-xs text-white">S</span>
      Spurs Pay
    </span>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200/70 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="flex items-center gap-1 text-sm">
          <a href="#methods" className="hidden rounded-lg px-3 py-1.5 text-neutral-600 hover:text-neutral-900 sm:block dark:text-neutral-400 dark:hover:text-neutral-100">Methods</a>
          <a href="#developers" className="hidden rounded-lg px-3 py-1.5 text-neutral-600 hover:text-neutral-900 sm:block dark:text-neutral-400 dark:hover:text-neutral-100">Developers</a>
          <a href="/login" className="rounded-lg bg-indigo-600 px-3.5 py-1.5 font-medium text-white transition hover:bg-indigo-700">
            Merchant sign in
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero --------------------------------- */

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Now accepting card, bank transfer &amp; USSD
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Payments for everything you build
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
        One integration to accept money your customers&apos; way — cards, bank transfers and USSD — behind a
        clean API and a checkout that just works.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href="#developers" className="flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700">
          Start integrating <ArrowRight size={16} />
        </a>
        <a href="#methods" className="flex h-11 items-center justify-center rounded-lg border border-neutral-300 px-5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900">
          See payment methods
        </a>
      </div>
    </section>
  );
}

/* -------------------------------- Methods -------------------------------- */

function Methods() {
  const items = [
    { icon: CreditCard, name: "Card", desc: "Debit and credit cards, charged in seconds." },
    { icon: Landmark, name: "Bank transfer", desc: "A dedicated account number per payment." },
    { icon: Hash, name: "USSD", desc: "A dial code for customers without a card." },
  ];
  return (
    <section id="methods" className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((m) => (
          <div key={m.name} className="rounded-2xl border border-neutral-200 bg-neutral-50/60 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
              <m.icon size={19} />
            </span>
            <h3 className="mt-3 font-medium">{m.name}</h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{m.desc}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm text-neutral-500">Gift cards and crypto are on the way — same integration, no changes on your side.</p>
    </section>
  );
}

/* ------------------------------- Features -------------------------------- */

function Feature({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
        {icon}
      </span>
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">{children}</p>
    </div>
  );
}

function Features() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Everything a checkout needs</h2>
        <p className="mt-3 text-neutral-600 dark:text-neutral-400">
          Spurs Pay handles the hard parts so you can ship. You get a hosted checkout, one API, and reliable webhooks.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Feature icon={<Globe size={19} />} title="Hosted checkout">
          Send a customer to a branded, mobile-ready payment page. No PCI forms of your own to build.
        </Feature>
        <Feature icon={<Zap size={19} />} title="One integration">
          Add a payment method and it appears at checkout — your code never changes.
        </Feature>
        <Feature icon={<Webhook size={19} />} title="Signed webhooks">
          Get a signed event the moment a payment succeeds, so your backend stays in sync.
        </Feature>
        <Feature icon={<ShieldCheck size={19} />} title="Secure by default">
          Keys are hashed, secrets never leave the server, and every request is scoped to your account.
        </Feature>
        <Feature icon={<Code2 size={19} />} title="Clean REST API">
          Predictable JSON, one bearer key, and a status you can verify at any time.
        </Feature>
        <Feature icon={<CreditCard size={19} />} title="Your customers' way">
          Card, bank transfer or USSD — let people pay however they prefer.
        </Feature>
      </div>
    </section>
  );
}

/* ------------------------------ Integration ------------------------------ */

const SNIPPET = `// Create a payment, then send the customer to checkout
const res = await fetch("https://pay.spurs.com.ng/api/v1/payments", {
  method: "POST",
  headers: {
    Authorization: "Bearer sk_live_...",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 250000,          // in kobo (₦2,500.00)
    currency: "NGN",
    customerEmail: "buyer@example.com",
  }),
});

const { data } = await res.json();
redirect(data.checkoutUrl);   // hosted Spurs Pay checkout`;

function Integration() {
  return (
    <section id="developers" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">For developers</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Go live in a few lines</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-400">
            Create a payment with your secret key, redirect to the hosted checkout, and confirm the result with a
            signed webhook or a status check. That&apos;s the whole flow.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li className="flex gap-2"><span className="text-indigo-600 dark:text-indigo-400">→</span> Amounts in minor units, no floating-point surprises</li>
            <li className="flex gap-2"><span className="text-indigo-600 dark:text-indigo-400">→</span> One key, three tiers of access, scoped per account</li>
            <li className="flex gap-2"><span className="text-indigo-600 dark:text-indigo-400">→</span> Verify any payment by reference at any time</li>
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-neutral-800 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-neutral-300"><code>{SNIPPET}</code></pre>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- CTA band ------------------------------- */

function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="rounded-3xl bg-indigo-600 px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Start accepting payments today</h2>
        <p className="mx-auto mt-3 max-w-md text-indigo-100">
          Spin up an account, grab a key, and take your first payment in minutes.
        </p>
        <a href="/login" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-50">
          Get your API key <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

/* --------------------------------- Footer -------------------------------- */

function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-neutral-500 sm:flex-row sm:px-8">
        <Brand />
        <span>Part of Spurs Cloud · © {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
