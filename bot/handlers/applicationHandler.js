import { Markup } from 'telegraf';
import { getApplicationQuestions, saveApplication } from '../services/supabaseService.js';
import { buildMainMenuKeyboard } from './menuHandler.js';
import { validateApplicationAnswer } from '../services/aiService.js';

// In-memory application session store
// Key: telegramId, Value: { stepIndex, questions, answers: { [qId/qText]: answerText } }
export const userApplicationSessions = new Map();

// Helper: generate keyboard for question (adds Contact Share button & Date Buttons)
export function getQuestionKeyboard(questionText) {
  const qLower = (questionText || '').toLowerCase();
  
  if (qLower.includes('tel') || qLower.includes('raqam') || qLower.includes('phone')) {
    return Markup.keyboard([
      [Markup.button.contactRequest("📱 Telefon raqamni ulashish")],
      ['❌ Bekor qilish']
    ]).resize();
  }

  if (qLower.includes('vaqt') || qLower.includes('qaysi') || qLower.includes('oy') || qLower.includes('qachon') || qLower.includes('sana') || qLower.includes('berish')) {
    return Markup.keyboard([
      ['⚡ Ertadan', '📅 Kelasi dushanbadan'],
      ['🗓️ Shu oydan', '🍂 Sentabr oyidan'],
      ['❌ Bekor qilish']
    ]).resize();
  }

  return Markup.keyboard([['❌ Bekor qilish']]).resize();
}


/**
 * Start the application flow
 */
export async function startApplicationFlow(ctx) {
  const telegramId = ctx.from.id;
  const questions = await getApplicationQuestions();

  if (!questions || questions.length === 0) {
    return ctx.reply("Hozircha arizalar qabul qilinmayapti. Iltimos, keyinroq urinib ko'ring.");
  }

  // Initialize session
  userApplicationSessions.set(telegramId, {
    stepIndex: 0,
    questions,
    answers: {}
  });

  const firstQuestion = questions[0];
  const keyboard = getQuestionKeyboard(firstQuestion.question_text);

  const text = 
    `📝 *Ariza qoldirish bo'limi*\n\n` +
    `Iltimos, so'ralgan ma'lumotlarni ketma-ket kiritib boring.\n\n` +
    `1-savol: *${firstQuestion.question_text}*`;

  await ctx.replyWithMarkdown(text, keyboard);
}

/**
 * Process active application steps with AI Validation
 */
export async function processApplicationAnswer(ctx) {
  const telegramId = ctx.from.id;
  const session = userApplicationSessions.get(telegramId);

  if (!session) return false; // Not in application flow

  const textLower = text.toLowerCase();
  if (textLower.includes('bekor') || textLower.includes('cancel') || text.includes('❌')) {
    userApplicationSessions.delete(telegramId);
    const mainKb = await buildMainMenuKeyboard(telegramId);
    await ctx.reply("❌ Ariza to'ldirish bekor qilindi.", mainKb);
    return true;
  }


  const currentQ = session.questions[session.stepIndex];

  // 🤖 AI Validation Step
  const validation = await validateApplicationAnswer({
    questionText: currentQ.question_text,
    userAnswer: text,
    stepIndex: session.stepIndex
  });

  if (!validation.isValid) {
    const keyboard = getQuestionKeyboard(currentQ.question_text);
    await ctx.replyWithMarkdown(
      `${validation.errorMessage}\n\n*Qayta kiriting (${session.stepIndex + 1}-savol):* ${currentQ.question_text}`,
      keyboard
    );
    return true; // Stop here, keep user on current step
  }

  // Valid! Save formatted answer and move to next question
  session.answers[currentQ.question_text] = validation.formattedValue || text;
  session.stepIndex += 1;

  // Check if more questions remain
  if (session.stepIndex < session.questions.length) {
    const nextQ = session.questions[session.stepIndex];
    const keyboard = getQuestionKeyboard(nextQ.question_text);

    await ctx.replyWithMarkdown(
      `${session.stepIndex + 1}-savol: *${nextQ.question_text}*`,
      keyboard
    );
  } else {
    // Application finished!
    const userName = `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim();
    await saveApplication(telegramId, userName, session.answers);

    userApplicationSessions.delete(telegramId);

    const mainKb = await buildMainMenuKeyboard(telegramId);
    await ctx.reply(
      "✅ *Arizangiz muvaffaqiyatli qabul qilindi!*\n\nTez orada ma'muriyatimiz siz bilan bog'lanadi. E'tiboringiz uchun rahmat!",
      { parse_mode: 'Markdown', ...mainKb }
    );
  }

  return true;
}


