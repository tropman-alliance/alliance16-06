// api/telegram.js
// Обработчик бота для Telegram (вебхук на Vercel).
// Отвечает на несколько команд через "/" — у каждой свой текст и кнопки.
// Список команд для меню "/" в Telegram задаётся отдельно через @BotFather (инструкция в чате).
// Токен берётся из переменной TELEGRAM_BOT_TOKEN (та же, что для заявок).

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ===== НАСТРОЙКИ — поменяйте ссылки под себя =====
const MINIAPP_URL  = "https://alliance16-06.vercel.app";              // мини-приложение (бесплатная оценка)
const WHATSAPP_URL = "https://wa.me/79137200792";                     // WhatsApp для связи
const LAWYER_TG    = "https://t.me/V_Tropman";                        // юрист в Telegram напрямую
const SITE_URL     = "https://alliance-lawyer.ru/";                   // сайт фирмы — главная
const URL_FIZ       = "https://alliance-lawyer.ru/uslugi/uridicheskie-uslugi-fiz/";
const URL_BANKROT   = "https://alliance-lawyer.ru/uslugi/bankrotstvo/";
const URL_BUSINESS  = "https://alliance-lawyer.ru/uslugi/uridicheskie-uslugi/";
const URL_SUD       = "https://alliance-lawyer.ru/uslugi/Sudebnoe-predstavitelstvo/";
const URL_CONTACTS  = "https://alliance-lawyer.ru/contacts/";
const ADDRESS_TEXT  = "г. Новосибирск, ул. Фрунзе 5";
const PHONE_TEXT    = "+7 960 793-13-90";
// const CHANNEL_URL = "https://t.me/ВАШ_КАНАЛ"; // появится канал — раскомментируйте и добавьте кнопку, где нужно
// =================================================

const BTN_ASK = { text: "🟢 Бесплатная оценка ситуации", web_app: { url: MINIAPP_URL } };

async function tg(method, payload) {
  return fetch("https://api.telegram.org/bot" + TOKEN + "/" + method, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function send(chatId, text, keyboard) {
  return tg("sendMessage", {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    reply_markup: keyboard ? { inline_keyboard: keyboard } : undefined,
  });
}

// ===== Команды: ключ — текст после "/", без аргументов =====
const COMMANDS = {
  start: () => ({
    text:
      "⚖️ <b>Правовой альянс Осиповой и Тропина</b>\n\n" +
      "Опишите свою ситуацию — и за минуту получите бесплатную предварительную оценку: " +
      "какие законы на вашей стороне, что делать и какие документы понадобятся.\n\n" +
      "Долги, ДТП, споры с соседями, работа, договоры — нажмите кнопку ниже.\n\n" +
      "Команды через «/» внизу — разделы по направлениям.\n\n" +
      "<i>Без звонков и записи. Анонимно.</i>",
    keyboard: [
      [BTN_ASK],
      [
        { text: "💬 WhatsApp", url: WHATSAPP_URL },
        { text: "✉️ Юрист в Telegram", url: LAWYER_TG },
      ],
      [{ text: "🌐 Наш сайт", url: SITE_URL }],
    ],
  }),

  uslugi: () => ({
    text:
      "📋 <b>Направления работы</b>\n\n" +
      "Выберите раздел — откроется страница на сайте с подробностями. " +
      "Либо сразу опишите ситуацию боту и получите бесплатную оценку.",
    keyboard: [
      [{ text: "👤 Физическим лицам", url: URL_FIZ }],
      [{ text: "💼 Для бизнеса", url: URL_BUSINESS }],
      [{ text: "⚖️ Банкротство", url: URL_BANKROT }],
      [{ text: "🏛 Судебное представительство", url: URL_SUD }],
      [BTN_ASK],
    ],
  }),

  bankrotstvo: () => ({
    text:
      "⚖️ <b>Банкротство</b>\n\n" +
      "Спишем долги на законных основаниях и остановим звонки кредиторов — для физических и юридических лиц. " +
      "Работаем очно и дистанционно.\n\n" +
      "Узнайте бесплатно, подходит ли вам банкротство, или опишите ситуацию боту.",
    keyboard: [
      [BTN_ASK],
      [{ text: "Подробнее на сайте", url: URL_BANKROT }],
    ],
  }),

  business: () => ({
    text:
      "💼 <b>Юридическое сопровождение бизнеса</b>\n\n" +
      "Регистрация юрлиц, договоры, корпоративные и налоговые споры, защита интеллектуальной собственности, " +
      "представительство в арбитраже.",
    keyboard: [
      [BTN_ASK],
      [{ text: "Подробнее на сайте", url: URL_BUSINESS }],
    ],
  }),

  fizlicam: () => ({
    text:
      "👤 <b>Физическим лицам</b>\n\n" +
      "Трудовые споры, автоюрист, недвижимость, жилищные вопросы, защита прав потребителей, " +
      "семейные споры, снятие блокировок по 115-ФЗ и 161-ФЗ.",
    keyboard: [
      [BTN_ASK],
      [{ text: "Подробнее на сайте", url: URL_FIZ }],
    ],
  }),

  contacts: () => ({
    text:
      "📍 <b>Контакты</b>\n\n" +
      ADDRESS_TEXT + "\n" +
      "Телефон: " + PHONE_TEXT + "\n\n" +
      "Отвечаем на запрос в течение 5 минут.",
    keyboard: [
      [
        { text: "💬 WhatsApp", url: WHATSAPP_URL },
        { text: "✉️ Telegram", url: LAWYER_TG },
      ],
      [{ text: "🌐 Сайт", url: SITE_URL }],
    ],
  }),

  help: () => ({
    text:
      "Доступные команды:\n\n" +
      "/start — главное меню\n" +
      "/uslugi — все направления\n" +
      "/fizlicam — для физических лиц\n" +
      "/business — для бизнеса\n" +
      "/bankrotstvo — банкротство\n" +
      "/contacts — контакты и адрес\n\n" +
      "Или просто нажмите «Бесплатная оценка ситуации» — и опишите свою ситуацию своими словами.",
    keyboard: [[BTN_ASK]],
  }),
};

module.exports = async function handler(req, res) {
  // Telegram присылает обновления методом POST. На GET — простая заглушка-проверка.
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, info: "telegram webhook alive" });
  }

  let update = req.body;
  if (typeof update === "string") {
    try { update = JSON.parse(update); } catch { update = {}; }
  }

  const msg = update && update.message;
  const text = msg && msg.text ? String(msg.text).trim() : "";
  const chatId = msg && msg.chat ? msg.chat.id : null;

  if (chatId && text.startsWith("/")) {
    // "/uslugi@AllianceLawyer_bot" -> "uslugi"
    const cmd = text.slice(1).split(/[\s@]/)[0].toLowerCase();
    const entry = COMMANDS[cmd];
    if (entry) {
      const { text: t, keyboard } = entry();
      await send(chatId, t, keyboard);
    } else {
      await send(chatId, "Не знаю такую команду. Наберите /help — список доступных.", [[BTN_ASK]]);
    }
  }

  // Telegram всегда должен получить ответ 200, иначе он будет слать обновление повторно.
  return res.status(200).json({ ok: true });
};
