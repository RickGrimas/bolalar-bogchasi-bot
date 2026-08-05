import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check if a telegram ID belongs to an admin
 */
export async function isAdminTelegramId(telegramId) {
  if (!telegramId) return false;
  
  // Check env variable list
  const envAdmins = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(s => s.trim());
  if (envAdmins.includes(String(telegramId))) {
    return true;
  }

  // Check users table in Supabase
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('telegram_id', String(telegramId))
    .single();

  if (!error && data && data.role === 'ADMIN') {
    return true;
  }

  return false;
}

/**
 * Fetch dynamic main chat menus (auto-seed if empty)
 */
export async function getMainMenus() {
  const { data, error } = await supabase
    .from('bot_menus')
    .select('*')
    .eq('location', 'MAIN_CHAT')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error("Error fetching main menus:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    // Seed default main chat buttons if DB table is empty
    const defaults = [
      {
        title: "Bog'cha haqida ma'lumot ℹ️",
        action_type: "TEXT",
        content_value: "🏫 *\"Porloq Kelajak\" Bolalar Bog'chasi*\n\nBizning bog'chamiz 3 yoshdan 6 yoshgacha bo'lgan bolalar uchun zamonaviy ta'lim, xavfsiz muhit va shaxsiy rivojlanish imkoniyatlarini taqdim etadi.\n\n✨ *Bizning afzalliklarimiz:*\n• Professional pedagog va psixologlar jamoasi\n• STEM, Mental arifmetika, Tillar (Ingliz va Rus)\n• Kuniga 4 mahal sog'lom va sifatli ovqatlanish\n• Online video kuzatuv va xavfsiz hudud\n• 5 mahal chiniqtirish va sport to'garaklari\n\n📍 Manzil: Toshkent sh., Chilonzor tumani, 14-mavze, 25-uy\n☎️ Telefon: +998 71 200-00-11",
        order_index: 1,
        location: "MAIN_CHAT",
        is_active: true
      },
      {
        title: "Ariza qoldirish 📝",
        action_type: "AI_APPLICATION",
        content_value: "AI Avtomatik Ariza Qabul Qilish Tizimi",
        order_index: 2,
        location: "MAIN_CHAT",
        is_active: true
      },
      {
        title: "🤖 AI Assistent Yordami",
        action_type: "AI_CRM",
        content_value: "AI CRM Live Assistant",
        order_index: 3,
        location: "MAIN_CHAT",
        is_active: true
      },
      {
        title: "Biz bilan bog'lanish 📞",
        action_type: "TEXT",
        content_value: "📞 *Biz bilan bog'lanish*\n\nSavollaringiz yoki takliflaringiz bo'lsa, bevosita botga matnli xabar yozishingiz mumkin. Adminlarimiz tez orada sizga javob berishadi.\n\n📱 *Murojaat uchun:* +998 71 200-00-11\n💬 *Telegram Admin:* @bogcha_admin_support\n🌐 *Veb-sayt:* https://bogcha-mini-app.vercel.app",
        order_index: 4,
        location: "MAIN_CHAT",
        is_active: true
      }
    ];

    const { data: inserted } = await supabase.from('bot_menus').insert(defaults).select('*');
    return inserted || defaults;
  }

  // Deduplicate by clean title to prevent duplicate buttons in Telegram keyboard
  const uniqueMap = new Map();
  for (const item of data) {
    const cleanTitle = (item.title || '').trim();
    if (cleanTitle && !uniqueMap.has(cleanTitle)) {
      uniqueMap.set(cleanTitle, item);
    }
  }

  return Array.from(uniqueMap.values());
}


/**
 * Fetch active application questions ordered by order_index
 */
export async function getApplicationQuestions() {
  const { data, error } = await supabase
    .from('application_questions')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error || !data || data.length === 0) {
    // Default fallback questions if DB table is empty/not created yet
    return [
      { id: '1', question_text: 'F.I.SH (Ismingiz va familiyangiz):', order_index: 1 },
      { id: '2', question_text: 'Bog\'lanish uchun telefon raqamingiz (+998...):', order_index: 2 },
      { id: '3', question_text: 'Farzandingizning yoshi nechada?', order_index: 3 },
      { id: '4', question_text: 'Bog\'chaga qaysi oydan bermoqchisiz?', order_index: 4 }
    ];
  }
  return data;
}

/**
 * Save completed application and answers
 */
export async function saveApplication(telegramId, userName, answersMap) {
  try {
    const entries = Object.entries(answersMap);
    let applicantName = userName || 'Noma\'lum';
    let phone = '';
    let childAge = 4;
    let childName = 'Noma\'lum';

    entries.forEach(([q, a]) => {
      const qLower = q.toLowerCase();
      if (qLower.includes('f.i.sh') || qLower.includes('ism')) applicantName = a;
      else if (qLower.includes('tel') || qLower.includes('raqam')) phone = a;
      else if (qLower.includes('yosh')) {
        const parsedAge = parseInt(String(a).replace(/\D/g, ''), 10);
        if (!isNaN(parsedAge)) childAge = parsedAge;
      } else if (qLower.includes('bola') || qLower.includes('farzand')) childName = a;
    });

    // 1. Insert into applications
    const { data: appData, error: appError } = await supabase
      .from('applications')
      .insert([{
        telegram_id: String(telegramId),
        applicant_name: applicantName,
        phone_number: phone,
        status: 'NEW'
      }])
      .select()
      .single();

    if (appError) console.error("App insert notice:", appError.message);

    // 2. Insert answers if appData created
    if (appData) {
      const answerEntries = entries.map(([qText, aText]) => ({
        application_id: appData.id,
        question_text: qText,
        answer_text: aText
      }));
      await supabase.from('application_answers').insert(answerEntries);
    }

    // 3. Insert into crm_leads so it shows up in Admin Panel CRM dashboard!
    const notesSummary = entries.map(([k, v]) => `${k}: ${v}`).join('\n');
    await supabase.from('crm_leads').insert([{
      parent_name: applicantName,
      parent_phone: phone || 'Kiritilmadi',
      child_name: childName || 'Noma\'lum',
      child_age: childAge,
      status: 'NEW',
      priority: 'HIGH',
      notes: `Telegram Bot Ariza:\n${notesSummary}`
    }]);

    return appData;
  } catch (err) {
    console.error("Error saving application:", err.message);
    return null;
  }
}


/**
 * Save user support message to chat_sessions & chat_messages
 */
export async function handleIncomingSupportMessage(telegramId, userName, messageText) {
  try {
    // Find or create session
    let { data: session } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('telegram_id', String(telegramId))
      .eq('status', 'OPEN')
      .single();

    if (!session) {
      const { data: newSession, error: sErr } = await supabase
        .from('chat_sessions')
        .insert([{
          telegram_id: String(telegramId),
          user_name: userName || 'Foydalanuvchi',
          status: 'OPEN',
          last_message_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (sErr) throw sErr;
      session = newSession;
    } else {
      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', session.id);
    }

    // Save message
    await supabase
      .from('chat_messages')
      .insert([{
        session_id: session.id,
        sender_type: 'USER',
        text: messageText
      }]);

    return session;
  } catch (err) {
    console.error("Error saving support message:", err.message);
    return null;
  }
}
