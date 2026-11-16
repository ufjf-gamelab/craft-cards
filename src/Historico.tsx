import { useContext } from "react";
import { useTranslation } from "react-i18next";
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
import { useCardTranslations } from "./i18n/useCardTranslations";

export const RESOURCE_COLORS: Record<string, string> = {
  action: "#FF5733",
  score: "#FFD700",
  "raw wood": "#8B4513",
  wood: "#A0522D",
  water: "#1E90FF",
  "raw stone": "#808080",
  stone: "#696969",
  plank: "#D2B48C",
  "polished stone": "#B0B0B0",
  blade: "#C0C0C0",
  gold: "#FFD700",
};

export default function Historico() {
  const { t } = useTranslation();
  const tr = useCardTranslations();
  const game = useContext(GameReducerContext);

  const chartData = game?.historico?.flatMap((turno) =>
    turno.acoes.map((acao, index) => {
      const dataPoint: any = {
        name: `${t("history_log.turn", { number: turno.turno })} - ${acao.tipo} ${index + 1}`,
        acao: acao.tipo,
        turno: turno.turno,
      };

      acao.recursos.forEach((recurso) => {
        // dataKey mantém o nome interno (inglês)
        dataPoint[recurso.nome] = recurso.quantidade;
      });

      return dataPoint;
    })
  );

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
      <h3>{t("history.title")}</h3>
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
                value: t("history.turns_and_actions"),
                position: "insideBottomRight",
                offset: -20,
              }}
            />
            <YAxis
              label={{
                value: t("history.quantity"),
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value}`,
                tr.resource(String(name)),
              ]}
              contentStyle={{
                backgroundColor: "#333",
                borderColor: "#666",
                color: "#fff",
                borderRadius: "5px",
                padding: "10px",
              }}
            />
            <Legend formatter={(value) => tr.resource(String(value))} />
            {resourceTypes.map((tipo) => (
              <Line
                key={tipo}
                type="monotone"
                dataKey={tipo}
                name={tr.resource(tipo)}
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