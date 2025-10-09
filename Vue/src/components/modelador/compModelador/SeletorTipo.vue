<template>
  <div class="mb-3">
    <label class="form-label fw-bold mb-2" style="color: #06335E;">
      <i class="fa fa-building me-1"></i>
      Tipo de Estrutura:
    </label>
    <div class="tipo-selector">
      <div 
        class="tipo-option" 
        :class="{ 'active': value === 'silo' }"
        @click="selectTipo('silo')"
        role="button"
        tabindex="0"
        @keydown.enter="selectTipo('silo')"
        @keydown.space.prevent="selectTipo('silo')"
      >
        <div class="tipo-icon">
          <i class="fa fa-circle-o"></i>
        </div>
        <div class="tipo-info">
          <div class="tipo-title">Silo</div>
          <div class="tipo-description">Estrutura cilíndrica</div>
        </div>
        <div class="tipo-check" v-if="value === 'silo'">
          <i class="fa fa-check-circle"></i>
        </div>
      </div>

      <div 
        class="tipo-option" 
        :class="{ 'active': value === 'armazem' }"
        @click="selectTipo('armazem')"
        role="button"
        tabindex="0"
        @keydown.enter="selectTipo('armazem')"
        @keydown.space.prevent="selectTipo('armazem')"
      >
        <div class="tipo-icon">
          <i class="fa fa-th-large"></i>
        </div>
        <div class="tipo-info">
          <div class="tipo-title">Armazém</div>
          <div class="tipo-description">Estrutura retangular</div>
        </div>
        <div class="tipo-check" v-if="value === 'armazem'">
          <i class="fa fa-check-circle"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SeletorTipo',
  props: {
    value: String
  },
  methods: {
    selectTipo(tipo) {
      if (this.value !== tipo) {
        this.$emit('input', tipo)
      }
    }
  }
}
</script>

<style scoped>
.tipo-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tipo-option {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tipo-option:hover {
  border-color: #06335E;
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tipo-option.active {
  border-color: #06335E;
  background-color: #e7f1ff;
  box-shadow: 0 2px 8px rgba(6, 51, 94, 0.2);
}

.tipo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 8px;
  background-color: #f0f0f0;
  color: #06335E;
  font-size: 20px;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.tipo-option.active .tipo-icon {
  background-color: #06335E;
  color: #fff;
}

.tipo-info {
  flex: 1;
}

.tipo-title {
  font-weight: 600;
  font-size: 16px;
  color: #06335E;
  margin-bottom: 2px;
}

.tipo-description {
  font-size: 12px;
  color: #6c757d;
}

.tipo-check {
  color: #28a745;
  font-size: 20px;
  margin-left: 10px;
  animation: checkIn 0.3s ease;
}

@keyframes checkIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Mobile responsive */
@media (max-width: 576px) {
  .tipo-option {
    padding: 10px 12px;
  }

  .tipo-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin-right: 10px;
  }

  .tipo-title {
    font-size: 14px;
  }

  .tipo-description {
    font-size: 11px;
  }
}
</style>
