"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n-context";
import { motion } from "framer-motion";

function LoginPageContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Left Side: Visual/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -ml-48 -mb-48" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-12 xl:px-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold text-white mb-12 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-xl">S</span>
                            </div>
                            <span>SalonPro</span>
                        </Link>

                        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
                            {t("login.branding_title_1")} <span className="text-blue-400">{t("login.branding_title_2")}</span> {t("login.branding_title_3")} <span className="text-purple-400">{t("login.branding_title_4")}</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
                            {t("login.branding_desc")}
                        </p>
                    </motion.div>
                </div>

                <div className="absolute bottom-12 left-12 right-12 z-10">
                    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                        <p className="text-slate-300 italic mb-4">
                            &quot;{t("login.testimonial_text")}&quot;
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600" />
                            <div>
                                <p className="text-white font-semibold text-sm">{t("login.testimonial_author")}</p>
                                <p className="text-slate-500 text-xs">{t("login.testimonial_role")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-24 bg-white shadow-2xl z-20">
                <div className="mx-auto w-full max-w-sm lg:max-w-md">
                    <Link href="/" className="lg:hidden flex justify-center text-3xl font-bold text-blue-600 mb-10">
                        SalonPro
                    </Link>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
                            {t("login.title")}
                        </h2>
                        <p className="text-slate-500 mb-6">
                            {t("login.welcome")}
                        </p>

                        {searchParams.get("registered") === "true" && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-50 border border-emerald-100 p-4 text-emerald-700 text-sm rounded-xl flex items-center gap-3 mb-6"
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="font-medium">
                                    {t("login.register_success") || "Account created successfully! Please sign in to continue."}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginPageContent />
        </Suspense>
    );
}
