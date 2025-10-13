<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    xml:space="preserve"
    width="100%"
    height="auto"
    version="1.0"
    :viewBox="`0 0 ${largura} ${altura}`"
    :style="{
      maxWidth: '100%',
      maxHeight: isMobile ? '60vh' : 'calc(100vh - 320px)',
      minHeight: isMobile ? '200px' : '250px',
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
    xmlns:xlink="http://www.w3.org/1999/xlink"
  >
    <defs>
      <radialGradient 
        id="topoGradient" 
        gradientUnits="userSpaceOnUse" 
        gradientTransform="matrix(1.00886 -0 -0 1.00886 -1 -1)" 
        :cx="centroX" 
        :cy="centroY" 
        :r="raioSilo" 
        :fx="centroX" 
        :fy="centroY"
      >
        <stop offset="0" style="stop-opacity:1; stop-color:whitesmoke"/>
        <stop offset="1" style="stop-opacity:1; stop-color:#999999"/>
      </radialGradient>
    </defs>

    <!-- Fundo circular do topo do silo -->
    <g id="desenho_fundo" :style="{ opacity: opacidadesSvg.estrutura }" :transform="fundoTransform">
      <!-- Círculo principal com gradiente -->
      <path 
        class="silo-background" 
        fill="url(#topoGradient)" 
        stroke="#999999" 
        stroke-width="1.6929" 
        stroke-miterlimit="22.9256"
        :d="pathCirculoSilo"
      />

      <!-- Linhas divisórias radiais -->
      <g stroke="#999999" stroke-width="0.8465" stroke-miterlimit="22.9256" fill="none">
        <!-- Linha vertical -->
        <line :x1="centroX" :y1="centroY - raioSilo" :x2="centroX" :y2="centroY + raioSilo" />
        <!-- Linha diagonal 1 -->
        <line 
          :x1="centroX - raioSilo * Math.cos(Math.PI/4)" 
          :y1="centroY - raioSilo * Math.sin(Math.PI/4)" 
          :x2="centroX + raioSilo * Math.cos(Math.PI/4)" 
          :y2="centroY + raioSilo * Math.sin(Math.PI/4)" 
        />
        <!-- Linha horizontal -->
        <line :x1="centroX - raioSilo" :y1="centroY" :x2="centroX + raioSilo" :y2="centroY" />
        <!-- Linha diagonal 2 -->
        <line 
          :x1="centroX - raioSilo * Math.cos(Math.PI/4)" 
          :y1="centroY + raioSilo * Math.sin(Math.PI/4)" 
          :x2="centroX + raioSilo * Math.cos(Math.PI/4)" 
          :y2="centroY - raioSilo * Math.sin(Math.PI/4)" 
        />
      </g>

      <!-- Círculo central -->
      <circle 
        :cx="centroX" 
        :cy="centroY" 
        :r="raioSilo * 0.21" 
        fill="#E6E6E6" 
        stroke="#999999" 
        stroke-width="0.8465"
      />

      <!-- Círculo médio -->
      <circle 
        :cx="centroX" 
        :cy="centroY" 
        :r="raioSilo * 0.57" 
        fill="none" 
        stroke="#999999" 
        stroke-width="0.8465"
      />
    </g>

    <!-- Pêndulos posicionados -->
    <g :style="{ opacity: opacidadesSvg.pendulos }">
      <g 
        v-for="(pendulo, index) in pendulosComPosicao" 
        :key="`pendulo_${index + 1}`" 
        :id="`pendulo_${index + 1}`"
        :transform="pendulo.transform"
        @mousedown="iniciarDrag($event, pendulo, 'pendulo')"
        style="cursor: move;"
      >
        <!-- Círculo principal do pêndulo -->
        <circle 
          :cx="centroX" 
          :cy="centroY" 
          :r="config.tamanhoCirculoPendulo || 5.7138"
          :fill="getCorPendulo(pendulo.label)"
          stroke="black" 
          :stroke-width="0.6"
          :title="`Pêndulo ${pendulo.label}`"
        />

        <!-- Texto do pêndulo -->
        <text 
          :x="centroX" 
          :y="centroY"  
          class="pendulo-text" 
          text-anchor="middle" 
          dominant-baseline="central"
          fill="white"
          font-size="7"
          font-weight="bold"
        >
          P{{ pendulo.label }}
        </text>
      </g>
    </g>
  </svg>
</template>

<script>
export default {
  name: 'SiloTopoSvg',
  props: {
    config: {
      type: Object,
      required: true
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
      largura: 138,
      altura: 134,
      posicoesManualPendulos: {},
      isDragging: false,
      dragElement: null,
      dragOffset: { x: 0, y: 0 }
    }
  },
  computed: {
    centroX() {
      return 68.7343
    },
    centroY() {
      return 66.5965
    },
    raioSilo() {
      return 65.75
    },
    pathCirculoSilo() {
      return "M66.5965 0.8465c34.2065,0 62.3078,26.1228 65.453,59.5066l1.6233 0c1.6221,0 2.9493,1.3271 2.9493,2.9493l0 6.2908c0,1.6221 -1.3271,2.9493 -2.9493,2.9493l-1.597 0c-3.0059,33.5258 -31.1715,59.804 -65.4794,59.804 -36.3127,0 -65.75,-29.4373 -65.75,-65.75 0,-36.3127 29.4373,-65.75 65.75,-65.75z"
    },
    quantidadePendulos() {
      return this.config?.quantidadePendulos || 5
    },
    fundoTransform() {
      // Aplicar rotação do fundo ao redor do centro
      const rotacao = this.config?.rotacaoFundo || 0
      return `rotate(${rotacao} ${this.centroX} ${this.centroY})`
    },
    afastamentoPendulos() {
      // Obter multiplicador de afastamento dos pêndulos
      return this.config?.afastamentoPendulos || 1.0
    },
    pendulosComPosicao() {
      const pendulos = []

      // 🎯 LÓGICA DE AGRUPAMENTO POR TIPO DE POSIÇÃO
      // Coletar informações de todos os pêndulos
      const pendulosComTipo = []
      for (let i = 1; i <= this.quantidadePendulos; i++) {
        const tipoPosicao = this.config.tipoPosicaoPendulo?.[i] || 'central'
        pendulosComTipo.push({
          label: i,
          tipoPosicao: tipoPosicao
        })
      }

      // Separar em 3 níveis baseado no tipo de posição
      let gruposPendulos = {
        central: [],       // Pêndulos centrais
        intermediario: [], // Pêndulos intermediários
        lateral: []        // Pêndulos laterais
      }

      pendulosComTipo.forEach(p => {
        if (p.tipoPosicao === 'central') {
          gruposPendulos.central.push(p)
        } else if (p.tipoPosicao === 'intermediario') {
          gruposPendulos.intermediario.push(p)
        } else if (p.tipoPosicao === 'lateral') {
          gruposPendulos.lateral.push(p)
        }
      })

      // Ordenar cada grupo numericamente (P1, P2, P3, etc.)
      const ordenarNumericamente = (grupos) => {
        return grupos.sort((a, b) => a.label - b.label)
      }

      gruposPendulos.central = ordenarNumericamente(gruposPendulos.central)
      gruposPendulos.intermediario = ordenarNumericamente(gruposPendulos.intermediario)
      gruposPendulos.lateral = ordenarNumericamente(gruposPendulos.lateral)

      // Posicionar grupos: lateral -> intermediario -> central
      // Grupo lateral
      gruposPendulos.lateral.forEach((pendulo, index) => {
        if (this.posicoesManualPendulos[pendulo.label]) {
          // Se há posição manual, usa ela
          pendulos.push({
            label: pendulo.label,
            transform: `translate(${this.posicoesManualPendulos[pendulo.label].x},${this.posicoesManualPendulos[pendulo.label].y})`,
            nivel: 'lateral',
            tipoPosicao: pendulo.tipoPosicao
          })
        } else {
          // Posição automática
          pendulos.push({
            label: pendulo.label,
            transform: this.calcularTransformCircularIndependente('lateral', index, gruposPendulos.lateral.length),
            nivel: 'lateral',
            tipoPosicao: pendulo.tipoPosicao
          })
        }
      })

      // Grupo intermediário
      gruposPendulos.intermediario.forEach((pendulo, index) => {
        if (this.posicoesManualPendulos[pendulo.label]) {
          pendulos.push({
            label: pendulo.label,
            transform: `translate(${this.posicoesManualPendulos[pendulo.label].x},${this.posicoesManualPendulos[pendulo.label].y})`,
            nivel: 'intermediario',
            tipoPosicao: pendulo.tipoPosicao
          })
        } else {
          pendulos.push({
            label: pendulo.label,
            transform: this.calcularTransformCircularIndependente('intermediario', index, gruposPendulos.intermediario.length),
            nivel: 'intermediario',
            tipoPosicao: pendulo.tipoPosicao
          })
        }
      })

      // Grupo central
      gruposPendulos.central.forEach((pendulo, index) => {
        if (this.posicoesManualPendulos[pendulo.label]) {
          pendulos.push({
            label: pendulo.label,
            transform: `translate(${this.posicoesManualPendulos[pendulo.label].x},${this.posicoesManualPendulos[pendulo.label].y})`,
            nivel: 'central',
            tipoPosicao: pendulo.tipoPosicao
          })
        } else {
          let transform
          if (gruposPendulos.central.length === 1) {
            // Pêndulo único no centro fica no centro geométrico
            transform = this.polarParaRetangular(0, 0, 'central')
          } else {
            // Múltiplos pêndulos centrais têm seu próprio círculo
            transform = this.calcularTransformCircularIndependente('central', index, gruposPendulos.central.length)
          }
          
          pendulos.push({
            label: pendulo.label,
            transform: transform,
            nivel: 'central',
            tipoPosicao: pendulo.tipoPosicao
          })
        }
      })

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
    // 🎯 MÉTODO PRINCIPAL: Calcular transform com cada círculo independente
    calcularTransformCircularIndependente(nivel, index, totalNoNivel) {
      let raio = 0
      let multiplicadorAfastamento = 1.0

      // Definir raio base e multiplicador baseado no tipo de posição
      switch (nivel) {
        case 'central':
          raio = 15 // Círculo pequeno ao redor do centro
          multiplicadorAfastamento = this.config?.afastamentoCentral || 1.0
          break
        case 'intermediario':
          raio = 37 // Círculo médio
          multiplicadorAfastamento = this.config?.afastamentoIntermediario || 1.0
          break
        case 'lateral':
          raio = 55 // Círculo externo
          multiplicadorAfastamento = this.config?.afastamentoLateral || 1.0
          break
      }

      // Aplicar multiplicador de afastamento específico da camada
      raio = raio * multiplicadorAfastamento

      // Cada círculo começa no minuto 15 (0 graus = 3 horas)
      const anguloInicial = 0

      // Distribuir os pêndulos uniformemente pelo círculo completo (360°)
      let anguloFinal
      if (totalNoNivel === 1) {
        // Se só há 1 pêndulo no nível, fica na posição inicial
        anguloFinal = anguloInicial
      } else {
        // Distribuir uniformemente em 360° para completar o círculo
        const incrementoAngulo = 360 / totalNoNivel
        anguloFinal = anguloInicial + (incrementoAngulo * index)
      }

      return this.polarParaRetangular(raio, anguloFinal, nivel)
    },

    polarParaRetangular(raio, angulo, nivel = null) {
      // Aplicar rotação global dos pêndulos
      const rotacaoGlobal = this.config?.rotacaoPendulos || 0
      const anguloComRotacao = angulo + rotacaoGlobal
      
      // Converte o ângulo de graus para radianos e inverte
      const anguloRad = (anguloComRotacao * Math.PI) / 180 * -1

      // Calcula o deslocamento em coordenadas retangulares
      const x = raio * Math.cos(anguloRad)
      const y = raio * Math.sin(anguloRad)

      // Retorna a string de transform
      return `translate(${x},${y})`
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
      const match = pendulo.transform.match(/translate\(([-\d.]+),([-\d.]+)\)/)
      if (match) {
        this.dragOffset = {
          x: svgP.x - parseFloat(match[1]) - this.centroX,
          y: svgP.y - parseFloat(match[2]) - this.centroY
        }
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

      const newX = svgP.x - this.centroX - this.dragOffset.x
      const newY = svgP.y - this.centroY - this.dragOffset.y

      // Limitar movimento dentro do círculo do silo
      const distancia = Math.sqrt(newX * newX + newY * newY)
      const raioMaximo = this.raioSilo - 10

      let finalX = newX
      let finalY = newY

      if (distancia > raioMaximo) {
        const angulo = Math.atan2(newY, newX)
        finalX = Math.cos(angulo) * raioMaximo
        finalY = Math.sin(angulo) * raioMaximo
      }

      // Atualizar posição
      this.$set(this.posicoesManualPendulos, this.dragElement.label, {
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
    },

    getCorPendulo(numeroPendulo) {
      const tipoPosicao = this.config.tipoPosicaoPendulo?.[numeroPendulo] || 'central'
      
      switch (tipoPosicao) {
        case 'lateral':
          return '#FF6B35'
        case 'central':
          return '#3A78FD'
        case 'intermediario':
          return '#4ECDC4'
        default:
          return '#3A78FD'
      }
    },
    
    getBordaCabo(numeroPendulo) {
      const tipoCabo = this.config.tipoCaboPendulo?.[numeroPendulo] || 'digital'
      
      return tipoCabo === 'analogico' ? '#FFD93D' : '#6C63FF'
    },
    
    getEspessuraBordaCabo(numeroPendulo) {
      return 2
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
