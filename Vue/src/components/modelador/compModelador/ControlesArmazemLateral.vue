<template>
  <div class="card-body p-2">
    <!-- Seção: Dimensões da Lateral -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-arrows-alt me-1"></i> Dimensões da Lateral</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-cube me-1"></i>Profundidade:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="100" 
          max="400"
          v-model.number="configArmazem.pb"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="100" 
          max="400"
          v-model.number="configArmazem.pb"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-h me-1"></i>Largura Base:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="200" 
          max="600"
          v-model.number="configArmazem.lb"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="200" 
          max="600"
          v-model.number="configArmazem.lb"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-v me-1"></i>Altura Base:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="10" 
          max="80"
          v-model.number="configArmazem.hb"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="10" 
          max="80"
          v-model.number="configArmazem.hb"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-home me-1"></i>Altura Telhado:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="10" 
          max="100"
          v-model.number="configArmazem.ht"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="10" 
          max="100"
          v-model.number="configArmazem.ht"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-text-width me-1"></i>Espessura Lateral:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="5" 
          max="40"
          v-model.number="configArmazem.le"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="5" 
          max="40"
          v-model.number="configArmazem.le"
          @change="$emit('armazem-change')"
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
          v-model.number="configArmazem.escala_sensores"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="8" 
          max="32"
          v-model.number="configArmazem.escala_sensores"
          @change="$emit('armazem-change')"
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
          v-model.number="configArmazem.dist_y_sensores"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="5" 
          max="25"
          v-model.number="configArmazem.dist_y_sensores"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-h me-1"></i>Distância X entre Sensores:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="-10" 
          max="10"
          v-model.number="configArmazem.dist_x_sensores"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="-10" 
          max="10"
          v-model.number="configArmazem.dist_x_sensores"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <!-- Seção: Posicionamento -->
    <h6 class="mb-3" style="color: #06335E;"><i class="fa fa-bullseye me-1"></i> Posicionamento</h6>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-h me-1"></i>Posição Horizontal:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="-50" 
          max="50"
          v-model.number="configArmazem.posicao_horizontal"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="-50" 
          max="50"
          v-model.number="configArmazem.posicao_horizontal"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-arrows-v me-1"></i>Posição Vertical:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="-50" 
          max="50"
          v-model.number="configArmazem.posicao_vertical"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="-50" 
          max="50"
          v-model.number="configArmazem.posicao_vertical"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>

    <div class="mb-3">
      <label class="form-label small fw-bold">
        <i class="fa fa-level-up me-1"></i>Afastamento Vertical Pêndulo:
      </label>
      <div class="d-flex align-items-center gap-2">
        <input 
          type="range" 
          class="form-range flex-grow-1" 
          min="-30" 
          max="30"
          v-model.number="configArmazem.afastamento_vertical_pendulo"
          @input="$emit('armazem-change')"
        />
        <input 
          type="number" 
          class="form-control form-control-sm text-center" 
          style="width: 80px;"
          min="-30" 
          max="30"
          v-model.number="configArmazem.afastamento_vertical_pendulo"
          @change="$emit('armazem-change')"
        />
        <span class="small">px</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlesArmazemLateral',
  props: {
    configArmazem: {
      type: Object,
      required: true
    }
  },
  emits: ['armazem-change'],
  methods: {
    resetField(field, defaultValue) {
      this.configArmazem[field] = defaultValue
      this.$emit('armazem-change')
    }
  }
}
</script>
