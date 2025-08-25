import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // chave do .env
});

export const sendMessageToAI = async (message: string) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você é um assistente nutricional." },
        { role: "user", content: message },
      ],
    });

    return response.choices[0].message.content || "Não entendi.";
  } catch (err) {
    console.error(err);
    return "Erro ao se comunicar com a IA.";
  }
};
