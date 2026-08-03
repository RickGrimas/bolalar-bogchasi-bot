import { getMainMenus } from '../services/supabaseService.js';
import { startApplicationFlow } from './applicationHandler.js';

/**
 * Handle dynamic main chat button click (Text, File, URL, AI Application)
 */
export async function handleDynamicMenuClick(ctx) {
  const text = ctx.message && ctx.message.text ? ctx.message.text.trim() : '';
  if (!text) return false;

  const menus = await getMainMenus();
  const matchedMenu = menus.find(m => m.title === text);

  if (!matchedMenu) return false;

  if (matchedMenu.action_type === 'AI_APPLICATION' || matchedMenu.action_type === 'AI_FORM' || (matchedMenu.content_value && matchedMenu.content_value.includes('AI_APPLICATION'))) {
    await ctx.reply("🤖 *AI Avtomatik Assistent:* Sizga qulay bo'lishi uchun arizangizni avtomatik shakllantirishni boshlayman.", { parse_mode: 'Markdown' });
    await startApplicationFlow(ctx);
  } else if (matchedMenu.action_type === 'AI_CRM' || matchedMenu.title.includes('AI Assistent')) {
    await ctx.reply(
      "🤖 *AI Jonli Muloqot Assistentiga xush kelibsiz!*\n\n" +
      "Menga bog'chamiz, qabul shartlari, to'garaklar yoki narxlar haqida istalgan savolingizni berishingiz mumkin. Sizga jonli suhbat shaklida yordam beraman!\n\n" +
      "_Suhbatni yakunlash uchun /cancel yoki ❌ Bekor qilish tugmasini bosing._",
      { parse_mode: 'Markdown' }
    );
  } else if (matchedMenu.action_type === 'TEXT') {
    await ctx.replyWithMarkdown(matchedMenu.content_value);
  } else if (matchedMenu.action_type === 'URL') {
    await ctx.reply(`🔗 ${matchedMenu.title}:\n${matchedMenu.content_value}`);
  } else if (matchedMenu.action_type === 'FILE') {
    try {
      await ctx.replyWithDocument(matchedMenu.content_value, {
        caption: matchedMenu.title
      });
    } catch (err) {
      await ctx.reply(`📄 ${matchedMenu.title}:\n${matchedMenu.content_value}`);
    }
  }


  return true;
}

/**
 * Handle inline button callback queries (Broadcast callbacks)
 */
export async function handleInlineCallback(ctx) {
  const data = ctx.callbackQuery ? ctx.callbackQuery.data : '';
  if (!data) return;

  if (data.startsWith('btn_text_')) {
    const textVal = data.replace('btn_text_', '');
    await ctx.answerCbQuery();
    await ctx.reply(textVal);
  } else if (data.startsWith('btn_file_')) {
    const fileUrl = data.replace('btn_file_', '');
    await ctx.answerCbQuery();
    try {
      await ctx.replyWithDocument(fileUrl);
    } catch (err) {
      await ctx.reply(`📄 Fayl havolasi:\n${fileUrl}`);
    }
  } else {
    await ctx.answerCbQuery();
  }
}
