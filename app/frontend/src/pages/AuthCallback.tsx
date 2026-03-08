import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import useStore from '../store/useStore';
import { authApi } from '../utils/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect');

    if (!token) {
      toast.error('Authentication failed');
      navigate('/login');
      return;
    }

    const completeAuth = async () => {
      try {
        localStorage.setItem('standor_access_token', token);

        const user = await authApi.me();

        setAuth(user, token, null);

        toast.success(`Welcome to Standor, ${user.name}`);

        navigate(redirect || '/dashboard');
      } catch (err) {
        console.error(err);

        toast.error('Failed to complete authentication');

        localStorage.removeItem('standor_access_token');

        navigate('/login');
      }
    };

    completeAuth();
  }, [searchParams, navigate, setAuth]);

  return (
    <div
      className="min-h-screen bg-ns-bg-900 flex items-center justify-center"
      data-testid="auth-callback-page"
    >
      <div className="text-center">
        <Loader2
          size={36}
          className="animate-spin text-white mx-auto mb-6"
        />

        <p className="text-sm text-ns-grey-500">
          Completing authentication...
        </p>

        <p className="text-xs text-ns-grey-600 mt-2 font-mono tracking-wide">
          standor.identity.callback
        </p>
      </div>
    </div>
  );
}
