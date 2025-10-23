import axios from "axios";
import { useUserStore } from "@/stores/user";

export async function sendMessageToAI(message: string): Promise<string> {
  const userStore = useUserStore();
  
  // ⚠️ ADICIONE ESTE LOG
  console.log("Token a ser enviado:", userStore.user.token ? "Presente" : "Faltando");
  if (userStore.user.token) {
      console.log("Primeiros 10 caracteres do token:", userStore.user.token.substring(0, 10) + "...");
  }
  // ------------------

  try {
    const res = await axios.post(
      "http://localhost:8001/responder",
      { pergunta: message },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userStore.user.token}`,
        },
      }
    );

    return res.data.resposta;
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}
