import { useContext } from "react";
import { GameReducerContext } from "./Game";
import "./Historico.css";
import { RESOURCE_COLORS } from "./Historico";

export default function HistoricoLog() {
  const game = useContext(GameReducerContext);

  if (!game?.historico || game.historico.length === 0) {
    return <div className="historico-container">Nenhum histórico disponível</div>;
  }

  return (
    <div className="historico-container">
      <h3>Detalhes por Turno</h3>
      
      <div className="turn-details">
        <div className="turn-list">
          {game.historico.map((entry, turnIndex) => (
            <div key={turnIndex} className="turn-item">
              <div className="turn-header">
                <span className="turn-number">Turno {entry.turno}</span>
              </div>
              
              <div className="actions-list">
                {entry.acoes.map((action, actionIndex) => (
                  <div key={actionIndex} className="action-item">
                    <div className="action-header">
                      <span className="action-type">Ação: {action.tipo}</span>
                    </div>
                    
                    <div className="resource-section">
                      <h4>Recursos após ação:</h4>
                      <div className="resource-changes">
                        {action.recursos.map((recurso, i) => (
                          <div key={i} className="resource-item">
                            <span 
                              className="resource-name" 
                              style={{ color: RESOURCE_COLORS[recurso.nome] || "#000" }}
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
          ))}
        </div>
      </div>
    </div>
  );
}