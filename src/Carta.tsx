import { CartaType } from "./data/cartas.ts";
import "./Carta.css";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
type CartaProps = { carta: CartaType; onCartaClick: () => void };
export default function Carta({ carta, onCartaClick }: CartaProps) {
  return (
    <AnimatePresence>
      <motion.div
        layoutId={carta.id}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1.0 }}
        exit={{ scale: 1.2 }}
        transition={{
          duration: 1.0,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
        }}
        className="carta"
        onClick={() => {
          onCartaClick();
        }}
      >
        <h1>{carta.titulo}</h1>
        <section>
          <p>{carta.texto}</p>
          {carta.ganho.map((ganho) => (
            <p key={ganho.nome}>
              {ganho.quantidade > 0 ? "Ganhe" : "Pague"} {ganho.quantidade}{" "}
              {ganho.nome}
            </p>
          ))}
        </section>
        <div className="custo">
          {carta.custo.map((ganho) => (
            <p key={ganho.nome}>
              {ganho.quantidade > 0 ? "Ganhe" : "Pague"} {ganho.quantidade}{" "}
              {ganho.nome}
            </p>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
