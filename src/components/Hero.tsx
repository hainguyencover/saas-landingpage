"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n-context";

export function Hero() {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden bg-white pb-16 pt-32 md:pb-32 md:pt-48 lg:pt-32 xl:pb-36 xl:pt-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mx-auto max-w-2xl text-center lg:max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
                    >
                        {t('hero.title')} <br />
                        <span className="text-blue-600">{t('hero.subtitle')}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 text-lg leading-8 text-slate-600"
                    >
                        {t('hero.description')}
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-10 flex items-center justify-center gap-x-6"
                    >
                        <Link
                            href="/auth/register"
                            className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2"
                        >
                            {t('hero.cta_trial')} <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="#pricing" className="text-sm font-semibold leading-6 text-slate-900">
                            {t('hero.cta_pricing')} <span aria-hidden="true">→</span>
                        </Link>
                    </motion.div>

                    <div className="mt-10 flex justify-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" /> {t('hero.feature_trial')}
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" /> {t('hero.feature_no_card')}
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-500" /> {t('hero.feature_support')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Background Gradient */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20"></div>
        </section>
    );
}
