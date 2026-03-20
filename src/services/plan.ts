export interface PlanFeature {
    featureKey: string;
    name: string;
    active: boolean;
}

export interface PlanLimit {
    limitKey: string;
    maxValue: number | null;
    name: string;
}

export interface Plan {
    id: string;
    name: string;
    description: string;
    intervalCount: number;
    intervalUnit: string;
    duration: string;
    price: number;
    discount: number;
    tax: number;
    totalPrice: number;
    status: string;
    features: PlanFeature[];
    limits: PlanLimit[];
}

import { API_URL as BASE_URL } from '../lib/constants';

const API_URL = BASE_URL.trim().replace(/\/$/, '');

// ── Sample Data for Fallback ──

const SAMPLE_PLANS: Plan[] = [
    {
        id: "tier-basic",
        name: "Basic",
        description: "Perfect for new salons starting their digital journey.",
        intervalCount: 1,
        intervalUnit: "MONTH",
        duration: "1 Month",
        price: 19,
        discount: 0,
        tax: 0,
        totalPrice: 19,
        status: "ACTIVE",
        features: [
            { featureKey: "sms", name: "100 SMS included", active: true },
            { featureKey: "f1", name: "1 Branch", active: true },
            { featureKey: "f2", name: "Up to 3 Staff Members", active: true }
        ],
        limits: []
    },
    {
        id: "tier-pro",
        name: "Pro",
        description: "Advanced features for growing businesses.",
        intervalCount: 1,
        intervalUnit: "MONTH",
        duration: "1 Month",
        price: 49,
        discount: 0,
        tax: 0,
        totalPrice: 49,
        status: "ACTIVE",
        features: [
            { featureKey: "sms", name: "500 SMS included", active: true },
            { featureKey: "f1", name: "3 Branches", active: true },
            { featureKey: "f2", name: "Unlimited Staff", active: true },
            { featureKey: "f4", name: "Marketing Automation", active: true }
        ],
        limits: []
    }
];

const SAMPLE_ADDONS: any[] = [
    {
        id: "addon-sms-1k",
        name: "1.000 SMS Package",
        price: 10,
        description: "Bundle of 1,000 extra SMS messages for your marketing."
    }
];

export const fetchPlans = async (): Promise<Plan[]> => {
    console.log('[fetchPlans] Fetching from:', `${API_URL}/api/v1/plans/active`);
    try {
        const response = await fetch(`${API_URL}/api/v1/plans/active`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            console.warn('[fetchPlans] API returned error, using sample data');
            return SAMPLE_PLANS;
        }

        const data = await response.json();
        return data && data.length > 0 ? data : SAMPLE_PLANS;
    } catch (error) {
        console.warn('[fetchPlans] Could not connect to API, using sample data');
        return SAMPLE_PLANS;
    }
};

export const fetchAddons = async (): Promise<any[]> => {
    console.log('[fetchAddons] Fetching from:', `${API_URL}/api/v1/addon-packages/active`);
    try {
        const response = await fetch(`${API_URL}/api/v1/addon-packages/active`, {
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            console.warn('[fetchAddons] API returned error, using sample data');
            return SAMPLE_ADDONS;
        }

        const data = await response.json();
        return data && data.length > 0 ? data : SAMPLE_ADDONS;
    } catch (error) {
        console.warn('[fetchAddons] Could not connect to API, using sample data');
        return SAMPLE_ADDONS;
    }
};
