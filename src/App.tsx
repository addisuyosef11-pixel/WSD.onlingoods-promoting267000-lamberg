import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
