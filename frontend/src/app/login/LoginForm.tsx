"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, MessageSquareText, ShieldCheck, Smartphone } from "lucide-react";
import { isEmail, isMobile, showPhone, tenDigits, useCustomer } from "@/context/customer";
import { errorMessage } from "@/lib/http";
import { cn } from "@/lib/format";

type Channel = "SMS" | "EMAIL";

/** Only same-site paths, so ?next= can't send people elsewhere */
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/account");

const input =
  "w-full rounded-2xl border border-ink/15 bg-cream/50 px-4 py-3.5 outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10";

async function post(path: string, body: unknown) {
  const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(errorMessage(data));
  return data;
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const { customer, setCustomer } = useCustomer();
  const [channel, setChannel] = useState<Channel>("SMS");
  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);

  const target = channel === "SMS" ? phone : email.trim().toLowerCase();
  const shown = channel === "SMS" ? showPhone(phone) : target;

  // Already signed in: carry on
  useEffect(() => {
    if (customer) router.replace(next);
  }, [customer, next, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function sendCode() {
    setError("");
    if (name.trim().length < 2) return setError("Please enter your name");
    if (channel === "SMS") {
      if (phone.length !== 10) return setError("Enter your 10-digit mobile number");
      if (!isMobile(phone)) return setError("Enter a valid Indian mobile number (starts with 6, 7, 8 or 9)");
    } else if (!isEmail(email)) return setError("Enter a valid email address");
    setLoading(true);
    try {
      const data = await post("/api/customer/otp/send", { channel, target });
      setDevCode(data.devCode ?? null);
      setResendIn(data.resendAfter ?? 30);
      setCode("");
      setStep("code");
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the code");
    } finally {
      setLoading(false);
    }
  }

  async function verify(value = code) {
    setError("");
    if (!/^\d{6}$/.test(value)) return setError("Enter the 6-digit code");
    setLoading(true);
    try {
      const data = await post("/api/customer/otp/verify", { channel, target, code: value, name: name.trim() });
      setCustomer(data.customer);
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "That code didn't work");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-7 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.35)] ring-1 ring-ink/5 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand/10 blur-3xl" />

        <AnimatePresence mode="wait" initial={false}>
          {step === "details" ? (
            <motion.form
              key="details"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              onSubmit={(e) => {
                e.preventDefault();
                sendCode();
              }}
              className="relative"
            >
              <h1 className="font-display text-3xl">Sign in to order</h1>
              <p className="mt-1.5 text-sm text-ink-soft">We’ll send you a 6-digit code to verify it’s you. No password needed.</p>

              <div role="tablist" aria-label="Sign in with" className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-cream p-1 ring-1 ring-ink/5">
                {(
                  [
                    ["SMS", "Mobile number", Smartphone],
                    ["EMAIL", "Email", Mail],
                  ] as const
                ).map(([c, label, Icon]) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={channel === c}
                    onClick={() => {
                      setChannel(c);
                      setError("");
                    }}
                    className={cn(
                      "relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition",
                      channel === c ? "text-white" : "text-ink-soft hover:text-ink",
                    )}
                  >
                    {channel === c && <motion.span layoutId="login-tab" className="absolute inset-0 rounded-xl bg-brand shadow" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <Icon className="relative size-4" />
                    <span className="relative">{label}</span>
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-semibold">Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Full name" maxLength={80} required className={input} />
              </label>

              {channel === "SMS" ? (
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-sm font-semibold">Mobile number</span>
                  <span className="flex items-stretch overflow-hidden rounded-2xl border border-ink/15 bg-cream/50 transition focus-within:border-brand focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10">
                    <span className="grid place-items-center border-r border-ink/10 px-4 text-sm font-semibold text-ink-soft">+91</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(tenDigits(e.target.value))}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="10-digit number"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      title="10-digit mobile number"
                      required
                      className="w-full bg-transparent px-4 py-3.5 tabular-nums tracking-wider outline-none"
                    />
                  </span>
                  <span className={cn("mt-1 block text-xs", phone.length === 10 ? "text-green-700" : "text-ink-soft")}>{phone.length}/10 digits · code sent by SMS</span>
                </label>
              ) : (
                <label className="mt-4 block">
                  <span className="mb-1.5 block text-sm font-semibold">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    maxLength={120}
                    required
                    className={input}
                  />
                  <span className="mt-1 block text-xs text-ink-soft">Code sent to this inbox · check spam if you don’t see it</span>
                </label>
              )}

              {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}

              <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                {loading && <Loader2 className="size-5 animate-spin" />} Send code
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="code"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              onSubmit={(e) => {
                e.preventDefault();
                verify();
              }}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setError("");
                }}
                className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft hover:text-ink"
              >
                <ArrowLeft className="size-4" /> Change {channel === "SMS" ? "number" : "email"}
              </button>
              <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand">
                {channel === "SMS" ? <MessageSquareText className="size-6" /> : <Mail className="size-6" />}
              </span>
              <h1 className="mt-4 font-display text-3xl">Enter the code</h1>
              <p className="mt-1.5 text-sm text-ink-soft">
                Sent {channel === "SMS" ? "by SMS to" : "to"} <b className="break-all text-ink">{shown}</b>. It’s valid for 5 minutes.
              </p>
              {devCode && (
                <p className="mt-4 rounded-2xl bg-gold-soft px-4 py-3 text-sm text-ink">
                  Development mode — nothing was {channel === "SMS" ? "texted" : "emailed"}. Your code is <b className="font-mono tracking-widest">{devCode}</b>
                </p>
              )}
              <input
                ref={codeRef}
                value={code}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(v);
                  if (v.length === 6) verify(v);
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                aria-label="6-digit code"
                className={cn(input, "mt-6 text-center font-mono text-3xl tracking-[0.6em]")}
              />

              {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{error}</p>}

              <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60">
                {loading && <Loader2 className="size-5 animate-spin" />} Verify & continue
              </button>
              <p className="mt-4 text-center text-sm text-ink-soft">
                Didn’t get it?{" "}
                {resendIn > 0 ? (
                  <span>Resend in {resendIn}s</span>
                ) : (
                  <button type="button" onClick={sendCode} disabled={loading} className="font-semibold text-brand hover:underline">
                    Send a new code
                  </button>
                )}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-ink-soft">
        <ShieldCheck className="size-4 shrink-0 text-brand" /> Your number and email are only used for your orders and delivery updates.
      </p>
    </div>
  );
}
