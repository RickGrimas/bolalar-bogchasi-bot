import React from "react";
import { useApp } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

export const BottomNav: React.FC = () => {
  const {
    isAuthenticated,
    activePublicTab,
    setActivePublicTab,
    activePrivateTab,
    setActivePrivateTab,
    t,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Hide public/parent bottom nav on Admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  const publicMenuItems = [
    { id: "home", path: "/", label: t("pub.home"), icon: "home" },
    { id: "life", path: "/life", label: t("pub.life"), icon: "celebration" },
    { id: "about", path: "/about", label: t("pub.about"), icon: "school" },
    { id: "ai", path: "/ai", label: t("pub.ai"), icon: "smart_toy" },
    { id: "apply", path: "/apply", label: t("pub.apply"), icon: "edit_document" },
  ];

  const privateMenuItems = [
    { id: "dashboard", path: "/dashboard", label: t("tab.home"), icon: "dashboard" },
    { id: "timeline", path: "/timeline", label: t("tab.timeline"), icon: "assignment" },
    { id: "tasks", path: "/tasks", label: t("tab.tasks"), icon: "auto_stories" },
    { id: "cameras", path: "/cameras", label: t("tab.cameras"), icon: "videocam" },
    { id: "profile", path: "/profile", label: t("tab.profile"), icon: "person" },
  ];

  const menuItems = isAuthenticated ? privateMenuItems : publicMenuItems;
  const currentTab = isAuthenticated ? activePrivateTab : activePublicTab;

  const handleTabChange = (item: typeof publicMenuItems[0]) => {
    if (isAuthenticated) {
      setActivePrivateTab(item.id as any);
    } else {
      setActivePublicTab(item.id as any);
    }
    navigate(item.path);
  };

  return (
    <nav className="absolute bottom-0 left-0 w-full z-40 bg-white/85 dark:bg-[#1e293b]/85 backdrop-blur-md border-t border-white/20 dark:border-white/5 shadow-lg px-1.5 py-1.5 flex justify-around items-center h-[72px] transition-colors duration-500 rounded-b-3xl pb-safe">
      {menuItems.map((item) => {
        const isActive = currentTab === item.id || location.pathname === item.path;
        return (
          <button
            key={item.id}
            onClick={() => handleTabChange(item)}
            className="flex flex-col items-center justify-center flex-1 h-full py-0.5 text-center group active:scale-95 transition-all duration-150"
          >
            <div
              className={`flex items-center justify-center w-9 h-7 rounded-full mb-1 transition-all duration-300 ${
                isActive
                  ? "bg-cyan-500 text-white font-semibold shadow-sm"
                  : "text-on-surface-variant dark:text-gray-400 group-hover:bg-cyan-500/10"
              }`}
            >
              <span
                className="material-symbols-outlined text-[19px]"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
            </div>
            <span
              className={`font-quicksand text-[8px] font-bold tracking-tight transition-colors duration-300 ${
                isActive ? "text-cyan-500 dark:text-[#89ceff] font-bold" : "text-on-surface-variant dark:text-gray-400"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
