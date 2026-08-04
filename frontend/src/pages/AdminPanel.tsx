import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { toast } from "react-hot-toast";
import { BotSettingsPage } from "./BotSettingsPage";

type Mode = "CMS" | "CRM";

interface Permissions {
  canEditCms: boolean;
  canManageLeads: boolean;
  canManageChildren: boolean;
  canManageGroups: boolean;
  canSendBroadcast: boolean;
  canManageCameras: boolean;
  canManageFinance: boolean;
  canManageAdmins: boolean;
}

const FULL_PERMISSIONS: Permissions = {
  canEditCms: true,
  canManageLeads: true,
  canManageChildren: true,
  canManageGroups: true,
  canSendBroadcast: true,
  canManageCameras: true,
  canManageFinance: true,
  canManageAdmins: true,
};

const DEFAULT_SUB_PERMISSIONS: Permissions = {
  canEditCms: false,
  canManageLeads: true,
  canManageChildren: true,
  canManageGroups: true,
  canSendBroadcast: false,
  canManageCameras: false,
  canManageFinance: false,
  canManageAdmins: false,
};

export const AdminPanel: React.FC = () => {
  const { isDark, toggleTheme, lang, setLang, t } = useApp();

  // Auth State
  const [adminUser, setAdminUser] = useState<any>({ email: "admin@bogcha.uz", role: "ADMIN" });
  const [adminEmail, setAdminEmail] = useState("admin@bogcha.uz");
  const [adminPassword, setAdminPassword] = useState("admin");
  const [loggingIn, setLoggingIn] = useState(false);

  // Settings Gear Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Core App Modes & Tabs State (Strictly Separated)
  const [mode, setMode] = useState<Mode>("CMS");
  const [activeCmsTab, setActiveCmsTab] = useState<string>("home");
  const [activeCrmTab, setActiveCrmTab] = useState<string>("children");

  // APPLY Tab Dedicated State
  const [applySubTab, setApplySubTab] = useState<"leads" | "form_builder">("leads");
  const [leadViewMode, setLeadViewMode] = useState<"kanban" | "table">("kanban");
  const [leadFilterStatus, setLeadFilterStatus] = useState<string>("ALL");
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>("");

  // ADMINS Tab Dedicated State
  const [adminsSubTab, setAdminsSubTab] = useState<"list" | "create">("list");
  const [adminViewMode, setAdminViewMode] = useState<"kanban" | "table">("kanban");
  const [showTgBotModal, setShowTgBotModal] = useState<boolean>(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>("");
  const [adminFilterRole, setAdminFilterRole] = useState<string>("ALL");

  // CRM CHILDREN & PARENTS ACCOUNT SYSTEM STATE
  const [childrenSubTab, setChildrenSubTab] = useState<"profiles" | "create" | "analytics">("profiles");
  const [childrenViewMode, setChildrenViewMode] = useState<"kanban" | "table">("kanban");
  const [childrenSearchQuery, setChildrenSearchQuery] = useState<string>("");
  const [childrenGroupFilter, setChildrenGroupFilter] = useState<string>("ALL");
  const [childrenPaymentFilter, setChildrenPaymentFilter] = useState<string>("ALL");

  // Direct Parent Messaging Modal
  const [directMsgModal, setDirectMsgModal] = useState<{
    isOpen: boolean;
    parentName: string;
    parentPhone: string;
    childName: string;
    template: string;
    text: string;
  }>({
    isOpen: false,
    parentName: "",
    parentPhone: "",
    childName: "",
    template: "",
    text: "",
  });

  // Rich Account Profiles Data with Smart Payment Due Countdown (`due_days_left`)
  const [accountProfiles, setAccountProfiles] = useState<any[]>([
    {
      id: "acc-1",
      parent_name: "Ali Ota Rahimova",
      parent_phone: "+998 90 123 45 67",
      parent_tg_id: "123456789",
      child_name: "Aliya Alieva",
      child_age: "4 yosh",
      group: "Kamalak",
      payment_status: "PAID", // PAID, PARTIAL, DEBT
      account_status: "ACTIVE",
      due_days_left: 25, // 25 days remaining in billing cycle
      notes: "Doimiy vaqtida to'lov qiladi",
    },
    {
      id: "acc-2",
      parent_name: "Vali Ota Valiev",
      parent_phone: "+998 90 234 56 78",
      parent_tg_id: "987654321",
      child_name: "Valisher Valiev",
      child_age: "3 yosh",
      group: "Kamalak",
      payment_status: "PARTIAL",
      account_status: "ACTIVE",
      due_days_left: 2, // ⏰ 2 days left (Warning Alert Zone!)
      notes: "Yarim to'lov o'tkazilgan, qolgani oy ostonasida kutilmoqda",
    },
    {
      id: "acc-3",
      parent_name: "Zebo Karimova",
      parent_phone: "+998 91 345 67 89",
      parent_tg_id: "555444333",
      child_name: "Jasur Karimov",
      child_age: "5 yosh",
      group: "Yulduzcha",
      payment_status: "DEBT",
      account_status: "ACTIVE",
      due_days_left: -3, // 🚨 3 days overdue!
      notes: "1 oylik to'lov qarzdorligi mavjud",
    },
    {
      id: "acc-4",
      parent_name: "Sardor Solihov",
      parent_phone: "+998 93 456 78 90",
      parent_tg_id: "111222333",
      child_name: "Madina Soliho'jaeva",
      child_age: "4 yosh",
      group: "Yulduzcha",
      payment_status: "PAID",
      account_status: "ACTIVE",
      due_days_left: 1, // ⏰ 1 day left (Warning Alert Zone!)
      notes: "Tadbirlarda faol ishtirok etadi",
    },
  ]);

  const [newAccForm, setNewAccForm] = useState<any>({
    parent_name: "",
    parent_phone: "",
    parent_tg_id: "",
    child_name: "",
    child_age: "4 yosh",
    group: "Kamalak",
    payment_status: "PAID",
    account_status: "ACTIVE",
    due_days_left: 30,
    notes: "",
  });
  const [editingAccId, setEditingAccId] = useState<string | null>(null);

  // Detailed leads list with full pipeline statuses
  const [applyLeads, setApplyLeads] = useState<any[]>([
    { id: "lead-101", parent_name: "Rustam Alimov", phone: "+998 90 123 45 67", child: "Jasur", age: "4 yosh", status: "YANGI", date: "2026-08-02", notes: "Yozgi guruhga yozilmoqchi" },
    { id: "lead-102", parent_name: "Nigora Umarova", phone: "+998 93 987 65 43", child: "Madina", age: "3 yosh", status: "POTENSIAL", date: "2026-08-01", notes: "Qo'shimcha ingliz tili so'ramoqda" },
    { id: "lead-103", parent_name: "Bobur Tursunov", phone: "+998 97 555 44 33", child: "Aziz", age: "5 yosh", status: "JARAYONDA", date: "2026-07-31", notes: "Sinov kunidan o'tdi, shartnoma kutilmoqda" },
    { id: "lead-104", parent_name: "Shahnoza Karimova", phone: "+998 91 222 33 44", child: "Imron", age: "4 yosh", status: "QABUL_QILINDI", date: "2026-07-30", notes: "Hujjatlar va to'lov to'liq topshirildi" },
    { id: "lead-105", parent_name: "Farrux Qodirov", phone: "+998 90 888 77 66", child: "Samira", age: "3 yosh", status: "RAD_ETILDI", date: "2026-07-28", notes: "Manzil uzoqligi sababli bekor qilindi" },
  ]);

  // Dynamic Form Questions for Web App Apply Page
  const [formFields, setFormFields] = useState<any[]>([
    { id: "f1", label: "Ota-ona Ism-sharifi", placeholder: "Ism-sharifingizni kiriting...", type: "text", required: true },
    { id: "f2", label: "Aloqa Telefon Raqami", placeholder: "+998 90 123 45 67", type: "phone", required: true },
    { id: "f3", label: "Bolaning Ism-sharifi", placeholder: "Bolaning ism va familiyasi", type: "text", required: false },
    { id: "f4", label: "Bolaning Yoshi", placeholder: "Masalan: 4 yosh", type: "number", required: false },
    { id: "f5", label: "Qo'shimcha Izoh yoki Istaklar", placeholder: "Bog'chadan kutayotgan sharoitlaringiz...", type: "textarea", required: false },
  ]);

  const [newQuestionForm, setNewQuestionForm] = useState<any>({
    label: "",
    placeholder: "",
    type: "text",
    required: false,
  });

  const [contactSettings, setContactSettings] = useState({
    phone: "+998 (71) 123-45-67",
    address: "Toshkent shahri, Yunusobod tumani, 4-mavze",
    yandexMapUrl: "https://yandex.ru/map-widget/v1/?ll=69.204543%2C41.278508&z=16&pt=69.204543%2C41.278508%2Cpm2rdl"
  });

  // Admin Management State
  const [adminsList, setAdminsList] = useState<any[]>([
    { id: "1", name: "Sardor Aliyev", tg_id: "123456789", role: "SUPER_ADMIN", status: "ACTIVE", permissions: FULL_PERMISSIONS },
    { id: "2", name: "Malika Solihova", tg_id: "987654321", role: "SUB_ADMIN", status: "ACTIVE", permissions: DEFAULT_SUB_PERMISSIONS },
    { id: "3", name: "Jahongir Olimov", tg_id: "555666777", role: "EDUCATOR", status: "ACTIVE", permissions: { ...DEFAULT_SUB_PERMISSIONS, canManageChildren: true, canManageGroups: true } },
    { id: "4", name: "Elena Petrova", tg_id: "444333222", role: "STAFF", status: "ACTIVE", permissions: { ...DEFAULT_SUB_PERMISSIONS, canManageCameras: true } },
  ]);

  const [adminForm, setAdminForm] = useState<any>({
    name: "",
    tg_id: "",
    role: "SUB_ADMIN",
    status: "ACTIVE",
    permissions: { ...DEFAULT_SUB_PERMISSIONS }
  });
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);

  // Telegram Bot Simulator State
  const [testTgIdInput, setTestTgIdInput] = useState<string>("123456789");
  const [simulatedAdmin, setSimulatedAdmin] = useState<any | null>(adminsList[0]);

  // CRM Demo Data State
  const [groupsList, setGroupsList] = useState<any[]>([
    { id: "g1", name: "Kamalak guruhi", age: "3-4 yosh", count: 22, teacher: "Dilnoza Opa" },
    { id: "g2", name: "Yulduzcha guruhi", age: "4-5 yosh", count: 18, teacher: "Malika Opa" },
    { id: "g3", name: "Quyoshcha guruhi", age: "5-6 yosh", count: 25, teacher: "Shahnoza Opa" },
  ]);

  const [announcements, setAnnouncements] = useState<any[]>([
    { id: "1", title: "Ertaga bayram tadbiri!", text: "Bolalarni bayramona kiyimda olib keling." },
    { id: "2", title: "Tibbiy ko'rik", text: "Juma kuni bog'chamizda shifokor ko'rigi bo'ladi." },
  ]);

  const [camerasList, setCamerasList] = useState<any[]>([
    { id: "cam-1", name: "Kamalak xonasi", stream: "HD Stream 1 (Online)", status: "Active" },
    { id: "cam-2", name: "O'yin maydonchasi", stream: "HD Stream 2 (Online)", status: "Active" },
    { id: "cam-3", name: "Oshxona zal", stream: "HD Stream 3 (Online)", status: "Active" },
  ]);

  const [tasksList, setTasksList] = useState<any[]>([
    { id: "t1", title: "Tibbiy ko'rik xulosalarini kiritish", status: "BAJARILDI", assignee: "Dilnoza Opa" },
    { id: "t2", title: "Yozgi sport tadbiri rejasini tuzish", status: "JARAYONDA", assignee: "Malika Opa" },
    { id: "t3", title: "Yangi guruh uchun jihozlar buyurtma qilish", status: "KUTILMOQDA", assignee: "Sardor Aliyev" },
  ]);

  // Form input states
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnText, setNewAnnText] = useState("");
  const [msgSubject, setMsgSubject] = useState("");
  const [msgText, setMsgText] = useState("");
  const [aiPromptText, setAiPromptText] = useState("Siz Bolalar Bog'chasi uchun aqlli CRM assistentisiz. Ota-onalarga sharoitlar va narxlar haqida javob bering.");

  // Bulk Auto-Reminder Dispatch Handler
  const handleSendBulkDueReminders = () => {
    const dueAccounts = accountProfiles.filter(a => a.due_days_left <= 3 || a.payment_status === "DEBT" || a.payment_status === "PARTIAL");
    if (dueAccounts.length === 0) {
      toast.success("Hozirda to'lov vaqti yaqinlashgan ota-onalar yo'q!");
      return;
    }
    toast.success(`🚀 Telegram Bot: ${dueAccounts.length} ta ota-onaga avtomatik oylik to'lov eslatmasi yuborildi!`);
  };

  // Handlers for Account Profiles
  const handleSaveAccountProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccForm.parent_name || !newAccForm.child_name) {
      toast.error("Ota-ona va Bola ismi bo'sh bo'lishi mumkin emas!");
      return;
    }
    if (editingAccId) {
      setAccountProfiles(accountProfiles.map(a => a.id === editingAccId ? { ...newAccForm, id: editingAccId } : a));
      setEditingAccId(null);
      toast.success("Ota-ona va bola profili yangilandi!");
    } else {
      const newAcc = {
        id: "acc-" + Date.now(),
        ...newAccForm
      };
      setAccountProfiles([newAcc, ...accountProfiles]);
      toast.success("Yangi akkaunt profili bazaga qo'shildi!");
    }
    setNewAccForm({
      parent_name: "",
      parent_phone: "",
      parent_tg_id: "",
      child_name: "",
      child_age: "4 yosh",
      group: "Kamalak",
      payment_status: "PAID",
      account_status: "ACTIVE",
      due_days_left: 30,
      notes: "",
    });
    setChildrenSubTab("profiles");
  };

  const handleEditAccountClick = (acc: any) => {
    setEditingAccId(acc.id);
    setNewAccForm({ ...acc });
    setChildrenSubTab("create");
    toast.success(`${acc.parent_name} profili tahrirlash formasiga yuklandi.`);
  };

  const handleDeleteAccountClick = (id: string) => {
    setAccountProfiles(accountProfiles.filter(a => a.id !== id));
    toast.success("Akkaunt bazadan o'chirildi.");
  };

  const handleUpdatePaymentStatus = (id: string, newPaymentStatus: string) => {
    setAccountProfiles(accountProfiles.map(a => {
      if (a.id === id) {
        const nextDays = newPaymentStatus === "PAID" ? 30 : a.due_days_left;
        return { ...a, payment_status: newPaymentStatus, due_days_left: nextDays };
      }
      return a;
    }));
    const label = newPaymentStatus === "PAID" ? "🟢 To'langan" : newPaymentStatus === "PARTIAL" ? "🟡 Qisman To'langan" : "🔴 Qarzdorlik bor";
    toast.success(`To'lov statusi ${label} ga o'zgartirildi.`);
  };

  const handleUpdateAccountStatus = (id: string, newAccStatus: string) => {
    setAccountProfiles(accountProfiles.map(a => a.id === id ? { ...a, account_status: newAccStatus } : a));
    toast.success(`Akkaunt statusi "${newAccStatus}" ga o'zgartirildi.`);
  };

  const handleOpenDirectMsgModal = (acc: any) => {
    setDirectMsgModal({
      isOpen: true,
      parentName: acc.parent_name,
      parentPhone: acc.parent_phone || "+998 90 123 45 67",
      childName: acc.child_name,
      template: "PAYMENT_REMINDER",
      text: `Hush kelibsiz! Xurmatli ${acc.parent_name}, farzandingiz ${acc.child_name} uchun oylik bog'cha to'lovi muddati kelgani haqida bildiramiz (Qolgan vaqt: ${acc.due_days_left <= 0 ? "🚨 Bugun/O'tgan" : `${acc.due_days_left} kun`}).`
    });
  };

  const handleSendDirectMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsgModal.text) return;
    toast.success(`Shaxsiy bildirishnoma ${directMsgModal.parentName} (${directMsgModal.parentPhone}) ga yuborildi!`);
    setDirectMsgModal({ ...directMsgModal, isOpen: false });
  };

  // Lead Pipeline Handlers
  const handleUpdateLeadStatus = (id: string, newStatus: string) => {
    setApplyLeads(applyLeads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    toast.success(`Ariza statusi "${newStatus}" ga o'zgartirildi!`);
  };

  const handleDeleteLead = (id: string) => {
    setApplyLeads(applyLeads.filter(l => l.id !== id));
    toast.success("Ariza tizimdan o'chirildi!");
  };

  // Form Builder Handlers
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionForm.label) {
      toast.error("Savol sarlavhasini kiriting!");
      return;
    }
    const newField = {
      id: "f_" + Date.now(),
      ...newQuestionForm
    };
    setFormFields([...formFields, newField]);
    setNewQuestionForm({ label: "", placeholder: "", type: "text", required: false });
    toast.success("Yangi savol ariza shakliga qo'shildi!");
  };

  const handleMoveQuestionUp = (index: number) => {
    if (index === 0) return;
    const updated = [...formFields];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setFormFields(updated);
  };

  const handleMoveQuestionDown = (index: number) => {
    if (index === formFields.length - 1) return;
    const updated = [...formFields];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setFormFields(updated);
  };

  const handleDeleteQuestion = (id: string) => {
    setFormFields(formFields.filter(f => f.id !== id));
    toast.success("Savol shakldan o'chirildi!");
  };

  // Admin Role & Permissions Handlers
  const handleRoleChange = (newRole: string) => {
    if (newRole === "SUPER_ADMIN" || newRole === "MAIN_ADMIN") {
      setAdminForm({
        ...adminForm,
        role: newRole,
        permissions: { ...FULL_PERMISSIONS }
      });
      toast.success(`${newRole} uchun barcha vakolatlar 100% ochiq qilindi!`);
    } else {
      setAdminForm({
        ...adminForm,
        role: newRole,
        permissions: { ...DEFAULT_SUB_PERMISSIONS }
      });
    }
  };

  const handleTogglePermission = (key: keyof Permissions) => {
    if (adminForm.role === "SUPER_ADMIN" || adminForm.role === "MAIN_ADMIN") {
      toast.error("Asosiy Adminlarda barcha vakolatlar yoniq bo'lishi shart!");
      return;
    }
    setAdminForm({
      ...adminForm,
      permissions: {
        ...adminForm.permissions,
        [key]: !adminForm.permissions[key]
      }
    });
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.tg_id) {
      toast.error("Ism va Telegram ID bo'sh bo'lishi mumkin emas!");
      return;
    }
    if (editingAdminId) {
      setAdminsList(adminsList.map(a => a.id === editingAdminId ? { ...adminForm, id: editingAdminId } : a));
      setEditingAdminId(null);
      toast.success("Admin ma'lumotlari va vakolatlari yangilandi!");
    } else {
      setAdminsList([...adminsList, { ...adminForm, id: Date.now().toString() }]);
      toast.success("Yangi admin muvaffaqiyatli qo'shildi!");
    }
    setAdminForm({
      name: "",
      tg_id: "",
      role: "SUB_ADMIN",
      status: "ACTIVE",
      permissions: { ...DEFAULT_SUB_PERMISSIONS }
    });
    setAdminsSubTab("list");
  };

  const handleEditAdminClick = (admin: any) => {
    setEditingAdminId(admin.id);
    setAdminForm({ ...admin });
    setAdminsSubTab("create");
    toast.success(`${admin.name} tahrirlash formasiga yuklandi.`);
  };

  const handleDeleteAdminClick = (id: string) => {
    setAdminsList(adminsList.filter(a => a.id !== id));
    toast.success("Admin tizimdan o'chirildi.");
  };

  const handleToggleAdminStatus = (id: string) => {
    setAdminsList(adminsList.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        toast.success(`Admin statusi ${nextStatus} ga o'zgartirildi.`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  // Telegram Bot Simulator Handler
  const handleTestTgId = () => {
    const found = adminsList.find(a => a.tg_id === testTgIdInput.trim() && a.status === "ACTIVE");
    if (found) {
      setSimulatedAdmin(found);
      toast.success(`Telegram ID: ${testTgIdInput} tasdiqlandi! Admin: ${found.name}`);
    } else {
      setSimulatedAdmin(null);
      toast.error(`Telegram ID: ${testTgIdInput} bazadan topilmadi yoki bloklangan!`);
    }
  };

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setTimeout(() => {
      if (adminEmail && adminPassword) {
        setAdminUser({ email: adminEmail, role: "ADMIN" });
        toast.success("Admin panelga muvaffaqiyatli kirildi!");
      } else {
        toast.error("Email va parolni kiriting.");
      }
      setLoggingIn(false);
    }, 500);
  };

  const handleAdminLogout = () => {
    setAdminUser(null);
    setShowSettingsModal(false);
    toast.success("Admin panelidan chiqindi.");
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnText) return;
    setAnnouncements([{ id: Date.now().toString(), title: newAnnTitle, text: newAnnText }, ...announcements]);
    setNewAnnTitle("");
    setNewAnnText("");
    toast.success("Yangi e'lon e'lon qilindi!");
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText) return;
    setMsgSubject("");
    setMsgText("");
    toast.success("Ommaviy xabarnoma barcha ota-onalarga yuborildi!");
  };

  // Filtered Lists
  const filteredLeads = applyLeads.filter(l => {
    const matchesStatus = leadFilterStatus === "ALL" || l.status === leadFilterStatus;
    const matchesSearch = !leadSearchQuery || 
      l.parent_name.toLowerCase().includes(leadSearchQuery.toLowerCase()) || 
      l.phone.includes(leadSearchQuery) || 
      l.child.toLowerCase().includes(leadSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredAdmins = adminsList.filter(a => {
    const matchesRole = adminFilterRole === "ALL" || a.role === adminFilterRole;
    const matchesSearch = !adminSearchQuery ||
      a.name.toLowerCase().includes(adminSearchQuery.toLowerCase()) ||
      a.tg_id.includes(adminSearchQuery);
    return matchesRole && matchesSearch;
  });

  const filteredAccountProfiles = accountProfiles.filter(acc => {
    const matchesGroup = childrenGroupFilter === "ALL" || acc.group === childrenGroupFilter;
    
    let matchesPayment = true;
    if (childrenPaymentFilter === "DUE_SOON") {
      matchesPayment = acc.due_days_left <= 3 || acc.payment_status === "DEBT" || acc.payment_status === "PARTIAL";
    } else if (childrenPaymentFilter !== "ALL") {
      matchesPayment = acc.payment_status === childrenPaymentFilter;
    }

    const matchesSearch = !childrenSearchQuery ||
      acc.parent_name.toLowerCase().includes(childrenSearchQuery.toLowerCase()) ||
      acc.child_name.toLowerCase().includes(childrenSearchQuery.toLowerCase()) ||
      acc.parent_phone.includes(childrenSearchQuery) ||
      (acc.parent_tg_id && acc.parent_tg_id.includes(childrenSearchQuery));
    return matchesGroup && matchesPayment && matchesSearch;
  });

  // Count due soon accounts (within 3 days or debt/partial)
  const dueSoonCount = accountProfiles.filter(a => a.due_days_left <= 3 || a.payment_status === "DEBT" || a.payment_status === "PARTIAL").length;

  // Helper for rendering payment countdown badge
  const renderDueCountdownBadge = (days: number, paymentStatus: string) => {
    if (paymentStatus === "PAID" && days > 3) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">schedule</span>
          {days} kun qoldi
        </span>
      );
    }
    if (days <= 0 || paymentStatus === "DEBT") {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">warning</span>
          {days < 0 ? `🚨 ${Math.abs(days)} kun kechikdi` : "🚨 Bugun to'lov kuni!"}
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">alarm</span>
        ⏰ To'lovga {days} kun qoldi
      </span>
    );
  };

  // 1. UNAUTHENTICATED ADMIN LOGIN CARD
  if (!adminUser) {
    return (
      <div className={`w-full h-screen flex items-center justify-center p-4 font-quicksand transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
        <form
          onSubmit={handleAdminLogin}
          className={`w-full max-w-sm rounded-3xl border shadow-2xl p-8 flex flex-col gap-5 text-left backdrop-blur-md relative overflow-hidden ${
            isDark ? "bg-slate-900/90 border-cyan-500/30 text-white" : "bg-white border-slate-200 text-slate-900 shadow-xl"
          }`}
        >
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mt-1 mb-1">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-3 shadow-lg">
              <span className="material-symbols-outlined text-4xl font-bold">admin_panel_settings</span>
            </div>
            <h2 className="font-bold text-xl">CloudCare Admin Panel</h2>
            <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Boshqaruv markaziga kirish</p>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Admin Email</label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 ${
                isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
              }`}
              placeholder="admin@bogcha.uz"
            />
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Parol</label>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 ${
                isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
              }`}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="w-full mt-3 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg border-b-4 border-cyan-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loggingIn ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-base">login</span>
                Admin Panelga Kirish
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // 2. AUTHENTICATED DESKTOP / RESPONSIVE ADMIN PANEL INTERFACE
  return (
    <div className={`w-full h-screen overflow-hidden flex flex-col font-quicksand transition-colors duration-500 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      
      {/* TOP HEADER BAR WITH LOGO, MODE BADGE & SETTINGS GEAR POPOVER ⚙️ */}
      <header className={`h-16 w-full flex-shrink-0 flex items-center justify-between px-6 z-30 border-b backdrop-blur-md transition-colors ${
        isDark ? "bg-slate-950/90 border-slate-800 text-white" : "bg-white/90 border-slate-200 text-slate-900 shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-md">
            <span className="material-symbols-outlined text-2xl font-bold">child_care</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-base bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">CloudCare Admin</span>
            <span className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Boshqaruv Tizimi</span>
          </div>
          <span className={`ml-2 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider text-white shadow-sm ${
            mode === "CMS" ? "bg-cyan-500" : "bg-indigo-500"
          }`}>
            {mode === "CMS" ? "🌐 CMS SAYT" : "🔒 CRM TIZIMI"}
          </span>
        </div>

        {/* Top Right Controls (Settings Gear ⚙️ Popover Dropdown) */}
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowSettingsModal((prev) => !prev)}
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center shadow-sm ${
              showSettingsModal 
                ? "border-cyan-500 bg-cyan-500/10 text-cyan-400 ring-2 ring-cyan-500/30" 
                : isDark ? "border-slate-800 text-slate-300 hover:bg-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Tizim Sozlamalari"
          >
            <span className="material-symbols-outlined text-xl">settings</span>
          </button>

          {/* SETTINGS POPOVER DROPDOWN MENU */}
          {showSettingsModal && (
            <div className={`absolute right-0 top-14 w-80 rounded-3xl shadow-2xl p-5 flex flex-col gap-4 text-left z-50 backdrop-blur-xl border ${
              isDark ? "bg-slate-950/95 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
            }`}>
              <div className="flex items-center justify-between border-b pb-3 border-inherit">
                <span className="font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-400 text-lg">settings</span>
                  Tizim Sozlamalari
                </span>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              {/* Mode Switcher (CMS vs CRM) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejimni Tanlang</label>
                <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  <button
                    onClick={() => { setMode("CMS"); setActiveCmsTab("home"); setShowSettingsModal(false); toast.success("🌐 CMS Sayt Boshqaruvi Yoqildi"); }}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      mode === "CMS" ? "bg-cyan-500 text-white shadow-lg font-extrabold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🌐 CMS Sayt
                  </button>
                  <button
                    onClick={() => { setMode("CRM"); setActiveCrmTab("children"); setShowSettingsModal(false); toast.success("🔒 CRM Bog'cha Tizimi Yoqildi"); }}
                    className={`py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      mode === "CRM" ? "bg-indigo-500 text-white shadow-lg font-extrabold" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🔒 CRM Tizimi
                  </button>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tizim Tili</label>
                <div className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  {(["uz", "ru", "en"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); toast.success(`Til ${l.toUpperCase()} ga o'zgartirildi`); }}
                      className={`py-1.5 rounded-xl font-bold text-xs uppercase transition-all ${
                        lang === l ? "bg-cyan-500 text-white shadow" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mavzu (Theme)</label>
                <div className={`grid grid-cols-2 gap-2 p-1.5 rounded-2xl border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"}`}>
                  <button
                    onClick={() => { if (isDark) toggleTheme(); }}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${!isDark ? "bg-amber-500/20 text-amber-500 border border-amber-500/40" : "text-slate-400"}`}
                  >
                    <span className="material-symbols-outlined text-sm">light_mode</span> Kunduzgi
                  </button>
                  <button
                    onClick={() => { if (!isDark) toggleTheme(); }}
                    className={`py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 ${isDark ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-slate-400"}`}
                  >
                    <span className="material-symbols-outlined text-sm">dark_mode</span> Tungi
                  </button>
                </div>
              </div>

              {/* Logout Action */}
              <button
                onClick={handleAdminLogout}
                className="w-full mt-1 py-2.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs rounded-2xl border border-red-500/30 flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                Admin Seansidan Chiqish
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2-PANEL LAYOUT (LEFT CONTROL PANEL SIDEBAR + RIGHT WORKSPACE PANEL) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT CONTROL PANEL (SIDEBAR - Visible on Desktop md:flex, Hidden on Mobile) */}
        <aside className={`hidden md:flex w-64 border-r flex-col justify-between flex-shrink-0 z-20 shadow-xl transition-colors duration-300 ${
          isDark ? "bg-slate-950 border-slate-800/80 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <div className="flex flex-col flex-1 overflow-y-auto p-4 gap-4 scrollbar-none">
            
            {/* Sidebar Section Title */}
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-inherit">
              <span className={`font-bold text-xs uppercase tracking-wider ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}>
                {mode === "CMS" ? "🌐 CMS Menyular" : "🔒 CRM Menyular"}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                mode === "CMS" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              }`}>
                {mode}
              </span>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="flex flex-col gap-1.5">
              {mode === "CMS" ? (
                <>
                  {[
                    { id: "home", label: t("admin.cms.home"), icon: "home" },
                    { id: "life", label: t("admin.cms.life"), icon: "sports_esports" },
                    { id: "about", label: t("admin.cms.about"), icon: "diversity_3" },
                    { id: "ai", label: t("admin.cms.ai"), icon: "neurology" },
                    { id: "bot_settings", label: "🤖 Bot Sozlamalari", icon: "settings_suggest" },
                    { id: "apply", label: "CRM ni Boshqarish", icon: "assignment" },
                    { id: "admins", label: "Adminlar & Vakolatlar", icon: "admin_panel_settings" },
                    { id: "help", label: t("admin.cms.help"), icon: "help" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCmsTab(tab.id)}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center gap-3 transition-all ${
                        activeCmsTab === tab.id 
                          ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 font-extrabold" 
                          : isDark 
                            ? "text-slate-400 hover:bg-slate-900 hover:text-white" 
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { id: "children", label: t("admin.crm.children"), icon: "boy" },
                    { id: "leads", label: "🤖 AI Leadlar", icon: "contacts" },
                    { id: "groups", label: t("admin.crm.groups"), icon: "group_work" },
                    { id: "messages", label: t("admin.crm.messages"), icon: "campaign" },
                    { id: "dashboard", label: t("admin.crm.dashboard"), icon: "dashboard" },
                    { id: "timeline", label: t("admin.crm.timeline"), icon: "history" },
                    { id: "cameras", label: t("admin.crm.cameras"), icon: "videocam" },
                    { id: "tasks", label: t("admin.crm.tasks"), icon: "task" },
                    { id: "profile", label: t("admin.crm.profile"), icon: "person" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCrmTab(tab.id)}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center gap-3 transition-all ${
                        activeCrmTab === tab.id 
                          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-extrabold" 
                          : isDark 
                            ? "text-slate-400 hover:bg-slate-900 hover:text-white" 
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </>
              )}
            </nav>
          </div>

          {/* Sidebar Footer Branding */}
          <div className={`p-4 border-t flex items-center justify-between text-[10px] font-bold ${
            isDark ? "border-slate-800/80 text-slate-500" : "border-slate-200 text-slate-400"
          }`}>
            <span>Versiya 2.0.0</span>
            <span>&copy; CloudCare Kids</span>
          </div>
        </aside>

        {/* RIGHT WORKSPACE PANEL (CONTENT AREA - 100% Full Width on Mobile) */}
        <main className={`flex-1 flex flex-col overflow-hidden z-10 w-full max-w-full transition-colors duration-300 ${
          isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
        }`}>

          {/* STATIC UNMOVING WORKSPACE CONTROL HEADER BAR (Scaled for Mobile) */}
          <div className={`p-2.5 sm:p-4 md:px-8 md:py-5 border-b flex-shrink-0 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 z-20 backdrop-blur-md transition-colors ${
            isDark ? "border-slate-800/80 bg-slate-950/95" : "border-slate-200 bg-white/95"
          }`}>
            <div className="text-left flex flex-col gap-0.5 sm:gap-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider text-white ${
                  mode === "CMS" ? "bg-cyan-500" : "bg-indigo-500"
                }`}>
                  {mode}
                </span>
                <h1 className={`font-bold text-xs sm:text-sm md:text-xl ${isDark ? "text-white" : "text-slate-900"}`}>
                  {mode === "CMS" 
                    ? `${activeCmsTab.toUpperCase()} - CMS Web Ilova Sahifasini Tahrirlash`
                    : `${activeCrmTab.toUpperCase()} - CRM Bog'cha Tizimi Boshqaruvi`
                  }
                </h1>
              </div>
              <p className={`text-[10px] sm:text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {mode === "CMS" 
                  ? "Asosiy web sahifadagi matnlar, rasmlar va funksiyalarni tahrirlash paneli."
                  : "Bog'cha bolalari, ota-onalar, guruhlar hamda ichki tizim ma'lumotlari."
                }
              </p>
            </div>

            <button 
              onClick={() => toast.success("Barcha o'zgarishlar muvaffaqiyatli saqlandi!")}
              className={`font-bold text-[11px] sm:text-xs py-1.5 px-3 sm:py-2.5 sm:px-6 rounded-xl sm:rounded-2xl shadow-lg border-b-2 sm:border-b-4 active:scale-95 transition-all flex items-center gap-1 sm:gap-2 text-white flex-shrink-0 ${
                mode === "CMS" ? "bg-cyan-500 hover:bg-cyan-400 border-cyan-700 shadow-cyan-500/20" : "bg-indigo-500 hover:bg-indigo-400 border-indigo-700 shadow-indigo-500/20"
              }`}
            >
              <span className="material-symbols-outlined text-sm sm:text-base">save</span>
              Ma'lumotlarni Saqlash
            </button>
          </div>

          {/* INDEPENDENTLY SCROLLABLE WORKSPACE CONTENT AREA (With bottom nav clearance pb-20) */}
          <div className="w-full flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 pb-20 md:pb-8 flex flex-col gap-4 sm:gap-6">
            
            {/* MODE 1: CMS CONTENT PAGES */}
            {mode === "CMS" && (
              <div className="flex flex-col gap-6 w-full animate-fade-in">
                {activeCmsTab === "home" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-cyan-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">home</span>
                      Bosh Sahifa Matnlarini Tahrirlash ({lang.toUpperCase()})
                    </h4>
                    <div className="flex flex-col gap-2 text-xs">
                      <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Bosh Sarlavha</label>
                      <input
                        type="text"
                        defaultValue="Kelajak avlod uchun eng yaxshi tarbiya va ta'lim"
                        className={`px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 ${
                          isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Subtitr / Izoh</label>
                      <textarea
                        defaultValue="Bolangiz xavfsiz va quvnoq muhitda rivojlansin"
                        className={`px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 h-24 resize-none ${
                          isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {activeCmsTab === "life" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-cyan-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">sports_esports</span>
                      Bog'cha Hayoti Galereyasi & Tadbirlar Boshqaruvi
                    </h4>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Ushbu bo'limda bog'chadagi kunlik mashg'ulotlar, bayram tadbirlari va fotosuratlar boshqariladi.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {announcements.map((a) => (
                        <div key={a.id} className={`p-4 border rounded-2xl flex flex-col gap-1.5 text-xs ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <span className="font-bold text-sm text-cyan-400">{a.title}</span>
                          <span className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>{a.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeCmsTab === "about" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-cyan-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">diversity_3</span>
                      Biz Haqimizda & Tarbiyachilar Tarkibi
                    </h4>
                    <div className="flex flex-col gap-3 text-xs">
                      <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Bog'cha Missiyasi va Afzalliklari</label>
                      <textarea
                        defaultValue="Bizning bog'cha eng zamonaviy texnologiyalar hamda 10 yildan ortiq tajribaga ega tarbiyachilar jamoasi bilan ta'lim beradi."
                        className={`px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 h-28 resize-none ${
                          isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {activeCmsTab === "ai" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-cyan-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">neurology</span>
                      AI Copilot & Smart Assistant Prompt Sozlamalari
                    </h4>
                    <div className="flex flex-col gap-2 text-xs">
                      <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Tizim AI Prompt Qoidalari</label>
                      <textarea
                        value={aiPromptText}
                        onChange={(e) => setAiPromptText(e.target.value)}
                        className={`px-4 py-3 rounded-xl border text-xs focus:outline-none focus:border-cyan-500 h-32 resize-none ${
                          isDark ? "border-slate-700 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* BOT SETTINGS IN CMS MODE */}
                {activeCmsTab === "bot_settings" && (
                  <div className="w-full animate-fade-in">
                    <BotSettingsPage />
                  </div>
                )}

                {/* ADVANCED ENHANCED APPLY (CRM NI BOSH QARISH) CMS TAB */}
                {activeCmsTab === "apply" && (
                  <div className="flex flex-col gap-6 w-full animate-fade-in">
                    
                    {/* TOP MINI BO'LIM NAVIGATION & VISUAL VIEW SWITCHER BAR */}
                    <div className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                      <div className="flex items-center gap-2 p-1.5 rounded-2xl border bg-slate-950/60 border-slate-800">
                        <button
                          onClick={() => setApplySubTab("leads")}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            applySubTab === "leads"
                              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">assignment</span>
                          📑 1. Kelib Tushgan Arizalar Boshqaruvi
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold ml-1">
                            {applyLeads.length}
                          </span>
                        </button>

                        <button
                          onClick={() => setApplySubTab("form_builder")}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            applySubTab === "form_builder"
                              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">edit_note</span>
                          ⚙️ 2. Web Sayt Ariza Shakli Tahriri
                        </button>
                      </div>

                      {/* Visual View Switcher (For Received Leads) */}
                      {applySubTab === "leads" && (
                        <div className="flex items-center gap-2 p-1.5 rounded-2xl border bg-slate-950/60 border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-2 hidden sm:inline">Visual Rejim:</span>
                          <button
                            onClick={() => setLeadViewMode("kanban")}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                              leadViewMode === "kanban"
                                ? "bg-cyan-500 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">view_kanban</span>
                            📊 Kanban Board
                          </button>
                          <button
                            onClick={() => setLeadViewMode("table")}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                              leadViewMode === "table"
                                ? "bg-cyan-500 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">table_rows</span>
                            📋 Odatiy Jadval
                          </button>
                        </div>
                      )}
                    </div>

                    {/* MINI-BO'LIM 1: KELIB TUSHGAN ARIZALAR BOSH QARUVI */}
                    {applySubTab === "leads" && (
                      <div className="flex flex-col gap-6 w-full">
                        
                        {/* SEARCH & STATUS FILTER TOOLBAR */}
                        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                        }`}>
                          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                            <input
                              type="text"
                              placeholder="Ota-ona ismi, bola yoki telefon bo'yicha qidirish..."
                              value={leadSearchQuery}
                              onChange={(e) => setLeadSearchQuery(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-cyan-500 ${
                                isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                              }`}
                            />
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Status Pipeline:</span>
                            <select
                              value={leadFilterStatus}
                              onChange={(e) => setLeadFilterStatus(e.target.value)}
                              className={`px-3 py-2 border rounded-xl font-bold focus:outline-none focus:border-cyan-500 ${
                                isDark ? "border-slate-800 bg-slate-950 text-cyan-400" : "border-slate-300 bg-slate-50 text-cyan-700"
                              }`}
                            >
                              <option value="ALL">🌐 Hamma Statuslar ({applyLeads.length})</option>
                              <option value="YANGI">🔵 YANGI ARIZA ({applyLeads.filter(l => l.status === "YANGI").length})</option>
                              <option value="POTENSIAL">🔥 POTENSIAL MIJOZ ({applyLeads.filter(l => l.status === "POTENSIAL").length})</option>
                              <option value="JARAYONDA">⚡ JARAYONDA / ALOQADA ({applyLeads.filter(l => l.status === "JARAYONDA").length})</option>
                              <option value="QABUL_QILINDI">🟢 QABUL QILINDI ({applyLeads.filter(l => l.status === "QABUL_QILINDI").length})</option>
                              <option value="RAD_ETILDI">🔴 RAD ETILDI ({applyLeads.filter(l => l.status === "RAD_ETILDI").length})</option>
                            </select>
                          </div>
                        </div>

                        {/* REJIM 1: ZAMONAVIY KANBAN BOARD VIEW */}
                        {leadViewMode === "kanban" && (
                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full items-start">
                            
                            {[
                              { id: "YANGI", title: "🔵 YANGI ARIZALAR", color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" },
                              { id: "POTENSIAL", title: "🔥 POTENSIAL MIJOZ", color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
                              { id: "JARAYONDA", title: "⚡ JARAYONDA / ALOQADA", color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10" },
                              { id: "QABUL_QILINDI", title: "🟢 QABUL QILINDI", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
                              { id: "RAD_ETILDI", title: "🔴 RAD ETILDI", color: "border-rose-500/40 text-rose-400 bg-rose-500/10" },
                            ].map((col) => {
                              const colLeads = filteredLeads.filter(l => l.status === col.id);
                              return (
                                <div key={col.id} className={`p-4 rounded-3xl border flex flex-col gap-3.5 min-h-[320px] ${
                                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                                }`}>
                                  <div className={`p-2.5 rounded-2xl border flex justify-between items-center ${col.color}`}>
                                    <span className="font-bold text-xs tracking-tight">{col.title}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-white">
                                      {colLeads.length}
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-3">
                                    {colLeads.map((lead) => (
                                      <div key={lead.id} className={`p-4 border rounded-2xl flex flex-col gap-2 text-xs shadow-sm transition-all hover:border-cyan-500/50 ${
                                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                                      }`}>
                                        <div className="flex justify-between items-start">
                                          <span className="font-bold text-sm text-cyan-400">{lead.parent_name}</span>
                                          <button
                                            onClick={() => handleDeleteLead(lead.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                            title="Arizani o'chirish"
                                          >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                          </button>
                                        </div>

                                        <div className="flex flex-col gap-1 text-[11px]">
                                          <span className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>📞 {lead.phone}</span>
                                          <span className={`${isDark ? "text-slate-400" : "text-slate-600"}`}>👶 Farzand: {lead.child} ({lead.age})</span>
                                          <span className="text-[10px] text-slate-500 font-mono">📅 Sana: {lead.date}</span>
                                        </div>

                                        {lead.notes && (
                                          <div className={`p-2 rounded-xl border text-[11px] italic ${
                                            isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-100 border-slate-200 text-slate-700"
                                          }`}>
                                            "{lead.notes}"
                                          </div>
                                        )}

                                        {/* Status Switcher Action Buttons */}
                                        <div className="flex flex-wrap gap-1 mt-1 pt-2 border-t border-inherit">
                                          {col.id !== "YANGI" && (
                                            <button
                                              onClick={() => handleUpdateLeadStatus(lead.id, "YANGI")}
                                              className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-[9px] font-bold border border-cyan-500/30 hover:bg-cyan-500/30"
                                            >
                                              🔵 Yangi
                                            </button>
                                          )}
                                          {col.id !== "POTENSIAL" && (
                                            <button
                                              onClick={() => handleUpdateLeadStatus(lead.id, "POTENSIAL")}
                                              className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold border border-amber-500/30 hover:bg-amber-500/30"
                                            >
                                              🔥 Potensial
                                            </button>
                                          )}
                                          {col.id !== "JARAYONDA" && (
                                            <button
                                              onClick={() => handleUpdateLeadStatus(lead.id, "JARAYONDA")}
                                              className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-[9px] font-bold border border-indigo-500/30 hover:bg-indigo-500/30"
                                            >
                                              ⚡ Jarayonda
                                            </button>
                                          )}
                                          {col.id !== "QABUL_QILINDI" && (
                                            <button
                                              onClick={() => handleUpdateLeadStatus(lead.id, "QABUL_QILINDI")}
                                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30 hover:bg-emerald-500/30"
                                            >
                                              🟢 Qabul
                                            </button>
                                          )}
                                          {col.id !== "RAD_ETILDI" && (
                                            <button
                                              onClick={() => handleUpdateLeadStatus(lead.id, "RAD_ETILDI")}
                                              className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold border border-rose-500/30 hover:bg-rose-500/30"
                                            >
                                              🔴 Rad
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}

                                    {colLeads.length === 0 && (
                                      <div className={`p-6 rounded-2xl border text-center text-xs italic ${
                                        isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
                                      }`}>
                                        Arizalar yo'q
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* REJIM 2: ODATIY JADVAL (TABLE VIEW) */}
                        {leadViewMode === "table" && (
                          <div className={`p-6 rounded-3xl border overflow-x-auto ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className={`border-b ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                                  <th className="p-3">#</th>
                                  <th className="p-3">Ota-ona F.I.Sh & Telefon</th>
                                  <th className="p-3">Bola Ismi & Yoshi</th>
                                  <th className="p-3">Ariza Sanasi</th>
                                  <th className="p-3">Status Pipeline</th>
                                  <th className="p-3">Izoh</th>
                                  <th className="p-3 text-right">Amallar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-inherit">
                                {filteredLeads.map((lead, idx) => (
                                  <tr key={lead.id} className={`hover:bg-slate-500/10 transition-colors ${
                                    isDark ? "text-slate-200" : "text-slate-800"
                                  }`}>
                                    <td className="p-3 font-mono font-bold">{idx + 1}</td>
                                    <td className="p-3">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-sm text-cyan-400">{lead.parent_name}</span>
                                        <span className="text-[11px] text-slate-400">{lead.phone}</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-bold">{lead.child}</span> ({lead.age})
                                    </td>
                                    <td className="p-3 font-mono text-[11px] text-slate-400">{lead.date}</td>
                                    <td className="p-3">
                                      <select
                                        value={lead.status}
                                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold focus:outline-none ${
                                          lead.status === "YANGI" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" :
                                          lead.status === "POTENSIAL" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                                          lead.status === "JARAYONDA" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40" :
                                          lead.status === "QABUL_QILINDI" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                                          "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                        }`}
                                      >
                                        <option value="YANGI" className="bg-slate-900 text-cyan-400">🔵 YANGI ARIZA</option>
                                        <option value="POTENSIAL" className="bg-slate-900 text-amber-400">🔥 POTENSIAL MIJOZ</option>
                                        <option value="JARAYONDA" className="bg-slate-900 text-indigo-400">⚡ JARAYONDA / ALOQADA</option>
                                        <option value="QABUL_QILINDI" className="bg-slate-900 text-emerald-400">🟢 QABUL QILINDI</option>
                                        <option value="RAD_ETILDI" className="bg-slate-900 text-rose-400">🔴 RAD ETILDI</option>
                                      </select>
                                    </td>
                                    <td className="p-3 text-[11px] text-slate-400 max-w-[200px] truncate">{lead.notes || "—"}</td>
                                    <td className="p-3 text-right">
                                      <button
                                        onClick={() => handleDeleteLead(lead.id)}
                                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                      >
                                        <span className="material-symbols-outlined text-base">delete</span>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MINI-BO'LIM 2: WEB SAYT ARIZA SHAKLI TAHRIRI (FORM BUILDER) */}
                    {applySubTab === "form_builder" && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-start">
                        
                        {/* LEFT 2 COLUMNS: FORM QUESTIONS BUILDER */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                          
                          {/* EXISTING QUESTIONS LIST */}
                          <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <div className="flex justify-between items-center border-b pb-3 border-inherit">
                              <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                                Web Sayt Ariza Shakli Savollari ({formFields.length} ta)
                              </h4>
                              <span className="text-[10px] text-slate-400 font-bold">Tartibini ⬆️/⬇️ suring</span>
                            </div>

                            <div className="flex flex-col gap-3">
                              {formFields.map((field, idx) => (
                                <div key={field.id} className={`p-4 border rounded-2xl flex items-center justify-between gap-3 text-xs ${
                                  isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                                }`}>
                                  <div className="flex items-center gap-3 flex-1">
                                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                                      {idx + 1}
                                    </span>
                                    <div className="flex flex-col text-left">
                                      <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                                        {field.label} {field.required && <span className="text-red-400">*</span>}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        Turi: <strong className="text-cyan-400">{field.type.toUpperCase()}</strong> | Placeholder: "{field.placeholder}"
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleMoveQuestionUp(idx)}
                                      disabled={idx === 0}
                                      className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-800 text-slate-300"
                                      title="Yuqoriga surish"
                                    >
                                      <span className="material-symbols-outlined text-sm">arrow_upward</span>
                                    </button>
                                    <button
                                      onClick={() => handleMoveQuestionDown(idx)}
                                      disabled={idx === formFields.length - 1}
                                      className="p-1.5 rounded-lg border border-slate-700 disabled:opacity-30 hover:bg-slate-800 text-slate-300"
                                      title="Pastga surish"
                                    >
                                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuestion(field.id)}
                                      className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20"
                                      title="O'chirish"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ADD NEW QUESTION CARD */}
                          <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <h4 className="font-bold text-sm text-cyan-400 border-b border-inherit pb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">add_circle</span>
                              Yangi Savol / Maydon Qo'shish
                            </h4>
                            <form onSubmit={handleAddQuestion} className="flex flex-col gap-3 text-xs">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Savol Sarlavhasi (Label) *</label>
                                  <input
                                    type="text"
                                    required
                                    placeholder="Masalan: Farzandning qiziqishlari..."
                                    value={newQuestionForm.label}
                                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, label: e.target.value })}
                                    className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-cyan-500 ${
                                      isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                    }`}
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Input Turi *</label>
                                  <select
                                    value={newQuestionForm.type}
                                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, type: e.target.value })}
                                    className={`px-4 py-3 border rounded-xl font-bold focus:outline-none focus:border-cyan-500 ${
                                      isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                    }`}
                                  >
                                    <option value="text">Matnli Input (Text)</option>
                                    <option value="phone">Telefon Input (Phone)</option>
                                    <option value="number">Raqamli Input (Number)</option>
                                    <option value="textarea">Ko'p qatorli Matn (Textarea)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Placeholder Matni</label>
                                  <input
                                    type="text"
                                    placeholder="Masalan: Qisqacha yozib qoldiring..."
                                    value={newQuestionForm.placeholder}
                                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, placeholder: e.target.value })}
                                    className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-cyan-500 ${
                                      isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                    }`}
                                  />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                  <input
                                    type="checkbox"
                                    id="reqCheck"
                                    checked={newQuestionForm.required}
                                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, required: e.target.checked })}
                                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500"
                                  />
                                  <label htmlFor="reqCheck" className={`font-bold text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                    Ushbu savolni to'ldirish majburiy (*) bo'lsin
                                  </label>
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="py-3 px-6 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow border-b-2 border-cyan-700 active:scale-95 transition-all self-end mt-2"
                              >
                                ➕ Yangi Savolni Qo'shish
                              </button>
                            </form>
                          </div>
                        </div>

                        {/* RIGHT 1 COLUMN: LIVE PREVIEW & CONTACT/MAP SETTINGS */}
                        <div className="flex flex-col gap-6">
                          
                          {/* LIVE PREVIEW OF APPLY FORM FOR PARENTS */}
                          <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                            isDark ? "bg-slate-900/90 border-cyan-500/30" : "bg-white border-slate-200 shadow-md"
                          }`}>
                            <h4 className="font-bold text-xs text-cyan-400 border-b border-inherit pb-2 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base">preview</span>
                              Web Sayt Jonli Ko'rinishi (Preview)
                            </h4>
                            
                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3 text-left">
                              <h5 className="font-bold text-sm text-cyan-400 border-b border-slate-800 pb-2">Ariza topshirish</h5>
                              {formFields.map((field) => (
                                <div key={field.id} className="flex flex-col gap-1 text-[11px]">
                                  <span className="text-slate-400 font-bold">
                                    {field.label} {field.required && <span className="text-red-400">*</span>}
                                  </span>
                                  {field.type === "textarea" ? (
                                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-[10px] h-14">
                                      {field.placeholder || "Izoh matni..."}
                                    </div>
                                  ) : (
                                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-[10px]">
                                      {field.placeholder || "Kiritish maydoni..."}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <div className="w-full py-2 bg-cyan-500 text-white font-bold text-[11px] rounded-xl text-center shadow mt-1">
                                Arizani yuborish
                              </div>
                            </div>
                          </div>

                          {/* CONTACT & MAP SETTINGS CARD */}
                          <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <h4 className="font-bold text-sm text-cyan-400 border-b border-inherit pb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">location_on</span>
                              Manzil & Aloqa Sozlamalari
                            </h4>
                            
                            <div className="flex flex-col gap-3 text-xs">
                              <div className="flex flex-col gap-1">
                                <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Bog'cha Telefon Raqami</label>
                                <input
                                  type="text"
                                  value={contactSettings.phone}
                                  onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                                  className={`px-3 py-2 border rounded-xl text-xs ${
                                    isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                  }`}
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Bog'cha Manzili Matni</label>
                                <input
                                  type="text"
                                  value={contactSettings.address}
                                  onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                                  className={`px-3 py-2 border rounded-xl text-xs ${
                                    isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                  }`}
                                />
                              </div>

                              <button
                                onClick={() => toast.success("Manzil va aloqa sozlamalari saqlandi!")}
                                className="py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow border-b-2 border-cyan-700 active:scale-95 transition-all mt-1"
                              >
                                Sozlamalarni Saqlash
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ADVANCED ADMINS & PERMISSIONS MANAGEMENT TAB (WITH 2 SUB-TABS & TG BOT MODAL) */}
                {activeCmsTab === "admins" && (
                  <div className="flex flex-col gap-6 w-full animate-fade-in relative">
                    
                    {/* TOP SUB-TAB NAVIGATION & TELEGRAM BOT SIMULATOR MODAL TOGGLE BUTTON */}
                    <div className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                      {/* 2 Mini Sub-Tabs Buttons */}
                      <div className="flex items-center gap-2 p-1.5 rounded-2xl border bg-slate-950/60 border-slate-800">
                        <button
                          onClick={() => setAdminsSubTab("list")}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            adminsSubTab === "list"
                              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">badge</span>
                          👥 1. Mavjud Adminlar Ro'yxati
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold ml-1">
                            {adminsList.length}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingAdminId(null);
                            setAdminForm({
                              name: "",
                              tg_id: "",
                              role: "SUB_ADMIN",
                              status: "ACTIVE",
                              permissions: { ...DEFAULT_SUB_PERMISSIONS }
                            });
                            setAdminsSubTab("create");
                          }}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            adminsSubTab === "create"
                              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">person_add</span>
                          ➕ 2. Yangi Admin / Sub-Admin Qo'shish
                        </button>
                      </div>

                      {/* FIXED TOP HEADER BUTTON TO OPEN TELEGRAM BOT CHAT SIMULATOR MODAL */}
                      <button
                        onClick={() => setShowTgBotModal(true)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg border-b-2 border-indigo-800 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">smart_toy</span>
                        📱 TG Bot Chat Simulyatori
                      </button>
                    </div>

                    {/* MINI-BO'LIM 1: MAVJUD ADMINLAR RO'YXATI (KANBAN vs TABLE VIEW) */}
                    {adminsSubTab === "list" && (
                      <div className="flex flex-col gap-6 w-full">
                        
                        {/* SEARCH, ROLE FILTER & VISUAL VIEW SWITCHER TOOLBAR */}
                        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                        }`}>
                          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                            <input
                              type="text"
                              placeholder="Admin ismi yoki Telegram ID bo'yicha qidirish..."
                              value={adminSearchQuery}
                              onChange={(e) => setAdminSearchQuery(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-cyan-500 ${
                                isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                              }`}
                            />
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Rol:</span>
                              <select
                                value={adminFilterRole}
                                onChange={(e) => setAdminFilterRole(e.target.value)}
                                className={`px-3 py-2 border rounded-xl font-bold focus:outline-none focus:border-cyan-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-cyan-400" : "border-slate-300 bg-slate-50 text-cyan-700"
                                }`}
                              >
                                <option value="ALL">🌐 Hamma Rollar ({adminsList.length})</option>
                                <option value="SUPER_ADMIN">👑 Super Admin ({adminsList.filter(a => a.role === "SUPER_ADMIN").length})</option>
                                <option value="MAIN_ADMIN">⭐ Main Admin ({adminsList.filter(a => a.role === "MAIN_ADMIN").length})</option>
                                <option value="SUB_ADMIN">🛡️ Sub Admin ({adminsList.filter(a => a.role === "SUB_ADMIN").length})</option>
                                <option value="EDUCATOR">👩‍🏫 Tarbiyachi ({adminsList.filter(a => a.role === "EDUCATOR").length})</option>
                                <option value="STAFF">🧑‍💻 Xodim ({adminsList.filter(a => a.role === "STAFF").length})</option>
                              </select>
                            </div>

                            {/* View Switcher Buttons */}
                            <div className="flex items-center gap-2 p-1.5 rounded-2xl border bg-slate-950/60 border-slate-800">
                              <button
                                onClick={() => setAdminViewMode("kanban")}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                  adminViewMode === "kanban"
                                    ? "bg-cyan-500 text-white shadow"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">view_kanban</span>
                                📊 Kanban Board
                              </button>
                              <button
                                onClick={() => setAdminViewMode("table")}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                  adminViewMode === "table"
                                    ? "bg-cyan-500 text-white shadow"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">table_rows</span>
                                📋 Odatiy Jadval
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* REJIM 1: ZAMONAVIY KANBAN BOARD VIEW (CATEGORIZED BY ROLE) */}
                        {adminViewMode === "kanban" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-start">
                            
                            {[
                              { id: "SUPER", title: "👑 SUPER & MAIN ADMINS", roles: ["SUPER_ADMIN", "MAIN_ADMIN"], color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
                              { id: "SUB", title: "🛡️ SUB-ADMINLAR", roles: ["SUB_ADMIN"], color: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" },
                              { id: "EDUCATOR", title: "👩‍🏫 TARBIYACHILAR", roles: ["EDUCATOR"], color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10" },
                              { id: "STAFF", title: "🧑‍💻 BOSHQA XODIMLAR", roles: ["STAFF"], color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
                            ].map((col) => {
                              const colAdmins = filteredAdmins.filter(a => col.roles.includes(a.role));
                              return (
                                <div key={col.id} className={`p-4 rounded-3xl border flex flex-col gap-3.5 min-h-[320px] ${
                                  isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                                }`}>
                                  <div className={`p-2.5 rounded-2xl border flex justify-between items-center ${col.color}`}>
                                    <span className="font-bold text-xs tracking-tight">{col.title}</span>
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-950/40 text-white">
                                      {colAdmins.length}
                                    </span>
                                  </div>

                                  <div className="flex flex-col gap-3">
                                    {colAdmins.map((admin) => (
                                      <div key={admin.id} className={`p-4 border rounded-2xl flex flex-col gap-3 text-xs shadow-sm transition-all hover:border-cyan-500/50 ${
                                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                                      }`}>
                                        <div className="flex justify-between items-start">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">
                                              {admin.name[0]}
                                            </div>
                                            <div className="flex flex-col text-left">
                                              <span className="font-bold text-sm">{admin.name}</span>
                                              <span className="text-[10px] font-mono text-cyan-400 font-bold">📱 {admin.tg_id}</span>
                                            </div>
                                          </div>
                                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                            admin.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                          }`}>
                                            {admin.status === "ACTIVE" ? "🟢 Faol" : "🔴 Bloklangan"}
                                          </span>
                                        </div>

                                        {/* Permission Badges */}
                                        <div className="flex flex-wrap gap-1">
                                          {admin.permissions?.canEditCms && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">🌐 CMS</span>}
                                          {admin.permissions?.canManageLeads && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">📑 Arizalar</span>}
                                          {admin.permissions?.canManageChildren && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">👶 Bolalar</span>}
                                          {admin.permissions?.canManageGroups && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">👥 Guruhlar</span>}
                                          {admin.permissions?.canSendBroadcast && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">📢 Xabarlar</span>}
                                          {admin.permissions?.canManageCameras && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">📹 Kameralar</span>}
                                          {admin.permissions?.canManageFinance && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">💰 Moliya</span>}
                                          {admin.permissions?.canManageAdmins && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">🛡️ Adminlar</span>}
                                        </div>

                                        {/* Card Actions */}
                                        <div className="flex items-center justify-between border-t border-inherit pt-2 mt-1">
                                          <button
                                            onClick={() => handleToggleAdminStatus(admin.id)}
                                            className={`px-2 py-1 rounded text-[9px] font-bold border ${
                                              admin.status === "ACTIVE" ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10" : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                            }`}
                                          >
                                            {admin.status === "ACTIVE" ? "Bloklash" : "Aktiv qilish"}
                                          </button>
                                          
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleEditAdminClick(admin)}
                                              className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[9px] border border-cyan-500/30"
                                            >
                                              ✏️ Tahrirlash
                                            </button>
                                            <button
                                              onClick={() => handleDeleteAdminClick(admin.id)}
                                              className="p-1 rounded bg-red-500/20 text-red-400 border border-red-500/30"
                                              title="O'chirish"
                                            >
                                              <span className="material-symbols-outlined text-xs">delete</span>
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                    {colAdmins.length === 0 && (
                                      <div className={`p-6 rounded-2xl border text-center text-xs italic ${
                                        isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
                                      }`}>
                                        Adminlar yo'q
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* REJIM 2: ODATIY JADVAL VIEW (TABLE VIEW) */}
                        {adminViewMode === "table" && (
                          <div className={`p-6 rounded-3xl border overflow-x-auto ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className={`border-b ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                                  <th className="p-3">#</th>
                                  <th className="p-3">Admin F.I.Sh & Telegram ID</th>
                                  <th className="p-3">Admin Roli</th>
                                  <th className="p-3">Status</th>
                                  <th className="p-3">Biriktirilgan Vakolatlar (Permissions)</th>
                                  <th className="p-3 text-right">Amallar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-inherit">
                                {filteredAdmins.map((admin, idx) => (
                                  <tr key={admin.id} className={`hover:bg-slate-500/10 transition-colors ${
                                    isDark ? "text-slate-200" : "text-slate-800"
                                  }`}>
                                    <td className="p-3 font-mono font-bold">{idx + 1}</td>
                                    <td className="p-3">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-sm text-cyan-400">{admin.name}</span>
                                        <span className="text-[11px] font-mono text-slate-400">TG ID: {admin.tg_id}</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                                        admin.role === "SUPER_ADMIN" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                      }`}>
                                        {admin.role}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        admin.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                      }`}>
                                        {admin.status === "ACTIVE" ? "🟢 Faol" : "🔴 Bloklangan"}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex flex-wrap gap-1 max-w-xs">
                                        {admin.permissions?.canEditCms && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">🌐 CMS</span>}
                                        {admin.permissions?.canManageLeads && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">📑 Arizalar</span>}
                                        {admin.permissions?.canManageChildren && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">👶 Bolalar</span>}
                                        {admin.permissions?.canManageGroups && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">👥 Guruhlar</span>}
                                        {admin.permissions?.canSendBroadcast && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">📢 Xabarlar</span>}
                                        {admin.permissions?.canManageCameras && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">📹 Kameralar</span>}
                                        {admin.permissions?.canManageFinance && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">💰 Moliya</span>}
                                        {admin.permissions?.canManageAdmins && <span className="px-1.5 py-0.5 rounded text-[8px] bg-slate-800 text-cyan-300">🛡️ Adminlar</span>}
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => handleToggleAdminStatus(admin.id)}
                                          className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                            admin.status === "ACTIVE" ? "border-rose-500/30 text-rose-400 hover:bg-rose-500/10" : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                          }`}
                                        >
                                          {admin.status === "ACTIVE" ? "Bloklash" : "Aktivlash"}
                                        </button>
                                        <button
                                          onClick={() => handleEditAdminClick(admin)}
                                          className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 font-bold text-[10px] border border-cyan-500/30"
                                        >
                                          ✏️ Tahrirlash
                                        </button>
                                        <button
                                          onClick={() => handleDeleteAdminClick(admin.id)}
                                          className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                          title="O'chirish"
                                        >
                                          <span className="material-symbols-outlined text-xs">delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MINI-BO'LIM 2: YANGI ADMIN / SUB-ADMIN QO'SHISH FORMASI */}
                    {adminsSubTab === "create" && (
                      <div className={`p-6 rounded-3xl border flex flex-col gap-6 ${
                        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                      }`}>
                        <div className="flex items-center justify-between border-b pb-3 border-inherit">
                          <h4 className="font-bold text-base text-cyan-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                            {editingAdminId ? "✏️ Admin Ma'lumotlari va Vakolatlarini Tahrirlash" : "➕ Yangi Admin / Sub-Admin Qo'shish Formasi"}
                          </h4>
                          {editingAdminId && (
                            <button
                              onClick={() => {
                                setEditingAdminId(null);
                                setAdminForm({
                                  name: "",
                                  tg_id: "",
                                  role: "SUB_ADMIN",
                                  status: "ACTIVE",
                                  permissions: { ...DEFAULT_SUB_PERMISSIONS }
                                });
                                setAdminsSubTab("list");
                              }}
                              className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
                            >
                              Bekor Qilish
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleSaveAdmin} className="flex flex-col gap-6 w-full">
                          {/* Basic Inputs Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex flex-col gap-1.5 text-xs">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>To'liq Ism (F.I.Sh) *</label>
                              <input
                                type="text"
                                required
                                value={adminForm.name}
                                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                                placeholder="Masalan: Sardor Aliyev"
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-cyan-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>

                            <div className="flex flex-col gap-1.5 text-xs">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Telegram ID *</label>
                              <input
                                type="text"
                                required
                                value={adminForm.tg_id}
                                onChange={(e) => setAdminForm({ ...adminForm, tg_id: e.target.value })}
                                placeholder="Masalan: 123456789"
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-cyan-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>

                            <div className="flex flex-col gap-1.5 text-xs">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Admin Roli *</label>
                              <select
                                value={adminForm.role}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className={`px-4 py-3 border rounded-xl font-bold focus:outline-none focus:border-cyan-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-cyan-400" : "border-slate-300 bg-slate-50 text-cyan-700"
                                }`}
                              >
                                <option value="SUPER_ADMIN">👑 SUPER ADMIN (Full Access)</option>
                                <option value="MAIN_ADMIN">⭐ MAIN ADMIN (Full Access)</option>
                                <option value="SUB_ADMIN">🛡️ SUB-ADMIN (Custom Permissions)</option>
                                <option value="EDUCATOR">👩‍🏫 TARBIYACHI (Custom Permissions)</option>
                                <option value="STAFF">🧑‍💻 XODIM (Custom Permissions)</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5 text-xs">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Status *</label>
                              <select
                                value={adminForm.status}
                                onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                                className={`px-4 py-3 border rounded-xl font-bold focus:outline-none focus:border-cyan-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              >
                                <option value="ACTIVE">🟢 Faol (Active)</option>
                                <option value="INACTIVE">🔴 Bloklangan (Inactive)</option>
                              </select>
                            </div>
                          </div>

                          {/* 8 PERMISSION ON/OFF TOGGLES GRID */}
                          <div className="flex flex-col gap-3 pt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col text-left">
                                <span className="font-bold text-xs text-cyan-400 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-base">shield_lock</span>
                                  Sub-Admin Boshqaruv Vakolatlari (Permission Toggles)
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {adminForm.role === "SUPER_ADMIN" || adminForm.role === "MAIN_ADMIN"
                                    ? "👑 Asosiy Admin uchun barcha 8 ta vakolat avtomatik ravishda 100% yoniq (Locked)."
                                    : "Sub-Admin uchun kerakli boshqaruv huquqlarini On/Off kalitlari orqali yqing yoki o me me'yorida o'chiring."}
                                </span>
                              </div>

                              {(adminForm.role === "SUPER_ADMIN" || adminForm.role === "MAIN_ADMIN") && (
                                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  👑 Full Access Unlocked
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-1">
                              {[
                                { key: "canEditCms", title: "🌐 CMS Web Sahifalar", desc: "Bosh sahifa matnlari va rasmlarini tahrirlash", icon: "language" },
                                { key: "canManageLeads", title: "📑 Arizalar & Leadlar", desc: "Kelib tushgan arizalar va Kanban taxtasi", icon: "assignment" },
                                { key: "canManageChildren", title: "👶 Bolalar & Ota-onalar", desc: "Bolalar bazasini ko'rish va ro'yxatga olish", icon: "child_care" },
                                { key: "canManageGroups", title: "👥 Guruhlar & Xodimlar", desc: "Guruhlar va tarbiyachilar tarkibi boshqaruvi", icon: "group_work" },
                                { key: "canSendBroadcast", title: "📢 Ommaviy Xabarnomalar", desc: "Ota-onalarga bildirishnomalar yuborish", icon: "campaign" },
                                { key: "canManageCameras", title: "📹 HD Kameralar", desc: "Videokuzatuv streamlarini boshqarish", icon: "videocam" },
                                { key: "canManageFinance", title: "💰 To'lovlar & Moliya", desc: "Oylik to'lovlar va hisobotlar", icon: "payments" },
                                { key: "canManageAdmins", title: "🛡️ Adminlarni Boshqarish", desc: "Boshqa admin va sub-adminlarni boshqarish", icon: "admin_panel_settings" },
                              ].map((perm) => {
                                const permKey = perm.key as keyof Permissions;
                                const isEnabled = adminForm.permissions[permKey];
                                const isLocked = adminForm.role === "SUPER_ADMIN" || adminForm.role === "MAIN_ADMIN";

                                return (
                                  <div key={perm.key} className={`p-3.5 border rounded-2xl flex items-center justify-between gap-3 text-xs transition-all ${
                                    isEnabled 
                                      ? isDark ? "bg-cyan-950/30 border-cyan-500/40" : "bg-cyan-50 border-cyan-300" 
                                      : isDark ? "bg-slate-950 border-slate-800 opacity-70" : "bg-slate-100 border-slate-200 opacity-80"
                                  }`}>
                                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        isEnabled ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-500"
                                      }`}>
                                        <span className="material-symbols-outlined text-lg">{perm.icon}</span>
                                      </div>
                                      <div className="flex flex-col text-left min-w-0">
                                        <span className={`font-bold text-xs truncate ${isEnabled ? "text-cyan-400" : "text-slate-400"}`}>
                                          {perm.title}
                                        </span>
                                        <span className="text-[10px] text-slate-500 truncate">{perm.desc}</span>
                                      </div>
                                    </div>

                                    {/* ON/OFF TOGGLE SWITCH BUTTON */}
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePermission(permKey)}
                                      disabled={isLocked}
                                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 flex-shrink-0 ${
                                        isEnabled ? "bg-cyan-500" : "bg-slate-700"
                                      } ${isLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                      <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                                        isEnabled ? "translate-x-6" : "translate-x-0"
                                      }`} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="py-3 px-8 bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg border-b-4 border-cyan-700 active:scale-95 transition-all self-end mt-2 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-base">save</span>
                            {editingAdminId ? "Admin Ma'lumotlarini Saqlash" : "Yangi Adminni Saqlash"}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* MODAL POPUP FOR TELEGRAM BOT SIMULATOR */}
                    {showTgBotModal && (
                      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 flex flex-col gap-4 text-left relative animate-scale-up ${
                          isDark ? "bg-slate-900 border-cyan-500/40 text-white" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
                        }`}>
                          <div className="flex justify-between items-center border-b pb-3 border-inherit">
                            <h4 className="font-bold text-sm text-cyan-400 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">smart_toy</span>
                              📱 Telegram Bot Chat Simulyatori
                            </h4>
                            <button
                              onClick={() => setShowTgBotModal(false)}
                              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>

                          <p className="text-xs text-slate-400">
                            Telegram bot chatida ⚙️ Admin Panel tugmasi faqat Telegram ID si kiritilgan aktiv adminlarga ko'rinadi. Sinab ko'ring:
                          </p>

                          <div className="flex flex-col gap-2">
                            <label className={`text-xs font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Sinov Telegram ID:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={testTgIdInput}
                                onChange={(e) => setTestTgIdInput(e.target.value)}
                                placeholder="123456789"
                                className={`flex-1 px-3 py-2 border rounded-xl text-xs ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                              <button
                                onClick={handleTestTgId}
                                className="px-4 py-2 bg-cyan-500 text-white font-bold text-xs rounded-xl shadow hover:bg-cyan-400"
                              >
                                Sinash
                              </button>
                            </div>
                          </div>

                          {/* SIMULATED CHAT WINDOW */}
                          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3 text-left shadow-inner mt-1">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                              <div className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                                🤖
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs text-white">CloudCare Kids Bot</span>
                                <span className="text-[9px] text-emerald-400 font-bold">bot online</span>
                              </div>
                            </div>

                            {simulatedAdmin ? (
                              <div className="flex flex-col gap-2">
                                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                                  👋 Salom, <strong>{simulatedAdmin.name}</strong>!<br />
                                  Siz tizimda <strong>{simulatedAdmin.role}</strong> sifatida ro'yxatdan o'tgansiz. Admin panelga kirishingiz mumkin.
                                </div>
                                
                                <div 
                                  onClick={() => {
                                    setShowTgBotModal(false);
                                    toast.success("Admin Panelga o'tildi!");
                                  }}
                                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl text-center shadow-lg border-b-2 border-blue-700 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                                >
                                  <span className="material-symbols-outlined text-base">open_in_new</span>
                                  ⚙️ Admin Panelni Ochish
                                </div>
                              </div>
                            ) : (
                              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                                ⛔ <strong>Afsuski access rad etildi!</strong><br />
                                Ushbu Telegram ID ({testTgIdInput}) tizimga kiritilmagan. Telegram bot chatida Admin Panel tugmasi ko'rinmaydi.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeCmsTab === "help" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-cyan-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">help</span>
                      Yordam va Qo'llanma Resurslari
                    </h4>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Admin paneldan to'g'ri foydalanish bo'yicha ko'rsatmalar va vizual yo'riqnomalar.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: CRM CONTENT PAGES */}
            {mode === "CRM" && (
              <div className="flex flex-col gap-6 w-full animate-fade-in">
                
                {/* ADVANCED CHILDREN & PARENTS ACCOUNT MANAGEMENT TAB */}
                {activeCrmTab === "children" && (
                  <div className="flex flex-col gap-6 w-full animate-fade-in relative">
                    
                    {/* TOP SUB-TAB NAVIGATION BAR & BULK DISPATCH ACTION BUTTON */}
                    <div className={`p-4 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                      <div className="flex items-center gap-2 p-1.5 rounded-2xl border bg-slate-950/60 border-slate-800 flex-wrap">
                        <button
                          onClick={() => setChildrenSubTab("profiles")}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            childrenSubTab === "profiles"
                              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">badge</span>
                          📊 1. Akkauntlar va Profillar Boshqaruvi
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-extrabold ml-1">
                            {accountProfiles.length}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingAccId(null);
                            setNewAccForm({
                              parent_name: "",
                              parent_phone: "",
                              parent_tg_id: "",
                              child_name: "",
                              child_age: "4 yosh",
                              group: "Kamalak",
                              payment_status: "PAID",
                              account_status: "ACTIVE",
                              due_days_left: 30,
                              notes: "",
                            });
                            setChildrenSubTab("create");
                          }}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            childrenSubTab === "create"
                              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">person_add</span>
                          👤 2. Yangi Akkaunt va Bola Yaratish
                        </button>

                        <button
                          onClick={() => setChildrenSubTab("analytics")}
                          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                            childrenSubTab === "analytics"
                              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-extrabold"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">analytics</span>
                          📈 3. Segmentatsiya va Analitika
                        </button>
                      </div>

                      {/* BULK AUTOMATED REMINDER BUTTON FOR DUE ACCOUNTS */}
                      <button
                        onClick={handleSendBulkDueReminders}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs shadow-lg border-b-2 border-amber-700 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-base">notifications_active</span>
                        🚀 Avto-Eslatma Yuborish ({dueSoonCount} ta to'lov vaqti yetganlar)
                      </button>
                    </div>

                    {/* MINI-BO'LIM 1: AKKAUNTLAR VA PROFILLAR BOSH QARUVI */}
                    {childrenSubTab === "profiles" && (
                      <div className="flex flex-col gap-6 w-full">
                        
                        {/* SEARCH & MULTI-FILTER TOOLBAR */}
                        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                        }`}>
                          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                            <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                            <input
                              type="text"
                              placeholder="Ota-ona ismi, bola ismi, telefon yoki Telegram ID..."
                              value={childrenSearchQuery}
                              onChange={(e) => setChildrenSearchQuery(e.target.value)}
                              className={`w-full px-3 py-2 border rounded-xl text-xs focus:outline-none focus:border-indigo-500 ${
                                isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                              }`}
                            />
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Guruh:</span>
                              <select
                                value={childrenGroupFilter}
                                onChange={(e) => setChildrenGroupFilter(e.target.value)}
                                className={`px-3 py-2 border rounded-xl font-bold focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-indigo-400" : "border-slate-300 bg-slate-50 text-indigo-700"
                                }`}
                              >
                                <option value="ALL">🌐 Hamma Guruhlar ({accountProfiles.length})</option>
                                <option value="Kamalak">Kamalak guruhi ({accountProfiles.filter(a => a.group === "Kamalak").length})</option>
                                <option value="Yulduzcha">Yulduzcha guruhi ({accountProfiles.filter(a => a.group === "Yulduzcha").length})</option>
                                <option value="Quyoshcha">Quyoshcha guruhi ({accountProfiles.filter(a => a.group === "Quyoshcha").length})</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>To'lov Statusi:</span>
                              <select
                                value={childrenPaymentFilter}
                                onChange={(e) => setChildrenPaymentFilter(e.target.value)}
                                className={`px-3 py-2 border rounded-xl font-bold focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-indigo-400" : "border-slate-300 bg-slate-50 text-indigo-700"
                                }`}
                              >
                                <option value="ALL">🌐 Hamma Statuslar</option>
                                <option value="DUE_SOON">⏰ To'lov Vaqti Yaqinlashganlar (3 kun)</option>
                                <option value="PAID">🟢 To'langan ({accountProfiles.filter(a => a.payment_status === "PAID").length})</option>
                                <option value="PARTIAL">🟡 Qisman To'langan ({accountProfiles.filter(a => a.payment_status === "PARTIAL").length})</option>
                                <option value="DEBT">🔴 Qarzdorlik bor ({accountProfiles.filter(a => a.payment_status === "DEBT").length})</option>
                              </select>
                            </div>

                            {/* View Switcher Buttons */}
                            <div className="flex items-center gap-2 p-1.5 rounded-2xl border bg-slate-950/60 border-slate-800">
                              <button
                                onClick={() => setChildrenViewMode("kanban")}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                  childrenViewMode === "kanban"
                                    ? "bg-indigo-500 text-white shadow"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">grid_view</span>
                                📊 Kartochkalar
                              </button>
                              <button
                                onClick={() => setChildrenViewMode("table")}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                                  childrenViewMode === "table"
                                    ? "bg-indigo-500 text-white shadow"
                                    : "text-slate-400 hover:text-white"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">table_rows</span>
                                📋 Odatiy Jadval
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* REJIM 1: KARTOCHKALAR VIEW (CARDS GRID WITH AUTOMATED DUE COUNTDOWN BADGES) */}
                        {childrenViewMode === "kanban" && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            {filteredAccountProfiles.map((acc) => (
                              <div key={acc.id} className={`p-5 border rounded-3xl flex flex-col gap-3.5 text-xs shadow-sm transition-all hover:border-indigo-500/50 ${
                                isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                              }`}>
                                {/* Header: Parent Info & Payment Countdown Badge */}
                                <div className="flex justify-between items-start border-b border-inherit pb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
                                      {acc.parent_name[0]}
                                    </div>
                                    <div className="flex flex-col text-left">
                                      <span className="font-bold text-sm text-indigo-400">{acc.parent_name}</span>
                                      <span className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>📞 {acc.parent_phone}</span>
                                      {acc.parent_tg_id && (
                                        <span className="text-[10px] font-mono text-cyan-400">📱 TG ID: {acc.parent_tg_id}</span>
                                      )}
                                    </div>
                                  </div>

                                  {/* DYNAMIC PAYMENT DUE COUNTDOWN BADGE */}
                                  {renderDueCountdownBadge(acc.due_days_left, acc.payment_status)}
                                </div>

                                {/* Linked Child Profile Card */}
                                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                                  isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                                }`}>
                                  <div className="flex items-center gap-2.5">
                                    <span className="material-symbols-outlined text-indigo-400 text-lg">child_care</span>
                                    <div className="flex flex-col text-left">
                                      <span className="font-bold text-xs">{acc.child_name}</span>
                                      <span className="text-[10px] text-slate-400">{acc.child_age} | Guruhi: <strong className="text-indigo-400">{acc.group}</strong></span>
                                    </div>
                                  </div>

                                  {/* 3 PAYMENT STATUSES DROPDOWN SELECT (PAID, PARTIAL, DEBT) */}
                                  <select
                                    value={acc.payment_status}
                                    onChange={(e) => handleUpdatePaymentStatus(acc.id, e.target.value)}
                                    className={`px-2 py-1 rounded-xl text-[10px] font-extrabold border focus:outline-none ${
                                      acc.payment_status === "PAID" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                                      acc.payment_status === "PARTIAL" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                                      "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                    }`}
                                  >
                                    <option value="PAID" className="bg-slate-900 text-emerald-400">🟢 To'langan</option>
                                    <option value="PARTIAL" className="bg-slate-900 text-amber-400">🟡 Qisman To'langan</option>
                                    <option value="DEBT" className="bg-slate-900 text-rose-400">🔴 Qarzdorlik bor</option>
                                  </select>
                                </div>

                                {acc.notes && (
                                  <p className={`text-[11px] italic px-1 text-left ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    "{acc.notes}"
                                  </p>
                                )}

                                {/* Action Buttons Footer */}
                                <div className="flex items-center justify-between border-t border-inherit pt-3">
                                  <button
                                    onClick={() => handleOpenDirectMsgModal(acc)}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 font-bold text-[10px] border border-indigo-500/30 flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-xs">send</span>
                                    Shaxsiy Xabar Yuborish
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleEditAccountClick(acc)}
                                      className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                                      title="Tahrirlash"
                                    >
                                      <span className="material-symbols-outlined text-xs">edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAccountClick(acc.id)}
                                      className="p-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                                      title="O'chirish"
                                    >
                                      <span className="material-symbols-outlined text-xs">delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {filteredAccountProfiles.length === 0 && (
                              <div className={`col-span-full p-8 rounded-3xl border text-center text-xs italic ${
                                isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
                              }`}>
                                Hech qanday akkaunt profili topilmadi.
                              </div>
                            )}
                          </div>
                        )}

                        {/* REJIM 2: ODATIY JADVAL VIEW (TABLE VIEW WITH COUNTDOWN BADGES) */}
                        {childrenViewMode === "table" && (
                          <div className={`p-6 rounded-3xl border overflow-x-auto ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className={`border-b ${isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                                  <th className="p-3">#</th>
                                  <th className="p-3">Ota-ona (Telefon & TG ID)</th>
                                  <th className="p-3">Farzand (Guruh & Yosh)</th>
                                  <th className="p-3">To'lov Countdown</th>
                                  <th className="p-3">To'lov Statusi</th>
                                  <th className="p-3 text-right">Amallar</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-inherit">
                                {filteredAccountProfiles.map((acc, idx) => (
                                  <tr key={acc.id} className={`hover:bg-slate-500/10 transition-colors ${
                                    isDark ? "text-slate-200" : "text-slate-800"
                                  }`}>
                                    <td className="p-3 font-mono font-bold">{idx + 1}</td>
                                    <td className="p-3">
                                      <div className="flex flex-col">
                                        <span className="font-bold text-sm text-indigo-400">{acc.parent_name}</span>
                                        <span className="text-[11px] text-slate-400">{acc.parent_phone} | TG: {acc.parent_tg_id || "—"}</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="flex flex-col">
                                        <span className="font-bold">{acc.child_name}</span>
                                        <span className="text-[11px] text-slate-400">{acc.group} ({acc.child_age})</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      {renderDueCountdownBadge(acc.due_days_left, acc.payment_status)}
                                    </td>
                                    <td className="p-3">
                                      <select
                                        value={acc.payment_status}
                                        onChange={(e) => handleUpdatePaymentStatus(acc.id, e.target.value)}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold focus:outline-none ${
                                          acc.payment_status === "PAID" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" :
                                          acc.payment_status === "PARTIAL" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" :
                                          "bg-rose-500/20 text-rose-400 border-rose-500/40"
                                        }`}
                                      >
                                        <option value="PAID" className="bg-slate-900 text-emerald-400">🟢 To'langan</option>
                                        <option value="PARTIAL" className="bg-slate-900 text-amber-400">🟡 Qisman To'langan</option>
                                        <option value="DEBT" className="bg-slate-900 text-rose-400">🔴 Qarzdorlik bor</option>
                                      </select>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => handleOpenDirectMsgModal(acc)}
                                          className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 font-bold text-[10px] border border-indigo-500/30 flex items-center gap-1"
                                        >
                                          <span className="material-symbols-outlined text-xs">send</span>
                                          Xabar
                                        </button>
                                        <button
                                          onClick={() => handleEditAccountClick(acc)}
                                          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                                          title="Tahrirlash"
                                        >
                                          <span className="material-symbols-outlined text-xs">edit</span>
                                        </button>
                                        <button
                                          onClick={() => handleDeleteAccountClick(acc.id)}
                                          className="p-1 rounded bg-red-500/20 text-red-400 border border-red-500/30"
                                          title="O'chirish"
                                        >
                                          <span className="material-symbols-outlined text-xs">delete</span>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MINI-BO'LIM 2: YANGI AKKAUNT VA BOLA YARATISH FORMASI */}
                    {childrenSubTab === "create" && (
                      <div className={`p-6 rounded-3xl border flex flex-col gap-6 ${
                        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                      }`}>
                        <div className="flex items-center justify-between border-b pb-3 border-inherit">
                          <h4 className="font-bold text-base text-indigo-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">person_add</span>
                            {editingAccId ? "✏️ Ota-ona va Bola Profilini Tahrirlash" : "👤 Yangi Ota-ona va Farzand Akkauntini Yaratish"}
                          </h4>
                          {editingAccId && (
                            <button
                              onClick={() => {
                                setEditingAccId(null);
                                setChildrenSubTab("profiles");
                              }}
                              className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs"
                            >
                              Bekor Qilish
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleSaveAccountProfile} className="flex flex-col gap-4 text-xs">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Ota-ona F.I.Sh *</label>
                              <input
                                type="text"
                                required
                                placeholder="Masalan: Ali Ota Rahimova"
                                value={newAccForm.parent_name}
                                onChange={(e) => setNewAccForm({ ...newAccForm, parent_name: e.target.value })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Aloqa Telefon Raqami *</label>
                              <input
                                type="text"
                                required
                                placeholder="+998 90 123 45 67"
                                value={newAccForm.parent_phone}
                                onChange={(e) => setNewAccForm({ ...newAccForm, parent_phone: e.target.value })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Telegram ID</label>
                              <input
                                type="text"
                                placeholder="Masalan: 123456789"
                                value={newAccForm.parent_tg_id}
                                onChange={(e) => setNewAccForm({ ...newAccForm, parent_tg_id: e.target.value })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Bolaning Ismi *</label>
                              <input
                                type="text"
                                required
                                placeholder="Masalan: Aliya Alieva"
                                value={newAccForm.child_name}
                                onChange={(e) => setNewAccForm({ ...newAccForm, child_name: e.target.value })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Bolaning Yoshi</label>
                              <input
                                type="text"
                                placeholder="Masalan: 4 yosh"
                                value={newAccForm.child_age}
                                onChange={(e) => setNewAccForm({ ...newAccForm, child_age: e.target.value })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Guruh *</label>
                              <select
                                value={newAccForm.group}
                                onChange={(e) => setNewAccForm({ ...newAccForm, group: e.target.value })}
                                className={`px-4 py-3 border rounded-xl font-bold focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              >
                                <option value="Kamalak">Kamalak guruhi (3-4 yosh)</option>
                                <option value="Yulduzcha">Yulduzcha guruhi (4-5 yosh)</option>
                                <option value="Quyoshcha">Quyoshcha guruhi (5-6 yosh)</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Boshlang'ich To'lov Statusi *</label>
                              <select
                                value={newAccForm.payment_status}
                                onChange={(e) => setNewAccForm({ ...newAccForm, payment_status: e.target.value })}
                                className={`px-4 py-3 border rounded-xl font-bold focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-emerald-400" : "border-slate-300 bg-slate-50 text-emerald-700"
                                }`}
                              >
                                <option value="PAID">🟢 To'langan (To'liq to'lov)</option>
                                <option value="PARTIAL">🟡 Qisman To'langan (Avans/Yarim)</option>
                                <option value="DEBT">🔴 Qarzdorlik bor (To'lanmagan)</option>
                              </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>To'lovgacha Qolgan Kunlar *</label>
                              <input
                                type="number"
                                required
                                value={newAccForm.due_days_left}
                                onChange={(e) => setNewAccForm({ ...newAccForm, due_days_left: parseInt(e.target.value) || 0 })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Izoh yoki Maxsus Qo'shimcha</label>
                              <input
                                type="text"
                                placeholder="Masalan: Sog'ligi bo'yicha maxsus parxez..."
                                value={newAccForm.notes}
                                onChange={(e) => setNewAccForm({ ...newAccForm, notes: e.target.value })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="py-3 px-8 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg border-b-4 border-indigo-700 active:scale-95 transition-all self-end mt-2 flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-base">save</span>
                            {editingAccId ? "Akkaunt Profilini Saqlash" : "Yangi Akkauntni Bazaga Saqlash"}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* MINI-BO'LIM 3: SEGMENTATSIYA VA ANALITIKA */}
                    {childrenSubTab === "analytics" && (
                      <div className="flex flex-col gap-6 w-full animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
                          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <span className="text-slate-400 font-bold">Jami Akkauntlar</span>
                            <span className="text-3xl font-extrabold text-indigo-400 mt-2">{accountProfiles.length} ta</span>
                          </div>

                          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <span className="text-slate-400 font-bold">⏰ To'lov Vaqti Yetgan</span>
                            <span className="text-3xl font-extrabold text-amber-400 mt-2">{dueSoonCount} ta</span>
                          </div>

                          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <span className="text-slate-400 font-bold">🟢 To'langan Akkauntlar</span>
                            <span className="text-3xl font-extrabold text-emerald-400 mt-2">
                              {accountProfiles.filter(a => a.payment_status === "PAID").length} ta
                            </span>
                          </div>

                          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <span className="text-slate-400 font-bold">🟡 Qisman To'langan</span>
                            <span className="text-3xl font-extrabold text-amber-400 mt-2">
                              {accountProfiles.filter(a => a.payment_status === "PARTIAL").length} ta
                            </span>
                          </div>

                          <div className={`p-5 rounded-3xl border flex flex-col justify-between ${
                            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                          }`}>
                            <span className="text-slate-400 font-bold">🔴 Qarzdor Akkauntlar</span>
                            <span className="text-3xl font-extrabold text-rose-400 mt-2">
                              {accountProfiles.filter(a => a.payment_status === "DEBT").length} ta
                            </span>
                          </div>
                        </div>

                        <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${
                          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                        }`}>
                          <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3">Guruhlar Bo'yicha Qamrov</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            {["Kamalak", "Yulduzcha", "Quyoshcha"].map((grp) => {
                              const cnt = accountProfiles.filter(a => a.group === grp).length;
                              return (
                                <div key={grp} className={`p-4 rounded-2xl border flex flex-col gap-1 ${
                                  isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                                }`}>
                                  <span className="font-bold text-sm text-cyan-400">{grp} guruhi</span>
                                  <span className="text-lg font-bold text-white mt-1">{cnt} nafar bola</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MODAL FOR DIRECT PARENT MESSAGING */}
                    {directMsgModal.isOpen && (
                      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 flex flex-col gap-4 text-left relative animate-scale-up ${
                          isDark ? "bg-slate-900 border-indigo-500/40 text-white" : "bg-white border-slate-200 text-slate-900 shadow-2xl"
                        }`}>
                          <div className="flex justify-between items-center border-b pb-3 border-inherit">
                            <h4 className="font-bold text-sm text-indigo-400 flex items-center gap-2">
                              <span className="material-symbols-outlined text-lg">send</span>
                              Shaxsiy Bildirishnoma Yuborish ({directMsgModal.parentName})
                            </h4>
                            <button
                              onClick={() => setDirectMsgModal({ ...directMsgModal, isOpen: false })}
                              className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
                            >
                              <span className="material-symbols-outlined text-base">close</span>
                            </button>
                          </div>

                          <div className="flex flex-col gap-1 text-xs">
                            <span className="text-slate-400">Qabul qiluvchi: <strong className="text-white">{directMsgModal.parentName}</strong> ({directMsgModal.parentPhone})</span>
                            <span className="text-slate-400">Farzand: <strong className="text-indigo-400">{directMsgModal.childName}</strong></span>
                          </div>

                          <form onSubmit={handleSendDirectMsg} className="flex flex-col gap-3 text-xs">
                            <div className="flex flex-col gap-1">
                              <label className="font-bold text-slate-300">Shablon Tanlash:</label>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setDirectMsgModal({
                                    ...directMsgModal,
                                    text: `Xurmatli ${directMsgModal.parentName}, ${directMsgModal.childName} uchun oylik bog'cha to'lovini amalga oshirishingizni so'raymiz.`
                                  })}
                                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold"
                                >
                                  💰 To'lov Eslatmasi
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDirectMsgModal({
                                    ...directMsgModal,
                                    text: `Xurmatli ${directMsgModal.parentName}, ertaga ${directMsgModal.childName} ishtirokida maxsus bayram tadbiri bo'lib o'tadi.`
                                  })}
                                  className="px-2.5 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold"
                                >
                                  🎉 Tadbir Bildirishnomasi
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="font-bold text-slate-300">Xabar Matni *</label>
                              <textarea
                                required
                                value={directMsgModal.text}
                                onChange={(e) => setDirectMsgModal({ ...directMsgModal, text: e.target.value })}
                                className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 h-28 resize-none text-xs ${
                                  isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                                }`}
                              />
                            </div>

                            <button
                              type="submit"
                              className="py-3 px-6 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg border-b-2 border-indigo-700 active:scale-95 transition-all self-end mt-1 flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-base">send</span>
                              🚀 Telegram / SMS Orqali Yuborish
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeCrmTab === "leads" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-amber-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">contacts</span>
                      Potensial Ota-onalar (AI Leads Pipeline)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {applyLeads.map((lead) => (
                        <div key={lead.id} className={`p-4 border rounded-2xl flex flex-col gap-2 text-xs ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex justify-between items-center">
                            <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{lead.parent_name}</span>
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2.5 py-0.5 rounded-md font-bold">
                              {lead.status}
                            </span>
                          </div>
                          <span className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>Telefon: {lead.phone}</span>
                          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>Farzand: {lead.child} | Izoh: {lead.notes}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeCrmTab === "groups" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3">Guruhlar Boshqaruvi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {groupsList.map((g) => (
                        <div key={g.id} className={`p-4 border rounded-2xl flex flex-col gap-2 ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <span className="font-bold text-sm text-indigo-400">{g.name}</span>
                          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>Yoshi: {g.age} | Tarbiyachi: {g.teacher}</span>
                          <span className="text-xs text-cyan-400 font-bold">Bolalar soni: {g.count} nafar</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeCrmTab === "messages" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">campaign</span>
                      Ota-onalarga Ommaviy Bildirishnoma Yuborish
                    </h4>
                    <form onSubmit={handleSendBroadcast} className="flex flex-col gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="Xabar Mavzusi"
                        value={msgSubject}
                        onChange={(e) => setMsgSubject(e.target.value)}
                        className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                          isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                      <textarea
                        placeholder="Xabar matni..."
                        required
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                        className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 h-32 resize-none ${
                          isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                        }`}
                      />
                      <button
                        type="submit"
                        className="py-3 px-6 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow border-b-2 border-indigo-700 active:scale-95 transition-all self-end"
                      >
                        Ommaviy Yuborish
                      </button>
                    </form>
                  </div>
                )}

                {activeCrmTab === "dashboard" && (
                  <div className="flex flex-col gap-6">
                    <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                      <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3">Boshqaruv Statistikasi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className={`p-4 border rounded-2xl flex flex-col ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Bugungi Davomat</span>
                          <span className="text-2xl font-bold text-emerald-400 mt-1">94%</span>
                        </div>
                        <div className={`p-4 border rounded-2xl flex flex-col ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>To'lovlar</span>
                          <span className="text-2xl font-bold text-cyan-400 mt-1">88% Bajarildi</span>
                        </div>
                      </div>
                    </div>

                    <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                      <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3">Yangi E'lon Qo'shish</h4>
                      <form onSubmit={handleAddAnnouncement} className="flex flex-col gap-3 text-xs">
                        <input
                          type="text"
                          placeholder="E'lon Sarlavhasi"
                          required
                          value={newAnnTitle}
                          onChange={(e) => setNewAnnTitle(e.target.value)}
                          className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 ${
                            isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                        />
                        <textarea
                          placeholder="E'lon matni..."
                          required
                          value={newAnnText}
                          onChange={(e) => setNewAnnText(e.target.value)}
                          className={`px-4 py-3 border rounded-xl focus:outline-none focus:border-indigo-500 h-24 resize-none ${
                            isDark ? "border-slate-800 bg-slate-950 text-white" : "border-slate-300 bg-slate-50 text-slate-900"
                          }`}
                        />
                        <button
                          type="submit"
                          className="py-3 px-6 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow border-b-2 border-indigo-700 active:scale-95 transition-all self-end"
                        >
                          E'lonni Chaqirish
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeCrmTab === "timeline" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">history</span>
                      Kun Tartibi & Kundalik Jurnallar (Daily Logs)
                    </h4>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      Bolalarning kunlik ovqatlanishi, uyqu vaqti hamda mashg'ulotlari kuzatuvi.
                    </p>
                  </div>
                )}

                {activeCrmTab === "cameras" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">videocam</span>
                      HD Kameralar Oqimi Boshqaruvi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {camerasList.map((cam) => (
                        <div key={cam.id} className={`p-4 border rounded-2xl flex flex-col justify-between gap-2 text-xs ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex flex-col">
                            <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{cam.name}</span>
                            <span className="text-xs text-emerald-400 font-bold mt-1">{cam.stream}</span>
                          </div>
                          <span className="self-start bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded font-bold">
                            {cam.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeCrmTab === "tasks" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">task</span>
                      Xodimlar Topshiriqlari va Vazifalar Taqvimi
                    </h4>
                    <div className="flex flex-col gap-3">
                      {tasksList.map((taskItem) => (
                        <div key={taskItem.id} className={`p-4 border rounded-2xl flex items-center justify-between text-xs ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                          <div className="flex flex-col gap-1">
                            <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{taskItem.title}</span>
                            <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>Mas'ul: {taskItem.assignee}</span>
                          </div>
                          <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] px-2.5 py-0.5 rounded-md font-bold">
                            {taskItem.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeCrmTab === "profile" && (
                  <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-sm text-indigo-400 border-b border-inherit pb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">person</span>
                      Admin Profili va Xavfsizlik Sozlamalari
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-2xl">
                        A
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-bold text-base ${isDark ? "text-white" : "text-slate-900"}`}>{adminUser?.email}</span>
                        <span className="text-xs text-indigo-400 font-bold">Tizim Administratori</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION DOCK (Positioned at bottom of screen on mobile devices md:hidden) */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 flex md:hidden overflow-x-auto scrollbar-none p-1.5 border-t shadow-2xl backdrop-blur-xl gap-1 justify-around transition-colors duration-300 ${
        isDark ? "bg-slate-950/95 border-slate-800/90 text-slate-100" : "bg-white/95 border-slate-200 text-slate-900 shadow-2xl"
      }`}>
        {mode === "CMS" ? (
          <>
            {[
              { id: "home", label: t("admin.cms.home"), icon: "home" },
              { id: "life", label: t("admin.cms.life"), icon: "sports_esports" },
              { id: "about", label: t("admin.cms.about"), icon: "diversity_3" },
              { id: "ai", label: t("admin.cms.ai"), icon: "neurology" },
              { id: "bot_settings", label: "Bot", icon: "settings_suggest" },
              { id: "apply", label: "CRM", icon: "assignment" },
              { id: "admins", label: "Adminlar", icon: "admin_panel_settings" },
              { id: "help", label: t("admin.cms.help"), icon: "help" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCmsTab(tab.id)}
                className={`flex-1 min-w-[54px] py-1.5 px-1 rounded-xl font-bold text-[9px] sm:text-[10px] flex flex-col items-center justify-center gap-0.5 whitespace-nowrap transition-all ${
                  activeCmsTab === tab.id 
                    ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-extrabold" 
                    : isDark 
                      ? "text-slate-400 hover:text-white" 
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="material-symbols-outlined text-base sm:text-lg">{tab.icon}</span>
                <span className="truncate max-w-[64px]">{tab.label}</span>
              </button>
            ))}
          </>
        ) : (
          <>
            {[
              { id: "children", label: t("admin.crm.children"), icon: "boy" },
              { id: "leads", label: "AI Lead", icon: "contacts" },
              { id: "groups", label: t("admin.crm.groups"), icon: "group_work" },
              { id: "messages", label: t("admin.crm.messages"), icon: "campaign" },
              { id: "dashboard", label: t("admin.crm.dashboard"), icon: "dashboard" },
              { id: "timeline", label: t("admin.crm.timeline"), icon: "history" },
              { id: "cameras", label: t("admin.crm.cameras"), icon: "videocam" },
              { id: "tasks", label: t("admin.crm.tasks"), icon: "task" },
              { id: "profile", label: t("admin.crm.profile"), icon: "person" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCrmTab(tab.id)}
                className={`flex-1 min-w-[54px] py-1.5 px-1 rounded-xl font-bold text-[9px] sm:text-[10px] flex flex-col items-center justify-center gap-0.5 whitespace-nowrap transition-all ${
                  activeCrmTab === tab.id 
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 font-extrabold" 
                    : isDark 
                      ? "text-slate-400 hover:text-white" 
                      : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="material-symbols-outlined text-base sm:text-lg">{tab.icon}</span>
                <span className="truncate max-w-[64px]">{tab.label}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
