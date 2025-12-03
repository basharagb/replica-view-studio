import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clearCacheAndReload } from './utils/cache';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import LiveTest from "./pages/Index";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import SiloMonitoring from "./pages/SiloMonitoring";
import Maintenance from "./pages/Maintenance";
import TestPage from "./pages/TestPage";
import FastLiveReading from "./pages/FastLiveReading";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ReactNode } from "react";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();



const App = () => (
  <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Login route: if already authenticated, redirect to dashboard */}
                <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />

                {/* Dashboard routes - require authentication for Live Readings */}
                <Route path="/" element={<Dashboard />}>
                  <Route index element={<RequireAuth><LiveTest /></RequireAuth>} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="maintenance-panel" element={<Maintenance />} />
                  <Route path="test" element={<TestPage />} />
                  <Route path="fast-live-reading" element={<RequireAuth><FastLiveReading /></RequireAuth>} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="monitoring" element={<SiloMonitoring />} />
                  {/* Add more routes as needed */}
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Fallback: any unknown top-level route redirects to login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
  </ThemeProvider>
);

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}


export default App;
