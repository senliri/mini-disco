import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "./lib/i18n-context";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Report } from "./pages/Report";
import { Appeal } from "./pages/Appeal";

export function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/report" element={<Layout><Report /></Layout>} />
          <Route path="/appeal" element={<Layout><Appeal /></Layout>} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}