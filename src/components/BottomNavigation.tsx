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
    { icon: <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('Home'), path: '/dashboard' },
    { icon: <CircleDollarSign className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('Earn'), path: '/earn' },
    { 
      icon: <PackageOpen className="w-5 h-5 sm:w-6 sm:h-6" />, 
      label: t('Orders'), 
      path: '/orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    { icon: <UsersRound className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('Team'), path: '/team' },
    { icon: <CircleUser className="w-5 h-5 sm:w-6 sm:h-6" />, label: t('Profile'), path: '/profile' },
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
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,50 C100,80 200,20 300,50 C350,65 400,50 400,50 L400,100 L0,100 Z" fill="white" />
          <path d="M0,70 C80,90 180,40 280,70 C340,85 400,70 400,70 L400,100 L0,100 Z" fill="white" opacity="0.5" />
        </svg>
      </div>
      
      <div className="max-w-md mx-auto px-1 sm:px-2 relative z-10">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center py-2 sm:py-3 px-1 sm:px-4 rounded-xl transition-all duration-200 hover:bg-white/20 active:bg-white/30 flex-1 max-w-[70px] sm:max-w-none"
              >
                {/* Animated indicator line */}
                <div className={`
                  absolute -top-1 left-2 right-2 sm:left-4 sm:right-4 h-1 bg-white rounded-full
                  transition-all duration-300 transform
                  ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
                `} />
                
                {/* Icon with badge */}
                <div className="relative">
                  <div className={`
                    relative transition-all duration-300
                    ${isActive ? 'text-white -translate-y-0.5 scale-110' : 'text-white/80'}
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
                  
                  {/* Small dot indicator for active */}
                  {isActive && (
                    <div className="absolute -bottom-2.5 sm:-bottom-3 left-1/2 -translate-x-1/2">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`
                  text-[10px] sm:text-xs font-medium mt-1 sm:mt-2 transition-all duration-300 truncate max-w-full
                  ${isActive ? 'text-white font-semibold' : 'text-white/80'}
                `}>
                  {item.label}
                </span>

                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 rounded-xl -z-10 backdrop-blur-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Safe area padding for mobile */}
      <div className="h-safe-bottom" />
      
      <style>{`
        .h-safe-bottom {
          height: env(safe-area-inset-bottom, 0px);
        }
        
        /* For very small screens (under 360px) */
        @media (max-width: 360px) {
          .max-w-md .flex > button {
            padding-left: 2px;
            padding-right: 2px;
          }
          
          .max-w-md .flex > button span {
            font-size: 8px;
          }
          
          .max-w-md .flex > button svg {
            width: 18px;
            height: 18px;
          }
        }
        
        /* For iPhone SE and similar small devices */
        @media (max-width: 375px) {
          .max-w-md .flex {
            gap: 2px;
          }
        }
      `}</style>
    </nav>
  );
};