import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  phone: string;
  name: string;
  balance: number;
  withdrawable_balance: number;
  current_vip_level: number;
  withdrawal_password: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (phone: string, password: string, name: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (phone: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateBalance: (newBalance: number) => Promise<void>;
  updateVipLevel: (level: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const updateBalance = async (newBalance: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, balance: newBalance } : null);
    }
  };

  const updateVipLevel = async (level: number) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ current_vip_level: level, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, current_vip_level: level } : null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (phone: string, password: string, name: string, referralCode?: string) => {
    // Ensure phone starts with 9 and prepend +251
    const fullPhone = `+251${phone}`;
    const email = `251${phone}@app.local`;
    
    // Find referrer by referral code
    let referrerId: string | null = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('referral_code', referralCode)
        .single();
      
      if (referrer) {
        referrerId = referrer.user_id;
      }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: fullPhone,
          name,
        },
      },
    });
    
    // If signup successful and has referrer, update the referred_by field
    if (!error && data.user && referrerId) {
      await supabase
        .from('profiles')
        .update({ referred_by: referrerId })
        .eq('user_id', data.user.id);
    }
    
    return { error: error as Error | null };
  };

  const signIn = async (phone: string, password: string) => {
    const email = `251${phone}@app.local`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      updateBalance,
      updateVipLevel,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
