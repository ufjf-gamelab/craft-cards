import { RecursoType } from "./App";
import "./ListaDeRecursos.css";

type RecursosProps = {recursos:Array<RecursoType>}

export default function ListaDeRecursos({recursos}:RecursosProps) {
  return (
    <dl className="recursos">
      {recursos.map((r) => (
        <div key= {r.nome}>
          <dt>{r.nome}</dt>
          <dd>{r.quantidade}</dd>
        </div>
      ))}
    </dl>
  );
}
