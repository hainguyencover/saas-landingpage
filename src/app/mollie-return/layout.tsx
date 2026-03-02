// Clean layout for /mollie-return — no Navbar/Footer, just centered content
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Xác nhận thanh toán — SalonPro",
    description: "Đang xác minh giao dịch thanh toán Mollie của bạn.",
};

export default function MollieReturnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Override root layout to hide Navbar/Footer for this route
    return <>{children}</>;
}
