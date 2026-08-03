import dotenv from 'dotenv';
import { supabase } from './supabaseService.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Memory Cache for fast lookup
let cachedConfigs = null;
let lastCacheFetch = 0;

/**
 * Fetch AI Config from DB with local fallback
 */
export async function getAIConfigs() {
  const now = Date.now();
  if (cachedConfigs && (now - lastCacheFetch < 10000)) {
    return cachedConfigs;
  }

  try {
    const { data, error } = await supabase.from('ai_config').select('*');
    if (!error && data && data.length > 0) {
      const configMap = {};
      data.forEach(item => {
        configMap[item.assistant_type] = item;
      });
      cachedConfigs = configMap;
      lastCacheFetch = now;
      return configMap;
    }
  } catch (err) {
    console.error("AI Config DB Fetch error:", err.message);
  }

  // Fallback default structure
  return {
    GLOBAL_SETTINGS: { global_ai_enabled: true },
    ADMIN_COPILOT: {
      assistant_type: 'ADMIN_COPILOT',
      is_active: true,
      system_prompt: "Siz bog'cha rahbari uchun aqlli Copilot yordamchisisiz. Tizimdagi statistikalar, davomat, moliya va ko'rsatkichlar bo'yicha aniq maslahat bering.",
      doc_content: "Bog'cha ish vaqti: 08:00 - 18:00. Oylik to'lov: 2,000,000 so'm."
    },
    CRM_ASSISTANT: {
      assistant_type: 'CRM_ASSISTANT',
      is_active: true,
      system_prompt: "Siz 'Porloq Kelajak' bog'chasining xushmuomala sotuv assistentisiz. Mijozlar bilan samimiy gaplashib, bog'cha haqida ma'lumot bering va uning ismi va telefon raqamini olishga harakat qiling.",
      doc_content: "Manzil: Chilonzor 14-mavze. Tel: +998 71 200-00-11."
    },
    KIDS_ENCYCLOPEDIA: {
      assistant_type: 'KIDS_ENCYCLOPEDIA',
      is_active: true,
      tts_enabled: true,
      system_prompt: "Siz bolalar uchun do'stona va bilimdon yordamchisiz. Bolalarga qiziqarli tilda javob bering.",
      doc_content: "Tabiat, hayvonlar va koinot haqida qiziqarli bilimlar."
    }
  };
}

/**
 * Save or update AI Config
 */
export async function saveAIConfig(assistantType, configData) {
  try {
    const payload = {
      assistant_type: assistantType,
      global_ai_enabled: configData.global_ai_enabled !== undefined ? configData.global_ai_enabled : true,
      system_prompt: configData.system_prompt || '',
      doc_content: configData.doc_content || '',
      doc_file_url: configData.doc_file_url || '',
      tts_enabled: !!configData.tts_enabled,
      is_active: configData.is_active !== undefined ? configData.is_active : true,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('ai_config')
      .upsert(payload, { onConflict: 'assistant_type' })
      .select();

    if (error) throw error;
    cachedConfigs = null; // reset cache
    return { success: true, data: data[0] };
  } catch (err) {
    console.error("Save AI Config error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Global OpenAI Chat Completion Helper
 */
async function callOpenAI(messages, tools = null) {
  const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY topilmadi!");
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.7
  };

  if (tools) {
    payload.tools = tools;
    payload.tool_choice = 'auto';
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  return await res.json();
}

/**
 * Save captured lead into `ai_leads` table
 */
export async function saveCapturedLead({ telegramId, name, phone_number, child_age, notes }) {
  try {
    const { data, error } = await supabase
      .from('ai_leads')
      .insert([{
        telegram_id: telegramId ? String(telegramId) : null,
        name: name || 'Noma\'lum',
        phone_number: phone_number || '',
        child_age: child_age || '',
        notes: notes || 'AI Chat orqali olindi',
        status: 'NEW'
      }])
      .select()
      .single();

    if (error) console.error("Lead insert DB notice:", error.message);
    return data;
  } catch (err) {
    console.error("Save lead error:", err.message);
  }
}

/**
 * Process CRM Live Chat with Customer
 */
export async function processCRMChat({ telegramId, userMessage, history = [] }) {
  const configs = await getAIConfigs();
  const globalConfig = configs.GLOBAL_SETTINGS || { global_ai_enabled: true };
  const crmConfig = configs.CRM_ASSISTANT || {};

  if (globalConfig.global_ai_enabled === false || crmConfig.is_active === false) {
    return {
      text: "Hozirda AI Assistent vaqtincha o'chirilgan. Tez orada operatorlarimiz javob berishadi.",
      leadCaptured: false
    };
  }

  const systemMessage = {
    role: 'system',
    content: `${crmConfig.system_prompt || "Siz bog'cha sotuv assistentisiz."}\n\n[BOG'CHA MA'LOMOTLARI HJJATI]:\n${crmConfig.doc_content || "Ma'lumot mavjud emas."}\n\nQO'SHIMCHA QOIDA: Agar suhbatdosh o'z ismini, telefon raqamini yoki bolasining yoshini aytsa, darhol 'extract_lead_info' vositasini chaqiring. Matn oxirida muloyim javob bering.`
  };

  const formattedHistory = (history || []).map(m => ({
    role: m.sender === 'user' ? 'user' : 'assistant',
    content: m.text
  }));

  const messages = [systemMessage, ...formattedHistory, { role: 'user', content: userMessage }];

  const tools = [
    {
      type: 'function',
      function: {
        name: 'extract_lead_info',
        description: "Mijozning kontakt ma'lumotlarini (Ismi, Telefon raqami, Bolaning yoshi, Suhbat xulosasi) ajratib olish va bazaga saqlash.",
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: "Mijozning ismi yoki familiyasi" },
            phone_number: { type: 'string', description: "Mijozning telefon raqami (+998...)" },
            child_age: { type: 'string', description: "Bolaning yoshi yoki tug'ilgan yili" },
            notes: { type: 'string', description: "Mijozning qiziqishlari va suhbat bo'yicha qisqa izoh" }
          },
          required: ['name', 'phone_number']
        }
      }
    }
  ];

  try {
    const aiResponse = await callOpenAI(messages, tools);
    const choice = aiResponse.choices?.[0];
    let leadCaptured = false;

    if (choice?.message?.tool_calls && choice.message.tool_calls.length > 0) {
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === 'extract_lead_info') {
          const args = JSON.parse(toolCall.function.arguments || '{}');
          await saveCapturedLead({ telegramId, ...args });
          leadCaptured = true;
        }
      }

      // Second call to get final text
      messages.push(choice.message);
      messages.push({
        role: 'tool',
        tool_call_id: choice.message.tool_calls[0].id,
        content: JSON.stringify({ success: true, message: "Mijoz ma'lumotlari bazaga saqlandi." })
      });

      const followUpRes = await callOpenAI(messages);
      return {
        text: followUpRes.choices?.[0]?.message?.content || "Rahmat! Ma'lumotlaringizni qabul qildik, ma'muriyatimiz tez orada bog'lanadi.",
        leadCaptured: true
      };
    }

    return {
      text: choice?.message?.content || "Uzr, savolingizni tushuna olmadim.",
      leadCaptured: false
    };

  } catch (err) {
    console.error("CRM Chat AI Error:", err.message);
    return {
      text: "Uzr, hozirda sun'iy intellekt xizmatida kichik uzilish bor. Operatorimiz tez orada bog'lanadi.",
      leadCaptured: false
    };
  }
}

/**
 * Process Admin Copilot Queries
 */
export async function processAdminCopilot({ query }) {
  const configs = await getAIConfigs();
  const globalConfig = configs.GLOBAL_SETTINGS || { global_ai_enabled: true };
  const adminConfig = configs.ADMIN_COPILOT || {};

  if (globalConfig.global_ai_enabled === false || adminConfig.is_active === false) {
    return { text: "AI Copilot tizimda o'chirilgan." };
  }

  // Fetch summary stats from DB
  let statsSummary = "";
  try {
    const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true });
    const { count: leadsCount } = await supabase.from('ai_leads').select('*', { count: 'exact', head: true });
    const { count: sessionsCount } = await supabase.from('chat_sessions').select('*', { count: 'exact', head: true });

    statsSummary = `Tizim Statistikasi:\n- Arizalar soni: ${appsCount || 0}\n- AI Potensial Mijozlar (Leads) soni: ${leadsCount || 0}\n- Faol Chat sessiyalari: ${sessionsCount || 0}`;
  } catch (e) {
    statsSummary = "Tizim ko'rsatkichlari faol.";
  }

  const messages = [
    {
      role: 'system',
      content: `${adminConfig.system_prompt || "Siz admin copilotisiz."}\n\n[PROMPT BILIMLAR BAZASI]:\n${adminConfig.doc_content || ''}\n\n[JORY STATISTIKA]:\n${statsSummary}`
    },
    { role: 'user', content: query }
  ];

  try {
    const res = await callOpenAI(messages);
    return { text: res.choices?.[0]?.message?.content || "Javob generatsiya qilindi." };
  } catch (err) {
    return { text: `Xatolik yuz berdi: ${err.message}` };
  }
}

/**
 * Process Kids Encyclopedia Queries + Optional OpenAI Text-To-Speech (TTS)
 */
export async function processKidsHelper({ question, requestTTS = false }) {
  const configs = await getAIConfigs();
  const globalConfig = configs.GLOBAL_SETTINGS || { global_ai_enabled: true };
  const kidsConfig = configs.KIDS_ENCYCLOPEDIA || {};

  if (globalConfig.global_ai_enabled === false || kidsConfig.is_active === false) {
    return { text: "Bolalar ensiklopediyasi o'chirilgan." };
  }

  const messages = [
    {
      role: 'system',
      content: `${kidsConfig.system_prompt || "Siz bolalar uchun bilimdon va samimiy yordamchisiz."}\n\n[ENSEKLOPEDIYA MA'LOMOTLARI]:\n${kidsConfig.doc_content || ''}`
    },
    { role: 'user', content: question }
  ];

  try {
    const res = await callOpenAI(messages);
    const textAnswer = res.choices?.[0]?.message?.content || "Juda yaxshi savol!";
    let audioUrl = null;

    // Generate Text To Speech audio if requested or configured
    if (requestTTS || kidsConfig.tts_enabled) {
      try {
        const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
        const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: textAnswer.substring(0, 500), // Max text length for quick speed
            voice: 'nova', // Gentle friendly voice for children
            response_format: 'mp3'
          })
        });

        if (ttsRes.ok) {
          const buffer = Buffer.from(await ttsRes.arrayBuffer());
          const fileName = `tts_${Date.now()}.mp3`;
          const uploadsDir = path.resolve('public/uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

          const filePath = path.join(uploadsDir, fileName);
          fs.writeFileSync(filePath, buffer);
          audioUrl = `/uploads/${fileName}`;
        }
      } catch (ttsErr) {
        console.error("TTS generation error:", ttsErr.message);
      }
    }

    return { text: textAnswer, audioUrl };

  } catch (err) {
    return { text: "Kichik uzilish yuz berdi. Qaytadan urinib ko'ring!" };
  }
}

/**
 * Validate application answers strictly with AI
 */
export async function validateApplicationAnswer({ questionText, userAnswer, stepIndex }) {
  const systemPrompt = `Siz bolalar bog'chasi ariza tizimi uchun aqlli va moslashuvchan ma'lumot tekshiruvchisiz.
Foydalanuvchi berilgan savolga javob kiritdi. Javob mantiqan va format bo'yicha to'g'ri yoki noto'g'ri ekanligini baholang.

SAVOL VA TIZIM QOIDALARI:
1. Ism/F.I.SH savoli: Inson ismi va familiyasi bo'lishi kerak. Shunchaki sonlar, tasodifiy harflar yoki so'kinishlar qabul qilinmaydi.
2. Telefon raqami savoli: Telefon raqami 9 ta raqam yoki +998 bilan boshlanadigan shaklda bo'lishi shart.
3. Farzand yoshi savoli: Bolalar bog'chasi FAKAT 1 yoshdan 7 yoshgacha bo'lgan bolalarni qabul qiladi! 1-7 oralig'idagi yoshlar to'liq to'g'ri deb qabul qilinadi.
4. Vaqt/Muddat savoli (4-SAVOL): 
   - 'dushanbadan', 'kelasi dushanbadan', 'ertadan', 'shu oydan', 'kelasi haftadan', 'kuzda', 'sentabrdan', 'dushanba kungi', 'seshanbadan', 'chorshanbadan', 'payshanbadan', 'juma kundan' kabi BARCHA tabiiy kun va muddat iboralari TO'LIQ TO'G'RI va QABUL QILINISHI SHART!
   - 'dushanbadan' kabi javoblarni HECH QACHON RAD ETMANG! Ularni isValid=true deb qabul qiling.
   - Faqat 'tungi 12', 'soat 5 da' kabi kun soat vaqtlari yoki bema'ni harflar rad etilishi kerak.

QAT'IY QOIDA:
Javob faqat va faqat quyidagi JSON formatida bo'lishi shart:
{
  "isValid": true yoki false,
  "formattedValue": "Chiroyli formatlangan matn (masalan: 'Kelasi dushanbadan')",
  "errorMessage": "Agar noto'g'ri bo'lsa, foydalanuvchiga nima uchun noto'g'ri ekanligini muloyim tushuntiruvchi xabar"
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `SAVOL: ${questionText}\nFOYDALANUVCHI JAVOBI: ${userAnswer}` }
  ];

  try {
    const apiKey = process.env.OPENAI_API_KEY || OPENAI_API_KEY;
    if (!apiKey) {
      return localValidate(questionText, userAnswer);
    }

    const res = await callOpenAI(messages);
    const textContent = res.choices?.[0]?.message?.content || '';
    
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isValid: !!parsed.isValid,
        formattedValue: parsed.formattedValue || userAnswer,
        errorMessage: parsed.errorMessage || "Iltimos, ma'lumotni to'g'ri formatda kiriting."
      };
    }
  } catch (err) {
    console.error("AI Validation Error:", err.message);
  }

  return localValidate(questionText, userAnswer);
}

function localValidate(questionText, userAnswer) {
  const q = (questionText || '').toLowerCase();
  const val = (userAnswer || '').trim();

  if (q.includes('tel') || q.includes('raqam') || q.includes('phone')) {
    const cleanDigits = val.replace(/\D/g, '');
    if (cleanDigits.length !== 9 && cleanDigits.length !== 12) {
      return {
        isValid: false,
        errorMessage: "⚠️ *Telefon raqami noto'g'ri formatda!*\nIltimos, telefon raqamingizni 9 ta raqam shaklida kiriting (masalan: +998 90 123 45 67 yoki 901234567) yoki quyidagi *📱 Telefon raqamni ulashish* tugmasini bosing."
      };
    }
  } else if (q.includes('yosh') || q.includes('age')) {
    const num = parseInt(val.replace(/\D/g, ''), 10);
    if (isNaN(num) || num < 1 || num > 7) {
      return {
        isValid: false,
        errorMessage: `⚠️ *Farzand yoshi noto'g'ri!*\nBizning bog'chamiz faqat *1 yoshdan 7 yoshgacha* bo'lgan bolajonlarni qabul qiladi (siz kiritgan yosh: ${val}). Iltimos, to'g'ri yoshni kiriting (masalan: 3, 4, 5).`
      };
    }
  } else if (q.includes('vaqt') || q.includes('qaysi') || q.includes('oy') || q.includes('qachon') || q.includes('sana') || q.includes('berish')) {
    const valLower = val.toLowerCase();
    const validPhrases = ['dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba', 'yakshanba', 'erta', 'bugun', 'hafta', 'oy', 'kuz', 'bahor', 'yoz', 'qish', 'sentabr', 'oktabr', 'noyabr', 'dekabr', 'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust'];
    const isNaturalDate = validPhrases.some(p => valLower.includes(p));

    if (isNaturalDate) {
      return { isValid: true, formattedValue: val, errorMessage: '' };
    }

    if (valLower.includes('tungi') || valLower.includes('soat 12') || valLower.includes('soat 1') || valLower.includes('soat 2')) {
      return {
        isValid: false,
        errorMessage: "⚠️ *Muddat noto'g'ri kiritildi!*\nIltimos, bog'chaga berish mo'ljallangan oy, fasl yoki kunni kiriting (masalan: 'Dushanbadan', 'Kelasi haftadan', 'Ertadan') yoki pastdagi tugmalardan birini bosing."
      };
    }
  }

  return { isValid: true, formattedValue: val, errorMessage: '' };
}



