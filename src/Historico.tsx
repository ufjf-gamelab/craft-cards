import { useContext } from "react";
import { GameReducerContext } from "./Game";
import "./Historico.css";

export default function Historico() {
  const game = useContext(GameReducerContext);

  return (
    <div className="historico-container">
      <h3>Histórico de Ações</h3>
      <ul className="historico-list">
        {game?.historico?.map((entry, index) => (
          <li key={index} className="historico-item">
            <div className="acao-info">Ação: {entry.acao}</div>
            {entry.estadoAntigo && (
              <div className="estado-info">
                <span className="estado-label">Estado Antes: </span>
                {JSON.stringify(entry.estadoAntigo)}
              </div>
            )}
            {entry.estadoNovo && (
              <div className="estado-info">
                <span className="estado-label">Estado Depois: </span>
                {JSON.stringify(entry.estadoNovo)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
