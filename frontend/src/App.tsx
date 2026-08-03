import React, { useState, useEffect, lazy, Suspense } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { DayNightBackground } from "./components/DayNightBackground";
import { LoginModal } from "./components/LoginModal";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

// Public pages - Lazy Loaded for Production Performance
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Life = lazy(() => import("./pages/Life").then(m => ({ default: m.Life })));
const AboutUs = lazy(() => import("./pages/AboutUs").then(m => ({ default: m.AboutUs })));
const AI = lazy(() => import("./pages/AI").then(m => ({ default: m.AI })));
const Apply = lazy(() => import("./pages/Apply").then(m => ({ default: m.Apply })));
const Help = lazy(() => import("./pages/Help").then(m => ({ default: m.Help })));

// Private pages - Lazy Loaded for Production Performance
const Dashboard = lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const DailyLog = lazy(() => import("./pages/DailyLog").then(m => ({ default: m.DailyLog })));
const LiveCams = lazy(() => import("./pages/LiveCams").then(m => ({ default: m.LiveCams })));
const Tasks = lazy(() => import("./pages/Tasks").then(m => ({ default: m.Tasks })));
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));

// Production Loading Fallback Spinner
const PageLoader: React.FC = () => (
  <div className="w-full h-64 flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-bold text-slate-400 font-quicksand">Yuklanmoqda...</span>
  </div>
);

// Offline Connection Status Banner
const OfflineBanner: React.FC = () => (
  <div className="fixed top-0 left-0 w-full bg-amber-500 text-slate-950 font-bold text-xs py-1.5 px-4 text-center z-50 shadow-md flex items-center justify-center gap-2">
    <span className="material-symbols-outlined text-sm">wifi_off</span>
    <span>Internet aloqasi uzildi. Ba'zi funksiyalar cheklangan bo'lishi mumkin.</span>
  </div>
);

const AppContent: React.FC = () => {
  const { isDark, appTheme } = useApp();
  const location = useLocation();

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Telegram Mini App Expansion & Closing Lock Setup
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      if (typeof tg.enableClosingConfirmation === "function") {
        tg.enableClosingConfirmation();
      }
    }
  }, []);

  // Offline / Online Network Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");

  // FULL DESKTOP VIEWPORT RENDER FOR ADMIN PANEL
  if (isAdminRoute) {
    return (
      <div className={`min-h-screen w-full relative transition-colors duration-500 ${appTheme === "cartoon" ? "theme-cartoon" : "theme-classic"}`}>
        {!isOnline && <OfflineBanner />}
        <DayNightBackground isDark={isDark} />
        <div className="fixed inset-0 z-50 w-full h-full overflow-hidden">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/admin/*" element={<AdminPanel />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    );
  }

  // PUBLIC & USER MOBILE CONTAINER MOCKUP
  return (
    <div className={`min-h-screen w-full relative transition-colors duration-500 ${appTheme === "cartoon" ? "theme-cartoon" : "theme-classic"}`}>
      {!isOnline && <OfflineBanner />}

      {/* 2D Theme-Aware Background covering the entire viewport */}
      <DayNightBackground isDark={isDark} />

      {/* Centered Mobile Frame Mockup Container */}
      <div className="mobile-container overflow-hidden flex flex-col relative">
        <Navbar />

        {/* Scrollable Content inside the mobile view */}
        <main className="flex-1 w-full overflow-y-auto z-10 scrollbar-none flex flex-col pt-16 pb-[76px]">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/life" element={<Life />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/ai" element={<AI />} />
              <Route path="/apply" element={<Apply />} />
              <Route path="/help" element={<Help />} />

              {/* Private User Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/timeline" element={<DailyLog />} />
              <Route path="/cameras" element={<LiveCams />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/profile" element={<Profile />} />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Login Modal */}
      <LoginModal />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
