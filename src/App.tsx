import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Report } from "./pages/Report";
import { Appeal } from "./pages/Appeal";
import { useDynamicMeta } from "./hooks/useDynamicMeta";

export function App() {
  useDynamicMeta();
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/appeal" element={<Appeal />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}