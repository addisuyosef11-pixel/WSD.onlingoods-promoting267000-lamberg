import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  CircleDollarSign, 
  PackageOpen, 
  UsersRound, 
  CircleUser,
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrders = async () => {
      if (!user) return;

      try {
        const { count, error } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'pending');

        if (!error && count !== null) {
          setPendingOrdersCount(count);
        }
      } catch (error) {
        console.error('Error fetching pending orders:', error);
      }
    };

    fetchPendingOrders();

    // Subscribe to order changes
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user?.id}` },
        () => {
          fetchPendingOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const navItems: NavItem[] = [
    { icon: <LayoutDashboard className="w-6 h-6" />, label: t('Home'), path: '/dashboard' },
    { icon: <CircleDollarSign className="w-6 h-6" />, label: t('Earn'), path: '/earn' },
    { 
      icon: <PackageOpen className="w-6 h-6" />, 
      label: t('Orders'), 
      path: '/orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    { icon: <UsersRound className="w-6 h-6" />, label: t('Team'), path: '/team' },
    { icon: <CircleUser className="w-6 h-6" />, label: t('Profile'), path: '/profile' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg"
      style={{ 
        background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)',
        borderTopColor: '#B0FC38'
      }}
    >
      {/* Decorative wave pattern overlay */}
      <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,50 C100,80 200,20 300,50 C350,65 400,50 400,50 L400,100 L0,100 Z" fill="white" />
          <path d="M0,70 C80,90 180,40 280,70 C340,85 400,70 400,70 L400,100 L0,100 Z" fill="white" opacity="0.5" />
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center transition-all duration-200 flex-1 group"
              >
                {/* Circle container */}
                <div className={`
                  relative flex items-center justify-center
                  w-14 h-14 rounded-full transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/50 scale-110' 
                    : 'bg-white/20 backdrop-blur-sm group-hover:bg-white/30'
                  }
                `}>
                  {/* Icon with badge */}
                  <div className="relative">
                    <div className={`
                      transition-all duration-300
                      ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}
                    `}>
                      {item.icon}
                    </div>
                    
                    {/* Notification badge for Orders */}
                    {item.badge && item.badge > 0 && (
                      <div className="absolute -top-2 -right-2 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 bg-red-500 rounded-full flex items-center justify-center px-0.5 sm:px-1 animate-pulse shadow-lg border border-white">
                        <span className="text-[8px] sm:text-[10px] font-bold text-white">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Inner glow for active state */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                  )}
                </div>
                
                {/* Label - Increased font size and made bold */}
                <span className={`
                  text-xs sm:text-sm font-bold mt-1.5 transition-all duration-300 whitespace-nowrap
                  ${isActive 
                    ? 'text-amber-400 drop-shadow-sm' 
                    : 'text-white/90 group-hover:text-white'
                  }
                `}>
                  {item.label}
                </span>

                {/* Extra bold for active state - text shadow for better visibility */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 opacity-50" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for mobile - increased height */}
      <div className="h-safe-bottom" />
      
      <style>{`
        .h-safe-bottom {
          height: env(safe-area-inset-bottom, 0px);
        }
        
        /* For very small screens (under 360px) */
        @media (max-width: 360px) {
          .w-14.h-14 {
            width: 48px;
            height: 48px;
          }
          
          button span {
            font-size: 11px;
          }
          
          svg {
            width: 20px;
            height: 20px;
          }
        }
        
        /* For iPhone SE and similar small devices */
        @media (max-width: 375px) {
          .flex {
            gap: 2px;
          }
          
          button span {
            font-size: 12px;
          }
        }

        /* For larger screens */
        @media (min-width: 768px) {
          button span {
            font-size: 14px;
          }
          
          .w-14.h-14 {
            width: 60px;
            height: 60px;
          }
          
          svg {
            width: 28px;
            height: 28px;
          }
        }

        /* Smooth transitions */
        .group {
          transition: all 0.2s ease;
        }

        /* Ensure text is always readable */
        button span {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          letter-spacing: 0.3px;
        }
      `}</style>
    </nav>
  );
};