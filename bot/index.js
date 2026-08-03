import { Telegraf, Markup } from 'telegraf';
import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { handleStart, handleAbout, handleContact, ABOUT_BTN, APPLY_BTN, CONTACT_BTN, AI_BTN, buildMainMenuKeyboard } from './handlers/menuHandler.js';
import { startApplicationFlow, processApplicationAnswer, userApplicationSessions } from './handlers/applicationHandler.js';
import { handleDynamicMenuClick, handleInlineCallback } from './handlers/dynamicMenuHandler.js';
import { handleIncomingSupportMessage, supabase } from './services/supabaseService.js';
import { processCRMChat, processAdminCopilot, processKidsHelper, getAIConfigs, saveAIConfig } from './services/aiService.js';

dotenv.config();

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("XATO: .env faylida BOT_TOKEN ko'rsatilmadi!");
  process.exit(1);
}

export const bot = new Telegraf(token);
const app = express();

// -----------------------------------------------------------------
// SECURITY MIDDLEWARES (Helmet, CORS, Rate Limiter)
// -----------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.WEBAPP_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman) or matching allowedOrigins
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev fallback
    }
  },
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Juda ko'p so'rov yuborildi. Iltimos, bir ozdan keyin qayta urinib ko'ring." }
});

app.use('/api/', apiLimiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Track users in active AI Chat session
export const userAISessions = new Map();

// Setup local uploads directory
const uploadsDir = path.resolve('public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Fail-safe Broadcast JSON File Persistence
const broadcastsJsonPath = path.join(uploadsDir, 'broadcasts_archive.json');

const getLocalBroadcasts = () => {
  try {
    if (fs.existsSync(broadcastsJsonPath)) {
      return JSON.parse(fs.readFileSync(broadcastsJsonPath, 'utf8'));
    }
  } catch (err) {}
  return [];
};

const saveLocalBroadcasts = (list) => {
  try {
    fs.writeFileSync(broadcastsJsonPath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {}
};

// -----------------------------------------------------------------
// 1. TELEGRAM BOT HANDLERS
// -----------------------------------------------------------------

bot.start((ctx) => {
  userAISessions.delete(ctx.from.id);
  return handleStart(ctx);
});

bot.hears(ABOUT_BTN, (ctx) => {
  userAISessions.delete(ctx.from.id);
  return handleAbout(ctx);
});

bot.hears(CONTACT_BTN, (ctx) => {
  userAISessions.delete(ctx.from.id);
  return handleContact(ctx);
});

bot.hears(APPLY_BTN, (ctx) => {
  userAISessions.delete(ctx.from.id);
  return startApplicationFlow(ctx);
});

bot.hears(AI_BTN, async (ctx) => {
  const telegramId = ctx.from.id;
  userAISessions.set(telegramId, []); // init empty message history
  await ctx.reply(
    "🤖 *" + (ctx.from.first_name || 'Foydalanuvchi') + "*, bog'chamizning AI Assistentiga xush kelibsiz!\n\n" +
    "Menga bog'chamiz narxlari, sharoitlari, darslar va qabul haqida istalgan savolingizni berishingiz mumkin. " +
    "Savolingizni yozib qoldiring:",
    { parse_mode: 'Markdown' }
  );
});

bot.on('callback_query', handleInlineCallback);

bot.on('contact', async (ctx) => {
  const telegramId = ctx.from.id;
  if (userApplicationSessions.has(telegramId)) {
    const contact = ctx.message.contact;
    if (contact && contact.phone_number) {
      const phoneNum = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;
      ctx.message.text = phoneNum; // Inject phone number as message text
      const processed = await processApplicationAnswer(ctx);
      if (processed) return;
    }
  }
});

bot.hears(/bekor|cancel|❌/i, async (ctx) => {
  const telegramId = ctx.from.id;
  userApplicationSessions.delete(telegramId);
  userAISessions.delete(telegramId);
  const mainKb = await buildMainMenuKeyboard(telegramId);
  return ctx.reply("❌ Ariza to'ldirish bekor qilindi.", mainKb);
});


bot.on('text', async (ctx) => {


  const telegramId = ctx.from.id;
  const userName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
  const text = ctx.message.text.trim();

  // If user is filling an application form
  if (userApplicationSessions.has(telegramId)) {
    const processed = await processApplicationAnswer(ctx);
    if (processed) return;
  }

  // If user is in AI Chat Mode
  if (userAISessions.has(telegramId)) {
    await ctx.sendChatAction('typing');
    const history = userAISessions.get(telegramId) || [];
    
    const response = await processCRMChat({ telegramId, userMessage: text, history });
    
    history.push({ sender: 'user', text });
    history.push({ sender: 'ai', text: response.text });
    if (history.length > 20) history.splice(0, 2); // keep last 20 messages
    userAISessions.set(telegramId, history);

    return ctx.reply(response.text);
  }

  const dynamicProcessed = await handleDynamicMenuClick(ctx);
  if (dynamicProcessed) return;

  await handleIncomingSupportMessage(telegramId, userName, text);
  await ctx.reply("💬 Xabaringiz qabul qilindi. Operatorlarimiz tez orada javob berishadi.");
});

// Dual Bot Launch Mode (Webhook for Production, Polling for Development)
const webhookUrl = process.env.WEBHOOK_URL;
if (webhookUrl) {
  const secretPath = `/api/telegram-webhook`;
  app.use(bot.webhookCallback(secretPath));
  bot.telegram.setWebhook(`${webhookUrl}${secretPath}`)
    .then(() => console.log(`🚀 Telegram Bot Webhook rejimi yoqildi: ${webhookUrl}${secretPath}`))
    .catch((err) => console.error("❌ Webhook o'rnatishda xatolik:", err.message));
} else {
  bot.launch()
    .then(() => console.log("🤖 Telegram Bot Polling (Lokal) rejimida ishga tushdi!"))
    .catch((err) => console.error("❌ Botni ishga tushirishda xatolik:", err.message));
}

// -----------------------------------------------------------------
// 2. EXPRESS REST API FOR ADMIN CMS INTEGRATION & SECURITY AUTH
// -----------------------------------------------------------------

const requireAdminAuth = (req, res, next) => {
  const adminApiKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-api-key'] || (req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '') : null);

  if (adminApiKey && providedKey === adminApiKey) {
    return next();
  }

  return res.status(401).json({ error: "Avtorizatsiya rad etildi. Admin API Kaliti noto'g'ri yoki taqdim etilmadi." });
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', bot: 'active' });
});

// Endpoint: Verify Telegram Web App initData using HMAC-SHA256
app.post('/api/auth/telegram-verify', (req, res) => {
  try {
    const { initData } = req.body;
    if (!initData) {
      return res.status(400).json({ valid: false, error: "initData taqdim etilmadi" });
    }

    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    if (!hash) {
      return res.status(400).json({ valid: false, error: "Hash ma'lumoti topilmadi" });
    }

    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash === hash) {
      const userStr = urlParams.get('user');
      const user = userStr ? JSON.parse(userStr) : null;
      return res.json({ valid: true, user });
    } else {
      return res.status(401).json({ valid: false, error: "Telegram initData haqiqiy emas (HMAC xatosi)" });
    }
  } catch (err) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// Apply Admin Auth Middleware to all /api/admin/ routes
app.use('/api/admin', requireAdminAuth);

// Endpoint: Fetch All Broadcast Announcements (Archive)
app.get('/api/admin/broadcasts', async (req, res) => {
  let dbList = [];
  try {
    const { data: dbData, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbData) {
      dbList = dbData;
    }
  } catch (err) {}

  const localList = getLocalBroadcasts();

  // Merge both sources and deduplicate
  const map = new Map();
  dbList.forEach(item => map.set(item.id, item));
  localList.forEach(item => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  res.json(merged);
});

// Endpoint: Send Broadcast Announcement from Admin Panel
app.post('/api/admin/broadcast', async (req, res) => {
  try {
    const { text, photo_url, video_url, inline_buttons } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Matn kiritilishi shart" });
    }

    const { data: users, error } = await supabase
      .from('chat_sessions')
      .select('telegram_id');

    if (error) throw error;

    const uniqueIds = Array.from(new Set((users || []).map(u => u.telegram_id)));

    let extra = {};
    if (inline_buttons && Array.isArray(inline_buttons) && inline_buttons.length > 0) {
      const inlineKb = inline_buttons.map(btn => {
        if (btn.type === 'URL') {
          return [Markup.button.url(btn.title, btn.value)];
        } else if (btn.type === 'FILE') {
          return [Markup.button.callback(btn.title, `btn_file_${btn.value}`)];
        } else {
          return [Markup.button.callback(btn.title, `btn_text_${btn.value}`)];
        }
      });
      extra = Markup.inlineKeyboard(inlineKb);
    }

    let successCount = 0;
    let failCount = 0;
    let cachedFileId = null;
    const recipientMessages = [];

    for (const chatId of uniqueIds) {
      try {
        let sentMsg = null;

        if (photo_url) {
          let photoInput = cachedFileId || photo_url;
          if (!cachedFileId && typeof photo_url === 'string' && photo_url.includes('/uploads/')) {
            const fileName = photo_url.split('/uploads/').pop();
            const diskPath = path.join(uploadsDir, fileName);
            if (fs.existsSync(diskPath)) {
              photoInput = { source: diskPath };
            }
          }

          sentMsg = await bot.telegram.sendPhoto(chatId, photoInput, { caption: text, ...extra });

          if (!cachedFileId && sentMsg && sentMsg.photo && sentMsg.photo.length > 0) {
            cachedFileId = sentMsg.photo[sentMsg.photo.length - 1].file_id;
          }
        } else if (video_url) {
          let videoInput = cachedFileId || video_url;
          if (!cachedFileId && typeof video_url === 'string' && video_url.includes('/uploads/')) {
            const fileName = video_url.split('/uploads/').pop();
            const diskPath = path.join(uploadsDir, fileName);
            if (fs.existsSync(diskPath)) {
              videoInput = { source: diskPath };
            }
          }

          sentMsg = await bot.telegram.sendVideo(chatId, videoInput, { caption: text, ...extra });

          if (!cachedFileId && sentMsg && sentMsg.video) {
            cachedFileId = sentMsg.video.file_id;
          }
        } else {
          sentMsg = await bot.telegram.sendMessage(chatId, text, extra);
        }

        if (sentMsg) {
          recipientMessages.push({ telegram_id: chatId, message_id: sentMsg.message_id });
          successCount++;
        }
      } catch (sendErr) {
        console.error("Broadcast send error for chat", chatId, sendErr.message);
        failCount++;
      }
      await new Promise(r => setTimeout(r, 35));
    }

    const bcastObject = {
      id: `bcast_${Date.now()}`,
      text,
      photo_url: photo_url || null,
      video_url: video_url || null,
      inline_buttons: inline_buttons || [],
      sent_count: successCount,
      failed_count: failCount,
      recipient_messages: recipientMessages,
      created_at: new Date().toISOString()
    };

    // Save to local JSON archive first (guarantees persistence even if DB table doesn't exist yet)
    const localList = getLocalBroadcasts();
    localList.unshift(bcastObject);
    saveLocalBroadcasts(localList);

    // Save to Supabase DB if table exists
    try {
      const { data } = await supabase.from('broadcasts').insert([{
        text,
        photo_url: photo_url || null,
        video_url: video_url || null,
        inline_buttons: inline_buttons || [],
        sent_count: successCount,
        failed_count: failCount,
        recipient_messages: recipientMessages
      }]).select().single();

      if (data) {
        bcastObject.id = data.id;
      }
    } catch (dbErr) {
      console.error("Broadcast DB archive notice:", dbErr.message);
    }

    res.json({
      success: true,
      total: uniqueIds.length,
      sent: successCount,
      failed: failCount,
      broadcast: bcastObject
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Manually Add/Restore Past Broadcast to Archive
app.post('/api/admin/save-broadcast-archive', async (req, res) => {
  try {
    const { text, photo_url, video_url, inline_buttons } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Matn kiritilishi shart" });
    }

    const bcastObject = {
      id: `bcast_${Date.now()}`,
      text,
      photo_url: photo_url || null,
      video_url: video_url || null,
      inline_buttons: inline_buttons || [],
      sent_count: 0,
      failed_count: 0,
      recipient_messages: [],
      created_at: new Date().toISOString()
    };

    const localList = getLocalBroadcasts();
    localList.unshift(bcastObject);
    saveLocalBroadcasts(localList);

    try {
      const { data } = await supabase.from('broadcasts').insert([{
        text,
        photo_url: photo_url || null,
        video_url: video_url || null,
        inline_buttons: inline_buttons || [],
        sent_count: 0,
        failed_count: 0,
        recipient_messages: []
      }]).select().single();
      if (data) bcastObject.id = data.id;
    } catch (err) {}

    res.json({ success: true, broadcast: bcastObject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Edit Broadcast Post Across Telegram Users & DB
app.put('/api/admin/edit-broadcast', async (req, res) => {
  try {
    const { broadcast_id, text, inline_buttons } = req.body;
    if (!broadcast_id || !text) {
      return res.status(400).json({ error: "broadcast_id va text kiritilishi shart" });
    }

    // Try finding in local archive first
    const localList = getLocalBroadcasts();
    let bcast = localList.find(b => b.id === broadcast_id);

    // If not found in local, try DB
    if (!bcast) {
      const { data: dbBcast } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('id', broadcast_id)
        .single();
      bcast = dbBcast;
    }

    let extra = {};
    if (inline_buttons && Array.isArray(inline_buttons) && inline_buttons.length > 0) {
      const inlineKb = inline_buttons.map(btn => {
        if (btn.type === 'URL') return [Markup.button.url(btn.title, btn.value)];
        if (btn.type === 'FILE') return [Markup.button.callback(btn.title, `btn_file_${btn.value}`)];
        return [Markup.button.callback(btn.title, `btn_text_${btn.value}`)];
      });
      extra = Markup.inlineKeyboard(inlineKb);
    }

    const recipients = bcast?.recipient_messages || [];
    let updatedCount = 0;

    for (const item of recipients) {
      try {
        if (bcast.photo_url || bcast.video_url) {
          await bot.telegram.editMessageCaption(item.telegram_id, item.message_id, undefined, text, extra);
        } else {
          await bot.telegram.editMessageText(item.telegram_id, item.message_id, undefined, text, extra);
        }
        updatedCount++;
      } catch (err) {
        console.error("Error editing broadcast msg for user", item.telegram_id, err.message);
      }
      await new Promise(r => setTimeout(r, 20));
    }

    // Update local JSON
    const updatedLocal = localList.map(b => {
      if (b.id === broadcast_id) {
        return { ...b, text, inline_buttons: inline_buttons || b.inline_buttons };
      }
      return b;
    });
    saveLocalBroadcasts(updatedLocal);

    // Update Supabase DB if possible
    try {
      await supabase.from('broadcasts').update({
        text,
        inline_buttons: inline_buttons || []
      }).eq('id', broadcast_id);
    } catch (err) {}

    res.json({ success: true, updated: updatedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Delete Broadcast Post Across Telegram Users & DB
app.delete('/api/admin/delete-broadcast', async (req, res) => {
  try {
    const { broadcast_id } = req.body;
    if (!broadcast_id) {
      return res.status(400).json({ error: "broadcast_id kiritilishi shart" });
    }

    const localList = getLocalBroadcasts();
    let bcast = localList.find(b => b.id === broadcast_id);

    if (!bcast) {
      const { data: dbBcast } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('id', broadcast_id)
        .single();
      bcast = dbBcast;
    }

    if (bcast && bcast.recipient_messages) {
      for (const item of bcast.recipient_messages) {
        try {
          await bot.telegram.deleteMessage(item.telegram_id, item.message_id);
        } catch (err) {
          console.error("Error deleting broadcast msg for user", item.telegram_id, err.message);
        }
        await new Promise(r => setTimeout(r, 20));
      }
    }

    // Filter out from local archive
    const filteredLocal = localList.filter(b => b.id !== broadcast_id);
    saveLocalBroadcasts(filteredLocal);

    // Filter out from Supabase DB
    try {
      await supabase.from('broadcasts').delete().eq('id', broadcast_id);
    } catch (err) {}

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Send Direct Support Reply from Admin CMS to specific user
app.post('/api/admin/reply', async (req, res) => {
  try {
    const { telegram_id, text, session_id } = req.body;

    if (!telegram_id || !text) {
      return res.status(400).json({ error: "telegram_id va text kiritilishi shart" });
    }

    const sentMsg = await bot.telegram.sendMessage(telegram_id, text);

    if (session_id) {
      await supabase.from('chat_messages').insert([{
        session_id,
        sender_type: 'ADMIN',
        text,
        telegram_message_id: sentMsg.message_id
      }]);
    }

    res.json({ success: true, telegram_message_id: sentMsg.message_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Edit Admin Message
app.put('/api/admin/edit-message', async (req, res) => {
  try {
    let { message_id, telegram_id, telegram_message_id, new_text } = req.body;

    if (!message_id || !new_text) {
      return res.status(400).json({ error: "message_id va new_text kiritilishi shart" });
    }

    if (!telegram_message_id || !telegram_id) {
      const { data: dbMsg } = await supabase
        .from('chat_messages')
        .select('telegram_message_id, session_id, chat_sessions(telegram_id)')
        .eq('id', message_id)
        .single();

      if (dbMsg) {
        telegram_message_id = telegram_message_id || dbMsg.telegram_message_id;
        telegram_id = telegram_id || dbMsg.chat_sessions?.telegram_id;
      }
    }

    if (telegram_id && telegram_message_id) {
      try {
        await bot.telegram.editMessageText(Number(telegram_id), Number(telegram_message_id), null, new_text);
      } catch (tgErr) {
        console.error("Notice: Telegram message edit error:", tgErr.message);
      }
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({ text: new_text })
      .eq('id', message_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Delete Admin Message
app.delete('/api/admin/delete-message', async (req, res) => {
  try {
    let { message_id, telegram_id, telegram_message_id } = req.body;

    if (!message_id) {
      return res.status(400).json({ error: "message_id kiritilishi shart" });
    }

    if (!telegram_message_id || !telegram_id) {
      const { data: dbMsg } = await supabase
        .from('chat_messages')
        .select('telegram_message_id, session_id, chat_sessions(telegram_id)')
        .eq('id', message_id)
        .single();

      if (dbMsg) {
        telegram_message_id = telegram_message_id || dbMsg.telegram_message_id;
        telegram_id = telegram_id || dbMsg.chat_sessions?.telegram_id;
      }
    }

    if (telegram_id && telegram_message_id) {
      try {
        await bot.telegram.deleteMessage(Number(telegram_id), Number(telegram_message_id));
      } catch (tgErr) {
        console.error("Notice: Telegram message delete error:", tgErr.message);
      }
    }

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', message_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Upload Media File (Base64)
app.post('/api/admin/upload', async (req, res) => {
  try {
    const { filename, file_base64 } = req.body;

    if (!filename || !file_base64) {
      return res.status(400).json({ error: "filename va file_base64 kiritilishi shart" });
    }

    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.pdf'];
    const ext = path.extname(filename).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: "Faqat rasm, video va PDF fayllarini yuklashga ruxsat berilgan!" });
    }

    const base64Data = file_base64.replace(/^data:(.*);base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const safeName = `${Date.now()}_${path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '')}${ext}`;
    const localFilePath = path.join(uploadsDir, safeName);

    fs.writeFileSync(localFilePath, buffer);

    const fileUrl = `/uploads/${safeName}`;

    try {
      await supabase.storage.from('bogcha-assets').upload(`broadcasts/${safeName}`, buffer, { upsert: true });
    } catch (sErr) {}

    res.json({ success: true, url: fileUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------
// 3. EXPRESS API FOR AI ASSISTANTS & MANAGEMENT
// -----------------------------------------------------------------

// Fetch AI Configs for Admin Panel
app.get('/api/admin/ai-config', async (req, res) => {
  try {
    const configs = await getAIConfigs();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update AI Config for specific assistant type
app.post('/api/admin/ai-config', async (req, res) => {
  try {
    const { assistant_type, global_ai_enabled, system_prompt, doc_content, doc_file_url, tts_enabled, is_active } = req.body;
    if (!assistant_type) {
      return res.status(400).json({ error: "assistant_type kiritilishi shart" });
    }

    const result = await saveAIConfig(assistant_type, {
      global_ai_enabled,
      system_prompt,
      doc_content,
      doc_file_url,
      tts_enabled,
      is_active
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch AI Leads (Potensial Mijozlar)
app.get('/api/admin/ai-leads', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ai_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update AI Lead status
app.put('/api/admin/ai-leads/status', async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "id va status kiritilishi shart" });
    }

    const { data, error } = await supabase
      .from('ai_leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, lead: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public / Frontend AI Chat endpoints
app.post('/api/ai/crm-chat', async (req, res) => {
  try {
    const { telegramId, message, history } = req.body;
    const result = await processCRMChat({ telegramId, userMessage: message, history });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/admin-copilot', async (req, res) => {
  try {
    const { query } = req.body;
    const result = await processAdminCopilot({ query });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/kids-helper', async (req, res) => {
  try {
    const { question, requestTTS } = req.body;
    const result = await processKidsHelper({ question, requestTTS });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global Express Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("❌ Express unhandled error:", err.stack || err.message);
  res.status(err.status || 500).json({
    error: "Serverda kutilmagan xatolik yuz berdi",
    message: process.env.NODE_ENV === "production" ? undefined : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Express API server ${PORT}-portda tinglamoqda`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

