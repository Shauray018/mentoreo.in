"use client";

import { Wallet as WalletIcon, Plus, Receipt, PhoneCall, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function StudentWallet() {
  const { data: session } = useSession();
  const [balancePaise, setBalancePaise] = useState<number>(0);
  const [txs, setTxs] = useState<any[]>([]);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  useEffect(() => {
    const email = session?.user?.email;
    if (!email) return;
    fetch(`/api/student-wallet?email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        if (res.ok) return res.json();
        if (res.status === 404) {
          const create = await fetch("/api/student-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (create.ok) return create.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.balance_paise != null) setBalancePaise(Number(data.balance_paise));
      })
      .catch(() => {});

    fetch(`/api/student-wallet/transactions?email=${encodeURIComponent(email)}`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setTxs(data);
      })
      .catch(() => {});
  }, [session?.user?.email]);

  const transactions = useMemo(() => {
    if (txs.length === 0) return [];
    return txs.map((tx) => {
      const isCredit = tx.type === "credit";
      return {
        id: tx.id,
        type: tx.type,
        title: tx.source === "recharge" ? "Wallet Recharge" : "Mentor Session",
        date: new Date(tx.created_at).toLocaleString(),
        amount: `${isCredit ? "+" : "-"}₹${Math.abs(Number(tx.amount_paise)) / 100}`,
        details: tx.reference_id ? `Ref • ${tx.reference_id}` : (tx.source ?? ""),
        icon: isCredit ? Plus : (tx.source === "call" ? PhoneCall : MessageSquare),
      };
    });
  }, [txs]);

  const rechargePacks = [
    { amount: 100, extra: 0, popular: false },
    { amount: 200, extra: 20, popular: false },
    { amount: 500, extra: 100, popular: true },
    { amount: 1000, extra: 250, popular: false },
  ];

  const chosenPack = selectedPack == null ? null : rechargePacks[selectedPack];
  const customAmountNumber = Number(customAmount);
  const canUseCustom = Number.isFinite(customAmountNumber) && customAmountNumber >= 10;

  return (
    <div className="px-4 py-8 max-w-md md:max-w-4xl mx-auto min-h-screen bg-[#F8F9FA] md:bg-white font-nunito pb-24 md:pb-8">
      <header className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold text-[#111827]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Wallet
          </h2>
          <p className="text-[#6B7280] text-sm md:text-base mt-1 font-semibold">Recharge to talk to mentors</p>
        </div>
        <div className="bg-white p-3 rounded-full border border-[#E1D4FF] shadow-sm">
          <WalletIcon className="h-6 w-6 md:h-8 md:w-8 text-[#9758FF]" />
        </div>
      </header>

      <div className="md:grid md:grid-cols-2 md:gap-8">
        <div>
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#9758FF] to-[#7B3FE4] text-white p-6 md:p-8 rounded-[32px] shadow-lg shadow-[#9758FF]/30 relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-8 -mb-8 blur-lg"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <p className="text-white/80 text-sm md:text-base font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Secure Balance
              </p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl md:text-6xl font-black" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  ₹{(balancePaise / 100).toFixed(0)}
                </span>
              </div>
              <p className="text-white/80 text-sm md:text-base font-medium mb-4 md:mb-0">Approx. 90 mins of chat available</p>
            </div>
          </div>

          {/* Recharge Section */}
          <div className="mb-8">
            <h3 className="font-bold text-[#111827] text-lg md:text-xl mb-3 flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <Plus className="w-5 h-5 text-[#9758FF]" />
              Recharge Wallet
            </h3>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {rechargePacks.map((pack, i) => (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={i}
                  onClick={() => setSelectedPack(i)}
                  className={`relative bg-white border-2 rounded-2xl p-4 md:p-6 flex flex-col items-center text-center shadow-sm transition-all ${
                    selectedPack === i
                      ? "border-[#111827] shadow-md"
                      : pack.popular ? 'border-[#9758FF] shadow-[#9758FF]/10' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 bg-[#9758FF] text-white text-[10px] md:text-xs font-black uppercase tracking-wider px-2 py-0.5 md:px-3 md:py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <span className="text-xl md:text-2xl font-bold text-[#111827]">₹{pack.amount}</span>
                  {pack.extra > 0 ? (
                    <span className="text-[11px] md:text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-md mt-1 border border-green-100">
                      + ₹{pack.extra} Extra
                    </span>
                  ) : (
                    <span className="text-[11px] md:text-xs font-bold text-gray-400 mt-1">
                      Standard Pack
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="mt-4 bg-white border-2 border-dashed border-[#E1D4FF] rounded-2xl p-4">
              <p className="text-sm font-bold text-[#111827] mb-2">Custom amount</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={customAmount}
                    onChange={(e) => {
                      setSelectedPack(null);
                      setCustomAmount(e.target.value);
                    }}
                    placeholder="Enter amount (min ₹10)"
                    className="w-full px-4 py-3 rounded-xl border border-[#E1D4FF] focus:outline-none focus:ring-2 focus:ring-[#9758FF] text-sm font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!canUseCustom) return;
                    setSelectedPack(null);
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-bold ${
                    canUseCustom ? "bg-[#9758FF] text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  Use
                </button>
              </div>
            </div>
            <Button
              className="w-full bg-[#111827] hover:bg-gray-800 text-white rounded-2xl h-14 md:h-16 font-bold shadow-md mt-4 text-base md:text-lg"
              disabled={(selectedPack == null && !canUseCustom) || loadingPay}
              onClick={async () => {
                if (selectedPack == null && !canUseCustom) return;
                const email = session?.user?.email ?? "";
                if (!email) return;
                setLoadingPay(true);

                const amountRupees = selectedPack == null ? customAmountNumber : chosenPack!.amount;
                const creditRupees = selectedPack == null
                  ? customAmountNumber
                  : chosenPack!.amount + chosenPack!.extra;

                const amountPaise = Math.round(amountRupees * 100);
                const creditPaise = Math.round(creditRupees * 100);

                const res = await fetch("/api/payments/razorpay/order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount_paise: amountPaise, credit_paise: creditPaise, email }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                  setLoadingPay(false);
                  return;
                }

                const scriptLoaded = await new Promise<boolean>((resolve) => {
                  if (window.Razorpay) return resolve(true);
                  const script = document.createElement("script");
                  script.src = "https://checkout.razorpay.com/v1/checkout.js";
                  script.onload = () => resolve(true);
                  script.onerror = () => resolve(false);
                  document.body.appendChild(script);
                });

                if (!scriptLoaded || !window.Razorpay) {
                  setLoadingPay(false);
                  return;
                }

                const rzp = new window.Razorpay({
                  key: data.key_id,
                  amount: data.amount,
                  currency: data.currency,
                  order_id: data.order_id,
                  name: "Mentoreo",
                  description: "Wallet recharge",
                  prefill: {
                    email,
                  },
                  handler: () => {
                    setTimeout(async () => {
                      const w = await fetch(`/api/student-wallet?email=${encodeURIComponent(email)}`);
                      const wData = await w.json().catch(() => ({}));
                      if (w.ok && wData?.balance_paise != null) {
                        setBalancePaise(Number(wData.balance_paise));
                      }
                      const t = await fetch(`/api/student-wallet/transactions?email=${encodeURIComponent(email)}`);
                      const tData = await t.json().catch(() => []);
                      if (t.ok && Array.isArray(tData)) setTxs(tData);
                      setLoadingPay(false);
                    }, 1500);
                  },
                });
                rzp.open();
              }}
            >
              {loadingPay ? "Processing..." : "Proceed to Pay"}
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="md:mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-[#111827] text-lg md:text-xl flex items-center gap-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <Receipt className="w-5 h-5 text-[#9758FF]" />
              Deduction History
            </h3>
          </div>

          <div className="bg-white rounded-3xl p-2 border border-gray-100 shadow-sm md:shadow-md h-auto max-h-[600px] overflow-y-auto">
            {transactions.map((tx, i) => {
            const Icon = tx.icon;
            const isCredit = tx.type === 'credit';
            return (
              <div 
                key={tx.id} 
                className={`flex items-center justify-between p-4 ${i !== transactions.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${
                    isCredit ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#F8F5FF] text-[#9758FF]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-[#111827] text-sm truncate">{tx.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-[#6B7280]">{tx.date}</p>
                      <span className="text-gray-300 text-[10px]">•</span>
                      <p className="text-[10px] font-bold text-[#9758FF] truncate">{tx.details}</p>
                    </div>
                  </div>
                </div>
                <div className={`font-black text-sm whitespace-nowrap ${isCredit ? 'text-[#059669]' : 'text-[#111827]'}`}>
                  {tx.amount}
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-sm text-[#6B7280] font-semibold">
              No wallet activity yet.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
