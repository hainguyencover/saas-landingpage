"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronRight } from "lucide-react";
import { LanguageSelector } from "./LanguageSelector";
import { useTranslation } from "@/lib/i18n-context";
import { motion, AnimatePresence } from "framer-motion";
import { FRONTEND_URL } from "@/lib/constants";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInitial, setUserInitial] = useState("");
    const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    const { t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            if (token) {
                setIsLoggedIn(true);
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const sub = payload.sub || "U";
                    setUserInitial(sub.charAt(0).toUpperCase());
                } catch(e) {
                    setUserInitial("U");
                }
            } else {
                setIsLoggedIn(false);
            }
        };
        
        checkAuth();
        setMounted(true);
        window.addEventListener("storage", checkAuth);
        window.addEventListener("auth-changed", checkAuth);
        
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("auth-changed", checkAuth);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("salonId");
        setIsLoggedIn(false);
        setAuthDropdownOpen(false);
        window.dispatchEvent(new Event("auth-changed"));
    };

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/80 backdrop-blur-lg border-b border-slate-200/50 py-3 shadow-sm"
                : "bg-transparent py-5"
                }`}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1">
                    <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
                        <div className="relative h-8 w-28 sm:h-10 sm:w-40 lg:h-11 lg:w-44 overflow-hidden flex items-center">
                            <Image
                                src="/assets/logo.png"
                                alt="YoCheckIn"
                                fill
                                sizes="(max-width: 640px) 112px, (max-width: 1024px) 160px, 176px"
                                className="object-contain transition-transform duration-300 group-hover:scale-110"
                                priority
                                unoptimized
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.opacity = '0';
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector('.logo-fallback')) {
                                        const span = document.createElement('span');
                                        span.className = 'logo-fallback text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transform transition-transform group-hover:scale-105';
                                        span.innerText = 'YoCheckIn';
                                        parent.appendChild(span);
                                    }
                                }}
                            />
                        </div>
                    </Link>
                </div>

                <div className="flex lg:hidden items-center gap-4">
                    <LanguageSelector />
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Menu className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <div className="hidden lg:flex lg:gap-x-10 items-center">
                    {['pricing', 'about'].map((item) => (
                        <Link
                            key={item}
                            href={`/#${item}`}
                            className="text-sm font-medium leading-6 text-slate-600 hover:text-blue-600 transition-colors relative group"
                        >
                            {t(`nav.${item}`)}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-6 relative">
                    <LanguageSelector />
                    {mounted && (
                        !isLoggedIn ? (
                            <>
                                <Link href="/auth/login" className="text-sm font-semibold leading-6 text-slate-700 hover:text-blue-600 transition-colors">
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-blue-500/25 active:scale-95"
                                >
                                    <span className="relative flex items-center gap-2">
                                        {t('nav.register')}
                                        <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            </>
                        ) : (
                            <div className="relative">
                                <button
                                    onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                                    className="flex items-center justify-center h-10 w-10 overflow-hidden rounded-full bg-blue-100 border-2 border-blue-600 text-blue-700 font-bold hover:bg-blue-200 transition-colors shadow-sm"
                                >
                                    {userInitial}
                                </button>
                                
                                <AnimatePresence>
                                    {authDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-slate-900/5 focus:outline-none overflow-hidden"
                                        >
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                <a
                                                    href={FRONTEND_URL}
                                                    className="block px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors font-medium"
                                                    role="menuitem"
                                                >
                                                    Đến Dashboard
                                                </a>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 font-medium"
                                                    role="menuitem"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    )}
                    {!mounted && (
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-8 bg-slate-100 animate-pulse rounded-md" />
                            <div className="w-24 h-10 bg-blue-100 animate-pulse rounded-full" />
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <div className="lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-slate-900/10 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                                    <div className="relative h-8 w-32 flex items-center">
                                        <Image
                                            src="/assets/logo.png"
                                            alt="YoCheckIn"
                                            fill
                                            sizes="128px"
                                            className="object-contain"
                                            unoptimized
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.opacity = '0';
                                                const parent = target.parentElement;
                                                if (parent && !parent.querySelector('.logo-fallback')) {
                                                    const span = document.createElement('span');
                                                    span.className = 'logo-fallback text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent';
                                                    span.innerText = 'YoCheckIn';
                                                    parent.appendChild(span);
                                                }
                                            }}
                                        />
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    className="-m-2.5 rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span className="sr-only">Close menu</span>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="mt-10 flow-root">
                                <div className="-my-6 divide-y divide-slate-100">
                                    <div className="space-y-4 py-8">
                                        {['pricing', 'about'].map((item) => (
                                            <Link
                                                key={item}
                                                href={`/#${item}`}
                                                className="-mx-3 block rounded-xl px-4 py-3 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50 transition-all active:scale-[0.98]"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {t(`nav.${item}`)}
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="py-8 space-y-4">
                                        {mounted && (
                                            !isLoggedIn ? (
                                                <>
                                                    <Link
                                                        href="/auth/login"
                                                        className="-mx-3 block rounded-xl px-4 py-3 text-base font-semibold leading-7 text-slate-900 hover:bg-slate-50 transition-all"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {t('nav.login')}
                                                    </Link>
                                                    <Link
                                                        href="/auth/register"
                                                        className="block rounded-xl bg-blue-600 px-4 py-4 text-center text-base font-bold leading-7 text-white shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        {t('nav.register')}
                                                    </Link>
                                                </>
                                            ) : (
                                                <>
                                                    <a
                                                        href={FRONTEND_URL}
                                                        className="block rounded-xl bg-blue-600 px-4 py-4 text-center text-base font-bold leading-7 text-white shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                                                        onClick={() => setMobileMenuOpen(false)}
                                                    >
                                                        Đến Dashboard
                                                    </a>
                                                    <button
                                                        onClick={() => {
                                                            handleLogout();
                                                            setMobileMenuOpen(false);
                                                        }}
                                                        className="-mx-3 block w-full text-center rounded-xl px-4 py-3 text-base font-semibold leading-7 text-red-600 hover:bg-red-50 transition-all border border-red-100"
                                                    >
                                                        Đăng xuất
                                                    </button>
                                                </>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </header>
    );
}
