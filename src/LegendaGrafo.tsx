import { Box, Typography } from "@mui/material";
import { NODE_COLORS, LINK_COLORS } from "./ResourceGraph";

const LegendaGrafo = () => (
  <Box sx={{
    position: "absolute",
    bottom: "10px",
    left: "10px",
    padding: "12px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 100,
    backgroundColor: "rgba(54, 54, 54, 0.95)",
    color: "white",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    minWidth: "200px"
  }}>
    <Typography 
      variant="subtitle2" 
      sx={{ 
        color: "white", 
        fontWeight: "bold",
        marginBottom: "8px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
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
    color: "white"
  }}>
    <Box sx={{
      width: 16,
      height: 16,
      bgcolor: color,
      marginRight: "10px",
      borderRadius: "50%",
      border: "2px solid #fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
    }} />
    <Typography 
      variant="caption" 
      sx={{ 
        color: "white",
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
    color: "white"
  }}>
    <Box sx={{ 
      width: 20, 
      height: 3, 
      bgcolor: color, 
      marginRight: "10px",
      borderRadius: "1px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
    }} />
    <Typography 
      variant="caption" 
      sx={{ 
        color: "white",
        fontWeight: "500",
        fontSize: "0.8rem"
      }}
    >
      {text}
    </Typography>
  </Box>
);