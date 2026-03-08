import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';

type Status = 'loading' | 'success' | 'error' | 'expired';

const STATE: Record<Status, { icon: JSX.Element; title: string; desc: string; accent: string }> = {
    loading: {
        icon: <Loader2 size={40} className="text-white/40 animate-spin" />,
        title: 'Confirming subscription…',
        desc: 'Please wait a moment.',
        accent: 'text-white',
    },
    success: {
        icon: <CheckCircle2 size={40} className="text-emerald-400" />,
        title: "You're confirmed!",
        desc: "Welcome to the Standor newsletter. You'll receive product updates, security advisories, and forensics deep-dives monthly.",
        accent: 'text-emerald-400',
    },
    expired: {
        icon: <Clock size={40} className="text-amber-400" />,
        title: 'Link expired',
        desc: 'This confirmation link has expired. Subscribe again from the footer to receive a fresh link.',
        accent: 'text-amber-400',
    },
    error: {
        icon: <XCircle size={40} className="text-red-400" />,
        title: 'Confirmation failed',
        desc: "We couldn't confirm your subscription. The link may be invalid or already used.",
        accent: 'text-red-400',
    },
};

export default function NewsletterConfirm() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [status, setStatus] = useState<Status>('loading');

    useEffect(() => {
        // status is set by the backend redirect: ?status=success|error|expired
        const s = params.get('status') as Status | null;
        if (s && STATE[s]) {
            setStatus(s);
        } else {
            // No status param — someone landed here directly, redirect home
            navigate('/', { replace: true });
        }
    }, [params, navigate]);

    const s = STATE[status];

    return (
        <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">{s.icon}</div>
                <h1 className={`text-2xl font-bold mb-3 ${s.accent}`}>{s.title}</h1>
                <p className="text-sm text-white/40 leading-relaxed mb-8">{s.desc}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-white/90 transition-colors"
                >
                    Back to home
                </button>
            </div>
        </div>
    );
}
