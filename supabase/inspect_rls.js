import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log("=== SAHIFA KONTENTINI TEKSHIRISH (PARENTS UPDATE'DAN KEYIN) ===");
  
  // 1. Sahifani o'qish (Hozirgi holat)
  const { data: pageBefore } = await supabase
    .from('dynamic_pages')
    .select('*')
    .eq('page_name', 'home');
  
  console.log("Hozirgi sarlavha (UZ):", pageBefore?.[0]?.content?.uz?.title);

  // 2. Ota-ona sifatida kirish va tahrirlashga urinish
  const parentClient = createClient(supabaseUrl, supabaseAnonKey);
  await parentClient.auth.signInWithPassword({
    email: 'parent1@bogcha.uz',
    password: 'password123'
  });

  const { data: updateRes, error: updateErr, count } = await parentClient
    .from('dynamic_pages')
    .update({ content: { uz: { title: "BUZILGAN SAYT" } } })
    .eq('page_name', 'home')
    .select();

  console.log("Update Xatosi:", updateErr ? updateErr.message : "Yo'q");
  console.log("Yangilangan qatorlar soni:", updateRes?.length || 0);

  // 3. Sahifani qayta o'qish
  const { data: pageAfter } = await supabase
    .from('dynamic_pages')
    .select('*')
    .eq('page_name', 'home');
  
  console.log("Tahrirdan keyingi sarlavha (UZ):", pageAfter?.[0]?.content?.uz?.title);

  if (pageAfter?.[0]?.content?.uz?.title === "BUZILGAN SAYT") {
    console.error("❌ XAVF: Ota-ona sahifa sarlavhasini o'zgartira oldi!");
  } else {
    console.log("✅ XAVFSIZ: Ota-ona sahifa sarlavhasini o'zgartira olmadi. RLS ishlamoqda!");
  }

  await parentClient.auth.signOut();
}

inspect().catch(console.error);
