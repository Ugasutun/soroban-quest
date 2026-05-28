import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Import infrastructure components eagerly
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./systems/ToastContext";
import LoadingScreen from "./components/LoadingScreen"; // New file fallback
import "./systems/Toast.css";

// ✅ Convert Page imports to use React.lazy() dynamic imports
const Home = lazy(() => import("./pages/Home"));
const MissionMap = lazy(() => import("./pages/MissionMap"));
const MissionDetail = lazy(() => import("./pages/MissionDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            {/* ✅ Wrap with Suspense pointing to our LoadingScreen design system skeleton */}
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/missions" element={<MissionMap />} />
                <Route path="/mission/:missionId" element={<MissionDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}