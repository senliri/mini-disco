import React, { Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { Layout } from "./components/Layout";
import { AuthProvider, AuthGate, useAuth } from "./components/AuthGate";
import { Home } from "./pages/Home";
import { Appeal } from "./pages/Appeal";
import { AuthPage } from "./pages/AuthPage";

// Lazy-loaded routes — reduces initial bundle size
const Report = React.lazy(() => import("./pages/Report"));
const Portfolio = React.lazy(() => import("./pages/Portfolio"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

// Loading fallback for Suspense boundaries
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
    </div>
  );
}

// Error boundary fallback — prevents black screen
function ErrorFallback({ error }: { error: Error | null }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-slate-400 mb-4">Please refresh the page to try again.</p>
        {error && (
          <pre className="text-xs text-red-400 bg-red-950/30 p-4 rounded-lg overflow-auto max-h-40 text-left">
            {error.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Protected layout wrapper — applies AuthGate + Suspense
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return <>{children}</>;
}

// Routes that require authentication
const ProtectedRoutes = () => (
  <>
    <Route path="/" element={
      <ProtectedLayout>
        <Layout><Home /></Layout>
      </ProtectedLayout>
    } />
    <Route path="/report" element={
      <Suspense fallback={<PageLoader />}>
        <ProtectedLayout>
          <Layout><Report /></Layout>
        </ProtectedLayout>
      </Suspense>
    } />
    <Route path="/appeal" element={
      <ProtectedLayout>
        <Layout><Appeal /></Layout>
      </ProtectedLayout>
    } />
    <Route path="/portfolio" element={
      <Suspense fallback={<PageLoader />}>
        <ProtectedLayout>
          <AuthGate>
            <Layout><Portfolio /></Layout>
          </AuthGate>
        </ProtectedLayout>
      </Suspense>
    } />
    <Route path="/dashboard" element={
      <Suspense fallback={<PageLoader />}>
        <ProtectedLayout>
          <AuthGate>
            <Layout><Dashboard /></Layout>
          </AuthGate>
        </ProtectedLayout>
      </Suspense>
    } />
  </>
);

// Public routes (accessible without auth)
const PublicRoutes = () => (
  <>
    <Route path="/auth" element={<AuthPage />} />
    {/* Catch-all: redirect to home if not authenticated */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </>
);

export function App() {
  const [initError, setInitError] = useState<Error | null>(null);
  
  // Catch any initialization errors
  useEffect(() => {
    try {
      // Test if crypto.subtle is available (needed for auth)
      if (typeof crypto?.subtle?.digest !== 'function') {
        throw new Error('Web Crypto API not available. Please use a modern browser.');
      }
    } catch (e) {
      setInitError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);
  
  if (initError) {
    return <ErrorFallback error={initError} />;
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <Routes>
            <ProtectedRoutes />
            <PublicRoutes />
          </Routes>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

// Simple error boundary class component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}