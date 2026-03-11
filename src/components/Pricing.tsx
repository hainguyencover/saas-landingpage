"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { fetchPlans, fetchAddons, Plan } from "../services/plan";
import { useTranslation } from "@/lib/i18n-context";
import { Modal } from "./Modal";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Pricing() {
    const { t } = useTranslation();
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});
    const [addons, setAddons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [salonId, setSalonId] = useState<string | null>(null);

    const { API_URL } = require("@/lib/constants");

    const frequencies = [
        { value: "MONTH", label: t('pricing.frequencies.month'), priceSuffix: t('pricing.plan_suffix.month') },
        { value: "YEAR", label: t('pricing.frequencies.year'), priceSuffix: t('pricing.plan_suffix.year') },
    ];

    const [frequency, setFrequency] = useState(frequencies[0]);
    const [activeTab, setActiveTab] = useState<"plans" | "addons">("plans");
    const [selectedItem, setSelectedItem] = useState<{ type: 'plan' | 'addon', data: any } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const checkAuth = () => {
        const token = localStorage.getItem("token");
        const savedSalonId = localStorage.getItem("salonId");
        setIsAuthenticated(!!token);
        setSalonId(savedSalonId);
        return { token, salonId: savedSalonId };
    };

    const handleSelectPlan = (plan: Plan) => {
        checkAuth();
        setSelectedItem({ type: 'plan', data: plan });
        setIsModalOpen(true);
    };

    const handleSelectAddon = (addon: any) => {
        checkAuth();
        setSelectedItem({ type: 'addon', data: addon });
        setIsModalOpen(true);
    };

    const handleSubscribeDirectly = async (plan: Plan) => {
        const { token, salonId: currentSalonId } = checkAuth();

        if (!token) {
            router.push("/auth/login");
            return;
        }

        if (!currentSalonId) {
            setIsSubmitting(true);
            try {
                const profileRes = await fetch(`${API_URL}/api/v1/users/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    const fetchedSalonId = profile?.data?.salon?.salonId;
                    if (fetchedSalonId) {
                        localStorage.setItem("salonId", fetchedSalonId.toString());
                        setSalonId(fetchedSalonId.toString());
                        await initiateSubscription(token, fetchedSalonId.toString(), plan);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to recover salonId", err);
            }
            setIsSubmitting(false);
            alert("Could not find your Salon information. Please try logging in again.");
            return;
        }

        setIsSubmitting(true);
        await initiateSubscription(token, currentSalonId, plan);
    };

    const handlePurchaseAddonDirectly = async (addon: any) => {
        const { token, salonId: currentSalonId } = checkAuth();

        if (!token) {
            router.push("/auth/login");
            return;
        }

        if (!currentSalonId) {
            setIsSubmitting(true);
            try {
                const profileRes = await fetch(`${API_URL}/api/v1/users/me`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    const fetchedSalonId = profile?.data?.salon?.salonId;
                    if (fetchedSalonId) {
                        localStorage.setItem("salonId", fetchedSalonId.toString());
                        setSalonId(fetchedSalonId.toString());
                        await initiateAddonPurchase(token, fetchedSalonId.toString(), addon);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to recover salonId", err);
            }
            setIsSubmitting(false);
            alert("Could not find your Salon information. Please try logging in again.");
            return;
        }

        setIsSubmitting(true);
        await initiateAddonPurchase(token, currentSalonId, addon);
    };

    const initiateSubscription = async (token: string, currentSalonId: string, plan: Plan) => {
        try {
            const res = await fetch(`${API_URL}/api/v1/subscriptions/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    salonId: parseInt(currentSalonId),
                    planId: plan.id,
                    billingCycle: frequency.value === 'YEAR' ? 'YEARLY' : 'MONTHLY',
                    redirectUrl: window.location.origin + "/auth/mollie-return"
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    router.push("/auth/mollie-return?status=success");
                }
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to initiate subscription");
            }
        } catch (error) {
            console.error("Subscription failed", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const initiateAddonPurchase = async (token: string, currentSalonId: string, addon: any) => {
        try {
            const res = await fetch(`${API_URL}/api/v1/mollie/addons/purchase`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    salonId: parseInt(currentSalonId),
                    addonPackageId: addon.id,
                    redirectUrl: window.location.origin + "/auth/mollie-return"
                }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.checkoutUrl) {
                    window.location.href = data.checkoutUrl;
                } else {
                    alert("No payment URL received. Please try again.");
                }
            } else {
                const errData = await res.json();
                alert(errData.error || "Failed to initiate addon purchase");
            }
        } catch (error) {
            console.error("Addon purchase failed", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [plansData, addonsData] = await Promise.all([
                    fetchPlans(),
                    fetchAddons()
                ]);

                if (plansData && plansData.length > 0) {
                    setPlans(plansData);
                } else {
                    applyPlanFallback();
                }

                if (addonsData && addonsData.length > 0) {
                    setAddons(addonsData);
                } else {
                    applyAddonFallback();
                }
            } catch (error) {
                console.error("Failed to load data, using fallback", error);
                applyPlanFallback();
                applyAddonFallback();
            } finally {
                setIsLoading(false);
            }
        };

        const applyPlanFallback = () => {
            const fallbackPlans: Plan[] = [
                {
                    id: "tier-basic",
                    name: "Basic",
                    description: t('pricing.basic_desc'),
                    intervalCount: 1,
                    intervalUnit: "MONTH",
                    duration: "1 Month",
                    price: 10,
                    discount: 0,
                    tax: 0,
                    totalPrice: 10,
                    status: "ACTIVE",
                    features: [
                        { featureKey: "sms", name: t('pricing.quota.sms', { count: 100 }), active: true },
                        { featureKey: "whatsapp", name: t('pricing.quota.whatsapp', { count: 200 }), active: true },
                        { featureKey: "email", name: t('pricing.quota.email', { count: 500 }), active: true },
                        { featureKey: "f1", name: "1 chi nhánh", active: true },
                        { featureKey: "f2", name: "3 nhân viên", active: true }
                    ],
                    limits: []
                },
                {
                    id: "tier-pro",
                    name: "Pro",
                    description: t('pricing.pro_desc'),
                    intervalCount: 1,
                    intervalUnit: "MONTH",
                    duration: "1 Month",
                    price: 30,
                    discount: 0,
                    tax: 0,
                    totalPrice: 30,
                    status: "ACTIVE",
                    features: [
                        { featureKey: "sms", name: t('pricing.quota.sms', { count: 300 }), active: true },
                        { featureKey: "whatsapp", name: t('pricing.quota.whatsapp', { count: 500 }), active: true },
                        { featureKey: "email", name: t('pricing.quota.email', { count: 1000 }), active: true },
                        { featureKey: "f1", name: "1 chi nhánh", active: true },
                        { featureKey: "f2", name: "10 nhân viên", active: true },
                        { featureKey: "f4", name: "Marketing tự động", active: true }
                    ],
                    limits: []
                },
                {
                    id: "tier-enterprise",
                    name: "Enterprise",
                    description: t('pricing.enterprise_desc'),
                    intervalCount: 1,
                    intervalUnit: "MONTH",
                    duration: "1 Month",
                    price: 60,
                    discount: 0,
                    tax: 0,
                    totalPrice: 60,
                    status: "ACTIVE",
                    features: [
                        { featureKey: "sms", name: t('pricing.quota.sms', { count: 1000 }), active: true },
                        { featureKey: "whatsapp", name: t('pricing.quota.whatsapp', { count: 2000 }), active: true },
                        { featureKey: "email", name: t('pricing.quota.email', { count: 5000 }), active: true },
                        { featureKey: "f1", name: "Không giới hạn chi nhánh", active: true },
                        { featureKey: "f2", name: "Không giới hạn nhân viên", active: true },
                        { featureKey: "f5", name: "API Access", active: true }
                    ],
                    limits: []
                }
            ];
            setPlans(fallbackPlans);
        };

        const applyAddonFallback = () => {
            const fallbackAddons = [
                {
                    id: "addon-1k",
                    name: t('pricing.addon_1k_name', { name: "1.000 SMS" }),
                    price: 5,
                    description: t('pricing.addon_1k_desc'),
                },
                {
                    id: "addon-5k",
                    name: t('pricing.addon_5k_name', { name: "5.000 SMS" }),
                    price: 20,
                    description: t('pricing.addon_5k_desc'),
                },
                {
                    id: "addon-10k",
                    name: t('pricing.addon_10k_name', { name: "10.000 SMS" }),
                    price: 35,
                    description: t('pricing.addon_10k_desc'),
                },
            ];
            setAddons(fallbackAddons);
        };

        loadData();
    }, [t]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedSalonId = localStorage.getItem("salonId");
        setIsAuthenticated(!!token);
        setSalonId(savedSalonId);
    }, []);

    const filteredPlans = plans.filter(p => p.intervalUnit === frequency.value);

    return (
        <div className="bg-white py-24 sm:py-32" id="pricing">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">{t('pricing.badge')}</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {t('pricing.title')}
                    </p>
                </div>

                <div className="mt-16">
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-x-3">
                            <div className="h-px w-8 bg-blue-600"></div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                1. {t('pricing.tabs.software')}
                            </h3>
                            <div className="h-px w-8 bg-blue-600"></div>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{t('pricing.subscription_subtitle', { defaultValue: 'Thu tiền hàng tháng/năm' })}</p>

                        <div className="mt-8 grid grid-cols-2 gap-x-1 rounded-full bg-slate-100 p-1 ring-1 ring-inset ring-slate-200">
                            {frequencies.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setFrequency(option)}
                                    className={clsx(
                                        option.value === frequency.value
                                            ? "bg-white shadow"
                                            : "text-slate-500 hover:bg-slate-50",
                                        "cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold leading-5 text-gray-900 transition-all"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center mt-20">
                            <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
                        </div>
                    ) : (
                        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-7xl lg:grid-cols-4">
                            {filteredPlans.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 space-y-3">
                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <p className="text-lg font-medium text-slate-600">{t('pricing.no_plans', { frequency: frequency.label.toLowerCase() })}</p>
                                    <p className="text-sm">{t('pricing.contact_us')}</p>
                                </div>
                            ) : filteredPlans.map((tier) => {
                                const isPopular = tier.name.toLowerCase().includes('pro');
                                return (
                                    <motion.div
                                        key={tier.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className={clsx(
                                            isPopular ? "ring-2 ring-blue-600" : "ring-1 ring-slate-200",
                                            "rounded-3xl p-6 transition-all hover:shadow-lg bg-white flex flex-col"
                                        )}
                                    >
                                        <div className="flex items-center justify-between gap-x-4">
                                            <h4
                                                id={tier.id}
                                                className={clsx(
                                                    isPopular ? "text-blue-600" : "text-slate-900",
                                                    "text-lg font-semibold leading-8"
                                                )}
                                            >
                                                {tier.name}
                                            </h4>
                                            {isPopular && (
                                                <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-semibold leading-5 text-blue-600 uppercase">
                                                    {t('pricing.popular')}
                                                </p>
                                            )}
                                        </div>
                                        <p className="mt-2 text-xs leading-5 text-slate-600 min-h-[40px] line-clamp-2">{tier.description}</p>
                                        <p className="mt-6 flex items-baseline gap-x-1">
                                            <span className="text-3xl font-bold tracking-tight text-slate-900">
                                                €{tier.totalPrice}
                                            </span>
                                            <span className="text-sm font-semibold leading-6 text-slate-600">
                                                {frequency.priceSuffix}
                                            </span>
                                        </p>
                                        <button
                                            onClick={() => handleSelectPlan(tier)}
                                            className={clsx(
                                                isPopular
                                                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500"
                                                    : "text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300",
                                                "mt-6 block w-full rounded-full px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer transition-colors"
                                            )}
                                        >
                                            {isAuthenticated ? t('pricing.select_plan') : t('pricing.cta')}
                                        </button>
                                        <div className="mt-8 flex-grow">
                                            <ul role="list" className="space-y-2 text-sm leading-6 text-slate-600">
                                                {(expandedPlans[tier.id] ? tier.features : tier.features.slice(0, 6)).filter(f => f.active).map((feature) => (
                                                    <li key={feature.featureKey} className="flex gap-x-3 items-start">
                                                        <Check className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                                                        <span className="text-xs">{feature.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {tier.features.length > 6 && (
                                                <button
                                                    onClick={() => setExpandedPlans(prev => ({ ...prev, [tier.id]: !prev[tier.id] }))}
                                                    className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors cursor-pointer flex items-center gap-1"
                                                >
                                                    {expandedPlans[tier.id] ? t('pricing.view_less') : `+ ${tier.features.length - 6} ${t('pricing.view_more')}`}
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="mx-auto max-w-4xl mt-24 mb-16 h-px bg-slate-200"></div>

                <div className="mt-16 pb-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-x-3">
                            <div className="h-px w-8 bg-blue-600"></div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                                2. {t('pricing.tabs.sms')}
                            </h3>
                            <div className="h-px w-8 bg-blue-600"></div>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 max-w-xl">
                            {t('pricing.addon_subtitle', { defaultValue: 'Mua đứt theo nhu cầu, ví dụ mua thêm điểm hoặc tin nhắn SMS' })}
                        </p>
                    </div>

                    <div className="isolate mx-auto mt-12 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
                        {addons.map((addon) => (
                            <motion.div
                                key={addon.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3 }}
                                className="ring-1 ring-slate-200 rounded-3xl p-8 transition-all hover:shadow-xl hover:ring-blue-200 bg-white group flex flex-col"
                            >
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-semibold leading-8 text-slate-900 group-hover:text-blue-600 transition-colors">{addon.name}</h4>
                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <Check className="h-4 w-4 text-blue-600" />
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-slate-600 h-12 line-clamp-2">{addon.description}</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-slate-900">€{addon.price}</span>
                                    <span className="text-sm font-semibold leading-6 text-slate-600">/ {t('pricing.one_time_payment', { defaultValue: 'Gói' })}</span>
                                </p>
                                <button
                                    onClick={() => handleSelectAddon(addon)}
                                    className="mt-8 block w-full rounded-full bg-slate-50 px-3 py-2 text-center text-sm font-semibold leading-6 text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-blue-600 hover:text-white hover:ring-blue-600 transition-all cursor-pointer"
                                >
                                    {t('pricing.buy_now')}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem?.type === 'plan' ? t('pricing.modal.plan_selection') : t('pricing.modal.addon_selection')}
                footer={
                    <>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                            disabled={isSubmitting}
                        >
                            {t('common.cancel')}
                        </button>
                        {isAuthenticated ? (
                            <button
                                onClick={() => {
                                    if (selectedItem?.type === 'plan') {
                                        handleSubscribeDirectly(selectedItem.data);
                                    } else if (selectedItem?.type === 'addon') {
                                        handlePurchaseAddonDirectly(selectedItem.data);
                                    }
                                }}
                                disabled={isSubmitting || !selectedItem}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors min-w-[100px]"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    t('common.continue')
                                )}
                            </button>
                        ) : (
                            <Link
                                href={selectedItem?.type === 'plan'
                                    ? `/auth/register?plan=${selectedItem.data.id}&cycle=${frequency.value === 'YEAR' ? 'YEARLY' : 'MONTHLY'}`
                                    : `/auth/register?addon=${selectedItem?.data?.id}`}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors text-center"
                            >
                                {t('common.continue')}
                            </Link>
                        )}
                    </>
                }
            >
                {selectedItem?.type === 'plan' ? (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                            <p className="text-sm font-medium text-blue-800">{t('pricing.modal.you_selected')}</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{selectedItem.data.name}</p>
                            <p className="text-sm text-blue-700 mt-1">
                                €{selectedItem.data.totalPrice} / {frequency.label}
                            </p>
                        </div>
                        <p className="text-sm">
                            {isAuthenticated ? t('pricing.modal.subscribe_notice') : t('pricing.modal.plan_redirect_notice')}
                        </p>
                        <div className="space-y-4">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('pricing.modal.what_is_included')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                {selectedItem.data.features.filter((f: any) => f.active).map((f: any) => (
                                    <li key={f.featureKey} className="flex items-center gap-2 text-sm text-slate-600 list-none">
                                        <Check className="h-4 w-4 text-blue-500" />
                                        {f.name}
                                    </li>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                            <p className="text-sm font-medium text-blue-800">{t('pricing.modal.you_selected_addon')}</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{selectedItem?.data?.name}</p>
                            <p className="text-sm text-blue-700 mt-1">
                                €{selectedItem?.data?.price}
                            </p>
                        </div>
                        <p className="text-sm">
                            {t('pricing.modal.addon_redirect_notice')}
                        </p>
                    </div>
                )}
            </Modal>
        </div >
    );
}
