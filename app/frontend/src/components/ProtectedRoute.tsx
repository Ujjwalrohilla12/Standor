import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode, useEffect, useState } from 'react';
import useStore from '../store/useStore';
import api from '../lib/api';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, token, setAuth, logout } = useStore();
  const location = useLocation();
  const [checking, setChecking] = useState(!user && !!token);

  useEffect(() => {
    if (!user && token) {
      api.get('/auth/me')
        .then(({ data }) => {
          // Backend returns { user: { _id, email, name, role, ... } }
          const u = data.user ?? data;
          setAuth({
            id: u._id ?? u.id,
            _id: u._id ?? u.id,
            email: u.email,
            name: u.name,
            role: u.role ?? 'USER',
            avatar: u.avatar,
            emailVerified: u.emailVerified,
            mfaEnabled: u.mfaEnabled ?? false,
          }, token);
          setChecking(false);
        })
        .catch(() => {
          logout();
          setChecking(false);
        });
    } else {
      setChecking(false);
    }
  }, [user, token, setAuth, logout]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-widest">
            Authenticating
          </span>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
