const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;


export const sendMessageStream = async (
  messages: any[],
  onChunk: (text: string) => void
) => {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-70b-versatile",
      messages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text();
    throw new Error(errText);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let full = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });

    const lines = chunk.split("\n");

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;

      const data = line.replace("data: ", "").trim();
      if (data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        const token = json.choices?.[0]?.delta?.content;

        if (token) {
          full += token;
          onChunk(full);
        }
      } catch (e) {
        // ignorar chunks rotos
      }
    }
  }

  return full;
};
