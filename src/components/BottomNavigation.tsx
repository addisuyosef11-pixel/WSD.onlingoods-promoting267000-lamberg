import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

  // Option 3: Minimalist Line Icons (Custom SVG)
  const navItems: NavItem[] = [
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 10L12 3L21 10L21 20H3V10Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 20V14H15V20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ), 
      label: t('Home'), 
      path: '/dashboard' 
    },
    
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2V7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 17V22" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 12H2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 12H20" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.07 4.93L17.66 6.34" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.34 17.66L4.93 19.07" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19.07 19.07L17.66 17.66" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.34 6.34L4.93 4.93" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ), 
      label: t('Earn'), 
      path: '/earn' 
    },
    
    // ORDERS IN THE MIDDLE (3rd position) - with gold color
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 21V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V21" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 12V14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 17V19" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ), 
      label: t('Orders'), 
      path: '/orders',
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined 
    },
    
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21V19C17 17.9 16.1 17 15 17H9C7.9 17 7 17.9 7 19V21" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 13C14.2 13 16 11.2 16 9C16 6.8 14.2 5 12 5C9.8 5 8 6.8 8 9C8 11.2 9.8 13 12 13Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 21V19C19.9997 18.1137 19.7442 17.2528 19.275 16.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 21V19C4.0003 18.1137 4.25585 17.2528 4.725 16.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 7.5C16.8778 7.5 17.6 6.77778 17.6 5.9C17.6 5.02222 16.8778 4.3 16 4.3C15.1222 4.3 14.4 5.02222 14.4 5.9C14.4 6.77778 15.1222 7.5 16 7.5Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 7.5C8.87778 7.5 9.6 6.77778 9.6 5.9C9.6 5.02222 8.87778 4.3 8 4.3C7.12222 4.3 6.4 5.02222 6.4 5.9C6.4 6.77778 7.12222 7.5 8 7.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ), 
      label: t('Team'), 
      path: '/team' 
    },
    
    { 
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 20V19C5 15.7 7.7 13 11 13H13C16.3 13 19 15.7 19 19V20" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6L22 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 4L19 8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ), 
      label: t('Profile'), 
      path: '/profile' 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="relative z-10">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isOrders = item.path === '/orders';
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center transition-all duration-200 flex-1 group py-1"
              >
                {/* Icon container */}
                <div className="relative flex items-center justify-center mb-1">
                  {/* For Orders - always gold with circle */}
                  {isOrders ? (
                    <>
                      {/* Gold circle background */}
                      <div className="absolute inset-0 rounded-full bg-amber-400 scale-110" />
                      
                      {/* Icon - white in gold circle */}
                      <div className="relative text-white z-10">
                        {item.icon}
                      </div>

                      {/* Notification badge */}
                      {item.badge && item.badge > 0 && (
                        <div className="absolute -top-2 -right-2 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 bg-red-500 rounded-full flex items-center justify-center px-0.5 sm:px-1 animate-pulse shadow-lg border border-white z-20">
                          <span className="text-[8px] sm:text-[10px] font-bold text-white">
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Green circle background for active state (non-Orders) */}
                      <div className={`
                        absolute inset-0 rounded-full transition-all duration-300
                        ${isActive 
                          ? 'bg-[#7acc00]/10 scale-100 opacity-100' 
                          : 'scale-0 opacity-0'
                        }
                      `} />
                      
                      {/* Icon - normal colors for non-Orders */}
                      <div className={`
                        relative transition-all duration-300 z-10
                        ${isActive 
                          ? 'text-[#7acc00] scale-110' 
                          : 'text-gray-500 group-hover:text-gray-700'
                        }
                      `}>
                        {item.icon}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Label */}
                <span className={`
                  text-[10px] sm:text-xs font-medium transition-all duration-300
                  ${isOrders 
                    ? 'text-amber-500 font-semibold' 
                    : isActive 
                      ? 'text-[#7acc00]' 
                      : 'text-gray-500 group-hover:text-gray-700'
                  }
                `}>
                  {item.label}
                </span>
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
          button svg {
            width: 20px;
            height: 20px;
          }
          
          button span {
            font-size: 9px;
          }
        }
        
        /* For iPhone SE and similar small devices */
        @media (max-width: 375px) {
          .flex {
            gap: 2px;
          }
          
          button span {
            font-size: 10px;
          }
        }

        /* For larger screens */
        @media (min-width: 768px) {
          button span {
            font-size: 12px;
          }
          
          button svg {
            width: 24px;
            height: 24px;
          }
        }

        /* Smooth transitions */
        .group {
          transition: all 0.2s ease;
        }

        /* Subtle hover effect for non-Orders icons */
        .group:hover svg:not(.orders-icon) {
          transform: scale(1.05);
        }
      `}</style>
    </nav>
  );
};