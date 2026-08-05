import { Markup } from 'telegraf';
import { isAdminTelegramId, getMainMenus } from '../services/supabaseService.js';

export const ABOUT_BTN = "Bog'cha haqida ma'lumot ℹ️";
export const APPLY_BTN = "Ariza qoldirish 📝";
export const CONTACT_BTN = "Biz bilan bog'lanish 📞";
export const AI_BTN = "🤖 AI Assistent Yordami";
export const ADMIN_BTN = "⚙️ Admin Panel";

const escapeHTML = (str = '') => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const getCleanWebAppUrl = () => {
  let rawUrl = process.env.WEBAPP_URL;
  
  // If WEBAPP_URL is empty or points to a non-existent vercel URL causing 404, force use live Render URL
  if (!rawUrl || rawUrl.includes('vercel.app') || rawUrl.includes('\n') || rawUrl.includes('\r')) {
    return 'https://bolalar-bogchasi-bot.onrender.com';
  }

  rawUrl = String(rawUrl).trim().replace(/[\r\n\t"'\s]+/g, '').replace(/\/+$/, '');
  
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }

  try {
    const parsed = new URL(rawUrl);
    return parsed.href.replace(/\/+$/, '');
  } catch (e) {
    console.error("❌ Invalid WEBAPP_URL in env, using default Render URL fallback:", rawUrl);
    return 'https://bolalar-bogchasi-bot.onrender.com';
  }
};

/**
 * Generate Main Reply Keyboard Menu (Text Buttons)
 */
export async function buildMainMenuKeyboard(telegramId) {
  try {
    const rawDynamicMenus = await getMainMenus();
    const keyboard = [];

    // Deduplicate titles
    const titlesSet = new Set();
    const uniqueTitles = [];

    if (Array.isArray(rawDynamicMenus)) {
      for (const item of rawDynamicMenus) {
        const title = (item.title || '').trim();
        if (title && !titlesSet.has(title)) {
          titlesSet.add(title);
          uniqueTitles.push(title);
        }
      }
    }

    if (uniqueTitles.length > 0) {
      for (let i = 0; i < uniqueTitles.length; i += 2) {
        const row = [uniqueTitles[i]];
        if (i + 1 < uniqueTitles.length) {
          row.push(uniqueTitles[i + 1]);
        }
        keyboard.push(row);
      }
    } else {
      keyboard.push([ABOUT_BTN, APPLY_BTN]);
      keyboard.push([CONTACT_BTN, AI_BTN]);
    }

    return Markup.keyboard(keyboard).resize();
  } catch (err) {
    console.error("Error building main menu keyboard:", err.message);
    return Markup.keyboard([
      [ABOUT_BTN, APPLY_BTN],
      [CONTACT_BTN, AI_BTN]
    ]).resize();
  }
}

/**
 * Send Welcome / Main Menu
 */
export async function handleStart(ctx) {
  try {
    const telegramId = ctx.from.id;
    const firstName = escapeHTML(ctx.from.first_name || 'Foydalanuvchi');
    const miniAppUrl = getCleanWebAppUrl();
    const isAdmin = await isAdminTelegramId(telegramId);

    console.log(`[handleStart] User ${telegramId} (${firstName}), isAdmin: ${isAdmin}, miniAppUrl: ${miniAppUrl}`);

    const welcomeText = 
      `Assalomu alaykum, <b>${firstName}</b>!\n\n` +
      `"Porloq Kelajak" zamonaviy bolalar bog'chasining rasmiy botiga xush kelibsiz.\n\n` +
      `Quyidagi menyu orqali bog'chamiz haqida ma'lumot olishingiz, ariza qoldirishingiz yoki biz bilan bog'lanishingiz mumkin.`;

    const replyKeyboard = await buildMainMenuKeyboard(telegramId);

    if (isAdmin) {
      // For Admin Users: Show Admin Panel Inline Button + Reply Keyboard
      const adminInlineKeyboard = Markup.inlineKeyboard([
        [Markup.button.webApp("⚙️ Admin Panel", `${miniAppUrl}/admin`)]
      ]);

      await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        ...adminInlineKeyboard
      });

      // Send chat reply menu cleanly
      await ctx.reply("📍 Asosiy menyu:", replyKeyboard);
    } else {
      // For Normal Users: Send welcome text with Reply Keyboard in 1 single message
      await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        ...replyKeyboard
      });
    }
  } catch (err) {
    console.error("❌ Error in handleStart:", err);
    try {
      const fallbackKeyboard = Markup.keyboard([
        [ABOUT_BTN, APPLY_BTN],
        [CONTACT_BTN, AI_BTN]
      ]).resize();
      await ctx.reply("Assalomu alaykum! Xush kelibsiz. Botdan foydalanish uchun pastdagi menyuni tanlang:", fallbackKeyboard);
    } catch (e) {
      console.error("❌ Fallback error in handleStart:", e);
    }
  }
}

/**
 * Handle "Bog'cha haqida ma'lumot ℹ️"
 */
export async function handleAbout(ctx) {
  const text = 
    `🏫 <b>"Porloq Kelajak" Bolalar Bog'chasi</b>\n\n` +
    `Bizning bog'chamiz 3 yoshdan 6 yoshgacha bo'lgan bolalar uchun zamonaviy ta'lim, xavfsiz muhit va shaxsiy rivojlanish imkoniyatlarini taqdim etadi.\n\n` +
    `✨ <b>Bizning afzalliklarimiz:</b>\n` +
    `• Professional pedagog va psixologlar jamoasi\n` +
    `• STEM, Mental arifmetika, Tillar (Ingliz va Rus)\n` +
    `• Kuniga 4 mahal sog'lom va sifatli ovqatlanish\n` +
    `• Online video kuzatuv va xavfsiz hudud\n` +
    `• 5 mahal chiniqtirish va sport to'garaklari\n\n` +
    `📍 Manzil: Toshkent sh., Chilonzor tumani, 14-mavze, 25-uy\n` +
    `☎️ Telefon: +998 71 200-00-11`;

  await ctx.reply(text, { parse_mode: 'HTML' });
}

/**
 * Handle "Biz bilan bog'lanish 📞"
 */
export async function handleContact(ctx) {
  const miniAppUrl = getCleanWebAppUrl();
  const text = 
    `📞 <b>Biz bilan bog'lanish</b>\n\n` +
    `Savollaringiz yoki takliflaringiz bo'lsa, bevosita botga matnli xabar yozishingiz mumkin. Adminlarimiz tez orada sizga javob berishadi.\n\n` +
    `📱 <b>Murojaat uchun:</b> +998 71 200-00-11\n` +
    `💬 <b>Telegram Admin:</b> @bogcha_admin_support\n` +
    `🌐 <b>Veb-sayt:</b> ${miniAppUrl}`;

  await ctx.reply(text, { parse_mode: 'HTML' });
}
