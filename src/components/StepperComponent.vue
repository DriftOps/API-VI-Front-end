<template>
  <div class="wrapper-stepper">
    <div class="stepper">
      <div class="stepper-progress">
        <div class="stepper-progress-bar" :style="'width:' + stepperProgress"></div>
      </div>

      <div
        class="stepper-item"
        :class="{ 'current': step == (index + 1), 'success': step > (index + 1) }"
        v-for="(title, index) in stepTitles"
        :key="'step-' + (index + 1)">
        <div class="stepper-item-counter">
          <img class="icon-success"
            src="https://www.seekpng.com/png/full/1-10353_check-mark-green-png-green-check-mark-svg.png"
            alt="Sucesso">
          <span class="number">{{ index + 1 }}</span>
        </div>
        <span class="stepper-item-title">{{ title }}</span>
      </div>
    </div>

    <div class="stepper-content">
      <div class="stepper-pane" v-if="step == 1">
        <h2>Bem-vindo(a) ao seu Planejamento! 👋</h2>
        <p>Vamos configurar sua **meta de evolução de peso** para você iniciar sua jornada fitness.</p>
        <div class="status-display">
            <p>Seu Status: **{{ currentStatus.status }}**</p>
            <img class="body-status-image" :src="getImagePath('M-Obesidade-120.png')" alt="Silhueta inicial">
            <p class="tx-green-1">Vamos começar?</p>
        </div>
      </div>

      <div class="stepper-pane" v-if="step == 2">
        <h2>Qual seu <span class="tx-green-1">Peso Atual</span>?</h2>
        <p>Seu peso atual reflete seu estágio atual de evolução.</p>

        <div class="status-display">
            <p>Seu Peso: **{{ newWeight || '...' }}kg**</p>
            <p>Status Atual: **{{ currentStatus.status }}**</p>
            <img :src="getImagePath(currentStatus.imageUrl)" class="body-status-image" :alt="currentStatus.status">
            <p style="font-size: 0.85rem; color: #666;">{{ currentStatus.description }}</p>
        </div>

        <div class="input-group">
            <label for="newWeight">Novo Peso (em kg):</label>
            <input type="number" id="newWeight" v-model.number="newWeight" placeholder="Ex: 85.5">
        </div>
      </div>

      <div class="stepper-pane" v-if="step == 3">
        <h2>Qual seu <span class="tx-green-1">Peso Meta</span>?</h2>
        <div class="input-group">
            <label for="goalWeight">Meta (em kg):</label>
            <input type="number" id="goalWeight" v-model.number="goalWeight" placeholder="Ex: 75.0">
            <p v-if="goalWeight > newWeight" style="color: blue; font-size: 0.85rem;">Objetivo: Ganhar Peso</p>
            <p v-else-if="goalWeight < newWeight" style="color: red; font-size: 0.85rem;">Objetivo: Perder Peso</p>
        </div>
      </div>

      <div class="stepper-pane" v-if="step == 4">
        <h2>Qual a <span class="tx-green-1">Data Meta</span>?</h2>
        <div class="input-group">
            <label for="targetDate">Até quando você quer alcançar:</label>
            <input type="date" id="targetDate" v-model="targetDate">
        </div>
      </div>

      <div class="stepper-pane" v-if="step == 5">
        <h2>Pronto para Salvar! 🎉</h2>
        <p>Confirme seus dados de planejamento:</p>
        <ul>
            <li>Peso Atual: <span class="tx-green-1">{{ newWeight }}kg</span></li>
            <li>Peso Meta: <span class="tx-green-1">{{ goalWeight }}kg</span></li>
            <li>Prazo: <span class="tx-green-1">{{ targetDate }}</span></li>
            <li>Objetivo: <span class="tx-green-1">{{ goalWeight < newWeight ? 'Perder Peso' : 'Ganhar Peso' }}</span></li>
        </ul>
        <p>Clique em **Salvar** para registrar e começar!</p>
      </div>
    </div>

    <div class="controls">
      <button class="btn" @click="step--" :disabled="step == 1 || step == 5">Anterior</button>

      <button v-if="step < 5" class="btn btn--green-1" @click="nextStep()"
              :disabled="(step === 2 && !isStepTwoValid) || (step === 3 && !isStepThreeValid) || (step === 4 && !isStepFourValid)">
        {{ step === 1 ? 'Começar' : 'Próximo' }}
      </button>

      <button v-if="step == 5" class="btn btn--green-1 btn--center" @click="submitData()">
        Salvar Plano
      </button>
    </div>
  </div>
</template>

<script>
// Usando a sintaxe de componente Vue
export default {
  name: 'StepperComponent',
  data: () => ({
    step: 1,
    // Simulação dos dados iniciais do usuário logado (UserController.java /me endpoint)
    userData: {
        id: 1, // Simulação do ID que viria do Authentication/Token
        weight: 95.0, // Peso inicial simulado
        gender: 'M', // Gênero para escolher o set de imagens
    },
    newWeight: null,
    goalWeight: null,
    targetDate: null,

    stepTitles: [
      'Início',
      'Seu Peso',
      'Sua Meta',
      'Prazo',
      'Concluir'
    ],

    // Mapeamento usando os nomes dos arquivos que você forneceu
    weightStatusMap: {
        'F': [ // Feminino
            { maxWeight: 120, status: 'Obesidade', imageUrl: 'F-Obesidade-120.png', description: 'Mais de 30% de gordura corporal. Alto risco.' },
            { maxWeight: 100, status: 'Sobrepeso', imageUrl: 'F-Sobrepeso-100.png', description: 'Sugerido entre 26-29% de gordura corporal.' },
            { maxWeight: 85, status: 'Mediano', imageUrl: 'F-Mediano-85.png', description: 'Sugerido entre 21-25% de gordura corporal.' },
            { maxWeight: 75, status: 'Saudável', imageUrl: 'F-Saudável-75.png', description: 'Sugerido entre 13-20% de gordura corporal. Ótimo.' },
            { maxWeight: 60, status: 'Fitness', imageUrl: 'F-Fitness-60.png', description: 'Abaixo de 12% de gordura corporal. Excelente.' }
        ],
        'M': [ // Masculino (Mapeamento que você forneceu)
            { maxWeight: 120, status: 'Obesidade', imageUrl: 'M-Obesidade-120.png', description: 'Mais de 25% de gordura corporal. Alto risco.' },
            { maxWeight: 100, status: 'Sobrepeso', imageUrl: 'M-Sobrepeso-100.png', description: 'Sugerido entre 20-25% de gordura corporal.' },
            { maxWeight: 85, status: 'Mediano', imageUrl: 'M-Mediano-85.png', description: 'Sugerido entre 15-20% de gordura corporal.' },
            { maxWeight: 75, status: 'Saudável', imageUrl: 'M-Saudável-75.png', description: 'Sugerido entre 10-15% de gordura corporal. Ótimo.' },
            { maxWeight: 60, status: 'Fitness', imageUrl: 'M-Fitness-60.png', description: 'Abaixo de 10% de gordura corporal. Excelente.' }
        ]
    }
  }),
  created() {
    // Lógica para iniciar o stepper no passo correto se o peso já estiver registrado
    if (this.userData.weight) {
        this.step = 2; // Inicia em "Seu Peso" se já tiver um registro
        this.newWeight = this.userData.weight;
    } else {
        this.step = 1; // Se o peso for nulo, começa na tela de boas-vindas
    }
  },
  computed: {
    stepperProgress() {
      // 4 divisões (5 passos)
      return (100 / 4) * (this.step - 1) + '%'
    },
    currentStatus() {
        const currentW = this.newWeight || this.userData.weight || 0;
        const genderMap = this.weightStatusMap[this.userData.gender] || this.weightStatusMap['M']; // Usa Masculino como padrão

        // Encontra o status com base no peso para o gênero do usuário
        for (const status of genderMap) {
            if (currentW > status.maxWeight) {
                return status;
            }
        }
        // Retorna o status mais baixo se o peso for menor que o limite mínimo
        return genderMap[genderMap.length - 1];
    },
    // Validações
    isStepTwoValid() {
        return this.newWeight !== null && this.newWeight > 0;
    },
    isStepThreeValid() {
        return this.goalWeight !== null && this.goalWeight > 0 && this.goalWeight !== this.newWeight;
    },
    isStepFourValid() {
        return this.targetDate !== null && this.targetDate !== '';
    }
  },
  methods: {
    // Função utilitária para buscar imagem na pasta public
    getImagePath(imageName) {
        // Assume que as imagens estão na pasta /public
        // Em um projeto Vue CLI/Vite, isso é o diretório raiz para assets estáticos.
        return `/${imageName}`;
    },
    nextStep() {
        if (this.step === 2 && !this.isStepTwoValid) return;
        if (this.step === 3 && !this.isStepThreeValid) return;
        if (this.step === 4 && !this.isStepFourValid) return;

        this.step++;
    },
    async submitData() {
        const goalType = this.goalWeight < this.newWeight ? 'PERDER_PESO' : 'GANHAR_PESO';

        const dataToSend = {
            weight: this.newWeight, // Novo peso para atualizar o perfil do usuário
            goalWeight: this.goalWeight,
            targetDate: this.targetDate,
            goalType: goalType // Usando o ENUM GoalType que você deve ter em Java
        };

        console.log(`Enviando dados para o Controller Java (UserID: ${this.userData.id}):`, dataToSend);

        alert(`Dados prontos para envio para o backend!`);

        // **AQUI VAI A CHAMADA HTTP REAL**
        /*
        try {
            const response = await fetch(`/api/users/${this.userData.id}/update-goal`, {
                method: 'PATCH', // Ou PUT, dependendo da sua preferência
                headers: {
                    'Content-Type': 'application/json',
                    // Incluir o Token de Autorização (Bearer Token) aqui
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                alert("Plano de peso atualizado com sucesso!");
            } else {
                const error = await response.json();
                alert(`Erro ao salvar plano: ${error.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            alert('Erro de conexão com o servidor.');
        }
        */
    }
  }
}
</script>

<style scoped>
/* COPIE TODO O SEU CSS AQUI DENTRO, incluindo as classes para cores, botões, e stepper */
body {
    background-image: linear-gradient(60deg, #4F46E5 0%, #252525 100%);
    color: #ffffff;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: sans-serif;
    margin: 0;
}

.tx-green-1 {
    color: #4F46E5;
    font-weight: 600;
}

.wrapper-stepper {
    background-color: #fff;
    padding: 60px;
    border-radius: 32px;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.09);
}

.stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 800px; /* Aumentado para 5 passos */
    position: relative;
    z-index: 0;
    margin-bottom: 24px;
}

.stepper-progress {
    position: absolute;
    background-color: #C5C5C5;
    height: 2px;
    z-index: -1;
    left: 0;
    right: 0;
    margin: 0 auto;
}

.stepper-progress-bar {
    position: absolute;
    left: 0;
    height: 100%;
    width: 0%;
    background-color: #4F46E5;
    transition: all 500ms ease;
}

.stepper-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #C5C5C5;
    transition: all 500ms ease;
    position: relative;
}

.stepper-item-counter {
    height: 68px;
    width: 68px;
    display: grid;
    place-items: center;
    background-color: #fff;
    border-radius: 100%;
    border: 2px solid #C5C5C5;
    position: relative;
}

.stepper-item-counter .icon-success {
    position: absolute;
    opacity: 0;
    transform: scale(0);
    width: 24px;
    transition: all 500ms ease;
}

.stepper-item-counter .number {
    font-size: 22px;
    transition: all 500ms ease;
}

.stepper-item-title {
    position: absolute;
    font-size: 14px;
    bottom: -24px;
    width: 100px;
    text-align: center;
}

.stepper-item.success .stepper-item-counter {
    border-color: #4F46E5;
    background-color: #e8e7fc; /* Cor mais clara para o sucesso */
    color: #fff;
    font-weight: 600;
}

.stepper-item.success .icon-success {
    opacity: 1;
    transform: scale(1);
}

.stepper-item.success .number {
    opacity: 0;
    transform: scale(0);
}

.stepper-item.success .stepper-item-title {
    color: #4F46E5;
}

.stepper-item.current .stepper-item-counter {
    border-color: #4F46E5;
    background-color: #4F46E5;
    color: #fff;
    font-weight: 600;
}

.stepper-item.current .stepper-item-title {
    color: #818181;
}

.stepper-pane {
    color: #333;
    text-align: center;
    padding: 40px 60px;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.09);
    margin: 40px 0;
    min-height: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.input-group {
    margin-top: 20px;
    width: 80%;
    max-width: 300px;
}

.input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #333;
}

.input-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
}

.controls {
    display: flex;
    justify-content: space-between;
}

.btn {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    border: 1px solid;
    text-align: center;
    cursor: pointer;
    line-height: 1.5;
    transition: all 150ms;
    border-radius: 4px;
    font-size: 1rem;
    color: #333;
    background-color: #f0f0f0;
    border-color: #f0f0f0;
}

.btn:disabled {
    opacity: 0.5;
    pointer-events: none;
}

.btn--green-1 {
    background-color: #4F46E5;
    border-color: #4F46E5;
    color: #fff;
    margin-left: auto;
}

.btn--center {
    margin: 0 auto;
}

.status-display {
    margin-bottom: 20px;
    padding: 15px;
    border-radius: 8px;
    background-color: #f7f7f7;
    width: 100%;
    max-width: 400px;
}

.status-display p {
    margin: 5px 0;
    color: #333;
}

.body-status-image {
    width: 100px;
    height: auto;
    margin-top: 15px;
}
</style>
