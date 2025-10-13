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
          <i class="fa fa-compass me-2"></i>
          <span class="fw-bold">Controles do Topo</span>
        </div>
        <i :class="['fa', acordeonAberto ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </div>
    </div>
    <div v-show="acordeonAberto" class="card-body">
      <div class="section-progress">
        <div class="section-progress-title">Vista do Topo - Ajustes Finais</div>
        <div class="section-progress-description">Configure a rotação e o afastamento dos pêndulos</div>
      </div>
      
      <!-- Rotação do Fundo -->
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-rotate-right me-1"></i>Rotação do Fundo:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="0" 
            max="360" 
            step="1"
            :value="configSilo.rotacaoFundo"
            @input="onRotacaoFundoInput"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="0" 
            max="360"
            :value="configSilo.rotacaoFundo"
            @change="onRotacaoFundoChange"
          />
          <span class="small">°</span>
        </div>
        <small class="text-muted">Rotaciona apenas o fundo, mantendo os pêndulos fixos</small>
      </div>

      <!-- Rotação Global dos Pêndulos -->
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-sync me-1"></i>Rotação dos Pêndulos:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="0" 
            max="360" 
            step="1"
            :value="configSilo.rotacaoPendulos"
            @input="onRotacaoPendulosInput"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="0" 
            max="360"
            :value="configSilo.rotacaoPendulos"
            @change="onRotacaoPendulosChange"
          />
          <span class="small">°</span>
        </div>
        <small class="text-muted">Rotaciona todos os pêndulos (independente do fundo)</small>
      </div>

      <!-- Afastamento por Camada -->
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-arrows-h me-1"></i>Afastamento por Camada:
        </label>
        
        <!-- Lateral -->
        <div class="mb-2">
          <label class="small mb-1" style="color: #FF6B35; font-weight: 600;">
            <i class="fa fa-circle me-1"></i>Lateral:
          </label>
          <div class="d-flex align-items-center gap-2">
            <input 
              type="range" 
              class="form-range flex-grow-1" 
              min="0.3" 
              max="1.5" 
              step="0.05"
              :value="configSilo.afastamentoLateral"
              @input="onAfastamentoLateralInput"
            />
            <input 
              type="number" 
              class="form-control form-control-sm text-center" 
              style="width: 70px;"
              min="0.3" 
              max="1.5"
              step="0.05"
              :value="configSilo.afastamentoLateral"
              @change="onAfastamentoLateralChange"
            />
            <span class="small">x</span>
          </div>
        </div>

        <!-- Central -->
        <div class="mb-2">
          <label class="small mb-1" style="color: #3A78FD; font-weight: 600;">
            <i class="fa fa-circle me-1"></i>Central:
          </label>
          <div class="d-flex align-items-center gap-2">
            <input 
              type="range" 
              class="form-range flex-grow-1" 
              min="0.3" 
              max="1.5" 
              step="0.05"
              :value="configSilo.afastamentoCentral"
              @input="onAfastamentoCentralInput"
            />
            <input 
              type="number" 
              class="form-control form-control-sm text-center" 
              style="width: 70px;"
              min="0.3" 
              max="1.5"
              step="0.05"
              :value="configSilo.afastamentoCentral"
              @change="onAfastamentoCentralChange"
            />
            <span class="small">x</span>
          </div>
        </div>

        <!-- Intermediário -->
        <div class="mb-2">
          <label class="small mb-1" style="color: #4ECDC4; font-weight: 600;">
            <i class="fa fa-circle me-1"></i>Intermediário:
          </label>
          <div class="d-flex align-items-center gap-2">
            <input 
              type="range" 
              class="form-range flex-grow-1" 
              min="0.3" 
              max="1.5" 
              step="0.05"
              :value="configSilo.afastamentoIntermediario"
              @input="onAfastamentoIntermediarioInput"
            />
            <input 
              type="number" 
              class="form-control form-control-sm text-center" 
              style="width: 70px;"
              min="0.3" 
              max="1.5"
              step="0.05"
              :value="configSilo.afastamentoIntermediario"
              @change="onAfastamentoIntermediarioChange"
            />
            <span class="small">x</span>
          </div>
        </div>
        
        <small class="text-muted">Ajuste a distância de cada camada do centro</small>
      </div>

      <!-- Tamanho dos Círculos -->
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-circle-o me-1"></i>Tamanho dos Círculos:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="3" 
            max="15" 
            step="0.5"
            :value="configSilo.tamanhoCirculoPendulo"
            @input="onTamanhoCirculoInput"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 70px;"
            min="3" 
            max="15"
            step="0.5"
            :value="configSilo.tamanhoCirculoPendulo"
            @change="onTamanhoCirculoChange"
          />
        </div>
        <small class="text-muted">Ajuste o raio dos círculos dos pêndulos</small>
      </div>

      <!-- Espessura da Borda -->
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-square-o me-1"></i>Espessura da Borda:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="0" 
            max="5" 
            step="0.5"
            :value="configSilo.espessuraBordaCirculo"
            @input="onEspessuraBordaInput"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 70px;"
            min="0" 
            max="5"
            step="0.5"
            :value="configSilo.espessuraBordaCirculo"
            @change="onEspessuraBordaChange"
          />
          <span class="small">px</span>
        </div>
        <small class="text-muted">Ajuste a espessura da borda dos círculos</small>
      </div>

      <!-- Informação sobre movimentação manual -->
      <div class="alert alert-info p-2 mb-0">
        <i class="fa fa-hand-pointer-o me-1"></i>
        <small>
          <strong>Dica:</strong> Você também pode arrastar os pêndulos manualmente na visualização do topo.
        </small>
      </div>

      <!-- Botão de reset -->
      <div class="mt-3">
        <button 
          type="button" 
          class="btn btn-outline-warning btn-sm w-100"
          @click="$emit('resetar-controles-topo')"
        >
          <i class="fa fa-refresh me-1"></i>Resetar Controles do Topo
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SiloTopoControles',
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
  methods: {
    onRotacaoFundoInput(event) {
      this.$emit('rotacao-fundo-change', parseFloat(event.target.value))
    },
    onRotacaoFundoChange(event) {
      this.$emit('rotacao-fundo-change', parseFloat(event.target.value))
    },
    onRotacaoPendulosInput(event) {
      this.$emit('rotacao-pendulos-change', parseFloat(event.target.value))
    },
    onRotacaoPendulosChange(event) {
      this.$emit('rotacao-pendulos-change', parseFloat(event.target.value))
    },
    onAfastamentoLateralInput(event) {
      this.$emit('afastamento-camada-change', 'lateral', parseFloat(event.target.value))
    },
    onAfastamentoLateralChange(event) {
      this.$emit('afastamento-camada-change', 'lateral', parseFloat(event.target.value))
    },
    onAfastamentoCentralInput(event) {
      this.$emit('afastamento-camada-change', 'central', parseFloat(event.target.value))
    },
    onAfastamentoCentralChange(event) {
      this.$emit('afastamento-camada-change', 'central', parseFloat(event.target.value))
    },
    onAfastamentoIntermediarioInput(event) {
      this.$emit('afastamento-camada-change', 'intermediario', parseFloat(event.target.value))
    },
    onAfastamentoIntermediarioChange(event) {
      this.$emit('afastamento-camada-change', 'intermediario', parseFloat(event.target.value))
    },
    onTamanhoCirculoInput(event) {
      this.$emit('tamanho-circulo-change', parseFloat(event.target.value))
    },
    onTamanhoCirculoChange(event) {
      this.$emit('tamanho-circulo-change', parseFloat(event.target.value))
    },
    onEspessuraBordaInput(event) {
      this.$emit('espessura-borda-change', parseFloat(event.target.value))
    },
    onEspessuraBordaChange(event) {
      this.$emit('espessura-borda-change', parseFloat(event.target.value))
    }
  }
}
</script>
