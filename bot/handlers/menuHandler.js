import { Markup } from 'telegraf';
import { isAdminTelegramId, getMainMenus } from '../services/supabaseService.js';

export const ABOUT_BTN = "Bog'cha haqida ma'lumot ℹ️";
export const APPLY_BTN = "Ariza qoldirish 📝";
export const CONTACT_BTN = "Biz bilan bog'lanish 📞";
export const AI_BTN = "🤖 AI Assistent Yordami";
export const ADMIN_BTN = "Admin panelga kirish ⚙️";

/**
 * Generate Main Menu Keyboard according to User Role & DB Menus
 */
export async function buildMainMenuKeyboard(telegramId) {
  const isAdmin = await isAdminTelegramId(telegramId);
  const dynamicMenus = await getMainMenus();

  const keyboard = [];
  const miniAppUrl = process.env.WEBAPP_URL || 'https://bolalar-bogchasi-bot.onrender.com';

  // Main Web App button
  keyboard.push([
    Markup.button.webApp("📱 Web Ilovani Ochish", miniAppUrl)
  ]);

  // Group active DB menus into 2 buttons per row
  for (let i = 0; i < dynamicMenus.length; i += 2) {
    const row = [dynamicMenus[i].title];
    if (i + 1 < dynamicMenus.length) {
      row.push(dynamicMenus[i + 1].title);
    }
    keyboard.push(row);
  }

  // Admin Panel Web App button
  keyboard.push([
    Markup.button.webApp("⚙️ Admin Panelga kirish", `${miniAppUrl}/admin`)
  ]);

  return Markup.keyboard(keyboard).resize();
}


/**
 * Send Welcome / Main Menu
 */
export async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  const firstName = ctx.from.first_name || 'Foydalanuvchi';

  const keyboard = await buildMainMenuKeyboard(telegramId);

  const welcomeText = 
    `Assalomu alaykum, ${firstName}!\n\n` +
    `"Porloq Kelajak" zamonaviy bolalar bog'chasining rasmiy botiga xush kelibsiz.\n\n` +
    `Quyidagi menyu orqali bog'chamiz haqida ma'lumot olishingiz, ariza qoldirishingiz yoki biz bilan bog'lanishingiz mumkin.`;

  await ctx.reply(welcomeText, keyboard);
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
  const text = 
    `📞 *Biz bilan bog'lanish*\n\n` +
    `Savollaringiz yoki takliflaringiz bo'lsa, bevosita botga matnli xabar yozishingiz mumkin. Adminlarimiz tez orada sizga javob berishadi.\n\n` +
    `📱 *Murojaat uchun:* +998 71 200-00-11\n` +
    `💬 *Telegram Admin:* @bogcha_admin_support\n` +
    `🌐 *Veb-sayt:* https://bogcha-mini-app.vercel.app`;

  await ctx.replyWithMarkdown(text);
}
