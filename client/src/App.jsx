import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import CreatePage from "./pages/CreatePage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import WishPage from "./pages/WishPage.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export default function App() {
  const { pathname } = useLocation();
  const showFooter = !pathname.startsWith("/wish/");

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/success/:id" element={<SuccessPage />} />
        <Route
          path="/wish/:id"
          element={
            <ErrorBoundary>
              <WishPage />
            </ErrorBoundary>
          }
        />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}
