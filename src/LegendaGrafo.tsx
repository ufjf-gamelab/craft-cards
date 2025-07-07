import { Box, Typography } from "@mui/material";
import { NODE_COLORS, LINK_COLORS } from "./ResourceGraph";

const LegendaGrafo = () => (
  <Box sx={{
    position: "absolute",
    bottom: "10px",
    left: "10px",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    zIndex: 100,
  }}>
    <Typography variant="subtitle2">Legenda:</Typography>
    <LegendItem color={NODE_COLORS.resource} text="Recursos" />
    <LegendItem color={NODE_COLORS.card} text="Cartas" />
    <LegendLine color={LINK_COLORS.cost} text="Gasto (recurso → carta)" />
    <LegendLine color={LINK_COLORS.gain} text="Coleta (carta → recurso)" />
  </Box>
);

export default LegendaGrafo;

interface LegendItemProps {
  color: string;
  text: string;
}

const LegendItem = ({ color, text }: LegendItemProps) => (
  <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
    <Box sx={{
      width: 15,
      height: 15,
      bgcolor: color,
      mr: 1,
      borderRadius: "50%",
    }} />
    <Typography variant="caption">{text}</Typography>
  </Box>
);

interface LegendLineProps {
  color: string;
  text: string;
}

const LegendLine = ({ color, text }: LegendLineProps) => (
  <Box sx={{ display: "flex", alignItems: "center", my: 1 }}>
    <Box sx={{ width: 15, height: 2, bgcolor: color, mr: 1 }} />
    <Typography variant="caption">{text}</Typography>
  </Box>
);