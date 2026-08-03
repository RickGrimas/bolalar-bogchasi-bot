import { Markup } from 'telegraf';
import { isAdminTelegramId, getMainMenus } from '../services/supabaseService.js';

export const ABOUT_BTN = "Bog'cha haqida ma'lumot ℹ️";
export const APPLY_BTN = "Ariza qoldirish 📝";
export const CONTACT_BTN = "Biz bilan bog'lanish 📞";
export const AI_BTN = "🤖 AI Assistent Yordami";
export const ADMIN_BTN = "⚙️ Admin Panelga kirish";

/**
 * Generate Main Reply Keyboard Menu (Text Buttons)
 */
export async function buildMainMenuKeyboard(telegramId) {
  try {
    const dynamicMenus = await getMainMenus();
    const keyboard = [];

    if (dynamicMenus && dynamicMenus.length > 0) {
      for (let i = 0; i < dynamicMenus.length; i += 2) {
        const row = [dynamicMenus[i].title];
        if (i + 1 < dynamicMenus.length) {
          row.push(dynamicMenus[i + 1].title);
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
    const firstName = ctx.from.first_name || 'Foydalanuvchi';
    const miniAppUrl = process.env.WEBAPP_URL || 'https://bolalar-bogchasi-bot.onrender.com';

    const welcomeText = 
      `Assalomu alaykum, *${firstName}*!\n\n` +
      `"Porloq Kelajak" zamonaviy bolalar bog'chasining rasmiy botiga xush kelibsiz.\n\n` +
      `📱 *Web Ilova* va ⚙️ *Admin Panel*ga kirish uchun quyidagi alohida tugmalardan foydalanishingiz mumkin:`;

    // Send Welcome with standalone Inline WebApp buttons
    const inlineButtons = Markup.inlineKeyboard([
      [Markup.button.webApp("📱 Web Ilovani Ochish", miniAppUrl)],
      [Markup.button.webApp("⚙️ Admin Panelga Kirish", `${miniAppUrl}/admin`)]
    ]);

    await ctx.replyWithMarkdown(welcomeText, inlineButtons);

    // Send Main Reply Keyboard for chat actions
    const replyKeyboard = await buildMainMenuKeyboard(telegramId);
    await ctx.reply("👇 Quyidagi menyu orqali bot imkoniyatlaridan foydalanishingiz mumkin:", replyKeyboard);
  } catch (err) {
    console.error("Error in handleStart:", err);
    await ctx.reply("Assalomu alaykum! Xush kelibsiz. Botdan foydalanish uchun pastdagi menyuni tanlang.");
  }
}

/**
 * Handle "Bog'cha haqida ma'lumot ℹ️"
 */
export async function handleAbout(ctx) {
  const text = 
    `🏫 *"Porloq Kelajak" Bolalar Bog'chasi*\n\n` +
    `Bizning bog'chamiz 3 yoshdan 6 yoshgacha bo'lgan bolalar uchun zamonaviy ta'lim, xavfsiz muhit va shaxsiy rivojlanish imkoniyatlarini taqdim etadi.\n\n` +
    `✨ *Bizning afzalliklarimiz:*\n` +
    `• Professional pedagog va psixologlar jamoasi\n` +
    `• STEM, Mental arifmetika, Tillar (Ingliz va Rus)\n` +
    `• Kuniga 4 mahal sog'lom va sifatli ovqatlanish\n` +
    `• Online video kuzatuv va xavfsiz hudud\n` +
    `• 5 mahal chiniqtirish va sport to'garaklari\n\n` +
    `📍 Manzil: Toshkent sh., Chilonzor tumani, 14-mavze, 25-uy\n` +
    `☎️ Telefon: +998 71 200-00-11`;

  await ctx.replyWithMarkdown(text);
}

/**
 * Handle "Biz bilan bog'lanish 📞"
 */
export async function handleContact(ctx) {
  const miniAppUrl = process.env.WEBAPP_URL || 'https://bolalar-bogchasi-bot.onrender.com';
  const text = 
    `📞 *Biz bilan bog'lanish*\n\n` +
    `Savollaringiz yoki takliflaringiz bo'lsa, bevosita botga matnli xabar yozishingiz mumkin. Adminlarimiz tez orada sizga javob berishadi.\n\n` +
    `📱 *Murojaat uchun:* +998 71 200-00-11\n` +
    `💬 *Telegram Admin:* @bogcha_admin_support\n` +
    `🌐 *Veb-sayt:* ${miniAppUrl}`;

  await ctx.replyWithMarkdown(text);
}
