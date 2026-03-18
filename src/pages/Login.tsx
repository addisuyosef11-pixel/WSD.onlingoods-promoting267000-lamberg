import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LogIn, Eye, EyeOff, Lock } from 'lucide-react';
import { SuccessModal } from '@/components/SuccessModal';

const EthiopianFlag = () => (
  <svg width="24" height="16" viewBox="0 0 24 16" className="rounded-sm flex-shrink-0">
    <rect y="0" width="24" height="5.33" fill="#009739" />
    <rect y="5.33" width="24" height="5.34" fill="#FCDD09" />
    <rect y="10.67" width="24" height="5.33" fill="#CE1126" />
    <circle cx="12" cy="8" r="3.5" fill="#0F47AF" />
  </svg>
);

const WaveDivider = ({ flip = false }: { flip?: boolean }) => (
  <div className={`w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""}`}>
    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-24">
      <path
        d="M0,60 C180,120 360,0 540,60 C720,120 900,0 1080,60 C1260,120 1440,0 1440,60 L1440,120 L0,120 Z"
        fill="hsl(150,50%,20%)"
      />
      <path
        d="M0,80 C200,40 400,100 600,70 C800,40 1000,110 1200,70 C1350,40 1440,80 1440,80 L1440,120 L0,120 Z"
        fill="hsl(145,45%,35%)"
        opacity="0.7"
      />
      <path
        d="M0,95 C240,70 480,110 720,90 C960,70 1200,110 1440,95 L1440,120 L0,120 Z"
        fill="hsl(43,70%,50%)"
        opacity="0.5"
      />
    </svg>
  </div>
);

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(phone, password);

    if (error) {
      setErrorMessage(error.message);
      setShowError(true);
    } else {
      setShowSuccess(true);
    }

    setLoading(false);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-green-800 to-green-600">
      {/* Top section with title and wave */}
      <div className="relative z-10 flex-shrink-0 pt-12 pb-0 text-center">
        <h1 
          className="text-3xl md:text-4xl font-extrabold tracking-widest mb-1"
          style={{ 
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          DIGITAL SMART WORK
        </h1>
        <p className="text-white/90 text-sm tracking-wider mb-6">
          {t('Sign in to continue earning')}
        </p>
        <WaveDivider />
      </div>

      {/* Login Form - White Card */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 -mt-4">
        <div className="w-full max-w-md mt-4">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-5">
              <LogIn className="w-5 h-5" style={{ color: '#FFD700' }} />
              <h2 className="text-lg font-bold text-gray-800">{t('Sign In')}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone field */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t('Phone Number')}
                </label>
                <div className="flex items-center rounded-md overflow-hidden border border-gray-300 focus-within:ring-1 focus-within:ring-green-600 bg-white">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-r border-gray-300 flex-shrink-0 bg-gray-50">
                    <EthiopianFlag />
                    <span className="text-sm font-medium text-gray-700">+251</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="9--------"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 9) setPhone(value);
                    }}
                    maxLength={9}
                    required
                    className="flex-1 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('Password')}
                </label>
                <div className="flex items-center rounded-md overflow-hidden border border-gray-300 focus-within:ring-1 focus-within:ring-green-600 bg-white">
                  <div className="flex items-center px-3 py-2 border-r border-gray-300 flex-shrink-0 bg-gray-50">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t('Enter your password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex-1 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full text-base font-bold tracking-wide bg-green-600 hover:bg-green-700 text-white shadow-lg mt-2"
              >
                {loading ? t('Signing in...') : t('Sign In')}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              {t("Don't have an account?")}{' '}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: '#FFD700' }}>
                {t('Sign Up')}
              </Link>
            </p>

            {/* Trust indicators */}
            <div className="flex justify-center gap-4 mt-6 text-gray-500 text-sm border-t border-gray-200 pt-4">
              <span>🔒 {t('Secured')}</span>
              <span>⚡ {t('24/7 Support')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative z-10 mt-auto">
        <WaveDivider flip />
        <div className="h-6 bg-green-900" />
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message={t('Welcome Back!')}
      />

      <SuccessModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default Login;