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
      
      <!-- Células de fundo (retângulos cinza claro) -->
      <!-- Retângulos de seleção por arco (rec_arco_N) - fundo -->
      <g v-for="(arco, idx) in arcosTopo" :key="`rec-arco-back-${idx+1}`">
        <rect
          :id="`rec_arco_${idx + 1}`"
          :x="arco.x"
          :y="arco.y"
          :width="arco.width"
          :height="arco.height"
          :fill="corRecArco(idx + 1)"
          fill-opacity="1"
          style="cursor: pointer;"
          @click="selecionarArco(idx + 1)"
        />
      </g>

      <!-- Células (apenas divisão/contorno) - 1px entre células -->
      <g v-for="(celula, idx) in celulasTopo" :key="`celula-fundo-${idx+1}`">
        <rect
          :id="`rec_celula${idx + 1}`"
          :x="celula.x"
          :y="celula.y"
          :width="celula.width"
          :height="celula.height"
          :fill="idx === celulaSelecionadaIndex ? cores.celulaSelFill : cores.celulaFill"
          :stroke="idx === celulaSelecionadaIndex ? cores.celulaSelStroke : cores.celulaStroke"
          stroke-width="2"
          rx="5"
          ry="5"
          style="cursor: pointer;"
          @click="selecionarArco(idx + 1)"
        />
      </g>

      <!-- Retângulos de seleção por arco (rec_arco_N) -->

      <!-- Trilhos por arco (barras verticais no centro de cada arco) -->
      <g v-for="i in quantidadeArcos" :key="`trilho-arco-${i}`">
        <!-- Barra vertical do trilho -->
        <rect
          :x="(margemX + (larguraArmazem / quantidadeArcos) * (i - 0.5)) - (trilhoConfig.larguraBarra / 2)"
          :y="margemY"
          :width="trilhoConfig.larguraBarra"
          :height="alturaArmazem"
          :fill="cores.trilho"
          rx="2"
          ry="2"
          style="cursor: pointer;"
          @click="selecionarArco(i)"
        />
        
        <!-- Botão superior -->
        <rect
          :id="`arco${i}_botsup`"
          :x="(margemX + (larguraArmazem / quantidadeArcos) * (i - 0.5)) - (trilhoConfig.larguraBotao / 2)"
          :y="margemY - trilhoConfig.alturaBotao - trilhoConfig.espacoBotao"
          :width="trilhoConfig.larguraBotao"
          :height="trilhoConfig.alturaBotao"
          :fill="Number(arcoSelecionado) === i ? cores.botaoSel : cores.botao"
          rx="4.2"
          ry="4.2"
          style="cursor: pointer;"
          @click="selecionarArco(i)"
        />
        <!-- Texto do botão superior -->
        <text
          :x="margemX + (larguraArmazem / quantidadeArcos) * (i - 0.5)"
          :y="margemY - trilhoConfig.alturaBotao - trilhoConfig.espacoBotao + (trilhoConfig.alturaBotao / 2) + 1"
          text-anchor="middle"
          dominant-baseline="middle"
          :fill="cores.botaoText"
          font-size="9"
          font-family="Arial, sans-serif"
        >
          {{ i }}
        </text>
        
        <!-- Botão inferior -->
        <rect
          :id="`arco${i}_botinf`"
          :x="(margemX + (larguraArmazem / quantidadeArcos) * (i - 0.5)) - (trilhoConfig.larguraBotao / 2)"
          :y="margemY + alturaArmazem + trilhoConfig.espacoBotao"
          :width="trilhoConfig.larguraBotao"
          :height="trilhoConfig.alturaBotao"
          :fill="Number(arcoSelecionado) === i ? cores.botaoSel : cores.botao"
          rx="4.2"
          ry="4.2"
          style="cursor: pointer;"
          @click="selecionarArco(i)"
        />
        <!-- Texto do botão inferior -->
        <text
          :x="margemX + (larguraArmazem / quantidadeArcos) * (i - 0.5)"
          :y="margemY + alturaArmazem + trilhoConfig.espacoBotao + (trilhoConfig.alturaBotao / 2) + 1"
          text-anchor="middle"
          dominant-baseline="middle"
          :fill="cores.botaoText"
          font-size="9"
          font-family="Arial, sans-serif"
        >
          {{ i }}
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
        <!-- Círculo do cabo com estilo do modelo HTML -->
        <circle 
          :cx="pendulo.x" 
          :cy="pendulo.y" 
          r="11"
          :fill="pendulo.arcoNumero === arcoSelecionado ? '#5CB85C' : '#FFFFFF'"
          stroke="#000000"
          stroke-width="1"
          :title="`C${pendulo.numeroCabo}`"
        />

        <!-- Texto do cabo (C#) -->
        <text 
          :x="pendulo.x" 
          :y="pendulo.y + 1"  
          class="pendulo-text" 
          text-anchor="middle" 
          dominant-baseline="middle"
          :fill="pendulo.arcoNumero === arcoSelecionado ? '#000000' : '#555555'"
          font-size="8"
          font-weight="bold"
          font-family="Arial, sans-serif"
        >
          {{ `C${pendulo.numeroCabo}` }}
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
    },
    lateralPadraoArcos: {
      type: Object,
      default: () => ({})
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
      dragOffset: { x: 0, y: 0 },
      selectedArco: null
    }
  },
  computed: {
    // Alias compatível: muitos trechos usam quantidadeModelosArcos,
    // mas o prop exposto é quantidadeModelos. Garantimos ambos.
    quantidadeModelosArcos() {
      const fromProp = Number(this.quantidadeModelos)
      if (Number.isFinite(fromProp) && fromProp > 0) return fromProp
      const byModelos = this.config?.modelosArcos ? Object.keys(this.config.modelosArcos).length : 0
      return byModelos || 1
    },
    quantidadeArcos() {
      const topo = this.config?.topo || {}
      const totalArcosTopo = parseInt(topo.totalArcos)
      if (!isNaN(totalArcosTopo) && totalArcosTopo > 0) return totalArcosTopo
      if (this.quantidadeModelos && this.quantidadeModelos > 0) return this.quantidadeModelos
      const modelosLen = this.config?.modelosArcos ? Object.keys(this.config.modelosArcos).length : 0
      return modelosLen || 1
    },
    larguraArmazem() {
      return this.larguraSVG - (this.margemX * 2)
    },
    alturaArmazem() {
      return this.alturaSVG - (this.margemY * 2) - 20
    },
    // Células separadas estilo Armazem2D topo
    celulasTopo() {
      const topo = this.config?.topo || {}
      const numeroCelulas = parseInt(topo.quantidadeCelulas) || this.quantidadeArcos || 1
      const larguraPorCelula = this.larguraArmazem / numeroCelulas
      const y = this.margemY
      const altura = this.alturaArmazem
      const celulas = []
      const gap = 1
      const half = gap / 2
      for (let i = 0; i < numeroCelulas; i++) {
        const xInicio = this.margemX + (larguraPorCelula * i) + half
        // 1px de espaço entre as células (ajuste simétrico)
        const largura = i === numeroCelulas - 1
          ? (this.larguraArmazem - (larguraPorCelula * i) - gap)
          : (larguraPorCelula - gap)
        celulas.push({ x: xInicio, y, width: largura, height: altura })
      }
      return celulas
    },
    // Arcos separados (mesmo particionamento, mas por arco)
    arcosTopo() {
      const n = this.quantidadeArcos || 1
      const larguraPorArco = this.larguraArmazem / n
      const y = this.margemY
      const altura = this.alturaArmazem
      const arcos = []
      for (let i = 0; i < n; i++) {
        const xInicio = this.margemX + (larguraPorArco * i)
        // Sem espaço entre arcos
        const largura = i === n - 1
          ? (this.larguraArmazem - (larguraPorArco * i))
          : (larguraPorArco)
        arcos.push({ x: xInicio, y, width: largura, height: altura })
      }
      return arcos
    },
    // Configuração dos trilhos baseada no modelo HTML
    trilhoConfig() {
      return {
        larguraBarra: 17,
        larguraBotao: 17,
        alturaBotao: 17,
        espacoBotao: 4
      };
    },
    // Paleta de cores configurável
    cores() {
      const topo = this.config?.topo || {}
      const p = topo.cores || {}
      return {
        celulaFill: p.celulaFill || 'none',
        celulaStroke: p.celulaStroke || '#DDDDDD',
        celulaSelFill: p.celulaSelFill || 'none',
        celulaSelStroke: p.celulaSelStroke || '#438AF6',
        trilhoSel: p.trilhoSel || '#AAAAAA',
        trilho: p.trilho || '#BBBBBB',
        botaoSel: p.botaoSel || '#33CC33',
        botao: p.botao || '#BBBBBB',
        botaoText: p.botaoText || '#000000',
        penduloSelFill: p.penduloSelFill || '#5CB85C',
        penduloFill: p.penduloFill || '#FFFFFF',
        penduloSelText: p.penduloSelText || '#000000',
        penduloText: p.penduloText || '#555555'
      }
    },
    arcoSelecionado() {
      const m = parseInt(this.modeloAtual)
      if (!isNaN(m)) return m
      return this.selectedArco || null
    },
    // Centro X do arco selecionado, para mapear qual célula contém o arco
    centroXArcoSelecionado() {
      if (!this.arcoSelecionado) return null
      const i = Number(this.arcoSelecionado)
      const x = this.margemX + (this.larguraArmazem / this.quantidadeArcos) * (i - 0.5)
      return x
    },
    // Índice da célula que contém o arco selecionado
    celulaSelecionadaIndex() {
      const cx = this.centroXArcoSelecionado
      if (cx == null) return null
      const cells = this.celulasTopo
      for (let idx = 0; idx < cells.length; idx++) {
        const c = cells[idx]
        if (cx >= c.x && cx <= c.x + c.width) return idx
      }
      return null
    },
    // Modelos laterais e mapeamento de arcos
    lateralModelos() {
      return this.config?.lateral?.modelos || {}
    },
    lateralMapaArcos() {
      return this.config?.lateral?.mapaArcos || {}
    },
    usaRegraParImpar() {
      const l = this.config?.lateral
      return l && l.regraParImpar === false ? false : true
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
      const topo = this.config?.topo || {}
      const totalArcos = this.quantidadeArcos
      const totalPendulosTopo = parseInt(topo.totalPendulos) || 0
      const larguraArco = this.larguraArmazem / Math.max(totalArcos, 1)
      const margemInterna = 8
      const larguraUtil = Math.max(larguraArco - margemInterna * 2, 0)
      const paddingY = 24
      const alturaUtil = this.alturaArmazem - (paddingY * 2)
      
      // Helper para obter modelo lateral do arco (prioriza mapa; default: frente=1, fundo=N)
      const modeloLateralDoArco = (arcoNum) => {
        // 1) Mapa explícito sempre vence
        const m = this.lateralMapaArcos?.[arcoNum]
        if (m) return m
        const total = this.quantidadeArcos || 1
        // 2) Frente/Fundo agregados (regra 3)
        if (arcoNum === 1 || arcoNum === total) {
          if (this.lateralModelos.frente_fundo) return 'frente_fundo'
          if (this.lateralModelos.frente && arcoNum === 1) return 'frente'
          if (this.lateralModelos.fundo && arcoNum === total) return 'fundo'
        }
        // 3) Distribuição por quantidade de modelos — não dependa da existência de chaves no lateralModelos
        const q = this.quantidadeModelosArcos
        if (q === 1) return 'todos'
        if (q === 2) return arcoNum % 2 === 0 ? 'par' : 'impar'
        if (q === 3) {
          if (arcoNum === 1 || arcoNum === total) return 'frente_fundo'
          return arcoNum % 2 === 0 ? 'par' : 'impar'
        }
        if (q === 4) {
          if (arcoNum === 1) return 'frente'
          if (arcoNum === total) return 'fundo'
          return arcoNum % 2 === 0 ? 'par' : 'impar'
        }
        // 4) fallback — tenta usar 'todos' se existir, senão null
        if (this.lateralModelos.todos) return 'todos'
        return null
      }
      // 🪞 Helper para espelhar padrão (inverter posições horizontais: 0.2 -> 0.8, etc)
      const espelharPadrao = (padrao) => {
        return padrao.map(valor => 1 - valor)
      }
      
      // 🎯 Helper para determinar se o modelo deve ser espelhado baseado na lógica de modelos
      const deveEspelhar = (arcoNum, modelKey, totalArcos) => {
        // Se espelhamento desabilitado globalmente, não espelhar
        // Por padrão, espelhamento está ativo (somente desativa se explicitamente false)
        const espelhamentoAtivo = this.config?.espelhamentoAtivo !== false
        if (!espelhamentoAtivo) return false
        
        // Lógica baseada na quantidade de modelos
        if (this.quantidadeModelosArcos === 1) {
          // Modelo único: não espelhar (todos iguais)
          return false
        } else if (this.quantidadeModelosArcos === 2) {
          // 2 modelos (Par/Ímpar): espelhar os pares
          return arcoNum % 2 === 0
        } else if (this.quantidadeModelosArcos === 3) {
          // 3 modelos (Frente/Fundo + Par/Ímpar)
          // Primeiro e último são iguais (frente/fundo), meio intercala par/ímpar
          if (arcoNum === 1 || arcoNum === totalArcos) {
            return false // Frente e fundo não espelham
          } else {
            return arcoNum % 2 === 0 // Meio espelha os pares
          }
        } else if (this.quantidadeModelosArcos === 4) {
          // 4 modelos (Frente/Par/Ímpar/Fundo)
          // Primeiro (frente) não espelha, intercala par/ímpar até penúltimo, último (fundo) não espelha
          if (arcoNum === 1 || arcoNum === totalArcos) {
            return false // Frente e fundo não espelham
          } else {
            return arcoNum % 2 === 0 // Meio espelha os pares
          }
        }
        return false
      }
      
      // Helper para gerar padrão X relativo (0..1) repetindo conforme necessário
      const gerarPadraoRelX = (modelKey, qtd, arcoNum) => {
        const modelo = modelKey ? this.lateralModelos[modelKey] || {} : {}
        const base = Array.isArray(modelo.padraoXRel) && modelo.padraoXRel.length ? modelo.padraoXRel : [0.5]
        let padrao = []
        for (let i = 0; i < qtd; i++) padrao.push(base[i % base.length])
        
        // 🪞 Aplicar espelhamento se necessário
        if (deveEspelhar(arcoNum, modelKey, this.quantidadeArcos)) {
          padrao = espelharPadrao(padrao)
        }
        
        return padrao
      }

      // Converte xRel (0..1) da visão lateral em Y no topo
      const yFromRel = (xRel) => {
        const rel = Math.max(0, Math.min(1, Number.isFinite(xRel) ? xRel : 0.5))
        return this.margemY + paddingY + (alturaUtil * rel)
      }

      // Centro X do arco (mantemos os círculos no trilho)
      const centerX = (arcoIndex) => {
        const larguraArcoLocal = this.larguraArmazem / this.quantidadeArcos
        return this.margemX + (larguraArcoLocal * arcoIndex) + (larguraArcoLocal / 2)
      }
      
      if (this.modeloAtual) {
        // Modo de edição de modelo específico - mostrar só os pêndulos deste arco
        const modelo = this.config.modelosArcos?.[this.modeloAtual]
        const qtdPendulos = modelo?.quantidadePendulos || 5
        const arcoIndex = parseInt(this.modeloAtual) - 1
        const arcoNum = arcoIndex + 1
        const xInicioArco = this.margemX + (larguraArco * arcoIndex)
        const modeloKey = modeloLateralDoArco(arcoNum)
        const padraoRelX = gerarPadraoRelX(modeloKey, qtdPendulos, arcoNum)
        
        for (let i = 1; i <= qtdPendulos; i++) {
          const penduloId = `${this.modeloAtual}_${i}`
          // 🎯 PRIORIDADE: usar lateralPadraoArcos se disponível, senão padrão do modelo
          let xRel = padraoRelX[i - 1]
          if (this.lateralPadraoArcos?.[arcoNum]?.[penduloId] != null) {
            xRel = this.lateralPadraoArcos[arcoNum][penduloId]
          }
          const xPos = centerX(arcoIndex)
          const yPos = yFromRel(xRel)
          
          if (this.posicoesManualPendulos[penduloId]) {
            pendulos.push({
              label: `${this.modeloAtual}.${i}`,
              id: penduloId,
              numeroCabo: i,
              arcoNumero: arcoNum,
              x: this.posicoesManualPendulos[penduloId].x,
              y: this.posicoesManualPendulos[penduloId].y
            })
          } else {
            pendulos.push({
              label: `${this.modeloAtual}.${i}`,
              id: penduloId,
              numeroCabo: i,
              arcoNumero: arcoNum,
              x: xPos,
              y: yPos
            })
          }
        }
      } else {
        // Visualização geral
        // Preferir a quantidade por modelo configurado na lateral quando houver modelos definidos
        const temModelos = this.config.modelosArcos && Object.keys(this.config.modelosArcos).length > 0
        const encontrarModeloPorTipo = (tipo) => {
          if (!temModelos) return null
          const entries = Object.entries(this.config.modelosArcos)
          let found = entries.find(([, m]) => m && m.posicao === tipo)
          if (!found && tipo === 'frente_fundo') {
            found = entries.find(([, m]) => m && (m.posicao === 'frente' || m.posicao === 'fundo'))
          }
          if (!found && tipo === 'todos') {
            found = entries[0]
          }
          return found ? found[1] : null
        }

        let contadorGlobal = 1
        for (let arcoIndex = 0; arcoIndex < totalArcos; arcoIndex++) {
          const arcoNum = arcoIndex + 1
          const modeloKey = modeloLateralDoArco(arcoNum)
          const modeloDef = encontrarModeloPorTipo(modeloKey)
          // Quantidade por arco: prioriza do modelo; se não houver, cai para distribuição uniforme de totalPendulosTopo
          let pendulosNesteArco = modeloDef?.quantidadePendulos || 0
          if (!pendulosNesteArco) {
            if (totalPendulosTopo > 0) {
              const base = Math.floor(totalPendulosTopo / Math.max(totalArcos, 1))
              const resto = totalPendulosTopo % Math.max(totalArcos, 1)
              pendulosNesteArco = base + (arcoIndex < resto ? 1 : 0)
            } else {
              pendulosNesteArco = 0
            }
          }

          const padraoRelX = gerarPadraoRelX(modeloKey, pendulosNesteArco, arcoNum)
          for (let i = 1; i <= pendulosNesteArco; i++) {
            const penduloId = `A${arcoNum}_${i}`
            let xRel = padraoRelX[i - 1]
            if (this.lateralPadraoArcos?.[arcoNum]?.[penduloId] != null) {
              xRel = this.lateralPadraoArcos[arcoNum][penduloId]
            }
            const xPos = centerX(arcoIndex)
            const yPos = yFromRel(xRel)
            if (this.posicoesManualPendulos[penduloId]) {
              pendulos.push({
                label: `${arcoNum}.${i}`,
                id: penduloId,
                numeroCabo: contadorGlobal,
                arcoNumero: arcoNum,
                x: this.posicoesManualPendulos[penduloId].x,
                y: this.posicoesManualPendulos[penduloId].y
              })
            } else {
              pendulos.push({
                label: `${arcoNum}.${i}`,
                id: penduloId,
                numeroCabo: contadorGlobal,
                arcoNumero: arcoNum,
                x: xPos,
                y: yPos
              })
            }
            contadorGlobal++
          }
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
    // Cor do retângulo de seleção por arco (rec_arco_N), igual ao modelo HTML
    corRecArco(i) {
      const arcoSel = Number(this.arcoSelecionado)
      if (arcoSel === i) return '#438AF6'
      const celSel = this.celulaSelecionadaIndex
      const celArco = this.celulaDoArco(i)
      if (celSel != null && celArco === celSel) return '#E6E6E6'
      return '#E6E6E6'
    },
    // Opacidade de preenchimento para reduzir poluição visual
    opacidadeRecArco(i) {
      const arcoSel = Number(this.arcoSelecionado)
      if (arcoSel === i) return 0.2
      const celSel = this.celulaSelecionadaIndex
      const celArco = this.celulaDoArco(i)
      if (celSel != null && celArco === celSel) return 0.12
      return 0.08
    },
    // Stroke para contorno de arco
    corRecArcoStroke(i) {
      const arcoSel = Number(this.arcoSelecionado)
      if (arcoSel === i) return '#438AF6'
      return '#DDDDDD'
    },

    // Índice da célula a que um arco pertence
    celulaDoArco(i) {
      const numeroCelulas = this.celulasTopo.length || 1
      if (numeroCelulas <= 1) return 0
      const larguraArco = this.larguraArmazem / this.quantidadeArcos
      const xCentroArco = this.margemX + (larguraArco * (i - 1)) + (larguraArco / 2)
      const cells = this.celulasTopo
      for (let idx = 0; idx < cells.length; idx++) {
        const c = cells[idx]
        if (xCentroArco >= c.x && xCentroArco <= c.x + c.width) return idx
      }
      return 0
    },
    /**
     * 📐 Posicionamento vertical (top view):
     * Alinha os cabos verticalmente por arco, como ver o lateral de cima.
     * X fica no centro do arco; Y é distribuído uniformemente em toda a altura.
     */
    calcularPosicaoVerticalArco(indicePendulo, totalPendulos, arcoIndex) {
      const larguraArco = this.larguraArmazem / this.quantidadeArcos
      const xCentroArco = this.margemX + (larguraArco * arcoIndex) + (larguraArco / 2)
      const paddingY = 24
      const alturaUtil = this.alturaArmazem - (paddingY * 2)
      const espacamentoY = alturaUtil / (totalPendulos + 1)
      const y = this.margemY + paddingY + (espacamentoY * indicePendulo)
      return { x: xCentroArco, y }
    },

    selecionarArco(i) {
      this.selectedArco = i
      this.$emit('update:modeloAtual', i)
      this.$emit('arco-selecionado', i)
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
      
      // Centro do arco correspondente (travar X no trilho)
      const arcoNumDrag = this.dragElement.arcoNumero
      const larguraArco = this.larguraArmazem / Math.max(this.quantidadeArcos, 1)
      const xCentro = this.margemX + (larguraArco * (arcoNumDrag - 1)) + (larguraArco / 2)
      
      // Limitar movimento dentro do armazém
      const finalX = Math.max(this.margemX + 10, Math.min(newX, this.margemX + this.larguraArmazem - 10))
      const finalY = Math.max(this.margemY + 10, Math.min(newY, this.margemY + this.alturaArmazem - 10))
      
      // Atualizar posição
      this.$set(this.posicoesManualPendulos, this.dragElement.id, {
        x: xCentro,
        y: finalY
      })
      
      // Emitir evento de atualização (topo)
      this.$emit('posicoes-atualizadas', {
        tipo: 'topo',
        pendulos: { ...this.posicoesManualPendulos }
      })
      
      // Emitir padrão lateral atualizado (comunicação paralela)
      const arcoNum = this.dragElement.arcoNumero
      
      // Ajuste de espelhamento: usa Y do topo para atualizar X_rel da lateral
      const paddingY2 = 24
      const alturaUtil2 = this.alturaArmazem - (paddingY2 * 2)
      let xRelFromY = (finalY - (this.margemY + paddingY2)) / (alturaUtil2 || 1)
      xRelFromY = Math.max(0, Math.min(1, xRelFromY))
      this.$emit('padrao-lateral-atualizado', {
        arcoNumero: arcoNum,
        penduloId: this.dragElement.id,
        xRel: xRelFromY
      })
    },
    
    // Método público para sincronizar o topo a partir da lateral
    sincronizarComLateral(arcoNumero, valoresXRel = []) {
      const totalArcos = this.quantidadeArcos
      if (!arcoNumero || arcoNumero < 1 || arcoNumero > totalArcos) return
      const larguraArco = this.larguraArmazem / Math.max(totalArcos, 1)
      const xInicioArco = this.margemX + larguraArco * (arcoNumero - 1)
      const margemInterna = 8
      const larguraUtil = Math.max(larguraArco - margemInterna * 2, 0)
      const paddingY = 24
      const alturaUtil = this.alturaArmazem - (paddingY * 2)

      // Quantidade de pêndulos no arco
      const qtdPendulos = this.config.modelosArcos?.[arcoNumero]?.quantidadePendulos
        || valoresXRel.length
        || 0
      if (!qtdPendulos) return

      for (let i = 1; i <= qtdPendulos; i++) {
        // Alinhar no centro do arco com espaçamento vertical uniforme
        const pos = this.calcularPosicaoVerticalArco(i, qtdPendulos, arcoNumero - 1)
        const xPos = pos.x
        const yPos = pos.y
        const idGeral = `A${arcoNumero}_${i}`
        const idModelo = `${arcoNumero}_${i}`
        // Atualiza ambos identificadores se existirem
        if (this.posicoesManualPendulos[idGeral] || !this.posicoesManualPendulos[idModelo]) {
          this.$set(this.posicoesManualPendulos, idGeral, { x: xPos, y: yPos })
        }
        this.$set(this.posicoesManualPendulos, idModelo, { x: xPos, y: yPos })
      }
      // Ajuste final: posiciona usando valoresXRel (lateral -> topo)
      for (let i = 1; i <= qtdPendulos; i++) {
        const xRel = Number.isFinite(valoresXRel[i - 1]) ? valoresXRel[i - 1] : 0.5
        const xPos = this.margemX + (larguraArco * (arcoNumero - 1)) + (larguraArco / 2)
        const yPos = this.margemY + paddingY + (alturaUtil * Math.max(0, Math.min(1, xRel)))
        const idGeral = `A${arcoNumero}_${i}`
        const idModelo = `${arcoNumero}_${i}`
        this.$set(this.posicoesManualPendulos, idGeral, { x: xPos, y: yPos })
        this.$set(this.posicoesManualPendulos, idModelo, { x: xPos, y: yPos })
      }
      this.$emit('posicoes-atualizadas', { tipo: 'topo', pendulos: { ...this.posicoesManualPendulos } })
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
