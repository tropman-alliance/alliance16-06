// api/assess.js
// Серверная функция Vercel (Node.js).
// Принимает POST { category, description } от витрины (index.html),
// спрашивает Claude и возвращает { text: "<строка с JSON-оценкой>" }.
// Фронтенд сам распарсит JSON из поля text.

module.exports = async function handler(req, res) {
  // Разрешаем только POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Только POST" });
  }

  // Тело запроса (Vercel обычно парсит JSON сам, но подстрахуемся)
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const category = (body && body.category) || "";
  const description = (body && body.description) || "";

  if (!String(description).trim()) {
    return res.status(400).json({ error: "Пустое описание" });
  }

  // Ключ берём из переменной окружения Vercel — в код его НЕ вписываем!
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY не задан в переменных окружения проекта");
    return res.status(500).json({ error: "Сервер не настроен" });
  }

  const system =
    "Ты — юридический ассистент российской фирмы «Правовой альянс Осиповой и Тропина». " +
    "По обращению клиента дай краткую ПРЕДВАРИТЕЛЬНУЮ оценку по российскому праву. " +
    "Отвечай СТРОГО валидным JSON, без markdown и без пояснений до или после, строго по схеме:\n" +
    "{\n" +
    '  "summary": "2–4 предложения: суть ситуации и перспективы",\n' +
    '  "norms": [{"ref": "ст. 0 ГК РФ", "note": "зачем эта норма"}],\n' +
    '  "actions": ["конкретный шаг", "..."],\n' +
    '  "documents": ["нужный документ", "..."],\n' +
    '  "note": "одно предложение — важный нюанс или предостережение"\n' +
    "}\n" +
    "Не выдумывай номера статей: если не уверен — оставь ref пустым и опиши норму словами в note. " +
    "Если данных мало — скажи об этом в summary и попроси уточнения в actions.";

  const userMsg =
    "Направление: " + (category || "не указано") +
    "\nСитуация клиента: " + description;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5", // самая дешёвая модель; альтернативы: claude-sonnet-4-6 (умнее), claude-opus-4-8 (ещё умнее)
        max_tokens: 1500,
        system: system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error("Ошибка Anthropic API:", r.status, detail);
      return res.status(502).json({ error: "Ошибка запроса к ИИ" });
    }

    const data = await r.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return res.status(200).json({ text });
  } catch (e) {
    console.error("Ошибка функции assess:", e);
    return res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
};
