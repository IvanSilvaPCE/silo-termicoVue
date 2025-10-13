<template>
  <div class="card mb-3">
    <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
         @click="$emit('toggle-acordeon')"
         role="button" 
         tabindex="0"
         :aria-expanded="acordeonAberto"
         @keydown.enter="$emit('toggle-acordeon')"
         @keydown.space.prevent="$emit('toggle-acordeon')">
      <div class="d-flex justify-content-between align-items-center text-white">
        <div class="d-flex align-items-center">
          <i class="fa fa-list me-2"></i>
          <span class="fw-bold">Configuração de Pêndulos</span>
        </div>
        <i :class="['fa', acordeonAberto ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </div>
    </div>
    <div v-show="acordeonAberto" class="card-body p-3" style="max-height: 450px; overflow-y: auto;">
      <!-- Quantidade de Pêndulos -->
      <div class="mb-3">
        <label class="form-label small fw-bold">Quantidade de Pêndulos:</label>
        <div class="input-group">
          <select :value="configSilo.quantidadePendulos" class="form-select" @change="onQuantidadePendulosChange">
            <option v-for="n in 15" :key="n" :value="n">{{ n }} pêndulo{{ n > 1 ? 's' : '' }}</option>
          </select>
          <button type="button" class="btn btn-outline-secondary" @click="resetQuantidadePendulos"
            title="Reset para 5 pêndulos">
            ×
          </button>
        </div>
      </div>

      <!-- Controles por Pêndulo -->
      <div class="mb-3">
        <label class="form-label small fw-bold mb-2">Configuração dos Pêndulos:</label>
        <div class="row g-2">
          <div 
            v-for="numeroPendulo in configSilo.quantidadePendulos" 
            :key="numeroPendulo"
            class="col-12"
          >
            <div class="p-2 border rounded" style="background-color: #f8f9fa;">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="flex-grow-1">
                  <strong class="small">Pêndulo {{ numeroPendulo }}</strong>
                  <div class="text-muted" style="font-size: 0.75rem;">
                    {{ configSilo.sensoresPorPendulo[numeroPendulo] || 5 }} sensor{{ (configSilo.sensoresPorPendulo[numeroPendulo] || 5) > 1 ? 'es' : '' }}
                  </div>
                </div>
                
                <div class="input-group input-group-sm" style="max-width: 120px;">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="alterarSensores(numeroPendulo, -1)"
                    :disabled="(configSilo.sensoresPorPendulo[numeroPendulo] || 5) <= 1"
                    title="Diminuir sensores"
                  >
                    -
                  </button>
                  
                  <input 
                    type="number" 
                    class="form-control form-control-sm text-center"
                    :value="configSilo.sensoresPorPendulo[numeroPendulo] || 5"
                    @change="setSensoresPendulo(numeroPendulo, $event.target.value)"
                    min="1" 
                    max="20"
                  />
                  
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-sm"
                    @click="alterarSensores(numeroPendulo, 1)"
                    :disabled="(configSilo.sensoresPorPendulo[numeroPendulo] || 5) >= 20"
                    title="Aumentar sensores"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Tipo de Posição -->
              <div class="row g-2 mt-1">
                <div class="col-6">
                  <label class="form-label small mb-1" style="font-size: 0.7rem;">Posição:</label>
                  <select 
                    :value="configSilo.tipoPosicaoPendulo[numeroPendulo]"
                    @change="onTipoPosicaoChange(numeroPendulo, $event)"
                    class="form-select form-select-sm"
                    style="font-size: 0.75rem;"
                  >
                    <option value="lateral">Lateral</option>
                    <option value="central">Central</option>
                    <option value="intermediario">Intermediário</option>
                  </select>
                </div>

                <!-- Tipo de Cabo -->
                <div class="col-6">
                  <label class="form-label small mb-1" style="font-size: 0.7rem;">Cabo:</label>
                  <select 
                    :value="configSilo.tipoCaboPendulo[numeroPendulo]"
                    @change="onTipoCaboChange(numeroPendulo, $event)"
                    class="form-select form-select-sm"
                    style="font-size: 0.75rem;"
                  >
                    <option value="analogico">Analógico</option>
                    <option value="digital">Digital</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Controles Globais -->
      <div class="mb-3">
        <div class="row g-2">
          <div class="col-6">
            <button 
              type="button" 
              class="btn btn-outline-success btn-sm w-100"
              @click="aplicarSensoresUniformes"
            >
              <i class="fa fa-bar-chart me-1"></i>Aplicar Uniforme
            </button>
          </div>
          <div class="col-6">
            <button 
              type="button" 
              class="btn btn-outline-warning btn-sm w-100"
              @click="resetarSensoresPadrao"
            >
              <i class="fa fa-refresh me-1"></i>Resetar Padrão
            </button>
          </div>
        </div>
      </div>

      <!-- Resumo -->
      <div class="alert alert-info p-2 mb-0">
        <div class="d-flex align-items-center mb-1">
          <i class="fa fa-info-circle me-2"></i>
          <strong class="small">Resumo da Configuração</strong>
        </div>
        <div style="font-size: 0.8rem;">
          <div><strong>Total:</strong> {{ totalSensores }} sensores em {{ configSilo.quantidadePendulos }} pêndulos</div>
          <div><strong>Média:</strong> {{ mediaSensores.toFixed(1) }} sensores/pêndulo</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PendulosSiloConfig',
  props: {
    configSilo: {
      type: Object,
      required: true
    },
    acordeonAberto: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    totalSensores() {
      let total = 0
      for (let i = 1; i <= (this.configSilo.quantidadePendulos || 5); i++) {
        total += this.configSilo.sensoresPorPendulo[i] || 5
      }
      return total
    },
    mediaSensores() {
      const quantidade = this.configSilo.quantidadePendulos || 5
      return this.totalSensores / quantidade
    }
  },
  methods: {
    onQuantidadePendulosChange(event) {
      const valor = parseInt(event.target.value)
      // Atualiza imediatamente o campo no pai para refletir no preview
      this.$emit('reset-field', 'quantidadePendulos', valor)
      // Mantém o evento específico para lógica complementar do pai
      this.$emit('quantidade-pendulos-change', valor)
    },
    resetQuantidadePendulos() {
      this.$emit('reset-field', 'quantidadePendulos', 5)
    },
    alterarSensores(numeroPendulo, delta) {
      this.$emit('alterar-sensores', numeroPendulo, delta)
    },
    setSensoresPendulo(numeroPendulo, value) {
      this.$emit('set-sensores-pendulo', numeroPendulo, parseInt(value))
    },
    onTipoPosicaoChange(numeroPendulo, event) {
      const valor = event.target.value
      // Atualiza objeto completo no pai para refletir imediatamente
      const novo = { ...(this.configSilo.tipoPosicaoPendulo || {}) }
      novo[numeroPendulo] = valor
      this.$emit('reset-field', 'tipoPosicaoPendulo', novo)
      // Mantém evento específico para qualquer lógica adicional do pai
      this.$emit('tipo-posicao-change', numeroPendulo, valor)
    },
    onTipoCaboChange(numeroPendulo, event) {
      const valor = event.target.value
      const novo = { ...(this.configSilo.tipoCaboPendulo || {}) }
      novo[numeroPendulo] = valor
      this.$emit('reset-field', 'tipoCaboPendulo', novo)
      this.$emit('tipo-cabo-change', numeroPendulo, valor)
    },
    aplicarSensoresUniformes() {
      this.$emit('aplicar-sensores-uniformes')
    },
    resetarSensoresPadrao() {
      this.$emit('resetar-sensores-padrao')
    }
  }
}
</script>
