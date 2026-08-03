import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'parent1@bogcha.uz',
    password: 'password123'
  });

  console.log("Error object:", JSON.stringify(error, null, 2));
  console.log("Error direct:", error);
  console.log("Data:", data);
}

test();
