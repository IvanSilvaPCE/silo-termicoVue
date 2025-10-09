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
      <div class="mb-3">
        <label class="form-label small fw-bold">
          <i class="fa fa-sort-numeric-asc me-1"></i>Número de Aeradores:
        </label>
        <div class="d-flex align-items-center gap-2">
          <input 
            type="range" 
            class="form-range flex-grow-1" 
            min="1" 
            max="8"
            v-model.number="configSilo.na"
            @input="$emit('silo-change')"
          />
          <input 
            type="number" 
            class="form-control form-control-sm text-center" 
            style="width: 80px;"
            min="1" 
            max="8"
            v-model.number="configSilo.na"
            @change="$emit('silo-change')"
          />
        </div>
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
}
</script>
