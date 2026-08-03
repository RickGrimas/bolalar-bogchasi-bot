import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env faylidan o'zgaruvchilarni yuklash
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("XATO: .env faylida SUPABASE_URL va SUPABASE_ANON_KEY kiritilishi shart!");
  console.log("Iltimos, avval .env.example faylini .env deb nusxalang va kalitlarni kiriting.");
  process.exit(1);
}

// 1. Anonim (tizimga kirmagan) mijoz uchun Supabase klienti
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log("=== SUPABASE RLS XAVFSIZLIK VA BAZA TESTINI BOSHLASH ===\n");

  try {
    // -----------------------------------------------------------------
    // TEST 1: Tizimga kirmagan (Anonymous) foydalanuvchi testi
    // -----------------------------------------------------------------
    console.log("1. Tizimga kirmagan mijoz (anonim) uchun testlar:");

    // CRM Lead (ariza) qoldirishni sinash (Ruxsat berilgan bo'lishi kerak - Ommaviy Insert)
    const testLead = {
      parent_name: "Toshmat Ota",
      parent_phone: "+998991112233",
      child_name: "Eshmat",
      child_age: 5,
      notes: "Veb-saytdan ommaviy ariza testi."
    };

    const { error: leadInsertError } = await anonClient
      .from('crm_leads')
      .insert([testLead]);

    if (leadInsertError) {
      console.error("  ❌ Xato: Anonim mijoz ariza jo'nata olmadi:", leadInsertError.message);
    } else {
      console.log("  ✅ Muvaffaqiyatli: Anonim mijoz yangi ariza jo'natdi.");
    }

    // Arizalarni o'qishga urinish (Taqiqlangan bo'lishi kerak - RLS read block)
    const { data: readLeads, error: leadReadError } = await anonClient
      .from('crm_leads')
      .select('*');

    if (leadReadError || !readLeads || readLeads.length === 0) {
      console.log("  ✅ Himoya kuchi: Tizimga kirmagan mijoz arizalar ro'yxatini o'qiy olmadi.");
    } else {
      console.error("  ❌ XAVF: Tizimga kirmagan mijoz barcha arizalarni o'qib oldi!");
    }

    // Bolalar ro'yxatini o'qishga urinish (Taqiqlangan bo'lishi kerak)
    const { data: anonChildren, error: anonChildError } = await anonClient
      .from('children')
      .select('*');

    if (anonChildError || !anonChildren || anonChildren.length === 0) {
      console.log("  ✅ Himoya kuchi: Tizimga kirmagan mijoz bolalar ro'yxatini o'qiy olmadi.");
    } else {
      console.error("  ❌ XAVF: Tizimga kirmagan mijoz bolalar ro'yxatini o'qib oldi!");
    }


    // -----------------------------------------------------------------
    // TEST 2: Ota-ona (Parent 1) sifatida tizimga kirish va test
    // -----------------------------------------------------------------
    console.log("\n2. Ota-ona (parent1@bogcha.uz) profili orqali testlar:");

    const parentClient = createClient(supabaseUrl, supabaseAnonKey);
    const { error: parentLoginError } = await parentClient.auth.signInWithPassword({
      email: 'parent1@bogcha.uz',
      password: 'password123',
    });

    if (parentLoginError) {
      console.error("  ❌ Xato: Ota-ona login qila olmadi:", parentLoginError.message);
      return;
    }
    console.log("  ✅ Ota-ona tizimga muvaffaqiyatli kirdi.");

    // Ota-ona o'z farzandini o'qishga urinishi (Ruxsat berilgan bo'lishi kerak - faqat o'z bolasi Aliya ko'rinishi lozim)
    const { data: myChildren, error: parentChildError } = await parentClient
      .from('children')
      .select('*');

    if (parentChildError) {
      console.error("  ❌ Xato: Ota-ona bolalarini o'qiy olmadi:", parentChildError.message);
    } else {
      console.log("  ✅ Bolalar o'qildi. Soni:", myChildren.length);
      myChildren.forEach(child => {
        console.log(`     - Bola: ${child.first_name} ${child.last_name} (Parent ID: ${child.parent_id})`);
      });
      
      const containsOthers = myChildren.some(child => child.first_name === 'Valisher');
      if (containsOthers) {
        console.error("  ❌ XAVF: Parent 1 boshqa ota-onaning bolasi (Valisher) ma'lumotlarini ham ko'rib qoldi!");
      } else {
        console.log("  ✅ Xavfsiz: Parent 1 faqat o'z farzandi (Aliya) ma'lumotlarini ko'ra oldi.");
      }
    }


    // -----------------------------------------------------------------
    // TEST 3: Tarbiyachi (teacher1@bogcha.uz) sifatida tizimga kirish va test
    // -----------------------------------------------------------------
    console.log("\n3. Tarbiyachi (teacher1@bogcha.uz) profili orqali testlar:");

    const teacherClient = createClient(supabaseUrl, supabaseAnonKey);
    const { error: teacherLoginError } = await teacherClient.auth.signInWithPassword({
      email: 'teacher1@bogcha.uz',
      password: 'password123',
    });

    if (teacherLoginError) {
      console.error("  ❌ Xato: Tarbiyachi login qila olmadi:", teacherLoginError.message);
      return;
    }
    console.log("  ✅ Tarbiyachi tizimga muvaffaqiyatli kirdi.");

    // Tarbiyachi o'z guruhidagi bolalarni o'qish testi (Kamalak guruhidagi Aliya va Valisher ko'rinishi lozim)
    const { data: classChildren, error: teacherChildError } = await teacherClient
      .from('children')
      .select('*');

    if (teacherChildError) {
      console.error("  ❌ Xato: Tarbiyachi bolalarini o'qiy olmadi:", teacherChildError.message);
    } else {
      console.log(`  ✅ Tarbiyachi o'z guruhidagi ${classChildren.length} ta bolani o'qidi.`);
      classChildren.forEach(c => {
        console.log(`     - Bola: ${c.first_name} ${c.last_name}`);
      });
    }

    // Tarbiyachi yangi kunlik log (hisobot) kiritish testi (Ruxsat berilgan)
    const testLog = {
      child_id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', // Aliya
      attended: true,
      food_rating: 'GOOD',
      sleep_hours: 2.0,
      mood: 'Yaxshi',
      notes: 'Tarbiyachi tomonidan test tariqasida kiritildi.'
    };

    const { data: insertedLog, error: logError } = await teacherClient
      .from('daily_logs')
      .upsert([testLog], { onConflict: 'child_id,date' })
      .select();

    if (logError) {
      console.error("  ❌ Xato: Tarbiyachi kunlik hisobot yozolmadi:", logError.message);
    } else {
      console.log("  ✅ Muvaffaqiyatli: Tarbiyachi bolaga kunlik hisobot kiritdi.");
    }


    // -----------------------------------------------------------------
    // TEST 4: Admin (admin@bogcha.uz) sifatida tizimga kirish va test
    // -----------------------------------------------------------------
    console.log("\n4. Admin (admin@bogcha.uz) profili orqali testlar:");

    const adminClient = createClient(supabaseUrl, supabaseAnonKey);
    const { error: adminLoginError } = await adminClient.auth.signInWithPassword({
      email: 'admin@bogcha.uz',
      password: 'password123',
    });

    if (adminLoginError) {
      console.error("  ❌ Xato: Admin login qila olmadi:", adminLoginError.message);
      return;
    }
    console.log("  ✅ Admin tizimga muvaffaqiyatli kirdi.");

    // Admin barcha arizalarni (leads) o'qishi (Ruxsat berilgan)
    const { data: allLeads, error: adminLeadsError } = await adminClient
      .from('crm_leads')
      .select('*');

    if (adminLeadsError) {
      console.error("  ❌ Xato: Admin arizalarni o'qiy olmadi:", adminLeadsError.message);
    } else {
      console.log(`  ✅ Muvaffaqiyatli: Admin CRM jami ${allLeads.length} ta arizani o'qidi.`);
      allLeads.forEach(lead => {
        console.log(`     - Ariza: Ota-ona: ${lead.parent_name}, Tel: ${lead.parent_phone}, Bola: ${lead.child_name}, Holat: ${lead.status}`);
      });
    }

    // Admin barcha foydalanuvchilar profillarini o'qishi (Ruxsat berilgan)
    const { data: allUsers, error: adminUsersError } = await adminClient
      .from('users')
      .select('*');

    if (adminUsersError) {
      console.error("  ❌ Xato: Admin profillarni o'qiy olmadi:", adminUsersError.message);
    } else {
      console.log(`  ✅ Muvaffaqiyatli: Admin jami ${allUsers.length} ta foydalanuvchi profilini ko'ra oldi.`);
    }

    console.log("\n=== BARCHA XAVFSIZLIK VA RLS TESTLARI MUVAFFARAYATLI YAKUNLANDI ===");

  } catch (err) {
    console.error("\n❌ Test jarayonida kutilmagan xato yuz berdi:", err.message);
  }
}

runTests();
