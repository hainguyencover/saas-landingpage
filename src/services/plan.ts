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

export const fetchPlans = async (): Promise<Plan[]> => {
    console.log('[fetchPlans] Fetching from:', `${API_URL}/api/v1/plans/active`);
    try {
        const response = await fetch(`${API_URL}/api/v1/plans/active`, {
            cache: 'no-store', // Không cache – luôn lấy data mới nhất
        });

        console.log('[fetchPlans] Response status:', response.status);

        if (!response.ok) {
            console.error('[fetchPlans] API error:', response.status, response.statusText);
            throw new Error(`Failed to fetch plans: ${response.status}`);
        }

        const data = await response.json();
        console.log('[fetchPlans] Plans received:', data?.length, 'items');
        return data;
    } catch (error) {
        console.error('[fetchPlans] Error:', error);
        return [];
    }
};

export const fetchAddons = async (): Promise<any[]> => {
    console.log('[fetchAddons] Fetching from:', `${API_URL}/api/v1/addon-packages/active`);
    try {
        const response = await fetch(`${API_URL}/api/v1/addon-packages/active`, {
            cache: 'no-store',
        });

        console.log('[fetchAddons] Response status:', response.status);

        if (!response.ok) {
            console.error('[fetchAddons] API error:', response.status, response.statusText);
            throw new Error(`Failed to fetch addons: ${response.status}`);
        }

        const data = await response.json();
        console.log('[fetchAddons] Addons received:', data?.length, 'items');
        return data;
    } catch (error) {
        console.error('[fetchAddons] Error:', error);
        return [];
    }
};
