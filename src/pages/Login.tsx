import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';
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
    navigate('/dashboard', { state: { fromLogin: true } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-4">
          <img 
            src={dswLogo} 
            alt="DSW" 
            className="w-28 h-28 mx-auto mb-2 object-contain rounded-2xl"
          />
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">{t('Welcome Back')}</h1>
          <p className="text-muted-foreground">{t('Sign in to continue earning')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-2xl p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('Phone Number')}</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-sm text-foreground pointer-events-none">
                <span>🇪🇹</span>
                <span>+251</span>
              </div>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 9) setPhone(value);
                }}
                placeholder="9XX XXX XXX"
                className="pl-20 bg-muted border-0 focus:ring-1 focus:ring-primary"
                required
                maxLength={9}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('Password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('Enter your password')}
                className="pl-10 pr-10 bg-muted border-0 focus:ring-1 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full primary-gradient text-primary-foreground font-semibold hover:opacity-90"
          >
            {loading ? t('Signing in...') : t('Sign In')}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          {t("Don't have an account?")}{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            {t('Sign Up')}
          </Link>
        </p>
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
