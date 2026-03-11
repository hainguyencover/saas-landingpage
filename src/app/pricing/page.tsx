import Link from "next/link";
import { fetchPlans } from "@/services/plan";
import { FRONTEND_URL } from "@/lib/constants";

const PLAN_ICONS: Record<string, string> = {
    BASIC: "/assets/img/icons/free.svg",
    STANDARD: "/assets/img/icons/dimond.svg",
    PREMIUM: "/assets/img/icons/crown.svg",
};

export default async function Pricing() {
    const plans = await fetchPlans();

    // Sort plans by price to ensure logical order
    const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

    return (
        <>
            {/* Start Page Heading */}
            <section
                className="cs_page_heading cs_bg_filed text-center cs_gray_bg_2 position-relative overflow-hidden"
                style={{ backgroundImage: "url(/assets/img/page-heading-bg.svg)" }}
            >
                <div className="container">
                    <h1 className="cs_fs_64 cs_bold cs_mb_8">Our Pricing</h1>
                    <ol className="breadcrumb cs_fs_18 cs_heading_font">
                        <li className="breadcrumb-item">
                            <Link aria-label="Back to home page link" href="/">
                                Home
                            </Link>
                        </li>
                        <li className="breadcrumb-item active">Pricing</li>
                    </ol>
                </div>
            </section>
            {/* End Page Heading */}

            {/* Start Pricing Section */}
            <section className="position-relative">
                <div className="cs_height_120 cs_height_lg_80"></div>
                <div className="container">
                    <div className="cs_section_heading cs_style_1 cs_center_column cs_mb_60 text-center">
                        <div className="cs_section_subtitle cs_fs_18 cs_heading_color cs_mb_22">
                            <img src="/assets/img/icons/star-1.svg" alt="Star icon" />
                            <span>Our Pricing</span>
                            <img src="/assets/img/icons/star-1.svg" alt="Star icon" />
                        </div>
                        <h2 className="cs_section_title cs_fs_48 cs_semibold cs_mb_20 text-capitalize">
                            Starter Plan For Everyone
                        </h2>
                        <p className="mb-0">
                            Choose the plan that fits your salon&apos;s needs.
                        </p>
                    </div>

                    <div className="row cs_row_gap_30 cs_gap_y_30 align-items-end justify-content-center">
                        {sortedPlans.map((plan, index) => {
                            // Map icon based on name or index
                            let icon = PLAN_ICONS[plan.name.toUpperCase()] || PLAN_ICONS.BASIC;
                            if (index === 1 && plans.length >= 2) icon = PLAN_ICONS.STANDARD;
                            if (index >= 2) icon = PLAN_ICONS.PREMIUM;

                            const isPopular = index === 1; // Middle one usually most popular

                            return (
                                <div className="col-lg-4" key={plan.id}>
                                    <div className={`cs_pricing_table cs_style_1 cs_gray_bg_2 cs_radius_30 position-relative ${isPopular ? 'cs_active' : ''}`}>
                                        {isPopular && (
                                            <>
                                                <div className="cs_pricing_table_shape position-absolute">
                                                    <img src="/assets/img/pricing-shape-1.svg" alt="Shape" />
                                                </div>
                                                <div className="cs_pricing_badge cs_accent_bg cs_medium cs_white_color text-center position-absolute">
                                                    Most Popular
                                                </div>
                                            </>
                                        )}
                                        <div className="cs_pricing_table_heading cs_mb_3">
                                            <h2 className="cs_plan_title cs_fs_24 cs_semibold mb-0">
                                                {plan.name}
                                            </h2>
                                            <span className="cs_plan_icon">
                                                <img
                                                    src={icon}
                                                    alt="Pricing plan icon"
                                                />
                                            </span>
                                        </div>
                                        <div className="cs_pricing_info cs_mb_20">
                                            <div className="cs_price cs_fs_48 cs_semibold cs_heading_color cs_heading_font cs_mb_4">
                                                €{plan.price} <small>/{plan.intervalUnit === 'MONTH' ? 'Month' : 'Year'}</small>
                                            </div>
                                            <p className="mb-0">
                                                {plan.description}
                                            </p>
                                        </div>
                                        <div className="cs_separator cs_mb_22"></div>
                                        <div className="cs_feature_wrapper cs_mb_30">
                                            <ul className="cs_pricing_feature_list cs_mp_0">
                                                {plan.features.filter(f => f.active).slice(0, 5).map(feature => (
                                                    <li key={feature.featureKey}>
                                                        <span className="cs_feature_icon cs_green_color">✔</span>
                                                        <span className="cs_feature_title cs_heading_color">
                                                            {feature.name}
                                                        </span>
                                                    </li>
                                                ))}
                                                {plan.limits.map(limit => (
                                                    <li key={limit.limitKey}>
                                                        <span className="cs_feature_icon cs_green_color">✔</span>
                                                        <span className="cs_feature_title cs_heading_color">
                                                            {limit.name}: {limit.maxValue || 'Unlimited'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Link
                                            href={`${FRONTEND_URL}/register?plan=${plan.id}`}
                                            className="cs_btn cs_style_1 cs_fs_14 cs_bold cs_heading_color text-uppercase w-100"
                                        >
                                            <span>Get Started</span>
                                            <span className="cs_btn_icon">
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {plans.length === 0 && (
                            <div className="col-12 text-center py-5">
                                <p className="text-muted">No plans available at the moment. Please check back later.</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="cs_height_120 cs_height_lg_80"></div>
            </section>
            {/* End Pricing Section */}
        </>
    );
}
