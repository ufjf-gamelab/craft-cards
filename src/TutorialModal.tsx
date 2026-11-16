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
import { useTranslation, Trans } from 'react-i18next';

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
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
    t('tutorial.step_labels.overview'),
    t('tutorial.step_labels.gameplay'),
    t('tutorial.step_labels.victory'),
    t('tutorial.step_labels.graph'),
    t('tutorial.step_labels.petri'),
    t('tutorial.step_labels.reachability'),
    t('tutorial.step_labels.custom_models'),
  ];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('tutorial.title')}</Typography>
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
            {activeStep === 0 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {t('tutorial.overview.title')}
                </Typography>
                <Typography paragraph>
                  <Trans
                    i18nKey="tutorial.overview.intro_1"
                    components={{ strong: <strong /> }}
                  />
                </Typography>
                <Typography paragraph>
                  {t('tutorial.overview.intro_2')}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', my: 2 }}>
                  <Chip label={t('tutorial.overview.chip_simulation')} color="primary" variant="outlined" />
                  <Chip label={t('tutorial.overview.chip_graphs')} color="success" variant="outlined" />
                  <Chip label={t('tutorial.overview.chip_petri')} color="info" variant="outlined" />
                  <Chip label={t('tutorial.overview.chip_reachability')} color="warning" variant="outlined" />
                  <Chip label={t('tutorial.overview.chip_persistence')} color="error" variant="outlined" />
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t('tutorial.overview.interface_title')}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    <Trans
                      i18nKey="tutorial.overview.interface_top"
                      components={{ strong: <strong /> }}
                    />
                  </Typography>
                  <Typography>
                    <Trans
                      i18nKey="tutorial.overview.interface_controls"
                      components={{ strong: <strong /> }}
                    />
                  </Typography>
                  <Typography>
                    <Trans
                      i18nKey="tutorial.overview.interface_game_area"
                      components={{ strong: <strong /> }}
                    />
                  </Typography>
                  <Typography>
                    <Trans
                      i18nKey="tutorial.overview.interface_analysis"
                      components={{ strong: <strong /> }}
                    />
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    <Trans
                      i18nKey="tutorial.overview.tip"
                      components={{ strong: <strong /> }}
                    />
                  </Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {t('tutorial.gameplay.title')}
                </Typography>
                <Typography paragraph>
                  <Trans
                    i18nKey="tutorial.gameplay.intro"
                    components={{ code: <code /> }}
                  />
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t('tutorial.gameplay.resources_title')}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    <Trans i18nKey="tutorial.gameplay.resource_acao" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.gameplay.resource_madeira_pedra" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.gameplay.resource_tabua" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.gameplay.resource_pontuacao" components={{ strong: <strong /> }} />
                  </Typography>
                </Paper>

                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {t('tutorial.gameplay.turns_title')}
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography>
                    <Trans i18nKey="tutorial.gameplay.turns_p1" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.gameplay.turns_p2" components={{ strong: <strong /> }} />
                  </Typography>
                </Paper>

                <Alert severity="warning">
                  <Typography variant="body2">
                    <Trans i18nKey="tutorial.gameplay.note" components={{ strong: <strong /> }} />
                  </Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {t('tutorial.victory.title')}
                </Typography>

                <Typography paragraph>{t('tutorial.victory.intro')}</Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.victory.heading_points')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.victory.points_p" components={{ code: <code /> }} />
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.victory.heading_turns')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.victory.turns_p" components={{ code: <code /> }} />
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.victory.heading_deadlock')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.victory.deadlock_p" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans
                      i18nKey="tutorial.victory.deadlock_temp"
                      components={{
                        strong: <strong />,
                        yellow: <span style={{ color: '#FFC107' }} />,
                      }}
                    />
                  </Typography>
                  <Typography>
                    <Trans
                      i18nKey="tutorial.victory.deadlock_perm"
                      components={{
                        strong: <strong />,
                        red: <span style={{ color: '#f44336' }} />,
                      }}
                    />
                  </Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    <Trans i18nKey="tutorial.victory.note" components={{ code: <code /> }} />
                  </Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {t('tutorial.graph.title')}
                </Typography>

                <Typography paragraph>{t('tutorial.graph.intro')}</Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.graph.elements_title')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.elem_green_nodes" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.elem_blue_nodes" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.elem_green_edges" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.elem_red_edges" components={{ strong: <strong /> }} />
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.graph.metrics_title')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.metric_density" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.metric_centrality" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.metric_diameter" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.metric_components" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.graph.metric_production" components={{ strong: <strong /> }} />
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.graph.balance_title')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.graph.balance_gargalos" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.graph.balance_recursos" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.graph.balance_caminhos" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.graph.balance_padroes" components={{ strong: <strong /> }} />
                  </Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">{t('tutorial.graph.success')}</Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 4 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {t('tutorial.petri.title')}
                </Typography>

                <Typography paragraph>{t('tutorial.petri.intro')}</Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.petri.elements_title')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.elem_places" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans
                      i18nKey="tutorial.petri.elem_transitions"
                      components={{
                        strong: <strong />,
                        yellow: <span style={{ color: '#FFC107' }} />,
                      }}
                    />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.elem_input_arcs" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.elem_output_arcs" components={{ strong: <strong /> }} />
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.petri.features_title')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.feat_free_mode" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.feat_full_analysis" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.feat_reset" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.feat_slider" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.feat_generate" components={{ strong: <strong /> }} />
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.petri.how_to_use_title')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.petri.how_to_p1" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>{t('tutorial.petri.how_to_p2')}</Typography>
                </Paper>

                <Alert severity="info">
                  <Typography variant="body2">
                    <Trans
                      i18nKey="tutorial.petri.info"
                      components={{ yellow: <span style={{ color: '#FFC107' }} /> }}
                    />
                  </Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 5 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {t('tutorial.reachability.title')}
                </Typography>

                <Typography paragraph>
                  <Trans i18nKey="tutorial.reachability.intro" components={{ strong: <strong /> }} />
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.reachability.features_title')}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.reachability.feat_auto" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.reachability.feat_omega" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.reachability.feat_control" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.reachability.feat_visualization" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <Trans i18nKey="tutorial.reachability.feat_table" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    {t('tutorial.reachability.bullet_marking')}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    {t('tutorial.reachability.bullet_transition')}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    {t('tutorial.reachability.bullet_type')}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                    {t('tutorial.reachability.bullet_button')}
                  </Typography>
                </Paper>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.reachability.how_to_use_title')}
                  </Typography>
                  <Typography>{t('tutorial.reachability.how_to_1')}</Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.reachability.how_to_2" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>{t('tutorial.reachability.how_to_3')}</Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">{t('tutorial.reachability.success')}</Typography>
                </Alert>
              </Box>
            )}

            {activeStep === 6 && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {t('tutorial.custom_models.title')}
                </Typography>

                <Typography paragraph>{t('tutorial.custom_models.intro')}</Typography>

                <Paper sx={{ p: 2, bgcolor: 'var(--bg-primary)', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    {t('tutorial.custom_models.basic_structure_title')}
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
                    {t('tutorial.custom_models.card_structure_title')}
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
                    {t('tutorial.custom_models.resource_structure_title')}
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
                    {t('tutorial.custom_models.how_to_load_title')}
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.custom_models.load_p1" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.custom_models.load_p2" components={{ strong: <strong /> }} />
                  </Typography>
                  <Typography>
                    <Trans i18nKey="tutorial.custom_models.load_p3" components={{ code: <code /> }} />
                  </Typography>
                  <Typography>{t('tutorial.custom_models.load_p4')}</Typography>
                </Paper>

                <Alert severity="success">
                  <Typography variant="body2">
                    <Trans i18nKey="tutorial.custom_models.success" components={{ strong: <strong /> }} />
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('tutorial.close')}</Button>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            {t('tutorial.back')}
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" onClick={onClose}>
              {t('tutorial.finish')}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              {t('tutorial.next')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default TutorialModal;