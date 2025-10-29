<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${larguraSVG} ${alturaSVG}`"
    :style="{
      width: '100%',
      height: 'auto',
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
  >
    <!-- Definições: clip-path do interior do silo para alinhar a base às bordas -->
    <defs>
      <clipPath :id="clipIdSilo" clipPathUnits="userSpaceOnUse">
        <polygon :points="pontosSilo" />
      </clipPath>
    </defs>
    <!-- Estrutura do Silo -->
    <g :transform="transformSilo" :style="{ opacity: opacidadesSvg.estrutura }">
      <!-- Corpo do silo (polígono) -->
      <polygon fill="#E7E7E7" :points="pontosSilo" />

      <!-- Tampa superior -->
      <path
        fill="#999999"
        :d="dTampaSuperior"
        :transform="`scale(${config.lb / 152}, ${config.hb / 15})`"
      />

      <!-- Base: elíptica (reto) ou V espelhado -->
      <template v-if="config.formato_nivel_inferior !== 'v'">
        <!-- Base RETA (elipse) sem recorte: mantém o fundo redondo visível -->
        <ellipse
          fill="#999999"
          :cx="config.lb / 2"
          :cy="config.hs"
          :rx="config.lb / 2"
          :ry="config.hb"
        />
        <ellipse
          fill="#CCCCCC"
          :cx="config.lb / 2"
          :cy="config.hs - config.eb"
          :rx="config.lb / 2"
          :ry="config.hb"
        />
      </template>
      <template v-else>
        <!-- Base em V com recorte e fundo interno para disfarçar -->
        <g :clip-path="`url(#${clipIdSilo})`">
          <!-- Fundo interno para disfarçar os cantos laterais -->
          <rect
            :x="0"
            :y="config.hs - config.hb * 1.4"
            :width="config.lb"
            :height="offsetVBase + config.hb * 2 + espessuraV"
            fill="#E7E7E7"
          />
          <!-- Clona o topo e aplica matriz para espelhar e posicionar na base, recortado pelo interior do silo -->
          <path
            fill="#999999"
            :d="dTampaSuperior"
            :transform="`matrix(${config.lb / 152},0,0,${-escalaV},0,${config.hs + offsetVBase - espessuraV})`"
          />
          <path
            fill="#CCCCCC"
            :d="dTampaSuperior"
            :transform="`matrix(${config.lb / 152},0,0,${-escalaV},0,${config.hs + offsetVBase - config.eb})`"
          />
        </g>
      </template>
    </g>

    <!-- Aeradores (se ativo) -->
    <g v-if="config.aeradores_ativo" v-html="renderAeradoresSilo()"></g>

    <!-- Pêndulos e Sensores -->
    <g :style="{ opacity: opacidadesSvg.pendulos }">
      <g :transform="transformSilo">
        <g v-for="p in quantidadePendulos" :key="`pendulo_${p}`">
          <!-- Área de clique ampla para arrastar o cabo -->
          <rect
            :x="calcularPosicaoXPendulo(p) - escalaSensores"
            :y="0"
            :width="escalaSensores * 2"
            :height="alturaSVG"
            fill="transparent"
            style="cursor: ns-resize; pointer-events: all;"
            @mousedown="iniciarDragPendulo($event, p)"
          />
          <!-- Pêndulo -->
          <rect
            :id="`PenduloSilo_${p}`"
            :x="calcularPosicaoXPendulo(p) - escalaSensores / 2"
            :y="posicoesManuaisYPendulos[p] || yPendulo"
            :width="escalaSensores"
            :height="escalaSensores / 2"
            rx="2"
            ry="2"
            :fill="getCorPendulo(p)"
            stroke="black"
            :stroke-width="bordaFina"
            class="pendulo-element"
            style="cursor: ns-resize;"
            @mousedown="iniciarDragPendulo($event, p)"
          />
          <text
            :id="`TextoPenduloSilo_${p}`"
            :x="calcularPosicaoXPendulo(p)"
            :y="(posicoesManuaisYPendulos[p] || yPendulo) + escalaSensores / 4"
            text-anchor="middle"
            dominant-baseline="central"
            font-weight="bold"
            :font-size="escalaSensores * 0.4 - 0.5"
            font-family="Arial"
            fill="white"
            class="pendulo-element"
            style="cursor: ns-resize; pointer-events: none;"
          >
            P{{ p }}
          </text>

          <!-- Sensores do pêndulo -->
          <g v-for="s in getSensoresPorPendulo(p)" :key="`sensor_${p}_${s}`">
            <rect
              :id="`SensorSilo_${p}_${s}`"
              :x="calcularPosicaoXPendulo(p) - escalaSensores / 2"
              :y="calcularPosicaoYSensor(s, p)"
              :width="escalaSensores"
              :height="escalaSensores / 2"
              rx="2"
              ry="2"
              :fill="getCorSensor(p, s)"
              stroke="black"
              :stroke-width="bordaFina"
              class="sensor-element"
              style="cursor: ns-resize;"
              @mousedown="iniciarDragSensor($event, p, s)"
            />
            <text
              :id="`ValorSensorSilo_${p}_${s}`"
              :x="calcularPosicaoXPendulo(p)"
              :y="calcularPosicaoYSensor(s, p) + escalaSensores / 4"
              text-anchor="middle"
              dominant-baseline="central"
              :font-size="escalaSensores * 0.4 - 0.5"
              font-family="Arial"
              :fill="getCorSensor(p, s) === '#ff2200' ? 'white' : 'black'"
              class="sensor-element"
              style="pointer-events: none;"
            >
              {{ getValorSensor(p, s) }}
            </text>
            <text
              :id="`NomeSensorSilo_${p}_${s}`"
              :x="calcularPosicaoXPendulo(p) - escalaSensores / 2 - 2"
              :y="calcularPosicaoYSensor(s, p) + escalaSensores / 4"
              text-anchor="end"
              dominant-baseline="central"
              :font-size="escalaSensores * 0.4 - 1.5"
              font-family="Arial"
              fill="black"
              class="sensor-element"
              style="pointer-events: none;"
            >
              S{{ s }}
            </text>
          </g>
        </g>
      </g>
    </g>

    <!-- Elementos da Visão Topo (Círculos) -->
    <g v-if="isVisaoTopoAtiva" :transform="`translate(${config.lb / 2}, ${config.hs / 2})`" :style="{ pointerEvents: 'none' }">
      <circle
        v-for="(circulo, index) in circulosTopo"
        :key="index"
        :cx="circulo.cx"
        :cy="circulo.cy"
        :r="circulo.radius"
        :fill="circulo.fill"
        stroke="black"
        :stroke-width="circulo.borderWidth"
        @mousedown="iniciarDragCirculo($event, index)"
        @wheel.prevent="ajustarTamanhoCirculo($event, index)"
      />
    </g>
  </svg>
</template>

<script>
export default {
  name: 'SiloLateralSvg',
  props: {
    config: {
      type: Object,
      required: true,
      default: () => ({
        lb: 200,
        hs: 180,
        hb: 15,
        eb: 2,
        formato_nivel_inferior: 'reto',
        escala_sensores: 16,
        dist_y_sensores: 12,
        aeradores_ativo: false,
        na: 4,
        ds: 30,
        dy: 0,
        da: 35,
        aerador_rotacao: 0,
        aerador_escala: 1,
        quantidadePendulos: 5,
        sensoresPorPendulo: {
          1: 5, 2: 5, 3: 5, 4: 5, 5: 5
        },
        // Propriedades para a visão topo
        circulosTopo: [
          { cx: 0, cy: 0, radius: 20, fill: '#3A78FD', borderWidth: 1 },
          { cx: 50, cy: 0, radius: 20, fill: '#4ECDC4', borderWidth: 1 },
          { cx: -50, cy: 0, radius: 20, fill: '#FF6B35', borderWidth: 1 }
        ]
      })
    },
    dadosSensores: {
      type: Object,
      default: null
    },
    imagemFundo: {
      type: Object,
      default: () => ({ url: null })
    },
    opacidadesSvg: {
      type: Object,
      default: () => ({
        geral: 1,
        pendulos: 1,
        estrutura: 1
      })
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    isVisaoTopoAtiva: { // Nova prop para controlar a visibilidade da visão topo
      type: Boolean,
      default: false
    }
  },
  computed: {
    dTampaSuperior() {
      // Caminho usado para a tampa superior e para espelhar na base em V
      return "M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
    },
    larguraSVG() {
      return this.config.lb + (this.config.aeradores_ativo ? this.config.ds * 2 + 68 : 0)
    },
    alturaSVG() {
      // Ajusta a altura total: inclui a extensão da ponta V quando ativa
      const baseAltura = this.config.hs + this.config.hb * 1.75
      const extraV = this.config.formato_nivel_inferior === 'v' ? this.offsetVBase : 0
      return baseAltura + extraV + 20
    },
    pontosSilo() {
      const { lb, hs, hb } = this.config
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      if (this.config.formato_nivel_inferior === 'v') {
        const pTip = [lb / 2, hs + this.offsetVBase]
        return `${p1[0]},${p1[1]} ${pTip[0]},${pTip[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`
      }
      return `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`
    },
    transformSilo() {
      return this.config.aeradores_ativo ? `translate(${this.config.ds + 34}, 0)` : ""
    },
    quantidadePendulos() {
      return this.config.quantidadePendulos || 5
    },
    ordemRenderizada() {
      const q = this.quantidadePendulos
      const base = Array.from({ length: q }, (_, i) => i + 1)
      const ord = Array.isArray(this.config.ordemPendulos) && this.config.ordemPendulos.length === q
        ? this.config.ordemPendulos
        : base
      return ord
    },
    escalaSensores() {
      return this.config.escala_sensores || 16
    },
    distYSensores() {
      return this.config.dist_y_sensores || 12
    },
    yPendulo() {
      return this.config.hs + 25
    },
    circulosTopo() {
      return this.config.circulosTopo || [];
    },
    bordaFina() {
      return 0.6
    },
    clipIdSilo() {
      // ID único para o clip-path do interior do silo
      return `clip-silo-interior-${this._uid}`
    },
    espessuraV() {
      const custom = this.config.espessura_v
      if (typeof custom === 'number' && !Number.isNaN(custom)) return custom
      return Math.max(2, Math.round(this.config.hb * 0.25))
    },
    offsetVBase() {
      // Deslocamento vertical adicional para posicionar o V mais baixo.
      // Usa valor configurável, ou um padrão proporcional à altura da borda (hb).
      const custom = this.config.deslocamento_v_base
      if (typeof custom === 'number' && !Number.isNaN(custom)) return custom
      return Math.round(this.config.hb * 1.2)
    },
    // Altura nominal do path da tampa superior (sem escala), usada para calibrar a escala do V
    alturaTopoPath() {
      return 26.6
    },
    // Escala vertical do V para atingir exatamente o deslocamento desejado (offsetVBase)
    escalaV() {
      return this.offsetVBase / this.alturaTopoPath
    }
  },
  data() {
    return {
      posicoesManuaisYPendulos: {}, // Posições Y manuais dos pêndulos
      posicoesManuaisYSensores: {}, // Posições Y manuais dos sensores
      isDraggingPendulo: false,
      isDraggingSensor: false,
      penduloArrastando: null,
      sensorArrastando: null, // { pendulo, sensor }
      offsetYInicial: 0,
      // Dados para drag and drop dos círculos na visão topo
      isDraggingCirculo: false,
      circuloArrastandoIndex: -1,
      offsetCirculo: { x: 0, y: 0 }
    }
  },
  methods: {
    calcularPosicaoXPendulo(numeroPendulo) {
      const { lb } = this.config
      const margemLateral = 40
      const larguraUtil = lb - (2 * margemLateral)

      if (this.quantidadePendulos === 1) {
        return lb / 2
      } else {
        // Espaçamento centralizado (deixa uma borda simétrica nas laterais)
        const espacamento = larguraUtil / (this.quantidadePendulos + 1)
        // posição visual baseada no índice dentro da ordem renderizada
        const idx = Math.max(0, this.ordemRenderizada.indexOf(numeroPendulo))
        // Usar (idx + 1) para evitar colar nas bordas; fica alinhado ao "trilho" cinza
        return margemLateral + ((idx + 1) * espacamento)
      }
    },
    calcularPosicaoYSensor(numeroSensor, pendulo) {
      const yPenduloBase = this.posicoesManuaisYPendulos[pendulo] || this.yPendulo;
      const chaveSensor = `${pendulo}-${numeroSensor}`;
      const offsetManual = this.posicoesManuaisYSensores[chaveSensor] || 0;
      return yPenduloBase - this.distYSensores * numeroSensor - 25 + offsetManual;
    },
    getSensoresPorPendulo(numeroPendulo) {
      return this.config.sensoresPorPendulo[numeroPendulo] || 5
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
      return 3
    },
    getCorSensor(pendulo, sensor) {
      if (this.dadosSensores?.leitura?.[pendulo]?.[sensor]) {
        const dados = this.dadosSensores.leitura[pendulo][sensor]
        const temp = parseFloat(dados[0])
        const nivel = dados[4]

        if (!nivel || temp == 0) {
          return "#e6e6e6"
        } else {
          return this.corFaixaExata(temp)
        }
      }
      return "#ccc"
    },
    getValorSensor(pendulo, sensor) {
      if (this.dadosSensores?.leitura?.[pendulo]?.[sensor]) {
        const dados = this.dadosSensores.leitura[pendulo][sensor]
        const temp = parseFloat(dados[0])
        const falha = dados[3]
        const nivel = dados[4]

        if (!nivel || temp == 0) {
          return "0"
        } else {
          return falha ? "ERRO" : temp.toFixed(1)
        }
      }
      return "0"
    },
    corFaixaExata(temp) {
      if (temp < 15) return "#1e90ff"
      else if (temp < 25) return "#32cd32"
      else if (temp < 35) return "#ffff00"
      else if (temp < 45) return "#ffa500"
      else return "#ff2200"
    },
    renderAeradoresSilo() {
      // Nova lógica: usar lados definidos se existirem
      const ladosDef = this.config.aeradores_lados || { esquerda: [], direita: [] }
      const totalLados = (ladosDef.esquerda?.length || 0) + (ladosDef.direita?.length || 0)
      if (totalLados > 0) {
        const { ds, dy, da, lb, hs } = this.config
        const posYBase = hs + dy - 30
        const posXDir = lb + ds * 2 - 31
        const posXEsq = -73
        let aeradores = ''

        const dBlade2 = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
        const angles2 = [0, 60, 120, 180, 240, 300]
        const aeradorEscala2 = this.config.aerador_escala || 1
        const aeradorRotacao2 = this.config.aerador_rotacao || 0

        const renderGrupo2 = (ids, xBase) => {
          ids.forEach((id, idx) => {
            const y = posYBase - idx * (35 + da)
            const transform = `translate(${xBase}, ${y})`
            const centerX = 70 + 12.5 + 3.5
            const centerY = 24
            const transformCompleto = `${transform} rotate(${aeradorRotacao2} ${centerX} ${centerY}) scale(${aeradorEscala2} ${aeradorEscala2})`
            aeradores += `
              <g transform="${transformCompleto}">
                <circle cx="${centerX}" cy="${centerY}" r="10" fill="#c5c5c5" />
                <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
                <text x="${centerX}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
                <g>
                  ${angles2.map(angle =>
                    `<path d="${dBlade2}" fill="white" ${angle === 0 ? '' : `transform=\"rotate(${angle},${centerX},${centerY})\"`} />`
                  ).join('')}
                </g>
              </g>
            `
          })
        }

        renderGrupo2(ladosDef.esquerda || [], posXEsq)
        renderGrupo2(ladosDef.direita || [], posXDir)
        return aeradores
      }
      const { na, ds, dy, da, lb, hs } = this.config
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      let aeradores = ''

      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      const angles = [0, 60, 120, 180, 240, 300]

      const aeradorEscala = this.config.aerador_escala || 1
      const aeradorRotacao = this.config.aerador_rotacao || 0

      for (let id = 1; id <= na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`

        const centerX = 70 + 12.5 + 3.5
        const centerY = 24
        const transformCompleto = `${transform} rotate(${aeradorRotacao} ${centerX} ${centerY}) scale(${aeradorEscala} ${aeradorEscala})`

        aeradores += `
          <g transform="${transformCompleto}">
            <circle cx="${centerX}" cy="${centerY}" r="10" fill="#c5c5c5" />
            <rect x="${70 + 3.5}" y="2" width="25" height="10" rx="6.4" ry="5" fill="#3A78FD" />
            <text x="${centerX}" y="7" text-anchor="middle" dominant-baseline="central" font-weight="bold" font-size="6.5" font-family="Arial" fill="white">AE-${id}</text>
            <g>
              ${angles.map(angle =>
          `<path d="${dBlade}" fill="white" ${angle === 0 ? '' : `transform="rotate(${angle},${centerX},${centerY})"`} />`
        ).join('')}
            </g>
          </g>
        `
      }

      return aeradores
    },
    // Métodos para drag and drop dos pêndulos (vertical)
    iniciarDragPendulo(event, penduloId) {
      event.preventDefault();
      event.stopPropagation();
      
      this.isDraggingPendulo = true;
      this.penduloArrastando = penduloId;
      
      const svg = this.$el;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      const posicaoAtual = this.posicoesManuaisYPendulos[penduloId] || this.yPendulo;
      this.offsetYInicial = svgP.y - posicaoAtual;
      
      document.body.style.cursor = 'ns-resize';
    },
    handleDragPendulo(event) {
      if (!this.isDraggingPendulo) return;

      const svg = this.$el;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      const novaPosicaoY = svgP.y - this.offsetYInicial;

      // Limitar movimento vertical dentro do SVG (corrigido)
      const margemTopo = 5;
      const margemBase = 5;
      const limiteSuperior = margemTopo;
      const limiteInferior = this.alturaSVG - margemBase;

      const posicaoYFinal = Math.max(limiteSuperior, Math.min(novaPosicaoY, limiteInferior));

      this.$set(this.posicoesManuaisYPendulos, this.penduloArrastando, posicaoYFinal);
    },
    pararDragPendulo() {
      if (this.isDraggingPendulo) {
        this.isDraggingPendulo = false;
        this.penduloArrastando = null;
        document.body.style.cursor = 'default';
        
        // Emitir evento de atualização de posições
        this.$emit('posicoes-atualizadas', {
          tipo: 'lateral',
          pendulos: { ...this.posicoesManuaisYPendulos },
          sensores: { ...this.posicoesManuaisYSensores }
        });
      }
    },
    
    // Métodos para drag and drop dos sensores individuais (vertical)
    iniciarDragSensor(event, penduloId, sensorId) {
      event.preventDefault();
      event.stopPropagation();
      
      this.isDraggingSensor = true;
      this.sensorArrastando = { pendulo: penduloId, sensor: sensorId };
      
      const svg = this.$el;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      const posicaoCalculada = this.calcularPosicaoYSensor(sensorId, penduloId);
      this.offsetYInicial = svgP.y - posicaoCalculada;
      
      document.body.style.cursor = 'ns-resize';
    },
    handleDragSensor(event) {
      if (!this.isDraggingSensor) return;

      const { pendulo, sensor } = this.sensorArrastando;
      const chaveSensor = `${pendulo}-${sensor}`;
      
      const svg = this.$el;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      
      // Calcular posição base do sensor (sem offset manual)
      const yPenduloBase = this.posicoesManuaisYPendulos[pendulo] || this.yPendulo;
      const posicaoBaseY = yPenduloBase - this.distYSensores * sensor - 25;
      
      // Calcular novo offset baseado na diferença
      const novaPosicaoY = svgP.y - this.offsetYInicial;
      const novoOffset = novaPosicaoY - posicaoBaseY;
      
      // Limitar o offset para evitar que o sensor saia muito da posição
      const offsetLimitado = Math.max(-100, Math.min(100, novoOffset));
      
      this.$set(this.posicoesManuaisYSensores, chaveSensor, offsetLimitado);
    },
    pararDragSensor() {
      if (this.isDraggingSensor) {
        this.isDraggingSensor = false;
        this.sensorArrastando = null;
        document.body.style.cursor = 'default';
        
        // Emitir evento de atualização de posições
        this.$emit('posicoes-atualizadas', {
          tipo: 'lateral',
          pendulos: { ...this.posicoesManuaisYPendulos },
          sensores: { ...this.posicoesManuaisYSensores }
        });
      }
    },
    // Métodos para drag and drop dos círculos na visão topo
    iniciarDragCirculo(event, index) {
      this.isDraggingCirculo = true;
      this.circuloArrastandoIndex = index;
      const rect = event.target.getBoundingClientRect();
      const svgRect = this.$el.getBoundingClientRect();
      this.offsetCirculo = {
        x: event.clientX - svgRect.left - this.circulosTopo[index].cx,
        y: event.clientY - svgRect.top - this.circulosTopo[index].cy
      };
      document.body.style.cursor = 'grabbing';
    },
    handleDragCirculo(event) {
      if (!this.isDraggingCirculo) return;

      const svgRect = this.$el.getBoundingClientRect();
      const newCx = event.clientX - svgRect.left - this.offsetCirculo.x;
      const newCy = event.clientY - svgRect.top - this.offsetCirculo.y;

      // Aplicar limites para manter dentro do SVG (opcional, mas recomendado)
      const circulo = this.circulosTopo[this.circuloArrastandoIndex];
      const halfRadius = circulo.radius;
      const limitedCx = Math.max(halfRadius, Math.min(newCx, this.larguraSVG - halfRadius));
      const limitedCy = Math.max(halfRadius, Math.min(newCy, this.alturaSVG - halfRadius));

      this.circulosTopo[this.circuloArrastandoIndex].cx = limitedCx;
      this.circulosTopo[this.circuloArrastandoIndex].cy = limitedCy;
    },
    pararDragCirculo() {
      if (this.isDraggingCirculo) {
        this.isDraggingCirculo = false;
        this.circuloArrastandoIndex = -1;
        document.body.style.cursor = 'default';
      }
    },
    // Método para ajustar o tamanho dos círculos
    ajustarTamanhoCirculo(event, index) {
      const delta = event.deltaY > 0 ? -1 : 1; // -1 para diminuir, 1 para aumentar
      const novoRaio = this.circulosTopo[index].radius + delta * 2; // Ajuste o valor de '2' para sensibilidade

      // Limitar o tamanho mínimo e máximo (opcional)
      const minRadius = 5;
      const maxRadius = 50;
      this.circulosTopo[index].radius = Math.max(minRadius, Math.min(novoRaio, maxRadius));

      // Atualizar a largura da borda proporcionalmente (opcional)
      this.circulosTopo[index].borderWidth = this.circulosTopo[index].radius * 0.05; // Exemplo: 5% do raio
    }
  },
  mounted() {
    document.addEventListener('mousemove', this.handleDragPendulo);
    document.addEventListener('mouseup', this.pararDragPendulo);
    document.addEventListener('mousemove', this.handleDragSensor);
    document.addEventListener('mouseup', this.pararDragSensor);
    document.addEventListener('mousemove', this.handleDragCirculo);
    document.addEventListener('mouseup', this.pararDragCirculo);
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.handleDragPendulo);
    document.removeEventListener('mouseup', this.pararDragPendulo);
    document.removeEventListener('mousemove', this.handleDragSensor);
    document.removeEventListener('mouseup', this.pararDragSensor);
    document.removeEventListener('mousemove', this.handleDragCirculo);
    document.removeEventListener('mouseup', this.pararDragCirculo);
  }
}
</script>

<style scoped>
.sensor-element, .pendulo-element {
  transition: all 0.15s ease-out;
}
.circulo-elemento {
  cursor: grab;
}
.circulo-elemento:active {
  cursor: grabbing;
}
</style>
