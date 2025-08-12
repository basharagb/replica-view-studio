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
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Component, ErrorInfo, ReactNode } from "react";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Error boundary to catch JavaScript errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
          <h1>Something went wrong!</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => clearCacheAndReload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
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

                {/* Dashboard routes - allow access but protect individual routes */}
                <Route path="/" element={<Dashboard />}>
                  <Route index element={<RequireAuth><LiveTest /></RequireAuth>} />
                  <Route path="reports" element={<RequireAuth><Reports /></RequireAuth>} />
                  <Route path="analytics" element={<RequireAuth><Analytics /></RequireAuth>} />
                  <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
                  <Route path="monitoring" element={<RequireAuth><SiloMonitoring /></RequireAuth>} />
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
  </ErrorBoundary>
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
