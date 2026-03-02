"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { API_URL, FRONTEND_URL } from "@/lib/constants";
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10; // 30 seconds total

function MollieReturnContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [status, setStatus] = useState<"polling" | "success" | "failed" | "timeout">("polling");
    const [detail, setDetail] = useState("");
    const [pollCount, setPollCount] = useState(0);
    const [salonId, setSalonId] = useState<number | null>(null);

    const pollStatus = useCallback(async () => {
        if (!orderId) {
            setStatus("failed");
            setDetail("Invalid return URL — missing orderId.");
            return;
        }

        let count = 0;
        const interval = setInterval(async () => {
            count++;
            setPollCount(count);

            try {
                const response = await fetch(`${API_URL}/api/v1/subscriptions/status?paymentId=${orderId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === "ACTIVE") {
                        clearInterval(interval);
                        setStatus("success");
                        setDetail("Your subscription has been successfully activated!");
                        setSalonId(data.salonId);
                        return;
                    }
                }

                if (count >= MAX_POLLS) {
                    clearInterval(interval);
                    setStatus("timeout");
                    setDetail("Activation is taking longer than expected. Please check your dashboard later.");
                }
            } catch (error) {
                console.error("Failed to poll status", error);
                if (count >= MAX_POLLS) {
                    clearInterval(interval);
                    setStatus("timeout");
                    setDetail("Unable to verify status. Please check your dashboard.");
                }
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [orderId]);

    useEffect(() => {
        pollStatus();
    }, [pollStatus]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl ring-1 ring-slate-200 text-center space-y-6"
            >
                {/* Header Decoration */}
                <div className="h-1.5 w-24 bg-blue-600 mx-auto rounded-full mb-8" />

                {/* Progress / Status Icon */}
                <div className="flex justify-center">
                    {status === "polling" && (
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-100 shadow-sm">
                                {pollCount}/{MAX_POLLS}
                            </div>
                        </div>
                    )}
                    {status === "success" && (
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                    )}
                    {(status === "failed" || status === "timeout") && (
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                    )}
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {status === "polling" && "Verifying your purchase"}
                        {status === "success" && "Success! Welcome aboard"}
                        {status === "failed" && "Payment verification failed"}
                        {status === "timeout" && "Almost there..."}
                    </h1>
                    <p className="text-slate-600 text-sm leading-relaxed max-w-[280px] mx-auto">
                        {status === "polling" && "We're confirming your payment with Mollie. Just a moment branch..."}
                        {status === "success" && detail}
                        {status === "failed" && detail}
                        {status === "timeout" && detail}
                    </p>
                </div>

                {/* Actions */}
                <div className="pt-4 space-y-3">
                    {status === "success" && (
                        <Link
                            href={FRONTEND_URL}
                            className="flex items-center justify-center w-full bg-blue-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-200"
                        >
                            Go to Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    )}
                    {status === "timeout" && (
                        <Link
                            href={FRONTEND_URL}
                            className="flex items-center justify-center w-full bg-slate-900 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                        >
                            Check Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    )}
                    {status === "failed" && (
                        <Link
                            href="/"
                            className="flex items-center justify-center w-full border border-slate-200 text-slate-600 rounded-xl py-3.5 text-sm font-semibold hover:bg-slate-50 transition-all"
                        >
                            Back to Home
                        </Link>
                    )}
                    {status === "polling" && (
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                            Please stay on this page
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function MollieReturnPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 flex flex-col">
            <Suspense fallback={
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            }>
                <MollieReturnContent />
            </Suspense>

            <div className="mt-12 text-center">
                <p className="text-sm text-slate-400">
                    Secure payment processed by Mollie
                </p>
            </div>
        </div>
    );
}
