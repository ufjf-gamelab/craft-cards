import { useState } from "react";
import { useTranslation } from "react-i18next";

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
  onLoadCustomModel,
}: PersistenceDropdownProps) {
  const { t } = useTranslation();
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
        {t("persistence.title")} ▼
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-group">
            <div className="dropdown-group-title">
              {t("persistence.save_choose")}
            </div>
            <button className="dropdown-item" onClick={onSaveGame}>
              {t("persistence.save_browser")}
            </button>
            <button className="dropdown-item" onClick={onLoadGame}>
              {t("persistence.load_browser")}
            </button>
            <button className="dropdown-item" onClick={onSaveToFile}>
              {t("persistence.export_file")}
            </button>
            <button className="dropdown-item" onClick={handleLoadFromFile}>
              {t("persistence.import_file")}
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-group">
            <div className="dropdown-group-title">
              {t("persistence.config_game")}
            </div>
            <button
              className="dropdown-item"
              onClick={handleLoadCustomModel}
              title={t("persistence.load_rules_tooltip")}
            >
              {t("persistence.load_rules")}
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <button className="dropdown-item warning" onClick={onResetGame}>
            {t("persistence.new_game")}
          </button>
        </div>
      )}
    </div>
  );
}

export default PersistenceDropdown;