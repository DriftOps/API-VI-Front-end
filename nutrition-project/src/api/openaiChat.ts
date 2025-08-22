import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // chave do .env
});

const openai = new OpenAIApi(configuration);

export const sendMessageToAI = async (message: string) => {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Você é um assistente nutricional." },
        { role: "user", content: message },
      ],
    });

    return response.data.choices[0].message?.content || "Não entendi.";
  } catch (err) {
    console.error(err);
    return "Erro ao se comunicar com a IA.";
  }
};
