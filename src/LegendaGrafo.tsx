import { Box, Typography } from "@mui/material";
import { NODE_COLORS, LINK_COLORS } from "./ResourceGraph";

const LegendaGrafo = () => (
  <Box sx={{
    position: "absolute",
    bottom: "10px",
    left: "10px",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "var(--shadow-color) 0 4px 12px",
    zIndex: 100,
    backgroundColor: "var(--bg-elevated)",
    color: "var(--text-primary)",
    backdropFilter: "blur(8px)",
    border: "1px solid var(--border-color)",
    minWidth: "200px"
  }}>
    <Typography 
      variant="subtitle2" 
      sx={{ 
        color: "var(--text-primary)", 
        fontWeight: "bold",
        marginBottom: "8px",
        borderBottom: "1px solid var(--border-color)",
        paddingBottom: "4px"
      }}
    >
      Legenda do Grafo
    </Typography>
    
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
  <Box sx={{ 
    display: "flex", 
    alignItems: "center", 
    marginY: "6px",
    color: "var(--text-primary)"
  }}>
    <Box sx={{
      width: 16,
      height: 16,
      bgcolor: color,
      marginRight: "10px",
      borderRadius: "50%",
      border: "2px solid var(--text-primary)",
      boxShadow: "0 2px 4px var(--shadow-color)"
    }} />
    <Typography 
      variant="caption" 
      sx={{ 
        color: "var(--text-primary)",
        fontWeight: "500",
        fontSize: "0.8rem"
      }}
    >
      {text}
    </Typography>
  </Box>
);

interface LegendLineProps {
  color: string;
  text: string;
}

const LegendLine = ({ color, text }: LegendLineProps) => (
  <Box sx={{ 
    display: "flex", 
    alignItems: "center", 
    marginY: "6px",
    color: "var(--text-primary)"
  }}>
    <Box sx={{ 
      width: 20, 
      height: 3, 
      bgcolor: color, 
      marginRight: "10px",
      borderRadius: "1px",
      boxShadow: "0 1px 2px var(--shadow-color)"
    }} />
    <Typography 
      variant="caption" 
      sx={{ 
        color: "var(--text-primary)",
        fontWeight: "500",
        fontSize: "0.8rem"
      }}
    >
      {text}
    </Typography>
  </Box>
);