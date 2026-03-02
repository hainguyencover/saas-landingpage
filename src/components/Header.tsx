import React from 'react';
import Link from 'next/link';
import { FRONTEND_URL } from '@/lib/constants';

export default function Header() {
    return (
        <header className="cs_site_header cs_style_1 cs_type_2 cs_sticky_header cs_white_color cs_heading_font">
            <div className="cs_main_header">
                <div className="container">
                    <div className="cs_main_header_in">
                        <div className="cs_main_header_left">
                            <Link className="cs_site_branding" href="/" aria-label="Home page link">
                                <img src="/assets/img/logo-2.svg" alt="Logo" />
                            </Link>
                        </div>
                        <div className="cs_main_header_center">
                            <div className="cs_nav">
                                <ul className="cs_nav_list">
                                    <li><Link href="/">Home</Link></li>
                                    <li><Link href="/about">About Us</Link></li>
                                    <li><Link href="/services">Services</Link></li>
                                    <li><Link href="/pricing">Pricing</Link></li>
                                    <li><Link href="/contact">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="cs_main_header_right">
                            <Link
                                href={`${FRONTEND_URL}/login`}
                                className="cs_btn cs_style_1 cs_theme_bg_4 cs_fs_14 cs_bold cs_heading_color text-uppercase bg-white text-black px-4 py-2 rounded"
                            >
                                <span>Login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
