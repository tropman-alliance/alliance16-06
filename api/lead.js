// api/lead.js
// Серверная функция Vercel (Node.js).
// Принимает POST с заявкой { name, contact, category, description } от витрины
// и доставляет её юристу. Возвращает статусы по каналам: { email, telegram }.
// Статусы: "ok" | "error" | "skipped". "skipped" = канал не настроен,
// и витрина тогда сама предложит отправить заявку вручную (Почта / WhatsApp).

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Только POST" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const lead = body || {};

  // По умолчанию каналы не настроены
  const result = { email: "skipped", telegram: "skipped" };

  // --- Доставка в Telegram ---
  // Включается, если в переменных окружения заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    const text =
      "🟢 Новая заявка — " + (lead.category || "—") + "\n" +
      "Имя: " + (lead.name || "—") + "\n" +
      "Контакт: " + (lead.contact || "—") + "\n\n" +
      "Ситуация:\n" + (lead.description || "—");
    try {
      const r = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: text }),
      });
      if (r.ok) {
        result.telegram = "ok";
      } else {
        result.telegram = "error";
        console.error("Ошибка Telegram:", r.status, await r.text());
      }
    } catch (e) {
      result.telegram = "error";
      console.error("Сбой отправки в Telegram:", e);
    }
  }

  // --- Доставка на почту ---
  // Пока не настроена. Заявки и так приходят в Telegram, а на почту витрина
  // предложит продублировать вручную. Если позже понадобится автоматическая
  // отправка письма — допишем здесь (например, через Resend).

  return res.status(200).json(result);
};
