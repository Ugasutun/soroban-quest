import React, { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./systems/ToastContext";
import LoadingScreen from "./components/LoadingScreen";
import { loadProgress, saveProgress } from "./systems/storage";
import { updateStreak } from "./systems/gameEngine";
import "./systems/Toast.css";

// Lazy load page components
const Home = lazy(() => import("./pages/Home"));
const MissionMap = lazy(() => import("./pages/MissionMap"));
const MissionDetail = lazy(() => import("./pages/MissionDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Journal = lazy(() => import("./pages/Journal"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const SkillTree = lazy(() => import("./pages/SkillTree"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  useEffect(() => {
    const state = loadProgress();
    const newState = updateStreak(state);
    saveProgress(newState);
  }, []);

  const location = useLocation();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/missions" element={<MissionMap />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/mission/:missionId" element={<MissionDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/skills" element={<SkillTree />} />
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