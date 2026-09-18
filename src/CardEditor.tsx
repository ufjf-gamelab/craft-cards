import { useMemo, useState } from "react";
import { CartaType, RecursoType } from "./data/cartas";
import "./CardEditor.css";

export type DeckMembership = Record<
  string,
  { baralho: boolean; oferta: boolean }
>;

type CardEditorProps = {
  onClose: () => void;
  cards: CartaType[];
  availableResources: string[];
  deckMembership?: DeckMembership;
  onSave: (cards: CartaType[]) => void;
};

export default function CardEditor({
  onClose,
  cards,
  availableResources,
  deckMembership,
  onSave,
}: CardEditorProps) {
  const [editableCards, setEditableCards] = useState<CartaType[]>(() =>
    JSON.parse(JSON.stringify(cards))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState("");

  const allResourceOptions = useMemo(() => {
    const set = new Set(availableResources);
    editableCards.forEach((c) => {
      c.custo.forEach((r) => set.add(r.nome));
      c.ganho.forEach((r) => set.add(r.nome));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [availableResources, editableCards]);

  const filteredCards = useMemo(() => {
    if (!query.trim()) return editableCards;
    const q = query.trim().toLowerCase();
    return editableCards.filter(
      (c) =>
        c.titulo.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [editableCards, query]);

  const updateCard = (id: string, patch: Partial<CartaType>) => {
    setDirty(true);
    setEditableCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const updateResource = (
    cardId: string,
    type: "custo" | "ganho",
    index: number,
    patch: Partial<RecursoType>
  ) => {
    setDirty(true);
    setEditableCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        const list = [...c[type]];
        list[index] = { ...list[index], ...patch };
        return { ...c, [type]: list };
      })
    );
  };

  const addResource = (cardId: string, type: "custo" | "ganho") => {
    setDirty(true);
    setEditableCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        return {
          ...c,
          [type]: [
            ...c[type],
            { nome: allResourceOptions[0] || "acao", quantidade: 1 },
          ],
        };
      })
    );
  };

  const removeResource = (
    cardId: string,
    type: "custo" | "ganho",
    index: number
  ) => {
    setDirty(true);
    setEditableCards((prev) =>
      prev.map((c) => {
        if (c.id !== cardId) return c;
        return { ...c, [type]: c[type].filter((_, i) => i !== index) };
      })
    );
  };

  const handleSave = () => {
    onSave(editableCards);
    setDirty(false);
  };

  const handleReset = () => {
    setEditableCards(JSON.parse(JSON.stringify(cards)));
    setDirty(false);
  };

  return (
    <div className="card-editor">
      <div className="card-editor-header">
        <h2>Editar Cartas</h2>
        <button
          className="card-editor-close"
          onClick={onClose}
          title="Fechar editor"
        >
          X
        </button>
      </div>

      <div className="card-editor-info">
        <small>
          {editableCards.length} carta(s) -{" "}
          {dirty ? "alterações pendentes" : "sem alterações"}
        </small>
      </div>

      <input
        type="text"
        className="card-editor-search"
        placeholder="Buscar por título ou id..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="card-editor-list">
        {filteredCards.length === 0 && (
          <div className="card-editor-empty-list">
            Nenhuma carta corresponde à busca.
          </div>
        )}

        {filteredCards.map((card) => {
          const expanded = expandedId === card.id;
          const deck = deckMembership?.[card.id];
          return (
            <div
              key={card.id}
              className={`card-editor-item ${expanded ? "expanded" : ""}`}
            >
              <div
                className="card-editor-item-header"
                onClick={() => setExpandedId(expanded ? null : card.id)}
              >
                <span className="card-editor-arrow">
                  {expanded ? "▼" : "▶"}
                </span>
                <h3>{card.titulo}</h3>
                <span className="card-editor-badges">
                  {deck?.baralho && (
                    <span className="badge badge-baralho" title="Baralho">
                      B
                    </span>
                  )}
                  {deck?.oferta && (
                    <span
                      className="badge badge-oferta"
                      title="Baralho da Oferta"
                    >
                      O
                    </span>
                  )}
                </span>
                <span className="card-editor-id">#{card.id}</span>
              </div>

              {expanded && (
                <div className="card-editor-item-body">
                  <div className="card-editor-field">
                    <label>Título</label>
                    <input
                      type="text"
                      value={card.titulo}
                      onChange={(e) =>
                        updateCard(card.id, { titulo: e.target.value })
                      }
                    />
                  </div>

                  <div className="card-editor-field">
                    <label>Texto / Descrição</label>
                    <textarea
                      value={card.texto}
                      onChange={(e) =>
                        updateCard(card.id, { texto: e.target.value })
                      }
                    />
                  </div>

                  <ResourceSection
                    label="Custo (consome)"
                    type="custo"
                    card={card}
                    options={allResourceOptions}
                    onUpdate={(i, patch) =>
                      updateResource(card.id, "custo", i, patch)
                    }
                    onAdd={() => addResource(card.id, "custo")}
                    onRemove={(i) => removeResource(card.id, "custo", i)}
                  />

                  <ResourceSection
                    label="Ganho (produz)"
                    type="ganho"
                    card={card}
                    options={allResourceOptions}
                    onUpdate={(i, patch) =>
                      updateResource(card.id, "ganho", i, patch)
                    }
                    onAdd={() => addResource(card.id, "ganho")}
                    onRemove={(i) => removeResource(card.id, "ganho", i)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card-editor-actions">
        <button
          className="btn-secondary"
          onClick={handleReset}
          disabled={!dirty}
        >
          Descartar
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!dirty}
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}

type ResourceSectionProps = {
  label: string;
  type: "custo" | "ganho";
  card: CartaType;
  options: string[];
  onUpdate: (i: number, patch: Partial<RecursoType>) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
};

function ResourceSection({
  label,
  type,
  card,
  options,
  onUpdate,
  onAdd,
  onRemove,
}: ResourceSectionProps) {
  return (
    <div className={`card-editor-field card-editor-field--${type}`}>
      <label>{label}</label>
      <div className="card-editor-resource-list">
        {card[type].length === 0 && (
          <small className="card-editor-empty">Nenhum recurso</small>
        )}
        {card[type].map((r, i) => (
          <div key={i} className="card-editor-resource-row">
            <select
              value={r.nome}
              onChange={(e) => onUpdate(i, { nome: e.target.value })}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              {!options.includes(r.nome) && (
                <option value={r.nome}>{r.nome}</option>
              )}
            </select>
            <input
              type="number"
              min={0}
              value={r.quantidade}
              onChange={(e) =>
                onUpdate(i, { quantidade: parseInt(e.target.value) || 0 })
              }
            />
            <button
              className="card-editor-remove"
              onClick={() => onRemove(i)}
              title="Remover"
            >
              -
            </button>
          </div>
        ))}
        <button className="card-editor-add-resource" onClick={onAdd}>
          + Adicionar recurso
        </button>
      </div>
    </div>
  );
}