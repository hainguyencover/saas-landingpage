"use client";

import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n-context";
import { motion } from "framer-motion";

function RegisterPageContent() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side: Visual/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 text-white">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 mix-blend-overlay" />
                    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -ml-48 -mt-48" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -mr-48 -mb-48" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-24 w-full">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold text-white mb-12 group">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-xl">S</span>
                            </div>
                            <span>SalonPro</span>
                        </Link>

                        <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                            {t("register.branding_title_1")} <br />
                            <span className="text-indigo-400">{t("register.branding_title_2")}</span>.
                        </h1>

                        <ul className="space-y-6 mt-12">
                            {[
                                { title: t("register.feature_1_title"), desc: t("register.feature_1_desc") },
                                { title: t("register.feature_2_title"), desc: t("register.feature_2_desc") },
                                { title: t("register.feature_3_title"), desc: t("register.feature_3_desc") }
                            ].map((feature, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0 mt-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-100">{feature.title}</h4>
                                        <p className="text-sm text-slate-400">{feature.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                <div className="absolute bottom-12 left-12 right-12 z-10">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900" />
                            ))}
                        </div>
                        <p className="text-sm text-slate-300">
                            {t("register.joined_notice_1")} <span className="text-white font-bold">{t("register.joined_notice_2")}</span> {t("register.joined_notice_3")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-24 bg-white relative z-20">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <Link href="/" className="lg:hidden flex justify-center text-3xl font-bold text-indigo-600 mb-10">
                        SalonPro
                    </Link>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
                            {t("register.title")}
                        </h2>
                        <p className="text-slate-500">
                            {t("register.trial_notice")}
                        </p>
                    </div>

                    <Suspense fallback={<div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>}>
                        <RegisterForm />
                    </Suspense>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline-offset-4 hover:underline">
                            {t("login.title")}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return <RegisterPageContent />;
}
