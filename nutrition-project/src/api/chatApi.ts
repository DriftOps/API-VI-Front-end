import axios from "axios";

export async function sendMessageToAI(message: string): Promise<string> {
  try {
    const res = await axios.post("http://localhost:8001/responder", {
      pergunta: message, // 👈 precisa ser "pergunta", igual no FastAPI
    });

    return res.data.resposta; // 👈 backend retorna "resposta"
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}
