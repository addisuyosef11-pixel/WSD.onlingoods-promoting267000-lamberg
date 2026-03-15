import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { SuccessModal } from '@/components/SuccessModal';
import dswLogo from '@/assets/dsw-logo.png';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#7acc00] to-[#B0FC38]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={dswLogo} alt="DSW Logo" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">{t('Welcome Back')}</h1>
          <p className="text-white/90">{t('Sign in to continue earning')}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Phone Number')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <span>🇪🇹</span>
                  <span className="text-sm text-gray-500">+251</span>
                </div>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 9) setPhone(value);
                  }}
                  placeholder="9XX XXX XXX"
                  className="pl-20 bg-gray-50 border-gray-200"
                  required
                  maxLength={9}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('Password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('Enter your password')}
                  className="pl-9 pr-9 bg-gray-50 border-gray-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-sm text-[#7acc00] hover:underline">
                  {t('Forgot password?')}
                </Link>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7acc00] hover:bg-[#8fd914] text-white font-semibold py-2"
            >
              {loading ? t('Signing in...') : t('Sign In')}
            </Button>

            {/* Sign Up Link - NO LINES HERE */}
            <p className="text-center text-gray-600 mt-4">
              {t("Don't have an account?")}{' '}
              <Link to="/signup" className="text-[#7acc00] font-semibold hover:underline">
                {t('Sign Up')}
              </Link>
            </p>
          </form>
        </div>

        {/* Trust indicators - NO LINES HERE */}
        <div className="flex justify-center gap-4 mt-6 text-white/80 text-sm">
          <span>🔒 Secured</span>
          <span>⚡ 24/7 Support</span>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message={t('Welcome Back')}
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


