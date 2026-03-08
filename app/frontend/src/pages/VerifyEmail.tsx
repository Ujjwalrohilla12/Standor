import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { authApi } from '../utils/api';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                await authApi.verifyEmail(token, email);
                setStatus('success');
                toast.success('Email verified successfully');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.detail || 'Verification failed.');
            }
        };

        verify();
    }, [token, email]);

    return (
        <div className="min-h-screen bg-ns-bg-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-10 text-center">
                    {status === 'loading' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex justify-center">
                                <Loader2 size={48} className="text-ns-accent animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
                            <p className="text-neutral-500 text-sm">Please wait while we confirm your identity.</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-ns-success/10 border border-ns-success/20 flex items-center justify-center text-ns-success">
                                    <CheckCircle2 size={40} />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Your account is now fully activated. You can now access all of Standor's forensic features.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 group"
                            >
                                Sign In to Dashboard
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6 animate-in zoom-in-95 fade-in duration-500">
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-ns-error/10 border border-ns-error/20 flex items-center justify-center text-ns-error">
                                    <XCircle size={40} />
                                </div>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
                            <p className="text-neutral-500 text-sm leading-relaxed">
                                {message || 'The verification link is invalid or has expired.'}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    to="/login"
                                    className="py-3 px-4 border border-white/[0.08] text-white rounded-xl text-sm font-medium hover:bg-white/[0.04] transition-colors"
                                >
                                    Back to Login
                                </Link>
                                <button
                                    onClick={() => navigate('/register')}
                                    className="py-3 px-4 bg-white text-black rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
