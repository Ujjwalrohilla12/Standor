export const SUPPORTED_APPS = [
    'Google', 'YouTube', 'Facebook', 'Instagram', 'Twitter/X', 'Netflix', 'Amazon',
    'Microsoft', 'Apple', 'WhatsApp', 'Telegram', 'Discord', 'GitHub', 'Spotify',
    'Zoom', 'TikTok', 'Cloudflare', 'Twitch', 'Reddit', 'LinkedIn', 'Dropbox',
    'Slack', 'Snapchat', 'Pinterest', 'Tumblr', 'Adobe', 'Akamai',
];

export const APP_COLORS: Record<string, string> = {
    YouTube: '#ff0000', Google: '#4285f4', Facebook: '#1877f2', Instagram: '#e1306c',
    'Twitter/X': '#1da1f2', Netflix: '#e50914', Amazon: '#ff9900',
    Microsoft: '#00a1f1', Apple: '#a2aaad', Discord: '#5865f2', GitHub: '#6e5494',
    Spotify: '#1db954', Zoom: '#2d8cff', Telegram: '#26a5e4', TikTok: '#ff0050',
    Cloudflare: '#f6821f', WhatsApp: '#25d366', Twitch: '#9147ff', Reddit: '#ff4500',
    LinkedIn: '#0077b5', Dropbox: '#0061ff', Slack: '#4a154b',
    HTTPS: '#6366f1', QUIC: '#a78bfa', HTTP: '#f59e0b', DNS: '#14b8a6',
    SSH: '#22d3ee', TCP: '#475569', UDP: '#64748b', Unknown: '#374151',
};

export const TCP_STATE_STYLE: Record<string, { label: string; color: string }> = {
    CLASSIFIED: { label: 'CLSF', color: '#818cf8' },
    ESTABLISHED: { label: 'ESTAB', color: '#22c55e' },
    SYN_ONLY: { label: 'SYN', color: '#f59e0b' },
    CLOSED_FIN: { label: 'FIN', color: '#94a3b8' },
    CLOSED_RST: { label: 'RST', color: '#ef4444' },
    ACTIVE: { label: 'ACTV', color: '#6366f1' },
};

export const ACTION_STYLE: Record<string, { label: string; color: string }> = {
    FORWARD: { label: 'FWD', color: '#22c55e' },
    LOG_ONLY: { label: 'LOG', color: '#f59e0b' },
    DROP: { label: 'DROP', color: '#ef4444' },
};

export const ANOMALY_STYLE: Record<string, { label: string; color: string }> = {
    dns_long_name: { label: 'DNS Tunnel?', color: '#f59e0b' },
    high_entropy_nonstandard: { label: 'C2 Beacon?', color: '#f87171' },
    ip_fragment: { label: 'IP Fragment', color: '#fb923c' },
    ttl_anomaly: { label: 'TTL Anomaly', color: '#facc15' },
    tcp_zero_window: { label: 'Zero Window', color: '#f43f5e' },
    icmp_flood: { label: 'ICMP Flood', color: '#e879f9' },
};

export function fmtBytes(b: number): string {
    if (b < 1024) return `${b}B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)}K`;
    return `${(b / 1048576).toFixed(1)}M`;
}

export function detectPlatform(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('win')) return 'windows';
    if (ua.includes('mac')) return 'macos';
    return 'linux';
}
