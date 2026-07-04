export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { question, context } = req.body || {};
    if (!question) {
      res.status(400).json({ error: "Missing question" });
      return;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: `Sen Volt adında bir bisiklet bilgisayarı sesli asistanısın; Iron Man'deki JARVIS gibi sakin, kısa ve net konuşursun. Cevapların sesli okunacak, bu yüzden 1-2 kısa cümleyi geçme, madde işareti veya biçimlendirme kullanma. Türkçe konuş. Güncel sürüş bilgisi: ${context || "bilinmiyor"}`,
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data.error?.message || "Anthropic API error" });
      return;
    }

    const text = (data.content || [])
      .map((b) => b.text || "")
      .join(" ")
      .trim();

    res.status(200).json({ text });
  } catch (e) {
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
