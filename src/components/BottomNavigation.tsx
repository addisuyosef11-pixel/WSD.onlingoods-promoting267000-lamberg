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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto px-2">
        <div className="flex items-center justify-around py-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center py-3 px-4 rounded-xl transition-all duration-200 hover:bg-gray-50 active:bg-gray-100"
              >
                {/* Animated indicator line */}
                <div className={`
                  absolute -top-1 left-4 right-4 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full
                  transition-all duration-300 transform
                  ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
                `} />
                
                {/* Icon with badge */}
                <div className="relative">
                  <div className={`
                    relative transition-all duration-300
                    ${isActive ? 'text-green-600 -translate-y-0.5 scale-110' : 'text-gray-500'}
                  `}>
                    {item.icon}
                  </div>
                  
                  {/* Notification badge for Orders */}
                  {item.badge && item.badge > 0 && (
                    <div className="absolute -top-2 -right-2 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1 animate-pulse shadow-lg">
                      <span className="text-[10px] font-bold text-white">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    </div>
                  )}
                  
                  {/* Small dot indicator for active (alternative to line) */}
                  {isActive && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`
                  text-xs font-medium mt-2 transition-all duration-300
                  ${isActive ? 'text-green-600 font-semibold' : 'text-gray-500'}
                `}>
                  {item.label}
                </span>

                {/* Active background glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-green-50/50 rounded-xl -z-10" />
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
      `}</style>
    </nav>
  );
};