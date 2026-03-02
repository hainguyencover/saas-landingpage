"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

import { API_URL, FRONTEND_URL } from "@/lib/constants";
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 12; // 36 seconds total

/**
 * /mollie-return?orderId=...
 *
 * Mollie redirects here after payment checkout.
 * - For subscriptions: polls /api/v1/subscriptions/status?paymentId=...
 * - After success: redirect user to the salon admin dashboard
 */
function MollieReturnContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const type = searchParams.get("type") || "subscription"; // subscription | addon

    const [status, setStatus] = useState<"polling" | "success" | "failed" | "timeout">("polling");
    const [detail, setDetail] = useState("");
    const [pollCount, setPollCount] = useState(0);

    const pollStatus = useCallback(async () => {
        if (!orderId) {
            setStatus("failed");
            setDetail("URL không hợp lệ — thiếu orderId. Vui lòng liên hệ hỗ trợ.");
            return;
        }

        let count = 0;
        const interval = setInterval(async () => {
            count++;
            setPollCount(count);

            try {
                const endpoint = type === "addon"
                    ? `${API_URL}/api/v1/addon-orders/status?orderId=${orderId}`
                    : `${API_URL}/api/v1/subscriptions/status?paymentId=${orderId}`;

                const response = await fetch(endpoint, { credentials: "include" });

                if (response.ok) {
                    const data = await response.json();
                    const st = (data.status || "").toUpperCase();

                    if (st === "ACTIVE" || st === "PAID" || data.credited) {
                        clearInterval(interval);
                        setStatus("success");
                        setDetail(
                            type === "addon"
                                ? "Quota đã được ghi nhận vào tài khoản salon của bạn!"
                                : "Gói đăng ký của bạn đã được kích hoạt thành công!"
                        );
                        return;
                    }

                    if (["FAILED", "EXPIRED", "CANCELLED"].includes(st)) {
                        clearInterval(interval);
                        setStatus("failed");
                        setDetail(`Thanh toán không thành công (${st}). Thẻ của bạn chưa bị trừ tiền. Vui lòng thử lại.`);
                        return;
                    }
                }

                if (count >= MAX_POLLS) {
                    clearInterval(interval);
                    setStatus("timeout");
                    setDetail(
                        "Đang chờ xác nhận từ Mollie. Vui lòng kiểm tra email hoặc truy cập trang quản lý sau ít phút."
                    );
                }
            } catch (error) {
                console.error("[MollieReturn] Poll error:", error);
                if (count >= MAX_POLLS) {
                    clearInterval(interval);
                    setStatus("timeout");
                    setDetail("Không thể kết nối để xác minh thanh toán. Vui lòng kiểm tra trang quản lý.");
                }
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [orderId, type]);

    useEffect(() => {
        const cleanup = pollStatus();
        return () => { cleanup?.then(fn => fn?.()); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const statusConfig = {
        polling: {
            icon: <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />,
            bg: "bg-blue-50",
            title: "Đang xác minh thanh toán...",
            subtitle: "Chúng tôi đang xác nhận giao dịch với Mollie. Vui lòng không đóng cửa sổ này.",
        },
        success: {
            icon: <CheckCircle2 className="w-10 h-10 text-emerald-600" />,
            bg: "bg-emerald-50",
            title: "🎉 Thanh toán thành công!",
            subtitle: detail,
        },
        failed: {
            icon: <XCircle className="w-10 h-10 text-red-600" />,
            bg: "bg-red-50",
            title: "Thanh toán không thành công",
            subtitle: detail,
        },
        timeout: {
            icon: <RefreshCw className="w-10 h-10 text-amber-500" />,
            bg: "bg-amber-50",
            title: "Đang xử lý...",
            subtitle: detail,
        },
    };

    const cfg = statusConfig[status];

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl ring-1 ring-slate-100 text-center space-y-6">
                {/* Top accent */}
                <div className="h-1.5 w-20 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full" />

                {/* Icon */}
                <div className="flex justify-center">
                    <div className={`relative w-20 h-20 rounded-full ${cfg.bg} flex items-center justify-center transition-all duration-500`}>
                        {cfg.icon}
                        {status === "polling" && (
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-100 shadow-sm">
                                {pollCount}/{MAX_POLLS}
                            </div>
                        )}
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-2 px-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                        {cfg.title}
                    </h1>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {cfg.subtitle}
                    </p>
                    {orderId && (
                        <p className="text-xs text-slate-400 font-mono mt-2 bg-slate-50 py-1.5 px-3 rounded-lg inline-block">
                            Order: {orderId}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2.5">
                    {(status === "success" || status === "timeout") && (
                        <Link
                            href={`${FRONTEND_URL}/admin/my-subscription`}
                            className="flex items-center justify-center w-full bg-blue-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-blue-500 transition-all shadow-md shadow-blue-200 gap-2"
                        >
                            Đến trang quản lý
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}
                    {status === "failed" && (
                        <>
                            <button
                                onClick={() => window.history.back()}
                                className="flex items-center justify-center w-full bg-red-600 text-white rounded-xl py-3.5 text-sm font-semibold hover:bg-red-500 transition-all shadow-md shadow-red-200"
                            >
                                Thử lại
                            </button>
                            <Link
                                href="/"
                                className="flex items-center justify-center w-full border border-slate-200 text-slate-600 rounded-xl py-3 text-sm font-medium hover:bg-slate-50 transition-all"
                            >
                                Về trang chủ
                            </Link>
                        </>
                    )}
                    {status === "polling" && (
                        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider pt-2">
                            Vui lòng ở lại trang này
                        </p>
                    )}
                </div>

                {/* Footer note */}
                <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-4">
                    Thanh toán bảo mật được xử lý bởi{" "}
                    <span className="font-semibold text-slate-500">Mollie</span>
                </p>
            </div>
        </div>
    );
}

export default function MollieReturnPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <Suspense
                fallback={
                    <div className="min-h-[70vh] flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                }
            >
                <MollieReturnContent />
            </Suspense>
        </div>
    );
}
