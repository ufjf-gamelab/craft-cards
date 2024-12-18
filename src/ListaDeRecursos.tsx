import "./ListaDeRecursos.css";

export type RecursoType = {
  nome: string;
  quantidade: number;
};

const RECURSOS: Array<RecursoType> = [
  { nome: "Ação", quantidade: 1 },
  { nome: "Madeira", quantidade: 0 },
];

export default function ListaDeRecursos() {
  return (
    <dl className="recursos">
      {RECURSOS.map((r) => (
        <div>
          <dt>{r.nome}</dt>
          <dd>{r.quantidade}</dd>
        </div>
      ))}
    </dl>
  );
}
