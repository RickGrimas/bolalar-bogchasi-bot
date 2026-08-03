import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initPhase2() {
  console.log("Checking Phase 2 Tables in Supabase...");

  // 1. Check application_questions table
  const { data: questions, error: qError } = await supabase
    .from('application_questions')
    .select('*')
    .order('order_index', { ascending: true });

  if (qError) {
    console.log("Notice for application_questions:", qError.message);
  } else {
    console.log(`Found ${questions?.length || 0} application questions.`);
  }

  // 2. Check bot_menus table
  const { data: menus, error: mError } = await supabase
    .from('bot_menus')
    .select('*')
    .order('order_index', { ascending: true });

  if (mError) {
    console.log("Notice for bot_menus:", mError.message);
  } else {
    console.log(`Found ${menus?.length || 0} bot menu items.`);
  }
}

initPhase2();
