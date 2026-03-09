"use client";

import { Calendar, Users, BarChart3, Scissors, MessageSquare, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n-context";

export default function Features() {
    const { t } = useTranslation();

    const features = [
        {
            name: t('features.items.appointments.name'),
            description: t('features.items.appointments.description'),
            icon: Calendar,
        },
        {
            name: t('features.items.staff.name'),
            description: t('features.items.staff.description'),
            icon: Users,
        },
        {
            name: t('features.items.revenue.name'),
            description: t('features.items.revenue.description'),
            icon: BarChart3,
        },
        {
            name: t('features.items.services.name'),
            description: t('features.items.services.description'),
            icon: Scissors,
        },
        {
            name: t('features.items.marketing.name'),
            description: t('features.items.marketing.description'),
            icon: MessageSquare,
        },
        {
            name: t('features.items.security.name'),
            description: t('features.items.security.description'),
            icon: ShieldCheck,
        },
    ];

    return (
        <div className="bg-slate-50 py-24 sm:py-32" id="features">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">{t('features.badge')}</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        {t('features.title')}
                    </p>
                    <p className="mt-6 text-lg leading-8 text-slate-600">
                        {t('features.subtitle')}
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="relative pl-16"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <dt className="text-base font-semibold leading-7 text-slate-900">
                                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                    </div>
                                    {feature.name}
                                </dt>
                                <dd className="mt-2 text-base leading-7 text-slate-600">{feature.description}</dd>
                            </motion.div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}
