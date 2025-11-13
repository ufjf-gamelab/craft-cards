import { useState } from "react";

type PersistenceDropdownProps = {
  onSaveGame: () => Promise<void> | void;
  onLoadGame: () => Promise<void> | void;
  onSaveToFile: () => void;
  onLoadFromFile: () => void;
  onResetGame: () => void;
};

function PersistenceDropdown({ 
  onSaveGame, 
  onLoadGame, 
  onSaveToFile, 
  onLoadFromFile, 
  onResetGame 
}: PersistenceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLoadFromFile = () => {
    setIsOpen(false);
    onLoadFromFile();
  };

  return (
    <div className="persistence-dropdown">
      <button 
        className="control-button dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        Persistência ▼
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={onSaveGame}>
            Salvar (Navegador)
          </button>
          <button className="dropdown-item" onClick={onLoadGame}>
            Carregar (Navegador)
          </button>
          <button className="dropdown-item" onClick={onSaveToFile}>
            Salvar (Arquivo)
          </button>
          <button className="dropdown-item" onClick={handleLoadFromFile}>
            Carregar (Arquivo)
          </button>
          <button className="dropdown-item warning" onClick={onResetGame}>
            Novo Jogo
          </button>
        </div>
      )}
    </div>
  );
}

export default PersistenceDropdown;