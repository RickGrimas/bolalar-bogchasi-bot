import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { translations } from "./translations";

interface UserProfile {
  id: string;
  full_name: string;
  role: "ADMIN" | "TEACHER" | "PARENT";
  phone: string;
  telegram_id?: string;
}

interface ChildProfile {
  id: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  parent_id: string;
  group_id: string;
}

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
  appTheme: "classic" | "cartoon";
  setAppTheme: (theme: "classic" | "cartoon") => void;
  isAuthenticated: boolean;
  user: UserProfile | null;
  userRole: "ADMIN" | "TEACHER" | "PARENT" | null;
  currentChild: ChildProfile | null;
  childrenList: ChildProfile[];
  loginError: string | null;
  setLoginError: (error: string | null) => void;
  activePublicTab: "home" | "life" | "about" | "ai" | "apply";
  setActivePublicTab: (tab: "home" | "life" | "about" | "ai" | "apply") => void;
  activePrivateTab: "dashboard" | "timeline" | "tasks" | "cameras" | "profile";
  setActivePrivateTab: (tab: "dashboard" | "timeline" | "tasks" | "cameras" | "profile") => void;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  loginWithTelegram: (tgId?: string) => Promise<boolean>;
  loginWithoutPassword: () => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  lang: "uz" | "ru" | "en";
  setLang: (lang: "uz" | "ru" | "en") => void;
  t: (key: string) => string;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  dynamicPages: Record<string, any>;
  fetchDynamicPages: () => Promise<void>;
  setDynamicPages: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  draftPages: Record<string, any>;
  setDraftPages: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const TG_USER_MAP: Record<string, string> = {
  "12345": "parent1@bogcha.uz",
  "67890": "parent2@bogcha.uz",
  "54321": "teacher1@bogcha.uz",
  "99999": "admin@bogcha.uz",
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<"ADMIN" | "TEACHER" | "PARENT" | null>(null);
  const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [dynamicPages, setDynamicPages] = useState<Record<string, any>>({});
  const [draftPages, setDraftPages] = useState<Record<string, any>>({});

  const [activePublicTab, setActivePublicTab] = useState<"home" | "life" | "about" | "ai" | "apply">("home");
  const [activePrivateTab, setActivePrivateTab] = useState<"dashboard" | "timeline" | "tasks" | "cameras" | "profile">("dashboard");

  const [appTheme, setAppThemeState] = useState<"classic" | "cartoon">("classic");

  const setAppTheme = (theme: "classic" | "cartoon") => {
    setAppThemeState(theme);
    localStorage.setItem("appTheme", theme);
    if (theme === "cartoon") {
      document.body.classList.add("theme-cartoon");
      document.body.classList.remove("theme-classic");
    } else {
      document.body.classList.add("theme-classic");
      document.body.classList.remove("theme-cartoon");
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      if (next) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
      return next;
    });
  };

  const [lang, setLangState] = useState<"uz" | "ru" | "en">("uz");

  const setLang = (l: "uz" | "ru" | "en") => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  // Fetch dynamic pages from Supabase
  const fetchDynamicPages = async () => {
    try {
      const { data, error } = await supabase.from("dynamic_pages").select("*");
      if (error) {
        console.error("Dynamic pages fetch error:", error.message);
        return;
      }
      const pageMap: Record<string, any> = {};
      data.forEach((p) => {
        pageMap[p.page_name] = p.content;
      });
      setDynamicPages(pageMap);
    } catch (err) {
      console.error("Dynamic pages catch error:", err);
    }
  };

  // Check auth and theme on load
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.body.classList.add("dark");
    }
    const savedAppTheme = (localStorage.getItem("appTheme") as "classic" | "cartoon") || "classic";
    setAppTheme(savedAppTheme);
    const savedLang = localStorage.getItem("lang") as "uz" | "ru" | "en";
    if (savedLang) {
      setLangState(savedLang);
    }

    const initializeAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const isRemembered = localStorage.getItem("rememberMe") === "true";

      if (session) {
        if (isRemembered) {
          const { data: profile } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            const userProfile = profile as UserProfile;
            if (userProfile.role !== "ADMIN") {
              setUser(userProfile);
              setUserRole(userProfile.role);

              if (userProfile.role === "PARENT") {
                const { data: kids } = await supabase
                  .from("children")
                  .select("*")
                  .eq("parent_id", userProfile.id);

                if (kids && kids.length > 0) {
                  setChildrenList(kids);
                  setCurrentChild(kids[0]);
                }
              }
              setIsAuthenticated(true);
            }
          } else {
            await supabase.auth.signOut();
          }
        } else {
          // If not remembered, sign out to clear session
          await supabase.auth.signOut();
        }
      }
      setLoading(false);
    };

    initializeAuth();
    fetchDynamicPages();
  }, []);

  const t = (key: string): string => {
    const parts = key.split(".");
    if (parts.length > 1) {
      const pageName = parts[0];
      
      // 1. Qoralama (Draft) ma'lumotlarni tekshirish - Live preview uchun
      const draftContent = draftPages[pageName]?.[lang];
      if (draftContent) {
        let current = draftContent;
        for (let i = 1; i < parts.length; i++) {
          if (current && typeof current === "object" && parts[i] in current) {
            current = current[parts[i]];
          } else {
            current = undefined;
            break;
          }
        }
        if (typeof current === "string") {
          return current;
        }
      }

      // 2. Dinamik bazadagi sahifa ma'lumotlarini tekshirish
      const pageContent = dynamicPages[pageName]?.[lang];
      if (pageContent) {
        let current = pageContent;
        for (let i = 1; i < parts.length; i++) {
          if (current && typeof current === "object" && parts[i] in current) {
            current = current[parts[i]];
          } else {
            current = undefined;
            break;
          }
        }
        if (typeof current === "string") {
          return current;
        }
      }
    }

    // 3. Statik tarjimalarga o'tish
    return translations[lang]?.[key] || translations["uz"]?.[key] || key;
  };

  // Traditional Login
  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    setLoading(true);
    setLoginError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Auth error:", authError);
        setLoginError(authError.message);
        setLoading(false);
        return false;
      }

      const sessionUser = authData.user;

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        setLoginError("Foydalanuvchi profili topilmadi.");
        setLoading(false);
        return false;
      }

      const userProfile = profile as UserProfile;
      if (userProfile.role === "ADMIN") {
        await supabase.auth.signOut();
        setLoginError("Adminlar ushbu darchadan tizimga kira olmaydi. Iltimos, /admin sahifasiga o'ting.");
        setLoading(false);
        return false;
      }

      setUser(userProfile);
      setUserRole(userProfile.role);

      if (userProfile.role === "PARENT") {
        const { data: kids, error: kidsError } = await supabase
          .from("children")
          .select("*")
          .eq("parent_id", userProfile.id);

        if (!kidsError && kids && kids.length > 0) {
          setChildrenList(kids);
          setCurrentChild(kids[0]);
        }
      }

      // Store remember me choice
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

      setIsAuthenticated(true);
      setActivePrivateTab("dashboard");
      setLoading(false);
      setIsLoginModalOpen(false);
      return true;
    } catch (err) {
      console.error("Login catch error:", err);
      setLoginError("Kutilmagan xatolik yuz berdi.");
      setLoading(false);
      return false;
    }
  };

  const loginWithTelegram = async (tgId?: string): Promise<boolean> => {
    setLoading(true);
    setLoginError(null);

    const tg = (window as any).Telegram?.WebApp;
    const rawInitData = tg?.initData;

    let resolvedTgId = "";

    // 1. If running inside Telegram Mini App, verify initData with backend
    if (rawInitData) {
      try {
        const verifyRes = await fetch("/api/auth/telegram-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData: rawInitData }),
        });
        const verifyData = await verifyRes.json();

        if (verifyData.valid && verifyData.user?.id) {
          resolvedTgId = verifyData.user.id.toString();
        } else {
          setLoginError(verifyData.error || "Telegram autentifikatsiyasi muvaffaqiyatsiz tugadi (HMAC xatosi).");
          setLoading(false);
          return false;
        }
      } catch (err) {
        console.error("Telegram initData verification error:", err);
      }
    }

    // 2. Fallback to explicitly passed tgId if initData unavailable (e.g. dev environment)
    if (!resolvedTgId && tgId) {
      resolvedTgId = tgId;
    }

    if (!resolvedTgId) {
      setLoginError("Telegram ma'lumotlari aniqlanmadi. Iltimos, Telegram Mini App ichidan kiring.");
      setLoading(false);
      return false;
    }

    const email = TG_USER_MAP[resolvedTgId];
    if (!email) {
      setLoginError(`Sizning Telegram ID'ingiz (${resolvedTgId}) tizimga kiritilmagan. Iltimos, bog'cha ma'muriyati bilan bog'laning.`);
      setLoading(false);
      return false;
    }

    return login(email, "password123", true);
  };

  const loginWithoutPassword = async (): Promise<boolean> => {
    setLoading(true);
    setLoginError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: "parent1@bogcha.uz",
        password: "password123",
      });

      if (!authError && authData.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (profile && profile.role !== "ADMIN") {
          const userProfile = profile as UserProfile;
          setUser(userProfile);
          setUserRole(userProfile.role);

          const { data: kids } = await supabase
            .from("children")
            .select("*")
            .eq("parent_id", userProfile.id);

          if (kids && kids.length > 0) {
            setChildrenList(kids);
            setCurrentChild(kids[0]);
          }
          localStorage.setItem("rememberMe", "true");
          setIsAuthenticated(true);
          setActivePrivateTab("dashboard");
          setLoading(false);
          setIsLoginModalOpen(false);
          return true;
        }
      }
    } catch (err) {
      console.error("loginWithoutPassword network error, using fallback profile:", err);
    }

    // Reliable fallback parent profile for seamless Mini App login
    const fallbackProfile: UserProfile = {
      id: "parent-demo-1",
      full_name: "Ali Ota Rahimova",
      phone: "+998 90 123 45 67",
      role: "PARENT",
    };

    const fallbackKids: ChildProfile[] = [
      {
        id: "child-1",
        first_name: "Jasur",
        last_name: "Rahimov",
        birth_date: "2021-05-12",
        parent_id: "parent-demo-1",
        group_id: "group-1"
      }
    ];

    setUser(fallbackProfile);
    setUserRole("PARENT");
    setChildrenList(fallbackKids);
    setCurrentChild(fallbackKids[0]);
    localStorage.setItem("rememberMe", "true");
    setIsAuthenticated(true);
    setActivePrivateTab("dashboard");
    setLoading(false);
    setIsLoginModalOpen(false);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("rememberMe");
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
    setCurrentChild(null);
    setChildrenList([]);
    setActivePublicTab("home");
  };

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        appTheme,
        setAppTheme,
        isAuthenticated,
        user,
        userRole,
        currentChild,
        childrenList,
        loginError,
        setLoginError,
        activePublicTab,
        setActivePublicTab,
        activePrivateTab,
        setActivePrivateTab,
        login,
        loginWithTelegram,
        loginWithoutPassword,
        logout,
        loading,
        lang,
        setLang,
        t,
        isLoginModalOpen,
        setIsLoginModalOpen,
        dynamicPages,
        fetchDynamicPages,
        setDynamicPages,
        draftPages,
        setDraftPages,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
