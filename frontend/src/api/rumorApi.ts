import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Types
export interface Source {
    name: string;
    url: string;
}

export interface RumorRequest {
    text: string;
    channel?: string;
}

export interface RumorResponse {
    id: number;
    original_text: string;
    normalized_claim: string;
    verdict: 'True' | 'False' | 'Misleading' | 'Unverified';
    severity: 'Low' | 'Medium' | 'High';
    explanation: string;
    sources: Source[];
    channel: string;
    created_at: string;
}

export interface RumorListResponse {
    total: number;
    rumors: RumorResponse[];
}

// API functions
export const checkRumor = async (request: RumorRequest): Promise<RumorResponse> => {
    const response = await apiClient.post<RumorResponse>('/api/check_rumor', request);
    return response.data;
};

export const getRumors = async (
    limit: number = 50,
    offset: number = 0,
    verdict?: string,
    severity?: string
): Promise<RumorListResponse> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (verdict) params.append('verdict', verdict);
    if (severity) params.append('severity', severity);

    const response = await apiClient.get<RumorListResponse>('/api/rumors', { params });
    return response.data;
};

export const getRumorById = async (id: number): Promise<RumorResponse> => {
    const response = await apiClient.get<RumorResponse>(`/api/rumors/${id}`);
    return response.data;
};

export interface Stats {
    total_rumors: number;
    by_verdict: {
        True: number;
        False: number;
        Misleading: number;
        Unverified: number;
    };
    by_severity: {
        High: number;
        Medium: number;
        Low: number;
    };
}

export const getStats = async (): Promise<Stats> => {
    const response = await apiClient.get<Stats>('/api/stats');
    return response.data;
};

export default apiClient;
