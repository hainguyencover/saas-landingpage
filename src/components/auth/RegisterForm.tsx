"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";
import { motion } from "framer-motion";

import { API_URL } from "@/lib/constants";

export function RegisterForm() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const planId = searchParams.get("plan") || "plan_basic";
    const billingCycle = searchParams.get("cycle") || "MONTHLY";

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        country: "ES",
        password: "",
        address: "", // Add address field
        planId: planId,
        billingCycle: billingCycle
    });

    const getPhonePlaceholder = (country: string) => {
        const placeholders: Record<string, string> = {
            VN: "+84 123 456 789",
            US: "+1 123 456 7890",
            FR: "+33 6 12 34 56 78",
            DE: "+49 151 12345678",
            UK: "+44 7123 456789",
            ES: "+34 612 345 678",
            NL: "+31 6 12345678",
            CH: "+41 71 234 56 78",
            PL: "+48 512 345 678",
            CZ: "+420 612 345 678",
            SK: "+421 912 345 678",
            IT: "+39 345 678 9012"
        };
        return placeholders[country] || "+x xxxx xxxx";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // 1. Create Salon
            const res = await fetch(`${API_URL}/api/v1/salons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    country: formData.country,
                    address: formData.address,
                    password: formData.password,
                    status: "ACTIVE",
                    planId: formData.planId
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || t("register.errors.failed"));
            }

            const salon = (await res.json()).data;
            setRegisteredEmail(formData.email);
            if (salon?.id) {
                localStorage.setItem("salonId", salon.id.toString());
            }

            // 2. Handle Subscription/Login Flow
            // Refactored condition: if it's NOT a free plan, initiate subscription
            if (formData.planId && !formData.planId.toLowerCase().includes("free")) {
                try {
                    const subRes = await fetch(`${API_URL}/api/v1/subscriptions/subscribe`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            salonId: salon.id,
                            planId: formData.planId,
                            billingCycle: formData.billingCycle,
                            redirectUrl: window.location.origin + "/auth/mollie-return"
                        }),
                    });

                    if (subRes.ok) {
                        const subData = await subRes.json();
                        if (subData.checkoutUrl) {
                            window.location.href = subData.checkoutUrl;
                            return;
                        }
                    }
                    // If no checkout URL or sub failed, fallback to success message
                    setIsSuccess(true);
                } catch (subErr) {
                    console.error("Subscription initiation failed", subErr);
                    setIsSuccess(true);
                }
            } else {
                // Free plan success
                setIsSuccess(true);
            }

        } catch (err: any) {
            setError(err.message);
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
                        {t("register.success.title") || "Registration Successful!"}
                    </h2>
                    <p className="text-slate-600">
                        {t("register.success.message") || `Your salon has been created. Please log in to your dashboard to get started.`}
                    </p>
                    <p className="text-sm text-slate-500 font-mono bg-slate-50 py-2 rounded-lg">
                        {registeredEmail}
                    </p>
                </div>
                <div className="pt-4 space-y-3">
                    <button
                        onClick={() => router.push(`/auth/login?email=${encodeURIComponent(registeredEmail)}`)}
                        className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold shadow-xl hover:bg-slate-800 transition-all"
                    >
                        {t("register.success.login_button") || "Proceed to Login"}
                    </button>
                </div>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("register.salonName")}
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="My Luxury Salon"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-slate-200 py-3 px-4 text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm outline-none border"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("register.phone")}
                    </label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder={getPhonePlaceholder(formData.country)}
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-slate-200 py-3 px-4 text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm outline-none border"
                    />
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("register.country")}
                    </label>
                    <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-slate-200 py-3 px-4 text-slate-900 shadow-sm transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm outline-none border appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat uppercase"
                    >
                        <option value="ES">{t("register.countries.es")}</option>
                        <option value="FR">{t("register.countries.fr")}</option>
                        <option value="DE">{t("register.countries.de")}</option>
                        <option value="UK">{t("register.countries.uk")}</option>
                        <option value="IT">{t("register.countries.it")}</option>
                        <option value="NL">{t("register.countries.nl")}</option>
                        <option value="CH">{t("register.countries.ch")}</option>
                        <option value="PL">{t("register.countries.pl")}</option>
                        <option value="CZ">{t("register.countries.cz")}</option>
                        <option value="SK">{t("register.countries.sk")}</option>
                        <option value="VN">{t("register.countries.vn")}</option>
                        <option value="US">{t("register.countries.us")}</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("register.email")}
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="owner@salon.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-slate-200 py-3 px-4 text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm outline-none border"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("register.address") || "Address"}
                    </label>
                    <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        placeholder="123 Luxury St, Beverly Hills, CA"
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-slate-200 py-3 px-4 text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm outline-none border"
                    />
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("register.password")}
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-slate-200 py-3 px-4 text-slate-900 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm outline-none border"
                    />
                </div>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="relative overflow-hidden group flex w-full justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-900/10 disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
                >
                    <span className={isLoading ? "opacity-0" : "opacity-100"}>
                        {t("register.submit")}
                    </span>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin h-5 w-5" />
                        </div>
                    )}
                </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center px-6">
                By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
        </form>
    );
}
