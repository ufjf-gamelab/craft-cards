import React, { useState } from 'react';
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

const getModalTheme = () => {
  const isLightTheme = document.documentElement.classList.contains('light-theme');
  
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
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
          },
          standardInfo: {
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            color: 'var(--text-primary)',
          },
          standardWarning: {
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            color: 'var(--text-primary)',
          },
          standardSuccess: {
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            color: 'var(--text-primary)',
          },
          standardError: {
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            color: 'var(--text-primary)',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: 'var(--text-primary)',
          },
          body2: {
            color: 'var(--text-secondary)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--chip-bg)',
            color: 'var(--text-primary)',
          },
        },
      },
    },
  });
};

const TutorialModal: React.FC<TutorialModalProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [theme, setTheme] = useState(getModalTheme());

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(getModalTheme());
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  const steps = [
    'Visao Geral',
    'Jogabilidade',
    'Sistema de Vitoria',
    'Analises - Grafo',
    'Analises - Rede de Petri',
    'Analises - Arvore',
    'Modelos JSON',
  ];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" style={{ color: 'var(--text-primary)' }}>
              Tutorial do Jogo - Guia Completo
            </Typography>
            <IconButton onClick={onClose} size="small" style={{ color: 'var(--text-primary)' }}>
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
                <Typography variant="h5" gutterBottom style={{ color: 'var(--accent-color)' }}>
                  Bem-vindo a Aplicacao Craft Cards!
                </Typography>
                <Typography>
                  Este e um jogo de gerenciamento de recursos onde voce usa cartas para transformar recursos,
                  ganhar pontos e vencer o jogo. O sistema inclui analises avancadas como Grafos,
                  Redes de Petri e Arvores de Alcantabilidade para ajudar no balanceamento.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 }}>
                  <Chip label="Recursos" color="primary" variant="outlined" />
                  <Chip label="Cartas" color="success" variant="outlined" />
                  <Chip label="Grafo" color="info" variant="outlined" />
                  <Chip label="Petri Net" color="warning" variant="outlined" />
                  <Chip label="Arvore" color="error" variant="outlined" />
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Interface Principal:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    <strong>Topo:</strong> Recursos disponiveis (acao, madeira, tabua, pontuacao)
                  </Typography>
                  <Typography>
                    <strong>Barra de Controles:</strong> Botoes para acoes do jogo e analises
                  </Typography>
                  <Typography>
                    <strong>Area do Jogo:</strong> Cartas na mao, oferta e recursos
                  </Typography>
                  <Typography>
                    <strong>Area de Analises:</strong> Grafo, Rede de Petri e Arvore de Alcantabilidade
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    Dica: Use o botao "Mostrar Analises" para abrir o painel de analises e entender melhor as relacoes do jogo!
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 1 - JOGABILIDADE */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" gutterBottom style={{ color: 'var(--success-color)' }}>
                  Como Jogar
                </Typography>
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Recursos:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    O jogo possui diversos recursos. O mais importante e a <strong>acao</strong>.
                    Toda carta custa 1 acao para ser jogada ou comprada.
                  </Typography>
                  <Typography>
                    <strong>madeira bruta e pedra bruta</strong> sao recursos basicos coletados.
                    <strong>tabua e pedra polida</strong> sao recursos processados a partir dos basicos.
                    <strong>pontuacao</strong> e o recurso de vitoria! Quem fizer mais pontos vence.
                  </Typography>
                </Paper>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Sistema de Turnos:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    Cada turno comeca com 3 acoes. Jogar uma carta consome 1 acao. Comprar uma carta da oferta tambem consome 1 acao.
                  </Typography>
                  <Typography>
                    O botao "Passar Turno" encerra seu turno atual, repoe 3 acoes e compra novas cartas do baralho.
                    Os botoes "Diminuir Acao" e "Aumentar Ponto" sao botoes de debug para testes.
                  </Typography>
                </Paper>

                <Alert severity="warning">
                  <Typography variant="body2">
                    Importante: Gerencie suas acoes! Se ficar sem acoes, passe o turno para recupera-las.
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 2 - SISTEMA DE VITORIA */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h5" gutterBottom style={{ color: 'var(--warning-color)' }}>
                  Sistema de Vitoria
                </Typography>
                
                <Typography>
                  O jogo pode terminar de tres maneiras diferentes:
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    1. Vitoria por Pontos:
                  </Typography>
                  <Typography>
                    Quando um jogador atinge a quantidade de pontos definida em <code>pontosParaVencer</code>.
                    O padrao e 10 pontos, mas pode ser configurado no modelo JSON.
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    2. Limite de Turnos:
                  </Typography>
                  <Typography>
                    Quando o numero de turnos ultrapassa <code>turnosMaximos</code>. O padrao e 30 turnos.
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    3. Deadlock:
                  </Typography>
                  <Typography>
                    Quando um jogador nao tem acoes restantes E nao pode jogar/comprar nenhuma carta.
                    Existem dois tipos de deadlock:
                  </Typography>
                  <Typography>
                    <strong>Deadlock Temporario:</strong> O jogador esta sem acoes, mas pode comprar cartas que geram acao (ex: "Descansar") no futuro. Um alerta AMARELO aparece na Rede de Petri.
                  </Typography>
                  <Typography>
                    <strong>Deadlock Permanente:</strong> Nao ha nenhuma carta que produza acao em lugar nenhum. O jogo nao pode continuar. Um alerta VERMELHO aparece na Rede de Petri.
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    Exemplo: Se <code>pontosParaVencer: 15</code>, voce precisa de 15 pontos para vencer!
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 3 - ANALISES - GRAFO */}
            {activeStep === 3 && (
              <Box>
                <Typography variant="h5" gutterBottom style={{ color: '#2196F3' }}>
                  Analise de Grafo
                </Typography>
                
                <Typography>
                  O Grafo de Recursos mostra visualmente como cartas e recursos se relacionam.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Elementos do Grafo:
                  </Typography>
                  <Typography>
                    <strong>Nos Verdes:</strong> Representam recursos (madeira, tabua, pontuacao, etc.)
                  </Typography>
                  <Typography>
                    <strong>Nos Azuis:</strong> Representam cartas
                  </Typography>
                  <Typography>
                    <strong>Arestas Verdes (+):</strong> Indicam producao de recursos
                  </Typography>
                  <Typography>
                    <strong>Arestas Vermelhas (-):</strong> Indicam consumo de recursos
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Significado das Metricas:
                  </Typography>
                  <Typography>
                    <strong>Densidade:</strong> Proporcao de conexoes existentes vs possiveis. Quanto maior a densidade, mais complexo e interconectado e o sistema.
                  </Typography>
                  <Typography>
                    <strong>Centralidade:</strong> Identifica os recursos mais importantes. Um recurso com alto grau de centralidade e muito utilizado como entrada ou saida de cartas.
                  </Typography>
                  <Typography>
                    <strong>Diametro:</strong> Maior distancia entre dois nos do grafo. Indica cadeias longas de producao - valores altos sugerem processos muito longos.
                  </Typography>
                  <Typography>
                    <strong>Componentes:</strong> Subgrafos desconexos. Idealmente deveria ser 1, indicando que todos os recursos se conectam. Componentes multiplos indicam sistemas isolados.
                  </Typography>
                  <Typography>
                    <strong>Producao vs Consumo:</strong> Se a producao total for maior que o consumo, recursos tendem a acumular. Se o consumo for maior, ha risco de falta de recursos.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Analise de Balanceamento:
                  </Typography>
                  <Typography>
                    A ferramenta identifica automaticamente gargalos (recursos muito consumidos e pouco produzidos),
                    recursos inuteis (produzidos mas nunca consumidos), caminhos longos (cadeias de producao extensas)
                    e padroes recorrentes (sequencias que aparecem com frequencia no grafo).
                  </Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">
                    Use o grafo para identificar recursos com alta demanda e baixa producao (gargalos)!
                  </Typography>
                </Alert>
              </Box>
            )}

            {/* PASSO 4 - ANALISES - REDE DE PETRI */}
            {activeStep === 4 && (
              <Box>
                <Typography variant="h5" gutterBottom style={{ color: 'var(--warning-color)' }}>
                  Rede de Petri
                </Typography>
                
                <Typography>
                  A Rede de Petri e uma ferramenta matematica para modelar sistemas concorrentes. Neste jogo, ela mostra como recursos e transicoes interagem.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Elementos da Rede de Petri:
                  </Typography>
                  <Typography>
                    <strong>Lugares (Circulos Verdes):</strong> Representam recursos. O numero dentro de cada circulo e a quantidade atual daquele recurso (fichas/tokens).
                  </Typography>
                  <Typography>
                    <strong>Transicoes (Retangulos Azuis):</strong> Representam cartas. Quando habilitadas, ficam amarelas.
                  </Typography>
                  <Typography>
                    <strong>Arcos de Entrada (Vermelhos):</strong> Indicam consumo de recursos para disparar uma transicao.
                  </Typography>
                  <Typography>
                    <strong>Arcos de Saida (Verdes):</strong> Indicam producao de recursos ao disparar uma transicao.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Botoes e Funcionalidades:
                  </Typography>
                  <Typography>
                    <strong>Modo Livre:</strong> Permite editar recursos manualmente clicando nos lugares.
                  </Typography>
                  <Typography>
                    <strong>Analise Completa:</strong> Ignora as cartas na mao do jogador e mostra todas as transicoes possiveis do sistema. Util para analisar o sistema como um todo.
                  </Typography>
                  <Typography>
                    <strong>Resetar (no Modo Livre):</strong> Reinicia o modo livre com todos os recursos em 0.
                  </Typography>
                  <Typography>
                    <strong>Slider de Expansoes:</strong> Define quantos passos a mais a arvore de alcancabilidade vai expandir a partir de estados omega.
                  </Typography>
                  <Typography>
                    <strong>Gerar Arvore:</strong> Cria a arvore de alcancabilidade baseada na marcacao atual.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Como usar o Modo Livre:
                  </Typography>
                  <Typography>
                    Ative o switch "Modo Livre". Agora voce pode clicar com o botao esquerdo em um recurso (lugar) para adicionar 1 token, ou com o botao direito para remover 1 token.
                  </Typography>
                  <Typography>
                    Para disparar uma transicao (carta), clique nela. Se estiver habilitada (amarela), os recursos serao consumidos e produzidos conforme a regra da carta.
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Destaque Visual:
                  </Typography>
                  <Typography>
                    Transicoes destacadas em <strong style={{ color: '#FFC107' }}>AMARELO</strong> estao habilitadas para disparo, ou seja, voce tem recursos suficientes para joga-las.
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    Transicoes destacadas em AMARELO estao habilitadas para disparo!
                  </Typography>
                </Alert>
              </Box>
            )}

            

            {/* PASSO 6 - MODELOS JSON */}
            {activeStep === 6 && (
              <Box>
                <Typography variant="h5" gutterBottom style={{ color: 'var(--accent-color)' }}>
                  Criando Modelos JSON Personalizados
                </Typography>
                
                <Typography>
                  Voce pode criar seus proprios jogos carregando arquivos JSON! Esta e a forma mais poderosa de customizar a experiencia.
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Estrutura Basica do JSON:
                  </Typography>
                  <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
{`{
  "baralho": [...],        // Array de cartas iniciais do jogador
  "baralhoDaOferta": [...], // Array de cartas disponiveis para compra
  "recursos": [...],       // Array de recursos iniciais
  "pontosParaVencer": 15,  // (opcional) Pontos necessarios para vencer
  "turnosMaximos": 25,     // (opcional) Limite maximo de turnos
  "seed": 12345           // (opcional) Semente para geracao aleatoria
}`}
                  </pre>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Estrutura de uma Carta:
                  </Typography>
                  <pre style={{ margin: 0, overflow: 'auto', fontSize: '0.7rem', color: 'var(--text-primary)' }}>
{`{
  "id": "coletar_madeira",           // Identificador unico
  "titulo": "Coletar Madeira",        // Nome exibido na interface
  "texto": "Descricao opcional",      // Texto descritivo
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
                    1. Clique no botao "Persistencia" na barra de controles.
                  </Typography>
                  <Typography>
                    2. Selecione a opcao "Carregar regras (JSON)" no menu dropdown.
                  </Typography>
                  <Typography>
                    3. Navegue ate o arquivo .json que voce criou e selecione-o.
                  </Typography>
                  <Typography>
                    4. O jogo reiniciara automaticamente com suas regras personalizadas!
                  </Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">
                    Dica: Use "Salvar em Arquivo" no menu de persistencia para exportar seu jogo atual e editar como modelo!
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
              Proximo
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default TutorialModal;