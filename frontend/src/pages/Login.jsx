import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { ShieldAlert, KeyRound, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import cgstLogo from '../assets/CGST LOGO.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('cgst_token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('cgst_token', token);
      localStorage.setItem('cgst_user', JSON.stringify(user));

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials or server connection failed');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@cgst.com');
      setPassword('adminpassword');
    } else {
      setEmail('receptionist@cgst.com');
      setPassword('receptionistpassword');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Graphic Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-corporate-200/25 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-corporate-300/15 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={cgstLogo} alt="CGST Logo" className="h-24 w-24 object-contain mb-4" />
          <h2 className="text-xl font-black tracking-tight text-slate-900 text-center">CGST BHAWAN GHAZIABAD</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Visitor Management Terminal</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Operator Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="receptionist@cgst.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-corporate-500 focus:ring-1 focus:ring-corporate-500 transition-all"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Access Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-corporate-500 focus:ring-1 focus:ring-corporate-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-corporate-600 text-white rounded-xl text-sm font-bold shadow hover:bg-corporate-700 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In to CGST'
            )}
          </button>
        </form>

        {/* Developer Help Box */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
            Operator Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillTestCredentials('receptionist')}
              className="px-3 py-2 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              Receptionist User
            </button>
            <button
              onClick={() => fillTestCredentials('admin')}
              className="px-3 py-2 text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              Admin User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
