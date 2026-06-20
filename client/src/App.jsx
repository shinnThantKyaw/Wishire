import { Routes, Route, Navigate } from "react-router-dom";
import CreatePage from "./pages/CreatePage.jsx";
import WishPage from "./pages/WishPage.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/create" replace />} />
      <Route path="/create" element={<CreatePage />} />
      <Route
        path="/wish/:id"
        element={
          <ErrorBoundary>
            <WishPage />
          </ErrorBoundary>
        }
      />
    </Routes>
  );
}
