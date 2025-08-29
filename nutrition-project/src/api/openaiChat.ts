import axios from "axios";

export async function sendMessageToAI(message: string): Promise<string> {
  try {
    // Exemplo: chamada a um backend que usa IA
    const res = await axios.post("http://localhost:8080/api/chat", {
      prompt: message,
    });

    return res.data.reply;
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}