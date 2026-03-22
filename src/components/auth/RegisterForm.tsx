"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";
import { motion } from "framer-motion";

import { API_URL } from "@/lib/constants";

interface Plan {
    id: string;
    name: string;
    price: number;
    // ... other fields if needed
}

export function RegisterForm() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialPlanId = searchParams.get("plan");
    const billingCycle = searchParams.get("cycle") || "MONTHLY";

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [error, setError] = useState("");
    const [plans, setPlans] = useState<Plan[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        country: "ES",
        dialCode: "+34",
        password: "",
        address: "",
        planId: initialPlanId || "",
        billingCycle: billingCycle
    });

    // Fetch plans from backend
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch(`${API_URL}/api/v1/plans/active`);
                if (res.ok) {
                    const data = await res.json();
                    setPlans(data);

                    // If we have plans, validate or set default planId
                    if (data.length > 0) {
                        const planExists = data.some((p: Plan) => p.id === initialPlanId);
                        if (!planExists) {
                            // Default to first free plan or first plan
                            const freePlan = data.find((p: Plan) => p.price === 0);
                            setFormData(prev => ({ 
                                ...prev, 
                                planId: freePlan ? freePlan.id : data[0].id 
                            }));
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch plans", err);
            }
        };
        fetchPlans();
    }, [initialPlanId, API_URL]);

    const currentPlan = useMemo(() => {
        return plans.find(p => p.id === formData.planId);
    }, [plans, formData.planId]);

    const countries = [
        { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
        { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
        { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
        { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
        { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
        { code: "UK", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
        { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
        { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
        { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
        { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
        { code: "CZ", name: "Czech Republic", dial: "+420", flag: "🇨🇿" },
        { code: "SK", name: "Slovakia", dial: "+421", flag: "🇸🇰" }
    ];

    const currentCountry = countries.find(c => c.code === formData.country) || countries[2];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dial.includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCountrySelect = (countryCode: string) => {
        const country = countries.find(c => c.code === countryCode);
        setFormData({ ...formData, country: countryCode, dialCode: country?.dial || "+x" });
        setIsDropdownOpen(false);
        setSearchTerm("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
// ... [rest of handleSubmit code - keeping it as it was in my last successful update]

// No changes needed to handleSubmit, keeping the logic to combine dialCode + phone
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const fullPhone = `${formData.dialCode}${formData.phone.replace(/\D/g, "")}`;

        try {
            const res = await fetch(`${API_URL}/api/v1/salons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: fullPhone,
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

            // Always call subscribe to initialize backend records (Subscription, Quota)
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
                    // If it's a paid plan, redirect to Mollie
                    if (subData.checkoutUrl && subData.status === "PENDING") {
                        window.location.href = subData.checkoutUrl;
                        return;
                    }
                }
                setIsSuccess(true);
            } catch (subErr) {
                console.error("Subscription initiation failed", subErr);
                setIsSuccess(true);
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
// ... [success UI code remains same]
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

                <div className="md:col-span-2 relative">
                    <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        {t("register.phone")}
                    </label>
                    <div className="flex gap-2">
                        <div className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 px-3 h-[50px] bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 hover:bg-slate-100 hover:border-slate-300 active:scale-95 group shadow-sm"
                            >
                                <span className="text-xl leading-none">{currentCountry.flag}</span>
                                <span className="text-sm font-bold text-slate-700">{currentCountry.dial}</span>
                                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute left-0 top-full mt-2 w-72 max-h-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 overflow-hidden flex flex-col"
                                    >
                                        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                                            <input
                                                type="text"
                                                placeholder="Search country..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="overflow-y-auto py-2">
                                            {filteredCountries.length > 0 ? (
                                                filteredCountries.map((c) => (
                                                    <button
                                                        key={c.code}
                                                        type="button"
                                                        onClick={() => handleCountrySelect(c.code)}
                                                        className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group ${formData.country === c.code ? 'bg-indigo-50/50' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl leading-none">{c.flag}</span>
                                                            <span className={`text-sm ${formData.country === c.code ? 'font-bold text-indigo-600' : 'text-slate-700'}`}>
                                                                {c.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-mono text-slate-400 font-bold group-hover:text-indigo-500">
                                                            {c.dial}
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center">
                                                    <p className="text-sm text-slate-400 italic">No countries found</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </div>

                        <div className="flex-1">
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                placeholder="612 345 678"
                                value={formData.phone}
                                onChange={handleChange}
                                className="block w-full h-[50px] rounded-xl border-slate-200 px-4 text-slate-900 shadow-sm transition-all duration-200 font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm outline-none border"
                            />
                        </div>
                    </div>
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
