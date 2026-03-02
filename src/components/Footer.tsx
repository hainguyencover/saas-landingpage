"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone, Github } from "lucide-react";
import { useTranslation } from "@/lib/i18n-context";

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/50" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:pt-24 lg:px-8">
                <div className="xl:grid xl:grid-cols-4 xl:gap-12">
                    {/* Brand Section */}
                    <div className="space-y-8 xl:col-span-1">
                        <Link href="/" className="inline-block">
                            <div className="relative h-10 w-36 sm:h-12 sm:w-48 brightness-0 invert opacity-90 transition-opacity hover:opacity-100 flex items-center">
                                <Image
                                    src="/assets/logo.png"
                                    alt="YoCheckIn"
                                    fill
                                    sizes="(max-width: 640px) 144px, 192px"
                                    className="object-contain"
                                    unoptimized
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.opacity = '0';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('.logo-fallback')) {
                                            const span = document.createElement('span');
                                            span.className = 'logo-fallback text-xl sm:text-2xl font-black text-white';
                                            span.innerText = 'YoCheckIn';
                                            parent.appendChild(span);
                                        }
                                    }}
                                />
                            </div>
                        </Link>
                        <p className="text-sm leading-7 text-slate-400 max-w-xs">
                            {t('footer.description')}
                        </p>
                        <div className="flex gap-5">
                            <Link href="#" className="hover:text-blue-500 transition-colors"><Facebook className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-blue-400 transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-slate-100 transition-colors"><Github className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-12">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">{t('footer.products')}</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    {['features', 'pricing', 'about'].map((item) => (
                                        <li key={item}>
                                            <Link href={`/#${item}`} className="text-sm hover:text-blue-500 transition-colors flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                {t(`nav.${item}`)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">{t('footer.support')}</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <Link href="#" className="text-sm hover:text-blue-500 transition-colors">{t('footer.user_guide')}</Link>
                                    </li>
                                    <li>
                                        <a href="https://app.yocheckin.com/contact-us" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-blue-500 transition-colors">
                                            {t("footer.contact")}
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-1 md:gap-8">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Liên hệ</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span className="text-sm">123 Đường ABC, Quận X, TP. Hồ Chí Minh</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span className="text-sm">+84 123 456 789</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-blue-500 shrink-0" />
                                        <span className="text-sm">support@yocheckin.com</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-16 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} YoCheckIn. {t('footer.rights')}
                    </p>
                    <div className="flex gap-8 text-xs text-slate-500">
                        <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
                        <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
