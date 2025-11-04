<template>
  <div class="card w-100" :style="{
    maxWidth: '100%',
    minHeight: '400px',
    maxHeight: isMobile ? 'none' : 'calc(100vh - 60px)',
    height: isMobile ? 'auto' : 'calc(100vh - 60px)'
  }">
    <div class="card-header text-white" style="background-color: #06335E;">
      <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
        <h6 class="mb-2 mb-md-1" style="font-weight: 500;">
          Preview - {{ tipoAtivo === 'silo' ? 'Silo' : previewTituloArmazem }}
          <span v-if="dadosVindosDoPreview" class="badge ms-2" style="background-color: #D32626;"
            title="Dados carregados do preview do Armazém">
            <i class="fa fa-bar-chart me-1"></i>PREVIEW
          </span>
        </h6>
        <div class="d-flex align-items-center">
          <small v-if="tipoAtivo === 'armazem'" class="text-white-50 me-3">
            {{ previewSubtituloArmazem }}
          </small>
          <!-- Componente de Imagem de Fundo -->
          <ImagemFundo
            :container-dimensions="containerDimensions"
            :imagem-inicial="imagemFundoData"
            :tipo-ativo="tipoAtivo"
            @imagem-mudou="$emit('imagem-mudou', $event)"
            @opacidade-svg-mudou="$emit('opacidade-svg-mudou', $event)"
            @mostrar-toast="$emit('mostrar-toast', $event)"
          />
        </div>
      </div>
    </div>

    <div class="card-body text-center d-flex align-items-center justify-content-center p-1 p-md-2" :style="{
      height: isMobile ? 'auto' : 'calc(100vh - 280px)',
      overflow: isMobile ? 'visible' : 'auto',
      minHeight: isMobile ? '300px' : '350px',
      maxHeight: isMobile ? 'none' : 'calc(100vh - 280px)',
      paddingTop: '30px'
    }">
      <div class="svg-container-responsive w-100 position-relative">
        <!-- Renderização condicional baseada na visão e tipo -->

        <!-- Visão de Topo do Silo -->
        <template v-if="tipoAtivo === 'silo' && visaoAtiva === 'topo'">
          <ImagemFundoContainer :imagem-fundo-data="imagemFundoData" />
          <SiloTopoSvg 
            :config="configSilo" 
            :imagem-fundo="imagemFundoData"
            :opacidades-svg="opacidadesSvg"
            :is-mobile="isMobile"
            @posicoes-atualizadas="$emit('posicoes-atualizadas', $event)"
          />
        </template>

        <!-- Visão Lateral do Silo -->
        <template v-else-if="tipoAtivo === 'silo' && visaoAtiva === 'lateral'">
          <ImagemFundoContainer :imagem-fundo-data="imagemFundoData" />
          <SiloLateralSvg
            :config="configSilo"
            :dados-sensores="dados"
            :imagem-fundo="imagemFundoData"
            :opacidades-svg="opacidadesSvg"
            :is-mobile="isMobile"
            @posicoes-atualizadas="$emit('posicoes-atualizadas', $event)"
          />
        </template>

        <!-- Visão de Topo do Armazém -->
        <template v-else-if="tipoAtivo === 'armazem' && visaoAtiva === 'topo'">
          <ImagemFundoContainer :imagem-fundo-data="imagemFundoData" />
          <ArmazemTopoSvg 
            :config="armazemTopoConfig"
            :modelo-atual="modeloArcoAtual"
            :quantidade-modelos="quantidadeModelosArcos"
            :layout-topo="layoutTopoCarregado"
            :lateral-padrao-arcos="lateralPadraoArcos"
            :imagem-fundo="imagemFundoData"
            :opacidades-svg="opacidadesSvg"
            :is-mobile="isMobile"
            @posicoes-atualizadas="$emit('posicoes-atualizadas', $event)"
            @padrao-lateral-atualizado="$emit('padrao-lateral-atualizado', $event)"
          />
        </template>

        <!-- Visão Lateral do Armazém -->
        <template v-else-if="tipoAtivo === 'armazem' && visaoAtiva === 'lateral'">
          <ImagemFundoContainer :imagem-fundo-data="imagemFundoData" />
          <div :style="{
            position: 'relative',
            zIndex: 2,
            opacity: imagemFundoData.url ? opacidadesSvg.geral : 1,
            transition: 'opacity 0.3s ease-in-out',
            width: '100%',
            height: '100%',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }">
            <Armazem
              :config="configArmazemParaComponente"
              :dados-sensores="dados"
              :modelo-atual="modeloAtualParaComponente"
              :dimensoes-personalizadas="dimensoesPersonalizadasParaComponente"
              :imagem-fundo="imagemFundoData"
              @dimensoes-atualizadas="$emit('dimensoes-atualizadas', $event)"
              @dimensoes-aplicadas="$emit('dimensoes-aplicadas', $event)"
              @salvar-dimensoes-modelo="$emit('salvar-dimensoes-modelo', $event)"
              @posicoes-atualizadas="$emit('posicoes-atualizadas', $event)"
              style="width: 100%; height: 100%; min-height: 400px;"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Navegação de Arcos para Armazém -->
    <div v-if="tipoAtivo === 'armazem'" class="card-footer p-2"
      style="background-color: #f5f5f5; position: relative; z-index: 10;">
      <!-- Seletor de Configuração Salva no Preview -->
      <div class="row mb-2">
        <div class="col-12">
          <label class="form-label small"><i class="fa fa-cogs me-1"></i>Modelo do Banco:</label>
          <div class="d-flex gap-2 align-items-center">
            <select class="form-select form-select-sm" v-model="configuracaoPreviewSelecionadaLocal"
              @change="$emit('aplicar-modelo-banco-no-preview', configuracaoPreviewSelecionadaLocal)" :disabled="carregandoModelosBanco">
              <option value="">Configuração Padrão</option>
              <option v-for="modelo in configsDisponiveis" :key="modelo.id_svg" :value="modelo.id_svg">
                {{ modelo.nm_modelo }}
              </option>
            </select>
            <button v-if="configuracaoPreviewSelecionadaLocal" type="button" class="btn btn-outline-danger btn-sm"
              @click="$emit('limpar-configuracao-preview')" title="Voltar ao padrão">
              ×
            </button>
          </div>
          <small v-if="carregandoModelosBanco" class="text-muted">Carregando modelos...</small>
        </div>
      </div>

      <!-- Navegação entre Arcos -->
      <div class="d-block d-md-none">
        <NavegacaoArcos
          :is-mobile="true"
          :arco-atual="arcoAtual"
          :total-arcos="totalArcos"
          :total-pendulos="totalPendulosArcoAtual"
          :total-sensores="totalSensoresArcoAtual"
          :badge-class="badgeClass"
          :badge-text="badgeText"
          :nome-modelo="determinarModeloParaArcoFn ? (determinarModeloParaArcoFn(arcoAtual)?.nome || 'Modelo Padrão') : 'Modelo Padrão'"
          :modelo-editando="!!modeloArcoAtual"
          :configuracao-banco="!!configuracaoPreviewSelecionadaLocal"
          @mudar-arco="$emit('mudar-arco', $event)"
        />
      </div>
      <div class="d-none d-md-block">
        <NavegacaoArcos
          :is-mobile="false"
          :arco-atual="arcoAtual"
          :total-arcos="totalArcos"
          :total-pendulos="totalPendulosArcoAtual"
          :total-sensores="totalSensoresArcoAtual"
          :badge-class="badgeClass"
          :badge-text="badgeText"
          :nome-modelo="determinarModeloParaArcoFn ? (determinarModeloParaArcoFn(arcoAtual)?.nome || 'Modelo Padrão') : 'Modelo Padrão'"
          :modelo-editando="!!modeloArcoAtual"
          :configuracao-banco="!!configuracaoPreviewSelecionadaLocal"
          @mudar-arco="$emit('mudar-arco', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ImagemFundo from './compModelador/ImagemFundo.vue'
import ImagemFundoContainer from './compModelador/ImagemFundoContainer.vue'
import NavegacaoArcos from './compModelador/NavegacaoArcos.vue'
import Armazem from './compModelador/ArmazemSvg.vue'
import SiloTopoSvg from './compModelador/SiloTopoSvg.vue'
import SiloLateralSvg from './compModelador/SiloLateralSvg.vue'
import ArmazemTopoSvg from './compModelador/ArmazemTopoSvg.vue'

export default {
  name: 'ModeladorPreview',
  components: {
    ImagemFundo,
    ImagemFundoContainer,
    NavegacaoArcos,
    Armazem,
    SiloTopoSvg,
    SiloLateralSvg,
    ArmazemTopoSvg
  },
  props: {
    tipoAtivo: { type: String, required: true },
    visaoAtiva: { type: String, required: true },
    isMobile: { type: Boolean, default: false },
    opacidadesSvg: { type: Object, default: () => ({ geral: 1.0, pendulos: 1.0, estrutura: 1.0 }) },
    imagemFundoData: { type: Object, default: () => ({}) },
    containerDimensions: { type: Object, default: () => ({ width: 0, height: 0 }) },
    dadosVindosDoPreview: { type: Boolean, default: false },

    // Silo
    configSilo: { type: Object, default: () => ({}) },
    dados: { type: Object, default: () => ({}) },

    // Armazém Lateral
    configArmazemParaComponente: { type: Object, default: () => ({}) },
    modeloAtualParaComponente: { type: Object, default: null },
    dimensoesPersonalizadasParaComponente: { type: Object, default: null },

    // Armazém Topo
    modelosArcos: { type: Object, default: () => ({}) },
    quantidadeModelosArcos: { type: Number, default: 1 },
    modeloArcoAtual: { type: [Number, String], default: null },
    configTopoArmazem: { type: Object, default: () => ({}) },
    layoutTopoCarregado: { type: Object, default: null },
    arcoAtual: { type: Number, default: 1 },
    analiseArcos: { type: Object, default: null },
    getBadgeClassFn: { type: Function, default: null },
    getBadgeTextFn: { type: Function, default: null },

    // Navegação/Preview Banco
    carregandoModelosBanco: { type: Boolean, default: false },
    configsDisponiveis: { type: Array, default: () => [] },
    configuracaoPreviewSelecionada: { type: [String, Number], default: '' },

    // Função util para textos do header
    determinarModeloParaArcoFn: { type: Function, default: null },

    // Padrão lateral (mapa + modelos) vindo do parent para sincronização Topo↔Lateral
    lateralPadraoArcos: { type: Object, default: () => ({}) }
  },
  data() {
    return {
      configuracaoPreviewSelecionadaLocal: this.configuracaoPreviewSelecionada || ''
    }
  },
  computed: {
    previewTituloArmazem() {
      return this.modeloArcoAtual ? `EDITANDO: ${this.modelosArcos[this.modeloArcoAtual]?.nome || 'Modelo ' + this.modeloArcoAtual}` : 'Visualização Geral'
    },
    previewSubtituloArmazem() {
      if (this.modeloArcoAtual) {
        const pos = this.quantidadeModelosArcos === 1 ? 'Modelo Único' : (this.modelosArcos[this.modeloArcoAtual]?.posicao || '')
        return `${pos} | ${this.modeloArcoAtual}/${this.quantidadeModelosArcos}`
      }

      const nome = this.determinarModeloParaArcoFn ? (this.determinarModeloParaArcoFn(this.arcoAtual)?.nome || 'Padrão') : 'Padrão'
      return `${nome} | ${this.quantidadeModelosArcos} modelo${this.quantidadeModelosArcos > 1 ? 's' : ''}`
    },
    totalArcos() {
      return this.analiseArcos?.totalArcos || 1
    },
    totalPendulosArcoAtual() {
      return this.analiseArcos?.arcos?.[this.arcoAtual]?.totalPendulos || 0
    },
    totalSensoresArcoAtual() {
      return this.analiseArcos?.arcos?.[this.arcoAtual]?.totalSensores || 0
    },
    badgeClass() {
      return this.getBadgeClassFn ? this.getBadgeClassFn() : 'badge bg-info'
    },
    badgeText() {
      return this.getBadgeTextFn ? this.getBadgeTextFn() : 'TODOS'
    },
    // Adapter: objeto de configuração para ArmazemTopoSvg com mapeamento lateral/topo
    armazemTopoConfig() {
      const topo = this.configTopoArmazem || {}
      const modelos = this.modelosArcos || {}
      const totalArcos = Math.max(
        parseInt(topo.totalArcos) || 0,
        this.quantidadeModelosArcos || 0,
        this.analiseArcos?.totalArcos || 0,
        1
      )

      const determinarTipoArco = (arcoNum) => {
        const q = this.quantidadeModelosArcos || 1
        if (q === 1) return 'todos'
        if (q === 2) return arcoNum % 2 === 0 ? 'par' : 'impar'
        if (q === 3) {
          if (arcoNum === 1 || arcoNum === totalArcos) return 'frente_fundo'
          return arcoNum % 2 === 0 ? 'par' : 'impar'
        }
        if (q === 4) {
          if (arcoNum === 1) return 'frente'
          if (arcoNum === totalArcos) return 'fundo'
          return arcoNum % 2 === 0 ? 'par' : 'impar'
        }
        return 'todos'
      }

      const encontrarModeloPorPosicao = (posicao) => {
        const entry = Object.entries(modelos).find(([, m]) => m && m.posicao === posicao)
        if (!entry) return null
        const [indice, m] = entry
        return { indice: parseInt(indice), modelo: m }
      }

      const coletarPadraoXRel = (arcoRef, quantidade) => {
        const lateral = this.lateralPadraoArcos || {}
        const padrao = []
        for (let i = 1; i <= quantidade; i++) {
          const idGeral = `A${arcoRef}_${i}`
          const idModelo = `${arcoRef}_${i}`
          const v = (lateral?.[arcoRef]?.[idGeral] ?? lateral?.[arcoRef]?.[idModelo])
          padrao.push(Number.isFinite(v) ? v : 0.5)
        }
        return padrao
      }

      const mapaArcos = {}
      for (let a = 1; a <= totalArcos; a++) {
        mapaArcos[a] = determinarTipoArco(a)
      }

      const modelosLaterais = {}
      const tipos = new Set(Object.values(mapaArcos))
      tipos.forEach(tipo => {
        let arcoRef = 1
        if (tipo === 'fundo') arcoRef = totalArcos
        else if (tipo === 'par') arcoRef = 2 <= totalArcos ? 2 : 1
        else if (tipo === 'impar') arcoRef = 1
        else if (tipo === 'frente_fundo') arcoRef = 1
        else if (tipo === 'frente') arcoRef = 1
        else if (tipo === 'todos') arcoRef = 1

        const encontrado = encontrarModeloPorPosicao(tipo)
        let quantidade = encontrado?.modelo?.quantidadePendulos
        if (!quantidade && tipo === 'frente_fundo') {
          const alt = encontrarModeloPorPosicao('frente') || encontrarModeloPorPosicao('fundo')
          quantidade = alt?.modelo?.quantidadePendulos
        }
        if (!quantidade) {
          const first = Object.values(modelos)[0]
          quantidade = first?.quantidadePendulos || 3
        }

        modelosLaterais[tipo] = {
          padraoXRel: coletarPadraoXRel(arcoRef, quantidade)
        }
      })

      return {
        modelosArcos: modelos,
        topo,
        lateral: {
          modelos: modelosLaterais,
          mapaArcos,
          regraParImpar: true
        }
      }
    }
  },
  watch: {
    configuracaoPreviewSelecionada(val) {
      this.configuracaoPreviewSelecionadaLocal = val || ''
    }
  }
}
</script>

<style scoped>
/* Nenhum estilo adicional; reutiliza utilitários Bootstrap e estilos dos filhos */
</style>
