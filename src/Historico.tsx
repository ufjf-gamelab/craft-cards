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

export const RESOURCE_COLORS: Record<string, string> = {
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
  const chartData = game?.historico?.flatMap((turno) => 
    turno.acoes.map((acao, index) => {
      const dataPoint: any = {
        name: `Turno ${turno.turno} - ${acao.tipo} ${index + 1}`,
        acao: acao.tipo,
        turno: turno.turno,
      };

      // Adiciona cada recurso como uma propriedade no ponto de dados
      acao.recursos.forEach((recurso) => {
        dataPoint[recurso.nome] = recurso.quantidade;
      });

      return dataPoint;
    })
  );

  // Obtém todos os tipos de recursos únicos
  const resourceTypes = Array.from(
    new Set(
      game?.historico?.flatMap((turno) =>
        turno.acoes.flatMap((acao) =>
          acao.recursos.map((recurso) => recurso.nome)
        )
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
                value: "Turnos e Ações",
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
                backgroundColor: "#333",
                borderColor: "#666",
                color: "#fff",
                borderRadius: "5px",
                padding: "10px",
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