import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Report } from "./pages/Report";
import { Appeal } from "./pages/Appeal";
import { Portfolio } from "./pages/Portfolio";
import { Dashboard } from "./pages/Dashboard";
import { AuthPage } from "./pages/AuthPage";
import { AuthProvider } from "./components/AuthGate";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth page */}
        <Route path="/auth" element={<AuthPage />} />
        
        {/* All routes are public — login is optional for premium features */}
        <Route path="/" element={
          <AuthProvider>
            <Layout><Home /></Layout>
          </AuthProvider>
        } />
        <Route path="/report" element={
          <AuthProvider>
            <Layout><Report /></Layout>
          </AuthProvider>
        } />
        <Route path="/appeal" element={
          <AuthProvider>
            <Layout><Appeal /></Layout>
          </AuthProvider>
        } />
        <Route path="/portfolio" element={
          <AuthProvider>
            <Layout><Portfolio /></Layout>
          </AuthProvider>
        } />
        <Route path="/dashboard" element={
          <AuthProvider>
            <Layout><Dashboard /></Layout>
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}