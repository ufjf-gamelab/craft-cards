import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { GameReducerContext } from "./Game";
import "./Historico.css";
import { RESOURCE_COLORS } from "./Historico";

export default function HistoricoLog() {
  const { t } = useTranslation();
  const game = useContext(GameReducerContext);

  if (!game?.historico || game.historico.length === 0) {
    return (
      <div className="historico-log-container">{t("history_log.empty")}</div>
    );
  }

  const historicoInvertido = [...game.historico].reverse();

  return (
    <div className="historico-log-container">
      <h3>{t("history_log.title")}</h3>

      <div className="turn-details">
        <div className="turn-list">
          {historicoInvertido.map((entry, index) => {
            const originalIndex = game.historico!.length - 1 - index;
            return (
              <div key={originalIndex} className="turn-item">
                <div className="turn-header">
                  <span className="turn-number">
                    {t("history_log.turn", { number: entry.turno })}
                  </span>
                </div>

                <div className="actions-list">
                  {entry.acoes.map((action, actionIndex) => (
                    <div key={actionIndex} className="action-item">
                      <div className="action-header">
                        <span className="action-type">
                          {t("history_log.action_type", {
                            type: t(`history_log.action_names.${action.tipo}`, {
                              defaultValue: action.tipo,
                            }),
                          })}
                        </span>
                      </div>

                      <div className="resource-section">
                        <h4>{t("history_log.resources_after")}</h4>
                        <div className="resource-changes">
                          {action.recursos.map((recurso, i) => (
                            <div key={i} className="resource-item">
                              <span
                                className="resource-name"
                                style={{
                                  color:
                                    RESOURCE_COLORS[recurso.nome] || "#1a1a2e",
                                  fontWeight: "bold",
                                }}
                              >
                                {recurso.nome}: {recurso.quantidade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}