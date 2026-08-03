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

async function runAll() {
  console.log("=== BOSHMA-BOSH FOYDALANUVCHILAR VA DINAMIK SEED TIZIMI ===\n");

  const testUsers = [
    { email: 'admin@bogcha.uz', password: 'password123', name: 'Bog\'cha Rahbari (Admin)', role: 'ADMIN' },
    { email: 'teacher1@bogcha.uz', password: 'password123', name: 'Zuhra Tarbiyachi', role: 'TEACHER' },
    { email: 'parent1@bogcha.uz', password: 'password123', name: 'Ali Ota', role: 'PARENT' },
    { email: 'parent2@bogcha.uz', password: 'password123', name: 'Vali Ota', role: 'PARENT' }
  ];

  const userIds = {};

  // 1. Foydalanuvchilarni ro'yxatdan o'tkazish (Sign Up)
  for (const u of testUsers) {
    console.log(`[Auth] ${u.email} ro'yxatdan o'tkazilmoqda...`);
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          full_name: u.name,
          role: u.role
        }
      }
    });

    if (error) {
      if (error.message.includes("already registered")) {
        console.log(`[Auth] ${u.email} allaqachon ro'yxatdan o'tgan, login qilinadi.`);
        // Login qilib ID'sini aniqlaymiz
        const { data: logData, error: logErr } = await supabase.auth.signInWithPassword({
          email: u.email,
          password: u.password
        });
        if (logErr) {
          console.error(`  ❌ Login xatosi (${u.email}):`, logErr.message);
          return;
        }
        userIds[u.email] = logData.user.id;
      } else {
        console.error(`  ❌ Ro'yxatdan o'tish xatosi (${u.email}):`, error.message);
        return;
      }
    } else {
      console.log(`  ✅ Muvaffaqiyatli ro'yxatdan o'tdi. ID: ${data.user.id}`);
      userIds[u.email] = data.user.id;
    }
  }

  // Sessiyani tozalaymiz
  await supabase.auth.signOut();

  console.log("\n=== ADMIN SIFATIDA TIZIMGA KIRIB DINAMIK MA'LUMOTLARNI SEED QILISH ===");
  
  // Admin bilan tizimga kirish
  const adminClient = createClient(supabaseUrl, supabaseAnonKey);
  const { data: adminAuth, error: adminAuthError } = await adminClient.auth.signInWithPassword({
    email: 'admin@bogcha.uz',
    password: 'password123'
  });

  if (adminAuthError) {
    console.error("❌ Admin tizimga kira olmadi. Seed to'xtatildi:", adminAuthError.message);
    return;
  }
  console.log("✅ Admin muvaffaqiyatli kirdi.");

  // Guruh yaratish / yangilash
  console.log("[Seed] Guruh yaratilmoqda...");
  const groupPayload = {
    name: 'Kamalak Guruhi',
    teacher_id: userIds['teacher1@bogcha.uz']
  };
  
  // Kamalak Guruhi bor yo'qligini tekshirish
  const { data: existingGroups } = await adminClient
    .from('groups')
    .select('id')
    .eq('name', 'Kamalak Guruhi');

  let groupId;
  if (existingGroups && existingGroups.length > 0) {
    groupId = existingGroups[0].id;
    await adminClient.from('groups').update(groupPayload).eq('id', groupId);
    console.log(`  ✅ Guruh yangilandi (ID: ${groupId})`);
  } else {
    const { data: newGroup, error: grpErr } = await adminClient
      .from('groups')
      .insert([groupPayload])
      .select();
    if (grpErr) {
      console.error("  ❌ Guruh yaratib bo'lmadi:", grpErr.message);
      return;
    }
    groupId = newGroup[0].id;
    console.log(`  ✅ Guruh yaratildi (ID: ${groupId})`);
  }

  // Bolalarni yaratish / yangilash
  console.log("[Seed] Bolalar ma'lumotlari yuklanmoqda...");
  const childrenPayload = [
    { first_name: 'Aliya', last_name: 'Alieva', birth_date: '2021-05-12', parent_id: userIds['parent1@bogcha.uz'], group_id: groupId },
    { first_name: 'Valisher', last_name: 'Valiev', birth_date: '2020-08-20', parent_id: userIds['parent2@bogcha.uz'], group_id: groupId }
  ];

  const childIds = {};
  for (const child of childrenPayload) {
    const { data: existingChild } = await adminClient
      .from('children')
      .select('id')
      .eq('first_name', child.first_name)
      .eq('parent_id', child.parent_id);

    if (existingChild && existingChild.length > 0) {
      childIds[child.first_name] = existingChild[0].id;
      await adminClient.from('children').update(child).eq('id', existingChild[0].id);
      console.log(`  ✅ Bola yangilandi: ${child.first_name}`);
    } else {
      const { data: newChild, error: chErr } = await adminClient
        .from('children')
        .insert([child])
        .select();
      if (chErr) {
        console.error(`  ❌ Bolani yaratib bo'lmadi (${child.first_name}):`, chErr.message);
        return;
      }
      childIds[child.first_name] = newChild[0].id;
      console.log(`  ✅ Bola yaratildi: ${child.first_name} (ID: ${newChild[0].id})`);
    }
  }

  // CRM Leads qo'shish
  console.log("[Seed] CRM arizalari yuklanmoqda...");
  const leads = [
    { parent_name: "Umarxo'ja", parent_phone: "+998901234567", child_name: "Jasur", child_age: 4, status: 'NEW', notes: 'Ingliz tili to\'garaklari qiziq.' },
    { parent_name: "Dilnoza", parent_phone: "+998937654321", child_name: "Madina", child_age: 3, status: 'CONTACTED', notes: 'Ertalabki guruhga joylashtirmoqchi.' }
  ];

  for (const lead of leads) {
    const { data: existingLead } = await adminClient
      .from('crm_leads')
      .select('id')
      .eq('parent_phone', lead.parent_phone);
    if (!existingLead || existingLead.length === 0) {
      await adminClient.from('crm_leads').insert([lead]);
    }
  }
  console.log("  ✅ CRM arizalari tayyorlandi.");

  // Kunlik Loglar yaratish
  console.log("[Seed] Kunlik hisobotlar yuklanmoqda...");
  const dailyLogs = [
    { child_id: childIds['Aliya'], logged_by: userIds['teacher1@bogcha.uz'], date: new Date().toISOString().split('T')[0], attended: true, food_rating: 'EXCELLENT', sleep_hours: 2.0, mood: 'Xursand', notes: 'Bugun faol bo\'ldi.' },
    { child_id: childIds['Valisher'], logged_by: userIds['teacher1@bogcha.uz'], date: new Date().toISOString().split('T')[0], attended: true, food_rating: 'GOOD', sleep_hours: 1.5, mood: 'Sokin', notes: 'Yaxshi dam oldi.' }
  ];

  for (const log of dailyLogs) {
    await adminClient.from('daily_logs').upsert([log], { onConflict: 'child_id,date' });
  }
  console.log("  ✅ Kunlik hisobotlar tayyorlandi.");

  // Sign out admin
  await adminClient.auth.signOut();


  // =====================================================================
  // RLS TEKSHIRUV BOSQICHI
  // =====================================================================
  console.log("\n=== RLS VA XAVFSIZLIK TEKSHIRUV BOSQICHI ===");

  // Test A: Anonim foydalanuvchi
  console.log("\n[Test A] Tizimga kirmagan (Anonim) mijoz:");
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  
  // CRM Lead (ariza) jo'natish - Ruxsat berilgan
  const testLead = { parent_name: "Toshmat Ota", parent_phone: "+998991112233", child_name: "Eshmat", child_age: 5, notes: "Web-test." };
  const { error: anonInsertError } = await anonClient.from('crm_leads').insert([testLead]);
  if (anonInsertError) {
    console.error("  ❌ Xato: Anonim mijoz ariza jo'nata olmadi:", anonInsertError.message);
  } else {
    console.log("  ✅ Muvaffaqiyatli: Anonim mijoz ariza jo'natdi (Ommaviy insert ishladi).");
  }

  // Arizalarni o'qish - Ruxsat berilmagan
  const { data: anonReadLeads } = await anonClient.from('crm_leads').select('*');
  if (!anonReadLeads || anonReadLeads.length === 0) {
    console.log("  ✅ Xavfsiz: Tizimga kirmaganlarga arizalarni o'qish taqiqlangan.");
  } else {
    console.error("  ❌ XAVF: Tizimga kirmaganlar arizalarni o'qiy olishdi!");
  }

  // Bolalarni o'qish - Ruxsat berilmagan
  const { data: anonReadChildren } = await anonClient.from('children').select('*');
  if (!anonReadChildren || anonReadChildren.length === 0) {
    console.log("  ✅ Xavfsiz: Tizimga kirmaganlarga bolalarni o'qish taqiqlangan.");
  } else {
    console.error("  ❌ XAVF: Tizimga kirmaganlar bolalarni o'qiy olishdi!");
  }


  // Test B: Ota-ona 1 (parent1@bogcha.uz)
  console.log("\n[Test B] Ota-ona (parent1@bogcha.uz) tizimga kirganda:");
  const parent1Client = createClient(supabaseUrl, supabaseAnonKey);
  const { error: p1LoginError } = await parent1Client.auth.signInWithPassword({
    email: 'parent1@bogcha.uz',
    password: 'password123'
  });

  if (p1LoginError) {
    console.error("  ❌ Xato: Ota-ona login qila olmadi:", p1LoginError.message);
  } else {
    console.log("  ✅ Ota-ona tizimga muvaffaqiyatli kirdi.");
    
    // O'z farzandini o'qish
    const { data: p1Children } = await parent1Client.from('children').select('*');
    console.log(`  ✅ Ota-ona ko'ra olgan bolalar soni: ${p1Children?.length || 0}`);
    p1Children?.forEach(c => {
      console.log(`     - Bola: ${c.first_name} ${c.last_name}`);
    });

    const hasAliya = p1Children?.some(c => c.first_name === 'Aliya');
    const hasValisher = p1Children?.some(c => c.first_name === 'Valisher');

    if (hasAliya && !hasValisher) {
      console.log("  ✅ Xavfsiz: Ota-ona faqat o'z farzandini ko'ra oldi. Boshqa bola yashirildi.");
    } else {
      console.error("  ❌ XAVF: RLS buzildi! Boshqa bolalar ham ko'rinib qoldi.");
    }

    // Kunlik loglarni ko'rish
    const { data: p1Logs } = await parent1Client.from('daily_logs').select('*');
    console.log(`  ✅ Ota-ona ko'rgan kunlik loglar soni: ${p1Logs?.length || 0}`);
  }


  // Test C: Tarbiyachi (teacher1@bogcha.uz)
  console.log("\n[Test C] Tarbiyachi (teacher1@bogcha.uz) tizimga kirganda:");
  const teacherClient = createClient(supabaseUrl, supabaseAnonKey);
  const { error: tLoginError } = await teacherClient.auth.signInWithPassword({
    email: 'teacher1@bogcha.uz',
    password: 'password123'
  });

  if (tLoginError) {
    console.error("  ❌ Xato: Tarbiyachi login qila olmadi:", tLoginError.message);
  } else {
    console.log("  ✅ Tarbiyachi tizimga muvaffaqiyatli kirdi.");
    
    // O'z guruhidagi bolalarni o'qish
    const { data: tChildren } = await teacherClient.from('children').select('*');
    console.log(`  ✅ Tarbiyachi ko'ra olgan guruh bolalari soni: ${tChildren?.length || 0}`);
    
    // Kunlik hisobot yozish testi
    const newLog = {
      child_id: childIds['Aliya'],
      attended: true,
      food_rating: 'EXCELLENT',
      sleep_hours: 2.0,
      mood: 'Yaxshi',
      notes: 'Tarbiyachi tomonidan test tariqasida yangilandi.'
    };
    const { error: logUpdateError } = await teacherClient
      .from('daily_logs')
      .upsert([newLog], { onConflict: 'child_id,date' });

    if (logUpdateError) {
      console.error("  ❌ Xato: Tarbiyachi kunlik log yoza olmadi:", logUpdateError.message);
    } else {
      console.log("  ✅ Muvaffaqiyatli: Tarbiyachi kunlik log yozish huquqiga ega.");
    }
  }

  // Test D: Admin (admin@bogcha.uz)
  console.log("\n[Test D] Admin (admin@bogcha.uz) tizimga kirganda:");
  const testAdminClient = createClient(supabaseUrl, supabaseAnonKey);
  const { error: adminLoginErr } = await testAdminClient.auth.signInWithPassword({
    email: 'admin@bogcha.uz',
    password: 'password123'
  });

  if (adminLoginErr) {
    console.error("  ❌ Xato: Admin login qila olmadi:", adminLoginErr.message);
  } else {
    console.log("  ✅ Admin tizimga kirdi.");
    
    // Jami arizalarni o'qish (CRM)
    const { data: adminLeads } = await testAdminClient.from('crm_leads').select('*');
    console.log(`  ✅ Admin ko'rgan CRM arizalari soni: ${adminLeads?.length || 0} ta.`);
    
    // Jami foydalanuvchilar (public.users)
    const { data: adminUsers } = await testAdminClient.from('users').select('*');
    console.log(`  ✅ Admin ko'rgan jami foydalanuvchilar soni: ${adminUsers?.length || 0} ta.`);
  }

  console.log("\n=== BARCHA DINAMIK VA RLS SINAVLARI YAKUNLANDI ===");
}

runAll().catch(console.error);
