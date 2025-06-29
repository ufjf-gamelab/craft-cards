import { CartaType } from "./data/cartas.ts";
import "./Carta.css";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
type CartaProps = {
  carta: CartaType;
  onCartaClick: () => void;
  facedown?: boolean;
};
export default function Carta({
  carta,
  onCartaClick,
  facedown = false,
}: CartaProps) {
  const back = <h1>Craft Cards</h1>;
  const front = (
    <>
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
        {carta.custo.map((custo) => (
          <p key={custo.nome}>
            {custo.quantidade > 0 ? "Pague" : "Ganhe"} {custo.quantidade}{" "}
            {custo.nome}
          </p>
        ))}
      </div>
    </>
  );
  return (
    <AnimatePresence>
      <motion.div
        layoutId={carta.id}
        initial={{ scale: 1.0 }}
        animate={{ scale: 1.0 }}
        exit={{ scale: 1.0 }}
        transition={{
          duration: 1.0,
          scale: { type: "inertia", visualDuration: 5},
        }}
        className={`carta ${facedown && "facedown"}`}
        onClick={() => {
          onCartaClick();
        }}
      >
        {facedown ? back : front}
      </motion.div>
    </AnimatePresence>
  );
}
