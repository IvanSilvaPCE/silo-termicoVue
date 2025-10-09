<template>
  <div class="card-body p-2">
    <!-- Card de Quantidades -->
    <div class="mb-3 border rounded p-2">
      <label class="form-label small fw-bold mb-2">
        <i class="fa fa-hashtag me-1"></i>Quantidades
      </label>
      
      <!-- Quantidade de Células -->
      <div class="mb-3">
        <label class="form-label small">Células:</label>
        <div class="d-flex align-items-center gap-2">
          <button 
            type="button" 
            class="btn btn-outline-secondary btn-sm"
            @click="alterarQuantidadeCelulas(-1)"
            :disabled="configTopo.quantidadeCelulas <= 1"
          >
            <i class="fa fa-minus"></i>
          </button>
          
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="max-width: 80px;"
            v-model.number="configTopo.quantidadeCelulas"
            @change="onQuantidadeCelulasChange"
            min="1" 
            max="10"
          />
          
          <button 
            type="button" 
            class="btn btn-outline-secondary btn-sm"
            @click="alterarQuantidadeCelulas(1)"
            :disabled="configTopo.quantidadeCelulas >= 10"
          >
            <i class="fa fa-plus"></i>
          </button>
          
          <span class="small text-muted">(1-10)</span>
        </div>
      </div>

      <!-- Informação dos Modelos de Arco -->
      <div class="mb-3">
        <label class="form-label small">Modelos de Arco Configurados:</label>
        <div class="alert alert-light p-2 mb-2">
          <i class="fa fa-info-circle me-1"></i>
          <strong>{{ quantidadeModelosArcos }}</strong> modelo{{ quantidadeModelosArcos > 1 ? 's' : '' }} configurado{{ quantidadeModelosArcos > 1 ? 's' : '' }} na vista lateral
        </div>
      </div>

      <!-- Quantidade Total de Arcos -->
      <div class="mb-3">
        <label class="form-label small">Total de Arcos:</label>
        <div class="input-group input-group-sm">
          <button 
            type="button" 
            class="btn btn-outline-secondary"
            @click="alterarTotalArcos(-1)"
            :disabled="configTopo.totalArcos <= quantidadeModelosArcos"
          >
            <i class="fa fa-minus"></i>
          </button>
          
          <input 
            type="number" 
            class="form-control text-center" 
            v-model.number="configTopo.totalArcos"
            @change="onTotalArcosChange"
            :min="quantidadeModelosArcos" 
            max="100"
          />
          
          <button 
            type="button" 
            class="btn btn-outline-secondary"
            @click="alterarTotalArcos(1)"
            :disabled="configTopo.totalArcos >= 100"
          >
            <i class="fa fa-plus"></i>
          </button>
        </div>
        <small class="text-muted">Mínimo: {{ quantidadeModelosArcos }} (modelos configurados)</small>
      </div>

      <!-- Quantidade Total de Pêndulos -->
      <div class="mb-3">
        <label class="form-label small">Total de Pêndulos:</label>
        <div class="input-group input-group-sm">
          <button 
            type="button" 
            class="btn btn-outline-secondary"
            @click="alterarTotalPendulos(-1)"
            :disabled="configTopo.totalPendulos <= 1"
          >
            <i class="fa fa-minus"></i>
          </button>
          
          <input 
            type="number" 
            class="form-control text-center" 
            v-model.number="configTopo.totalPendulos"
            @change="onTotalPendulosChange"
            min="1" 
            max="200"
          />
          
          <button 
            type="button" 
            class="btn btn-outline-secondary"
            @click="alterarTotalPendulos(1)"
            :disabled="configTopo.totalPendulos >= 200"
          >
            <i class="fa fa-plus"></i>
          </button>
        </div>
        <small class="text-muted">Total de pêndulos no armazém</small>
      </div>
    </div>

    <!-- Card de Separação de Arcos -->
    <div class="mb-3 border rounded p-2">
      <label class="form-label small fw-bold mb-2">
        <i class="fa fa-exchange me-1"></i>Separação de Arcos
      </label>
      
      <!-- Lógica de Distribuição -->
      <div class="mb-3">
        <label class="form-label small">Lógica de Distribuição:</label>
        <div class="alert alert-info p-2 mb-2">
          <small>
            <i class="fa fa-lightbulb-o me-1"></i>
            Com <strong>{{ quantidadeModelosArcos }} modelo{{ quantidadeModelosArcos > 1 ? 's' : '' }}</strong>:
            <ul class="mb-0 mt-1 ps-3" v-if="quantidadeModelosArcos >= 3">
              <li>{{ configTopo.arcosFrente }} Arco Frente</li>
              <li>{{ configTopo.arcosParImpar }} Arcos Par/Ímpar</li>
              <li>{{ configTopo.arcosFundo }} Arco Fundo</li>
            </ul>
            <ul class="mb-0 mt-1 ps-3" v-else>
              <li>Total: {{ configTopo.totalArcos }} arco{{ configTopo.totalArcos > 1 ? 's' : '' }}</li>
              <li v-if="quantidadeModelosArcos < 3"><em>Configure 3+ modelos para distribuição frente/par-ímpar/fundo</em></li>
            </ul>
          </small>
        </div>
      </div>

      <!-- Distribuição Manual (se necessário) -->
      <div v-if="quantidadeModelosArcos >= 3" class="mb-3">
        <label class="form-label small">Distribuição Detalhada:</label>
        
        <div class="row g-2">
          <div class="col-4">
            <label class="form-label small">Frente:</label>
            <input 
              type="number" 
              class="form-control form-control-sm text-center" 
              v-model.number="configTopo.arcosFrente"
              @change="onDistribuicaoChange"
              min="1"
              :max="configTopo.totalArcos - 1"
            />
          </div>
          
          <div class="col-4">
            <label class="form-label small">Par/Ímpar:</label>
            <input 
              type="number" 
              class="form-control form-control-sm text-center" 
              v-model.number="configTopo.arcosParImpar"
              @change="onDistribuicaoChange"
              min="0"
              :max="configTopo.totalArcos - 2"
            />
          </div>
          
          <div class="col-4">
            <label class="form-label small">Fundo:</label>
            <input 
              type="number" 
              class="form-control form-control-sm text-center" 
              v-model.number="configTopo.arcosFundo"
              @change="onDistribuicaoChange"
              min="1"
              :max="configTopo.totalArcos - 1"
            />
          </div>
        </div>
        
        <small class="text-muted d-block mt-1">
          Total: {{ configTopo.arcosFrente + configTopo.arcosParImpar + configTopo.arcosFundo }}
        </small>
      </div>
    </div>

    <!-- Card de Ajuste de Distâncias -->
    <div class="mb-3 border rounded p-2">
      <label class="form-label small fw-bold mb-2">
        <i class="fa fa-arrows-h me-1"></i>Ajuste de Distâncias
      </label>
      
      <!-- Largura entre Arcos -->
      <div class="mb-3">
        <label class="form-label small">
          Largura entre Arcos:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="10" 
            max="100" 
            step="5"
            v-model.number="configTopo.larguraEntreArcos"
            @input="onLarguraArcosChange"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 70px;"
            min="10" 
            max="100"
            v-model.number="configTopo.larguraEntreArcos"
            @change="onLarguraArcosChange"
          />
          <span class="small">px</span>
        </div>
      </div>

      <!-- Distância Vertical -->
      <div class="mb-3">
        <label class="form-label small">
          Distância Vertical:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="0" 
            max="50" 
            step="5"
            v-model.number="configTopo.distanciaVertical"
            @input="onDistanciaVerticalChange"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 70px;"
            min="0" 
            max="50"
            v-model.number="configTopo.distanciaVertical"
            @change="onDistanciaVerticalChange"
          />
          <span class="small">px</span>
        </div>
      </div>

      <!-- Separação Horizontal -->
      <div class="mb-3">
        <label class="form-label small">
          Separação Horizontal:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="0" 
            max="100" 
            step="5"
            v-model.number="configTopo.separacaoHorizontal"
            @input="onSeparacaoHorizontalChange"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 70px;"
            min="0" 
            max="100"
            v-model.number="configTopo.separacaoHorizontal"
            @change="onSeparacaoHorizontalChange"
          />
          <span class="small">px</span>
        </div>
      </div>
    </div>

    <!-- Botão de Reset -->
    <div class="mt-3">
      <button 
        type="button" 
        class="btn btn-outline-warning btn-sm w-100"
        @click="resetarControlesTopo"
      >
        <i class="fa fa-refresh me-1"></i>Resetar Controles do Topo
      </button>
    </div>

    <!-- Informação de Arrastar Manual -->
    <div class="alert alert-info p-2 mt-3 mb-0">
      <i class="fa fa-hand-pointer-o me-1"></i>
      <small>
        <strong>Dica:</strong> Você também pode arrastar arcos e pêndulos manualmente na visualização do topo.
      </small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlesArmazemTopo',
  props: {
    quantidadeModelosArcos: {
      type: Number,
      default: 1
    },
    configTopo: {
      type: Object,
      default: () => ({
        quantidadeCelulas: 2,
        totalArcos: 1,
        totalPendulos: 1,
        arcosFrente: 1,
        arcosParImpar: 0,
        arcosFundo: 1,
        larguraEntreArcos: 50,
        distanciaVertical: 20,
        separacaoHorizontal: 30
      })
    }
  },
  emits: [
    'update:configTopo',
    'quantidade-celulas-change',
    'total-arcos-change',
    'total-pendulos-change',
    'distribuicao-change',
    'largura-arcos-change',
    'distancia-vertical-change',
    'separacao-horizontal-change',
    'resetar-topo'
  ],
  methods: {
    alterarQuantidadeCelulas(delta) {
      const novaQuantidade = Math.max(1, Math.min(10, this.configTopo.quantidadeCelulas + delta))
      this.configTopo.quantidadeCelulas = novaQuantidade
      this.onQuantidadeCelulasChange()
    },

    onQuantidadeCelulasChange() {
      this.$emit('quantidade-celulas-change', this.configTopo.quantidadeCelulas)
      this.$emit('update:configTopo', this.configTopo)
    },

    alterarTotalArcos(delta) {
      const novoTotal = Math.max(this.quantidadeModelosArcos, Math.min(100, this.configTopo.totalArcos + delta))
      this.configTopo.totalArcos = novoTotal
      this.onTotalArcosChange()
    },

    onTotalArcosChange() {
      if (this.configTopo.totalArcos < this.quantidadeModelosArcos) {
        this.configTopo.totalArcos = this.quantidadeModelosArcos
      }
      this.$emit('total-arcos-change', this.configTopo.totalArcos)
      this.$emit('update:configTopo', this.configTopo)
    },

    alterarTotalPendulos(delta) {
      const novoTotal = Math.max(1, Math.min(200, this.configTopo.totalPendulos + delta))
      this.configTopo.totalPendulos = novoTotal
      this.onTotalPendulosChange()
    },

    onTotalPendulosChange() {
      this.$emit('total-pendulos-change', this.configTopo.totalPendulos)
      this.$emit('update:configTopo', this.configTopo)
    },

    onDistribuicaoChange() {
      this.$emit('distribuicao-change', {
        frente: this.configTopo.arcosFrente,
        parImpar: this.configTopo.arcosParImpar,
        fundo: this.configTopo.arcosFundo
      })
      this.$emit('update:configTopo', this.configTopo)
    },

    onLarguraArcosChange() {
      this.$emit('largura-arcos-change', this.configTopo.larguraEntreArcos)
      this.$emit('update:configTopo', this.configTopo)
    },

    onDistanciaVerticalChange() {
      this.$emit('distancia-vertical-change', this.configTopo.distanciaVertical)
      this.$emit('update:configTopo', this.configTopo)
    },

    onSeparacaoHorizontalChange() {
      this.$emit('separacao-horizontal-change', this.configTopo.separacaoHorizontal)
      this.$emit('update:configTopo', this.configTopo)
    },

    resetarControlesTopo() {
      this.configTopo.quantidadeCelulas = 2
      this.configTopo.totalArcos = Math.max(1, this.quantidadeModelosArcos)
      this.configTopo.totalPendulos = 1
      this.configTopo.larguraEntreArcos = 50
      this.configTopo.distanciaVertical = 20
      this.configTopo.separacaoHorizontal = 30
      
      // Distribuição segura baseada na quantidade de modelos
      if (this.quantidadeModelosArcos >= 3) {
        this.configTopo.arcosFrente = 1
        this.configTopo.arcosFundo = 1
        this.configTopo.arcosParImpar = Math.max(0, this.configTopo.totalArcos - 2)
      } else if (this.quantidadeModelosArcos === 2) {
        this.configTopo.arcosFrente = 1
        this.configTopo.arcosFundo = 1
        this.configTopo.arcosParImpar = Math.max(0, this.configTopo.totalArcos - 2)
      } else {
        // Com 0 ou 1 modelo, usar distribuição simples
        this.configTopo.arcosFrente = Math.min(1, this.configTopo.totalArcos)
        this.configTopo.arcosFundo = Math.max(0, this.configTopo.totalArcos - 1)
        this.configTopo.arcosParImpar = 0
      }
      
      this.$emit('resetar-topo')
      this.$emit('update:configTopo', this.configTopo)
    }
  }
}
</script>

<style scoped>
.form-label {
  margin-bottom: 0.25rem;
}

.form-control-sm {
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.border {
  border-color: #dee2e6 !important;
}

.alert {
  margin-bottom: 0;
}

.form-range {
  height: 1.5rem;
}
</style>
