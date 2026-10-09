import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CartaType, RecursoType } from "./data/cartas";
import "./CardEditor.css";
import { useCardTranslations } from "./i18n/useCardTranslations";

export type DeckMembership = Record<
  string,
  {
    baralho: boolean;
    oferta: boolean;
    baralhoCount: number;
    ofertaCount: number;
  }
>;

export type DeckQuantities = Record<
  string,
  { baralho: number; oferta: number }
>;

type CardEditorProps = {
  onClose: () => void;
  cards: CartaType[];
  availableResources: string[];
  deckMembership?: DeckMembership;
  onSave: (cards: CartaType[], quantities: DeckQuantities) => void;
};

export default function CardEditor({
  onClose,
  cards,
  availableResources,
  deckMembership,
  onSave,
}: CardEditorProps) {
  const { t } = useTranslation();
  const tr = useCardTranslations();

  const [editableCards, setEditableCards] = useState<CartaType[]>(() =>
    JSON.parse(JSON.stringify(cards))
  );

  const buildInitialQuantities = (): DeckQuantities => {
    const q: DeckQuantities = {};
    cards.forEach((c) => {
      const m = deckMembership?.[c.id];
      q[c.id] = {
        baralho: m?.baralhoCount ?? 0,
        oferta: m?.ofertaCount ?? 0,
      };
    });
    return q;
  };

  const [quantities, setQuantities] = useState<DeckQuantities>(
    buildInitialQuantities
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
    return editableCards.filter((c) => {
      const tituloExibido = tr.tituloSmart(c).toLowerCase();
      const tituloBruto = c.titulo.toLowerCase();
      const id = c.id.toLowerCase();
      return (
        tituloExibido.includes(q) || tituloBruto.includes(q) || id.includes(q)
      );
    });
  }, [editableCards, query, tr]);

  const updateCard = (id: string, patch: Partial<CartaType>) => {
    setDirty(true);
    setEditableCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  };

  const updateQuantity = (
    id: string,
    key: "baralho" | "oferta",
    value: number
  ) => {
    setDirty(true);
    const safe = Math.max(0, Math.min(99, Math.floor(value) || 0));
    setQuantities((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: safe },
    }));
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
            { nome: allResourceOptions[0] || "action", quantidade: 1 },
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
    onSave(editableCards, quantities);
    setDirty(false);
  };

  const handleReset = () => {
    setEditableCards(JSON.parse(JSON.stringify(cards)));
    setQuantities(buildInitialQuantities());
    setDirty(false);
  };

  const statusText = dirty
    ? t("card_editor.dirty")
    : t("card_editor.clean");

  return (
    <div className="card-editor">
      <div className="card-editor-header">
        <h2>{t("card_editor.title")}</h2>
        <button
          className="card-editor-close"
          onClick={onClose}
          title={t("card_editor.close")}
        >
          X
        </button>
      </div>

      <div className="card-editor-info">
        <small>
          {t("card_editor.card_count", {
            count: editableCards.length,
            status: statusText,
          })}
        </small>
      </div>

      <input
        type="text"
        className="card-editor-search"
        placeholder={t("card_editor.search_placeholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="card-editor-list">
        {filteredCards.length === 0 && (
          <div className="card-editor-empty-list">
            {t("card_editor.no_results")}
          </div>
        )}

        {filteredCards.map((card) => {
          const expanded = expandedId === card.id;
          const q = quantities[card.id] ?? { baralho: 0, oferta: 0 };
          return (
            <div
              key={card.id}
              className={`card-editor-item ${expanded ? "expanded" : ""}`}
            >
              <div className="card-editor-item-header">
                <span
                  className="card-editor-arrow"
                  onClick={() => setExpandedId(expanded ? null : card.id)}
                >
                  {expanded ? "▼" : "▶"}
                </span>
                <h3
                  onClick={() => setExpandedId(expanded ? null : card.id)}
                  style={{ cursor: "pointer" }}
                >
                  {tr.tituloSmart(card)}
                </h3>

                <span
                  className="card-editor-quantity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label>
                    <span className="q-label">
                      {t("card_editor.deck_count")}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={q.baralho}
                      onChange={(e) =>
                        updateQuantity(
                          card.id,
                          "baralho",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </label>
                  <label>
                    <span className="q-label">
                      {t("card_editor.offer_count")}
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      value={q.oferta}
                      onChange={(e) =>
                        updateQuantity(
                          card.id,
                          "oferta",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </label>
                </span>

                <span className="card-editor-id">#{card.id}</span>
              </div>

              {expanded && (
                <div className="card-editor-item-body">
                  <div className="card-editor-field">
                    <label>{t("card_editor.title_label")}</label>
                    <input
                      type="text"
                      value={card.titulo}
                      placeholder={tr.titulo(card.id, card.titulo)}
                      onChange={(e) =>
                        updateCard(card.id, { titulo: e.target.value })
                      }
                    />
                  </div>

                  <div className="card-editor-field">
                    <label>{t("card_editor.text_label")}</label>
                    <textarea
                      value={card.texto}
                      onChange={(e) =>
                        updateCard(card.id, { texto: e.target.value })
                      }
                    />
                  </div>

                  <ResourceSection
                    label={t("card_editor.cost_label")}
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
                    label={t("card_editor.gain_label")}
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
          {t("card_editor.discard")}
        </button>
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!dirty}
        >
          {t("card_editor.apply_memory")}
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
  const { t } = useTranslation();
  const tr = useCardTranslations();

  return (
    <div className={`card-editor-field card-editor-field--${type}`}>
      <label>{label}</label>
      <div className="card-editor-resource-list">
        {card[type].length === 0 && (
          <small className="card-editor-empty">
            {t("card_editor.no_resource")}
          </small>
        )}
        {card[type].map((r, i) => (
          <div key={i} className="card-editor-resource-row">
            <select
              value={r.nome}
              onChange={(e) => onUpdate(i, { nome: e.target.value })}
            >
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {tr.resource(opt)}
                </option>
              ))}
              {!options.includes(r.nome) && (
                <option value={r.nome}>{tr.resource(r.nome)}</option>
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
              title={t("card_editor.remove")}
            >
              -
            </button>
          </div>
        ))}
        <button className="card-editor-add-resource" onClick={onAdd}>
          {t("card_editor.add_resource")}
        </button>
      </div>
    </div>
  );
}