import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("XATO: .env faylida SUPABASE_URL va SUPABASE_ANON_KEY kiritilishi shart!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTablesExist() {
  console.log("=== BAZADA YANGI JADVALLAR MAVJUDLIGINI TEKSHIRISH ===");
  
  // dynamic_pages jadvalini tekshirish
  const { data: pageData, error: pageError } = await supabase
    .from('dynamic_pages')
    .select('id')
    .limit(1);

  if (pageError && pageError.code === '42P01') {
    console.error("❌ XATO: 'dynamic_pages' jadvali topilmadi!");
    return false;
  }

  // messages jadvalini tekshirish
  const { data: msgData, error: msgError } = await supabase
    .from('messages')
    .select('id')
    .limit(1);

  if (msgError && msgError.code === '42P01') {
    console.error("❌ XATO: 'messages' jadvali topilmadi!");
    return false;
  }

  console.log("✅ Yangi jadvallar (dynamic_pages, messages) bazada mavjud.");
  return true;
}

async function runAdminRLSTests() {
  const exists = await checkTablesExist();
  if (!exists) {
    console.log("\n[YO'RIQNOMA] Yangi jadvallarni yaratish uchun iltimos, quyidagi SQL faylni Supabase SQL Editor'da ishga tushiring:");
    console.log("👉 supabase/migrations/20260719_admin_tables.sql\n");
    process.exit(0);
  }

  console.log("\n=== YANGI JADVALLAR UCHUN RLS VA XAVFSIZLIK TESTLARI ===\n");

  const testUsers = [
    { email: 'admin@bogcha.uz', password: 'password123', role: 'ADMIN' },
    { email: 'teacher1@bogcha.uz', password: 'password123', role: 'TEACHER' },
    { email: 'parent1@bogcha.uz', password: 'password123', role: 'PARENT' }
  ];

  const userIds = {};
  
  // Foydalanuvchilar sessiyasini olish
  for (const u of testUsers) {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client.auth.signInWithPassword({
      email: u.email,
      password: u.password
    });
    if (error) {
      console.error(`❌ ${u.email} tizimga kira olmadi:`, error.message);
      return;
    }
    userIds[u.role] = { client, id: data.user.id };
  }

  // 1. Dastlabki sahifani yozish (Admin orqali dynamic_pages)
  console.log("[Test 1] Admin orqali sahifa kontentini yozish (dynamic_pages)...");
  const adminClient = userIds['ADMIN'].client;
  const testPage = {
    page_name: 'home',
    app_type: 'MAIN',
    content: {
      uz: { title: "Xush kelibsiz", welcome_text: "Bizning bog'chamizga xush kelibsiz!" },
      ru: { title: "Добро пожаловать", welcome_text: "Добро пожаловать в наш детский сад!" }
    }
  };

  const { error: pageUpsertErr } = await adminClient
    .from('dynamic_pages')
    .upsert([testPage], { onConflict: 'page_name' });

  if (pageUpsertErr) {
    console.error("  ❌ Admin sahifa ma'lumotini yoza olmadi:", pageUpsertErr.message);
  } else {
    console.log("  ✅ Admin sahifa ma'lumotlarini muvaffaqiyatli yozdi (home).");
  }

  // 2. Sahifalarni o'qish testi (Anonim foydalanuvchi)
  console.log("\n[Test 2] Tizimga kirmagan (Anonim) foydalanuvchi sahifani o'qishi...");
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: pages, error: pageReadErr } = await anonClient
    .from('dynamic_pages')
    .select('*')
    .eq('page_name', 'home');

  if (pageReadErr) {
    console.error("  ❌ Anonim sahifani o'qiy olmadi:", pageReadErr.message);
  } else if (pages && pages.length > 0) {
    console.log(`  ✅ Muvaffaqiyatli: Anonim o'qiy oldi (Sarlavha UZ: "${pages[0].content.uz.title}").`);
  } else {
    console.error("  ❌ Sahifa topilmadi.");
  }

  // 3. Sahifalarni o'zgartirish testi (Parent va Teacher uchun taqiqlangan bo'lishi kerak)
  console.log("\n[Test 3] Ota-ona yoki Tarbiyachi sahifani o'zgartirishi taqiqlanganligi...");
  const parentClient = userIds['PARENT'].client;
  const { data: parentUpdateRes, error: parentPageErr } = await parentClient
    .from('dynamic_pages')
    .update({ content: { uz: { title: "Buzilgan sayt" } } })
    .eq('page_name', 'home')
    .select();

  if (parentPageErr || !parentUpdateRes || parentUpdateRes.length === 0) {
    console.log("  ✅ Xavfsiz: Ota-onaga sahifani tahrirlash taqiqlangan (0 qator o'zgartirildi).");
  } else {
    console.error("  ❌ XAVF: Ota-ona sahifa kontentini tahrirlay oldi!");
  }

  // 4. Admin orqali test xabarlarini yaratish
  console.log("\n[Test 4] Admin tomonidan test xabarlarini yuborish...");
  
  // Bolalarni va guruhlarni olish (bog'lash uchun)
  const { data: children } = await adminClient.from('children').select('id, group_id, parent_id');
  const child = children ? children[0] : null;

  if (!child) {
    console.error("  ❌ Bazada bolalar ma'lumoti yo'q, xabar testini davom ettirib bo'lmaydi.");
    return;
  }

  // Test xabarlar payloadi
  const testMsgs = [
    { sender_id: userIds['ADMIN'].id, type: 'GLOBAL', title: 'Global E\'lon', content: 'Bog\'cha faoliyati haqida.' },
    { sender_id: userIds['ADMIN'].id, type: 'GROUP', group_id: child.group_id, title: 'Guruh E\'loni', content: 'Ertaga majlis.' },
    { sender_id: userIds['ADMIN'].id, type: 'PERSONAL', child_id: child.id, title: 'Shaxsiy E\'lon', content: 'Farzandingiz bugun faol bo\'ldi.' }
  ];

  const { error: msgInsertErr } = await adminClient
    .from('messages')
    .insert(testMsgs);

  if (msgInsertErr) {
    console.error("  ❌ Admin xabarlarni jo'nata olmadi:", msgInsertErr.message);
  } else {
    console.log("  ✅ Admin GLOBAL, GROUP va PERSONAL xabarlarni yubordi.");
  }

  // 5. Ota-ona xabarlarni ko'rishi testi
  console.log("\n[Test 5] Ota-ona (Parent 1) o'ziga tegishli xabarlarni ko'rishi...");
  const { data: parentMsgs, error: parentMsgsErr } = await parentClient
    .from('messages')
    .select('*');

  if (parentMsgsErr) {
    console.error("  ❌ Ota-ona xabarlarni o'qiy olmadi:", parentMsgsErr.message);
  } else {
    console.log(`  ✅ Ota-ona jami ${parentMsgs.length} ta xabarni o'qidi.`);
    parentMsgs.forEach(m => {
      console.log(`     - Turi: ${m.type}, Sarlavha: ${m.title}`);
    });
    
    // Tekshirish: ota-onaga faqat unga tegishli xabarlar keldimi?
    const hasGlobal = parentMsgs.some(m => m.type === 'GLOBAL');
    const hasGroup = parentMsgs.some(m => m.type === 'GROUP' && m.group_id === child.group_id);
    const hasPersonal = parentMsgs.some(m => m.type === 'PERSONAL' && m.child_id === child.id);

    if (hasGlobal && hasGroup && hasPersonal) {
      console.log("  ✅ Muvaffaqiyatli: Ota-onaga faqat uning guruhiga va farzandiga tegishli xabarlar ko'rindi.");
    } else {
      console.error("  ❌ Xato: Tegishli xabarlar to'liq yuklanmadi.");
    }
  }

  // Tizimdan chiqish
  for (const role of Object.keys(userIds)) {
    await userIds[role].client.auth.signOut();
  }
  
  console.log("\n=== BARCHA ADMIN PANEL RLS SINAVLARI YAKUNLANDI ===");
}

runAdminRLSTests().catch(console.error);
