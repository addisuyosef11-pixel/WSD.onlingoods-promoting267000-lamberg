import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/earn/:levelId" element={<Earn />} />
        <Route path="/earn" element={<Earn />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/team" element={<Team />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/transactions" element={<TransactionHistory />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/service" element={<CustomerService />} />
        <Route path="/vip/:levelId" element={<VipDetail />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
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
            <Toaster />
            <Sonner />
            {showSplash ? (
              <SplashScreen onFinish={handleSplashFinish} />
            ) : (
              <AppContent onSplashFinish={handleSplashFinish} />
            )}
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;