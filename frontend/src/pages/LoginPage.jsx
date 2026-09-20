import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    }
  };

  const handleFillDemoUser = () => {
    setEmail('user@shopsphere.com');
    setPassword('User@123');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@shopsphere.com');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign In To ShopSphere</h1>
          <p className="text-xs text-gray-500">Access your saved wishlist, order history, and exclusive coupons</p>
        </div>

        {/* Demo Helper Banner */}
        <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/40 text-xs space-y-2">
          <div className="font-extrabold text-brand-900 dark:text-brand-300">Demo Login Quick Fill:</div>
          <div className="flex gap-2">
            <button type="button" onClick={handleFillDemoUser} className="flex-1 py-1.5 bg-white dark:bg-gray-900 rounded-xl font-bold border hover:border-brand-500">
              Customer Account
            </button>
            <button type="button" onClick={handleFillDemoAdmin} className="flex-1 py-1.5 bg-amber-500 text-white rounded-xl font-bold">
              Admin Account
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-xs outline-none focus:border-brand-500"
                required
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-gray-700 dark:text-gray-300">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-medium text-xs outline-none focus:border-brand-500"
                required
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-gray-900 px-3 text-gray-500 font-semibold">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              if (credentialResponse.credential) {
                const res = await loginWithGoogle(credentialResponse.credential);
                if (res.success) {
                  navigate(res.user.role === 'admin' ? '/admin' : redirect);
                }
              }
            }}
            onError={() => {
              addToast('Google Sign-In blocked: Please replace VITE_GOOGLE_CLIENT_ID in frontend/.env with your Google Cloud Client ID', 'error');
            }}
            useOneTap
            theme="outline"
            shape="pill"
            text="continue_with"
          />
        </div>

        <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100 dark:border-gray-800">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:underline">
            Register for free
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
