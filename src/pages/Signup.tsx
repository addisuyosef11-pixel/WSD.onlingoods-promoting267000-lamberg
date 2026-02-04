import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User, Eye, EyeOff, Gift } from 'lucide-react';
import { SuccessModal } from '@/components/SuccessModal';
import dswLogo from '@/assets/dsw-logo.png';

const Signup = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!phone.startsWith('9') || phone.length !== 9) {
      setErrorMessage('Phone number must start with 9 and be 9 digits');
      setShowError(true);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setShowError(true);
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setShowError(true);
      setLoading(false);
      return;
    }

    const { error } = await signUp(phone, password, name, referralCode);

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
    navigate('/login');
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
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">{t('Create Account')}</h1>
          <p className="text-muted-foreground">{t('Join and start earning today')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-card rounded-2xl p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('Full Name')}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('Enter your name')}
                className="pl-10 bg-muted border-0 focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('Phone Number (Your ID)')}</label>
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
                placeholder={t('Create a password')}
                className="pl-10 pr-10 bg-muted border-0 focus:ring-1 focus:ring-primary"
                required
                minLength={6}
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('Confirm Password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('Confirm your password')}
                className="pl-10 pr-10 bg-muted border-0 focus:ring-1 focus:ring-primary"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t('Referral Code (Optional)')}</label>
            <div className="relative">
              <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder={t('Enter referral code')}
                className="pl-10 bg-muted border-0 focus:ring-1 focus:ring-primary"
                maxLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full primary-gradient text-primary-foreground font-semibold hover:opacity-90"
          >
            {loading ? t('Creating Account...') : t('Create Account')}
          </Button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          {t('Already have an account?')}{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            {t('Sign In')}
          </Link>
        </p>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message="Account created successfully!"
      />

      <SuccessModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />
    </div>
  );
};

export default Signup;
