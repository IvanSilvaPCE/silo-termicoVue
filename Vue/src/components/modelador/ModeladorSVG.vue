<template>
  <div class="container-fluid p-0">
    <div class="row g-0">
      <!-- Painel de Controles -->
      <div class="col-xl-3 col-lg-4 col-md-5 col-sm-12 modelador-painel-controles" :style="{
        height: isMobile ? 'auto' : '100vh',
        overflowY: isMobile ? 'visible' : 'auto',
        position: 'relative',
        borderRight: '2px solid #C6C6C6',
        backgroundColor: '#f8f9fa',
        zIndex: 1000,
        maxHeight: isMobile ? 'none' : '100vh'
      }">
        <div class="p-2">
          <h5 class="text-center mb-3" style="color: #06335E; font-weight: 600;">Modelador de Layouts</h5>

          <!-- Seletor de Tipo -->
          <SeletorTipo v-model="tipoAtivo" @input="onTipoChange" />

          <!-- Sistema de Etapas para Silo -->
          <StepperSilo 
            v-if="tipoAtivo === 'silo'" 
            :etapa-atual="etapaAtualSilo"
            @mudar-etapa="mudarEtapaSilo"
            @finalizar-configuracao="finalizarConfiguracaoSilo"
          />

          <!-- Etapa 1: Dados do Silo (Escolha Editar/Criar) -->
          <div v-if="tipoAtivo === 'silo' && etapaAtualSilo === 1" class="card mb-3">
            <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                 @click="toggleAcordeon('siloDados')"
                 role="button" 
                 tabindex="0"
                 :aria-expanded="acordeonAberto.siloDados"
                 @keydown.enter="toggleAcordeon('siloDados')"
                 @keydown.space.prevent="toggleAcordeon('siloDados')">
              <div class="d-flex justify-content-between align-items-center text-white">
                <div class="d-flex align-items-center">
                  <i class="fa fa-id-card me-2"></i>
                  <span class="fw-bold">Dados do Equipamento</span>
                </div>
                <i :class="['fa', acordeonAberto.siloDados ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </div>
            </div>
            <div v-show="acordeonAberto.siloDados" class="card-body p-2">
              <div class="row g-2">
                <!-- Seleção de modo: Editar modelo pronto ou Criar novo -->
                <div class="col-12">
                  <div class="btn-group w-100 modo-dados-toggle" role="group" aria-label="Selecionar modo de entrada">
                    <input type="radio" class="btn-check" name="modoDadosSilo" id="modoEditar"
                           autocomplete="off" value="editar" v-model="modoDadosSilo">
                    <label class="btn btn-outline-primary btn-sm flex-fill" for="modoEditar">
                      <i class="fa fa-pencil-square-o me-1"></i>Editar modelo pronto
                    </label>

                    <input type="radio" class="btn-check" name="modoDadosSilo" id="modoCriar"
                           autocomplete="off" value="criar" v-model="modoDadosSilo">
                    <label class="btn btn-outline-primary btn-sm flex-fill" for="modoCriar">
                      <i class="fa fa-plus me-1"></i>Criar novo
                    </label>
                  </div>
                </div>

                <!-- Lista de modelos salvos (via backend) -->
                <div class="col-12" v-if="modoDadosSilo === 'editar'">
                  <label class="form-label small">Modelos salvos</label>
                  <select class="form-select form-select-sm" v-model="modeloSelecionadoMock">
                    <option value="">Selecione um modelo salvo</option>
                    <option v-for="m in configsDisponiveis" :key="m.id_svg" :value="m.id_svg">
                      {{ m.nm_modelo }} • {{ m.tp_svg === 'S' ? 'Silo' : 'Armazém' }} / {{ m.vista_svg === 'T' ? 'Topo' : 'Lateral' }}
                    </option>
                  </select>
                  <small class="text-muted d-block mt-1" v-if="modeloSelecionadoMock">
                    Modelo selecionado para edição.
                  </small>
                </div>

                <!-- Campos para criar novo -->
                <div class="col-12" v-if="modoDadosSilo === 'criar'">
                  <label class="form-label small">Fabricante</label>
                  <input type="text" class="form-control form-control-sm" placeholder="Ex.: ACME"
                         v-model.trim="configSilo.fabricante" />
                </div>
                <div class="col-12" v-if="modoDadosSilo === 'criar'">
                  <label class="form-label small">Modelo</label>
                  <input type="text" class="form-control form-control-sm" placeholder="Ex.: SL-2000"
                         v-model.trim="configSilo.modelo" />
                </div>
              </div>
            </div>
          </div>

          <!-- Sistema de Etapas para Armazém -->
          <StepperArmazem 
            v-if="tipoAtivo === 'armazem'" 
            :etapa-atual="etapaAtualArmazem"
            @mudar-etapa="mudarEtapaArmazem"
            @finalizar-configuracao="finalizarConfiguracaoArmazem"
          />

          <!-- Configuração de Pêndulos para Silo - APENAS Etapa 1 -->
          <PendulosSiloConfig 
            v-if="tipoAtivo === 'silo' && etapaAtualSilo === 1"
            :config-silo="configSilo"
            :acordeon-aberto="acordeonAberto.pendulosSilo"
            @toggle-acordeon="toggleAcordeon('pendulosSilo')"
            @quantidade-pendulos-change="onQuantidadePendulosSiloChange"
            @reset-field="resetSiloField"
            @alterar-sensores="alterarSensoresSilo"
            @set-sensores-pendulo="setSensoresPenduloSilo"
            @tipo-posicao-change="onTipoPosicaoPenduloChange"
            @tipo-cabo-change="onTipoCaboPenduloChange"
            @aplicar-sensores-uniformes="aplicarSensoresUniformesSilo"
            @resetar-sensores-padrao="resetarSensoresPadraoSilo"
          />

          <!-- Controles do Topo do Silo - Etapa 2: Topo -->
          <SiloTopoControles
            v-if="tipoAtivo === 'silo' && etapaAtualSilo === 3"
            :config-silo="configSilo"
            :acordeon-aberto="acordeonAberto.siloTopo"
            @toggle-acordeon="toggleAcordeon('siloTopo')"
            @rotacao-fundo-change="onRotacaoFundoChange"
            @rotacao-pendulos-change="onRotacaoPendulosChange"
            @afastamento-camada-change="onAfastamentoCamadaChange"
            @tamanho-circulo-change="onTamanhoCirculoChange"
            @espessura-borda-change="onEspessuraBordaCirculoChange"
            @resetar-controles-topo="resetarControlesTopo"
          />

          <!-- Configurações do Silo - Etapa 1: Lateral -->
          <div v-if="tipoAtivo === 'silo' && etapaAtualSilo === 2" class="card mb-3">
            <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                 @click="toggleAcordeon('siloLateral')"
                 role="button" 
                 tabindex="0"
                 :aria-expanded="acordeonAberto.siloLateral"
                 @keydown.enter="toggleAcordeon('siloLateral')"
                 @keydown.space.prevent="toggleAcordeon('siloLateral')">
              <div class="d-flex justify-content-between align-items-center text-white">
                <div class="d-flex align-items-center">
                  <i class="fa fa-cogs me-2"></i>
                  <span class="fw-bold">Configurações do Silo</span>
                </div>
                <i :class="['fa', acordeonAberto.siloLateral ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </div>
            </div>
            <div v-show="acordeonAberto.siloLateral" class="card-body p-2" style="max-height: 450px; overflow-y: auto;">
              <ControlesSiloLateral :config-silo="configSilo" @silo-change="onSiloChange"
                @reset-field="resetSiloField" />
            </div>
          </div>

          <!-- Etapa 4: Resumo e Salvar (apenas Silo) -->
          <div v-if="tipoAtivo === 'silo' && etapaAtualSilo === 4" class="card mb-3">
            <div class="card-header p-3" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
              <div class="d-flex align-items-center text-white">
                <i class="fa fa-check-circle me-2"></i>
                <span class="fw-bold">Resumo da Configuração</span>
              </div>
            </div>
            <div class="card-body">
              <div class="alert alert-success mb-3">
                <i class="fa fa-info-circle me-2"></i>
                <strong>Configuração Pronta!</strong><br>
                <small>Revise as configurações abaixo e clique em "Salvar Configuração" para finalizar.</small>
              </div>

                            <!-- Resumo das Configura��es -->
              <div class="mb-3">
                <h6 class="fw-bold mb-2">
                  <i class="fa fa-cog me-1"></i>Configura��es do Silo
                </h6>
                <ul class="list-unstyled mb-0 small">
                  <li><i class="fa fa-check text-success me-2"></i>Quantidade de P�ndulos: <strong>{{ configSilo.quantidadePendulos }}</strong></li>
                  <li><i class="fa fa-check text-success me-2"></i>Total de Sensores: <strong>{{ totalSensoresSilo }}</strong></li>
                  <li><i class="fa fa-check text-success me-2"></i>M�dia por P�ndulo: <strong>{{ mediaSensoresSilo.toFixed(1) }} sensores</strong></li>
                </ul>
              </div>

              <div class="mb-3">
                <h6 class="fw-bold mb-2"><i class="fa fa-id-card me-1"></i>Identifica��o</h6>
                <ul class="list-unstyled mb-0 small">
                  <li v-if="configSilo.fabricante"><i class="fa fa-check text-success me-2"></i>Fabricante: <strong>{{ configSilo.fabricante }}</strong></li>
                  <li v-if="configSilo.modelo"><i class="fa fa-check text-success me-2"></i>Modelo: <strong>{{ configSilo.modelo }}</strong></li>
                </ul>
              </div>

              <!-- Miniatura das Vistas -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="border rounded p-2 text-center">
                    <small class="d-block fw-bold mb-1">Vista Lateral</small>
                    <i class="fa fa-square-o fa-3x text-muted"></i>
                    <small class="d-block mt-1 text-success"><i class="fa fa-check"></i> Configurado</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="border rounded p-2 text-center">
                    <small class="d-block fw-bold mb-1">Vista Topo</small>
                    <i class="fa fa-circle-o fa-3x text-muted"></i>
                    <small class="d-block mt-1 text-success"><i class="fa fa-check"></i> Configurado</small>
                  </div>
                </div>
              </div>

              <!-- Botões de Ação -->
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm flex-fill" @click="mudarEtapaSilo(2)">
                  <i class="fa fa-arrow-left me-1"></i>Revisar Lateral
                </button>
                <button class="btn btn-outline-secondary btn-sm flex-fill" @click="mudarEtapaSilo(3)">
                  <i class="fa fa-arrow-left me-1"></i>Revisar Topo
                </button>
              </div>
            </div>
          </div>

          <!-- Seções para Armazém - Etapa 1: Lateral -->
          <template v-if="tipoAtivo === 'armazem' && etapaAtualArmazem === 1">
            <!-- Modelos de Arcos -->
            <div class="card mb-3">
              <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                   @click="toggleAcordeon('modelosArcos')"
                   role="button" 
                   tabindex="0"
                   :aria-expanded="acordeonAberto.modelosArcos"
                   @keydown.enter="toggleAcordeon('modelosArcos')"
                   @keydown.space.prevent="toggleAcordeon('modelosArcos')">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="d-flex align-items-center">
                    <i class="fa fa-cubes me-2"></i>
                    <span class="fw-bold">Modelos de Arcos</span>
                  </div>
                  <i :class="['fa', acordeonAberto.modelosArcos ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
              </div>
              <div v-show="acordeonAberto.modelosArcos">
                <div class="section-progress">
                  <div class="section-progress-title">Passo 1: Definir Modelos de Arcos</div>
                  <div class="section-progress-description">Configure os diferentes modelos de arcos do armazém</div>
                </div>
                <div class="config-scroll-area">
                  <ModelosArcos :quantidade-modelos-arcos="quantidadeModelosArcos" :modelo-arco-atual="modeloArcoAtual"
                    :modelos-arcos="modelosArcos" :modelos-salvos="modelosSalvos" :modelo-nome="modeloNome"
                    :modelo-posicao="modeloPosicao" :cabo-selecionado-posicionamento="caboSelecionadoPosicionamento"
                    :posicoes-cabos="posicoesCabos" @quantidade-modelos-change="onQuantidadeModelosChange"
                    @modelo-arco-change="onModeloArcoChange" @nome-modelo-change="onNomeModeloChange"
                    @posicao-arco-change="onPosicaoArcoChange" @alterar-quantidade-pendulos="alterarQuantidadePendulos"
                    @quantidade-pendulos-change="onQuantidadePendulosChange"
                    @update:cabo-selecionado-posicionamento="caboSelecionadoPosicionamento = $event"
                    @posicao-cabo-change="onPosicaoCaboChange" @resetar-posicoes-cabos="resetarPosicoesCabos"
                    @salvar-modelo-atual="salvarModeloAtual" @modelo-dados-atualizados="onModeloDadosAtualizados" />
                </div>
              </div>
            </div>

            <!-- Dimensões Básicas -->
            <div class="card mb-3">
              <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                   @click="toggleAcordeon('dimensoes')"
                   role="button" 
                   tabindex="0"
                   :aria-expanded="acordeonAberto.dimensoes"
                   @keydown.enter="toggleAcordeon('dimensoes')"
                   @keydown.space.prevent="toggleAcordeon('dimensoes')">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="d-flex align-items-center">
                    <i class="fa fa-arrows-alt me-2"></i>
                    <span class="fw-bold">Dimensões Básicas</span>
                  </div>
                  <i :class="['fa', acordeonAberto.dimensoes ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
              </div>
              <div v-show="acordeonAberto.dimensoes">
                <div class="section-progress">
                  <div class="section-progress-title">Passo 2: Dimensões do Armazém</div>
                  <div class="section-progress-description">Configure as medidas principais da estrutura</div>
                </div>
                <div class="config-scroll-area">
                  <DimensoesBasicas :config-armazem="configArmazem" @armazem-change="onArmazemChange"
                    @dimensoes-alteradas="onDimensoesAlteradas" />
                </div>
              </div>
            </div>

            <!-- Configuração do Telhado -->
            <div class="card mb-3">
              <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                   @click="toggleAcordeon('telhado')"
                   role="button" 
                   tabindex="0"
                   :aria-expanded="acordeonAberto.telhado"
                   @keydown.enter="toggleAcordeon('telhado')"
                   @keydown.space.prevent="toggleAcordeon('telhado')">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="d-flex align-items-center">
                    <i class="fa fa-home me-2"></i>
                    <span class="fw-bold">Configuração do Telhado</span>
                  </div>
                  <i :class="['fa', acordeonAberto.telhado ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
              </div>
              <div v-show="acordeonAberto.telhado">
                <div class="section-progress">
                  <div class="section-progress-title">Passo 3: Estilo do Telhado</div>
                  <div class="section-progress-description">Personalize a cobertura do armazém</div>
                </div>
                <div class="config-scroll-area">
                  <ConfiguracaoTelhado :config-armazem="configArmazem" @armazem-change="onArmazemChange" />
                </div>
              </div>
            </div>

            <!-- Configuração do Fundo -->
            <div class="card mb-3">
              <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                   @click="toggleAcordeon('fundo')"
                   role="button" 
                   tabindex="0"
                   :aria-expanded="acordeonAberto.fundo"
                   @keydown.enter="toggleAcordeon('fundo')"
                   @keydown.space.prevent="toggleAcordeon('fundo')">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="d-flex align-items-center">
                    <i class="fa fa-level-down me-2"></i>
                    <span class="fw-bold">Configuração do Fundo</span>
                  </div>
                  <i :class="['fa', acordeonAberto.fundo ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
              </div>
              <div v-show="acordeonAberto.fundo">
                <div class="section-progress">
                  <div class="section-progress-title">Passo 4: Base do Armazém</div>
                  <div class="section-progress-description">Configure a estrutura inferior</div>
                </div>
                <div class="config-scroll-area">
                  <ConfiguracaoFundo :config-armazem="configArmazem" @armazem-change="onArmazemChange" />
                </div>
              </div>
            </div>

            <!-- Configuração dos Sensores -->
            <div class="card mb-3">
              <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                   @click="toggleAcordeon('sensores')"
                   role="button" 
                   tabindex="0"
                   :aria-expanded="acordeonAberto.sensores"
                   @keydown.enter="toggleAcordeon('sensores')"
                   @keydown.space.prevent="toggleAcordeon('sensores')">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="d-flex align-items-center">
                    <i class="fa fa-wifi me-2"></i>
                    <span class="fw-bold">Configuração dos Sensores</span>
                  </div>
                  <i :class="['fa', acordeonAberto.sensores ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
              </div>
              <div v-show="acordeonAberto.sensores">
                <div class="section-progress">
                  <div class="section-progress-title">Passo 5: Posicionamento de Sensores</div>
                  <div class="section-progress-description">Defina os sensores e suas posições</div>
                </div>
                <div class="config-scroll-area">
                  <ConfiguracaoSensores :config-armazem="configArmazem" :modelo-arco-atual="modeloArcoAtual"
                    :quantidade-pendulos="modeloArcoAtual ? (modelosArcos[modeloArcoAtual]?.quantidadePendulos || 0) : 0"
                    :sensores-por-pendulo="modeloArcoAtual ? (modelosArcos[modeloArcoAtual]?.sensoresPorPendulo || {}) : {}"
                    @armazem-change="onArmazemChange" @sensores-cabo-change="onSensoresCaboChange"
                    @aplicar-sensores-uniformes="onAplicarSensoresUniformes" />
                </div>
              </div>
            </div>

            <!-- Controles da Lateral do Armazém -->
            <div class="card mb-3">
              <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                   @click="toggleAcordeon('armazemLateral')"
                   role="button" 
                   tabindex="0"
                   :aria-expanded="acordeonAberto.armazemLateral"
                   @keydown.enter="toggleAcordeon('armazemLateral')"
                   @keydown.space.prevent="toggleAcordeon('armazemLateral')">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="d-flex align-items-center">
                    <i class="fa fa-sliders me-2"></i>
                    <span class="fw-bold">Controles da Lateral do Armazém</span>
                  </div>
                  <i :class="['fa', acordeonAberto.armazemLateral ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
              </div>
              <div v-show="acordeonAberto.armazemLateral">
                <div class="section-progress">
                  <div class="section-progress-title">Passo 6: Ajustes da Vista Lateral</div>
                  <div class="section-progress-description">Configure detalhes da visualização lateral</div>
                </div>
                <div class="config-scroll-area">
                  <ControlesArmazemLateral :config-armazem="configArmazem" @armazem-change="onArmazemChange" />
                </div>
              </div>
            </div>

          </template>

          <!-- Etapa 2: Vista Topo (Armazém) -->
          <template v-if="tipoAtivo === 'armazem' && etapaAtualArmazem === 2">
            <div class="card mb-3">
              <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                   @click="toggleAcordeon('armazemTopo')"
                   role="button" 
                   tabindex="0"
                   :aria-expanded="acordeonAberto.armazemTopo"
                   @keydown.enter="toggleAcordeon('armazemTopo')"
                   @keydown.space.prevent="toggleAcordeon('armazemTopo')">
                <div class="d-flex justify-content-between align-items-center text-white">
                  <div class="d-flex align-items-center">
                    <i class="fa fa-compass me-2"></i>
                    <span class="fw-bold">Controles do Topo</span>
                  </div>
                  <i :class="['fa', acordeonAberto.armazemTopo ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                </div>
              </div>
              <div v-show="acordeonAberto.armazemTopo">
                <div class="section-progress">
                  <div class="section-progress-title">Vista do Topo - Distribuição e Layout</div>
                  <div class="section-progress-description">Configure a distribuição de arcos e células na vista superior</div>
                </div>
                <div class="config-scroll-area">
                  <ControlesArmazemTopo 
                    :quantidade-modelos-arcos="quantidadeModelosArcos"
                    :config-topo="configTopoArmazem"
                    @update:configTopo="configTopoArmazem = $event"
                    @quantidade-celulas-change="onQuantidadeCelulasChange"
                    @total-arcos-change="onTotalArcosChange"
                    @total-pendulos-change="onTotalPendulosChange"
                    @distribuicao-change="onDistribuicaoArcosChange"
                    @largura-arcos-change="onLarguraArcosChange"
                    @distancia-vertical-change="onDistanciaVerticalChange"
                    @separacao-horizontal-change="onSeparacaoHorizontalChange"
                    @resetar-topo="resetarControlesTopoArmazem"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Etapa 3: Resumo e Salvar (apenas Armazém) -->
          <div v-if="tipoAtivo === 'armazem' && etapaAtualArmazem === 3" class="card mb-3">
            <div class="card-header p-3" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
              <div class="d-flex align-items-center text-white">
                <i class="fa fa-check-circle me-2"></i>
                <span class="fw-bold">Resumo da Configuração do Armazém</span>
              </div>
            </div>
            <div class="card-body">
              <div class="alert alert-success mb-3">
                <i class="fa fa-info-circle me-2"></i>
                <strong>Configuração Pronta!</strong><br>
                <small>Revise as configurações abaixo e clique em "Salvar Configuração" para finalizar.</small>
              </div>

                            <!-- Resumo das Configura��es -->
              <div class="mb-3">
                <h6 class="fw-bold mb-2">
                  <i class="fa fa-cog me-1"></i>Configura��es do Silo
                </h6>
                <ul class="list-unstyled mb-0 small">
                  <li><i class="fa fa-check text-success me-2"></i>Quantidade de P�ndulos: <strong>{{ configSilo.quantidadePendulos }}</strong></li>
                  <li><i class="fa fa-check text-success me-2"></i>Total de Sensores: <strong>{{ totalSensoresSilo }}</strong></li>
                  <li><i class="fa fa-check text-success me-2"></i>M�dia por P�ndulo: <strong>{{ mediaSensoresSilo.toFixed(1) }} sensores</strong></li>
                </ul>
              </div>

              <div class="mb-3">
                <h6 class="fw-bold mb-2"><i class="fa fa-id-card me-1"></i>Identifica��o</h6>
                <ul class="list-unstyled mb-0 small">
                  <li v-if="configSilo.fabricante"><i class="fa fa-check text-success me-2"></i>Fabricante: <strong>{{ configSilo.fabricante }}</strong></li>
                  <li v-if="configSilo.modelo"><i class="fa fa-check text-success me-2"></i>Modelo: <strong>{{ configSilo.modelo }}</strong></li>
                </ul>
              </div>

              <!-- Miniatura das Vistas -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <div class="border rounded p-2 text-center">
                    <small class="d-block fw-bold mb-1">Vista Lateral</small>
                    <i class="fa fa-square-o fa-3x text-muted"></i>
                    <small class="d-block mt-1 text-success"><i class="fa fa-check"></i> Configurado</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="border rounded p-2 text-center">
                    <small class="d-block fw-bold mb-1">Vista Topo</small>
                    <i class="fa fa-circle-o fa-3x text-muted"></i>
                    <small class="d-block mt-1 text-success"><i class="fa fa-check"></i> Configurado</small>
                  </div>
                </div>
              </div>

              <!-- Botões de Ação -->
              <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm flex-fill" @click="mudarEtapaArmazem(1)">
                  <i class="fa fa-arrow-left me-1"></i>Revisar Lateral
                </button>
                <button class="btn btn-outline-secondary btn-sm flex-fill" @click="mudarEtapaArmazem(2)">
                  <i class="fa fa-arrow-left me-1"></i>Revisar Topo
                </button>
              </div>
            </div>
          </div>

          <!-- Controles -->
          <div class="card mb-3">
            <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                 @click="toggleAcordeon('controles')"
                 role="button" 
                 tabindex="0"
                 :aria-expanded="acordeonAberto.controles"
                 @keydown.enter="toggleAcordeon('controles')"
                 @keydown.space.prevent="toggleAcordeon('controles')">
              <div class="d-flex justify-content-between align-items-center text-white">
                <div class="d-flex align-items-center">
                  <i class="fa fa-gamepad me-2"></i>
                  <span class="fw-bold">Controles</span>
                </div>
                <i :class="['fa', acordeonAberto.controles ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </div>
            </div>
            <div v-show="acordeonAberto.controles" class="card-body">
              <div class="section-progress">
                <div class="section-progress-title">Ações Rápidas</div>
                <div class="section-progress-description">Resetar configurações ou voltar ao estado anterior</div>
              </div>
              <BotoesControle :tipo-ativo="tipoAtivo" :dados-vindos-do-preview="dadosVindosDoPreview"
                @resetar-padrao="resetarPadrao" @resetar-modelos-padrao="resetarModelosParaPadrao"
                @voltar-preview="voltarParaPreview" @resetar-posicoes-manual="resetarPosicoesManual" />
            </div>
          </div>

          <!-- Gerenciamento -->
          <div class="card mb-3">
            <div class="card-header p-3" style="background-color: #06335E; cursor: pointer;" 
                 @click="toggleAcordeon('gerenciamento')"
                 role="button" 
                 tabindex="0"
                 :aria-expanded="acordeonAberto.gerenciamento"
                 @keydown.enter="toggleAcordeon('gerenciamento')"
                 @keydown.space.prevent="toggleAcordeon('gerenciamento')">
              <div class="d-flex justify-content-between align-items-center text-white">
                <div class="d-flex align-items-center">
                  <i class="fa fa-database me-2"></i>
                  <span class="fw-bold">Gerenciamento</span>
                </div>
                <i :class="['fa', acordeonAberto.gerenciamento ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
              </div>
            </div>
            <div v-show="acordeonAberto.gerenciamento" class="card-body">
              <div class="section-progress">
                <div class="section-progress-title">Salvar e Carregar</div>
                <div class="section-progress-description">Gerencie suas configurações salvas</div>
              </div>
              <div class="config-scroll-area">
                <!-- Gerenciador de Configurações (Banco de Dados) -->
                <GerenciadorModelosBanco :tipo-ativo="tipoAtivo" :quantidade-modelos-arcos="quantidadeModelosArcos"
                  :modelos-arcos="modelosArcos" :modelos-salvos="modelosSalvos" :config-silo="configSilo"
                  :config-armazem="configArmazem" @configuracao-carregada="carregarConfiguracaoDoBanco"
                  @mostrar-toast="mostrarToast" @resetar-apos-salvamento-banco="resetarTudoAposSalvamentoBanco" />

                <!-- Gerenciador de Configurações (Backup Local) -->
                <GerenciadorConfiguracoes />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de Visualização -->
      <div class="col-xl-9 col-lg-8 col-md-7 col-sm-12" :style="{
        padding: '10px',
        height: isMobile ? 'auto' : '100vh',
        overflow: isMobile ? 'visible' : 'hidden',
        minHeight: isMobile ? '400px' : '100vh'
      }">
        <div class="d-flex justify-content-center align-items-center h-100" style="minHeight: 400px">
          <div class="card w-100" :style="{
            maxWidth: '100%',
            minHeight: '400px',
            maxHeight: 'calc(100vh - 60px)',
            height: 'calc(100vh - 60px)'
          }">
            <div class="card-header text-white" style="background-color: #06335E;">
              <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between">
                <h6 class="mb-2 mb-md-1" style="font-weight: 500;">
                  Preview - {{ tipoAtivo === 'silo' ? 'Silo' : `${modeloArcoAtual ? `EDITANDO:
                  ${modelosArcos[modeloArcoAtual]?.nome || 'Modelo ' + modeloArcoAtual}` : 'Visualização Geral'}` }}
                  <span v-if="dadosVindosDoPreview" class="badge ms-2" style="background-color: #D32626;"
                    title="Dados carregados do preview do Armazém">
                    <i class="fa fa-bar-chart me-1"></i>PREVIEW
                  </span>
                </h6>
                <div class="d-flex align-items-center">
                  <small v-if="tipoAtivo === 'armazem'" class="text-white-50 me-3">
                    {{ modeloArcoAtual ?
                      `${quantidadeModelosArcos === 1 ? 'Modelo Único' : modelosArcos[modeloArcoAtual]?.posicao || ''} |
                                        ${modeloArcoAtual}/${quantidadeModelosArcos}` :
                      `${determinarModeloParaArco(arcoAtual)?.nome || 'Padrão'} | ${quantidadeModelosArcos}
                                        modelo${quantidadeModelosArcos > 1 ? 's' : ''}`
                    }}
                  </small>
                  <!-- Componente de Imagem de Fundo -->
                  <ImagemFundo :container-dimensions="containerDimensions" :imagem-inicial="imagemFundoData"
                    :tipo-ativo="tipoAtivo" @imagem-mudou="onImagemFundoMudou" @opacidade-svg-mudou="onOpacidadeSvgMudou" @mostrar-toast="mostrarToast" />
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
                    @posicoes-atualizadas="onPosicoesAtualizadas"
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
                  />
                </template>

                <!-- Visão de Topo do Armazém -->
                <template v-else-if="tipoAtivo === 'armazem' && visaoAtiva === 'topo'">
                  <ImagemFundoContainer :imagem-fundo-data="imagemFundoData" />
                  <ArmazemTopoSvg 
                    :config="{ modelosArcos }"
                    :modelo-atual="modeloArcoAtual"
                    :quantidade-modelos="quantidadeModelosArcos"
                    :imagem-fundo="imagemFundoData"
                    :opacidades-svg="opacidadesSvg"
                    :is-mobile="isMobile"
                    @posicoes-atualizadas="onPosicoesAtualizadas"
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
                    <Armazem :config="configArmazemParaComponente" :dados-sensores="dados"
                      :modelo-atual="modeloAtualParaComponente"
                      :dimensoes-personalizadas="dimensoesPersonalizadasParaComponente" :imagem-fundo="imagemFundoData"
                      @dimensoes-atualizadas="onDimensoesAtualizadas" @dimensoes-aplicadas="onDimensoesAplicadas"
                      @salvar-dimensoes-modelo="onSalvarDimensoesModelo" @posicoes-atualizadas="onPosicoesAtualizadas"
                      style="width: 100%; height: 100%; min-height: 400px;" />
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
                    <select class="form-select form-select-sm" v-model="configuracaoPreviewSelecionada"
                      @change="aplicarModeloBancoNoPreview" :disabled="carregandoModelosBanco">
                      <option value="">Configuração Padrão</option>
                      <option v-for="modelo in configsDisponiveis" :key="modelo.id_svg" :value="modelo.id_svg">
                        {{ modelo.nm_modelo }}
                      </option>
                    </select>
                    <button v-if="configuracaoPreviewSelecionada" type="button" class="btn btn-outline-danger btn-sm"
                      @click="limparConfiguracaoPreview" title="Voltar ao padrão">
                      ×
                    </button>
                  </div>
                  <small v-if="carregandoModelosBanco" class="text-muted">Carregando modelos...</small>
                </div>
              </div>

              <!-- Navegação mobile/desktop consolidada -->
              <div class="d-block d-md-none">
                <NavegacaoArcos :is-mobile="true" :arco-atual="arcoAtual" :total-arcos="analiseArcos.totalArcos"
                  :total-pendulos="analiseArcos.arcos[arcoAtual]?.totalPendulos || 0"
                  :total-sensores="analiseArcos.arcos[arcoAtual]?.totalSensores || 0" :badge-class="getBadgeClass()"
                  :badge-text="getBadgeText()" :nome-modelo="determinarModeloParaArco(arcoAtual)?.nome || 'Modelo Padrão'"
                  :modelo-editando="!!modeloArcoAtual" :configuracao-banco="!!configuracaoPreviewSelecionada"
                  @mudar-arco="mudarArco($event, false)" />
              </div>

              <div class="d-none d-md-block">
                <NavegacaoArcos :is-mobile="false" :arco-atual="arcoAtual" :total-arcos="analiseArcos.totalArcos"
                  :total-pendulos="analiseArcos.arcos[arcoAtual]?.totalPendulos || 0"
                  :total-sensores="analiseArcos.arcos[arcoAtual]?.totalSensores || 0" :badge-class="getBadgeClass()"
                  :badge-text="getBadgeText()" :nome-modelo="determinarModeloParaArco(arcoAtual)?.nome || 'Modelo Padrão'"
                  :modelo-editando="!!modeloArcoAtual" :configuracao-banco="!!configuracaoPreviewSelecionada"
                  @mudar-arco="mudarArco($event, false)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LayoutManager from './utils/layoutManager.js'
import SeletorTipo from './compModelador/SeletorTipo.vue'
import SeletorVisao from './compModelador/SeletorVisao.vue'
import StepperSilo from './compModelador/StepperSilo.vue'
import StepperArmazem from './compModelador/StepperArmazem.vue'
import ControlesSiloLateral from './compModelador/ControlesSiloLateral.vue'
import ControlesArmazemLateral from './compModelador/ControlesArmazemLateral.vue'
import ControlesArmazemTopo from './compModelador/ControlesArmazemTopo.vue'
import ModelosArcos from './compModelador/ModelosArcos.vue'
import PosicionamentoCabos from './compModelador/PosicionamentoCabos.vue'
import PendulosSiloConfig from './compModelador/PendulosSiloConfig.vue'
import SiloTopoControles from './compModelador/SiloTopoControles.vue'
import DimensoesBasicas from './compModelador/DimensoesBasicas.vue'
import ConfiguracaoTelhado from './compModelador/ConfiguracaoTelhado.vue'
import ConfiguracaoFundo from './compModelador/ConfiguracaoFundo.vue'
import ConfiguracaoSensores from './compModelador/ConfiguracaoSensores.vue'
import BotoesControle from './compModelador/BotoesControle.vue'
import GerenciadorModelosBanco from './compModelador/GerenciadorModelosBanco.vue'
import GerenciadorConfiguracoes from './compModelador/GerenciadorConfiguracoes.vue'

import ImagemFundo from './compModelador/ImagemFundo.vue'
import ImagemFundoContainer from './compModelador/ImagemFundoContainer.vue'
import NavegacaoArcos from './compModelador/NavegacaoArcos.vue'
import Armazem from './compModelador/ArmazemSvg.vue'
import SiloTopoSvg from './compModelador/SiloTopoSvg.vue'
import SiloLateralSvg from './compModelador/SiloLateralSvg.vue'
import ArmazemTopoSvg from './compModelador/ArmazemTopoSvg.vue'
import { modeloSvgService } from './services/modeloSvgService.js'
import { configuracaoService } from './services/configuracaoService.js'
import dadosSilo from './dadosSilo.js'

// Funções factory para configurações padrão que retornam deep copies
// para evitar mutação compartilhada dos arrays
function getDefaultSiloConfig() {
  return {
    // Identificação do equipamento
    fabricante: '',
    modelo: '',
    // Dimensões básicas
    lb: 200,
    hs: 180,
    hb: 15,
    eb: 2,
    // Configurações de sensores
    escala_sensores: 16,
    dist_y_sensores: 12,
    // Configurações de cabos básicas
    pos_x_cabos_uniforme: 1,
    pos_x_cabo: [50, 25], // Array criado novo a cada chamada
    pos_y_cabo: [160, 160, 160, 160, 160], // Array criado novo a cada chamada
    // Configurações de aeradores básicas
    aeradores_ativo: false,
    na: 4,
    ds: 30,
    dy: 0,
    da: 35,
    // Configurações avançadas dos aeradores
    aerador_rotacao: 0,
    aerador_escala: 1,
    // Layout e dimensões SVG
    largura_svg: 525,
    altura_svg: 188,
    margem_interna: 10,
    // Posicionamento de cabos
    distancia_cabos: 30,
    offset_cabos: 9,
    altura_cabos: 152,
    // Configurações visuais
    transparencia_fundo: 1,
    espessura_borda: 1.6,
    mostrar_sombra: false,
    mostrar_grade: false,
    // Animações e efeitos
    animacao_aeradores: false,
    velocidade_animacao: 2,
    efeito_hover: false,
    // Configurações avançadas
    precisao_grid: 1,
    modo_responsivo: false,
    otimizar_performance: false,
    // Configurações de pêndulos
    quantidadePendulos: 5,
    sensoresPorPendulo: {
      1: 5, 2: 5, 3: 5, 4: 5, 5: 5
    },
    tipoPosicaoPendulo: {
      1: 'central', 2: 'central', 3: 'central', 4: 'central', 5: 'central'
    },
    tipoCaboPendulo: {
      1: 'digital', 2: 'digital', 3: 'digital', 4: 'digital', 5: 'digital'
    },
    // Controles do Topo
    rotacaoFundo: 0,          // Rotação do fundo em graus (0-360)
    rotacaoPendulos: 0,       // Rotação global dos pêndulos (0-360)
    afastamentoPendulos: 1.0, // Multiplicador do afastamento dos pêndulos (0.5-1.5) - legado
    afastamentoLateral: 1.0,  // Afastamento da camada lateral (0.3-1.5)
    afastamentoCentral: 1.0,  // Afastamento da camada central (0.3-1.5)
    afastamentoIntermediario: 1.0,  // Afastamento da camada intermediária (0.3-1.5)
    tamanhoCirculoPendulo: 5.7138, // Tamanho do raio dos círculos dos pêndulos (3-15)
    espessuraBordaCirculo: 1.5 // Espessura da borda dos círculos (0-5)
  }
}

function getDefaultArmazemConfig() {
  return {
    pb: 185,
    lb: 350,
    hb: 30,
    hf: 6,
    lf: 250,
    le: 15,
    ht: 50,
    tipo_telhado: 1,
    curvatura_topo: 30,
    pontas_redondas: false,
    raio_pontas: 15,
    estilo_laterais: 'reta',
    curvatura_laterais: 0,
    tipo_fundo: 0,
    altura_fundo_reto: 10,
    altura_funil_v: 18,
    posicao_ponta_v: 0,
    inclinacao_funil_v: 1,
    largura_abertura_v: 20,
    altura_duplo_v: 22,
    posicao_v_esquerdo: -1,
    posicao_v_direito: 1,
    largura_abertura_duplo_v: 2,
    altura_plataforma_duplo_v: 0.3,
    largura_plataforma_duplo_v: 10,
    deslocamento_horizontal_fundo: 0,
    deslocamento_vertical_fundo: -1,
    escala_sensores: 16,
    dist_y_sensores: 12,
    dist_x_sensores: 0,
    posicao_horizontal: 0,
    posicao_vertical: 0,
    afastamento_vertical_pendulo: 0
  }
}

export default {
  name: 'ModeladorSVG',
  components: {
    SeletorTipo,
    SeletorVisao,
    StepperSilo,
    StepperArmazem,
    ControlesSiloLateral,
    ControlesArmazemLateral,
    ControlesArmazemTopo,
    ModelosArcos,
    PosicionamentoCabos,
    PendulosSiloConfig,
    SiloTopoControles,
    DimensoesBasicas,
    ConfiguracaoTelhado,
    ConfiguracaoFundo,
    ConfiguracaoSensores,
    BotoesControle,
    GerenciadorModelosBanco,
    GerenciadorConfiguracoes,

    ImagemFundo,
    ImagemFundoContainer,
    NavegacaoArcos,
    Armazem,
    SiloTopoSvg,
    SiloLateralSvg,
    ArmazemTopoSvg
  },
    data() {
      return {
        // Estados para configurações do Silo
        configSilo: getDefaultSiloConfig(),
        // Modo de entrada dos dados do Silo
        modoDadosSilo: 'criar', // 'criar' | 'editar'
        modeloSelecionadoMock: '', // id do modelo selecionado no banco
      
      // Layout para geração do SVG do Silo
      layoutSilo: null,

      // Estados para configurações do Armazém
      configArmazem: getDefaultArmazemConfig(),

      // Estados para configurações do Topo do Armazém
      configTopoArmazem: {
        quantidadeCelulas: 2,
        totalArcos: 1,
        totalPendulos: 1,
        arcosFrente: 1,
        arcosParImpar: 0,
        arcosFundo: 1,
        larguraEntreArcos: 50,
        distanciaVertical: 20,
        separacaoHorizontal: 30
      },

      // Estados para modelos de arcos
      quantidadeModelosArcos: 1,
      modeloArcoAtual: null,
      modelosArcos: {
        1: {
          posicao: 'todos',
          config: {},
          nome: 'Modelo Único',
          quantidadePendulos: 3, // Padrão alterado para 3 pêndulos
          sensoresPorPendulo: {
            1: 4, // Pêndulo 1 tem 4 sensores
            2: 3, // Pêndulo 2 tem 3 sensores
            3: 5  // Pêndulo 3 tem 5 sensores
          }
        }
      },
      modelosSalvos: {},

      // Novos estados para posicionamento de cabos
      caboSelecionadoPosicionamento: null,
      posicoesCabos: {},

      // Estados para dados do JSON
      dados: null,
      dadosPortal: null,
      arcoAtual: 1,
      analiseArcos: null,
      layoutsAutomaticos: null,

      tipoAtivo: 'silo',
      visaoAtiva: 'lateral',
      etapaAtualSilo: 1, // 1 = Dados, 2 = Lateral, 3 = Topo, 4 = Salvar
      etapaAtualArmazem: 1, // 1 = Lateral, 2 = Topo, 3 = Salvar
      nomeConfiguracao: '',
      larguraSVG: 400,
      alturaSVG: 300,
      svgContent: '',
      forceUpdateLista: 0,
      dadosVindosDoPreview: false,
      configuracaoPreviewSelecionada: '',
      configPreviewAplicada: null,
      configuracaoAplicada: null,
      modelosBanco: [],
      carregandoModelosBanco: false,

      // Variáveis de modelagem individual removidas - não utilizadas

      // Estados para drag and drop
      isDragging: false,
      dragElement: null,
      dragType: null, // 'pendulo' ou 'sensor'
      dragOffset: { x: 0, y: 0 },
      posicoesManualPendulos: {},
      posicoesManualSensores: {},
      saveTimeout: null, // Para debounce do salvamento
      _globalsAdded: false, // 🔧 Estado específico da instância para listeners globais

      // NOVOS ESTADOS REATIVOS ADICIONADOS PARA CORREÇÃO DE ERRO
      modelosAtualizados: false, // Indica se houve alterações nos modelos que precisam ser salvas
      modelosConfigurados: {}, // Armazena configurações de modelos individuais
      quantidadeEsperada: 1, // Quantidade esperada de modelos
      temConfigGlobal: true, // Flag para indicar se há configuração global
      modelos: {}, // Armazena os dados dos modelos

      // Dados da imagem de fundo gerenciados pelo componente filho
      imagemFundoData: {
        url: null,
        x: 0,
        y: 0,
        scale: 1,
        opacity: 0.3
      },
      // Armazenar dados de imagem separados por tipo
      imagensFundoPorTipo: {
        silo: {
          url: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.3
        },
        armazem: {
          url: null,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0.3
        }
      },

      // Opacidades do SVG separadas da imagem de fundo
      opacidadesSvg: {
        geral: 1.0,
        pendulos: 1.0,
        estrutura: 1.0
      },

      // Estados para edição de modelos do banco
      modoEdicaoModeloBanco: false,
      modeloBancoEmEdicao: null,

      // Estados para o sistema de acordeon
      acordeonAberto: {
        configuracoes: true,      // Configurações principais (silo/armazém)
        siloDados: true,          // Dados do equipamento (somente silo, etapa 1)
        pendulosSilo: false,      // Configuração de pêndulos (somente silo)
        siloLateral: false,       // Controles da lateral do silo (somente visão lateral)
        siloTopo: false,         // Controles do topo do silo (somente visão topo)
        modelosArcos: false,      // Modelos de arcos (somente armazém)
        dimensoes: false,         // Dimensões básicas (somente armazém)
        telhado: false,          // Configuração do telhado (somente armazém)
        fundo: false,            // Configuração do fundo (somente armazém)
        sensores: false,         // Configuração dos sensores (somente armazém)
        armazemLateral: false,   // Controles da lateral do armazém (somente visão lateral)
        armazemTopo: false,      // Controles do topo do armazém (somente visão topo)
        controles: false,        // Botões de controle
        gerenciamento: false     // Gerenciadores de configurações
      }
    }
  },
  computed: {
    isMobile() {
      return typeof window !== 'undefined' && window.innerWidth <= 576
    },
      configsDisponiveis() {
        // Retornar modelos do banco filtrados por tipo e vista
        const tp = this.tipoAtivo === 'silo' ? 'S' : 'A'
        const vista = this.visaoAtiva === 'topo' ? 'T' : 'F'
        return this.modelosBanco.filter(m => m.tp_svg === tp && m.vista_svg === vista)
      },
      
    modeloNome: {
      get() {
        return this.modeloArcoAtual ? this.modelosArcos[this.modeloArcoAtual]?.nome || '' : ''
      },
      set(value) {
        if (this.modeloArcoAtual) {
          this.modelosArcos[this.modeloArcoAtual].nome = value
          this.salvarModelosAutomatico()
        }
      }
    },
    modeloPosicao: {
      get() {
        return this.modeloArcoAtual ? this.modelosArcos[this.modeloArcoAtual]?.posicao || '' : ''
      },
      set(value) {
        if (this.modeloArcoAtual) {
          this.modelosArcos[this.modeloArcoAtual].posicao = value
          this.salvarModelosAutomatico()
        }
      }
    },
    svgContentComFundo() {
      // Se há imagem de fundo, adicionar fundo transparente ao SVG
      if (this.imagemFundoData.url && this.svgContent) {
        // Adicionar retângulo de fundo semi-transparente para melhor visualização
        const fundoTransparente = `<rect x="0" y="0" width="${this.larguraSVG}" height="${this.alturaSVG}" fill="rgba(248, 249, 250, 0.1)" />`
        return fundoTransparente + this.svgContent
      }
      return this.svgContent
    },
    containerDimensions() {
      return {
        width: '100%',
        height: '100%'
      }
    },

    // Configuração preparada para o componente ArmazemSvg
    configArmazemParaComponente() {
      const config = this.configPreviewAplicada || this.configArmazem

      // Preparar configuração completa incluindo dados do modelo atual
      const configCompleta = {
        ...config,
        // Dados específicos do modelo se estiver editando
        quantidadePendulos: this.modeloArcoAtual ?
          (this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3) : 3,
        sensoresPorPendulo: this.modeloArcoAtual ?
          (this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {}) : {},

        // Posições manuais dos pêndulos e sensores (drag and drop)
        posicoesManualPendulos: { ...this.posicoesManualPendulos },
        posicoesManualSensores: { ...this.posicoesManualSensores },

        // Posições dos cabos (sistema antigo de compatibilidade)
        posicoesCabos: { ...this.posicoesCabos },

        // Dados do modelo específico se disponível
        modeloEspecifico: this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual] ? {
          quantidadePendulos: this.modelosArcos[this.modeloArcoAtual].quantidadePendulos || 3,
          sensoresPorPendulo: this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo || {},
          posicoesPendulos: this.posicoesManualPendulos,
          alturasSensores: this.construirAlturasSensores(this.posicoesManualPendulos, this.posicoesManualSensores, this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo), // Chamada para o novo método
          configuracaoGlobal: {
            escala_sensores: config.escala_sensores || 16,
            dist_y_sensores: config.dist_y_sensores || 12,
            dist_x_sensores: config.dist_x_sensores || 0,
            posicao_horizontal: config.posicao_horizontal || 0,
            posicao_vertical: config.posicao_vertical || 0,
            afastamento_vertical_pendulo: config.afastamento_vertical_pendulo || 0
          }
        } : null
      }

      return configCompleta
    },

    // Modelo atual preparado para o componente
    modeloAtualParaComponente() {
      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        return {
          quantidadePendulos: this.modelosArcos[this.modeloArcoAtual].quantidadePendulos || 3,
          sensoresPorPendulo: this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo || {},
          configuracao: this.modelosArcos[this.modeloArcoAtual].config || {}
        }
      }

      // Usar modelo determinado para o arco atual
      const modeloParaArco = this.determinarModeloParaArco(this.arcoAtual)
      if (modeloParaArco) {
        return {
          quantidadePendulos: modeloParaArco.quantidadePendulos || 3,
          sensoresPorPendulo: modeloParaArco.sensoresPorPendulo || {},
          configuracao: modeloParaArco.config || {}
        }
      }

      return {
        quantidadePendulos: 3,
        sensoresPorPendulo: { 1: 4, 2: 3, 3: 5 },
        configuracao: {}
      }
    },

    // Dimensões personalizadas se necessário
    dimensoesPersonalizadasParaComponente() {
      // Sempre retornar null para deixar o ArmazemSvg calcular suas próprias dimensões
      return null
    },

    // Computed properties para silo
    totalSensoresSilo() {
      let total = 0
      for (let i = 1; i <= (this.configSilo.quantidadePendulos || 5); i++) {
        total += this.configSilo.sensoresPorPendulo[i] || 5
      }
      return total
    },
    
    mediaSensoresSilo() {
      const quantidade = this.configSilo.quantidadePendulos || 5
      return this.totalSensoresSilo / quantidade
    }
  },
  created() {
    // Inicialização sem debounce
  },

  mounted() {
    // LIMPEZA AUTOMÁTICA NA INICIALIZAÇÃO - Remove posições salvas para começar limpo
    this.limparPosicoesInicializacao()

    this.resetarModelosParaPadrao()

    // Verificar se dados vieram do preview antes de carregar da API
    this.verificarDadosArcoRecebidos()

    // Carregar dados apenas se não vieram do preview
    if (!this.dadosVindosDoPreview) {
      this.carregarDadosAPI()
    }

    this.carregarModelosDoBanco()

    // NÃO carregar posições temporárias na inicialização - sempre começar limpo
    // this.carregarPosicoesTemporarias()

    this.inicializarPosicoesCabos()
    this.updateSVG()

    // 🔧 CORREÇÃO: Usar método centralizado e idempotente
    this.$nextTick(() => {
      this.reestabelecerEventListenersSeguro()
    })
  },

  beforeDestroy() {
    // Cleanup dos event listeners
    this.removerEventListeners()

    // Limpar timeout de salvamento se existir
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
  },
  watch: {
    'configArmazem.tipo_fundo': {
      handler(novoTipo) {
        this.configArmazem.deslocamento_vertical_fundo = this.obterDeslocamentoVerticalPadrao(novoTipo)
      }
    },
    tipoAtivo: {
      handler(novoTipo, tipoAnterior) {
        // Salvar imagem do tipo anterior
        if (tipoAnterior && this.imagemFundoData.url) {
          this.imagensFundoPorTipo[tipoAnterior] = { ...this.imagemFundoData }
        }
        // Carregar imagem do novo tipo
        this.imagemFundoData = { ...this.imagensFundoPorTipo[novoTipo] }
        // Recarregar modelos do banco conforme novo tipo/vista
        this.carregarModelosDoBanco()
      }
    },
    visaoAtiva(nova) {
      // Recarregar modelos do banco ao trocar Topo/Lateral
      this.carregarModelosDoBanco()
    },
    dados: {
      handler() {
        if (this.tipoAtivo === 'armazem' && this.dados) {
          // 🔧 CORREÇÃO: Usar método centralizado sem timeout arbitrário
          this.$nextTick(() => {
            this.reestabelecerEventListenersSeguro()
          })
        }
      },
      deep: true
    },
    arcoAtual() {
      if (this.tipoAtivo === 'armazem') {
        this.updateSVG()
      }
    },
    // Watcher profundo para configSilo para garantir atualizações em tempo real
    configSilo: {
      handler() {
        if (this.tipoAtivo === 'silo') {
          this.applyConfigSiloToLayout()
          this.updateSVG()
        }
      },
      deep: true
    },
    // Ao selecionar modelo salvo, manter apenas o id (carregamento detalhado pode ser feito ao aplicar)
    modeloSelecionadoMock() {
      // Intencionalmente não altera fabricante/modelo pois backend não possui estes campos
    },
    // Ao voltar para criar novo, limpa seleção anterior
    modoDadosSilo(novo) {
      if (novo === 'criar') {
        this.modeloSelecionadoMock = ''
      }
    }
  },
  methods: {
    // Método para alternar seções do acordeon
      this.$set(this.acordeonAberto, secao, !this.acordeonAberto[secao])
    },

    // 🎯 NOVOS MÉTODOS: Sistema de Etapas para Silo
    mudarEtapaSilo(numeroEtapa) {
      this.etapaAtualSilo = numeroEtapa

      // Resetar acordeons
      this.acordeonAberto = {
        configuracoes: false,
        pendulosSilo: false,
        siloLateral: false,
        siloTopo: false,
        modelosArcos: false,
        dimensoes: false,
        telhado: false,
        fundo: false,
        sensores: false,
        armazemLateral: false,
        controles: false,
        gerenciamento: false
      }

      // Abrir acordeons e espelhar preview por etapa
      if (numeroEtapa === 1) {
        // Etapa 1: Dados (fabricante/modelo)
        this.acordeonAberto.siloDados = true
        this.acordeonAberto.pendulosSilo = false
        this.acordeonAberto.siloLateral = false
        this.acordeonAberto.siloTopo = false
        this.visaoAtiva = 'lateral'
      } else if (numeroEtapa === 2) {
        // Etapa 2: Silo Lateral
        this.acordeonAberto.siloLateral = true
        this.visaoAtiva = 'lateral'
      } else if (numeroEtapa === 3) {
        // Etapa 3: Silo Topo
        this.acordeonAberto.siloTopo = true
        this.visaoAtiva = 'topo'
      } else if (numeroEtapa === 4) {
        // Etapa 4: Salvar
        this.acordeonAberto.gerenciamento = true
      }

      // Atualizar preview imediatamente
      this.$nextTick(() => this.updateSVG())
    },

    finalizarConfiguracaoSilo() {
      // Salvar configuração do Silo
      this.salvarModeloAtual()
      this.mostrarToast('Configuração do Silo salva com sucesso!', 'success')
      
      // Voltar para etapa 1 para nova configuração
      this.etapaAtualSilo = 1
    },

    // 🎯 NOVOS MÉTODOS: Sistema de Etapas para Armazém
    mudarEtapaArmazem(numeroEtapa) {
      this.etapaAtualArmazem = numeroEtapa

      // Sincronizar visão com o preview
      if (numeroEtapa === 1) {
        this.visaoAtiva = 'lateral'
      } else if (numeroEtapa === 2) {
        this.visaoAtiva = 'topo'
      }

      // Resetar acordeons
      this.acordeonAberto = {
        configuracoes: false,
        pendulosSilo: false,
        siloLateral: false,
        siloTopo: false,
        modelosArcos: false,
        dimensoes: false,
        telhado: false,
        fundo: false,
        sensores: false,
        armazemLateral: false,
        controles: false,
        gerenciamento: false
      }

      // Abrir acordeons por etapa
      if (numeroEtapa === 1) {
        // Lateral: configuração geral
        this.acordeonAberto.modelosArcos = true
        this.acordeonAberto.dimensoes = true
        this.acordeonAberto.armazemLateral = true
      } else if (numeroEtapa === 2) {
        // Topo: controles do topo
        this.acordeonAberto.armazemTopo = true
      } else if (numeroEtapa === 3) {
        // Resumo: manter acordeons fechados
        this.acordeonAberto.controles = true
      } else if (numeroEtapa === 4) {
        // Salvar: foco no gerenciamento
        this.acordeonAberto.gerenciamento = true
      }
    },

    finalizarConfiguracaoArmazem() {
      // Salvar configuração do Armazém
      this.salvarModeloAtual()
      this.mostrarToast('Configuração do Armazém salva com sucesso!', 'success')
      
      // Voltar para etapa 1 para nova configuração (garante sincronização da visão)
      this.mudarEtapaArmazem(1)
    },
    
    async verificarDadosArcoRecebidos() {
      try {
        if (typeof localStorage !== 'undefined') {
          const dadosArcoString = localStorage.getItem('dadosArcoParaModelador')
          const timestamp = localStorage.getItem('timestampArcoModelador')

          // Verificar se os dados são recentes (menos de 5 minutos)
          if (dadosArcoString && timestamp) {
            const agora = new Date().getTime()
            const timestampDados = parseInt(timestamp)
            const cincoMinutos = 5 * 60 * 1000

            if ((agora - timestampDados) < cincoMinutos) {
              const dadosArco = JSON.parse(dadosArcoString)

              // Usar os dados recebidos
              this.dadosPortal = dadosArco.dadosPortal
              this.analiseArcos = dadosArco.analiseArcos
              this.layoutsAutomaticos = dadosArco.layoutsAutomaticos
              this.dados = dadosArco.dadosConvertidos
              this.arcoAtual = dadosArco.numeroArco

              // Forçar tipo armazém
              this.tipoAtivo = 'armazem'

              // Marcar que os dados vieram do preview
              this.dadosVindosDoPreview = true

              // Limpar dados do localStorage após usar
              localStorage.removeItem('dadosArcoParaModelador')
              localStorage.removeItem('timestampArcoModelador')

              return true
            }
          }
        }
      } catch (error) {
      }
      return false
    },

    async carregarDadosAPI() {
      try {
        // Se já recebeu dados do preview, não precisar recarregar
        const dadosRecebidos = await this.verificarDadosArcoRecebidos()
        if (dadosRecebidos) {
          return
        }

        // Para o modelador de armazém, usar dados exemplares ao invés da API
        if (this.tipoAtivo === 'armazem') {
          this.criarDadosExemplaresArmazem()
          return
        }

        // Implementação da API para Silo (exemplo)
        const response = await fetch('URL_DA_SUA_API_AQUI', {
          headers: {
            'Authorization': 'Bearer SEU_TOKEN_AQUI',
            'Content-Type': 'application/json'
          },
          timeout: 15000
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da API: ${response.status} - ${response.statusText}`)
        }

        const data = await response.json()

        if (!data) {
          throw new Error('Resposta da API vazia')
        }

        // Armazenar dados originais da API
        this.dadosPortal = data

        // Analisar estrutura dos arcos baseada na nova estrutura da API
        const analise = this.analisarEstruturaArcos(data)
        this.analiseArcos = analise

        // Gerar layouts automaticos
        const layouts = LayoutManager.gerarLayoutAutomatico(analise)
        this.layoutsAutomaticos = layouts
        // Calcular dimensões ideais
        const dimensoes = this.calcularDimensoesIdeais(analise)
        this.dimensoesSVG = dimensoes
        // Converter dados para formato de renderização
        const dadosConvertidos = this.converterDadosParaRenderizacao(data, 1)
        this.dados = dadosConvertidos
      } catch (error) {
        this.error = this.tratarErroAPI(error)
      }
    },

    criarDadosExemplaresArmazem() {
      // Gerar dados exemplares baseados na configuração atual de modelos
      const dadosExemplo = { arcos: {} }

      // Determinar quantos arcos criar (padrão 3 se não há análise)
      const totalArcos = this.analiseArcos?.totalArcos || 3

      for (let arco = 1; arco <= totalArcos; arco++) {
        dadosExemplo.arcos[arco] = {}

        // Determinar modelo para este arco
        const modeloParaArco = this.determinarModeloParaArco(arco)

        // Usar configuração do modelo ou padrão
        let quantidadePendulos = 3
        let sensoresPorPendulo = { 1: 4, 2: 3, 3: 5 }

        if (modeloParaArco) {
          quantidadePendulos = modeloParaArco.quantidadePendulos || 3
          sensoresPorPendulo = modeloParaArco.sensoresPorPendulo || {}
        }

        // Gerar dados para cada pêndulo baseado na configuração
        for (let pendulo = 1; pendulo <= quantidadePendulos; pendulo++) {
          dadosExemplo.arcos[arco][pendulo] = {}

          // Determinar quantidade de sensores para este pêndulo
          const qtdSensores = sensoresPorPendulo[pendulo] || Math.floor(Math.random() * 4) + 2 // 2-5 sensores se não definido

          // Gerar temperaturas aleatórias entre 10°C e 40°C para cada sensor
          for (let sensor = 1; sensor <= qtdSensores; sensor++) {
            // Temperatura aleatória entre 10 e 40 graus Celsius
            const temperaturaAleatoria = Math.random() * 30 + 10 // 10 + (0 a 30)
            const temperaturaFormatada = Math.round(temperaturaAleatoria * 10) / 10 // Arredondar para 1 casa decimal

            // Formato: [temp, pontoQuente, preAlarme, falha, nivel]
            dadosExemplo.arcos[arco][pendulo][sensor] = [
              temperaturaFormatada,
              false, // pontoQuente
              false, // preAlarme
              false, // falha
              true   // nivel (sensor ativo)
            ]
          }
        }
      }

      // Armazenar dados originais
      this.dadosPortal = dadosExemplo

      // Analisar estrutura dos arcos
      const analise = this.analisarEstruturaArcos(dadosExemplo)
      this.analiseArcos = analise

      // Gerar layouts automaticos
      const layouts = LayoutManager.gerarLayoutAutomatico(analise)
      this.layoutsAutomaticos = layouts

      // Calcular dimensões ideais
      const dimensoes = this.calcularDimensoesIdeais(analise)
      this.dimensoesSVG = dimensoes

      // Converter dados para formato de renderização
      const dadosConvertidos = this.converterDadosParaRenderizacao(dadosExemplo, 1)
      this.dados = dadosConvertidos

    },

    // Analisar estrutura dos arcos baseada na nova estrutura da API
    analisarEstruturaArcos(dados) {

      if (!dados.arcos) {
        return this.criarEstruturaMinima()
      }

      const estrutura = {
        totalArcos: 0,
        arcos: {},
        estatisticas: {
          totalPendulos: 0,
          totalSensores: 0
        }
      }

      // Processar cada arco
      Object.keys(dados.arcos).forEach(numeroArco => {
        const dadosArco = dados.arcos[numeroArco]
        const arcoNum = parseInt(numeroArco)

        estrutura.totalArcos = Math.max(estrutura.totalArcos, arcoNum)

        const infoArco = {
          numero: arcoNum,
          totalPendulos: 0,
          totalSensores: 0,
          pendulos: []
        }

        // Processar cada pêndulo no arco
        Object.keys(dadosArco).forEach(numeroPendulo => {
          const dadosPendulo = dadosArco[numeroPendulo]
          const penduloNum = parseInt(numeroPendulo)

          const infoPendulo = {
            numero: penduloNum,
            totalSensores: Object.keys(dadosPendulo).length
          }

          infoArco.pendulos.push(infoPendulo)
          infoArco.totalPendulos++
          infoArco.totalSensores += infoPendulo.totalSensores
        })

        // Ordenar pêndulos por número
        infoArco.pendulos.sort((a, b) => a.numero - b.numero)

        estrutura.arcos[arcoNum] = infoArco
        estrutura.estatisticas.totalPendulos += infoArco.totalPendulos
        estrutura.estatisticas.totalSensores += infoArco.totalSensores
      })
      return estrutura
    },

    // Converter dados da API para formato de renderização
    converterDadosParaRenderizacao(dadosAPI, numeroArco) {

      if (!dadosAPI.arcos || !dadosAPI.arcos[numeroArco]) {
        return { leitura: {} }
      }

      const dadosArco = dadosAPI.arcos[numeroArco]
      const leituraConvertida = {}

      // Converter estrutura: arcos[numeroArco][pendulo][sensor] -> leitura[pendulo][sensor]
      Object.keys(dadosArco).forEach(numeroPendulo => {
        const sensoresPendulo = dadosArco[numeroPendulo]
        leituraConvertida[numeroPendulo] = {}

        Object.keys(sensoresPendulo).forEach(numeroSensor => {
          const dadosSensor = sensoresPendulo[numeroSensor]
          // Manter o formato original do sensor: [temp, pontoQuente, preAlarme, falha, nivel]
          leituraConvertida[numeroPendulo][numeroSensor] = dadosSensor
        })
      })

      const resultado = {
        leitura: leituraConvertida,
        arcoAtual: numeroArco,
        timestamp: new Date().toISOString()
      }

      return resultado
    },

    criarEstruturaMinima() {
      return {
        totalArcos: 1,
        arcos: {
          1: {
            numero: 1,
            totalPendulos: 1,
            totalSensores: 1,
            pendulos: [{ numero: 1, totalSensores: 1 }]
          }
        },
        estatisticas: {
          totalPendulos: 1,
          totalSensores: 1
        }
      }
    },

    tratarErroAPI(error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return 'Token de autenticação inválido ou expirado. Verifique as credenciais.'
          case 403:
            return 'Acesso negado. Verifique as permissões do token.'
          case 404:
            return 'Endpoint da API não encontrado. Verifique a URL.'
          case 500:
            return 'Erro interno do servidor. Tente novamente mais tarde.'
          default:
            return `Erro HTTP ${error.response.status}: ${error.response.statusText}`
        }
      } else if (error.request) {
        return 'Erro de conectividade. Verifique sua conexão com a internet.'
      } else {
        return error.message || 'Erro desconhecido ao carregar dados.'
      }
    },

    // Calcular dimensões ideais do SVG baseado na análise de todos os arcos
    calcularDimensoesIdeais(analiseArcos) {
      if (!analiseArcos) return { largura: 350, altura: 200 }

      let maxSensores = 0
      let maxPendulos = 0

      // Encontrar o máximo de sensores e pêndulos em todos os arcos
      Object.values(analiseArcos.arcos).forEach(arco => {
        maxPendulos = Math.max(maxPendulos, arco.totalPendulos)
        arco.pendulos.forEach(pendulo => {
          maxSensores = Math.max(maxSensores, pendulo.totalSensores)
        })
      })

      const escala_sensores = 16
      const dist_y_sensores = 12
      const margemSuperior = 30
      const margemInferior = 50
      const margemPendulo = 20

      const alturaBaseTelhado = 185
      const alturaSensores = maxSensores * dist_y_sensores + escala_sensores
      const alturaTotal = Math.max(
        alturaBaseTelhado,
        margemSuperior + alturaSensores + margemInferior + margemPendulo
      )

      const larguraMinima = 350
      const espacamentoPendulo = 50
      const larguraCalculada = Math.max(larguraMinima, (maxPendulos * espacamentoPendulo) + 100)

      return {
        largura: larguraCalculada,
        altura: Math.max(alturaTotal, 250)
      }
    },

    onTipoChange() {
      // ⚠️ LIMPEZA COMPLETA: Evitar conflitos entre Silo e Armazém

      // 1. Remover TODOS os event listeners antes de qualquer coisa
      this.removerEventListeners()
      
      // 2. Limpar estados de drag-and-drop específicos do Armazém
      this.limparEstadosDragAndDrop()
      
      // 3. Resetar posições manuais que podem interferir
      this.resetarPosicoesManual()
      
      // 4. Limpar configuração preview se aplicada
      this.limparConfiguracaoPreview()

      // 5. Limpar variáveis de controle específicas
      this.limparVariaveisControleEspecificas()

      // Recarregar modelos do banco quando mudar o tipo
      this.carregarModelosDoBanco()

      // Se mudou para armazém e não tem dados, criar dados exemplares
      if (this.tipoAtivo === 'armazem') {
        if (!this.dadosPortal || !this.analiseArcos || !this.layoutsAutomaticos) {
          this.criarDadosExemplaresArmazem()
        }
        // Garantir que o modelo padrão esteja configurado
        if (!this.modelosArcos || Object.keys(this.modelosArcos).length === 0) {
          this.resetarModelosParaPadrao()
        }
        
        // Aguardar próximo tick para reestabelecer event listeners específicos do Armazém
        this.$nextTick(() => {
          setTimeout(() => {
            this.reestabelecerEventListenersSeguro()
          }, 100)
        })
      } else if (this.tipoAtivo === 'silo') {
        // Criar dados exemplares para o silo se não existem
        this.criarDadosExemplaresSilo()
      }

      // Forçar atualização do SVG
      this.$nextTick(() => {
        this.updateSVG()
      })
    },

    onVisaoChange() {
      // Atualizar visualização quando mudar entre lateral e topo
      this.$nextTick(() => {
        this.updateSVG()
      })
    },

    onSiloChange() {
      this.applyConfigSiloToLayout()
      this.updateSVG()
    },

    // Aplicar configurações do configSilo ao layout usado pelo gerador SVG
    applyConfigSiloToLayout() {
      if (!this.layoutSilo) {
        // Inicializar estrutura de layout completa para o silo
        this.layoutSilo = {
          desenho_sensores: {
            escala_sensores: 16,
            dist_y_sensores: 12,
            nome_sensores_direita: 0,
            nome_cabo_acima: 0,
            cor_sensores: '#cccccc',
            cor_texto_sensores: 'black'
          },
          aeradores: {
            na: 4,
            ds: -4,
            dy: 0,
            da: 0,
            rotacao: 0,
            escala: 1,
            cor_aeradores: '#3A78FD',
            cor_helices: 'white'
          },
          estrutura_silo: {
            lb: 200,
            hs: 180,
            hb: 20,
            eb: 10
          },
          pendulos: {
            quantidadePendulos: 3,
            sensoresPorPendulo: {}
          }
        }
      }

      // 🔄 SINCRONIZAÇÃO COMPLETA: configSilo -> layoutSilo
      
      // Estrutura do silo
      this.layoutSilo.estrutura_silo.lb = this.configSilo.lb || 200
      this.layoutSilo.estrutura_silo.hs = this.configSilo.hs || 180
      this.layoutSilo.estrutura_silo.hb = this.configSilo.hb || 20
      this.layoutSilo.estrutura_silo.eb = this.configSilo.eb || 10
      
      // Pêndulos e sensores
      this.layoutSilo.pendulos.quantidadePendulos = this.configSilo.quantidadePendulos || 3
      this.layoutSilo.pendulos.sensoresPorPendulo = this.configSilo.sensoresPorPendulo || {}
      
      // Configurações de desenho dos sensores
      this.layoutSilo.desenho_sensores.escala_sensores = this.configSilo.escala_sensores || 16
      this.layoutSilo.desenho_sensores.dist_y_sensores = this.configSilo.dist_y_sensores || 12
      this.layoutSilo.desenho_sensores.nome_sensores_direita = this.configSilo.nome_sensores_direita || 0
      this.layoutSilo.desenho_sensores.nome_cabo_acima = this.configSilo.nome_cabo_acima || 0
      
      // Aeradores (somente se ativos)
      if (this.configSilo.aeradores_ativo) {
        this.layoutSilo.aeradores.na = this.configSilo.na || 4
        this.layoutSilo.aeradores.ds = this.configSilo.ds || -4
        this.layoutSilo.aeradores.dy = this.configSilo.dy || 0
        this.layoutSilo.aeradores.da = this.configSilo.da || 0
        this.layoutSilo.aeradores.rotacao = this.configSilo.aerador_rotacao || 0
        this.layoutSilo.aeradores.escala = this.configSilo.aerador_escala || 1
      }

      // DEBUG: Logs removidos após validação bem-sucedida
    },

    onArmazemChange() {
      this.updateSVG()
      // Atualizar modelo atual se estiver selecionado
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].config = { ...this.configArmazem }
        this.salvarModelosAutomatico()
      }
    },

    onDimensoesAlteradas(data) {

      // Forçar atualização do SVG
      this.updateSVG()

      // Se estiver editando um modelo, salvar as alterações
      if (this.modeloArcoAtual) {
        // Garantir que as dimensões sejam salvas no modelo
        this.modelosArcos[this.modeloArcoAtual].config = { ...this.configArmazem }

        // Salvar modelo completo para persistir as dimensões
        this.salvarModeloAtualCompleto()

      }
    },

    onQuantidadeModelosChange(event) {
      this.quantidadeModelosArcos = parseInt(event.target.value)
      const qtd = parseInt(this.quantidadeModelosArcos)
      const novosModelos = {}

      for (let i = 1; i <= qtd; i++) {
        let posicao, nome

        if (qtd === 1) {
          posicao = 'todos'
          nome = 'Modelo Único'
        } else if (qtd === 2) {
          if (i === 1) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          }
        } else if (qtd === 3) {
          if (i === 1) {
            posicao = 'frente_fundo'
            nome = 'Modelo Frente/Fundo'
          } else if (i === 2) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          }
        } else if (qtd === 4) {
          if (i === 1) {
            posicao = 'frente'
            nome = 'Modelo Frente'
          } else if (i === 2) {
            posicao = 'par'
            nome = 'Modelo Par'
          } else if (i === 3) {
            posicao = 'impar'
            nome = 'Modelo Ímpar'
          } else {
            posicao = 'fundo'
            nome = 'Modelo Fundo'
          }
        }

        const quantidadePendulos = this.analiseArcos?.arcos[i]?.totalPendulos || 3
        // Criar configuração padrão de sensores por pêndulo se não existir
        let sensoresPorPendulo = {}
        if (this.modelosArcos[i]?.sensoresPorPendulo) {
          sensoresPorPendulo = { ...this.modelosArcos[i].sensoresPorPendulo }
        } else {
          // Criar configuração baseada nos dados exemplares se disponível
          for (let p = 1; p <= quantidadePendulos; p++) {
            const sensoresDoArco = this.analiseArcos?.arcos[i]?.pendulos?.find(pend => pend.numero === p)?.totalSensores
            sensoresPorPendulo[p] = sensoresDoArco || Math.floor(Math.random() * 4) + 2 // 2-5 sensores aleatório
          }
        }

        novosModelos[i] = this.modelosArcos[i] || {
          posicao,
          config: { ...this.configArmazem },
          nome,
          quantidadePendulos,
          sensoresPorPendulo
        }
      }

      this.modelosArcos = novosModelos

      // Se o modelo atual não existe mais, voltar para o primeiro
      if (this.modeloArcoAtual > qtd) {
        this.modeloArcoAtual = 1
        this.configArmazem = { ...this.modelosArcos[1].config }
      }

      this.salvarModelosAutomatico()
    },

    onModeloArcoChange(event) {
      const novoModelo = parseInt(event.target.value) || null

      // Se estava editando um modelo antes, salvar as alterações
      if (this.modeloArcoAtual && this.modeloArcoAtual !== novoModelo) {
        this.salvarModeloAtualCompleto()
      }

      this.modeloArcoAtual = novoModelo

      if (this.modeloArcoAtual) {
        // 🔧 CORREÇÃO DO BUG: Limpar posições manuais conflitantes ao selecionar modelo
        this.limparPosicoesManualConflitantes()
        
        // Carregar configuração do modelo selecionado (sem resetar para padrão)
        this.carregarConfiguracaoModelo(this.modeloArcoAtual)

        // Inicializar posições dos cabos para o modelo selecionado
        this.inicializarPosicoesCabos()

        this.salvarModelosAutomatico()

        // Automação: navegar para arco representativo do modelo selecionado
        if (this.analiseArcos && this.modelosArcos[this.modeloArcoAtual]) {
          const posicaoModelo = this.modelosArcos[this.modeloArcoAtual].posicao
          const totalArcos = this.analiseArcos.totalArcos
          let arcoRepresentativo = 1

          if (this.quantidadeModelosArcos === 1) {
            arcoRepresentativo = this.arcoAtual
          } else if (this.quantidadeModelosArcos === 2) {
            if (posicaoModelo === 'impar') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            }
          } else if (this.quantidadeModelosArcos === 3) {
            if (posicaoModelo === 'frente_fundo') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            } else if (posicaoModelo === 'impar') {
              arcoRepresentativo = 3
            }
          } else if (this.quantidadeModelosArcos === 4) {
            if (posicaoModelo === 'frente') {
              arcoRepresentativo = 1
            } else if (posicaoModelo === 'par') {
              arcoRepresentativo = 2
            } else if (posicaoModelo === 'impar') {
              arcoRepresentativo = 3
            } else if (posicaoModelo === 'fundo') {
              arcoRepresentativo = totalArcos
            }
          }

          arcoRepresentativo = Math.max(1, Math.min(totalArcos, arcoRepresentativo))

          if (arcoRepresentativo !== this.arcoAtual) {
            this.mudarArco(arcoRepresentativo)
          }
        }

        // 🔧 CRÍTICO: Reestabelecer event listeners após mudança de modelo
        this.$nextTick(() => {
          this.updateSVG()
          // Aguardar um pouco mais para garantir que o SVG foi completamente renderizado
          setTimeout(() => {
            this.reestabelecerEventListenersSeguro()
          }, 150)
        })

        // Mostrar feedback visual sobre o modelo sendo editado
        this.mostrarToast(`Editando ${this.modelosArcos[this.modeloArcoAtual]?.nome || `Modelo ${this.modeloArcoAtual}`}`, 'info')
      } else {
        // Se desmarcou modelo, voltar ao estado geral
        this.aplicarConfiguracaoGeralArmazem()

        // 🔧 CRÍTICO: Reestabelecer event listeners também quando desmarca modelo
        this.$nextTick(() => {
          this.updateSVG()
          setTimeout(() => {
            this.reestabelecerEventListenersSeguro()
          }, 150)
        })
      }
    },

    onNomeModeloChange(event) {
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].nome = event.target.value
        this.salvarModelosAutomatico()
      }
    },

    onPosicaoArcoChange(event) {
      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].posicao = event.target.value
        this.salvarModelosAutomatico()
      }
    },

    // Método auxiliar para mapear número do modelo para tipo/posição
    determinarTipoPorNumeroModelo(numeroModelo, quantidadeModelos) {
      if (quantidadeModelos === 1) {
        return 'todos'
      } else if (quantidadeModelos === 2) {
        return numeroModelo === 1 ? 'par' : 'impar'
      } else if (quantidadeModelos === 3) {
        if (numeroModelo === 1) return 'frente_fundo'
        else if (numeroModelo === 2) return 'par'
        else return 'impar'
      } else if (quantidadeModelos === 4) {
        if (numeroModelo === 1) return 'frente'
        else if (numeroModelo === 2) return 'par'
        else if (numeroModelo === 3) return 'impar'
        else return 'fundo'
      }
      return 'todos'
    },

    getDescricaoModelo(modeloNum) {
      const tipo = this.determinarTipoPorNumeroModelo(modeloNum, this.quantidadeModelosArcos)

      const descricoesPorTipo = {
        'todos': 'todos',
        'par': 'par',
        'impar': 'impar',
        'frente_fundo': 'frente/fundo',
        'frente': 'frente',
        'fundo': 'fundo'
      }

      return descricoesPorTipo[tipo] || ''
    },

    determinarPosicaoDoModelo(numeroModelo, quantidadeModelos) {
      return this.determinarTipoPorNumeroModelo(numeroModelo, quantidadeModelos)
    },

    determinarModeloParaArco(numeroArco) {
      if (!this.modelosArcos || Object.keys(this.modelosArcos).length === 0) {
        return null
      }

      // Usar a lógica consolidada de determinação de tipo
      const analiseArcos = { totalArcos: this.analiseArcos?.totalArcos || 1 }
      const quantidadeModelos = Object.keys(this.modelosArcos).length

      // Simular o contexto necessário para determinarTipoArco
      const contextoTemporario = {
        analiseArcos,
        quantidadeModelosArcos: quantidadeModelos,
        arcoAtual: numeroArco
      }

      const tipoArco = this.determinarTipoArcoParaContexto(contextoTemporario)

      // Buscar modelo pela posição/tipo
      if (tipoArco === 'todos') {
        return this.modelosArcos[1] || null
      }

      return Object.values(this.modelosArcos).find(modelo =>
        modelo && modelo.posicao === tipoArco
      ) || this.modelosArcos[1] || null
    },

    // Versão reutilizável do determinarTipoArco que aceita contexto customizado
    determinarTipoArcoParaContexto(contexto) {
      if (!contexto.analiseArcos) return 'todos'

      const { quantidadeModelosArcos, arcoAtual } = contexto
      const totalArcos = contexto.analiseArcos.totalArcos

      if (quantidadeModelosArcos === 1) {
        return 'todos'
      } else if (quantidadeModelosArcos === 2) {
        return arcoAtual % 2 === 1 ? 'impar' : 'par'
      } else if (quantidadeModelosArcos === 3) {
        if (arcoAtual === 1 || arcoAtual === totalArcos) {
          return 'frente_fundo'
        } else {
          return arcoAtual % 2 === 0 ? 'par' : 'impar'
        }
      } else if (quantidadeModelosArcos === 4) {
        if (arcoAtual === 1) {
          return 'frente'
        } else if (arcoAtual === totalArcos) {
          return 'fundo'
        } else {
          return arcoAtual % 2 === 0 ? 'par' : 'impar'
        }
      }

      return 'todos'
    },

    // Método auxiliar para determinar o tipo do arco consolidando lógica duplicada
    determinarTipoArco() {
      if (!this.analiseArcos) return 'todos'

      const { quantidadeModelosArcos, arcoAtual } = this
      const totalArcos = this.analiseArcos.totalArcos

      if (quantidadeModelosArcos === 1) {
        return 'todos'
      } else if (quantidadeModelosArcos === 2) {
        return arcoAtual % 2 === 1 ? 'impar' : 'par'
      } else if (quantidadeModelosArcos === 3) {
        if (arcoAtual === 1 || arcoAtual === totalArcos) {
          return 'frente_fundo'
        } else {
          return arcoAtual % 2 === 0 ? 'par' : 'impar'
        }
      } else if (quantidadeModelosArcos === 4) {
        if (arcoAtual === 1) {
          return 'frente'
        } else if (arcoAtual === totalArcos) {
          return 'fundo'
        } else {
          return arcoAtual % 2 === 0 ? 'par' : 'impar'
        }
      }

      return 'todos'
    },

    getBadgeClass() {
      const tipoArco = this.determinarTipoArco()
      const classes = ['badge']

      const classesPorTipo = {
        'todos': 'bg-info',
        'impar': 'bg-warning',
        'par': 'bg-primary',
        'frente_fundo': 'bg-success',
        'frente': 'bg-success',
        'fundo': 'bg-danger'
      }

      classes.push(classesPorTipo[tipoArco] || 'bg-info')
      return classes.join(' ')
    },

    getBadgeText() {
      const tipoArco = this.determinarTipoArco()

      const textosPorTipo = {
        'todos': 'TODOS',
        'impar': 'ÍMPAR',
        'par': 'PAR',
        'frente_fundo': 'F/F',
        'frente': 'FRENTE',
        'fundo': 'FUNDO'
      }

      return textosPorTipo[tipoArco] || 'TODOS'
    },

    mudarArco(novoArco, forcarAplicarConfiguracao = true) {
      this.arcoAtual = novoArco

      // Se estiver editando um modelo específico, não aplicar configuração automática
      if (forcarAplicarConfiguracao && !this.modeloArcoAtual) {
        const modeloParaArco = this.determinarModeloParaArco(novoArco)
        if (modeloParaArco && modeloParaArco.config) {
          this.configArmazem = { ...modeloParaArco.config }
        }
      }

      if (this.dadosPortal) {
        const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, novoArco)
        this.dados = dadosConvertidos
      }

      // Atualizar o SVG com o novo arco
      this.updateSVG()
    },

    obterDeslocamentoVerticalPadrao(tipoFundo) {
      switch (tipoFundo) {
        case 0: return 0  // Reto
        case 1: return 7  // Funil V
        case 2: return 10 // Duplo V
        default: return 0
      }
    },

    obterLogicaDistribuicao() {
      const logicas = {
        1: {
          nome: 'Modelo Único',
          descricao: 'Todos os arcos utilizam o mesmo modelo',
          aplicacao: 'todos_arcos'
        },
        2: {
          nome: 'Par/Ímpar',
          descricao: 'Arcos pares (2º, 4º, 6º...) e ímpares (1º, 3º, 5º...)',
          aplicacao: 'par_impar'
        },
        3: {
          nome: 'Frente/Fundo + Par/Ímpar',
          descricao: 'Frente e fundo iguais, meio alternado par/ímpar',
          aplicacao: 'frente_fundo_par_impar'
        },
        4: {
          nome: 'Frente/Par/Ímpar/Fundo',
          descricao: 'Primeiro único, último único, meio alternado',
          aplicacao: 'frente_par_impar_fundo'
        }
      }
      return logicas[this.quantidadeModelosArcos] || logicas[1]
    },

    salvarModeloAtual() {
      if (!this.modeloArcoAtual) {
        this.mostrarToast('Selecione um modelo para salvar!', 'warning')
        return
      }

      this.salvarModeloAtualCompleto()

      // FIXO: NÃO resetar configurações após salvar para preservar dimensões do usuário
      // Comentado para preservar dimensões configuradas pelo usuário
      // this.resetarConfigArmParaPadrao()

      this.mostrarToast(`Modelo ${this.modeloArcoAtual} (${this.modelosArcos[this.modeloArcoAtual]?.nome}) salvo com sucesso!`, 'success')
    },

    // Método para resetar apenas as posições visuais após salvamento no banco
    resetarTudoAposSalvamentoBanco() {

      // FIXO CRÍTICO: NÃO resetar as dimensões configuradas pelo usuário
      // Preservar as dimensões atuais do armazém que foram configuradas pelo usuário
      const dimensoesPreservadas = {
        pb: this.configArmazem.pb, // Preservar Profundidade Base
        lb: this.configArmazem.lb, // CRÍTICO: Preservar LarguraBase configurada pelo usuário
        hb: this.configArmazem.hb, // Preservar Altura Base
        hf: this.configArmazem.hf, // Preservar Altura Fundo
        lf: this.configArmazem.lf, // Preservar Largura Fundo
        le: this.configArmazem.le, // Preservar Largura Entre
        ht: this.configArmazem.ht, // Preservar Altura Topo - alturaTopo
        // Preservar também outras configurações importantes do telhado
        tipo_telhado: this.configArmazem.tipo_telhado,
        curvatura_topo: this.configArmazem.curvatura_topo,
        pontas_redondas: this.configArmazem.pontas_redondas,
        raio_pontas: this.configArmazem.raio_pontas,
        estilo_laterais: this.configArmazem.estilo_laterais,
        curvatura_laterais: this.configArmazem.curvatura_laterais,
        tipo_fundo: this.configArmazem.tipo_fundo
      }

      // 1. Resetar configuração do armazém MANTENDO as dimensões configuradas pelo usuário
      this.configArmazem = {
        // Preservar todas as dimensões configuradas pelo usuário
        ...dimensoesPreservadas,
        // Resetar apenas configurações que podem ser restauradas para padrão sem impactar o salvamento
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        largura_abertura_v: 20,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0
      }

      // 2. Resetar modelos de arcos VISUAL para padrão (mantendo dados salvos no localStorage)
      // IMPORTANTE: Usar as dimensões preservadas para criar o modelo visual
      this.quantidadeModelosArcos = 1
      this.modelosArcos = {
        1: {
          posicao: 'todos',
          config: { ...this.configArmazem }, // Agora contém as dimensões preservadas
          nome: 'Modelo Único',
          quantidadePendulos: 3,
          sensoresPorPendulo: {
            1: 4, 2: 3, 3: 5
          }
        }
      }

      // 3. Limpar apenas estado de edição VISUAL
      this.modeloArcoAtual = null
      this.modelosSalvos = {}

      // 4. Limpar posições e configurações personalizadas VISUAIS
      this.posicoesCabos = {}
      this.caboSelecionadoPosicionamento = null
      this.modelagemIndividualAtiva = false
      this.penduloSelecionado = 1
      this.posicoesPendulosIndividuais = {}
      this.posicoesSensoresIndividuais = {}
      this.ajustesGlobaisSensores = { horizontal: 0, vertical: 0 }
      this.dadosPreviewDesvinculados = null

      // 5. Limpar posições manuais de drag and drop VISUAIS
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      // 6. Limpar configurações de preview VISUAIS
      this.configuracaoPreviewSelecionada = ''
      this.configPreviewAplicada = null
      this.configuracaoAplicada = null

      // 7. IMPORTANTE: NÃO limpar localStorage - manter dados dos modelos salvos para o banco

      // 8. Regenerar dados exemplares com configuração padrão
      this.criarDadosExemplaresArmazem()

      // 9. Atualizar SVG
      this.updateSVG()

    },

    salvarModeloAtualCompleto() {
      if (!this.modeloArcoAtual) return

      // Criar configuração consolidada do modelo atual com todas as configurações preservadas
      const configuracaoModelo = {
        // Dados básicos do modelo
        nome: this.modelosArcos[this.modeloArcoAtual]?.nome || `Modelo ${this.modeloArcoAtual}`,
        posicao: this.modelosArcos[this.modeloArcoAtual]?.posicao || 'todos',
        quantidadePendulos: this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3,
        sensoresPorPendulo: { ...this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {} },

        // IMPORTANTE: Preservar TODAS as configurações do armazém incluindo telhado e dimensões
        // Dimensões básicas - GARANTIR que sejam preservadas
        pb: this.configArmazem.pb || 185,
        lb: this.configArmazem.lb || 350, // CRÍTICO: Largura base deve ser preservada
        hb: this.configArmazem.hb || 30,
        hf: this.configArmazem.hf || 6,
        lf: this.configArmazem.lf || 250,
        le: this.configArmazem.le || 15,
        ht: this.configArmazem.ht || 50,

        // 🎯 CRÍTICO: Preservar dimensões calculadas se existirem
        dimensoesSvgFundo: this.configArmazem.dimensoesSvgFundo ? {
          largura: this.configArmazem.dimensoesSvgFundo.largura || this.configArmazem.lb || 350,
          altura: this.configArmazem.dimensoesSvgFundo.altura || 300,
          baseadoEm: this.configArmazem.dimensoesSvgFundo.baseadoEm || 'calculo_otimizado',
          calculadoEm: this.configArmazem.dimensoesSvgFundo.calculadoEm || new Date().toISOString()
        } : {
          largura: this.configArmazem.lb || 350,
          altura: 300,
          baseadoEm: 'config_padrao',
          calculadoEm: new Date().toISOString()
        },

        // CRÍTICO: Configurações do telhado devem ser preservadas
        tipo_telhado: this.configArmazem.tipo_telhado,
        curvatura_topo: this.configArmazem.curvatura_topo,
        pontas_redondas: this.configArmazem.pontas_redondas,
        raio_pontas: this.configArmazem.raio_pontas,
        estilo_laterais: this.configArmazem.estilo_laterais,
        curvatura_laterais: this.configArmazem.curvatura_laterais,

        // Configurações do fundo
        tipo_fundo: this.configArmazem.tipo_fundo,
        altura_fundo_reto: this.configArmazem.altura_fundo_reto,
        altura_funil_v: this.configArmazem.altura_funil_v,
        posicao_ponta_v: this.configArmazem.posicao_ponta_v,
        inclinacao_funil_v: this.configArmazem.inclinacao_funil_v,
        largura_abertura_v: this.configArmazem.largura_abertura_v,
        altura_duplo_v: this.configArmazem.altura_duplo_v,
        posicao_v_esquerdo: this.configArmazem.posicao_v_esquerdo,
        posicao_v_direito: this.configArmazem.posicao_v_direito,
        largura_abertura_duplo_v: this.configArmazem.largura_abertura_duplo_v,
        altura_plataforma_duplo_v: this.configArmazem.altura_plataforma_duplo_v,
        largura_plataforma_duplo_v: this.configArmazem.largura_plataforma_duplo_v,
        deslocamento_horizontal_fundo: this.configArmazem.deslocamento_horizontal_fundo,
        deslocamento_vertical_fundo: this.configArmazem.deslocamento_vertical_fundo,

        // Configurações dos sensores
        escala_sensores: this.configArmazem.escala_sensores,
        dist_y_sensores: this.configArmazem.dist_y_sensores,
        dist_x_sensores: this.configArmazem.dist_x_sensores,
        posicao_horizontal: this.configArmazem.posicao_horizontal,
        posicao_vertical: this.configArmazem.posicao_vertical,
        afastamento_vertical_pendulo: this.configArmazem.afastamento_vertical_pendulo,

        // CRÍTICO: Sistema de posições completo para compatibilidade com ArmazemComponente
        // Posição dos cabos separados (sistema antigo - compatibilidade)
        posicoesCabos: { ...this.posicoesCabos },

        // NOVO: Posições manuais dos pêndulos e sensores via drag and drop
        posicoesManualPendulos: { ...this.posicoesManualPendulos },
        posicoesManualSensores: { ...this.posicoesManualSensores },

        // CRÍTICO: Estrutura v6.1 compatível com exemplo fornecido
        modeloEspecifico: {
          quantidadePendulos: this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3,
          sensoresPorPendulo: { ...this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo || {} },

          // Posições dos pêndulos seguindo formato do exemplo fornecido
          posicoesPendulos: Object.keys(this.posicoesManualPendulos || {}).length > 0
            ? Object.keys(this.posicoesManualPendulos).reduce((acc, penduloNum) => {
              const pos = this.posicoesManualPendulos[penduloNum]
              acc[penduloNum] = {
                x: pos.x || 0,
                y: pos.y || 0,
                altura: 0,
                offsetX: pos.offsetX || 0,
                offsetY: pos.offsetY || 0,
                timestampAlteracao: pos.timestampAlteracao || Date.now()
              }
              return acc
            }, {})
            : {},

          // CRÍTICO: Salvar posições manuais dos sensores
          posicoesManualSensores: { ...this.posicoesManualSensores },

          // Alturas dos sensores com posições detalhadas
          alturasSensores: (() => {
            const resultado = this.construirAlturasSensores(
              this.posicoesManualPendulos,
              this.posicoesManualSensores,
              this.modelosArcos[this.modeloArcoAtual]?.sensoresPorPendulo
            )
            return resultado.alturasSensores || {}
          })(),

          // Configuração global
          configuracaoGlobal: {
            escala_sensores: this.configArmazem.escala_sensores || 16,
            dist_y_sensores: this.configArmazem.dist_y_sensores || 12,
            dist_x_sensores: this.configArmazem.dist_x_sensores || 0,
            posicao_horizontal: this.configArmazem.posicao_horizontal || 0,
            posicao_vertical: this.configArmazem.posicao_vertical || 0,
            afastamento_vertical_pendulo: this.configArmazem.afastamento_vertical_pendulo || 0
          }
        },

        // Estado adicional
        caboSelecionadoPosicionamento: this.caboSelecionadoPosicionamento,
        timestampSalvamento: new Date().toISOString(),
        versaoModelo: '6.1', // Compatível com formato do exemplo fornecido
        validado: true
      }

      // Atualizar o modelo local com as posições manuais
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = {}
      }
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = {}
      }

      this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = { ...this.posicoesManualPendulos }
      this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = { ...this.posicoesManualSensores }
      this.modelosArcos[this.modeloArcoAtual].timestampSalvamento = configuracaoModelo.timestampSalvamento

      // Salvar usando o serviço simplificado
      const { configuracaoService } = require('./services/configuracaoService')
      const resultado = configuracaoService.salvarModeloIndividual(this.modeloArcoAtual, configuracaoModelo)

      if (resultado.success) {
        this.modelosSalvos[this.modeloArcoAtual] = true
      } else {
      }
    },

    limparVariaveisParaNovoModelo() {

      // Limpar posições de cabos
      this.posicoesCabos = {}
      this.caboSelecionadoPosicionamento = null

      // Limpar modelagem individual
      this.modelagemIndividualAtiva = false
      this.penduloSelecionado = 1
      this.posicoesPendulosIndividuais = {}
      this.posicoesSensoresIndividuais = {}
      this.ajustesGlobaisSensores = { horizontal: 0, vertical: 0 }
      this.dadosPreviewDesvinculados = null

      // Limpar posições manuais de drag and drop
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      // Limpar configurações de preview aplicadas
      this.configPreviewAplicada = null
      this.configuracaoAplicada = null

    },

    // Método para limpar apenas dados temporários do localStorage (OPCIONAL - apenas se necessário)
    limparLocalStorageTemporario() {
      try {

        // Limpar apenas configurações temporárias - NÃO tocar nos modelos salvos
        const chavesTempParaLimpar = [
          'posicoesManualTemp',
          'configuracaoTemporaria',
          'estadoModeloAtivo',
          'alteracoesPendentes'
        ]

        chavesTempParaLimpar.forEach(chave => {
          if (localStorage.getItem(chave)) {
            localStorage.removeItem(chave)
          }
        })

        // Limpar apenas chaves que começam com prefixos temporários
        const prefixosTemporarios = ['temp_', 'preview_']
        const todasChaves = Object.keys(localStorage)

        todasChaves.forEach(chave => {
          prefixosTemporarios.forEach(prefixo => {
            if (chave.startsWith(prefixo)) {
              localStorage.removeItem(chave)
            }
          })
        })

      } catch (error) {
      }
    },

    resetarConfigArmParaPadrao() {

      // FIXO CRÍTICO: Preservar as dimensões atuais configuradas pelo usuário
      const dimensoesAtuaisPreservadas = {
        pb: this.configArmazem.pb, // Preservar Profundidade Base
        lb: this.configArmazem.lb, // CRÍTICO: Preservar LarguraBase
        hb: this.configArmazem.hb, // Preservar Altura Base
        hf: this.configArmazem.hf, // Preservar Altura Fundo
        lf: this.configArmazem.lf, // Preservar Largura Fundo
        le: this.configArmazem.le, // Preservar Largura Entre
        ht: this.configArmazem.ht, // Preservar Altura Topo
        // Preservar configurações do telhado também
        tipo_telhado: this.configArmazem.tipo_telhado,
        curvatura_topo: this.configArmazem.curvatura_topo,
        pontas_redondas: this.configArmazem.pontas_redondas,
        raio_pontas: this.configArmazem.raio_pontas,
        estilo_laterais: this.configArmazem.estilo_laterais,
        curvatura_laterais: this.configArmazem.curvatura_laterais,
        tipo_fundo: this.configArmazem.tipo_fundo
      }

      // Resetar configuração do armazém MANTENDO as dimensões principais
      this.configArmazem = {
        // Preservar dimensões configuradas pelo usuário
        ...dimensoesAtuaisPreservadas,
        // Resetar apenas configurações secundárias
        altura_fundo_reto: 10,
        altura_funil_v: 18,
        posicao_ponta_v: 0,
        inclinacao_funil_v: 1,
        largura_abertura_v: 20,
        altura_duplo_v: 22,
        posicao_v_esquerdo: -1,
        posicao_v_direito: 1,
        largura_abertura_duplo_v: 2,
        altura_plataforma_duplo_v: 0.3,
        largura_plataforma_duplo_v: 10,
        deslocamento_horizontal_fundo: 0,
        deslocamento_vertical_fundo: -1,
        escala_sensores: 16,
        dist_y_sensores: 12,
        dist_x_sensores: 0,
        posicao_horizontal: 0,
        posicao_vertical: 0,
        afastamento_vertical_pendulo: 0
      }

      // Atualizar SVG com valores atualizados (mas dimensões preservadas)
      this.updateSVG()

    },

    carregarConfiguracaoModelo(numeroModelo) {

      const modelo = this.modelosArcos[numeroModelo]
      if (!modelo) {
        return
      }

      // Carregar configuração básica do modelo
      if (modelo.config) {
        this.configArmazem = { ...modelo.config }
      }

      // NOVO: Carregar posições manuais dos pêndulos e sensores
      this.posicoesManualPendulos = { ...modelo.posicoesManualPendulos || {} }
      this.posicoesManualSensores = { ...modelo.posicoesManualSensores || {} }

      // Carregar estado completo se disponível
      if (modelo.estadoCompleto) {

        // Restaurar configuração do armazém
        if (modelo.estadoCompleto.configArmazem) {
          this.configArmazem = { ...modelo.estadoCompleto.configArmazem }
        }

        // Restaurar posições de cabos
        if (modelo.estadoCompleto.posicoesCabos) {
          this.posicoesCabos = { ...modelo.estadoCompleto.posicoesCabos }
        }

        // NOVO: Restaurar posições manuais do estado completo (prioridade sobre modelo base)
        if (modelo.estadoCompleto.posicoesManualPendulos) {
          this.posicoesManualPendulos = { ...modelo.estadoCompleto.posicoesManualPendulos }
        }
        if (modelo.estadoCompleto.posicoesManualSensores) {
          this.posicoesManualSensores = { ...modelo.estadoCompleto.posicoesManualSensores }
        }

        // Restaurar cabo selecionado
        this.caboSelecionadoPosicionamento = modelo.estadoCompleto.caboSelecionadoPosicionamento || null

        // Restaurar modelagem individual se estava ativa
        if (modelo.estadoCompleto.modelagemIndividualAtiva) {
          this.modelagemIndividualAtiva = modelo.estadoCompleto.modelagemIndividualAtiva
          this.posicoesPendulosIndividuais = { ...modelo.estadoCompleto.posicoesPendulosIndividuais || {} }
          this.posicoesSensoresIndividuais = { ...modelo.estadoCompleto.posicoesSensoresIndividuais || {} }
          this.ajustesGlobaisSensores = { ...modelo.estadoCompleto.ajustesGlobaisSensores || { horizontal: 0, vertical: 0 } }
        }
      } else {
        // Fallback para modelos sem estado completo
        if (modelo.posicoesCabos) {
          this.posicoesCabos = { ...modelo.posicoesCabos }
        }
      }

      // 🔧 GARANTIR que o SVG seja atualizado e os event listeners reestabelecidos
      this.$nextTick(() => {
        this.updateSVG()
        setTimeout(() => {
          this.reestabelecerEventListenersSeguro()
        }, 100)
      })

    },

    aplicarConfiguracaoGeralArmazem() {
      // Quando não há modelo selecionado, usar configuração geral
      const primeiroModelo = this.modelosArcos[1]
      if (primeiroModelo?.config) {
        this.configArmazem = { ...primeiroModelo.config }
      }
    },

    salvarModeloNoLocalStorage(numeroModelo, dadosModelo) {
      if (typeof localStorage !== 'undefined') {
        try {
          const chave = `modelo_arco_${numeroModelo}_${Date.now()}`
          localStorage.setItem(chave, JSON.stringify({
            numeroModelo,
            dados: dadosModelo,
            timestamp: new Date().toISOString(),
            tipo: 'modelo_individual'
          }))
        } catch (error) {
        }
      }
    },

    salvarModelosAutomatico() {
      if (typeof localStorage !== 'undefined') {
        try {
          const estadoModelos = {
            quantidadeModelos: this.quantidadeModelosArcos,
            modelosArcos: this.modelosArcos,
            modelosSalvos: this.modelosSalvos,
            modeloAtual: this.modeloArcoAtual,
            posicoesCabos: this.posicoesCabos,
            timestamp: new Date().toISOString()
          }
          localStorage.setItem('estadoModelosArcos', JSON.stringify(estadoModelos))
        } catch (error) {
        }
      }
    },

    resetSiloField(campo, valor) {
      this.configSilo[campo] = valor
      // 🔧 SINCRONIZAR configSilo com dadosSilo para atualização em tempo real
      this.sincronizarConfigSiloComDados()
      this.updateSVG()
    },

    // 🔧 NOVO MÉTODO: Merge seguro de configuração com defaults para preservar reatividade Vue 2
    mergeSiloConfigComDefaults(configCarregada) {
      if (!configCarregada) return getDefaultSiloConfig()
      
      const defaults = getDefaultSiloConfig()
      const configCompleta = { ...defaults }
      
      // Helper para parsing robusto de booleans com fallback para default
      const parseBoolean = (valor, defaultValue) => {
        if (typeof valor === 'boolean') return valor
        if (typeof valor === 'number') {
          return valor === 1 ? true : valor === 0 ? false : defaultValue
        }
        if (typeof valor === 'string') {
          const str = valor.trim().toLowerCase()
          if (str === 'true' || str === '1') return true
          if (str === 'false' || str === '0') return false
          return defaultValue
        }
        return defaultValue
      }
      
      // Normalizar e aplicar propriedades carregadas com type safety robusta
      Object.keys(configCarregada).forEach(key => {
        if (key in defaults) {
          const valorCarregado = configCarregada[key]
          const tipoDefault = typeof defaults[key]
          
          // Normalização de tipos robusta
          if (tipoDefault === 'number' && valorCarregado !== null && valorCarregado !== undefined) {
            const numeroConvertido = Number(valorCarregado)
            configCompleta[key] = Number.isFinite(numeroConvertido) ? numeroConvertido : defaults[key]
          } else if (tipoDefault === 'boolean' && valorCarregado !== null && valorCarregado !== undefined) {
            configCompleta[key] = parseBoolean(valorCarregado, defaults[key])
          } else if (valorCarregado !== null && valorCarregado !== undefined) {
            configCompleta[key] = valorCarregado
          }
        }
      })
      
      // SEMPRE garantir backfill completo dos sensores por pêndulo (incondicional)
      const quantidadePendulos = configCompleta.quantidadePendulos || 5
      const sensoresCompletos = {}
      
      // Backfill: criar todos os índices necessários com defaults
      for (let i = 1; i <= quantidadePendulos; i++) {
        sensoresCompletos[i] = defaults.sensoresPorPendulo[i] || 5
      }
      
      // Aplicar valores carregados sobre os defaults (se existirem)
      if (configCarregada.sensoresPorPendulo) {
        Object.keys(configCarregada.sensoresPorPendulo).forEach(pendulo => {
          const valor = Number(configCarregada.sensoresPorPendulo[pendulo])
          if (Number.isFinite(valor) && valor >= 1) {
            sensoresCompletos[pendulo] = valor
          }
        })
      }
      
      configCompleta.sensoresPorPendulo = sensoresCompletos
      
      // Preservar arrays com validação robusta
      if (Array.isArray(configCarregada.pos_x_cabo)) {
        configCompleta.pos_x_cabo = configCarregada.pos_x_cabo.map(v => {
          const n = Number(v)
          return Number.isFinite(n) ? n : 0
        })
      }
      if (Array.isArray(configCarregada.pos_y_cabo)) {
        configCompleta.pos_y_cabo = configCarregada.pos_y_cabo.map(v => {
          const n = Number(v)
          return Number.isFinite(n) ? n : 0
        })
      }
      
      return configCompleta
    },

    // 🔧 NOVO MÉTODO: Sincronizar configSilo com estrutura de dados do preview
    sincronizarConfigSiloComDados() {
      try {
        // Sincronizar dados_layout com configSilo para refletir mudanças em tempo real
        if (this.dados && this.dados.dados_layout) {
          // Dimensões do silo
          this.dados.dados_layout.desenho_corte_silo.lb = this.configSilo.lb || 200
          this.dados.dados_layout.desenho_corte_silo.hs = this.configSilo.hs || 180
          this.dados.dados_layout.desenho_corte_silo.hb = this.configSilo.hb || 15
          this.dados.dados_layout.desenho_corte_silo.eb = this.configSilo.eb || 5

          // Configurações dos sensores
          this.dados.dados_layout.desenho_sensores.escala_sensores = this.configSilo.escala_sensores || 16
          this.dados.dados_layout.desenho_sensores.dist_y_sensores = this.configSilo.dist_y_sensores || 12

          // Configurações dos aeradores
          this.dados.dados_layout.aeradores.na = this.configSilo.na || 4
          this.dados.dados_layout.aeradores.ds = this.configSilo.ds || -4
          this.dados.dados_layout.aeradores.dy = this.configSilo.dy || 0
          this.dados.dados_layout.aeradores.da = this.configSilo.da || 0

          // Dimensões do SVG
          if (this.dados.dados_layout.tamanho_svg) {
            this.dados.dados_layout.tamanho_svg[0] = this.configSilo.largura_svg || 525
            this.dados.dados_layout.tamanho_svg[1] = this.configSilo.altura_svg || 188
          }

          // Atualizar dimensões locais do SVG se configuradas
          if (this.configSilo.largura_svg) {
            this.larguraSVG = this.configSilo.largura_svg
          }
          if (this.configSilo.altura_svg) {
            this.alturaSVG = this.configSilo.altura_svg
          }
        } else {
          // Se não existe dados, criar estrutura base usando dadosSilo importado
          this.dados = JSON.parse(JSON.stringify(dadosSilo))
          // Aplicar configurações atuais do configSilo
          this.sincronizarConfigSiloComDados()
        }

      } catch (error) {
      }
    },

    // Métodos para controle de pêndulos e sensores do silo
    onQuantidadePendulosSiloChange() {
      const novaQuantidade = parseInt(this.configSilo.quantidadePendulos) || 5
      
      // 🔧 PRESERVAR VALORES EXISTENTES: Não sobrescrever configurações carregadas
      const sensoresExistentes = this.configSilo.sensoresPorPendulo || {}
      const sensoresPorPendulo = {}
      
      // Preservar valores existentes e adicionar apenas novos pêndulos com padrão
      for (let i = 1; i <= novaQuantidade; i++) {
        if (sensoresExistentes[i] !== undefined) {
          // Manter valor já configurado (carregado do banco ou definido pelo usuário)
          sensoresPorPendulo[i] = sensoresExistentes[i]
        } else {
          // Só usar padrão para pêndulos realmente novos
          sensoresPorPendulo[i] = 5
        }
      }
      
      // Usar $set para garantir reatividade completa do objeto
      this.$set(this.configSilo, 'sensoresPorPendulo', sensoresPorPendulo)
      
      // Inicializar tipoPosicaoPendulo para novos pêndulos
      const tipoPosicaoExistente = this.configSilo.tipoPosicaoPendulo || {}
      const tipoPosicaoPendulo = {}
      
      for (let i = 1; i <= novaQuantidade; i++) {
        if (tipoPosicaoExistente[i] !== undefined) {
          tipoPosicaoPendulo[i] = tipoPosicaoExistente[i]
        } else {
          tipoPosicaoPendulo[i] = 'central'
        }
      }
      
      this.$set(this.configSilo, 'tipoPosicaoPendulo', tipoPosicaoPendulo)
      
      // Inicializar tipoCaboPendulo para novos pêndulos
      const tipoCaboExistente = this.configSilo.tipoCaboPendulo || {}
      const tipoCaboPendulo = {}
      
      for (let i = 1; i <= novaQuantidade; i++) {
        if (tipoCaboExistente[i] !== undefined) {
          tipoCaboPendulo[i] = tipoCaboExistente[i]
        } else {
          tipoCaboPendulo[i] = 'digital'
        }
      }
      
      this.$set(this.configSilo, 'tipoCaboPendulo', tipoCaboPendulo)
      
      // Criar dados exemplares para visualização
      this.criarDadosExemplaresSilo()
    },

    alterarSensoresSilo(numeroPendulo, incremento) {
      const valorAtual = this.configSilo.sensoresPorPendulo[numeroPendulo] || 5
      const novoValor = Math.max(1, Math.min(20, valorAtual + incremento))
      
      if (!this.configSilo.sensoresPorPendulo) {
        this.$set(this.configSilo, 'sensoresPorPendulo', {})
      }
      
      // Usar $set para garantir reatividade no Vue 2
      this.$set(this.configSilo.sensoresPorPendulo, numeroPendulo, novoValor)
      
      // Criar dados exemplares para visualização
      this.criarDadosExemplaresSilo()
    },

    setSensoresPenduloSilo(numeroPendulo, valor) {
      const novoValor = parseInt(valor)
      if (!isNaN(novoValor) && novoValor >= 1 && novoValor <= 20) {
        if (!this.configSilo.sensoresPorPendulo) {
          this.$set(this.configSilo, 'sensoresPorPendulo', {})
        }
        
        // Usar $set para garantir reatividade no Vue 2
        this.$set(this.configSilo.sensoresPorPendulo, numeroPendulo, novoValor)
        
        // Criar dados exemplares para visualização
        this.criarDadosExemplaresSilo()
      }
    },

    onTipoPosicaoPenduloChange(numeroPendulo) {
      if (!this.configSilo.tipoPosicaoPendulo) {
        this.$set(this.configSilo, 'tipoPosicaoPendulo', {})
      }
      
      // Atualizar visualização
      this.criarDadosExemplaresSilo()
      this.updateSVG()
    },

    onTipoCaboPenduloChange(numeroPendulo) {
      if (!this.configSilo.tipoCaboPendulo) {
        this.$set(this.configSilo, 'tipoCaboPendulo', {})
      }
      
      // Atualizar visualização
      this.criarDadosExemplaresSilo()
      this.updateSVG()
    },

    aplicarSensoresUniformesSilo() {
      const quantidade = prompt('Digite a quantidade de sensores para aplicar em todos os pêndulos:', '5')
      const numero = parseInt(quantidade)
      
      if (isNaN(numero) || numero < 1 || numero > 20) {
        this.mostrarToast('Número inválido! Digite um valor entre 1 e 20.', 'error')
        return
      }
      
      // Aplicar mesmo número de sensores para todos os pêndulos
      const sensoresUniformes = {}
      for (let i = 1; i <= this.configSilo.quantidadePendulos; i++) {
        sensoresUniformes[i] = numero
      }
      
      // Usar $set para garantir reatividade completa do objeto
      this.$set(this.configSilo, 'sensoresPorPendulo', sensoresUniformes)
      
      // Criar dados exemplares para visualização
      this.criarDadosExemplaresSilo()
      
      this.mostrarToast(`Aplicado ${numero} sensores uniformemente para todos os ${this.configSilo.quantidadePendulos} pêndulos!`, 'success')
    },

    resetarSensoresPadraoSilo() {
      // Resetar para 5 sensores por pêndulo
      const sensoresPadrao = {}
      for (let i = 1; i <= this.configSilo.quantidadePendulos; i++) {
        sensoresPadrao[i] = 5
      }
      
      // Usar $set para garantir reatividade completa do objeto
      this.$set(this.configSilo, 'sensoresPorPendulo', sensoresPadrao)
      
      // Criar dados exemplares para visualização
      this.criarDadosExemplaresSilo()
      
      this.mostrarToast('Sensores resetados para o padrão (5 sensores por pêndulo)!', 'success')
    },

    // 🎯 NOVOS MÉTODOS: Controles do Topo
    onRotacaoFundoChange(valor) {
      // Garantir que o valor esteja entre 0 e 360
      const rotacao = parseFloat(valor !== undefined ? valor : this.configSilo.rotacaoFundo)
      if (!isNaN(rotacao)) {
        this.configSilo.rotacaoFundo = ((rotacao % 360) + 360) % 360
      }
      // Forçar atualização do SVG
      this.updateSVG()
    },

    onAfastamentoPendulosChange() {
      // Garantir que o valor esteja entre 0.5 e 1.5
      const afastamento = parseFloat(this.configSilo.afastamentoPendulos)
      if (!isNaN(afastamento)) {
        this.configSilo.afastamentoPendulos = Math.max(0.5, Math.min(1.5, afastamento))
      }
      // Forçar atualização do SVG
      this.updateSVG()
    },

    onRotacaoPendulosChange(valor) {
      // Garantir que o valor esteja entre 0 e 360
      const rotacao = parseFloat(valor !== undefined ? valor : this.configSilo.rotacaoPendulos)
      if (!isNaN(rotacao)) {
        this.configSilo.rotacaoPendulos = ((rotacao % 360) + 360) % 360
      }
      // Forçar atualização do SVG
      this.updateSVG()
    },

    onTamanhoCirculoChange(valor) {
      // Garantir que o valor esteja entre 3 e 15
      const tamanho = parseFloat(valor !== undefined ? valor : this.configSilo.tamanhoCirculoPendulo)
      if (!isNaN(tamanho)) {
        this.configSilo.tamanhoCirculoPendulo = Math.max(3, Math.min(15, tamanho))
      }
      // Forçar atualização do SVG
      this.updateSVG()
    },

    onEspessuraBordaCirculoChange(valor) {
      // Garantir que o valor esteja entre 0 e 5
      const espessura = parseFloat(valor !== undefined ? valor : this.configSilo.espessuraBordaCirculo)
      if (!isNaN(espessura)) {
        this.configSilo.espessuraBordaCirculo = Math.max(0, Math.min(5, espessura))
      }
      // Forçar atualização do SVG
      this.updateSVG()
    },

    onAfastamentoCamadaChange(tipo, valor) {
      // Aceita tipo e valor como parâmetros, mas também funciona sem parâmetros para retrocompatibilidade
      if (tipo && valor !== undefined) {
        // Modo com parâmetros (novo)
        const valorFloat = parseFloat(valor)
        if (!isNaN(valorFloat)) {
          const valorValidado = Math.max(0.3, Math.min(1.5, valorFloat))
          if (tipo === 'lateral') {
            this.configSilo.afastamentoLateral = valorValidado
          } else if (tipo === 'central') {
            this.configSilo.afastamentoCentral = valorValidado
          } else if (tipo === 'intermediario') {
            this.configSilo.afastamentoIntermediario = valorValidado
          }
        }
      } else {
        // Modo retrocompatível (sem parâmetros)
        const lateral = parseFloat(this.configSilo.afastamentoLateral)
        if (!isNaN(lateral)) {
          this.configSilo.afastamentoLateral = Math.max(0.3, Math.min(1.5, lateral))
        }
        
        const central = parseFloat(this.configSilo.afastamentoCentral)
        if (!isNaN(central)) {
          this.configSilo.afastamentoCentral = Math.max(0.3, Math.min(1.5, central))
        }
        
        const intermediario = parseFloat(this.configSilo.afastamentoIntermediario)
        if (!isNaN(intermediario)) {
          this.configSilo.afastamentoIntermediario = Math.max(0.3, Math.min(1.5, intermediario))
        }
      }
      
      // Forçar atualização do SVG
      this.updateSVG()
    },

    resetarControlesTopo() {
      // Resetar rotação do fundo para 0
      this.$set(this.configSilo, 'rotacaoFundo', 0)
      
      // Resetar rotação dos pêndulos para 0
      this.$set(this.configSilo, 'rotacaoPendulos', 0)
      
      // Resetar afastamento dos pêndulos para 1.0 (legado)
      this.$set(this.configSilo, 'afastamentoPendulos', 1.0)
      
      // Resetar afastamento por camada para 1.0
      this.$set(this.configSilo, 'afastamentoLateral', 1.0)
      this.$set(this.configSilo, 'afastamentoCentral', 1.0)
      this.$set(this.configSilo, 'afastamentoIntermediario', 1.0)
      
      // Resetar tamanho e borda dos círculos
      this.$set(this.configSilo, 'tamanhoCirculoPendulo', 5.7138)
      this.$set(this.configSilo, 'espessuraBordaCirculo', 1.5)
      
      // Limpar posições manuais dos pêndulos
      this.posicoesManualPendulos = {}
      
      // Forçar atualização do SVG
      this.updateSVG()
      
      this.mostrarToast('Controles do topo resetados!', 'success')
    },

    // 🎯 MÉTODOS: Controles do Topo do Armazém
    onQuantidadeCelulasChange(quantidade) {
      // Atualizar configuração e forçar atualização
      this.updateSVG()
    },

    onTotalArcosChange(total) {
      // Atualizar distribuição automática se necessário
      this.atualizarDistribuicaoArcos()
      this.updateSVG()
    },

    onTotalPendulosChange(total) {
      this.updateSVG()
    },

    onDistribuicaoArcosChange(distribuicao) {
      // Validar que a soma bate com o total
      const soma = distribuicao.frente + distribuicao.parImpar + distribuicao.fundo
      if (soma !== this.configTopoArmazem.totalArcos) {
      }
      this.updateSVG()
    },

    onLarguraArcosChange(largura) {
      this.updateSVG()
    },

    onDistanciaVerticalChange(distancia) {
      this.updateSVG()
    },

    onSeparacaoHorizontalChange(separacao) {
      this.updateSVG()
    },

    atualizarDistribuicaoArcos() {
      // Atualizar distribuição automática baseada no total de arcos e modelos
      const totalArcos = this.configTopoArmazem.totalArcos
      
      if (this.quantidadeModelosArcos >= 3) {
        this.configTopoArmazem.arcosFrente = 1
        this.configTopoArmazem.arcosFundo = 1
        this.configTopoArmazem.arcosParImpar = Math.max(0, totalArcos - 2)
      } else if (this.quantidadeModelosArcos === 2) {
        this.configTopoArmazem.arcosFrente = 1
        this.configTopoArmazem.arcosFundo = Math.min(1, totalArcos - 1)
        this.configTopoArmazem.arcosParImpar = Math.max(0, totalArcos - this.configTopoArmazem.arcosFrente - this.configTopoArmazem.arcosFundo)
      } else {
        // Com 0 ou 1 modelo, usar distribuição simples sem frente/fundo
        this.configTopoArmazem.arcosFrente = Math.min(1, totalArcos)
        this.configTopoArmazem.arcosFundo = Math.max(0, totalArcos - 1)
        this.configTopoArmazem.arcosParImpar = 0
      }
    },

    resetarControlesTopoArmazem() {
      // Resetar configurações do topo do armazém
      this.configTopoArmazem.quantidadeCelulas = 2
      this.configTopoArmazem.totalArcos = Math.max(1, this.quantidadeModelosArcos)
      this.configTopoArmazem.totalPendulos = 1
      this.configTopoArmazem.larguraEntreArcos = 50
      this.configTopoArmazem.distanciaVertical = 20
      this.configTopoArmazem.separacaoHorizontal = 30
      
      // Atualizar distribuição de forma segura
      this.atualizarDistribuicaoArcos()
      
      // Forçar atualização do SVG
      this.updateSVG()
      
      this.mostrarToast('Controles do topo do armazém resetados!', 'success')
    },

    // Criar dados exemplares estáticos para visualização do silo (evita flicker)
    criarDadosExemplaresSilo() {
      if (this.tipoAtivo !== 'silo') return

      const quantidadePendulos = this.configSilo.quantidadePendulos || 0
      const sensoresPorPendulo = this.configSilo.sensoresPorPendulo || {}

      if (quantidadePendulos === 0) return

      // Criar estrutura de dados similar ao armazém
      const dadosExemploSilo = { leitura: {} }

      // Usar valores de temperatura estáticos baseados na posição para evitar flicker
      const temperaturasEstaticas = [15.2, 18.7, 22.3, 25.8, 19.1, 16.4, 21.9, 24.5, 17.8, 23.6, 20.2, 26.1, 18.3, 22.7, 25.0, 19.8, 24.2, 21.4, 17.5, 23.9]

      // Gerar dados para cada pêndulo baseado na configuração
      for (let pendulo = 1; pendulo <= quantidadePendulos; pendulo++) {
        dadosExemploSilo.leitura[pendulo] = {}

        // Determinar quantidade de sensores para este pêndulo
        const qtdSensores = sensoresPorPendulo[pendulo] || 5

        // Gerar temperaturas estáticas para cada sensor
        for (let sensor = 1; sensor <= qtdSensores; sensor++) {
          // Usar temperatura estática baseada em índice para evitar flicker
          const indice = ((pendulo - 1) * 20 + (sensor - 1)) % temperaturasEstaticas.length
          const temperatura = temperaturasEstaticas[indice]

          // Formato: [temp, pontoQuente, preAlarme, falha, nivel]
          dadosExemploSilo.leitura[pendulo][sensor] = [
            temperatura,
            temperatura > 25, // pontoQuente se temperatura > 25°C
            temperatura > 24, // preAlarme se temperatura > 24°C
            false, // falha
            true   // nivel (sensor ativo)
          ]
        }
      }

      // Armazenar dados para uso na renderização
      this.dados = dadosExemploSilo
    },

    resetArmazemField(campo, valor) {
      this.configArmazem[campo] = valor
      this.updateSVG()
      this.onArmazemChange()
    },

    resetarPadrao() {
      if (this.tipoAtivo === 'silo') {
        this.configSilo = getDefaultSiloConfig()
        // Criar dados exemplares para o silo resetado
        this.criarDadosExemplaresSilo()
        this.mostrarToast('Configurações do silo resetadas para o padrão!', 'success')
      } else {
        this.resetarModelosParaPadrao()
      }
      this.updateSVG()
    },

    resetarModelosParaPadrao() {
      this.configArmazem = getDefaultArmazemConfig()
      this.quantidadeModelosArcos = 1
      this.modelosArcos = {
        1: {
          posicao: 'todos',
          config: getDefaultArmazemConfig(),
          nome: 'Modelo Único',
          quantidadePendulos: 3,
          sensoresPorPendulo: {
            1: 3, 2: 3, 3: 3 // Configuração padrão uniforme de 3 sensores para 3 pêndulos
          },
          // GARANTIR que posições estejam limpas
          posicoesManualPendulos: {},
          posicoesManualSensores: {},
          posicoesCabos: {}
        }
      }
      this.modeloArcoAtual = null
      this.modelosSalvos = {}
      this.caboSelecionadoPosicionamento = null
      this.posicoesCabos = {}

      // GARANTIR que variáveis globais estejam limpas
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}
    },

    salvarConfiguracao() {
      if (!this.nomeConfiguracao.trim()) {
        this.mostrarToast('Digite um nome para salvar a configuração!', 'warning')
        return
      }

      if (typeof localStorage !== 'undefined') {
        if (this.tipoAtivo === 'silo') {
          // Para silo, incluir todas as configurações e dimensões SVG
          const configCompletaSilo = {
            // Configurações básicas do silo
            ...this.configSilo,

            // Dimensões calculadas do SVG
            dimensoesSVG: {
              largura: this.larguraSVG,
              altura: this.alturaSVG
            },

            // Metadados
            nome: this.nomeConfiguracao,
            timestamp: new Date().toISOString(),
            versao: '3.0',
            tipo: 'configuracao_silo_completa'
          }

          localStorage.setItem('configSilo', JSON.stringify(configCompletaSilo))
          localStorage.setItem(`configSilo_${this.nomeConfiguracao}`, JSON.stringify(configCompletaSilo))
          this.mostrarToast(`Configuração Silo "${this.nomeConfiguracao}" salva com sucesso!`, 'success')
        } else {
          // ETAPA 2: Validar se todos os modelos estão salvos antes de salvar configuração
          const modelosValidados = this.validarModelosParaSalvar()
          if (!modelosValidados) {
            return // Mensagem de erro já foi mostrada na validação
          }

          // Criar configuração completa do armazém
          const configCompleta = {
            // Metadados
            nome: this.nomeConfiguracao,
            timestamp: new Date().toISOString(),
            versao: '4.0',
            tipo: 'configuracao_armazem_completa',

            // SISTEMA DE MODELOS - Informações essenciais para recriação
            sistemaModelos: {
              quantidadeModelos: this.quantidadeModelosArcos,
              logicaDistribuicao: this.obterLogicaDistribuicaoCompleta(),
              modelosDefinidos: modelosValidados
            },

            // Informações da estrutura (para referência)
            estruturaReferencia: {
              totalArcos: this.analiseArcos?.totalArcos || 1,
              estatisticas: this.analiseArcos?.estatisticas || { totalPendulos: 0, totalSensores: 0 }
            },

            // Configurações globais padrão
            configuracaoGlobal: { ...this.configArmazem },

            // Dimensões SVG
            dimensoesSVG: {
              largura: this.larguraSVG,
              altura: this.alturaSVG
            },

            // Layouts automáticos
            layoutsAutomaticos: this.layoutsAutomaticos || {},

            // Dados originais (se disponíveis)
            dadosOriginais: {
              dadosPortal: this.dadosPortal,
              analiseArcos: this.analiseArcos
            }
          }

          // Salvar configuração
          localStorage.setItem('configArmazem', JSON.stringify(configCompleta))
          localStorage.setItem(`configArmazem_${this.nomeConfiguracao}`, JSON.stringify(configCompleta))

          // Gerar preview do mapeamento
          const mapeamento = this.gerarMapeamentoDistribuicao()

          this.mostrarToast(
            `✅ Configuração "${this.nomeConfiguracao}" salva!\n\n` +
            `📊 ${this.quantidadeModelosArcos} modelo(s) de arco configurado(s)\n` +
            `🎯 Lógica: ${this.obterLogicaDistribuicao().nome}\n` +
            `📐 Total de ${this.analiseArcos?.totalArcos || 1} arcos no armazém\n\n` +
            `${mapeamento}`,
            'success'
          )

          // Manter o nome da configuração para referência
          // this.nomeConfiguracao = ''
        }

        this.forceUpdateLista++
      }
    },

    // Nova função para gerar lógica de distribuição completa
    obterLogicaDistribuicaoCompleta() {
      const logica = this.obterLogicaDistribuicao()

      return {
        ...logica,
        mapeamentoDetalhado: {
          1: this.quantidadeModelosArcos === 1 ? 'todos' :
            this.quantidadeModelosArcos === 2 ? 'impar' :
              this.quantidadeModelosArcos === 3 ? 'frente_fundo' :
                'frente',
          2: this.quantidadeModelosArcos <= 1 ? 'todos' :
            this.quantidadeModelosArcos === 2 ? 'par' :
              this.quantidadeModelosArcos === 3 ? 'par' :
                'par',
          3: this.quantidadeModelosArcos <= 2 ? null :
            this.quantidadeModelosArcos === 3 ? 'impar' :
              'impar',
          4: this.quantidadeModelosArcos <= 3 ? null : 'fundo'
        }
      }
    },

    // Gerar preview do mapeamento
    gerarMapeamentoDistribuicao() {
      const totalArcos = this.analiseArcos?.totalArcos || 1
      let preview = "📋Distribuição dos modelos:\n"

      for (let arco = 1; arco <= Math.min(totalArcos, 10); arco++) {
        const modelo = this.determinarModeloParaArco(arco)
        preview += `   Arco ${arco}: ${modelo?.nome || 'Padrão'}\n`
      }

      if (totalArcos > 10) {
        preview += `   ... e mais ${totalArcos - 10} arcos seguindo o padrão`
      }

      return preview
    },

    carregarConfiguracao(nome = null) {
      const nomeConfig = nome || this.nomeConfiguracao
      if (!nomeConfig) return

      if (typeof localStorage !== 'undefined') {
        const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${nomeConfig}`
        const configSalva = localStorage.getItem(chave)

        if (configSalva) {
          try {
            const dadosCarregados = JSON.parse(configSalva)

            // 🎯 MÉTODO UNIFICADO: Usar configuracaoService para carregar qualquer versão
            const configCarregada = { dados: dadosCarregados, nome: nomeConfig }
            const resultado = configuracaoService.aplicarConfiguracaoCompleta(configCarregada, this.tipoAtivo)

            if (resultado.success) {
              this.aplicarConfiguracaoUnificada(resultado.dados, nomeConfig)
              this.mostrarToast(`Configuração "${nomeConfig}" carregada com sucesso!`, 'success')
            } else {
              this.mostrarToast(`Erro ao carregar configuração: ${resultado.message}`, 'error')
            }

            if (!nome) {
              this.nomeConfiguracao = nomeConfig
            }
            this.updateSVG()
          } catch (error) {
            this.mostrarToast('Erro ao carregar configuração!', 'error')
          }
        } else {
          this.mostrarToast('Configuração não encontrada!', 'error')
        }
      }
    },

    aplicarConfiguracaoUnificada(dados, nomeConfig) {

      // Limpar estado atual
      this.resetarEstadoModelos()

      if (dados.tipo === 'silo') {
        // Configuração de silo com merge seguro para preservar reatividade
        this.configSilo = this.mergeSiloConfigComDefaults(dados.configuracaoGlobal)
        if (dados.dimensoesSVG) {
          this.larguraSVG = dados.dimensoesSVG.largura
          this.alturaSVG = dados.dimensoesSVG.altura
        }
      } else if (dados.tipo === 'armazem') {
        // Configuração de armazém
        this.quantidadeModelosArcos = dados.quantidadeModelos || 1
        this.modelosArcos = dados.modelosArcos || {}
        this.modelosSalvos = dados.modelosArcos || {}

        // Aplicar configurações globais
        if (dados.configuracaoGlobal) {
          this.configArmazem = { ...dados.configuracaoGlobal }
        }

        // Aplicar dimensões SVG se disponíveis
        if (dados.dimensoesSVG) {
          this.larguraSVG = dados.dimensoesSVG.largura
          this.alturaSVG = dados.dimensoesSVG.altura
        }

        // Restaurar dados originais se disponíveis
        if (dados.dadosOriginais) {
          this.dadosPortal = dados.dadosOriginais.dadosPortal || this.dadosPortal
          this.analiseArcos = dados.dadosOriginais.analiseArcos || this.analiseArcos
          this.dados = dados.dadosOriginais.dados || this.dados
        }
      }
    },

    // Função para resetar estado dos modelos
    resetarEstadoModelos() {
      this.modelosArcos = {}
      this.modelosSalvos = {}
      this.modeloArcoAtual = null
      this.posicoesCabos = {}
      this.caboSelecionadoPosicionamento = null
    },

    deletarConfiguracao(nome) {
      if (typeof localStorage !== 'undefined') {
        const chave = `config${this.tipoAtivo === 'silo' ? 'Silo' : 'Armazem'}_${nome}`
        localStorage.removeItem(chave)
        this.mostrarToast(`Configuração "${nome}" removida com sucesso!`, 'success')
        this.forceUpdateLista++
        if (this.nomeConfiguracao === nome) {
          this.nomeConfiguracao = ''
        }
      }
    },

    // Sistema de Toast Notifications
    mostrarToast(mensagem, tipo = 'info') {
      const toast = document.createElement('div')
      const icones = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      }
      const cores = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
      }

      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || cores.info};
        color: ${tipo === 'warning' ? '#000' : '#fff'};
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 99999;
        font-size: 14px;
        max-width: 350px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
      `

      toast.innerHTML = `
        ${icones[tipo] || icones.info} ${mensagem}
      `

      // Adicionar animação CSS
      const style = document.createElement('style')
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `
      document.head.appendChild(style)

      document.body.appendChild(toast)

      setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse'
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove()
          }
          if (style.parentNode) {
            style.remove()
          }
        }, 300)
      }, 4000)
    },

    // Método para carregar modelos do banco
    async carregarModelosDoBanco() {
      if (this.carregandoModelosBanco) return

      this.carregandoModelosBanco = true
      try {
        // Filtrar por tipo (S/A) e vista (T/F) conforme backend
        const tp = this.tipoAtivo === 'silo' ? 'S' : 'A'
        const vista = this.visaoAtiva === 'topo' ? 'T' : 'F'
        const response = await (modeloSvgService.buscarModelosFiltrados
          ? modeloSvgService.buscarModelosFiltrados(tp, vista)
          : modeloSvgService.buscarModelos(tp))

        if (response && response.data) {
          this.modelosBanco = Array.isArray(response.data) ? response.data : []
        } else {
          this.modelosBanco = []
        }
      } catch (error) {
        this.mostrarToast('Erro ao carregar modelos do banco', 'error')
        this.modelosBanco = []
      } finally {
        this.carregandoModelosBanco = false
      }
    },

    // Método para aplicar modelo do banco no preview
    async aplicarModeloBancoNoPreview() {
      if (!this.configuracaoPreviewSelecionada) {
        this.limparConfiguracaoPreview()
        return
      }

      try {
        const response = await modeloSvgService.buscarModeloPorId(this.configuracaoPreviewSelecionada)

        if (response && response.data) {
          const modeloCarregado = response.data

          // Verificar se tem dados SVG válidos
          if (modeloCarregado.dado_svg) {
            let dadosSVG
            try {
              dadosSVG = typeof modeloCarregado.dado_svg === 'string'
                ? JSON.parse(modeloCarregado.dado_svg)
                : modeloCarregado.dado_svg
            } catch (parseError) {
              this.mostrarToast('Dados SVG inválidos no modelo', 'error')
              return
            }

            // Aplicar configuração mesclando com valores padrão
            if (this.tipoAtivo === 'silo') {
              // Para silo, mesclar configuração salva com configuração padrão
              const configPadrao = { ...this.configSilo }
              const configSalva = dadosSVG.configuracao || dadosSVG

              this.configPreviewAplicada = this.mesclarConfiguracaoComPadrao(configPadrao, configSalva)

            } else {
              // Para armazém, determinar modelo para o arco atual e mesclar configurações
              const modeloParaArco = this.determinarModeloParaArcoAtual(dadosSVG)
              const configPadrao = { ...this.configArmazem }

              if (modeloParaArco && (modeloParaArco.config || modeloParaArco.configuracao)) {
                const configSalva = modeloParaArco.config || modeloParaArco.configuracao
                this.configPreviewAplicada = this.mesclarConfiguracaoComPadrao(configPadrao, configSalva)

              } else {
                // Fallback para configuração global se disponível
                const configGlobal = dadosSVG.configuracaoGlobal || dadosSVG
                this.configPreviewAplicada = this.mesclarConfiguracaoComPadrao(configPadrao, configGlobal)

              }
            }

            this.mostrarToast(`Preview: ${modeloCarregado.nm_modelo} aplicado`, 'info')
            this.updateSVG()

          } else {
            this.mostrarToast('Modelo não possui dados SVG', 'warning')
          }
        } else {
          this.mostrarToast('Erro ao carregar modelo do banco', 'error')
        }
      } catch (error) {
        this.mostrarToast('Erro ao carregar modelo do banco', 'error')
      }
    },

    // Métodos para configuração do preview (mantendo compatibilidade)
    aplicarConfiguracaoNoPreview() {
      // Método mantido para compatibilidade, mas agora usa aplicarModeloBancoNoPreview
      this.aplicarModeloBancoNoPreview()
    },

    limparConfiguracaoPreview() {
      this.configuracaoPreviewSelecionada = ''
      this.configPreviewAplicada = null
      this.updateSVG()
      this.mostrarToast('Preview voltou ao padrão', 'info')
    },

    // Método para mesclar configuração salva com configuração padrão
    mesclarConfiguracaoComPadrao(configPadrao, configSalva) {

      if (!configSalva || typeof configSalva !== 'object') {
        return { ...configPadrao }
      }

      // Começar com configuração padrão
      const configMesclada = { ...configPadrao }

      // Aplicar apenas as variáveis que foram especificamente salvas no modelo
      Object.keys(configSalva).forEach(chave => {
        const valorSalvo = configSalva[chave]

        // Aplicar valor salvo apenas se for diferente de undefined/null e se a chave existe no padrão
        if (valorSalvo !== undefined && valorSalvo !== null && configPadrao.hasOwnProperty(chave)) {
          // Verificar se o valor salvo é realmente diferente do padrão
          if (valorSalvo !== configPadrao[chave]) {
            configMesclada[chave] = valorSalvo
          } else {
          }
        } else if (!configPadrao.hasOwnProperty(chave)) {
          // Se a chave não existe no padrão, adicionar mesmo assim (nova funcionalidade)
          configMesclada[chave] = valorSalvo
        }
      })

      return configMesclada
    },

    determinarModeloParaArcoAtual(dadosProcessados) {

      if (!dadosProcessados) {
        return null
      }

      // Verificar diferentes estruturas possíveis
      let modelos = null
      let quantidadeModelos = 1

      // Estrutura v5.0 (nova)
      if (dadosProcessados.modelosDefinidos) {
        modelos = dadosProcessados.modelosDefinidos
        quantidadeModelos = dadosProcessados.quantidadeModelos || Object.keys(modelos).length
      }
      // Estrutura v4.0 (sistemaModelos)
      else if (dadosProcessados.sistemaModelos && dadosProcessados.sistemaModelos.modelosDefinidos) {
        modelos = dadosProcessados.sistemaModelos.modelosDefinidos
        quantidadeModelos = dadosProcessados.sistemaModelos.quantidadeModelos || Object.keys(modelos).length
      }
      // Estrutura v3.0 (modelos)
      else if (dadosProcessados.modelos) {
        modelos = dadosProcessados.modelos
        quantidadeModelos = dadosProcessados.quantidadeModelos || Object.keys(modelos).length
      }
      // Estrutura v2.0 (modelosArcos)
      else if (dadosProcessados.modelosArcos) {
        modelos = dadosProcessados.modelosArcos
        quantidadeModelos = dadosProcessados.quantidadeModelos || Object.keys(modelos).length
      }

      if (!modelos || Object.keys(modelos).length === 0) {
        return null
      }

      const numeroArco = this.arcoAtual
      const totalArcos = this.analiseArcos?.totalArcos || 1

      // Aplicar mesma lógica de distribuição de modelos
      if (quantidadeModelos === 1) {
        const modelo = modelos[1] || modelos['1'] || Object.values(modelos)[0]
        return modelo
      }

      if (quantidadeModelos === 2) {
        const isImpar = numeroArco % 2 === 1
        const posicaoProcurada = isImpar ? 'impar' : 'par'

        // Procurar por posição primeiro
        let modeloEncontrado = Object.values(modelos).find(modelo => {
          return modelo.posicao === posicaoProcurada
        })

        if (!modeloEncontrado) {
          // Fallback por número
          modeloEncontrado = modelos[isImpar ? 1 : 2] || Object.values(modelos)[0]
        }

        return modeloEncontrado
      }

      if (quantidadeModelos === 3) {
        if (numeroArco === 1 || numeroArco === totalArcos) {
          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === 'frente_fundo'
          ) || modelos[1] || Object.values(modelos)[0]

          return modeloEncontrado
        } else {
          const isParIntermediario = numeroArco % 2 === 0
          const posicaoProcurada = isParIntermediario ? 'par' : 'impar'

          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === posicaoProcurada
          ) || modelos[isParIntermediario ? 2 : 3] || Object.values(modelos)[0]

          return modeloEncontrado
        }
      }

      if (quantidadeModelos === 4) {
        if (numeroArco === 1) {
          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === 'frente'
          ) || modelos[1] || Object.values(modelos)[0]

          return modeloEncontrado
        }
        if (numeroArco === totalArcos) {
          const modeloEncontrado = Object.values(modelos).find(modelo =>
            modelo.posicao === 'fundo'
          ) || modelos[4] || Object.values(modelos)[0]

          return modeloEncontrado
        }
        const isParIntermediario = numeroArco % 2 === 0
        const posicaoProcurada = isParIntermediario ? 'par' : 'impar'

        const modeloEncontrado = Object.values(modelos).find(modelo =>
          modelo.posicao === posicaoProcurada
        ) || modelos[isParIntermediario ? 2 : 3] || Object.values(modelos)[0]

        return modeloEncontrado
      }

      const modeloPadrao = modelos[1] || Object.values(modelos)[0]
      return modeloPadrao
    },

    corFaixaExata(t) {
      if (t === -1000) return '#ff0000'
      if (t < 12) return '#0384fc'
      else if (t < 15) return '#03e8fc'
      else if (t < 17) return '#03fcbe'
      else if (t < 21) return '#07fc03'
      else if (t < 25) return '#c3ff00'
      else if (t < 27) return '#fcf803'
      else if (t < 30) return '#ffb300'
      else if (t < 35) return '#ff2200'
      else if (t < 50) return '#ff0090'
      else return '#f700ff'
    },

    // Método mantido para compatibilidade com o silo, mas agora apenas para silo
    // Método removido - funcionalidade migrada para ArmazemSvg.vue

    updateSVG() {
      // Não bloquear atualizações do silo durante drag - apenas do armazém
      if (this.isDragging && this.tipoAtivo === 'armazem') {
        return
      }

      this.calcularDimensoesSVG()
      this.generateSVG()

      // Reestabelecer event listeners para armazém após regeneração do SVG
      if (this.tipoAtivo === 'armazem') {
        this.$nextTick(() => {
          setTimeout(() => {
            this.adicionarEventListeners()
          }, 200) // Delay maior para garantir renderização completa do ArmazemSvg
        })
      }
    },

    calcularDimensoesSVG() {
      if (this.tipoAtivo === 'silo') {
        this.larguraSVG = this.configSilo.lb + (this.configSilo.aeradores_ativo ? this.configSilo.ds * 2 + 68 : 0)
        this.alturaSVG = this.configSilo.hs + this.configSilo.hb * 1.75 + 80 // Espaço adicional para pêndulos abaixo da base
      } else {
        // Para armazém, não calcular dimensões aqui - deixar o ArmazemSvg gerenciar completamente
        // Apenas manter valores padrão mínimos para compatibilidade
        this.larguraSVG = 400
        this.alturaSVG = 300
      }
    },

    generateSVG() {
      if (this.tipoAtivo === 'silo') {
        this.svgContent = this.renderSilo()
      }
      // Para armazém, o SVG é renderizado inteiramente pelo componente ArmazemSvg
    },

    renderSilo() {
      const { lb, hs, hb, eb } = this.configSilo
      const p1 = [0, hs]
      const p2 = [lb, hs]
      const p3 = [lb, hb * 1.75]
      const p4 = [lb / 2, 0]
      const p5 = [0, hb * 1.75]
      const points = `${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]} ${p5[0]},${p5[1]}`

      const transformSilo = this.configSilo.aeradores_ativo ? `translate(${this.configSilo.ds + 34}, 0)` : ""

      let svg = `
        <style>
          .sensor-element, .pendulo-element, text, rect {
            transition: all 0.15s ease-out;
          }
        </style>
        <g transform="${transformSilo}">
          <polygon fill="#E7E7E7" points="${points}" />
          <path
            fill="#999999"
            d="M71.6612 0.7892c-22.3726,7.3556 -44.7452,14.711 -67.1178,22.0666 -2.8377,0.9516 -4.5433,2.0295 -4.5433,3.0972 0,1.2723 2.1973,2.4833 6.1583,3.5826l65.1098 -26.4989c2.7618,-1.1944 5.9842,-1.6696 9.8636,0l65.35 26.5966c3.6894,-1.0265 5.9182,-2.2416 5.9182,-3.6803 0,-1.0677 -1.7056,-2.1456 -4.5433,-3.0972 -22.3726,-7.3556 -44.7453,-14.711 -67.1179,-22.0666 -2.9444,-1.0554 -5.9663,-1.0486 -9.0776,0z"
            transform="scale(${lb / 152}, ${hb / 15})"
          />
          <ellipse fill="#999999" cx="${lb / 2}" cy="${hs}" rx="${lb / 2}" ry="${hb}" />
          <ellipse fill="#CCCCCC" cx="${lb / 2}" cy="${hs - eb}" rx="${lb / 2}" ry="${hb}" />
        </g>
      `

      if (this.configSilo.aeradores_ativo) {
        svg += this.renderAeradoresSilo()
      }

      // Adicionar pêndulos e sensores
      svg += this.renderSensoresSilo()

      return svg
    },

    renderAeradoresSilo() {
      const { na, ds, dy, da, lb, hs } = this.configSilo
      const posY = hs + dy - 30
      const posX = lb + ds * 2 - 31
      let aeradores = ''

      const dBlade = "M87.8719 24.0211c0,0.1159 -0.0131,0.2287 -0.0378,0.3371 2.7914,0.5199 5.9807,0.6695 6.4392,2.7909 0.0127,1.1871 -0.2692,1.9342 -1.3353,3.2209 -1.8235,-3.4167 -3.7636,-4.2185 -5.4164,-5.3813 -0.1853,0.2222 -0.4331,0.3904 -0.7164,0.4775 0.9454,2.6773 2.4105,5.5142 0.8026,6.9719 -1.0217,0.6046 -1.8096,0.734 -3.4571,0.454 2.0472,-3.2874 1.7716,-5.3685 1.9521,-7.3812 -0.2952,-0.0506 -0.5611,-0.1869 -0.7713,-0.3822 -1.846,2.1575 -3.5703,4.8451 -5.6368,4.1814 -1.0345,-0.5825 -1.5405,-1.2002 -2.1218,-2.7669 3.8705,0.1292 5.535,-1.15 7.3682,-2 0.0599,-0.1627 0.0927,-0.3386 0.0927,-0.5221z"
      const angles = [0, 60, 120, 180, 240, 300]
      
      // 🔄 USAR VALORES DINÂMICOS DO LAYOUT PARA AERADORES
      const aeradorEscala = this.layoutSilo?.aeradores?.escala || this.configSilo.aerador_escala || 1
      const aeradorRotacao = this.layoutSilo?.aeradores?.rotacao || this.configSilo.aerador_rotacao || 0
      
      // Aeradores configurados dinamicamente

      for (let id = 1; id <= na; id++) {
        let transform = ""
        if (id === 1) transform = `translate(-73, ${posY})`
        else if (id === 2) transform = `translate(${posX}, ${posY})`
        else if (id === 3) transform = `translate(-73, ${posY - 35 - da})`
        else if (id === 4) transform = `translate(${posX}, ${posY - 35 - da})`
        else if (id === 5) transform = `translate(-73, ${posY - 70 - da * 2})`
        else if (id === 6) transform = `translate(${posX}, ${posY - 70 - da * 2})`
        
        // Adicionar escala e rotação ao transform
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

    renderSensoresSilo() {
      let elementos = ''

      // 🔄 USAR VALORES DINÂMICOS DO LAYOUT PARA PÊANDULOS
      const quantidadePendulos = this.layoutSilo?.pendulos?.quantidadePendulos || this.configSilo.quantidadePendulos || 0
      const sensoresPorPendulo = this.layoutSilo?.pendulos?.sensoresPorPendulo || this.configSilo.sensoresPorPendulo || {}
      
      // Pêndulos configurados dinamicamente

      if (quantidadePendulos === 0) {
        return elementos // Não renderizar se não há pêndulos configurados
      }

      // 🔄 USAR VALORES DINÂMICOS DO LAYOUT (NÃO HARDCODED!)
      const escala_sensores = this.layoutSilo?.desenho_sensores?.escala_sensores || this.configSilo.escala_sensores || 16
      const dist_y_sensores = this.layoutSilo?.desenho_sensores?.dist_y_sensores || this.configSilo.dist_y_sensores || 12
      
      // Valores dinâmicos aplicados com sucesso
      const transform = this.configSilo.aeradores_ativo ? `translate(${this.configSilo.ds + 34}, 0)` : ""
      const { lb, hs } = this.configSilo

      // Posicionar pêndulos fora/abaixo da base do silo
      const margemLateral = 40
      const larguraUtil = lb - (2 * margemLateral)
      const yPendulo = hs + 25 // Posição dos pêndulos abaixo da base do silo

      for (let p = 1; p <= quantidadePendulos; p++) {
        // Calcular posição X do pêndulo
        let xPendulo
        if (quantidadePendulos === 1) {
          xPendulo = lb / 2 // Centro do silo
        } else {
          const espacamento = larguraUtil / (quantidadePendulos - 1)
          xPendulo = margemLateral + ((p - 1) * espacamento)
        }

        const numSensores = sensoresPorPendulo[p] || 0

        // Renderizar pêndulo
        elementos += `
          <g transform="${transform}">
            <rect
              id="PenduloSilo_${p}"
              x="${xPendulo - escala_sensores / 2}"
              y="${yPendulo}"
              width="${escala_sensores}"
              height="${escala_sensores / 2}"
              rx="2"
              ry="2"
              fill="#3A78FD"
              stroke="none"
              stroke-width="0"
              class="pendulo-element"
            />
            <text
              id="TextoPenduloSilo_${p}"
              x="${xPendulo}"
              y="${yPendulo + escala_sensores / 4}"
              text-anchor="middle"
              dominant-baseline="central"
              font-weight="bold"
              font-size="${escala_sensores * 0.4 - 0.5}"
              font-family="Arial"
              fill="white"
              class="pendulo-element"
            >
              P${p}
            </text>
        `

        // Renderizar sensores do pêndulo
        for (let s = 1; s <= numSensores; s++) {
          const ySensor = yPendulo - dist_y_sensores * s - 25

          // Verificar se o sensor está dentro dos limites visíveis do silo
          if (ySensor > 10) {
            // Determinar cor e valor do sensor
            let corSensor = "#ccc"
            let valorSensor = "0"

            // Usar dados exemplares se disponíveis
            if (this.dados?.leitura?.[p]?.[s]) {
              const dadosSensor = this.dados.leitura[p][s]
              const temp = parseFloat(dadosSensor[0])
              const falha = dadosSensor[3]
              const nivel = dadosSensor[4]

              if (!nivel || temp == 0) {
                corSensor = "#e6e6e6"
                valorSensor = "0"
              } else {
                corSensor = this.corFaixaExata(temp)
                valorSensor = falha ? "ERRO" : temp.toFixed(1)
              }
            }

            elementos += `
              <rect
                id="SensorSilo_${p}_${s}"
                x="${xPendulo - escala_sensores / 2}"
                y="${ySensor}"
                width="${escala_sensores}"
                height="${escala_sensores / 2}"
                rx="2"
                ry="2"
                fill="${corSensor}"
                stroke="black"
                stroke-width="1"
                class="sensor-element"
              />
              <text
                id="ValorSensorSilo_${p}_${s}"
                x="${xPendulo}"
                y="${ySensor + escala_sensores / 4}"
                text-anchor="middle"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 0.5}"
                font-family="Arial"
                fill="${corSensor === "#ff2200" ? "white" : "black"}"
                class="sensor-element"
              >
                ${valorSensor}
              </text>
              <text
                id="NomeSensorSilo_${p}_${s}"
                x="${xPendulo - escala_sensores / 2 - 2}"
                y="${ySensor + escala_sensores / 4}"
                text-anchor="end"
                dominant-baseline="central"
                font-size="${escala_sensores * 0.4 - 1.5}"
                font-family="Arial"
                fill="black"
                class="sensor-element"
              >
                S${s}
              </text>
            `
          }
        }

        elementos += `
          </g>
        `
      }

      return elementos
    },

    // Métodos de renderização removidos - funcionalidade migrada para ArmazemSvg.vue

    voltarParaPreview() {
      if (this.$router) {
        this.$router.push({
          name: 'Armazem',
          query: {
            arco: this.arcoAtual
          }
        });
      } else {
        // Fallback se não há roteamento
        this.dadosVindosDoPreview = false;
        alert('Navegação de volta ao preview não disponível. Dados do preview foram limpos.');
      }
    },

    irParaArmazem() {
      if (!this.dadosPortal || !this.analiseArcos || !this.layoutsAutomaticos) {
        alert('Dados não carregados completamente. Aguarde a inicialização.');
        return;
      }

      try {
        // Preparar dados para o preview do armazém
        const dadosParaArmazem = {
          dadosPortal: this.dadosPortal,
          analiseArcos: this.analiseArcos,
          layoutsAutomaticos: this.layoutsAutomaticos,
          dadosConvertidos: this.dados,
          numeroArco: this.arcoAtual,
          timestamp: new Date().getTime()
        };

        // Salvar dados no localStorage para o Armazem pegar
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('dadosArcoParaArmazem', JSON.stringify(dadosParaArmazem));
          localStorage.setItem('timestampArcoArmazem', dadosParaArmazem.timestamp.toString());
        }

        // Navegar para o Armazem
        if (this.$router) {
          this.$router.push({
            name: 'Armazem',
            query: {
              arco: this.arcoAtual,
              origem: 'modelador'
            }
          });
        } else {
          // Fallback se não há roteamento Vue
          alert(`Dados do arco ${this.arcoAtual} preparados para o preview do armazém. Navegue manualmente para a página do Armazém.`);
        }

      } catch (error) {
        alert('Erro ao preparar dados para o preview. Verifique o console.');
      }
    },

    // Método removido - funcionalidade migrada para ArmazemSvg.vue

    // Funções para controle de pêndulos
    alterarQuantidadePendulos(data) {
      if (data.modeloArcoAtual && this.modelosArcos[data.modeloArcoAtual]) {
        this.modelosArcos[data.modeloArcoAtual].quantidadePendulos = data.novaQuantidade

        // Criar evento fake para manter compatibilidade
        const fakeEvent = { target: { value: data.novaQuantidade } }
        this.onQuantidadePendulosChange(fakeEvent)
      }
    },

    onQuantidadePendulosChange(event) {
      const modeloAtual = event.modeloArcoAtual || this.modeloArcoAtual
      if (modeloAtual) {
        const novaQuantidade = parseInt(event.target.value) || 3
        this.modelosArcos[modeloAtual].quantidadePendulos = novaQuantidade

        // Atualizar configuração de sensores por pêndulo para a nova quantidade
        const sensoresPorPendulo = {}
        for (let i = 1; i <= novaQuantidade; i++) {
          // Manter sensores existentes se já configurados, senão usar 3 como padrão
          const sensoresExistentes = this.modelosArcos[modeloAtual].sensoresPorPendulo?.[i]
          sensoresPorPendulo[i] = sensoresExistentes || 3
        }
        this.modelosArcos[modeloAtual].sensoresPorPendulo = sensoresPorPendulo

        // Regenerar dados de exemplo com nova quantidade
        this.criarDadosExemplaresComNovaQuantidadeSensores()
        // Regenerar layouts automáticos com nova quantidade
        this.regenerarLayoutsAutomaticos()
        // Inicializar posições dos cabos
        this.inicializarPosicoesCabos()
        // Salvar modelo completo imediatamente
        this.salvarModeloAtualCompleto()
        // Atualizar preview automaticamente
        this.updateSVG()
      }
    },

    onModeloDadosAtualizados(dados) {

      if (dados.modeloAtual && this.modelosArcos[dados.modeloAtual]) {
        // Atualizar modelo com novos dados
        this.modelosArcos[dados.modeloAtual] = {
          ...this.modelosArcos[dados.modeloAtual],
          ...dados.dadosModelo
        }

        // Salvar automaticamente
        this.salvarModelosAutomatico()

        // Atualizar preview se necessário
        if (this.modeloArcoAtual === dados.modeloAtual) {
          this.updateSVG()
        }
      }
    },

    // Métodos para controle de cabos
    inicializarPosicoesCabos() {
      if (!this.modeloArcoAtual) return

      const quantidade = this.modelosArcos[this.modeloArcoAtual]?.quantidadePendulos || 3
      const posicoes = {}

      // Tentar carregar posições salvas do modelo
      const posicoesSalvas = this.modelosArcos[this.modeloArcoAtual]?.posicoesCabos || {}

      // Inicializar posições baseadas no modelo salvo ou criar novas
      for (let i = 1; i <= quantidade; i++) {
        if (posicoesSalvas[i]) {
          // Usar posições salvas do modelo - garantir que sejam números
          posicoes[i] = {
            x: parseFloat(posicoesSalvas[i].x) || 0,
            y: parseFloat(posicoesSalvas[i].y) || 0
          }
        } else if (this.posicoesCabos[i]) {
          // Preservar posições existentes na sessão atual
          posicoes[i] = {
            x: parseFloat(this.posicoesCabos[i].x) || 0,
            y: parseFloat(this.posicoesCabos[i].y) || 0
          }
        } else {
          // Criar nova posição
          posicoes[i] = {
            x: 0, // Offset horizontal
            y: 0  // Offset vertical
          }
        }
      }

      this.posicoesCabos = posicoes

      // Garantir que o cabo selecionado seja válido
      if (this.caboSelecionadoPosicionamento > quantidade) {
        this.caboSelecionadoPosicionamento = null
      }
    },

    onPosicaoCaboChange() {
      // Garantir que a mudança seja salva no modelo atual
      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        // Salvar as posições dos cabos no modelo
        this.modelosArcos[this.modeloArcoAtual].posicoesCabos = { ...this.posicoesCabos }
        this.salvarModelosAutomatico()
      }
      // Atualizar preview em tempo real
      this.$nextTick(() => {
        this.updateSVG()
      })
    },

    moverCabo(direcao) {
      if (!this.caboSelecionadoPosicionamento || !this.posicoesCabos[this.caboSelecionadoPosicionamento]) return

      const posicao = this.posicoesCabos[this.caboSelecionadoPosicionamento]
      const passo = 5 // Pixels por movimento

      switch (direcao) {
        case 'left':
          posicao.x -= passo
          break
        case 'right':
          posicao.x += passo
          break
        case 'up':
          posicao.y -= passo
          break
        case 'down':
          posicao.y += passo
          break
      }

      this.updateSVG()
    },

    resetarPosicoesCabos() {
      this.inicializarPosicoesCabos()
      this.updateSVG()
    },

    criarDadosExemplaresComNovaQuantidadeSensores() {
      if (!this.modeloArcoAtual) return

      const novaQuantidade = this.modelosArcos[this.modeloArcoAtual].quantidadePendulos || 3
      const sensoresPorPendulo = this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo || {}

      // Atualizar dados do portal com nova quantidade para o arco atual
      if (!this.dadosPortal.arcos[this.arcoAtual]) {
        this.dadosPortal.arcos[this.arcoAtual] = {}
      }

      // Limpar dados antigos
      this.dadosPortal.arcos[this.arcoAtual] = {}

      // Criar novos dados baseados na quantidade configurada
      for (let p = 1; p <= novaQuantidade; p++) {
        const numSensores = sensoresPorPendulo[p] || Math.floor(Math.random() * 4) + 2 // 2-5 sensores
        this.dadosPortal.arcos[this.arcoAtual][p] = {}

        for (let s = 1; s <= numSensores; s++) {
          // Gerar temperatura aleatória entre 10°C e 40°C
          const temperaturaAleatoria = Math.random() * 30 + 10 // 10 + (0 a 30)
          const temp = Math.round(temperaturaAleatoria * 10) / 10 // Arredondar para 1 casa decimal

          this.dadosPortal.arcos[this.arcoAtual][p][s] = [temp, false, false, false, true]
        }

        // Atualizar configuração de sensores se não existir
        if (!sensoresPorPendulo[p]) {
          this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo[p] = numSensores
        }
      }

      // Reanalisar estrutura
      const novaAnalise = this.analisarEstruturaArcos(this.dadosPortal)
      this.analiseArcos = novaAnalise

      // Regenerar layouts automáticos com a nova estrutura
      const layoutsAtualizados = LayoutManager.gerarLayoutAutomatico(novaAnalise)
      this.layoutsAutomaticos = layoutsAtualizados

      // Converter dados para renderização
      const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, this.arcoAtual)
      this.dados = dadosConvertidos
    },

    regenerarLayoutsAutomaticos() {
      if (!this.analiseArcos || !this.modeloArcoAtual) return

      // Criar nova estrutura de análise baseada nos modelos configurados
      const analiseAtualizada = JSON.parse(JSON.stringify(this.analiseArcos))

      // Atualizar informações do arco atual com base no modelo
      const modeloAtual = this.modelosArcos[this.modeloArcoAtual]
      if (modeloAtual) {
        const novaQuantidade = modeloAtual.quantidadePendulos || 3
        const sensoresPorPendulo = modeloAtual.sensoresPorPendulo || {}

        // Atualizar ou criar informações do arco
        if (!analiseAtualizada.arcos[this.arcoAtual]) {
          analiseAtualizada.arcos[this.arcoAtual] = {
            numero: this.arcoAtual,
            totalPendulos: 0,
            totalSensores: 0,
            pendulos: []
          }
        }

        // Atualizar pendulos do arco
        const novosPendulos = []
        let totalSensores = 0

        for (let i = 1; i <= novaQuantidade; i++) {
          const numSensores = sensoresPorPendulo[i] || 1
          novosPendulos.push({
            numero: i,
            totalSensores: numSensores
          })
          totalSensores += numSensores
        }

        analiseAtualizada.arcos[this.arcoAtual].pendulos = novosPendulos
        analiseAtualizada.arcos[this.arcoAtual].totalPendulos = novaQuantidade
        analiseAtualizada.arcos[this.arcoAtual].totalSensores = totalSensores

        // Atualizar análise global
        this.analiseArcos = analiseAtualizada

        // Regenerar layout específico para este arco FORÇANDO nova criação
        const layoutArco = LayoutManager.gerarLayoutParaArco(analiseAtualizada.arcos[this.arcoAtual])
        if (!this.layoutsAutomaticos) {
          this.layoutsAutomaticos = {}
        }

        // Forçar nova criação do layout com as dimensões corretas
        delete this.layoutsAutomaticos[`arco_${this.arcoAtual}`]
        this.layoutsAutomaticos[`arco_${this.arcoAtual}`] = layoutArco

        // Recalcular dimensões do SVG se necessário
        this.calcularDimensoesSVG()
      }
    },

    // Métodos para controle de sensores por pêndulo
    onSensoresCaboChange(data) {

      if (!this.modeloArcoAtual || !this.modelosArcos[this.modeloArcoAtual]) {
        return
      }

      const { numeroPendulo, quantidade } = data

      // Garantir que existe a estrutura de sensores por pêndulo
      if (!this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo) {
        this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo = {}
      }

      // Atualizar quantidade de sensores para o pêndulo específico
      this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo[numeroPendulo] = quantidade

      // Regenerar dados exemplares com nova configuração
      this.criarDadosExemplaresComNovaQuantidadeSensores()

      // Regenerar layouts automáticos
      this.regenerarLayoutsAutomaticos()

      // Salvar modelo automaticamente
      this.salvarModelosAutomatico()

      // Atualizar visualização
      this.updateSVG()
    },

    onAplicarSensoresUniformes(dados) {

      if (!this.modeloArcoAtual) {
        this.mostrarToast('Selecione um modelo primeiro!', 'warning')
        return
      }

      const { quantidade, totalPendulos } = dados
      const numero = parseInt(quantidade)

      if (isNaN(numero) || numero < 1 || numero > 32) {
        this.mostrarToast('Número inválido! Digite um valor entre 1 e 32.', 'error')
        return
      }

      // Aplicar mesmo número de sensores para todos os pêndulos
      const sensoresUniformes = {}
      for (let i = 1; i <= totalPendulos; i++) {
        sensoresUniformes[i] = numero
      }

      // Garantir que a atualização seja aplicada corretamente
      this.modelosArcos[this.modeloArcoAtual].sensoresPorPendulo = sensoresUniformes

      // Forçar atualização dos dados exemplares com a nova configuração de sensores
      this.atualizarDadosExemplaresComNovaSensorConfig(numero, totalPendulos)

      // Regenerar layouts
      this.regenerarLayoutsAutomaticos()

      // Salvar e atualizar
      this.salvarModelosAutomatico()
      this.updateSVG()

      this.mostrarToast(`Aplicado ${numero} sensores uniformemente para todos os ${totalPendulos} pêndulos!`, 'success')
    },

    // Métodos para controle de sensores por pêndulo (compatibilidade)
    // Métodos de controle de sensores não utilizados removidos

    // Métodos de controle individual de sensores removidos - não utilizados

    // Método específico para atualizar dados exemplares com nova configuração de sensores
    atualizarDadosExemplaresComNovaSensorConfig(numeroSensores, quantidadePendulos) {

      if (!this.dadosPortal.arcos[this.arcoAtual]) {
        this.dadosPortal.arcos[this.arcoAtual] = {}
      }

      // Limpar dados antigos
      this.dadosPortal.arcos[this.arcoAtual] = {}

      // Criar novos dados baseados na quantidade configurada
      for (let p = 1; p <= quantidadePendulos; p++) {
        this.dadosPortal.arcos[this.arcoAtual][p] = {}

        for (let s = 1; s <= numeroSensores; s++) {
          // Gerar temperatura aleatória entre 10°C e 40°C
          const temperaturaAleatoria = Math.random() * 30 + 10 // 10 + (0 a 30)
          const temp = Math.round(temperaturaAleatoria * 10) / 10 // Arredondar para 1 casa decimal

          this.dadosPortal.arcos[this.arcoAtual][p][s] = [temp, false, false, false, true]
        }
      }

      // Reanalisar estrutura
      const novaAnalise = this.analisarEstruturaArcos(this.dadosPortal)
      this.analiseArcos = novaAnalise

      // Regenerar layouts com a nova estrutura
      const layoutsAtualizados = LayoutManager.gerarLayoutAutomatico(novaAnalise)
      this.layoutsAutomaticos = layoutsAtualizados

      // Converter dados para renderização
      const dadosConvertidos = this.converterDadosParaRenderizacao(this.dadosPortal, this.arcoAtual)
      this.dados = dadosConvertidos

    },

    onPosicaoSensorChange() {
      // Atualizar preview em tempo real quando posição de sensor mudar
      this.updateSVG()
    },

    // Métodos para carregar configuração do banco
    carregarConfiguracaoDoBanco(configuracaoCarregada) {

      const { nome, dados, tipo, tipoConfiguracao } = configuracaoCarregada

      if (tipo === 'S') {
        // Carregar configuração de Silo
        this.tipoAtivo = 'silo'
        
        // 🔧 CORREÇÃO CRÍTICA: Normalizar e preservar sensoresPorPendulo do banco
        let dadosParaNormalizar = dados.configuracao || dados
        
        // Extrair sensores do nível raiz OU de pendulos (dados duplicados no banco)
        const sensoresCarregados = dadosParaNormalizar.sensoresPorPendulo || 
                                   dadosParaNormalizar.pendulos?.sensoresPorPendulo || {}
        
        const quantidadeCarregada = dadosParaNormalizar.quantidadePendulos ?? 
                                   dadosParaNormalizar.pendulos?.quantidadePendulos ?? 
                                   (Object.keys(sensoresCarregados).length || 5)

        // Garantir que sensoresPorPendulo seja mapeado para o nível superior
        if (Object.keys(sensoresCarregados).length > 0) {
          dadosParaNormalizar = {
            ...dadosParaNormalizar,
            quantidadePendulos: quantidadeCarregada,
            sensoresPorPendulo: { ...sensoresCarregados }
          }
        }
        
        this.configSilo = this.mergeSiloConfigComDefaults(dadosParaNormalizar)
        
        // Verificação de integridade após carregamento
        
        this.mostrarToast(`Silo "${nome}" carregado do banco!`, 'success')
        this.updateSVG()
      } else if (tipo === 'A') {
        // Carregar configuração de Armazém
        this.tipoAtivo = 'armazem'

        // Verificar tipo de configuração
        // 🎯 USAR MÉTODO UNIFICADO: Sempre usar configuracaoService
        const configCarregada = { dados, nome }
        const resultado = configuracaoService.aplicarConfiguracaoCompleta(configCarregada, this.tipoAtivo)

        if (resultado.success) {
          this.aplicarConfiguracaoUnificada(resultado.dados, nome)
        } else {
          this.mostrarToast(`Erro ao processar configuração: ${resultado.message}`, 'error')
        }

        // Resetar estado de edição
        this.modeloArcoAtual = null
        this.limparVariaveisParaNovoModelo()

        // Inicializar posições dos cabos
        this.inicializarPosicoesCabos()

        // Atualizar preview
        this.updateSVG()

      }
    },

    // Métodos do Gerenciador de Configurações
    handleModeloSalvo(modelo) {
      // Este método é chamado quando um modelo é salvo através do Gerenciador de Modelos do Banco
      // A lógica para atualizar `modelosArcos` já deve estar sendo tratada dentro de GerenciadorModelosBanco
    },

    handleModelosSalvos(modelos) {
      // Poderia ser usado para atualizar o estado global se necessário
    },

    handleConfiguracaoSalva(dadosConfig) {
      // Lógica para salvar a configuração no localStorage ou API
      // A função `salvarConfiguracao` já faz isso, então aqui podemos apenas confirmar
      this.mostrarToast(`Configuração "${dadosConfig.nome}" salva!`, 'success');
    },

    handleConfiguracaoCarregada(dadosConfig) {
      // Aqui, vamos restaurar o estado da aplicação com base nos dados carregados

      if (!dadosConfig) return;

      // Restaurar Configurações Globais
      if (dadosConfig.configuracaoGlobal) {
        this.configArmazem = { ...dadosConfig.configuracaoGlobal };
      }

      // Restaurar Modelos de Arcos
      if (dadosConfig.sistemaModelos && dadosConfig.sistemaModelos.modelosDefinidos) {
        this.quantidadeModelosArcos = dadosConfig.sistemaModelos.quantidadeModelos || 1;
        const novosModelos = {};
        const novosSalvos = {};

        Object.keys(dadosConfig.sistemaModelos.modelosDefinidos).forEach(key => {
          const modeloSalvo = dadosConfig.sistemaModelos.modelosDefinidos[key];
          novosModelos[key] = {
            ...modeloSalvo,
            config: modeloSalvo.configuracao || {}, // Usar 'configuracao' da v4.0
            quantidadePendulos: modeloSalvo.quantidadePendulos || 3,
            sensoresPorPendulo: modeloSalvo.sensoresPorPendulo || {},
            posicoesCabos: modeloSalvo.posicoesCabos || {}
          };
          novosSalvos[key] = true; // Assumir que os modelos carregados estão salvos
        });

        this.modelosArcos = novosModelos;
        this.modelosSalvos = novosSalvos;
      }

      // Restaurar Layouts Automáticos
      if (dadosConfig.layoutsAutomaticos) {
        this.layoutsAutomaticos = dadosConfig.layoutsAutomaticos;
      }

      // Restaurar Dados Originais (se disponíveis)
      if (dadosConfig.dadosOriginais?.dadosPortal) {
        this.dadosPortal = dadosConfig.dadosOriginais.dadosPortal;
      }
      if (dadosConfig.dadosOriginais?.analiseArcos) {
        this.analiseArcos = dadosConfig.dadosOriginais.analiseArcos;
      }

      // Restaurar Dimensões SVG
      if (dadosConfig.dimensoesSVG) {
        this.larguraSVG = dadosConfig.dimensoesSVG.largura;
        this.alturaSVG = dadosConfig.dimensoesSVG.altura;
      }

      // Aplicar configuração inicial (geralmente do primeiro modelo)
      setTimeout(() => {
        const primeiroModelo = Object.values(this.modelosArcos)[0];
        if (primeiroModelo) {
          this.configArmazem = { ...primeiroModelo.config };
          this.inicializarPosicoesCabos(); // Re-inicializar cabos com base no modelo carregado
        }
        this.updateSVG(); // Atualizar visualização
      }, 100);

      this.mostrarToast(`Configuração "${dadosConfig.nome}" carregada!`, 'success');
    },

    handleConfiguracaoLegadoCarregada(dadosLegado) {
      // Para configurações legadas, apenas carregamos a configuração base,
      // e resetamos os modelos para o estado padrão.
      this.configArmazem = { ...dadosLegado.configuracao };
      this.resetarModelosParaPadrao();
      this.mostrarToast('Configuração Legado carregada. Modelos resetados para o padrão.', 'info');
    },

    // MÉTODOS PARA COMUNICAÇÃO COM COMPONENTE IMAGEM DE FUNDO
    onImagemFundoMudou(novaImagemData) {
      // Atualizar dados locais quando o componente filho emitir mudanças
      this.imagemFundoData = { ...novaImagemData }
      // Salvar também na storage por tipo
      this.imagensFundoPorTipo[this.tipoAtivo] = { ...novaImagemData }
    },

    onOpacidadeSvgMudou(novasOpacidades) {
      // Atualizar opacidades do SVG quando o componente filho emitir mudanças
      this.opacidadesSvg = { ...novasOpacidades }
    },

    // MÉTODOS PARA COMUNICAÇÃO COM COMPONENTE ARMAZEM SVG
    onDimensoesAtualizadas(novasDimensoes) {
      // Não interferir - deixar o ArmazemSvg gerenciar suas próprias dimensões
    },

    onDimensoesAplicadas(dimensoesAplicadas) {

      // Se as dimensões vieram do banco de dados, salvar na configuração
      if (dimensoesAplicadas.origem === 'banco_dados') {
        this.larguraSVG = dimensoesAplicadas.largura
        this.alturaSVG = dimensoesAplicadas.altura

        // Salvar na configuração atual se estiver editando um modelo
        if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
          this.modelosArcos[this.modeloArcoAtual].config.dimensoesSvgFundo = {
            largura: dimensoesAplicadas.largura,
            altura: dimensoesAplicadas.altura,
            baseadoEm: 'banco_dados'
          }
          this.salvarModelosAutomatico()
        }
      }
    },

    // 🎯 NOVO: Handler para salvar dimensões calculadas no modelo
    onSalvarDimensoesModelo(dimensoesCalculadas) {

      // Atualizar dimensões locais
      this.larguraSVG = dimensoesCalculadas.largura
      this.alturaSVG = dimensoesCalculadas.altura

      // 🎯 CRÍTICO: Garantir que lb seja atualizado para refletir a largura
      if (dimensoesCalculadas.largura && dimensoesCalculadas.largura !== this.configArmazem.lb) {
        this.configArmazem.lb = dimensoesCalculadas.largura
      }

      // Salvar na configuração global
      this.configArmazem.dimensoesSvgFundo = {
        largura: dimensoesCalculadas.largura,
        altura: dimensoesCalculadas.altura,
        baseadoEm: dimensoesCalculadas.baseadoEm || 'calculo_otimizado',
        calculadoEm: dimensoesCalculadas.calculadoEm || new Date().toISOString()
      }

      // Se estiver editando um modelo específico, salvar também no modelo
      if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
        // 🎯 CRÍTICO: Atualizar TODAS as dimensões no modelo
        this.modelosArcos[this.modeloArcoAtual].config.lb = dimensoesCalculadas.largura
        this.modelosArcos[this.modeloArcoAtual].config.dimensoesSvgFundo = {
          largura: dimensoesCalculadas.largura,
          altura: dimensoesCalculadas.altura,
          baseadoEm: dimensoesCalculadas.baseadoEm || 'calculo_otimizado',
          calculadoEm: dimensoesCalculadas.calculadoEm || new Date().toISOString()
        }

        // Salvar modelo completo para persistir as dimensões
        this.salvarModeloAtualCompleto()
      }

      // Salvar automaticamente
      this.salvarModelosAutomatico()

    },

    // 🎯 NOVO: Handler para salvar posições manuais dos pêndulos e sensores
    onPosicoesAtualizadas(eventoPosicoesData) {

      const { tipoMovido, elementoMovido } = eventoPosicoesData

      if (tipoMovido === 'pendulo') {
        // Calcular offset da posição original para o pêndulo
        const numeroPendulo = elementoMovido
        const posicaoOriginal = this.calcularPosicaoOriginalPendulo(numeroPendulo)

        // Buscar posição atual no DOM
        const elementoPendulo = document.getElementById(`C${numeroPendulo}`)
        if (elementoPendulo) {
          const xAtual = parseFloat(elementoPendulo.getAttribute('x')) + (parseFloat(elementoPendulo.getAttribute('width')) || 16) / 2
          const yAtual = parseFloat(elementoPendulo.getAttribute('y'))

          const offsetX = xAtual - posicaoOriginal.x
          const offsetY = yAtual - posicaoOriginal.y

          // Salvar nas posições manuais
          if (!this.posicoesManualPendulos[numeroPendulo]) {
            this.posicoesManualPendulos[numeroPendulo] = { x: 0, y: 0 }
          }
          this.posicoesManualPendulos[numeroPendulo].x = offsetX
          this.posicoesManualPendulos[numeroPendulo].y = offsetY

        }
      }
      else if (tipoMovido === 'sensor') {
        // Calcular offset da posição original para o sensor
        const { pendulo: numeroPendulo, sensor: numeroSensor } = elementoMovido
        const chaveManualSensor = `${numeroPendulo}-${numeroSensor}`

        const posicaoOriginal = this.calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor)

        // Buscar posição atual no DOM
        const elementoSensor = document.getElementById(`C${numeroPendulo}S${numeroSensor}`)
        if (elementoSensor) {
          const xAtual = parseFloat(elementoSensor.getAttribute('x')) + (parseFloat(elementoSensor.getAttribute('width')) || 16) / 2
          const yAtual = parseFloat(elementoSensor.getAttribute('y'))

          const offsetX = xAtual - posicaoOriginal.x
          const offsetY = yAtual - posicaoOriginal.y

          // Salvar nas posições manuais dos sensores
          if (!this.posicoesManualSensores[chaveManualSensor]) {
            this.posicoesManualSensores[chaveManualSensor] = { x: 0, y: 0 }
          }
          this.posicoesManualSensores[chaveManualSensor].x = offsetX
          this.posicoesManualSensores[chaveManualSensor].y = offsetY

        }
      }

      // Salvar posições no modelo atual se estiver editando
      if (this.modeloArcoAtual) {
        this.salvarPosicoesNoModelo()
      }
    },

    // MÉTODOS PARA DRAG AND DROP
    adicionarEventListeners() {
      if (this.tipoAtivo !== 'armazem') return

      this.$nextTick(() => {
        // Aguardar renderização completa do SVG
        setTimeout(() => {
          // Verificar se o SVG existe antes de adicionar listeners
          const svgContainer = document.querySelector('.svg-container-responsive svg')
          if (!svgContainer) {
            return
          }

          // Remover listeners existentes primeiro para evitar duplicação
          this.removerEventListeners()

          // Adicionar listeners para elementos dos pêndulos
          this.adicionarListenersPendulos()

          // Adicionar listeners para elementos dos sensores
          this.adicionarListenersSensores()

          // Adicionar listeners globais se ainda não existirem
          this.garantirListenersGlobais()

        }, 100) // Aumentar delay para garantir renderização
      })
    },

    // 🔧 MÉTODO ROBUSTO: Reestabelecimento seguro e idempotente de event listeners
    reestabelecerEventListenersSeguro(retryCount = 0) {
      if (this.tipoAtivo !== 'armazem') return

      const MAX_RETRIES = 3

      // Aguardar renderização completa
      this.$nextTick(() => {
        setTimeout(() => {
          // Verificar se SVG existe e tem elementos
          const svgContainer = document.querySelector('.svg-container-responsive svg')
          const elementosSVG = svgContainer ? svgContainer.querySelectorAll('[id^="C"]') : []

          if (!svgContainer || elementosSVG.length === 0) {
            if (retryCount < MAX_RETRIES) {
              setTimeout(() => this.reestabelecerEventListenersSeguro(retryCount + 1), 100)
            } else {
            }
            return
          }

          // Remover listeners existentes
          this.removerEventListeners()

          // Adicionar novos listeners
          this.adicionarEventListeners()

        }, 150) // Delay maior para garantir renderização
      })
    },

    // 🔧 Método para garantir listeners globais sem duplicação (específico da instância)
    garantirListenersGlobais() {
      // Remover primeiro se existir (específico desta instância)
      if (this._globalsAdded) {
        document.removeEventListener('mousemove', this.continuarDrag)
        document.removeEventListener('mouseup', this.finalizarDrag)
        this._globalsAdded = false
      }

      // Adicionar novamente
      document.addEventListener('mousemove', this.continuarDrag)
      document.addEventListener('mouseup', this.finalizarDrag)
      this._globalsAdded = true
    },

    adicionarListenersPendulos() {
      // Buscar elementos de pêndulos no SVG
      const svgContainer = document.querySelector('.svg-container-responsive svg')
      if (!svgContainer) return

      // Procurar por elementos que começam com 'C' seguido de número (sem 'S' para sensor)
      const elementosPendulos = svgContainer.querySelectorAll('[id^="C"]:not([id*="S"])')
      

      elementosPendulos.forEach(elemento => {
        const id = elemento.id

        // Verificar se é elemento de pêndulo (C1, C2, C3...)
        const matchPendulo = id.match(/^C(\d+)$/)
        if (matchPendulo) {
          const numeroPendulo = parseInt(matchPendulo[1])

          // Configurar elemento como arrastável
          elemento.style.cursor = 'grab'
          elemento.style.userSelect = 'none'
          elemento.setAttribute('title', `Clique e arraste para mover o pêndulo ${numeroPendulo}`)
          
          // Adicionar event listener
          elemento.addEventListener('mousedown', (e) => this.iniciarDragPendulo(e, numeroPendulo))
          
          // Adicionar classe para identificação
          elemento.classList.add('pendulo-draggable')
          
        }
      })

      // Também adicionar listeners aos textos dos pêndulos
      const textosPendulos = svgContainer.querySelectorAll('[id^="TC"]:not([id*="S"])')
      textosPendulos.forEach(elemento => {
        const id = elemento.id
        const matchTexto = id.match(/^TC(\d+)$/)
        if (matchTexto) {
          const numeroPendulo = parseInt(matchTexto[1])
          
          elemento.style.cursor = 'grab'
          elemento.style.userSelect = 'none'
          elemento.addEventListener('mousedown', (e) => this.iniciarDragPendulo(e, numeroPendulo))
          elemento.classList.add('pendulo-draggable')
        }
      })
    },

    adicionarListenersSensores() {
      // Buscar elementos de sensores no SVG
      const svgContainer = document.querySelector('.svg-container-responsive svg')
      if (!svgContainer) return

      // Procurar por elementos que contêm 'S' (sensores)
      const elementosSensores = svgContainer.querySelectorAll('[id*="S"]')
      

      elementosSensores.forEach(elemento => {
        const id = elemento.id
        let numeroPendulo, numeroSensor

        // Identificar diferentes tipos de elementos de sensor
        let matchSensor = id.match(/^C(\d+)S(\d+)$/)  // C1S2 (fundo do sensor)
        if (!matchSensor) {
          matchSensor = id.match(/^TC(\d+)S(\d+)$/)   // TC1S2 (texto valor do sensor)
        }
        if (!matchSensor) {
          matchSensor = id.match(/^TIND(\d+)S(\d+)$/) // TIND1S2 (texto nome do sensor)
        }

        if (matchSensor) {
          numeroPendulo = parseInt(matchSensor[1])
          numeroSensor = parseInt(matchSensor[2])

          // Configurar elemento como arrastável
          elemento.style.cursor = 'grab'
          elemento.style.userSelect = 'none'
          elemento.setAttribute('title', `Clique e arraste para mover o sensor ${numeroSensor} do pêndulo ${numeroPendulo}`)
          
          // Adicionar event listener
          elemento.addEventListener('mousedown', (e) => this.iniciarDragSensor(e, numeroPendulo, numeroSensor))
          
          // Adicionar classe para identificação
          elemento.classList.add('sensor-draggable')
          
        }
      })
    },

    removerEventListeners() {
      try {
        // Remover listeners globais específicos desta instância
        if (this._globalsAdded) {
          document.removeEventListener('mousemove', this.continuarDrag)
          document.removeEventListener('mouseup', this.finalizarDrag)
          this._globalsAdded = false
        }

        // Limpar flag global
        delete document.dragListenersAdded

        // Remover listeners de elementos específicos através de clonagem
        const elementosArrastaveis = document.querySelectorAll('.pendulo-draggable, .sensor-draggable')
        elementosArrastaveis.forEach(elemento => {
          // Clonar elemento para remover todos os listeners
          const novoElemento = elemento.cloneNode(true)
          if (elemento.parentNode) {
            elemento.parentNode.replaceChild(novoElemento, elemento)
          }
        })

        // Limpar classes de elementos que ainda possam existir
        const elementosComClasse = document.querySelectorAll('.pendulo-draggable, .sensor-draggable')
        elementosComClasse.forEach(elemento => {
          elemento.classList.remove('pendulo-draggable', 'sensor-draggable')
          elemento.style.cursor = ''
          elemento.style.userSelect = ''
        })

        // Resetar estado de drag
        this.isDragging = false
        this.dragElement = null
        this.dragType = null

      } catch (error) {
      }
    },

    iniciarDragPendulo(event, numeroPendulo) {
      event.preventDefault()
      event.stopPropagation()

      this.isDragging = true
      this.dragType = 'pendulo'
      this.dragElement = numeroPendulo

      // Calcular offset do mouse em relação ao SVG
      const svg = event.target.closest('svg')
      const svgRect = svg.getBoundingClientRect()
      const mouseX = event.clientX - svgRect.left
      const mouseY = event.clientY - svgRect.top

      // Converter para coordenadas do SVG
      const svgPoint = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)

      // Encontrar elemento principal do pêndulo (rect) para pegar posição
      const elementoPrincipal = document.getElementById(`C${numeroPendulo}`)
      if (elementoPrincipal) {
        const penduloX = parseFloat(elementoPrincipal.getAttribute('x')) || 0
        const penduloY = parseFloat(elementoPrincipal.getAttribute('y')) || 0

        this.dragOffset = {
          x: svgPoint.x - (penduloX + (parseFloat(elementoPrincipal.getAttribute('width')) || 0) / 2),
          y: svgPoint.y - (penduloY + (parseFloat(elementoPrincipal.getAttribute('height')) || 0) / 2)
        }
      } else {
        this.dragOffset = { x: 0, y: 0 }
      }

      // Alterar cursor de todos os elementos do pêndulo
      const elementosPendulo = document.querySelectorAll(`[id^="C${numeroPendulo}"], [id^="TC${numeroPendulo}"]`)
      elementosPendulo.forEach(el => {
        if (!el.id.includes('S')) { // Apenas elementos do pêndulo, não sensores
          el.style.cursor = 'grabbing'
        }
      })
    },

    iniciarDragSensor(event, numeroPendulo, numeroSensor) {
      event.preventDefault()
      event.stopPropagation()

      this.isDragging = true
      this.dragType = 'sensor'
      this.dragElement = { pendulo: numeroPendulo, sensor: numeroSensor }

      // Calcular offset do mouse em relação ao SVG
      const svg = event.target.closest('svg')
      const svgRect = svg.getBoundingClientRect()
      const mouseX = event.clientX - svgRect.left
      const mouseY = event.clientY - svgRect.top

      // Converter para coordenadas do SVG
      const svgPoint = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)

      // Encontrar elemento principal do sensor (rect) para pegar posição
      const elementoPrincipal = document.getElementById(`C${numeroPendulo}S${numeroSensor}`)
      if (elementoPrincipal) {
        const sensorX = parseFloat(elementoPrincipal.getAttribute('x')) || 0
        const sensorY = parseFloat(elementoPrincipal.getAttribute('y')) || 0

        this.dragOffset = {
          x: svgPoint.x - (sensorX + (parseFloat(elementoPrincipal.getAttribute('width')) || 0) / 2),
          y: svgPoint.y - (sensorY + (parseFloat(elementoPrincipal.getAttribute('height')) || 0) / 2)
        }
      } else {
        this.dragOffset = { x: 0, y: 0 }
      }

      // Alterar cursor de todos os elementos do sensor
      const elementosSensor = document.querySelectorAll(`[id*="C${numeroPendulo}S${numeroSensor}"], [id*="TC${numeroPendulo}S${numeroSensor}"], [id*="TIND${numeroPendulo}S${numeroSensor}"]`)
      elementosSensor.forEach(el => {
        el.style.cursor = 'grabbing'
      })
    },

    continuarDrag(event) {
      if (!this.isDragging) return

      event.preventDefault()

      // Encontrar o SVG correto dentro do container do preview
      const previewContainer = document.querySelector('.svg-container-responsive')
      if (!previewContainer) return

      const svg = previewContainer.querySelector('svg')
      if (!svg) return

      const svgRect = svg.getBoundingClientRect()
      const mouseX = event.clientX - svgRect.left
      const mouseY = event.clientY - svgRect.top

      // Converter para coordenadas do SVG
      const svgPoint = this.converterParaCoordenadaSVG(svg, mouseX, mouseY)

      // Calcular nova posição
      const novaX = svgPoint.x - this.dragOffset.x
      const novaY = svgPoint.y - this.dragOffset.y

      if (this.dragType === 'pendulo') {
        this.moverPenduloCompletoSemUpdate(this.dragElement, novaX, novaY)
      } else if (this.dragType === 'sensor') {
        this.moverSensorIndividualSemUpdate(this.dragElement.pendulo, this.dragElement.sensor, novaX, novaY)
      }
    },

    finalizarDrag(event) {
      if (!this.isDragging) return

      const elementoMovido = this.dragElement
      const tipoMovido = this.dragType

      this.isDragging = false
      this.dragType = null
      this.dragElement = null
      this.dragOffset = { x: 0, y: 0 }

      // Restaurar cursor para todos os elementos arrastáveis
      const elementosArrastaveis = document.querySelectorAll('.pendulo-draggable, .sensor-draggable')
      elementosArrastaveis.forEach(el => {
        el.style.cursor = 'grab'
      })

      // REMOVIDO: updateSVG() aqui - estava causando o bug de voltar ao padrão
      // As posições já foram aplicadas diretamente no DOM durante o movimento

      // IMPORTANTE: Readicionar event listeners após finalizar drag
      this.$nextTick(() => {
        setTimeout(() => {
          this.adicionarEventListeners()
        }, 100)
      })

      // Debounced save - salvar apenas após parar de mover por um tempo
      this.debouncedSalvarPosicoes(elementoMovido, tipoMovido)
    },

    // Implementar debounce para salvamento
    debouncedSalvarPosicoes(elementoMovido, tipoMovido) {
      // Cancelar salvamento anterior se existir
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
      }

      // Agendar novo salvamento após 300ms de inatividade
      this.saveTimeout = setTimeout(() => {

        // Salvar posições no modelo atual se estiver editando
        if (this.modeloArcoAtual) {
          this.salvarPosicoesNoModelo()
        }

        // IMPORTANTE: Não chamar updateSVG() aqui para preservar as posições
        // As posições já foram aplicadas no DOM e salvas nos dados

        this.saveTimeout = null
      }, 300)
    },

    // 🎯 FUNÇÃO PRINCIPAL: Converter coordenadas do mouse para coordenadas SVG puras
    // Esta é a fonte única de verdade para todas as conversões de coordenadas
    converterParaCoordenadaSVG(svg, mouseX, mouseY) {
      const viewBox = svg.getAttribute('viewBox')
      if (!viewBox) {
        return { x: mouseX, y: mouseY }
      }

      const [minX, minY, width, height] = viewBox.split(' ').map(Number)
      const svgRect = svg.getBoundingClientRect()

      const scaleX = width / svgRect.width
      const scaleY = height / svgRect.height

      // Conversão matemática direta para coordenadas SVG
      const coordenadaSvg = {
        x: minX + mouseX * scaleX,
        y: minY + mouseY * scaleY
      }

      return coordenadaSvg
    },

    moverPenduloCompleto(numeroPendulo, novaX, novaY) {
      this.moverPenduloCompletoSemUpdate(numeroPendulo, novaX, novaY)
      // Não chamar updateSVG() aqui - as posições já foram aplicadas no DOM
      // updateSVG() será chamado apenas quando necessário (ex: reset, mudança de configuração)
    },

    moverPenduloCompletoSemUpdate(numeroPendulo, novaX, novaY) {
      // 🎯 GARANTIR: Salvar posição manual do pêndulo em coordenadas SVG puras
      if (!this.posicoesManualPendulos[numeroPendulo]) {
        this.posicoesManualPendulos[numeroPendulo] = { x: 0, y: 0 }
      }

      // 🎯 CALCULAR: Diferença da posição original (SEMPRE em coordenadas SVG)
      const posicaoOriginal = this.calcularPosicaoOriginalPendulo(numeroPendulo)
      const offsetX = novaX - posicaoOriginal.x
      const offsetY = novaY - posicaoOriginal.y
      
      // 🎯 SALVAR: Offsets em coordenadas SVG puras (sem conversões adicionais)
      this.posicoesManualPendulos[numeroPendulo].x = offsetX
      this.posicoesManualPendulos[numeroPendulo].y = offsetY

      // Atualizar posições de todos os sensores deste pêndulo junto
      const sensoresCount = this.obterQuantidadeSensoresPendulo(numeroPendulo)
      for (let s = 1; s <= sensoresCount; s++) {
        const chaveSensor = `${numeroPendulo}-${s}`
        if (!this.posicoesManualSensores[chaveSensor]) {
          this.posicoesManualSensores[chaveSensor] = { x: 0, y: 0 }
        }
        // Mover sensores junto com o pêndulo
        this.posicoesManualSensores[chaveSensor].x = this.posicoesManualPendulos[numeroPendulo].x
        this.posicoesManualSensores[chaveSensor].y = this.posicoesManualPendulos[numeroPendulo].y
      }

      // Atualizar elementos DOM diretamente para feedback visual imediato
      this.atualizarElementosDOMDiretamente(numeroPendulo)
    },

    moverSensorIndividual(numeroPendulo, numeroSensor, novaX, novaY) {
      this.moverSensorIndividualSemUpdate(numeroPendulo, numeroSensor, novaX, novaY)
      // Não chamar updateSVG() aqui - as posições já foram aplicadas no DOM
      // updateSVG() será chamado apenas quando necessário (ex: reset, mudança de configuração)
    },

    moverSensorIndividualSemUpdate(numeroPendulo, numeroSensor, novaX, novaY) {
      const chaveSensor = `${numeroPendulo}-${numeroSensor}`

      // 🎯 GARANTIR: Salvar posição manual do sensor em coordenadas SVG puras
      if (!this.posicoesManualSensores[chaveSensor]) {
        this.posicoesManualSensores[chaveSensor] = { x: 0, y: 0 }
      }

      // 🎯 CALCULAR: Diferença da posição original (SEMPRE em coordenadas SVG)
      const posicaoOriginal = this.calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor)
      const offsetX = novaX - posicaoOriginal.x
      const offsetY = novaY - posicaoOriginal.y
      
      // 🎯 SALVAR: Offsets em coordenadas SVG puras (sem conversões adicionais)
      this.posicoesManualSensores[chaveSensor].x = offsetX
      this.posicoesManualSensores[chaveSensor].y = offsetY
      this.posicoesManualSensores[chaveSensor].timestampAlteracao = Date.now()

      // Atualizar elemento DOM diretamente para feedback visual imediato
      this.atualizarSensorDOMDiretamente(numeroPendulo, numeroSensor)
    },

    atualizarElementosDOMDiretamente(numeroPendulo) {
      // Atualizar posição do pêndulo diretamente no DOM para feedback visual
      const posicaoOriginal = this.calcularPosicaoOriginalPendulo(numeroPendulo)
      const offsetX = this.posicoesManualPendulos[numeroPendulo]?.x || 0
      const offsetY = this.posicoesManualPendulos[numeroPendulo]?.y || 0

      const novaX = posicaoOriginal.x + offsetX
      const novaY = posicaoOriginal.y + offsetY

      // Encontrar índice do pêndulo (começa em 1, mas DOM usa índice baseado em 0)
      const indicePendulo = numeroPendulo
      const escala_sensores = (this.configPreviewAplicada || this.configArmazem).escala_sensores || 16

      // Atualizar pêndulo principal
      const elementoPendulo = document.getElementById(`C${indicePendulo}`)
      const textoElementoPendulo = document.getElementById(`TC${indicePendulo}`)

      if (elementoPendulo) {
        elementoPendulo.setAttribute('x', novaX - escala_sensores / 2)
        elementoPendulo.setAttribute('y', novaY)
      }
      if (textoElementoPendulo) {
        textoElementoPendulo.setAttribute('x', novaX)
        textoElementoPendulo.setAttribute('y', novaY + escala_sensores / 4)
      }

      // Atualizar sensores deste pêndulo
      const sensoresCount = this.obterQuantidadeSensoresPendulo(numeroPendulo)
      for (let s = 1; s <= sensoresCount; s++) {
        this.atualizarSensorDOMDiretamente(numeroPendulo, s)
      }
    },

    atualizarSensorDOMDiretamente(numeroPendulo, numeroSensor) {
      const posicaoOriginalSensor = this.calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor)
      const chaveSensor = `${numeroPendulo}-${numeroSensor}`
      const offsetX = this.posicoesManualSensores[chaveSensor]?.x || 0
      const offsetY = this.posicoesManualSensores[chaveSensor]?.y || 0

      const novaX = posicaoOriginalSensor.x + offsetX
      const novaY = posicaoOriginalSensor.y + offsetY

      const indicePendulo = numeroPendulo
      const escala_sensores = (this.configPreviewAplicada || this.configArmazem).escala_sensores || 16

      // Atualizar elementos do sensor
      const elementoSensor = document.getElementById(`C${indicePendulo}S${numeroSensor}`)
      const textoSensor = document.getElementById(`TC${indicePendulo}S${numeroSensor}`)
      const nomeSensor = document.getElementById(`TIND${indicePendulo}S${numeroSensor}`)

      if (elementoSensor) {
        elementoSensor.setAttribute('x', novaX - escala_sensores / 2)
        elementoSensor.setAttribute('y', novaY)
      }
      if (textoSensor) {
        textoSensor.setAttribute('x', novaX)
        textoSensor.setAttribute('y', novaY + escala_sensores / 4)
      }
      if (nomeSensor) {
        nomeSensor.setAttribute('x', novaX - escala_sensores / 2 - 2)
        nomeSensor.setAttribute('y', novaY + escala_sensores / 4)
      }
    },

    // 🎯 FUNÇÃO FUNDAMENTAL: Calcular posição original do pêndulo em coordenadas SVG puras
    // Esta função SEMPRE retorna coordenadas SVG (sem dependência de tela/browser)
    calcularPosicaoOriginalPendulo(numeroPendulo) {
      // 🎯 USAR LIMITES DO FUNDO (área cinza claro) - COORDENADAS SVG PURAS
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem

      // 🎯 CALCULAR LIMITES DO FUNDO com todos os parâmetros (incluindo deslocamentos)
      const limitesFundo = this.calcularLimitesFundoCompleto(config)

      // 🎯 Y: Posição baseada no pb (base do armazém) - COORDENADAS SVG
      const pb = config.pb || 185
      const posicao_horizontal = config.posicao_horizontal || 0
      const posicao_vertical = config.posicao_vertical || 0
      const yPendulo = pb + 15 + posicao_vertical

      // 🎯 X: Distribuir dentro da área útil do fundo (não na largura total do SVG)
      const arcoInfo = this.analiseArcos?.arcos[this.arcoAtual]
      if (!arcoInfo) return { x: limitesFundo.centro, y: yPendulo }

      const totalCabos = arcoInfo.pendulos.length

      let xCabo
      if (totalCabos === 1) {
        xCabo = limitesFundo.centro
      } else {
        const espacamento = limitesFundo.larguraUtil / (totalCabos - 1)
        xCabo = limitesFundo.xMinimo + ((numeroPendulo - 1) * espacamento)
      }

      // 🎯 APLICAR offset e validar posição final (TUDO em coordenadas SVG)
      const escala_sensores = config.escala_sensores || 16
      const xComOffset = xCabo + posicao_horizontal
      const xFinal = this.validarPosicaoDentroDoFundo(xComOffset, limitesFundo, escala_sensores)

      // 🎯 RETORNAR: Coordenadas SVG puras (mesmo sistema do ArmazemSvg.vue)
      return { x: xFinal, y: yPendulo }
    },

    // 🎯 FUNÇÃO COMPLETA: Calcular limites do fundo com deslocamentos
    calcularLimitesFundoCompleto(config) {
      const lb = config.lb || 350; // Largura do armazém
      const lf = config.lf || 250; // Largura do fundo
      const deslocamento_horizontal_fundo = config.deslocamento_horizontal_fundo || 0

      // Calcular limites do fundo considerando deslocamento horizontal
      const inicioFundo = (lb - lf) / 2 + deslocamento_horizontal_fundo;
      const fimFundo = inicioFundo + lf;

      // Margem de segurança para os sensores não ficarem na borda
      const margemSeguranca = 20;

      return {
        xMinimo: inicioFundo + margemSeguranca,
        xMaximo: fimFundo - margemSeguranca,
        larguraUtil: (fimFundo - inicioFundo) - (2 * margemSeguranca),
        centro: (inicioFundo + fimFundo) / 2  // Centro do fundo com deslocamento
      };
    },

    // 🎯 FUNÇÃO AUXILIAR: Validar posição considerando escala do sensor
    validarPosicaoDentroDoFundo(posicao, limitesFundo, escala_sensores = 16) {
      const metadeEscala = escala_sensores / 2;

      // Garantir que o sensor inteiro (incluindo sua largura) fique dentro do fundo
      const xMinimo = limitesFundo.xMinimo + metadeEscala;
      const xMaximo = limitesFundo.xMaximo - metadeEscala;

      // Ajustar posição se estiver fora dos limites
      if (posicao < xMinimo) {
        return xMinimo;
      }

      if (posicao > xMaximo) {
        return xMaximo;
      }

      return posicao;
    },

    // 🎯 FUNÇÃO FUNDAMENTAL: Calcular posição original do sensor em coordenadas SVG puras
    // Esta função SEMPRE retorna coordenadas SVG (sem dependência de tela/browser)
    calcularPosicaoOriginalSensor(numeroPendulo, numeroSensor) {
      // 🎯 USAR posição do pêndulo como base (já em coordenadas SVG)
      const posicaoPendulo = this.calcularPosicaoOriginalPendulo(numeroPendulo)
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      
      // 🎯 PARÂMETROS de espaçamento em coordenadas SVG
      const dist_y_sensores = config.dist_y_sensores || 12
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      // 🎯 CALCULAR Y do sensor baseado na posição do pêndulo (coordenadas SVG)
      const ySensor = posicaoPendulo.y - dist_y_sensores * numeroSensor - 25 - afastamento_vertical_pendulo

      // 🎯 RETORNAR: Coordenadas SVG puras (mesmo sistema do ArmazemSvg.vue)
      return { x: posicaoPendulo.x, y: ySensor }
    },

    obterQuantidadeSensoresPendulo(numeroPendulo) {
      const modeloAtual = this.determinarModeloParaArco(this.arcoAtual)
      if (modeloAtual?.sensoresPorPendulo) {
        return modeloAtual.sensoresPorPendulo[numeroPendulo] || 1
      }

      // Fallback: tentar obter dos dados atuais
      if (this.dados?.leitura?.[numeroPendulo]) {
        return Object.keys(this.dados.leitura[numeroPendulo]).length
      }

      return 1
    },

    // 🎯 FUNÇÃO CRÍTICA: Salvar posições de drag-and-drop em coordenadas SVG puras
    // Todas as posições salvas devem ser offsets SVG da posição original
    salvarPosicoesNoModelo() {
      if (!this.modeloArcoAtual) {
        return
      }

      // 🎯 GARANTIR estruturas para posições manuais SVG
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = {}
      }
      if (!this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = {}
      }

      // 🎯 SALVAR: Copiar offsets SVG calculados (já estão em coordenadas SVG puras)
      this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = { ...this.posicoesManualPendulos }
      this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = { ...this.posicoesManualSensores }

      // 1. Salvar no preview local (estado atual)
      this.salvarNoPreviewLocal()

      // 2. Salvar no localStorage
      this.salvarModelosAutomatico()

      // 3. Salvar no banco de dados
      this.salvarModeloAtualCompleto()
    },

    // 🎯 FUNÇÃO DE SALVAMENTO: Salvar posições SVG no preview local
    // As posições já estão como offsets SVG puros da posição original
    salvarNoPreviewLocal() {
      // 🎯 ESTADO SVG: Capturar estado atual com coordenadas SVG puras
      const estadoAtual = {
        posicoesManualPendulos: { ...this.posicoesManualPendulos },
        posicoesManualSensores: { ...this.posicoesManualSensores },
        modeloArcoAtual: this.modeloArcoAtual,
        timestamp: Date.now(),
        coordenadasTipo: 'SVG_PURAS' // Indicador de que são coordenadas SVG
      }

      // Salvar temporariamente no localStorage para persistir entre recarregamentos
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('posicoesManualTemp', JSON.stringify(estadoAtual))
        } catch (error) {
        }
      }
    },

    resetarPosicoesManual() {
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      if (this.modeloArcoAtual) {
        this.modelosArcos[this.modeloArcoAtual].posicoesManualPendulos = {}
        this.modelosArcos[this.modeloArcoAtual].posicoesManualSensores = {}
        this.salvarModelosAutomatico()
      }

      // Limpar localStorage temporário
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('posicoesManualTemp')
      }

      // Regenerar SVG para aplicar o reset
      this.updateSVG()
      this.mostrarToast('Posições manuais resetadas!', 'success')
    },

    // NOVO MÉTODO: Limpeza automática apenas na inicialização
    limparPosicoesInicializacao() {

      // Limpar posições manuais de drag and drop
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}

      // Limpar localStorage de posições temporárias
      if (typeof localStorage !== 'undefined') {
        try {
          // Remover apenas dados de posições temporárias - preservar outros dados importantes
          localStorage.removeItem('posicoesManualTemp')

          // Limpar posições salvas nos modelos (apenas para inicialização limpa)
          Object.keys(this.modelosArcos || {}).forEach(modeloKey => {
            if (this.modelosArcos[modeloKey]) {
              this.modelosArcos[modeloKey].posicoesManualPendulos = {}
              this.modelosArcos[modeloKey].posicoesManualSensores = {}
            }
          })

        } catch (error) {
        }
      }
    },

    carregarPosicoesTemporarias() {
      if (typeof localStorage === 'undefined') return

      try {
        const posicoesTemp = localStorage.getItem('posicoesManualTemp')
        if (posicoesTemp) {
          const estadoSalvo = JSON.parse(posicoesTemp)

          // Verificar se o estado é recente (menos de 1 hora)
          const agora = Date.now()
          const umaHora = 60 * 60 * 1000

          if (agora - estadoSalvo.timestamp < umaHora) {
            this.posicoesManualPendulos = { ...estadoSalvo.posicoesManualPendulos }
            this.posicoesManualSensores = { ...estadoSalvo.posicoesManualSensores }

          } else {
            // Limpar dados antigos
            localStorage.removeItem('posicoesManualTemp')
          }
        }
      } catch (error) {
        localStorage.removeItem('posicoesManualTemp')
      }
    },

    // 🎯 NOVO MÉTODO: Construir alturas dos sensores para o modelo
    construirAlturasSensores(posicoesPendulos, posicoesSensores, sensoresPorPenduloConfig) {
      const alturasSensores = {}
      const posicoesManualSensores = {}
      const config = this.configPreviewAplicada || this.configuracaoAplicada || this.configArmazem
      const dist_y_sensores = config.dist_y_sensores || 12
      const afastamento_vertical_pendulo = config.afastamento_vertical_pendulo || 0

      if (!sensoresPorPenduloConfig) {
        return { alturasSensores, posicoesManualSensores }
      }

      // Iterar sobre cada pêndulo configurado
      Object.keys(sensoresPorPenduloConfig).forEach(penduloNum => {
        const numSensores = sensoresPorPenduloConfig[penduloNum] || 1
        const offsetPendulo = posicoesPendulos[penduloNum] || { x: 0, y: 0 }
        const offsetPenduloY = offsetPendulo.y || 0
        const offsetPenduloX = offsetPendulo.x || 0

        // Calcular altura de cada sensor dentro do pêndulo
        for (let s = 1; s <= numSensores; s++) {
          const chaveSensor = `${penduloNum}-${s}`
          const offsetSensor = posicoesSensores[chaveSensor] || { x: 0, y: 0 }

          // Calcular a altura vertical relativa ao topo do pêndulo
          const alturaSensor = (offsetPenduloY + offsetSensor.y) - (dist_y_sensores * s) - 30 - afastamento_vertical_pendulo

          // Salvar altura do sensor
          alturasSensores[chaveSensor] = {
            altura: alturaSensor,
            posicaoX: offsetPenduloX + offsetSensor.x,
            posicaoY: offsetPenduloY + offsetSensor.y,
            pendulo: parseInt(penduloNum),
            sensor: s,
            timestampAlteracao: Date.now()
          }

          // CRÍTICO: Salvar posições manuais dos sensores no formato correto
          posicoesManualSensores[chaveSensor] = {
            x: offsetSensor.x,
            y: offsetSensor.y,
            pendulo: parseInt(penduloNum),
            sensor: s,
            timestampAlteracao: Date.now()
          }
        }
      })

      return { alturasSensores, posicoesManualSensores }
    },

    // ✅ MÉTODO AUXILIAR: Limpar estados específicos de drag-and-drop do Armazém
    limparEstadosDragAndDrop() {
      try {
        
        // 🔧 LIMPAR variáveis de drag específicas do Armazém
        this.dragAtivo = false
        this.elementoArrastando = null
        this.offsetDrag = { x: 0, y: 0 }
        
        // 🔧 LIMPAR referências DOM para evitar vazamentos de memória
        if (typeof document !== 'undefined') {
          // Remover TODOS os event listeners globais relacionados ao drag
          document.removeEventListener('mousemove', this.continuarDrag)
          document.removeEventListener('mouseup', this.finalizarDrag)
          document.removeEventListener('touchmove', this.continuarDrag)
          document.removeEventListener('touchend', this.finalizarDrag)
          
          // Remover event listeners específicos de elementos sensores/pêndulos
          const elementosSensor = document.querySelectorAll('[id^="TC"], [id^="pendulo_"], [id^="TIND"], [id^="NomeSensorSilo_"]')
          elementosSensor.forEach(elemento => {
            // Clonar e substituir elemento para remover TODOS os listeners
            const novoElemento = elemento.cloneNode(true)
            if (elemento.parentNode) {
              elemento.parentNode.replaceChild(novoElemento, elemento)
            }
          })
          
          // Remover flag global de drag listeners
          delete document.dragListenersAdded
        }
        
        // 🔧 LIMPAR classes CSS de drag de TODOS os elementos possíveis
        const seletoresLimpeza = [
          '.pendulo-draggable', 
          '.sensor-draggable', 
          '.elemento-arrastavel',
          '.dragging',
          '.drag-active'
        ]
        
        seletoresLimpeza.forEach(seletor => {
          const elementos = document.querySelectorAll(seletor)
          elementos.forEach(el => {
            el.classList.remove('pendulo-draggable', 'sensor-draggable', 'elemento-arrastavel', 'dragging', 'drag-active')
            // Remover também quaisquer transformações CSS que possam ter ficado
            el.style.transform = ''
            el.style.position = ''
            el.style.zIndex = ''
          })
        })
        
        // 🔧 LIMPAR timeouts relacionados ao drag and drop
        if (this.dragTimeout) {
          clearTimeout(this.dragTimeout)
          this.dragTimeout = null
        }
        
      } catch (error) {
      }
    },

    // ✅ MÉTODO AUXILIAR: Limpar variáveis de controle específicas
    limparVariaveisControleEspecificas() {
      // Limpar dados de posicionamento manual específicos do Armazém
      this.posicoesManualPendulos = {}
      this.posicoesManualSensores = {}
      
      // Limpar timeouts pendentes
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout)
        this.saveTimeout = null
      }
      
      // Limpar localStorage temporário específico do tipo
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('posicoesManualPendulos')
        localStorage.removeItem('posicoesManualSensores')
        localStorage.removeItem('modeladorEstadoTemp')
      }
      
      // Resetar variáveis de controle de interface específicas do Armazém
      this.caboSelecionadoPosicionamento = ''
      this.posicoesCabos = {}
      
      // Limpar seleções e estados temporários
      this.elementoSelecionado = null
      this.modoEdicao = false
    },

    // ✅ MÉTODO CRÍTICO: Reestabelecer event listeners de forma segura após mudança de modelo
    reestabelecerEventListenersSeguro() {
      // 🔧 CORREÇÃO DO BUG: Primeiro remover listeners existentes para evitar duplicação
      this.removerEventListeners()
      
      // 🎯 AGUARDAR que o DOM seja atualizado antes de adicionar novos listeners
      this.$nextTick(() => {
        setTimeout(() => {
          try {
            // 🔧 REESTABELECER EVENT LISTENERS apenas se estiver no modo armazém
            if (this.tipoAtivo === 'armazem') {
              this.configurarEventListenersArmazem()
            }
            
          } catch (error) {
          }
        }, 50) // Delay menor para melhor responsividade
      })
    },

    // ✅ MÉTODO AUXILIAR: Remover todos os event listeners existentes
    removerEventListeners() {
      try {
        // Remover event listeners globais de document
        if (typeof document !== 'undefined') {
          // Remover listeners de mouse para drag and drop
          document.removeEventListener('mousemove', this.continuarDrag)
          document.removeEventListener('mouseup', this.finalizarDrag)
          document.removeEventListener('touchmove', this.continuarDrag)
          document.removeEventListener('touchend', this.finalizarDrag)
          
          // Remover flag de listeners adicionados
          delete document.dragListenersAdded
        }
        
        // Limpar referências de elementos DOM
        this.elementoArrastando = null
        this.offsetDrag = { x: 0, y: 0 }
        this.dragAtivo = false
        
      } catch (error) {
      }
    },

    // ✅ MÉTODO AUXILIAR: Configurar event listeners específicos do armazém (modo compatibilidade)
    configurarEventListenersArmazem() {
      try {
        
        // Apenas verificar se há elementos de sensores sem adicionar listeners
        // (deixar que o sistema existente gerencie os event listeners)
        const elementosSensor = document.querySelectorAll('[id^="TC"], [id^="pendulo_"]')
        
        // Apenas adicionar classes visuais se necessário, sem modificar event listeners
        elementosSensor.forEach(elemento => {
          // Verificar se já tem classe de draggable
          if (!elemento.classList.contains('sensor-draggable') && !elemento.draggable) {
            elemento.classList.add('sensor-draggable')
          }
        })
        
      } catch (error) {
      }
    },

    // ✅ MÉTODO AUXILIAR: Limpar configuração de preview
    limparConfiguracaoPreview() {
      try {
        // Limpar dados específicos do preview
        this.dadosVindosDoPreview = false
        this.configPreviewAplicada = null
        
        // Limpar localStorage relacionado ao preview
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('configPreviewTemp')
          localStorage.removeItem('dadosPreviewArmazem')
          localStorage.removeItem('timestampPreview')
        }
        
      } catch (error) {
      }
    },

    // ✅ MÉTODO CRÍTICO: Limpar posições manuais conflitantes ao selecionar modelo
    limparPosicoesManualConflitantes() {
      try {
        
        // 🎯 GUARDAR posições atuais se existirem para possível restauração
        const posicoesBackup = {
          pendulos: { ...this.posicoesManualPendulos },
          sensores: { ...this.posicoesManualSensores },
          timestamp: Date.now()
        }
        
        // 🔧 LIMPAR posições manuais globais que podem conflitar com o modelo específico
        this.posicoesManualPendulos = {}
        this.posicoesManualSensores = {}
        
        // 🔧 LIMPAR localStorage temporário que pode ter posições conflitantes
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('posicoesManualTemp')
          localStorage.removeItem('posicoesConflitantes')
          
          // Salvar backup por segurança (por 1 hora)
          localStorage.setItem('posicoesBackupTemp', JSON.stringify(posicoesBackup))
        }
        
        // 🔧 FORÇAR limpeza completa do estado de drag and drop
        this.limparEstadosDragAndDrop()
        
        // 🔧 CARREGAR posições específicas do modelo se existirem
        if (this.modeloArcoAtual && this.modelosArcos[this.modeloArcoAtual]) {
          const modeloAtual = this.modelosArcos[this.modeloArcoAtual]
          
          // Carregar posições salvas específicas do modelo
          if (modeloAtual.posicoesManualPendulos) {
            this.posicoesManualPendulos = { ...modeloAtual.posicoesManualPendulos }
          }
          
          if (modeloAtual.posicoesManualSensores) {
            this.posicoesManualSensores = { ...modeloAtual.posicoesManualSensores }
          }
          
        }
        
      } catch (error) {
      }
    },

    // ✅ MÉTODO DE COMUNICAÇÃO: Receber posições atualizadas do componente Armazem
    onPosicoesAtualizadas(dadosPosicoes) {
      try {
        
        // 🎯 ATUALIZAR posições manuais dos sensores
        if (dadosPosicoes.sensores) {
          this.posicoesManualSensores = { ...this.posicoesManualSensores, ...dadosPosicoes.sensores }
        }
        
        // 🎯 ATUALIZAR posições manuais dos pêndulos
        if (dadosPosicoes.pendulos) {
          this.posicoesManualPendulos = { ...this.posicoesManualPendulos, ...dadosPosicoes.pendulos }
        }
        
        // 🎯 SALVAR no modelo atual se estiver selecionado
        if (this.modeloArcoAtual) {
          this.salvarPosicoesNoModelo()
        }
        
        // 🎯 FORÇAR atualização do SVG
        this.updateSVG()
        
      } catch (error) {
      }
    },

    // ✅ MÉTODO DE DEBUGGING: Verificar se drag and drop está funcionando
    verificarDragAndDrop() {
      
      // Verificar se há elementos draggable no DOM
      const elementosDraggable = document.querySelectorAll('[draggable="true"], .draggable, .sensor-draggable, .pendulo-draggable')
      
      // Verificar event listeners
      const elementosSensor = document.querySelectorAll('[id^="TC"], [id^="pendulo_"]')
      
      // Verificar se há listeners de mouse
      elementosSensor.forEach((elemento, index) => {
        if (index < 3) { // Apenas os primeiros 3 para não fazer spam
        }
      })
      
      return {
        elementosDraggable: elementosDraggable.length,
        elementosSensor: elementosSensor.length
      }
    }
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.border-end {
  border-right: 1px solid #dee2e6 !important;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-group-text {
  min-width: 60px;
  text-align: center;
}

.badge-sm {
  font-size: 0.75em;
}

/* Melhor visualização em mobile */
@media (max-width: 576px) {
  .modelador-painel-controles {
    height: auto !important;
    overflow-y: visible !important;
    max-height: none !important;
  }

  .form-control,
  .form-select {
    font-size: 14px;
    min-height: 32px;
  }

  .btn-sm {
    font-size: 12px;
    padding: 0.25rem 0.5rem;
    min-height: 32px;
  }

  .input-group-sm .form-control,
  .input-group-sm .btn {
    min-height: 28px;
  }

  .row.g-1>* {
    padding-right: 0.125rem;
    padding-left: 0.125rem;
  }

  .row.g-2>* {
    padding-right: 0.25rem;
    padding-left: 0.25rem;
  }
}

/* Estilos adicionais para cards compactos */
.card-sm {
  min-height: unset;
}

.card-sm .card-body {
  padding: 0.5rem;
}

/* Garantir que selects não transbordem */
.form-select,
.form-control {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-select option {
  padding: 0.25rem;
  font-size: 0.875rem;
}

/* Melhor espaçamento em telas pequenas */
@media (max-width: 768px) {
  .card-body {
    padding: 0.75rem !important;
  }

  .alert {
    padding: 0.5rem !important;
  }

  .badge {
    font-size: 0.65rem;
  }

  .input-group-text {
    min-width: 50px;
    font-size: 0.8rem;
  }
}

/* Ajustes para dispositivos muito pequenos */
@media (max-width: 480px) {
  .form-label {
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }

  .btn-sm {
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
  }

  .small {
    font-size: 0.8rem !important;
  }

  /* Controles de movimentação individual em mobile */
  .input-group-sm .btn {
    min-width: 28px;
    padding: 0.2rem;
  }

  .input-group-sm .form-control {
    min-width: 40px;
  }

  /* Compactar controles de posicionamento */
  .row.g-1 .col-6 {
    padding: 0.1rem;
  }
}

/* Estilos para SVG */
.svg-container-responsive {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

/* Estilos específicos para navegação mobile */
.mobile-navigation {
  background: rgba(248, 249, 250, 0.95);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
  border: 1px solid #dee2e6;
}

.mobile-nav-buttons {
  background: white;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-btn {
  min-width: 36px !important;
  height: 32px;
  font-weight: bold;
  font-size: 14px;
  padding: 4px 8px;
}

/* ============================================
   ESTILOS MODERNOS PARA CONFIGURAÇÕES
   ============================================ */

/* Scrollbar customizada moderna */
.modelador-painel-controles::-webkit-scrollbar {
  width: 10px;
}

.modelador-painel-controles::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 10px;
}

.modelador-painel-controles::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #06335E 0%, #084a89 100%);
  border-radius: 10px;
  border: 2px solid #f1f3f5;
}

.modelador-painel-controles::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #084a89 0%, #06335E 100%);
}

/* Cards com design moderno e elevado */
.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Card header melhorado */
.card-header {
  border-radius: 12px 12px 0 0 !important;
  border: none;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.card-header:hover {
  background-color: #084a89 !important;
}

/* Card body com padding consistente */
.card-body {
  background: #ffffff;
  padding: 1.25rem;
}

/* Scrollbar para áreas de configuração dentro dos cards */
.card-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.card-body::-webkit-scrollbar-track {
  background: #f8f9fa;
  border-radius: 4px;
}

.card-body::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #6c757d 0%, #495057 100%);
  border-radius: 4px;
}

.card-body::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #495057 0%, #343a40 100%);
}

/* Área de configuração com scroll personalizada */
.config-scroll-area {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.config-scroll-area::-webkit-scrollbar {
  width: 6px;
}

.config-scroll-area::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 3px;
}

.config-scroll-area::-webkit-scrollbar-thumb {
  background: #06335E;
  border-radius: 3px;
}

.config-scroll-area::-webkit-scrollbar-thumb:hover {
  background: #084a89;
}

/* Botões modernos e estilizados */
.btn-modern-primary {
  background: linear-gradient(135deg, #06335E 0%, #084a89 100%);
  border: none;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(6, 51, 94, 0.3);
}

.btn-modern-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(6, 51, 94, 0.4);
  background: linear-gradient(135deg, #084a89 0%, #06335E 100%);
}

.btn-modern-secondary {
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  color: #495057;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-modern-secondary:hover {
  background: #e9ecef;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

/* Animação de entrada suave para cards */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Botão de avançar destacado */
.btn-avancar-etapa {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  color: white;
  padding: 0.65rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-avancar-etapa:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 25px rgba(40, 167, 69, 0.5);
  background: linear-gradient(135deg, #20c997 0%, #28a745 100%);
}

.btn-avancar-etapa:active {
  transform: translateY(-1px);
}

/* Indicador de progresso na seção */
.section-progress {
  position: relative;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  margin-bottom: 1rem;
  border-left: 4px solid #06335E;
}

.section-progress-title {
  font-weight: 700;
  color: #06335E;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.section-progress-description {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Melhorias nos inputs e controles */
.form-control, .form-select {
  border-radius: 8px;
  border: 2px solid #e9ecef;
  transition: all 0.3s ease;
}

.form-control:focus, .form-select:focus {
  border-color: #06335E;
  box-shadow: 0 0 0 0.2rem rgba(6, 51, 94, 0.15);
}

/* Labels melhorados */
.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
}

/* Separador visual entre seções */
.section-divider {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #dee2e6 50%, transparent 100%);
  margin: 1.5rem 0;
}

/* Accordion melhorado */
.accordion-item {
  border: none;
  margin-bottom: 0.5rem;
}

/* Alert personalizado */
.alert {
  border-radius: 10px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Badge moderno */
.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
}

/* ============================================
   ESTILOS MODERNOS PARA SLIDERS (RANGERS)
   ============================================ */

/* Estilo base do range input - importante para sobrescrever Bootstrap */
input[type="range"],
.form-range {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 100% !important;
  height: 8px !important;
  border-radius: 10px !important;
  background: linear-gradient(90deg, #e9ecef 0%, #dee2e6 100%) !important;
  outline: none !important;
  transition: all 0.3s ease !important;
  cursor: pointer !important;
  margin: 8px 0 !important;
}

input[type="range"]:hover,
.form-range:hover {
  background: linear-gradient(90deg, #dee2e6 0%, #ced4da 100%) !important;
}

/* Trilha do slider - WebKit (Chrome, Safari) */
input[type="range"]::-webkit-slider-track,
.form-range::-webkit-slider-track {
  width: 100% !important;
  height: 8px !important;
  border-radius: 10px !important;
  background: linear-gradient(90deg, #06335E 0%, #084a89 50%, #06335E 100%) !important;
  border: none !important;
}

/* Thumb (bolinha) do slider - WebKit */
input[type="range"]::-webkit-slider-thumb,
.form-range::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  appearance: none !important;
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #06335E 0%, #0d6efd 100%) !important;
  cursor: pointer !important;
  border: 3px solid #ffffff !important;
  box-shadow: 0 4px 12px rgba(6, 51, 94, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  z-index: 2 !important;
}

input[type="range"]::-webkit-slider-thumb:hover,
.form-range::-webkit-slider-thumb:hover {
  transform: scale(1.2) !important;
  background: linear-gradient(135deg, #0d6efd 0%, #06335E 100%) !important;
  box-shadow: 0 6px 20px rgba(6, 51, 94, 0.6) !important;
}

input[type="range"]::-webkit-slider-thumb:active,
.form-range::-webkit-slider-thumb:active {
  transform: scale(1.1) !important;
  box-shadow: 0 2px 8px rgba(6, 51, 94, 0.5) !important;
}

/* Trilha do slider - Firefox */
input[type="range"]::-moz-range-track,
.form-range::-moz-range-track {
  width: 100% !important;
  height: 8px !important;
  border-radius: 10px !important;
  background: linear-gradient(90deg, #06335E 0%, #084a89 50%, #06335E 100%) !important;
  border: none !important;
}

/* Thumb do slider - Firefox */
input[type="range"]::-moz-range-thumb,
.form-range::-moz-range-thumb {
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #06335E 0%, #0d6efd 100%) !important;
  cursor: pointer !important;
  border: 3px solid #ffffff !important;
  box-shadow: 0 4px 12px rgba(6, 51, 94, 0.4) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

input[type="range"]::-moz-range-thumb:hover,
.form-range::-moz-range-thumb:hover {
  transform: scale(1.2) !important;
  background: linear-gradient(135deg, #0d6efd 0%, #06335E 100%) !important;
  box-shadow: 0 6px 20px rgba(6, 51, 94, 0.6) !important;
}

/* Slider em foco */
input[type="range"]:focus,
.form-range:focus {
  outline: none !important;
  box-shadow: none !important;
}

input[type="range"]:focus::-webkit-slider-thumb,
.form-range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px rgba(6, 51, 94, 0.2), 0 4px 12px rgba(6, 51, 94, 0.4) !important;
}

input[type="range"]:focus::-moz-range-thumb,
.form-range:focus::-moz-range-thumb {
  box-shadow: 0 0 0 4px rgba(6, 51, 94, 0.2), 0 4px 12px rgba(6, 51, 94, 0.4) !important;
}

/* Preenchimento da trilha (efeito de progresso) - WebKit */
input[type="range"]::-webkit-slider-runnable-track,
.form-range::-webkit-slider-runnable-track {
  height: 8px !important;
  border-radius: 10px !important;
  background: linear-gradient(90deg, #06335E 0%, #084a89 100%) !important;
}

/* ============================================
   ESTILOS MODERNOS PARA BOTÕES +/- 
   ============================================ */

/* Botões de incremento/decremento modernos */
.btn-outline-secondary {
  border: 2px solid #dee2e6;
  background: #ffffff;
  color: #495057;
  font-weight: 700;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-outline-secondary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(6, 51, 94, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-outline-secondary:hover::before {
  width: 300px;
  height: 300px;
}

.btn-outline-secondary:hover {
  border-color: #06335E;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #06335E;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 51, 94, 0.15);
}

.btn-outline-secondary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(6, 51, 94, 0.2);
}

.btn-outline-secondary:disabled {
  background: #f8f9fa;
  border-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Ícones + e - estilizados */
.btn-outline-secondary .fa-plus,
.btn-outline-secondary .fa-minus {
  font-weight: 900;
  font-size: 1.1em;
  transition: transform 0.3s ease;
}

.btn-outline-secondary:hover .fa-plus {
  transform: rotate(90deg) scale(1.1);
}

.btn-outline-secondary:hover .fa-minus {
  transform: scale(1.2);
}

/* Botão de reset (×) moderno */
.btn-outline-secondary[title*="Reset"],
.btn-outline-secondary[title*="Resetar"] {
  border-color: #ffc107;
  color: #ff6b6b;
  font-size: 1.2rem;
  line-height: 1;
  min-width: 36px;
  min-height: 36px;
  padding: 0.25rem 0.5rem;
}

.btn-outline-secondary[title*="Reset"]:hover,
.btn-outline-secondary[title*="Resetar"]:hover {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%);
  border-color: #ff6b6b;
  color: #dc3545;
  transform: rotate(90deg) scale(1.1);
}

/* Botões de grupo de input modernos */
.input-group .btn-outline-secondary {
  border-radius: 0;
}

.input-group .btn-outline-secondary:first-child {
  border-radius: 8px 0 0 8px;
}

.input-group .btn-outline-secondary:last-child {
  border-radius: 0 8px 8px 0;
}

/* Input numérico dentro do grupo */
.input-group .form-control {
  border-left: none;
  border-right: none;
  text-align: center;
  font-weight: 700;
  font-size: 1.05rem;
  color: #06335E;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.input-group .form-control:focus {
  background: #ffffff;
  border-color: #06335E;
  box-shadow: inset 0 0 0 2px rgba(6, 51, 94, 0.1);
  z-index: 3;
}

/* Estilo especial para input-group-sm */
.input-group-sm .btn-outline-secondary {
  min-width: 32px;
  min-height: 32px;
  padding: 0.25rem 0.5rem;
  font-size: 0.95rem;
}

.input-group-sm .form-control {
  font-size: 0.95rem;
  padding: 0.375rem 0.5rem;
}

/* Animação de pulso para botões desabilitados que indicam limite */
@keyframes pulseLimit {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.3;
  }
}

.btn-outline-secondary:disabled:hover {
  animation: pulseLimit 2s ease-in-out infinite;
}

/* Melhorias para botões dentro de cards */
.card-body .btn-outline-secondary {
  margin: 2px;
}

/* Efeito de brilho ao passar mouse nos sliders */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

input[type="range"]:hover::-webkit-slider-track,
.form-range:hover::-webkit-slider-track {
  background: linear-gradient(90deg, 
    #06335E 0%, 
    #084a89 25%, 
    #0d6efd 50%, 
    #084a89 75%, 
    #06335E 100%
  ) !important;
  background-size: 2000px 100% !important;
  animation: shimmer 3s linear infinite !important;
}

input[type="range"]:hover::-moz-range-track,
.form-range:hover::-moz-range-track {
  background: linear-gradient(90deg, 
    #06335E 0%, 
    #084a89 25%, 
    #0d6efd 50%, 
    #084a89 75%, 
    #06335E 100%
  ) !important;
}

/* Tooltip visual para valor do slider */
input[type="range"]:hover::after,
.form-range:hover::after {
  opacity: 1;
}

/* Estilos para botões pequenos mais arredondados */
.btn-sm {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-sm:hover {
  transform: translateY(-1px);
}

.btn-sm:active {
  transform: translateY(0);
}

/* Uniformização de gap entre elementos */
.d-flex.align-items-center.gap-2 {
  gap: 0.5rem !important;
}

/* Responsividade para sliders em mobile */
@media (max-width: 576px) {
  input[type="range"],
  .form-range {
    height: 10px !important;
  }
  
  input[type="range"]::-webkit-slider-thumb,
  .form-range::-webkit-slider-thumb {
    width: 28px !important;
    height: 28px !important;
  }
  
  input[type="range"]::-moz-range-thumb,
  .form-range::-moz-range-thumb {
    width: 28px !important;
    height: 28px !important;
  }
  
  .btn-outline-secondary {
    min-width: 36px;
    min-height: 36px;
    font-size: 1rem;
  }
}

/* Toggle bonito para Editar/Criar com cores do tema */
.modo-dados-toggle .btn {
  border-color: #06335E;
  color: #06335E;
  font-weight: 600;
}
.modo-dados-toggle .btn:focus { box-shadow: none; }
.modo-dados-toggle .btn-check:checked + .btn {
  color: #fff;
  background-color: #06335E;
  border-color: #06335E;
}
.modo-dados-toggle .btn + .btn { margin-left: -1px; }
.modo-dados-toggle .btn:first-of-type { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
.modo-dados-toggle .btn:last-of-type { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }</style>


