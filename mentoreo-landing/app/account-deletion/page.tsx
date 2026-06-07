"use client";

import Navbar from "@/components/arc-navbar";
import { useState } from "react";

const steps = [
  {
    num: 1,
    title: "Send us an email",
    desc: (
      <>
        Email us at{" "}
        <a
          href="mailto:support@mentoreo.com"
          className="underline underline-offset-2 text-black"
        >
          support@mentoreo.com
        </a>{" "}
        with the subject{" "}
        <span className="font-medium text-black">&ldquo;Account Deletion Request&rdquo;</span>.
      </>
    ),
  },
  {
    num: 2,
    title: "Include your account details",
    desc: "In the email body, include the email address associated with your Mentoreo account so we can locate it.",
  },
  {
    num: 3,
    title: "We process your request",
    desc: "Our team will verify your identity and begin the deletion process. You will receive a confirmation email once it is complete.",
  },
  {
    num: 4,
    title: "Deletion complete",
    desc: (
      <>
        Account deletion is completed within{" "}
        <span className="font-medium text-black">30 days</span> of your request.
      </>
    ),
  },
];

const dataTypes = [
  {
    title: "Account info",
    desc: "Your name, email address, and profile details.",
    status: "deleted",
    label: "Permanently deleted",
  },
  {
    title: "Payment methods",
    desc: "Saved cards and billing details stored in our payment processor.",
    status: "deleted",
    label: "Permanently deleted",
  },
  {
    title: "Purchase history",
    desc: "Records of transactions and in-app purchases.",
    status: "retained",
    label: "Retained for 7 years",
  },
  {
    title: "Usage & activity",
    desc: "Session logs, in-app actions, and usage analytics.",
    status: "deleted",
    label: "Permanently deleted",
  },
];

export default function DeleteAccountPage() {
    const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-12 mt-18 space-y-12 ">

        {/* Hero */}
        <section className="space-y-3 pb-8 border-b border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Account Management
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Delete your account
          </h1>
          <p className="text-gray-500 text-[15px] leading-relaxed max-w-lg">
            You can permanently delete your Mentoreo account and associated data
            at any time. This action cannot be undone — please review the steps
            and data retention details below before proceeding.
          </p>
        </section>

        {/* Warning */}
        <div className="flex gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <span className="text-gray-400 text-sm mt-0.5">⚠</span>
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-medium text-black">This action is permanent.</span>{" "}
            Once deleted, you will lose access to all your data and it cannot be
            recovered.
          </p>
        </div>

        {/* Steps */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            How to request deletion
          </p>
          <ol className="space-y-0">
            {steps.map((step, i) => (
              <li key={step.num} className="flex gap-4">
                {/* Left: number + connector line */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() =>
                      setActiveStep(activeStep === step.num ? null : step.num)
                    }
                    className={`w-7 h-7 rounded-full border text-xs font-semibold flex-shrink-0 flex items-center justify-center transition-colors ${
                      activeStep === step.num
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-500 border-gray-300"
                    }`}
                  >
                    {step.num}
                  </button>
                  {i < steps.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 my-1" />
                  )}
                </div>

                {/* Right: content */}
                <div className={`pb-6 pt-0.5 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                  <p
                    className="text-sm font-medium text-black cursor-pointer"
                    onClick={() =>
                      setActiveStep(activeStep === step.num ? null : step.num)
                    }
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed mt-1">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Data section */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            What happens to your data
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dataTypes.map((item) => (
              <div
                key={item.title}
                className="border border-gray-200 rounded-lg p-4 space-y-2"
              >
                <p className="text-sm font-medium text-black">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${
                    item.status === "deleted"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {item.status === "deleted" ? "— " : "⏳ "}
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Purchase records are retained for 7 years to comply with applicable
            financial and tax regulations. This data is not used for any
            marketing or product purposes after deletion.
          </p>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">
            Need help?
          </p>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-gray-400 text-sm w-4">✉</span>
              <a
                href="mailto:support@mentoreo.com"
                className="text-sm text-black underline underline-offset-2"
              >
                support@mentoreo.com
              </a>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-gray-400 text-sm w-4">⏱</span>
              <span className="text-sm text-gray-600">
                We respond within 2 business days
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-gray-400 text-sm w-4">🏢</span>
              <span className="text-sm text-gray-600">
                Shauray — developer of Mentoreo
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-6 pt-6 pb-12 border-t border-gray-100 mt-4">
        <p className="text-xs text-gray-400">
          This page is provided by Shauray in compliance with Google Play&apos;s
          data deletion policy. Last updated: June 2026.
        </p>
      </footer>
    </div>
  );
}