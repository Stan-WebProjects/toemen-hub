import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Pages
import ChatPage from "@/pages/ChatPage";
import ChatFullscreen from "@/pages/ChatFullscreen";
import DashboardPage from "@/pages/DashboardPage";
import AuthPage from "@/pages/AuthPage";

const queryClient = new QueryClient();

const StaffRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isStaff, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isStaff) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public: Chat widget demo */}
          <Route path="/" element={<ChatPage />} />

          {/* Public: Full screen Jappie (jappie.toemen.nl) */}
          <Route path="/chat" element={<ChatFullscreen />} />

          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />

          {/* Staff: Dashboard (hub.toemen.nl) */}
          <Route path="/dashboard/*" element={
            <StaffRoute><DashboardPage /></StaffRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
