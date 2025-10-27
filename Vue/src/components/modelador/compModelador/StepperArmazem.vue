<template>
  <div class="stepper-armazem mb-3">
    <div class="stepper-container">
      <!-- Etapa 1: Dados -->
      <div 
        class="stepper-step" 
        :class="{ active: etapaAtual === 1, completed: etapaAtual > 1 }"
        @click="irParaEtapa(1)"
      >
        <div class="step-number">
          <i v-if="etapaAtual > 1" class="fa fa-check"></i>
          <span v-else>1</span>
        </div>
        <div class="step-label">Dados</div>
      </div>

      <!-- Linha de conexão -->
      <div class="stepper-line" :class="{ completed: etapaAtual > 1 }"></div>

      <!-- Etapa 2: Armazém Lateral -->
      <div 
        class="stepper-step" 
        :class="{ active: etapaAtual === 2, completed: etapaAtual > 2 }"
        @click="irParaEtapa(2)"
      >
        <div class="step-number">
          <i v-if="etapaAtual > 2" class="fa fa-check"></i>
          <span v-else>2</span>
        </div>
        <div class="step-label">Armazém Lateral</div>
      </div>

      <!-- Linha de conexão -->
      <div class="stepper-line" :class="{ completed: etapaAtual > 2 }"></div>

      <!-- Etapa 3: Armazém Topo -->
      <div 
        class="stepper-step" 
        :class="{ active: etapaAtual === 3, completed: etapaAtual > 3 }"
        @click="irParaEtapa(3)"
      >
        <div class="step-number">
          <i v-if="etapaAtual > 3" class="fa fa-check"></i>
          <span v-else>3</span>
        </div>
        <div class="step-label">Armazém Topo</div>
      </div>

      <!-- Linha de conexão -->
      <div class="stepper-line" :class="{ completed: etapaAtual > 3 }"></div>

      <!-- Etapa 4: Salvar -->
      <div 
        class="stepper-step" 
        :class="{ active: etapaAtual === 4, completed: false }"
        @click="irParaEtapa(4)"
      >
        <div class="step-number">
          <i class="fa fa-save"></i>
        </div>
        <div class="step-label">Salvar</div>
      </div>
    </div>

    <!-- Botões de navegação -->
    <div class="stepper-navigation mt-3">
      <button 
        v-if="etapaAtual > 1" 
        class="btn btn-outline-secondary btn-sm"
        @click="voltarEtapa"
      >
        <i class="fa fa-arrow-left me-1"></i>Voltar
      </button>

      <button 
        v-if="etapaAtual < 4" 
        class="btn btn-primary btn-sm ms-auto"
        @click="avancarEtapa"
      >
        Avançar<i class="fa fa-arrow-right ms-1"></i>
      </button>

      <button 
        v-if="etapaAtual === 4" 
        class="btn btn-success btn-sm ms-auto"
        @click="finalizarConfiguracao"
      >
        <i class="fa fa-save me-1"></i>Salvar Configuração
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StepperArmazem',
  props: {
    etapaAtual: {
      type: Number,
      default: 1
    }
  },
  methods: {
    irParaEtapa(numeroEtapa) {
      if (numeroEtapa <= this.etapaAtual || numeroEtapa === this.etapaAtual + 1) {
        this.$emit('mudar-etapa', numeroEtapa)
      }
    },
    voltarEtapa() {
      if (this.etapaAtual > 1) {
        this.$emit('mudar-etapa', this.etapaAtual - 1)
      }
    },
    avancarEtapa() {
      if (this.etapaAtual < 4) {
        this.$emit('mudar-etapa', this.etapaAtual + 1)
      }
    },
    finalizarConfiguracao() {
      this.$emit('finalizar-configuracao')
    }
  }
}
</script>

<style scoped>
.stepper-armazem {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stepper-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 0 auto;
  z-index: 2;
}

.stepper-step:hover:not(.completed) .step-number {
  transform: scale(1.1);
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e9ecef;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  border: 2px solid #e9ecef;
}

.stepper-step.active .step-number {
  background: #06335E;
  color: white;
  border-color: #06335E;
  box-shadow: 0 0 0 4px rgba(6, 51, 94, 0.2);
}

.stepper-step.completed .step-number {
  background: #28a745;
  color: white;
  border-color: #28a745;
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  text-align: center;
  white-space: nowrap;
}

.stepper-step.active .step-label {
  color: #06335E;
  font-weight: 600;
}

.stepper-step.completed .step-label {
  color: #28a745;
}

.stepper-line {
  flex: 1;
  height: 2px;
  background: #e9ecef;
  margin: 0 0.5rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
}

.stepper-line.completed {
  background: #28a745;
}

.stepper-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

@media (max-width: 576px) {
  .step-label {
    font-size: 0.75rem;
  }

  .step-number {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }

  .stepper-line {
    margin: 0 0.25rem;
    margin-bottom: 1.5rem;
  }
}
</style>
