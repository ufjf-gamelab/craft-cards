import { useState } from "react";

type PersistenceDropdownProps = {
  onSaveGame: () => Promise<void> | void;
  onLoadGame: () => Promise<void> | void;
  onSaveToFile: () => void;
  onLoadFromFile: () => void;
  onResetGame: () => void;
  onLoadCustomModel: () => void;
};

function PersistenceDropdown({ 
  onSaveGame, 
  onLoadGame, 
  onSaveToFile, 
  onLoadFromFile, 
  onResetGame,
  onLoadCustomModel
}: PersistenceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLoadFromFile = () => {
    setIsOpen(false);
    onLoadFromFile();
  };

  const handleLoadCustomModel = () => {
    setIsOpen(false);
    onLoadCustomModel();
  };

  return (
    <div className="persistence-dropdown">
      <button 
        className="control-button dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Persistencia ▼
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-group">
            <div className="dropdown-group-title">SALVAR/CARREGAR JOGO</div>
            <button className="dropdown-item" onClick={onSaveGame}>
              Salvar no navegador
            </button>
            <button className="dropdown-item" onClick={onLoadGame}>
              Carregar do navegador
            </button>
            <button className="dropdown-item" onClick={onSaveToFile}>
              Exportar para arquivo
            </button>
            <button className="dropdown-item" onClick={handleLoadFromFile}>
              Importar de arquivo
            </button>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <div className="dropdown-group">
            <div className="dropdown-group-title">CONFIGURAR JOGO</div>
            <button 
              className="dropdown-item" 
              onClick={handleLoadCustomModel}
              title="Carrega um arquivo JSON com definicoes de cartas, recursos e regras. Inicia um novo jogo."
            >
              Carregar regras (JSON)
            </button>
          </div>
          
          <div className="dropdown-divider"></div>
          
          <button className="dropdown-item warning" onClick={onResetGame}>
            Novo Jogo
          </button>
        </div>
      )}
    </div>
  );
}

export default PersistenceDropdown;