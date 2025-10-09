<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    xml:space="preserve"
    width="100%"
    height="auto"
    version="1.0"
    :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`"
    :style="{
      maxWidth: '100%',
      maxHeight: isMobile ? '60vh' : 'calc(100vh - 320px)',
      minHeight: isMobile ? '300px' : '400px',
      border: '1px solid #ddd',
      backgroundColor: imagemFundo.url ? 'transparent' : '#f8f9fa',
      borderRadius: '4px',
      shapeRendering: 'geometricPrecision',
      textRendering: 'geometricPrecision',
      imageRendering: 'optimizeQuality',
      position: 'relative',
      zIndex: 2,
      opacity: imagemFundo.url ? opacidadesSvg.geral : 1,
      transition: 'opacity 0.3s ease-in-out'
    }" 
    preserveAspectRatio="xMidYMid meet"
  >
    <!-- Fundo do armazém -->
    <g id="estrutura_armazem" :style="{ opacity: opacidadesSvg.estrutura }">
      <!-- Retângulo de fundo -->
      <rect
        :x="margemX"
        :y="margemY"
        :width="larguraArmazem"
        :height="alturaArmazem"
        fill="#D3D3D3"
        stroke="#999999"
        stroke-width="2"
        rx="5"
        ry="5"
      />

      <!-- Linhas divisórias dos arcos -->
      <g v-for="i in quantidadeArcos - 1" :key="`linha-arco-${i}`">
        <line
          :x1="margemX + (larguraArmazem / quantidadeArcos) * i"
          :y1="margemY"
          :x2="margemX + (larguraArmazem / quantidadeArcos) * i"
          :y2="margemY + alturaArmazem"
          stroke="#999999"
          stroke-width="1"
          stroke-dasharray="5,5"
        />
      </g>

      <!-- Labels dos arcos -->
      <g v-for="i in quantidadeArcos" :key="`label-arco-${i}`">
        <text
          :x="margemX + (larguraArmazem / quantidadeArcos) * (i - 0.5)"
          :y="margemY - 10"
          text-anchor="middle"
          font-size="12"
          font-weight="bold"
          fill="#06335E"
        >
          Arco {{ i }}
        </text>
      </g>
    </g>

    <!-- Pêndulos/Cabos posicionados -->
    <g :style="{ opacity: opacidadesSvg.pendulos }">
      <g 
        v-for="(pendulo, index) in pendulosComPosicao" 
        :key="`pendulo_${index + 1}`" 
        :id="`pendulo_${index + 1}`"
        @mousedown="iniciarDrag($event, pendulo, 'pendulo')"
        style="cursor: move;"
      >
        <!-- Círculo do pêndulo/cabo -->
        <circle 
          :cx="pendulo.x" 
          :cy="pendulo.y" 
          r="8"
          fill="#06335E"
          stroke="#333" 
          stroke-width="1"
          :title="`Pêndulo/Cabo ${pendulo.label}`"
        />

        <!-- Texto do pêndulo -->
        <text 
          :x="pendulo.x" 
          :y="pendulo.y"  
          class="pendulo-text" 
          text-anchor="middle" 
          dominant-baseline="central"
          fill="white"
          font-size="8"
          font-weight="bold"
        >
          {{ pendulo.label }}
        </text>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'ArmazemTopoSvg',
  props: {
    config: {
      type: Object,
      required: true
    },
    modeloAtual: {
      type: [Number, String, null],
      default: null
    },
    quantidadeModelos: {
      type: Number,
      default: 1
    },
    imagemFundo: {
      type: Object,
      default: () => ({ url: null })
    },
    opacidadesSvg: {
      type: Object,
      default: () => ({ geral: 1, pendulos: 1, estrutura: 1 })
    },
    isMobile: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      larguraSVG: 800,
      alturaSVG: 400,
      margemX: 20,
      margemY: 40,
      posicoesManualPendulos: {},
      isDragging: false,
      dragElement: null,
      dragOffset: { x: 0, y: 0 }
    }
  },
  computed: {
    quantidadeArcos() {
      return this.quantidadeModelos || 1
    },
    larguraArmazem() {
      return this.larguraSVG - (this.margemX * 2)
    },
    alturaArmazem() {
      return this.alturaSVG - (this.margemY * 2) - 20
    },
    quantidadePendulos() {
      // Se estiver editando um modelo específico
      if (this.modeloAtual && this.config.modelosArcos && this.config.modelosArcos[this.modeloAtual]) {
        return this.config.modelosArcos[this.modeloAtual].quantidadePendulos || 5
      }
      // Caso contrário, usar total de todos os modelos
      let total = 0
      if (this.config.modelosArcos) {
        Object.values(this.config.modelosArcos).forEach(modelo => {
          total += modelo.quantidadePendulos || 0
        })
      }
      return total || 5
    },
    pendulosComPosicao() {
      const pendulos = []
      
      if (this.modeloAtual) {
        // Modo de edição de modelo específico - mostrar só os pêndulos deste arco
        const modelo = this.config.modelosArcos?.[this.modeloAtual]
        const qtdPendulos = modelo?.quantidadePendulos || 5
        const arcoIndex = parseInt(this.modeloAtual) - 1
        
        for (let i = 1; i <= qtdPendulos; i++) {
          const penduloId = `${this.modeloAtual}_${i}`
          
          if (this.posicoesManualPendulos[penduloId]) {
            pendulos.push({
              label: `${this.modeloAtual}.${i}`,
              id: penduloId,
              x: this.posicoesManualPendulos[penduloId].x,
              y: this.posicoesManualPendulos[penduloId].y
            })
          } else {
            // Posição automática dentro do arco
            const posAuto = this.calcularPosicaoAutomaticaArco(i, qtdPendulos, arcoIndex)
            pendulos.push({
              label: `${this.modeloAtual}.${i}`,
              id: penduloId,
              ...posAuto
            })
          }
        }
      } else {
        // Modo de visualização geral - mostrar todos os pêndulos de todos os arcos
        if (this.config.modelosArcos) {
          Object.keys(this.config.modelosArcos).forEach(arcoNum => {
            const modelo = this.config.modelosArcos[arcoNum]
            const qtdPendulos = modelo?.quantidadePendulos || 0
            const arcoIndex = parseInt(arcoNum) - 1
            
            for (let i = 1; i <= qtdPendulos; i++) {
              const penduloId = `${arcoNum}_${i}`
              
              if (this.posicoesManualPendulos[penduloId]) {
                pendulos.push({
                  label: `${arcoNum}.${i}`,
                  id: penduloId,
                  x: this.posicoesManualPendulos[penduloId].x,
                  y: this.posicoesManualPendulos[penduloId].y
                })
              } else {
                const posAuto = this.calcularPosicaoAutomaticaArco(i, qtdPendulos, arcoIndex)
                pendulos.push({
                  label: `${arcoNum}.${i}`,
                  id: penduloId,
                  ...posAuto
                })
              }
            }
          })
        }
      }
      
      return pendulos
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.handleDrag)
    document.addEventListener('mouseup', this.pararDrag)
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.handleDrag)
    document.removeEventListener('mouseup', this.pararDrag)
  },
  methods: {
    /**
     * 🎯 FORMATAÇÃO AUTOMÁTICA POR NÍVEIS DE SENSORES
     * 
     * Esta função posiciona automaticamente os pêndulos/cabos no topo do armazém,
     * agrupando-os em níveis (topo, meio, fundo) baseado na quantidade de sensores.
     * 
     * Lógica de agrupamento:
     * - Se todos têm a mesma quantidade de sensores → todos no meio
     * - Se há 2 quantidades diferentes → maior no topo, menor no fundo  
     * - Se há 3+ quantidades → maior no topo, menor no fundo, resto no meio
     * 
     * Esta é a mesma lógica do SiloTopoSvg (Silo2D) para manter consistência.
     * Quando o usuário salvar, as posições manuais substituem as automáticas.
     */
    calcularPosicaoAutomaticaArco(indicePendulo, totalPendulos, arcoIndex) {
      const larguraArco = this.larguraArmazem / this.quantidadeArcos
      const arcoX = this.margemX + (larguraArco * arcoIndex)
      
      // Obter configuração do modelo atual
      const modelo = this.config.modelosArcos?.[arcoIndex + 1]
      
      if (!modelo || !modelo.sensoresPorPendulo) {
        // Fallback: padrão zigzag se não houver informações de sensores
        const espacamentoX = larguraArco / (totalPendulos + 1)
        const x = arcoX + (espacamentoX * indicePendulo)
        const y = this.margemY + (this.alturaArmazem / 2) + (indicePendulo % 2 === 0 ? -30 : 30)
        return { x, y }
      }
      
      // Analisar quantidade de sensores de cada pêndulo
      const pendulosComSensores = []
      for (let i = 1; i <= totalPendulos; i++) {
        pendulosComSensores.push({
          indice: i,
          numSensores: modelo.sensoresPorPendulo[i] || 5
        })
      }
      
      // Encontrar quantidades únicas de sensores
      const quantidadesUnicas = [...new Set(pendulosComSensores.map(p => p.numSensores))].sort((a, b) => b - a)
      
      // Separar em até 3 níveis (topo, meio, fundo)
      let gruposPendulos = {
        topo: [],     // Cabos com mais sensores - mais próximo do topo
        meio: [],     // Cabos com quantidade intermediária
        fundo: []     // Cabos com menos sensores - mais próximo do fundo
      }
      
      if (quantidadesUnicas.length === 1) {
        // Todos têm a mesma quantidade -> distribui no meio
        gruposPendulos.meio = [...pendulosComSensores]
      } else if (quantidadesUnicas.length === 2) {
        // Duas quantidades: maior no topo, menor no fundo
        gruposPendulos.topo = pendulosComSensores.filter(p => p.numSensores === quantidadesUnicas[0])
        gruposPendulos.fundo = pendulosComSensores.filter(p => p.numSensores === quantidadesUnicas[1])
      } else {
        // 3 ou mais quantidades: maior no topo, menor no fundo, resto no meio
        const maiorQuantidade = quantidadesUnicas[0]
        const menorQuantidade = quantidadesUnicas[quantidadesUnicas.length - 1]
        
        gruposPendulos.topo = pendulosComSensores.filter(p => p.numSensores === maiorQuantidade)
        gruposPendulos.fundo = pendulosComSensores.filter(p => p.numSensores === menorQuantidade)
        gruposPendulos.meio = pendulosComSensores.filter(p => 
          p.numSensores !== maiorQuantidade && p.numSensores !== menorQuantidade
        )
      }
      
      // Encontrar em qual grupo está o pêndulo atual
      let nivelY = this.margemY + (this.alturaArmazem / 2) // Posição padrão no meio
      let totalNoNivel = totalPendulos
      let indiceNoNivel = indicePendulo - 1
      
      const penduloAtual = pendulosComSensores.find(p => p.indice === indicePendulo)
      
      if (gruposPendulos.topo.some(p => p.indice === indicePendulo)) {
        nivelY = this.margemY + (this.alturaArmazem * 0.25) // 25% da altura (topo)
        totalNoNivel = gruposPendulos.topo.length
        indiceNoNivel = gruposPendulos.topo.findIndex(p => p.indice === indicePendulo)
      } else if (gruposPendulos.meio.some(p => p.indice === indicePendulo)) {
        nivelY = this.margemY + (this.alturaArmazem * 0.5) // 50% da altura (meio)
        totalNoNivel = gruposPendulos.meio.length
        indiceNoNivel = gruposPendulos.meio.findIndex(p => p.indice === indicePendulo)
      } else if (gruposPendulos.fundo.some(p => p.indice === indicePendulo)) {
        nivelY = this.margemY + (this.alturaArmazem * 0.75) // 75% da altura (fundo)
        totalNoNivel = gruposPendulos.fundo.length
        indiceNoNivel = gruposPendulos.fundo.findIndex(p => p.indice === indicePendulo)
      }
      
      // Calcular X: distribuir uniformemente no arco
      const espacamentoX = larguraArco / (totalNoNivel + 1)
      const x = arcoX + (espacamentoX * (indiceNoNivel + 1))
      
      return { x, y: nivelY }
    },
    
    iniciarDrag(event, pendulo, tipo) {
      event.preventDefault()
      
      this.isDragging = true
      this.dragElement = pendulo
      this.dragType = tipo
      
      // Pegar coordenadas do mouse no SVG
      const svg = event.target.closest('svg')
      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      
      // Calcular offset
      this.dragOffset = {
        x: svgP.x - pendulo.x,
        y: svgP.y - pendulo.y
      }
    },
    
    handleDrag(event) {
      if (!this.isDragging || !this.dragElement) return
      
      const svg = this.$el
      if (!svg || svg.tagName !== 'svg') return
      
      const pt = svg.createSVGPoint()
      pt.x = event.clientX
      pt.y = event.clientY
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
      
      const newX = svgP.x - this.dragOffset.x
      const newY = svgP.y - this.dragOffset.y
      
      // Limitar movimento dentro do armazém
      const finalX = Math.max(this.margemX + 10, Math.min(newX, this.margemX + this.larguraArmazem - 10))
      const finalY = Math.max(this.margemY + 10, Math.min(newY, this.margemY + this.alturaArmazem - 10))
      
      // Atualizar posição
      this.$set(this.posicoesManualPendulos, this.dragElement.id, {
        x: finalX,
        y: finalY
      })
      
      // Emitir evento de atualização
      this.$emit('posicoes-atualizadas', {
        tipo: 'topo',
        pendulos: { ...this.posicoesManualPendulos }
      })
    },
    
    pararDrag() {
      this.isDragging = false
      this.dragElement = null
      this.dragType = null
    }
  }
}
</script>

<style scoped>
.pendulo-text {
  pointer-events: none;
  user-select: none;
}
</style>
