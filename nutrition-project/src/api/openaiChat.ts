import axios from "axios";

export async function sendMessageToAI(message: string): Promise<string> {
  try {
    // Exemplo: chamada a um backend que usa IA
    const res = await axios.post("http://localhost:8080/api/chat", {
      prompt: message,
    });

    return res.data.reply;

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
    console.error("Erro ao enviar mensagem:", err);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}