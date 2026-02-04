import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, ShoppingBag, Users, Grid3X3 } from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { icon: <Home className="w-6 h-6" />, label: t('Home'), path: '/dashboard' },
    { icon: <Grid3X3 className="w-6 h-6" />, label: t('Product'), path: '/earn' },
    { icon: <ShoppingBag className="w-6 h-6" />, label: t('My Order'), path: '/orders' },
    { icon: <Users className="w-6 h-6" />, label: t('Team'), path: '/team' },
    { icon: <span className="text-xl">👤</span>, label: t('Mine'), path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-around py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
