import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function register() {
  const users = [
    { email: 'admin@bogcha.uz', password: 'password123', full_name: 'Bog\'cha Rahbari (Admin)', role: 'ADMIN' },
    { email: 'teacher1@bogcha.uz', password: 'password123', full_name: 'Zuhra Tarbiyachi', role: 'TEACHER' },
    { email: 'parent1@bogcha.uz', password: 'password123', full_name: 'Ali Ota (Aliya otasi)', role: 'PARENT' },
    { email: 'parent2@bogcha.uz', password: 'password123', full_name: 'Vali Ota (Valisher otasi)', role: 'PARENT' }
  ];

  console.log("=== API ORQALI FOYDALANUVCHILARNI RO'YXATDAN O'TKAZISH ===");

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          full_name: u.full_name,
          role: u.role
        }
      }
    });

    if (error) {
      console.log(`❌ ${u.email} ro'yxatdan o'tmadi:`, error.message);
    } else {
      console.log(`✅ ${u.email} muvaffaqiyatli ro'yxatdan o'tdi. ID: ${data.user?.id}`);
    }
  }
}

register();
