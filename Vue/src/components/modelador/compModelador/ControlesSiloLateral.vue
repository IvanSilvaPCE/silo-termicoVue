<template>
  <div class="card-body p-2">
    <!-- Seção: Dimensões da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-arrows-alt me-1"></i> Dimensões da Lateral</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-h me-1"></i>Largura da Base:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="100" 
          max="400"
          v-model.number="configSilo.lb"
          @input="$emit('silo-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="100" 
          max="400"
          v-model.number="configSilo.lb"
          @change="$emit('silo-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-v me-1"></i>Altura do Silo:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="100" 
          max="300"
          v-model.number="configSilo.hs"
          @input="$emit('silo-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="100" 
          max="300"
          v-model.number="configSilo.hs"
          @change="$emit('silo-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-v me-1"></i>Altura da Base:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="5" 
          max="30"
          v-model.number="configSilo.hb"
          @input="$emit('silo-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="5" 
          max="30"
          v-model.number="configSilo.hb"
          @change="$emit('silo-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-text-width me-1"></i>Espessura da Base:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="2" 
          max="15"
          v-model.number="configSilo.eb"
          @input="$emit('silo-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="2" 
          max="15"
          v-model.number="configSilo.eb"
          @change="$emit('silo-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <!-- Seção: Sensores da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-wifi me-1"></i> Sensores da Lateral</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-expand me-1"></i>Escala dos Sensores:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="8" 
          max="32"
          v-model.number="configSilo.escala_sensores"
          @input="$emit('silo-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="8" 
          max="32"
          v-model.number="configSilo.escala_sensores"
          @change="$emit('silo-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-v me-1"></i>Distância Y entre Sensores:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="5" 
          max="25"
          v-model.number="configSilo.dist_y_sensores"
          @input="$emit('silo-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="5" 
          max="25"
          v-model.number="configSilo.dist_y_sensores"
          @change="$emit('silo-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <!-- Seção: Aeradores da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-fan me-1"></i> Aeradores da Lateral</h6>

    <div class="form-check mb-3">
      <input class="form-check-input" type="checkbox" v-model="configSilo.aeradores_ativo" id="aeradoresAtivoLateral"
        @change="$emit('silo-change')" />
      <label class="form-check-label small" for="aeradoresAtivoLateral">
        <i class="fa fa-power-off me-1"></i> Ativar Aeradores
      </label>
    </div>

    <template v-if="configSilo.aeradores_ativo">
      <!-- Quantidade de Aeradores (mínimo 4) -->
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-sort-numeric-asc me-1"></i>Quantidade de Aeradores (mín. 4)
        </label>
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="ajustarQuantidade(-1)">
            -
          </button>
          <input
            type="number"
            class="form-control form-control-sm text-center"
            style="width: 90px;"
            :min="4"
            :max="24"
            v-model.number="configSilo.na"
            @change="onNaInputChange"
          />
          <button type="button" class="btn btn-outline-secondary btn-sm" @click="ajustarQuantidade(1)">
            +
          </button>
        </div>
      </div>

      <!-- Distribuição dos Aeradores: Esquerda x Direita -->
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-exchange me-1"></i>Distribuição dos Aeradores (arraste para os lados)
        </label>
        <div class="row g-2">
          <div class="col-6">
            <div class="border rounded p-2" style="min-height: 120px; background:#f9fafb;">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <strong class="small">Esquerda</strong>
                <small class="text-muted">{{ lados.esquerda.length }}</small>
              </div>
              <div 
                class="d-flex flex-wrap gap-2"
                @dragover.prevent
                @drop="onDrop('esquerda')"
                data-dropzone="esquerda"
              >
                <span
                  v-for="id in lados.esquerda"
                  :key="`ae_esq_${id}`"
                  class="badge bg-primary"
                  draggable="true"
                  @dragstart="onDragStart(id, 'esquerda')"
                >
                  AE-{{ id }}
                </span>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="border rounded p-2" style="min-height: 120px; background:#f9fafb;">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <strong class="small">Direita</strong>
                <small class="text-muted">{{ lados.direita.length }}</small>
              </div>
              <div 
                class="d-flex flex-wrap gap-2"
                @dragover.prevent
                @drop="onDrop('direita')"
                data-dropzone="direita"
              >
                <span
                  v-for="id in lados.direita"
                  :key="`ae_dir_${id}`"
                  class="badge bg-primary"
                  draggable="true"
                  @dragstart="onDragStart(id, 'direita')"
                >
                  AE-{{ id }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <small class="text-muted d-block mt-2">
          Dica: arraste AE-1, AE-2, ... para o lado desejado. A ordem é livre; apenas o lado importa.
        </small>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-arrows-h me-1"></i>Distância Horizontal:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="-50" 
            max="100"
            v-model.number="configSilo.ds"
            @input="$emit('silo-change')"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="-50" 
            max="100"
            v-model.number="configSilo.ds"
            @change="$emit('silo-change')"
          />
          <span class="small">px</span>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-arrows-v me-1"></i>Distância Vertical:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="-50" 
            max="50"
            v-model.number="configSilo.dy"
            @input="$emit('silo-change')"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="-50" 
            max="50"
            v-model.number="configSilo.dy"
            @change="$emit('silo-change')"
          />
          <span class="small">px</span>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-arrows-h me-1"></i>Espaçamento entre Aeradores:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="10" 
            max="80"
            v-model.number="configSilo.da"
            @input="$emit('silo-change')"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="10" 
            max="80"
            v-model.number="configSilo.da"
            @change="$emit('silo-change')"
          />
          <span class="small">px</span>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-rotate-right me-1"></i>Rotação dos Aeradores:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="0" 
            max="360"
            v-model.number="configSilo.aerador_rotacao"
            @input="$emit('silo-change')"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="0" 
            max="360"
            v-model.number="configSilo.aerador_rotacao"
            @change="$emit('silo-change')"
          />
          <span class="small">°</span>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-expand me-1"></i>Escala dos Aeradores:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="0.5" 
            max="2" 
            step="0.1"
            v-model.number="configSilo.aerador_escala"
            @input="$emit('silo-change')"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="0.5" 
            max="2"
            step="0.1"
            v-model.number="configSilo.aerador_escala"
            @change="$emit('silo-change')"
          />
          <span class="small">x</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'ControlesSiloLateral',
  props: {
    configSilo: {
      type: Object,
      required: true
    }
  },
  emits: ['silo-change', 'reset-field']
  ,
  data() {
    return {
      drag: { id: null, origem: null }
    }
  },
  computed: {
    lados() {
      // Garante estrutura reativa e padrão
      if (!this.configSilo.aeradores_lados) {
        this.$set(this.configSilo, 'aeradores_lados', { esquerda: [], direita: [] })
      }
      return this.configSilo.aeradores_lados
    }
  },
  mounted() {
    // Inicializa listas se estiverem vazias.
    this.initLadosIfNeeded()
  },
  watch: {
    'configSilo.aeradores_ativo'(val) {
      if (val) this.initLadosIfNeeded()
    }
  },
  methods: {
    initLadosIfNeeded() {
      const lados = this.lados
      if ((lados.esquerda?.length || 0) + (lados.direita?.length || 0) === 0) {
        // Distribui automaticamente 1..na alternando entre os lados
        const total = Number(this.configSilo.na || 4)
        const esquerda = []
        const direita = []
        for (let i = 1; i <= total; i++) {
          if (i % 2 === 1) esquerda.push(i)
          else direita.push(i)
        }
        this.$set(this.configSilo, 'aeradores_lados', { esquerda, direita })
        this.$emit('silo-change')
      }
    },
    ajustarQuantidade(delta) {
      const atual = Number(this.configSilo.na || 0)
      let novo = atual + delta
      if (isNaN(novo)) novo = 4
      if (novo < 4) novo = 4
      if (novo > 24) novo = 24
      this.configSilo.na = novo
      this.sincronizarListasComNA()
    },
    onNaInputChange() {
      let valor = Number(this.configSilo.na || 0)
      if (isNaN(valor) || valor < 4) valor = 4
      if (valor > 24) valor = 24
      this.configSilo.na = valor
      this.sincronizarListasComNA()
    },
    sincronizarListasComNA() {
      // Garante que as listas reflitam os IDs de 1..na (mín. 4)
      const na = Math.max(4, Number(this.configSilo.na || 4))
      const idsDesejados = new Set(Array.from({ length: na }, (_, i) => i + 1))

      const esquerda = Array.isArray(this.lados.esquerda) ? [...this.lados.esquerda] : []
      const direita = Array.isArray(this.lados.direita) ? [...this.lados.direita] : []

      // Remove duplicados e fora do range
      const limpar = (arr) => {
        const vistos = new Set()
        return arr.filter(id => {
          const ok = idsDesejados.has(id) && !vistos.has(id)
          if (ok) vistos.add(id)
          return ok
        })
      }
      let esq = limpar(esquerda)
      let dir = limpar(direita)

      // Coletar faltantes
      const presentes = new Set([...esq, ...dir])
      const faltantes = [...idsDesejados].filter(id => !presentes.has(id))

      // Distribuir faltantes balanceando: lado com menos itens recebe o próximo
      faltantes.forEach(id => {
        if (esq.length <= dir.length) esq.push(id)
        else dir.push(id)
      })

      this.$set(this.configSilo, 'aeradores_lados', { esquerda: esq, direita: dir })
      this.$emit('silo-change')
    },
    onDragStart(id, origem) {
      this.drag.id = id
      this.drag.origem = origem
    },
    onDrop(destino) {
      const { id, origem } = this.drag
      if (!id || !origem || destino === origem) return
      // Remove do array de origem
      const idx = this.lados[origem].indexOf(id)
      if (idx !== -1) this.lados[origem].splice(idx, 1)
      // Adiciona ao array de destino
      this.lados[destino].push(id)
      // Limpa estado de drag e emite mudança
      this.drag.id = null
      this.drag.origem = null
      this.$emit('silo-change')
    }
  }
}
</script>
