import axios from "axios";
import { useUserStore } from "@/stores/user";
import { useMealStore } from "@/stores/meal"; 

export async function sendMessageToAI(message: string): Promise<string> {
  const userStore = useUserStore();
  const mealStore = useMealStore();
  
  console.log("Token a ser enviado:", userStore.user.token ? "Presente" : "Faltando");
  if (userStore.user.token) {
      console.log("Primeiros 10 caracteres do token:", userStore.user.token.substring(0, 10) + "...");
  }

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

    if (res.data.meal_saved) {
      console.log("IA salvou uma refeição, atualizando a lista para HOJE...");

      const today = new Date().toISOString().substr(0, 10);

      await mealStore.setDateAndFetch(today);
    }

    return res.data.resposta;

  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}
