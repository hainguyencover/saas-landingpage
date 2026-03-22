"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-context";
import { motion } from "framer-motion";

import { API_URL, FRONTEND_URL } from "@/lib/constants";

export function LoginForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialEmail = searchParams.get("email") || "";

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: initialEmail,
        password: "",
        remember: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (!res.ok) {
                throw new Error(t("login.errors.invalid"));
            }

            const result = await res.json();
            const token = result?.data?.token || result?.token;

            if (token) {
                // Save token for registration/subscription context
                localStorage.setItem("token", token);

                // Fetch profile to get salonId
                try {
                    const profileRes = await fetch(`${API_URL}/api/v1/users/me`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    if (profileRes.ok) {
                        const profile = await profileRes.json();
                        const salonId = profile?.data?.salon?.salonId;
                        if (salonId) {
                            localStorage.setItem("salonId", salonId.toString());
                        }
                    }
                } catch (profileErr) {
                    console.error("Failed to fetch profile/salonId", profileErr);
                }

                setFormData({ email: "", password: "", remember: false });
                window.dispatchEvent(new Event("auth-changed"));
                setIsSuccess(true);
            } else {
                throw new Error(t("login.errors.failed"));
            }
        } catch (err: any) {
            setError(err.message || t("login.errors.failed"));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
            >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                    <div className="w-10 h-10 text-green-600">✓</div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t("login.success.title") || "Logged in!"}
                    </h2>
                    <p className="text-slate-600">
                        {t("login.success.message") || "Welcome back. Choose a plan to get started."}
                    </p>
                </div>
                <div className="pt-4">
                    <button
                        onClick={() => router.push("/#pricing")}
                        className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold shadow-xl hover:bg-slate-800 transition-all"
                    >
                        {t("login.success.button") || "Choose a Plan"}
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-100 p-4 text-red-600 text-sm rounded-xl flex items-center gap-3"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    {error}
                </motion.div>
            )}

            <div className="space-y-4">
                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("login.email")}
                    </label>
                    <div className="relative group">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="username"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full rounded-xl border-slate-200 py-3 px-4 text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm outline-none border"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("login.password")}
                    </label>
                    <div className="relative group">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="block w-full rounded-xl border-slate-200 py-3 pl-4 pr-12 text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:text-sm outline-none border"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-600 transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 group cursor-pointer group">
                    <input
                        name="remember"
                        type="checkbox"
                        checked={formData.remember}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {t("login.remember")}
                    </span>
                </label>
                <a
                    href={`${FRONTEND_URL}/forgot-password`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all"
                >
                    {t("login.forgot_password")}
                </a>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="relative overflow-hidden group flex w-full justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
            >
                <span className={isLoading ? "opacity-0" : "opacity-100"}>
                    {t("login.submit")}
                </span>
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="animate-spin h-5 w-5" />
                    </div>
                )}
            </button>

            {/* Register link */}
            <p className="text-center text-sm font-medium text-slate-500 pt-4">
                {t("login.no_account")}{" "}
                <Link href="/auth/register" className="font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all">
                    {t("login.register_now")}
                </Link>
            </p>
        </form>
    );
}
