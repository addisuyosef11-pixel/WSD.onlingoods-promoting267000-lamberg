import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Info } from 'lucide-react';
import aboutTeamImage from '@/assets/about-team.png';

const AboutSection: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6">
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
        <Info className="w-5 h-5 text-primary" />
        {t('About Us')}
      </h3>
      
      {/* Team Image */}
      <div className="w-full mb-4 rounded-xl overflow-hidden">
        <img 
          src={aboutTeamImage} 
          alt="DSW Team" 
          className="w-full h-40 object-cover"
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Welcome to DSW, your trusted platform for earning passive income through smart investments. 
        Our VIP system offers multiple tiers with guaranteed daily returns. Join thousands of satisfied 
        members who are already benefiting from our secure and transparent earning opportunities.
      </p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-lg font-bold text-primary">50K+</p>
          <p className="text-xs text-muted-foreground">{t('Users')}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-lg font-bold text-primary">9%</p>
          <p className="text-xs text-muted-foreground">{t('Daily ROI')}</p>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-lg font-bold text-primary">24/7</p>
          <p className="text-xs text-muted-foreground">{t('Support')}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
