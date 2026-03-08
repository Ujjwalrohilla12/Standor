import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export interface DpiResult {
    totalPackets: number;
    activeFlows: number;
    classificationRate: number;
    forwarded: number;
    dropped: number;
    analysedAt: string;
    appStats: { app: string; count: number; percent: number }[];
    detectedDomains: { domain: string; app: string; count: number }[];
    connectionStats?: any;
    topTalkers?: any[];
    portScans?: any[];
    protocolAnomalies?: any[];
    flowDetails?: any[];
    processingStats?: any;
}

export interface DpiFlowDetail {
    src: string;
    dst: string;
    srcPort: number;
    dstPort: number;
    app: string;
    bytesIn: number;
    bytesOut: number;
    durationMs: number;
    state: string;
    action: string;
    sni?: string;
    blockedByRule?: string;
}

export interface BlockingRules {
    blockedIPs: string[];
    blockedApps: string[];
    blockedDomains: string[];
    blockedPorts: number[];
}

export const dpiApi = {
    analyze: async (file: File, onProgress?: (e: any) => void) => {
        const form = new FormData();
        form.append("file", file);

        const res = await axios.post(`${API}/dpi/analyze`, form, {
            onUploadProgress: onProgress,
            headers: { "Content-Type": "multipart/form-data" }
        });

        return res.data;
    },

    analyzeWithRules: async (
        file: File,
        rules: any,
        onProgress?: (e: any) => void
    ) => {
        const form = new FormData();
        form.append("file", file);
        form.append("rules", JSON.stringify(rules));

        const res = await axios.post(`${API}/dpi/analyze-with-rules`, form, {
            onUploadProgress: onProgress,
            headers: { "Content-Type": "multipart/form-data" }
        });

        return res.data;
    },

    binaryUrl: (platform: string) =>
        `${API}/dpi/download/${platform}`,

    installScriptUrl: (platform: string) =>
        `${API}/dpi/install/${platform}`
};
