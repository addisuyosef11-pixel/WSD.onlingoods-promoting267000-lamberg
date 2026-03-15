import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Earn from "./pages/Earn";
import Orders from "./pages/Orders";
import Team from "./pages/Team";
import Profile from "./pages/Profile";
import VipDetail from "./pages/VipDetail";
import TransactionHistory from "./pages/TransactionHistory";
import Settings from "./pages/Settings";
import CustomerService from "./pages/CustomerService";
import NotFound from "./pages/NotFound";
import Announcements from "./pages/Announcements";
import MicroSavings from './pages/MicroSavings';
import BankCardPage from './pages/BankCardPage';
import { Deposit } from './pages/Deposit';
import { Withdraw } from './pages/Withdraw';
import BottomNavigation from './components/BottomNavigation'; // Add this import

const queryClient = new QueryClient();

// Meta Tags Updater Component
const MetaTagsUpdater = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Get the referral code from URL if present
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    
    // Only update if this is a referral link
    if (refCode && (location.pathname === '/signup' || location.pathname === '/')) {
      const url = window.location.href;
      const title = `Join DSW with referral code ${refCode} and get 145 ETB bonus!`;
      const description = `Use referral code ${refCode} to join DSW and get 145 ETB bonus after your first deposit! Start earning passive income today.`;
      const imageUrl = `https://wsd-onlingoods-promoting267000-lamb.vercel.app/og-image.png?ref=${refCode}`;
      
      // Update title
      document.title = title;
      
      // Helper function to update or create meta tags
      const updateOrCreateMetaTag = (attr: string, name: string, content: string) => {
        // Try to find existing tag
        let element = document.querySelector(`meta[${attr}="${name}"]`);
        
        if (element) {
          element.setAttribute('content', content);
        } else {
          // Create new tag if it doesn't exist
          element = document.createElement('meta');
          element.setAttribute(attr, name);
          element.setAttribute('content', content);
          document.head.appendChild(element);
        }
      };

      // Update all relevant meta tags
      updateOrCreateMetaTag('name', 'title', title);
      updateOrCreateMetaTag('property', 'og:title', title);
      updateOrCreateMetaTag('name', 'twitter:title', title);
      updateOrCreateMetaTag('name', 'telegram:title', title);
      
      updateOrCreateMetaTag('name', 'description', description);
      updateOrCreateMetaTag('property', 'og:description', description);
      updateOrCreateMetaTag('name', 'twitter:description', description);
      
      updateOrCreateMetaTag('property', 'og:url', url);
      updateOrCreateMetaTag('name', 'twitter:url', url);
      
      updateOrCreateMetaTag('property', 'og:image', imageUrl);
      updateOrCreateMetaTag('name', 'twitter:image', imageUrl);
      updateOrCreateMetaTag('property', 'og:image:alt', `DSW Referral Code ${refCode}`);
      
      // Ensure site name is correct
      updateOrCreateMetaTag('property', 'og:site_name', 'DSW - Digital Smart Work');
    }
  }, [location]);
  
  return null;
};

// Layout wrapper component to conditionally show BottomNavigation
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Define routes where bottom navigation should NOT appear
  const hideNavigationRoutes = ['/login', '/signup', '/'];
  const shouldHideNavigation = hideNavigationRoutes.includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* MetaTagsUpdater goes here to access useLocation hook */}
      <MetaTagsUpdater />
      
      {/* Main content with proper overflow handling */}
      <div className={`
        ${!shouldHideNavigation ? 'pb-20' : ''} /* Add padding bottom when nav is visible */
        w-full max-w-full overflow-x-hidden
      `}>
        {children}
      </div>
      
      {/* Bottom Navigation - only show on authenticated pages */}
      {!shouldHideNavigation && <BottomNavigation />}
    </div>
  );
};

// Inner component that can access auth context
const AppContent = ({ onSplashFinish }: { onSplashFinish: () => void }) => {
  const { loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    // Ensure splash shows for at least 1.5 seconds
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide splash when both conditions are met:
    // 1. Minimum time has passed (1.5 seconds)
    // 2. Auth is no longer loading
    if (minTimePassed && !authLoading) {
      setShowSplash(false);
      onSplashFinish();
    }
  }, [minTimePassed, authLoading, onSplashFinish]);

  if (showSplash) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes wrapped with AppLayout */}
      <Route path="/dashboard" element={
        <AppLayout>
          <Dashboard />
        </AppLayout>
      } />
      <Route path="/earn/:levelId" element={
        <AppLayout>
          <Earn />
        </AppLayout>
      } />
      <Route path="/earn" element={
        <AppLayout>
          <Earn />
        </AppLayout>
      } />
      <Route path="/orders" element={
        <AppLayout>
          <Orders />
        </AppLayout>
      } />
      <Route path="/team" element={
        <AppLayout>
          <Team />
        </AppLayout>
      } />
      <Route path="/profile" element={
        <AppLayout>
          <Profile />
        </AppLayout>
      } />
      <Route path="/transactions" element={
        <AppLayout>
          <TransactionHistory />
        </AppLayout>
      } />
      <Route path="/settings" element={
        <AppLayout>
          <Settings />
        </AppLayout>
      } />
      <Route path="/service" element={
        <AppLayout>
          <CustomerService />
        </AppLayout>
      } />
      <Route path="/vip/:levelId" element={
        <AppLayout>
          <VipDetail />
        </AppLayout>
      } />
      <Route path="/announcements" element={
        <AppLayout>
          <Announcements />
        </AppLayout>
      } />
      <Route path="/micro-savings" element={
        <AppLayout>
          <MicroSavings />
        </AppLayout>
      } />
      <Route path="/bank-cards" element={
        <AppLayout>
          <BankCardPage />
        </AppLayout>
      } />
      <Route path="/deposit" element={
        <AppLayout>
          <Deposit />
        </AppLayout>
      } />
      <Route path="/withdraw" element={
        <AppLayout>
          <Withdraw />
        </AppLayout>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter> {/* Single BrowserRouter here */}
              <Toaster />
              <Sonner />
              {showSplash ? (
                <SplashScreen onFinish={handleSplashFinish} />
              ) : (
                <AppContent onSplashFinish={handleSplashFinish} />
              )}
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;