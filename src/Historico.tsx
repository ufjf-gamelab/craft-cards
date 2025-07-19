import { useContext } from "react";
import { GameReducerContext } from "./Game";
import "./Historico.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const RESOURCE_COLORS: Record<string, string> = {
  ação: "#FF5733",
  "madeira bruta": "#8B4513",
  água: "#1E90FF",
  amora: "#9370DB",
  "pedra bruta": "#808080",
  tabua: "#D2B48C",
  "pedra polida": "#B0B0B0",
  picareta: "#696969",
  machado: "#C0C0C0",
};

export default function Historico() {
  const game = useContext(GameReducerContext);

  // Prepara os dados para o gráfico
  const chartData = game?.historico?.map((entry, index) => {
    const dataPoint: any = {
      name: `${entry.acao} ${index + 1}`,
      acao: entry.acao,
    };

    // Adiciona cada recurso como uma propriedade no ponto de dados
    entry.recursos.forEach((recurso) => {
      dataPoint[recurso.nome] = recurso.quantidade;
    });

    return dataPoint;
  });

  // Obtém todos os tipos de recursos únicos
  const resourceTypes = Array.from(
    new Set(
      game?.historico?.flatMap((entry) =>
        entry.recursos.map((recurso) => recurso.nome)
      ) || []
    )
  );

  return (
    <div className="historico-container">
      <h3>Histórico de Recursos</h3>
      <div className="grafico-container">
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              label={{
                value: "Tipos de Ação",
                position: "insideBottomRight",
                offset: -20,
              }}
            />
            <YAxis
              label={{
                value: "Quantidade",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value, name) => [`${value}`, name]}
              contentStyle={{
                backgroundColor: "#333", // Cor de fundo escura
                borderColor: "#666", // Cor da borda
                color: "#fff", // Cor do texto
                borderRadius: "5px", // Borda arredondada
                padding: "10px", // Espaçamento interno
              }}
            />
            <Legend />
            {resourceTypes.map((tipo) => (
              <Line
                key={tipo}
                type="monotone"
                dataKey={tipo}
                stroke={RESOURCE_COLORS[tipo] || "#8884d8"}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
