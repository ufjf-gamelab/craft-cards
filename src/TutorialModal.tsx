import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isLightTheme, setIsLightTheme] = useState(
    document.documentElement.classList.contains('light-theme')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightTheme(document.documentElement.classList.contains('light-theme'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: isLightTheme ? 'light' : 'dark',
        primary: {
          main: isLightTheme ? '#2563eb' : '#646cff',
        },
        background: {
          default: isLightTheme ? '#d1d5db' : '#1a1a2e',
          paper: isLightTheme ? '#f0f3f3' : '#2a2a4a',
        },
        text: {
          primary: isLightTheme ? '#111827' : '#f0f0f0',
          secondary: isLightTheme ? '#374151' : '#b0b0b0',
        },
      },
      components: {
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              backgroundImage: 'none',
            },
          },
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              borderBottom: '1px solid var(--border-color)',
            },
          },
        },
        MuiDialogContent: {
          styleOverrides: {
            root: {
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            },
          },
        },
        MuiDialogActions: {
          styleOverrides: {
            root: {
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
            },
          },
        },
        MuiButton: {
          styleOverrides: {
            root: {
              color: 'var(--text-primary)',
            },
            contained: {
              backgroundColor: 'var(--accent-color)',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'var(--accent-hover)',
              },
            },
            outlined: {
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              '&:hover': {
                borderColor: 'var(--accent-color)',
                backgroundColor: 'var(--bg-elevated)',
              },
            },
          },
        },
        MuiStepLabel: {
          styleOverrides: {
            label: {
              color: 'var(--text-primary)',
              '&.Mui-active': {
                color: 'var(--accent-color)',
              },
              '&.Mui-completed': {
                color: 'var(--success-color)',
              },
            },
          },
        },
        MuiStepIcon: {
          styleOverrides: {
            root: {
              color: 'var(--text-secondary)',
              '&.Mui-active': {
                color: 'var(--accent-color)',
              },
              '&.Mui-completed': {
                color: 'var(--success-color)',
              },
            },
            text: {
              fill: 'var(--text-primary)',
            },
          },
        },
      },
    });
  }, [isLightTheme]);

  const steps = [
    'Visão Geral',
    'Jogabilidade (Exemplo)',
    'Sistema de Vitória',
    'Análise - Grafo',
    'Análise - Rede de Petri',
    'Análise - Árvore de Alcançabilidade',
    'Modelos JSON Personalizados',
  ];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Tutorial - Ferramenta de Balanceamento de Jogos de Cartas
            </Typography>
            <IconButton onClick={onClose} size="small">
              ✕
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4, mt: 2, overflowX: 'auto' }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ minHeight: 500, maxHeight: 500, overflow: 'auto', pr: 1 }}>
            {/* PASSO 0 - VISÃO GERAL */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Bem-vindo à Ferramenta de Balanceamento
                </Typography>
                <Typography paragraph>
                  Esta é uma aplicação <strong>para designers e desenvolvedores</strong> que desejam
                  analisar e balancear jogos de cartas baseados em recursos. A ferramenta permite
                  carregar um modelo JSON contendo cartas, recursos e regras, e então simular partidas,
                  visualizar métricas de rede e explorar todos os estados alcançáveis do sistema.
                </Typography>
                <Typography paragraph>
                  O objetivo é identificar gargalos, recursos subutilizados, cadeias de produção longas
                  e desbalanceamentos logo no início do design, economizando tempo e melhorando a
                  experiência do jogador.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 }}>
                  <Chip label="Simulação" color="primary" variant="outlined" />
                  <Chip label="Grafos" color="success" variant="outlined" />
                  <Chip label="Redes de Petri" color="info" variant="outlined" />
                  <Chip label="Árvore de Alcançabilidade" color="warning" variant="outlined" />
                  <Chip label="Persistência" color="error" variant="outlined" />
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Interface Principal:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    <strong>Topo:</strong> Recursos disponíveis (ação, madeira, táboa, pontuação, etc.)
                    e o seed atual.
                  </Typography>
                  <Typography>
                    <strong>Barra de Controles:</strong> Botões para ações do jogo, alternar painel de
                    análises, persistência e alternar tema.
                  </Typography>
                  <Typography>
                    <strong>Área do Jogo:</strong> Cartas na mão, oferta (mercado) e recursos.
                  </Typography>
                  <Typography>
                    <strong>Painel de Análises:</strong> Abas para Grafo, Rede de Petri, Árvore de
                    Alcançabilidade e Histórico.
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    Dica: Use o botão <strong>"Mostrar Análises"</strong> para abrir o painel e explorar
                    as ferramentas de diagnóstico.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 1 - JOGABILIDADE (EXEMPLO) */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Jogabilidade de Exemplo
                </Typography>
                <Typography paragraph>
                  A ferramenta inclui um jogo de exemplo com regras fixas (disponíveis em{' '}
                  <code>data/cards.ts</code>) para demonstrar o funcionamento. Você pode interagir com
                  ele para entender como os recursos fluem e como as análises refletem o estado do jogo.
                </Typography>
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Recursos:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    <strong>Ação:</strong> Recurso principal – toda carta custa 1 ação para ser jogada
                    ou comprada.
                  </Typography>
                  <Typography>
                    <strong>Madeira Bruta e Pedra Bruta:</strong> Recursos básicos coletados.
                  </Typography>
                  <Typography>
                    <strong>Tábua e Pedra Polida:</strong> Recursos processados a partir dos básicos.
                  </Typography>
                  <Typography>
                    <strong>Pontuação:</strong> Recurso de vitória – quem fizer mais pontos vence.
                  </Typography>
                </Paper>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Sistema de Turnos:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    Cada turno começa com <strong>3 ações</strong>. Jogar uma carta ou comprar da
                    oferta consome 1 ação.
                  </Typography>
                  <Typography>
                    O botão <strong>"Passar Turno"</strong> encerra o turno, repõe 3 ações e compra
                    novas cartas do baralho. Os botões <strong>"Diminuir Ação"</strong> e{' '}
                    <strong>"Aumentar Ponto"</strong> são ferramentas de debug para testes.
                  </Typography>
                </Paper>

                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Nota:</strong> Este é apenas um jogo de exemplo. O verdadeiro poder da
                    ferramenta está nas análises e na possibilidade de carregar seus próprios modelos.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 2 - SISTEMA DE VITÓRIA */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Sistema de Vitória e Deadlocks
                </Typography>
                
                <Typography paragraph>
                  A simulação pode terminar de três maneiras, todas configuráveis no modelo JSON:
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    1. Vitória por Pontos
                  </Typography>
                  <Typography>
                    Quando um jogador atinge ou ultrapassa <code>pontosParaVencer</code> (padrão: 10).
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    2. Limite de Turnos
                  </Typography>
                  <Typography>
                    Quando o número de turnos excede <code>turnosMaximos</code> (padrão: 30).
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    3. Deadlock
                  </Typography>
                  <Typography>
                    Ocorre quando o jogador não tem ações restantes <strong>e</strong> não pode jogar
                    ou comprar nenhuma carta. A ferramenta distingue:
                  </Typography>
                  <Typography>
                    <strong>Deadlock Temporário:</strong> O jogador está sem ações, mas pode comprar
                    cartas que geram ação (ex: "Descansar") – alerta <span style={{ color: '#FFC107' }}>AMARELO</span> na Rede de Petri.
                  </Typography>
                  <Typography>
                    <strong>Deadlock Permanente:</strong> Não há nenhuma carta que produza ação em
                    lugar algum – alerta <span style={{ color: '#f44336' }}>VERMELHO</span>. O jogo
                    não pode continuar.
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    Exemplo: com <code>pontosParaVencer: 15</code>, são necessários 15 pontos para
                    vencer. Ajuste esses valores no JSON para testar diferentes cenários.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 3 - ANÁLISE - GRAFO */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Análise de Grafo
                </Typography>
                
                <Typography paragraph>
                  O Grafo de Recursos exibe visualmente as relações entre cartas e recursos. É uma
                  ferramenta fundamental para identificar gargalos e desbalanceamentos.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Elementos do Grafo:
                  </Typography>
                  <Typography>
                    <strong>Nós Verdes:</strong> Recursos (madeira, táboa, pontuação, etc.)
                  </Typography>
                  <Typography>
                    <strong>Nós Azuis:</strong> Cartas (ações)
                  </Typography>
                  <Typography>
                    <strong>Arestas Verdes (+):</strong> Produção de recursos
                  </Typography>
                  <Typography>
                    <strong>Arestas Vermelhas (-):</strong> Consumo de recursos
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Métricas Disponíveis:
                  </Typography>
                  <Typography>
                    <strong>Densidade:</strong> Proporção de conexões existentes vs. possíveis. Alta
                    densidade indica sistema complexo e interconectado.
                  </Typography>
                  <Typography>
                    <strong>Centralidade:</strong> Identifica recursos mais importantes (muito usados
                    como entrada/saída).
                  </Typography>
                  <Typography>
                    <strong>Diâmetro:</strong> Maior distância entre dois nós. Valores altos sugerem
                    cadeias de produção muito longas.
                  </Typography>
                  <Typography>
                    <strong>Componentes:</strong> Subgrafos desconexos. Idealmente deve ser 1 (todos
                    os recursos se conectam).
                  </Typography>
                  <Typography>
                    <strong>Produção vs. Consumo:</strong> Se produção &gt; consumo, recursos tendem a
                    acumular; se consumo &gt; produção, há risco de escassez.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Análise de Balanceamento Automática:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Gargalos:</strong> recursos muito consumidos e pouco produzidos.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Recursos inúteis:</strong> produzidos mas nunca consumidos.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Caminhos longos:</strong> cadeias de produção extensas.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Padrões recorrentes:</strong> sequências que aparecem com frequência.
                  </Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">
                    Use o grafo para detectar rapidamente recursos com alta demanda e baixa oferta.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 4 - ANÁLISE - REDE DE PETRI */}
            {activeStep === 4 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Rede de Petri
                </Typography>
                
                <Typography paragraph>
                  A Rede de Petri é um modelo matemático para sistemas concorrentes. Nesta ferramenta,
                  ela mostra a interação entre recursos (lugares) e cartas (transições) em tempo real.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Elementos da Rede:
                  </Typography>
                  <Typography>
                    <strong>Lugares (Círculos Verdes):</strong> Recursos. O número dentro é a
                    quantidade atual (tokens).
                  </Typography>
                  <Typography>
                    <strong>Transições (Retângulos Azuis):</strong> Cartas. Ficam <span style={{ color: '#FFC107' }}>amarelas</span> quando habilitadas.
                  </Typography>
                  <Typography>
                    <strong>Arcos de Entrada (Vermelhos):</strong> Consumo de recursos.
                  </Typography>
                  <Typography>
                    <strong>Arcos de Saída (Verdes):</strong> Produção de recursos.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Funcionalidades:
                  </Typography>
                  <Typography>
                    <strong>Modo Livre:</strong> Permite editar manualmente os tokens clicando nos
                    lugares (esquerdo +1, direito -1). Útil para testar cenários hipotéticos.
                  </Typography>
                  <Typography>
                    <strong>Análise Completa:</strong> Ignora a mão do jogador e mostra todas as
                    transições possíveis do sistema – visão global.
                  </Typography>
                  <Typography>
                    <strong>Resetar (Modo Livre):</strong> Zera todos os recursos.
                  </Typography>
                  <Typography>
                    <strong>Slider de Expansões:</strong> Controla quantos passos extras a árvore de
                    alcançabilidade irá explorar a partir de estados ω (omega).
                  </Typography>
                  <Typography>
                    <strong>Gerar Árvore:</strong> Constrói a árvore de alcançabilidade a partir da
                    marcação atual.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Como usar o Modo Livre:
                  </Typography>
                  <Typography>
                    Ative o switch "Modo Livre". Clique com o botão <strong>esquerdo</strong> em um
                    recurso para adicionar 1 token, com o <strong>direito</strong> para remover.
                  </Typography>
                  <Typography>
                    Para disparar uma transição (carta), clique nela. Se estiver habilitada (amarela),
                    os recursos serão consumidos e produzidos conforme a regra.
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    Transições <span style={{ color: '#FFC107' }}>amarelas</span> estão
                    habilitadas – você tem recursos suficientes para dispará-las.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 5 - ÁRVORE DE ALCANÇABILIDADE */}
            {activeStep === 5 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Árvore de Alcançabilidade
                </Typography>
                
                <Typography paragraph>
                  A Árvore de Alcançabilidade enumera <strong>todos os estados possíveis</strong> do
                  sistema a partir da marcação atual. É uma ferramenta poderosa para verificar se o
                  jogo pode entrar em loops, se há estados mortos ou se recursos podem crescer
                  infinitamente (omega).
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Características:
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Expansão Automática:</strong> A árvore é gerada recursivamente a partir da
                    marcação inicial, disparando todas as transições habilitadas.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Detecção de Omega (ω):</strong> Identifica recursos que podem crescer
                    indefinidamente – representados como <strong>ω</strong>.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Controle de Expansão:</strong> O slider de expansões define quantas
                    camadas extras a árvore explorará além dos estados ω (útil para evitar explosão
                    combinatória).
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Visualização Hierárquica:</strong> Navegue pelos estados clicando nos nós
                    da árvore.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Tabela Detalhada:</strong> Lista todos os estados gerados com:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    • Marcação (quantidades de cada recurso)
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    • Transição que levou ao estado
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    • Tipo: inicial, ω, cíclico, terminal, simulação
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    • Botão para centralizar o nó na visualização
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Como usar:
                  </Typography>
                  <Typography>
                    1. Ajuste o slider de expansões (0‑10) para controlar a profundidade.
                  </Typography>
                  <Typography>
                    2. Clique em <strong>"Gerar Árvore"</strong> – a árvore será construída com base
                    na marcação atual (ou na marcação do jogo, se "Análise Completa" estiver ativa).
                  </Typography>
                  <Typography>
                    3. Explore os estados na visualização interativa ou na tabela abaixo.
                  </Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">
                    A árvore revela se o sistema pode entrar em loops infinitos ou se há estados
                    terminais indesejados – essencial para validar o balanceamento.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 6 - MODELOS JSON */}
            {activeStep === 6 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  Modelos JSON Personalizados
                </Typography>
                
                <Typography paragraph>
                  Você pode criar seus próprios jogos carregando um arquivo JSON. Esta é a forma mais
                  poderosa de usar a ferramenta – defina cartas, recursos, regras e simule
                  quantas vezes quiser.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Estrutura Básica do JSON:
                  </Typography>
                  <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
{`{
  "baralho": [...],           // Array de cartas iniciais do jogador
  "baralhoDaOferta": [...],   // Array de cartas disponíveis para compra
  "recursos": [...],          // Array de recursos iniciais
  "pontosParaVencer": 15,     // (opcional) Pontos necessários para vencer
  "turnosMaximos": 25,        // (opcional) Limite máximo de turnos
  "seed": 12345              // (opcional) Semente para geração aleatória
}`}
                  </pre>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Estrutura de uma Carta:
                  </Typography>
                  <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
{`{
  "id": "coletar_madeira",                     // Identificador único
  "titulo": "Coletar Madeira",                  // Nome exibido
  "texto": "Descrição opcional",                // Texto descritivo
  "custo": [{ "nome": "acao", "quantidade": 1 }],  // Recursos gastos
  "ganho": [{ "nome": "madeira bruta", "quantidade": 2 }]  // Recursos ganhos
}`}
                  </pre>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Estrutura de um Recurso:
                  </Typography>
                  <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
{`{
  "nome": "acao",      // Nome do recurso
  "quantidade": 5      // Quantidade inicial
}`}
                  </pre>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Como Carregar seu Modelo:
                  </Typography>
                  <Typography>
                    1. Clique no botão <strong>"Persistência"</strong> na barra de controles.
                  </Typography>
                  <Typography>
                    2. Selecione <strong>"Carregar regras (JSON)"</strong> no menu dropdown.
                  </Typography>
                  <Typography>
                    3. Navegue até o arquivo <code>.json</code> e selecione-o.
                  </Typography>
                  <Typography>
                    4. O jogo reiniciará automaticamente com suas regras personalizadas!
                  </Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">
                    Dica: Use <strong>"Salvar em Arquivo"</strong> no menu de persistência para
                    exportar seu jogo atual e editá-lo como modelo.
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fechar</Button>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Voltar
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={onClose}>
              Concluir
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Próximo
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default TutorialModal;