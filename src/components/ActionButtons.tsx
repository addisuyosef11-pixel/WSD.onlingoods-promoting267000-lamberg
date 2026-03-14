import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wallet, CircleDollarSign, Gift } from 'lucide-react';
import customerServiceIcon from '@/assets/customer-service.png';

interface ActionButtonsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
  onCustomerService: () => void;
  onGift: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDeposit,
  onWithdraw,
  onCustomerService,
  onGift,
}) => {
  const { t } = useLanguage();
  
  const buttons = [
    { icon: <Wallet className="w-6 h-6" />, label: t('Deposit'), onClick: onDeposit, bgColor: 'bg-blue-100', color: 'text-blue-600', isImage: false },
    { icon: <CircleDollarSign className="w-6 h-6" />, label: t('Withdraw'), onClick: onWithdraw, bgColor: 'bg-green-100', color: 'text-green-600', isImage: false },
    { icon: customerServiceIcon, label: t('Service'), onClick: onCustomerService, bgColor: 'bg-purple-100', color: 'text-purple-600', isImage: true },
    { icon: <Gift className="w-6 h-6" />, label: t('Gift'), onClick: onGift, bgColor: 'bg-amber-100', color: 'text-amber-600', isImage: false },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 p-4 bg-card rounded-2xl border border-border shadow-sm">
      {buttons.map((button) => (
        <button
          key={button.label}
          onClick={button.onClick}
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className={`p-3 rounded-full ${button.bgColor} ${button.color} flex items-center justify-center`}>
            {button.isImage ? (
              <img src={button.icon as string} alt={button.label} className="w-6 h-6" />
            ) : (
              button.icon
            )}
          </div>
          <span className="text-xs font-medium text-foreground">{button.label}</span>
        </button>
      ))}
    </div>
  );
};
