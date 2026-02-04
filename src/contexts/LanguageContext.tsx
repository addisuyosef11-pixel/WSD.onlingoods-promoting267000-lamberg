import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'am';

interface Translations {
  [key: string]: string;
}

const amharicTranslations: Translations = {
  // Auth pages
  'Welcome Back': 'እንኳን ደህና መጡ',
  'Sign in to continue earning': 'መግቢያ በማድረግ ገቢዎን ይቀጥሉ',
  'Phone Number': 'ስልክ ቁጥር',
  'Password': 'የይለፍ ቃል',
  'Enter your password': 'የይለፍ ቃልዎን ያስገቡ',
  'Sign In': 'ግባ',
  'Signing in...': 'እየገባ ነው...',
  "Don't have an account?": 'መለያ የለዎትም?',
  'Sign Up': 'ተመዝገብ',
  'Create Account': 'መለያ ይፍጠሩ',
  'Join and start earning today': 'ዛሬ ይቀላቀሉ እና ማግኘት ይጀምሩ',
  'Full Name': 'ሙሉ ስም',
  'Enter your name': 'ስምዎን ያስገቡ',
  'Phone Number (Your ID)': 'ስልክ ቁጥር (የእርስዎ መታወቂያ)',
  'Create a password': 'የይለፍ ቃል ይፍጠሩ',
  'Confirm Password': 'የይለፍ ቃል ያረጋግጡ',
  'Confirm your password': 'የይለፍ ቃልዎን ያረጋግጡ',
  'Referral Code (Optional)': 'የሪፈራል ኮድ (አማራጭ)',
  'Enter referral code': 'የሪፈራል ኮድ ያስገቡ',
  'Creating Account...': 'መለያ እየተፈጠረ ነው...',
  'Already have an account?': 'አስቀድሞ መለያ አለዎት?',
  
  // Dashboard
  'Hot Products': 'ተወዳጅ ምርቶች',
  'About Us': 'ስለ እኛ',
  'Total Balance': 'ጠቅላላ ቀሪ ሂሳብ',
  'Withdrawable': 'ለመውጣት የሚችል',
  
  // Bottom Navigation
  'Home': 'መነሻ',
  'Product': 'ምርት',
  'My Order': 'ትዕዛዜ',
  'Team': 'ቡድን',
  'Mine': 'የእኔ',
  
  // Profile
  'Transaction History': 'የግብይት ታሪክ',
  'Settings': 'ቅንብሮች',
  'Help Center': 'የእርዳታ ማዕከል',
  'Terms & Conditions': 'ውሎች እና ሁኔታዎች',
  'Sign Out': 'ውጣ',
  "Today's Income": 'የዛሬ ገቢ',
  "Yesterday's Income": 'የትናንት ገቢ',
  'Wait 24h to transfer': '24 ሰዓት ይጠብቁ',
  'Wait 24h to claim': '24 ሰዓት ይጠብቁ',
  
  // Settings
  'Bind Account Number': 'የባንክ ሂሳብ ያገናኙ',
  'Link your bank account for withdrawals': 'ለመውጣት የባንክ ሂሳብዎን ያገናኙ',
  'Change Login Password': 'የመግቢያ ይለፍ ቃል ይቀይሩ',
  'Update your account password': 'የመለያ ይለፍ ቃልዎን ያዘምኑ',
  'Withdrawal Password': 'የመውጣት የይለፍ ቃል',
  'Set a 6-digit PIN for withdrawals': 'ለመውጣት 6-አሃዝ ፒን ያስቀምጡ',
  'Notifications': 'ማሳወቂያዎች',
  'Managed by admin': 'በአስተዳዳሪ የሚተዳደር',
  'Language': 'ቋንቋ',
  'Privacy Policy': 'የግላዊነት መመሪያ',
  'Read our privacy policy': 'የግላዊነት መመሪያችንን ያንብቡ',
  'Help & Support': 'እርዳታ እና ድጋፍ',
  'Get help from our support team': 'ከድጋፍ ቡድናችን እርዳታ ያግኙ',
  'About DSW': 'ስለ DSW',
  'Version 1.0.0': 'ስሪት 1.0.0',
  'Bank Name': 'የባንክ ስም',
  'Enter bank name': 'የባንክ ስም ያስገቡ',
  'Account Number': 'የሂሳብ ቁጥር',
  'Enter account number': 'የሂሳብ ቁጥር ያስገቡ',
  'Account Holder Name': 'የሂሳብ ባለቤት ስም',
  'Enter account holder name': 'የሂሳብ ባለቤት ስም ያስገቡ',
  'Bind Account': 'ሂሳብ ያገናኙ',
  'Current Password': 'የአሁኑ የይለፍ ቃል',
  'Enter current password': 'የአሁኑ የይለፍ ቃል ያስገቡ',
  'New Password': 'አዲስ የይለፍ ቃል',
  'Enter new password': 'አዲስ የይለፍ ቃል ያስገቡ',
  'Confirm New Password': 'አዲስ የይለፍ ቃል ያረጋግጡ',
  'Change Password': 'የይለፍ ቃል ይቀይሩ',
  'Changing...': 'እየተቀየረ ነው...',
  'Login Password (for verification)': 'የመግቢያ ይለፍ ቃል (ለማረጋገጫ)',
  'Enter login password': 'የመግቢያ ይለፍ ቃል ያስገቡ',
  'Withdrawal Password (6 digits)': 'የመውጣት ይለፍ ቃል (6 አሃዝ)',
  'Enter 6-digit PIN': '6-አሃዝ ፒን ያስገቡ',
  'Confirm Withdrawal Password': 'የመውጣት ይለፍ ቃል ያረጋግጡ',
  'Confirm 6-digit PIN': '6-አሃዝ ፒን ያረጋግጡ',
  'Set Password': 'ይለፍ ቃል ያስቀምጡ',
  'Setting...': 'እየተቀመጠ ነው...',
  'Notifications are managed by admin': 'ማሳወቂያዎች በአስተዳዳሪ ይተዳደራሉ',
  'You will receive important updates automatically': 'አስፈላጊ ማሻሻያዎችን በራስ-ሰር ይቀበላሉ',
  
  // Action Buttons
  'Deposit': 'አስገባ',
  'Withdraw': 'አውጣ',
  'Service': 'አገልግሎት',
  'Gift': 'ስጦታ',
  
  // Orders
  'My products': 'የእኔ ምርቶች',
  'No products purchased yet': 'እስካሁን ምንም ምርት አልተገዙም',
  'Browse Products': 'ምርቶችን ይመልከቱ',
  'Price': 'ዋጋ',
  'Cycle': 'ዑደት',
  'Days': 'ቀናት',
  'Daily Income': 'ዕለታዊ ገቢ',
  'Create': 'ተፈጥሯል',
  'get': 'አግኝ',
  'Wait 24h': '24 ሰዓት ይጠብቁ',
  'Claiming...': 'እየተጠየቀ ነው...',
  
  // Team
  'My Team': 'ቡድኔ',
  'Invite Friends': 'ጓደኞችን ይጋብዙ',
  'Earn 100 ETB for each referral': 'ለእያንዳንዱ ሪፈራል 100 ብር ያግኙ',
  'Your referral code': 'የእርስዎ ሪፈራል ኮድ',
  'Copy': 'ቅዳ',
  'Team Members': 'የቡድን አባላት',
  'Team Earnings': 'የቡድን ገቢ',
  'No team members yet': 'እስካሁን ምንም የቡድን አባል የለም',
  'Share your referral link to grow your team': 'ቡድንዎን ለማሳደግ የሪፈራል ሊንክዎን ያጋሩ',
  
  // Transaction History
  'All': 'ሁሉም',
  'VIP': 'ቪአይፒ',
  'No transactions found': 'ምንም ግብይቶች አልተገኙም',
  
  // Earn page
  'P-Series': 'ፒ-ሴሪስ',
  'B-Series': 'ቢ-ሴሪስ',
  
  // Customer Service
  'Customer Service': 'የደንበኞች አገልግሎት',
  'Official Support': 'ኦፊሴላዊ ድጋፍ',
  'Public Channel': 'ይፋዊ ቻናል',
  'Join our Telegram channel': 'የቴሌግራም ቻናላችንን ይቀላቀሉ',
  'Discussion Group': 'የውይይት ቡድን',
  'Join our community': 'ማህበረሰባችንን ይቀላቀሉ',
  
  // About Section
  'Users': 'ተጠቃሚዎች',
  'Daily ROI': 'ዕለታዊ ትርፍ',
  'Support': 'ድጋፍ',
  
  // Modals
  'Tips': 'ምክሮች',
  'OK': 'እሺ',
  
  // Terms
  '1. Introduction': '1. መግቢያ',
  '2. Account Registration': '2. መለያ ምዝገባ',
  '3. VIP Membership': '3. ቪአይፒ አባልነት',
  '4. Deposits & Withdrawals': '4. ማስገባት እና ማውጣት',
  '5. User Conduct': '5. የተጠቃሚ ባህሪ',
  '6. Privacy': '6. ግላዊነት',
  'Accept & Continue': 'ተቀብል እና ቀጥል',
  'I have read and agree to the Terms & Conditions': 'ውሎችን እና ሁኔታዎችን አንብቤ ተስማምቻለሁ',
  
  // DSW Platform
  'DSW Platform': 'DSW መድረክ',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    if (language === 'en') return key;
    return amharicTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
