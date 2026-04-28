import { RecursoType } from "./data/cartas.ts";
import "./ListaDeRecursos.css";
import * as motion from "motion/react-client"

type RecursosProps = { recursos: Array<RecursoType> };

export default function ListaDeRecursos({ recursos }: RecursosProps) {
  return (
    <dl className="recursos">
      {recursos.map((r) => (
        <motion.div 
        initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.4,
                scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
            }}
        key={r.nome}>
          <dt>{r.nome}</dt>
          <dd>{r.quantidade}</dd>
        </motion.div>
      ))}
    </dl>
  );
}
