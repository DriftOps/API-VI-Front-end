<template>
  <div class="wrapper-stepper">
    <div class="stepper">
      <div class="stepper-progress">
        <div class="stepper-progress-bar" :style="{ width: stepperProgress }"></div>
      </div>

      <div
        class="stepper-item"
        :class="{ current: step === item, success: step > item }"
        v-for="item in 4"
        :key="'step-' + item"
      >
        <div class="stepper-item-counter">
          <img
            class="icon-success"
            src="https://www.seekpng.com/png/full/1-10353_check-mark-green-png-green-check-mark-svg.png"
            alt=""
          />
          <span class="number">{{ item }}</span>
        </div>
        <span class="stepper-item-title">Paso {{ item }}</span>
      </div>
    </div>

    <div class="stepper-content" v-for="item in 4" :key="'pane-' + item">
      <div class="stepper-pane" v-if="step === item">
        Estas en el paso <span class="tx-green-1">{{ item }}</span> aqui mostrarás el contenido :D
      </div>
    </div>

    <div class="controls">
      <button class="btn" @click="step--" :disabled="step === 1">Anterior</button>
      <button class="btn btn--green-1" @click="step++" :disabled="step === 4">Siguiente</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepperComponent',
  data() {
    return {
      step: 1,
    };
  },
  computed: {
    stepperProgress() {
      return (100 / 3) * (this.step - 1) + '%';
    },
  },
};
</script>

<style scoped>
/* Cores */
:root {
  --default: #C5C5C5;
  --green-1: #75CC65;
}

/* Utilitário */
.tx-green-1 {
  color: var(--green-1);
  font-weight: 600;
}

/* Estilos principais */
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
  width: 660px;
  position: relative;
  z-index: 0;
  margin-bottom: 24px;
}

.stepper-progress {
  position: absolute;
  background-color: var(--default);
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
  background-color: var(--green-1);
  transition: all 500ms ease;
}

.stepper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--default);
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
  border: 2px solid var(--default);
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
}

.stepper-item.success .stepper-item-counter {
  border-color: var(--green-1);
  background-color: #c8ebc1;
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
  color: var(--green-1);
}

.stepper-item.current .stepper-item-counter {
  border-color: var(--green-1);
  background-color: var(--green-1);
  color: #fff;
  font-weight: 600;
}

.stepper-item.current .stepper-item-title {
  color: #818181;
}

.stepper-pane {
  color: #333;
  text-align: center;
  padding: 120px 60px;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.09);
  margin: 40px 0;
}

.controls {
  display: flex;
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 16px;
  border: 1px solid;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  line-height: 1.5;
  transition: all 150ms;
  border-radius: 4px;
  width: fit-content;
  font-size: 0.75rem;
  color: #333;
  background-color: #f0f0f0;
  border-color: #f0f0f0;
}

.btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.btn--green-1 {
  background-color: var(--green-1);
  border-color: var(--green-1);
  color: #fff;
  margin-left: auto;
}
</style>
